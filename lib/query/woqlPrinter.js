/**
 * Class responsible for converting a JSON WOQL into a WOQL.js / WOQL.py string
 */
function WOQLPrinter(vocab, language) {
    this.vocab = vocab
    this.language = language
    this.indent_spaces = 4
    this.boxed_predicates = [
        'woql:datatype',
        'woql:variable',
        'woql:array_element',
        'woql:variable_list_element',
        'woql:node',
        'woql:arithmetic_value',
        'woql:variable_name',
    ]
    this.subject_cleaned_predicates = ['woql:subject', 'woql:element']
    this.schema_cleaned_predicates = [
        'woql:predicate',
        'woql:parent',
        'woql:child',
        'woql:uri',
        'woql:of_type',
    ]
    this.list_operators = ['ValueList', 'Array', 'NamedAsVar', 'IndexedAsVar', 'AsVar']
    this.query_list_operators = ['And', 'Or']
    this.operator_maps = {
        IDGenerator: 'idgen',
        IsA: 'isa',
        PostResource: 'post',
        FileResource: 'file',
        RemoteResource: 'remote',
        AsVars: 'as',
        NamedAsVars: 'as',
        IndexedAsVars: 'as',
    }
    this.shortcuts = {
        optional: 'opt',
        substring: 'substr',
        regexp: 're',
        subsumption: 'sub',
        equals: 'eq',
        concatenate: 'concat',
    }
    this.pythonic = {
        and: 'woql_and',
        or: 'woql_or',
        as: 'woql_as',
        with: 'woql_with',
        from: 'woql_from',
        not: 'woql_not',
    }
    this.show_context = false
}

WOQLPrinter.prototype.printJSON = function(json, level, fluent, newline) {
    level = level || 0
    fluent = fluent || false
    var str = ''
    if (!json['@type']) {
        console.log('Bad structure passed to print json, no type: ', json)
        return ''
    }
    if (json['@type'] == 'woql:Variable' || json['@type'] == 'woql:VariableListElement' || json['woql:variable_name']) {
        return this.pvar(json)
    } else if (typeof json['@value'] != 'undefined') {
        return this.plit(json)
    }
    var operator = json['@type'].split(':')[1]
    if (operator) {
        var ujson = this.unboxJSON(operator, json)
        if (ujson) {
            let meat = this.printArgument(
                operator,
                this.getBoxedPredicate(operator, json),
                ujson,
                level,
                fluent,
            )
            if (this.isListOperator(operator)) return '[' + meat + ']'
            return meat
        }
        if (this.isListOperator(operator)) {
            str += '['
        } else {
            let call = this.getFunctionForOperator(operator)
            let indent = newline ? level * this.indent_spaces : 0
            str += this.getWOQLPrelude(call, fluent, indent) + '('
        }
        //below needs to be changed to have a specific ordering
        let args = this.getArgumentOrder(operator, json)
        for (var i = 0; i < args.length; i++) {
            let nfluent =
                (args[i] == 'woql:query' && operator != 'When') || args[i] == 'woql:consequent'
                    ? true
                    : false
            str += this.printArgument(operator, args[i], json[args[i]], level, nfluent)
            let divlimit = args.indexOf('woql:query') == -1 ? args.length - 1 : args.length - 2
            if (i < divlimit) str += ', '
        }
        if (this.isListOperator(operator)) str += ']'
        else {
            if (this.argumentTakesNewline(operator))
                str += '\n' + nspaces(level * this.indent_spaces)
            if (!fluent) str += ')'
        }
    } else {
        console.log('wrong structure passed to print json ', json)
    }
    return str
}

WOQLPrinter.prototype.getArgumentOrder = function(operator, json) {
    let args = Object.keys(json)
    args.splice(args.indexOf('@type'), 1)
    return args
}

WOQLPrinter.prototype.argumentTakesNewline = function(operator) {
    return this.isQueryListOperator(operator)
}

WOQLPrinter.prototype.argumentRequiresArray = function(predicate, entries) {
    if ((predicate == 'woql:group_by') && entries.length > 1)
        return true
    return false
}

WOQLPrinter.prototype.printArgument = function(operator, predicate, arg, level, fluent) {
    let str = ''
    if (fluent) str += ')'
    let newline = this.argumentTakesNewline(operator)
    if (newline) str += '\n' + nspaces((level + 1) * this.indent_spaces)
    if (arg['@type'] == 'woql:True') return 'true'
    if (predicate == 'woql:document') return JSON.stringify(arg)
    if (predicate == 'woql:path_pattern') return '"' + this.decompilePathPattern(arg) + '"'
    if (predicate == 'woql:concat_list') return this.decompileConcatList(arg)
    if (predicate == 'woql:as_vars') return this.decompileAsVars(arg, level + 1)
    if (predicate == 'woql:pattern') return this.decompileRegexPattern(arg, level + 1)
    if (Array.isArray(arg)) {
        let arr_entries = []
        for (var j = 0; j < arg.length; j++) {
            let nlevel = newline ? level + 1 : level
            arr_entries.push(this.printJSON(arg[j], nlevel, fluent, newline))
        }
        let jstr = newline ? ',\n' + nspaces(++level * this.indent_spaces) : ','
        if (this.argumentRequiresArray(predicate, arr_entries)) {
            str += '[' + arr_entries.join(jstr) + ']'
        } else str += arr_entries.join(jstr)
    } else if (typeof arg == 'object') {
        let reet = this.printJSON(arg, level, fluent)
        //if(newline) str += "\n" + nspaces(level*this.indent_spaces)

        str += reet
    } else if (typeof arg == 'string') {
        str += this.uncleanArgument(arg, operator, predicate)
    }
    return str
}

WOQLPrinter.prototype.decompileRegexPattern = function(json) {
    let str = json
    if(typeof json == "object" && json["woql:datatype"] && json["woql:datatype"]["@value"]){
        str = json["woql:datatype"]["@value"]
    }
    return '"' + str.replace("\\", "\\\\") + '"'
}


WOQLPrinter.prototype.plit = function(json) {
    if (json['@type'] == 'xsd:string' || json['@type'] == 'xsd:anyURI' || json['@language']) {
        let cnt = json['@value']
        if (/\r|\n/.exec(cnt)) return '`' + cnt + '`'
        return '"' + cnt + '"'
    }
    if (
        json['@type'] == 'xsd:decimal' ||
        json['@type'] == 'xsd:boolean' ||
        json['@type'] == 'xsd:integer' ||
        json['@type'] == 'xsd:nonNegativeInteger'
    )
        return json['@value']
    return JSON.stringify(json)
}

WOQLPrinter.prototype.pvar = function(json) {
    if (json['woql:variable_name'] && typeof json['woql:variable_name']['@value'] != 'undefined') {
        let varname = json['woql:variable_name']['@value']
        if (varname.indexOf(':') == -1) {
            varname = 'v:' + varname
        }
        return '"' + varname + '"'
    }
    return false
}

/**
 * Gets the starting characters for a WOQL query - varies depending on how the query is invoked and how indented it is
 */
WOQLPrinter.prototype.getWOQLPrelude = function(operator, fluent, inline) {
    if (operator === 'true' || operator === 'false') {
        if (this.language == 'python') {
            return operator.charAt(0).toUpperCase() + operator.slice(1)
        }
        return operator
    }
    let prelude = 'WOQL.'
    if (this.language == 'python') {
        this.pythonic[operator] && (operator = this.pythonic[operator])
        prelude = 'WOQLQuery().'
    }
    if (fluent) {
        return '.' + operator
    }
    return (inline ? '\n' + nspaces(inline) : '') + prelude + operator
}

WOQLPrinter.prototype.uncleanArgument = function(arg, operator, predicate) {
    if (arg.indexOf(':') != -1) {
        //is it a short cut?
        for (var s in this.vocab) {
            if (this.vocab[s] == arg) return '"' + s + '"'
        }
        //is there a default reverse mapping
        if (this.subject_cleaned_predicates.indexOf(predicate) != -1) {
            if (arg.substring(0, 4) == 'doc:') arg = arg.substring(4)
        }
        if (this.schema_cleaned_predicates.indexOf(predicate) != -1) {
            if (arg.substring(0, 4) == 'scm:') arg = arg.substring(4)
        }
    }
    return '"' + arg + '"'
}

WOQLPrinter.prototype.isListOperator = function(operator) {
    return this.list_operators.indexOf(operator) != -1
}

WOQLPrinter.prototype.isQueryListOperator = function(operator) {
    return this.query_list_operators.indexOf(operator) != -1
}

WOQLPrinter.prototype.getFunctionForOperator = function(operator) {
    if (this.operator_maps[operator]) return this.operator_maps[operator]
    else {
        let f = camelToSnake(operator)
        if (this.shortcuts[f]) return this.shortcuts[f]
        return f
    }
}

WOQLPrinter.prototype.getBoxedPredicate = function(operator, json) {
    for (var i = 0; i < this.boxed_predicates.length; i++) {
        if (json[this.boxed_predicates[i]]) {
            return this.boxed_predicates[i]
        }
    }
    if (operator == 'QueryListElement') {
        return 'woql:query'
    }
    return false
}

WOQLPrinter.prototype.unboxJSON = function(operator, json) {
    let bp = this.getBoxedPredicate(operator, json)
    if (bp) {
        return json[bp]
    }
    return false
}

WOQLPrinter.prototype.decompileAsVars = function(asvs, level) {
    let str = ''
    for (var i = 0; i < asvs.length; i++) {
        let wasv = asvs[i]
        str += '\n' + nspaces(level * this.indent_spaces) + (i == 0 ? 'WOQL' : '')
        if (wasv['@type'] == 'woql:NamedAsVar') {
            str +=
                '.as("' +
                wasv['woql:identifier']['@value'] +
                '", "' +
                wasv['woql:variable_name']['@value'] +
                '")'
        } else if (wasv['@type'] == 'woql:IndexedAsVar') {
            str +=
                '.as("' +
                wasv['woql:index']['@value'] +
                '", "' +
                wasv['woql:variable_name']['@value'] +
                '")'
        }
    }
    return str
}

WOQLPrinter.prototype.decompileConcatList = function(pstruct) {
    //we can squish all the components together into a string
    //UNLESS there is a variable followed by a string starting with an alphanum or _
    let parts = pstruct['woql:array_element']
    let bits = []
    can_concat = true
    for (var i = 0; i < parts.length; i++) {
        let el = parts[i]
        if (el['woql:datatype']) {
            bits.push(el['woql:datatype']['@value'])
        } else if (el['woql:node']) {
            bits.push(el['woql:node'])
        } else if (el['woql:variable_name']) {
            bits.push('v:' + el['woql:variable_name']['@value'])
            if (can_concat && i < parts.length - 1) {
                let nextel = parts[i + 1]
                if (nextel['woql:datatype']) {
                    let nstr = nextel['woql:datatype']['@value']
                    if (/^[\w_]/.test(nstr)) {
                        can_concat = false
                    }
                }
            }
        }
    }
    if (can_concat) return '"' + bits.join('') + '"'
    else return '["' + bits.join('","') + '"]'
}

WOQLPrinter.prototype.decompilePathPattern = function(pstruct) {
    let t = pstruct['@type']
    switch (t) {
        case 'woql:PathPredicate':
            return pstruct['woql:path_predicate']['@id']
        case 'woql:PathPlus':
            var next = pstruct['woql:path_pattern']
            if (Array.isArray(next)) next = next[0]
            if (needsParentheses(next)) return '(' + this.decompilePathPattern(next) + ')+'
            else return this.decompilePathPattern(next) + '+'
        case 'woql:PathTimes':
            var next = pstruct['woql:path_pattern']
            var astr =
                '{' +
                pstruct['woql:path_minimum']['@value'] +
                ',' +
                pstruct['woql:path_maximum']['@value'] +
                '}'
            if (Array.isArray(next)) next = next[0]
            if (needsParentheses(next)) return '(' + this.decompilePathPattern(next) + ')' + astr
            else return this.decompilePathPattern(next) + astr
        case 'woql:PathSequence':
            var next1 = pstruct['woql:path_first']
            var next2 = pstruct['woql:path_second']
            if (Array.isArray(next1)) next1 = next1[0]
            var seqstr = ''
            if (needsParentheses(next1)) seqstr += '('
            seqstr += this.decompilePathPattern(next1)
            if (needsParentheses(next1)) seqstr += ')'
            seqstr += ','
            if (needsParentheses(next2)) seqstr += '('
            seqstr += this.decompilePathPattern(next2)
            if (needsParentheses(next2)) seqstr += ')'
            return seqstr
        case 'woql:PathOr':
            var next1 = pstruct['woql:path_left']
            var next2 = pstruct['woql:path_right']
            if (Array.isArray(next1)) next1 = next1[0]
            var seqstr = ''
            if (needsParentheses(next1)) seqstr += '('
            seqstr += this.decompilePathPattern(next1)
            if (needsParentheses(next1)) seqstr += ')'
            seqstr += '|'
            if (needsParentheses(next2)) seqstr += '('
            seqstr += this.decompilePathPattern(next2)
            if (needsParentheses(next2)) seqstr += ')'
            return seqstr
    }
    return 'error'
}

function needsParentheses(obj) {
    noparens = ['woql:PathPredicate', 'woql:PathPlus', 'woql:PathTimes']
    if (noparens.indexOf(obj['@type']) != -1) return false
    return true
}

function camelToSnake(string) {
    return string
        .replace(/[\w]([A-Z])/g, function(m) {
            return m[0] + '_' + m[1]
        })
        .toLowerCase()
}

function nspaces(n) {
    let spaces = ''
    for (var i = 0; i < n; i++) {
        spaces += ' '
    }
    return spaces
}

module.exports = WOQLPrinter
