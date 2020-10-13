const WOQLQuery = require('./woqlCore')

/**
 * Contains definitions of the WOQL functions which map directly to JSON-LD types
 * All other calls and queries can be composed from these
 */

WOQLQuery.prototype.using = function(Collection, Subq) {
    if (Collection && Collection == 'woql:args') return ['woql:collection', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Using'
    if (!Collection || typeof Collection != 'string') {
        return this.parameterError('The first parameter to using must be a Collection ID (string)')
    }
    this.cursor['woql:collection'] = this.jlt(Collection)
    //this.cursor['@context'] = '/api/prefixes/' + Collection
    return this.addSubQuery(Subq)
}

WOQLQuery.prototype.comment = function(comment, Subq) {
    if (comment && comment == 'woql:args') return ['woql:comment', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Comment'
    this.cursor['woql:comment'] = this.jlt(comment)
    return this.addSubQuery(Subq)
}

WOQLQuery.prototype.select = function(...list) {
    if (list && list[0] == 'woql:args') return ['woql:variable_list', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Select'
    if (!list || list.length <= 0) {
        return this.parameterError('Select must be given a list of variable names')
    }
    let last = list[list.length - 1]
    if (typeof last == 'object' && last.json) {
        var embedquery = list.pop()
    } else var embedquery = false
    this.cursor['woql:variable_list'] = []
    for (var i = 0; i < list.length; i++) {
        let onevar = this.varj(list[i])
        onevar['@type'] = 'woql:VariableListElement'
        onevar['woql:index'] = this.jlt(i, 'nonNegativeInteger')
        this.cursor['woql:variable_list'].push(onevar)
    }
    return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.distinct = function(...list) {
    if (list && list[0] == 'woql:args') return ['woql:variable_list', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Distinct'
    if (!list || list.length <= 0) {
        return this.parameterError('Distinct must be given a list of variable names')
    }
    let last = list[list.length - 1]
    if (typeof last == 'object' && last.json) {
        var embedquery = list.pop()
    } else var embedquery = false
    this.cursor['woql:variable_list'] = []
    for (var i = 0; i < list.length; i++) {
        let onevar = this.varj(list[i])
        onevar['@type'] = 'woql:VariableListElement'
        onevar['woql:index'] = this.jlt(i, 'nonNegativeInteger')
        this.cursor['woql:variable_list'].push(onevar)
    }
    return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.and = function(...queries) {
    if (this.cursor['@type'] && this.cursor['@type'] != 'woql:And') {
        let nj = new WOQLQuery().json(this.cursor)
        for (var k in this.cursor) delete this.cursor[k]
        queries.unshift(nj)
    }
    if (queries && queries[0] == 'woql:args') return ['woql:query_list']
    this.cursor['@type'] = 'woql:And'
    if (typeof this.cursor['woql:query_list'] == 'undefined') this.cursor['woql:query_list'] = []
    for (let i = 0; i < queries.length; i++) {
        let index = this.cursor['woql:query_list'].length
        let onevar = this.qle(queries[i], index)
        if (
            onevar['woql:query']['@type'] == 'woql:And' &&
            onevar['woql:query']['woql:query_list']
        ) {
            for (var j = 0; j < onevar['woql:query']['woql:query_list'].length; j++) {
                let qjson = onevar['woql:query']['woql:query_list'][j]['woql:query']
                if (qjson) {
                    index = this.cursor['woql:query_list'].length
                    let subvar = this.qle(qjson, index)
                    this.cursor['woql:query_list'].push(subvar)
                }
            }
        } else {
            this.cursor['woql:query_list'].push(onevar)
        }
    }
    return this
}

WOQLQuery.prototype.or = function(...queries) {
    if (queries && queries[0] == 'woql:args') return ['woql:query_list']
    /*if (this.cursor['@type'] && this.cursor['@type'] != 'woql:Or') {
        let nj = new WOQLQuery().json(this.cursor)
        for (var k in this.cursor) delete this.cursor[k]
        queries.unshift(nj)
    }*/
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Or'
    if (typeof this.cursor['woql:query_list'] == 'undefined') this.cursor['woql:query_list'] = []
    for (let i = 0; i < queries.length; i++) {
        let onevar = this.qle(queries[i], i)
        this.cursor['woql:query_list'].push(onevar)
    }
    return this
}

WOQLQuery.prototype.from = function(graph_filter, query) {
    if (graph_filter && graph_filter == 'woql:args') return ['woql:graph_filter', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:From'
    if (!graph_filter || typeof graph_filter != 'string') {
        return this.parameterError(
            'The first parameter to from must be a Graph Filter Expression (string)',
        )
    }
    this.cursor['woql:graph_filter'] = this.jlt(graph_filter)
    return this.addSubQuery(query)
}

WOQLQuery.prototype.into = function(graph_descriptor, query) {
    if (graph_descriptor && graph_descriptor == 'woql:args') return ['woql:graph', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Into'
    if (!graph_descriptor || typeof graph_descriptor != 'string') {
        return this.parameterError(
            'The first parameter to from must be a Graph Filter Expression (string)',
        )
    }
    this.cursor['woql:graph'] = this.jlt(graph_descriptor)
    return this.addSubQuery(query)
}

WOQLQuery.prototype.triple = function(a, b, c) {
    if (a && a == 'woql:args') return ['woql:subject', 'woql:predicate', 'woql:object']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Triple'
    this.cursor['woql:subject'] = this.cleanSubject(a)
    this.cursor['woql:predicate'] = this.cleanPredicate(b)
    this.cursor['woql:object'] = this.cleanObject(c)
    return this
}

WOQLQuery.prototype.added_triple = function(a, b, c) {
    if (a && a == 'woql:args') return ['woql:subject', 'woql:predicate', 'woql:object']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:AddedTriple'
    this.cursor['woql:subject'] = this.cleanSubject(a)
    this.cursor['woql:predicate'] = this.cleanPredicate(b)
    this.cursor['woql:object'] = this.cleanObject(c)
    return this
}

WOQLQuery.prototype.removed_triple = function(a, b, c) {
    if (a && a == 'woql:args') return ['woql:subject', 'woql:predicate', 'woql:object']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:RemovedTriple'
    this.cursor['woql:subject'] = this.cleanSubject(a)
    this.cursor['woql:predicate'] = this.cleanPredicate(b)
    this.cursor['woql:object'] = this.cleanObject(c)
    return this
}

WOQLQuery.prototype.quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    if (a && a == 'woql:args') return args.concat(['woql:graph_filter'])
    if (!g)
        return this.parameterError('Quad takes four parameters, the last should be a graph filter')
    this.cursor['@type'] = 'woql:Quad'
    this.cursor['woql:graph_filter'] = this.cleanGraph(g)
    return this
}

WOQLQuery.prototype.added_quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    if (a && a == 'woql:args') return args.concat(['woql:graph_filter'])
    if (!g)
        return this.parameterError('Quad takes four parameters, the last should be a graph filter')
    this.cursor['@type'] = 'woql:AddedQuad'
    this.cursor['woql:graph_filter'] = this.cleanGraph(g)
    return this
}

WOQLQuery.prototype.removed_quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    if (a && a == 'woql:args') return args.concat(['woql:graph_filter'])
    if (!g)
        return this.parameterError('Quad takes four parameters, the last should be a graph filter')
    this.cursor['@type'] = 'woql:RemovedQuad'
    this.cursor['woql:graph_filter'] = this.cleanGraph(g)
    return this
}

WOQLQuery.prototype.sub = function(a, b) {
    if (a && a == 'woql:args') return ['woql:parent', 'woql:child']
    if (!a || !b) return this.parameterError('Subsumption takes two parameters, both URIs')
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Subsumption'
    this.cursor['woql:parent'] = this.cleanClass(a)
    this.cursor['woql:child'] = this.cleanClass(b)
    return this
}

WOQLQuery.prototype.subsumption = WOQLQuery.prototype.sub

WOQLQuery.prototype.eq = function(a, b) {
    if (a && a == 'woql:args') return ['woql:left', 'woql:right']
    if (typeof a == 'undefined' || typeof b == 'undefined')
        return this.parameterError('Equals takes two parameters')
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Equals'
    this.cursor['woql:left'] = this.cleanObject(a)
    this.cursor['woql:right'] = this.cleanObject(b)
    return this
}

WOQLQuery.prototype.equals = WOQLQuery.prototype.eq

WOQLQuery.prototype.substr = function(String, Before, Length, After, SubString) {
    if (String && String == 'woql:args')
        return ['woql:string', 'woql:before', 'woql:length', 'woql:after', 'woql:substring']
    if (!SubString) {
        SubString = After
        After = 0
    }
    if (!SubString) {
        SubString = Length
        Length = SubString.length + Before
    }
    if (!String || !SubString || typeof SubString != 'string')
        return this.parameterError(
            'Substr - the first and last parameters must be strings representing the full and substring variables / literals',
        )
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Substring'
    this.cursor['woql:string'] = this.cleanObject(String)
    this.cursor['woql:before'] = this.cleanObject(Before, 'xsd:nonNegativeInteger')
    this.cursor['woql:length'] = this.cleanObject(Length, 'xsd:nonNegativeInteger')
    this.cursor['woql:after'] = this.cleanObject(After, 'xsd:nonNegativeInteger')
    this.cursor['woql:substring'] = this.cleanObject(SubString)
    return this
}

WOQLQuery.prototype.substring = WOQLQuery.prototype.substr

WOQLQuery.prototype.update_object = function(docjson) {
    if (docjson && docjson == 'woql:args') return ['woql:document']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:UpdateObject'
    this.cursor['woql:document'] =
        typeof docjson == 'string' ? this.expandVariable(docjson, true) : docjson
    return this.updated()
}

WOQLQuery.prototype.update = WOQLQuery.prototype.update_object

WOQLQuery.prototype.delete_object = function(JSON_or_IRI) {
    if (JSON_or_IRI && JSON_or_IRI == 'woql:args') return ['woql:document']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:DeleteObject'
    this.cursor['woql:document_uri'] = this.expandVariable(JSON_or_IRI)
    return this.updated()
}

WOQLQuery.prototype.delete = WOQLQuery.prototype.delete_object

WOQLQuery.prototype.read_object = function(IRI, OutputVar, Format) {
    if (IRI && IRI == 'woql:args') return ['woql:document_uri', 'woql:document']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:ReadObject'
    this.cursor['woql:document_uri'] = this.expandVariable(IRI)
    this.cursor['woql:document'] = this.expandVariable(OutputVar)
    return this.wform(Format)
}

WOQLQuery.prototype.read = WOQLQuery.prototype.read_object

/**
 * Takes an as structure
 */
WOQLQuery.prototype.get = function(asvars, query_resource) {
    if (asvars && asvars == 'woql:args') return ['woql:as_vars', 'woql:query_resource']
    this.cursor['@type'] = 'woql:Get'
    this.cursor['woql:as_vars'] = asvars.json ? asvars.json() : new WOQLQuery().as(...asvars).json()
    if (query_resource) {
        this.cursor['woql:query_resource'] = this.jobj(query_resource)
    } else {
        this.cursor['woql:query_resource'] = {}
    }
    this.cursor = this.cursor['woql:query_resource']
    return this
}

/**
 * Takes an array of variables, an optional array of column names
 */
WOQLQuery.prototype.put = function(asvars, query, query_resource) {
    if (asvars && asvars == 'woql:args')
        return ['woql:as_vars', 'woql:query', 'woql:query_resource']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Put'
    if (Array.isArray(asvars) && typeof asvars[0] != 'object') {
        let nasvars = []
        for (var i = 0; i < asvars.length; i++) {
            let iasv = this.asv(i, asvars[i])
            nasvars.push(iasv)
            this.cursor['woql:as_vars'] = nasvars
        }
    } else {
        this.cursor['woql:as_vars'] = asvars.json
            ? asvars.json()
            : new WOQLQuery().as(...asvars).json()
    }
    this.cursor['woql:query'] = this.jobj(query)
    if (query_resource) {
        this.cursor['woql:query_resource'] = this.jobj(query_resource)
    } else {
        this.cursor['woql:query_resource'] = {}
    }
    this.cursor = this.cursor['woql:query_resource']
    return this
}

/**
 * Forms
 *   1. indexedasvars
 *   2. namedasvars
 *
 * Imports the value identified by Source to a Target variable
 *
 * calling:
 *   WOQL.as("first var", "v:First_Var", "string").as("second var", "v:Second_Var")
 *   WOQL.as(["first var", "v:First_Var", "string"], ["second var", "v:Second_Var"])
 *
 *   @param {array} varList variable number of arguments
 */
WOQLQuery.prototype.as = function(...varList) {
    if (varList && varList[0] == 'woql:args') return [['woql:indexed_as_var', 'woql:named_as_var']]
    if (!Array.isArray(this.query)) this.query = []
    if (Array.isArray(varList[0])) {
        if (!varList[1]) {
            //indexed as vars
            for (var i = 0; i < varList[0].length; i++) {
                let iasv = this.asv(i, varList[0][i])
                this.query.push(iasv)
            }
        } else {
            for (var i = 0; i < varList.length; i++) {
                let onemap = varList[i]
                if (Array.isArray(onemap) && onemap.length >= 2) {
                    let type = onemap && onemap.length > 2 ? onemap[2] : false
                    let oasv = this.asv(onemap[0], onemap[1], type)
                    this.query.push(oasv)
                }
            }
        }
    } else if (typeof varList[0] == 'number' || typeof varList[0] == 'string') {
        if(varList[2] && typeof varList[2] == "string"){
            var oasv = this.asv(varList[0], varList[1], varList[2])
        }
        else if(varList[1] && typeof varList[1] == 'string'){
            if(varList[1].substring(0, 4) == "xsd:" || varList[1].substring(0, 4) == "xdd:"){
                var oasv = this.asv(this.query.length, varList[0], varList[1])
            }
            else {
                var oasv = this.asv(varList[0], varList[1])
            }
        }
        else {
            var oasv = this.asv(this.query.length, varList[0])
        }
        this.query.push(oasv)
    } else if (typeof varList[0] == 'object') {
        this.query.push(varList[0].json ? varList[0].json() : varList[0])
    }
    return this
}

WOQLQuery.prototype.file = function(fpath, opts) {
    if (fpath && fpath == 'woql:args') return ['woql:file', 'woql:format']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:FileResource'
    if (typeof fpath === 'string') {
        this.cursor['woql:file'] = {'@type': 'xsd:string', '@value': fpath}
    } else {
        this.cursor['woql:file'] = fpath
    }
    return this.wform(opts)
}

WOQLQuery.prototype.remote = function(uri, opts) {
    if (uri && uri == 'woql:args') return ['woql:remote_uri', 'woql:format']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:RemoteResource'
    this.cursor['woql:remote_uri'] = {'@type': 'xsd:anyURI', '@value': uri}
    return this.wform(opts)
}

WOQLQuery.prototype.post = function(fpath, opts) {
    if (fpath && fpath == 'woql:args') return ['woql:file', 'woql:format']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:PostResource'
    this.cursor['woql:file'] = {'@type': 'xsd:string', '@value': fpath}
    return this.wform(opts)
}

WOQLQuery.prototype.delete_triple = function(Subject, Predicate, Object_or_Literal) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(Subject, Predicate, Object_or_Literal)
    if (Subject && Subject == 'woql:args') return args
    this.cursor['@type'] = 'woql:DeleteTriple'
    return this.updated()
}

WOQLQuery.prototype.add_triple = function(Subject, Predicate, Object_or_Literal) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(Subject, Predicate, Object_or_Literal)
    if (Subject && Subject == 'woql:args') return args
    this.cursor['@type'] = 'woql:AddTriple'
    return this.updated()
}

WOQLQuery.prototype.delete_quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    if (a && a == 'woql:args') return args.concat(['woql:graph'])
    if (!g)
        return this.parameterError(
            'Delete Quad takes four parameters, the last should be a graph id',
        )
    this.cursor['@type'] = 'woql:DeleteQuad'
    this.cursor['woql:graph'] = this.cleanGraph(g)
    return this.updated()
}

WOQLQuery.prototype.add_quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    if (a && a == 'woql:args') return args.concat(['woql:graph'])
    if (!g)
        return this.parameterError('Add Quad takes four parameters, the last should be a graph id')
    this.cursor['@type'] = 'woql:AddQuad'
    this.cursor['woql:graph'] = this.cleanGraph(g)
    return this.updated()
}

/*
 * Functions which take a query as an argument advance the cursor to make the chaining of queries fall
 * into the corrent place in the encompassing json
 */
WOQLQuery.prototype.when = function(Query, Consequent) {
    if (Query && Query == 'woql:args') return ['woql:query', 'woql:consequent']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:When'
    this.addSubQuery(Query)
    if (Consequent) {
        this.cursor['woql:consequent'] = this.jobj(Consequent)
    } else {
        this.cursor['woql:consequent'] = {}
    }
    this.cursor = this.cursor['woql:consequent']
    return this
}

WOQLQuery.prototype.with = function(TempGraph, query_resource, query) {
    if (TempGraph && TempGraph == 'woql:args')
        return ['woql:graph', 'woql:query_resource', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:With'
    this.cursor['woql:graph'] = this.cleanObject(this.string(TempGraph))
    this.cursor['woql:query_resource'] = this.jobj(query_resource)
    return this.addSubQuery(query)
}

WOQLQuery.prototype.trim = function(untrimmed, trimmed) {
    if (untrimmed && untrimmed == 'woql:args') return ['woql:untrimmed', 'woql:trimmed']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Trim'
    this.cursor['woql:untrimmed'] = this.cleanObject(untrimmed)
    this.cursor['woql:trimmed'] = this.cleanObject(trimmed)
    return this
}

WOQLQuery.prototype.eval = function(arith, res) {
    if (arith && arith == 'woql:args') return ['woql:expression', 'woql:result']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Eval'
    this.cursor['woql:expression'] = arith.json ? arith.json() : arith
    this.cursor['woql:result'] = this.cleanObject(res)
    return this
}

WOQLQuery.prototype.plus = function(...args) {
    if (args && args[0] == 'woql:args') return ['woql:first', 'woql:second']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Plus'
    this.cursor['woql:first'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['woql:second'] = this.jobj(new WOQLQuery().plus(...args))
    } else {
        this.cursor['woql:second'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.minus = function(...args) {
    if (args && args[0] == 'woql:args') return ['woql:first', 'woql:second']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Minus'
    this.cursor['woql:first'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['woql:second'] = this.jobj(new WOQLQuery().minus(...args))
    } else {
        this.cursor['woql:second'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.times = function(...args) {
    if (args && args[0] == 'woql:args') return ['woql:first', 'woql:second']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Times'
    this.cursor['woql:first'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['woql:second'] = this.jobj(new WOQLQuery().times(...args))
    } else {
        this.cursor['woql:second'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.divide = function(...args) {
    if (args && args[0] == 'woql:args') return ['woql:first', 'woql:second']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Divide'
    this.cursor['woql:first'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['woql:second'] = this.jobj(new WOQLQuery().divide(...args))
    } else {
        this.cursor['woql:second'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.div = function(...args) {
    if (args && args[0] == 'woql:args') return ['woql:first', 'woql:second']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Div'
    this.cursor['woql:first'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['woql:second'] = this.jobj(new WOQLQuery().div(...args))
    } else {
        this.cursor['woql:second'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.exp = function(a, b) {
    if (a && a == 'woql:args') return ['woql:first', 'woql:second']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Exp'
    this.cursor['woql:first'] = this.arop(a)
    this.cursor['woql:second'] = this.arop(b)
    return this
}

WOQLQuery.prototype.floor = function(a) {
    if (a && a == 'woql:args') return ['woql:argument']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Floor'
    this.cursor['woql:argument'] = this.arop(a)
    return this
}

WOQLQuery.prototype.isa = function(a, b) {
    if (a && a == 'woql:args') return ['woql:element', 'woql:of_type']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:IsA'
    this.cursor['woql:element'] = this.cleanSubject(a)
    this.cursor['woql:of_type'] = this.cleanClass(b)
    return this
}

WOQLQuery.prototype.like = function(a, b, dist) {
    if (a && a == 'woql:args') return ['woql:left', 'woql:right', 'woql:like_similarity']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Like'
    this.cursor['woql:left'] = this.cleanObject(a)
    this.cursor['woql:right'] = this.cleanObject(b)
    if (dist) {
        this.cursor['woql:like_similarity'] = this.cleanObject(dist, 'xsd:decimal')
    }
    return this
}

WOQLQuery.prototype.less = function(v1, v2) {
    if (v1 && v1 == 'woql:args') return ['woql:left', 'woql:right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Less'
    this.cursor['woql:left'] = this.cleanObject(v1)
    this.cursor['woql:right'] = this.cleanObject(v2)
    return this
}

WOQLQuery.prototype.greater = function(v1, v2) {
    if (v1 && v1 == 'woql:args') return ['woql:left', 'woql:right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Greater'
    this.cursor['woql:left'] = this.cleanObject(v1)
    this.cursor['woql:right'] = this.cleanObject(v2)
    return this
}

WOQLQuery.prototype.opt = function(query) {
    if (query && query == 'woql:args') return ['woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Optional'
    this.addSubQuery(query)
    return this
}

WOQLQuery.prototype.optional = WOQLQuery.prototype.opt

WOQLQuery.prototype.unique = function(prefix, vari, type) {
    if (prefix && prefix == 'woql:args') return ['woql:base', 'woql:key_list', 'woql:uri']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Unique'
    this.cursor['woql:base'] = this.cleanObject(prefix)
    this.cursor['woql:key_list'] = this.vlist(vari)
    this.cursor['woql:uri'] = this.cleanClass(type)
    return this
}

/**
 * example WOQL.idgen("doc:Journey",["v:Start_ID","v:Start_Time","v:Bike"],"v:Journey_ID"),
 *
 * Generates the node's ID combined the variable list with a specific prefix (URL base).
 * If the input variables's values are the same, the output value will be the same.
 * @param {string} prefix
 * @param {string or array}  inputVarList the variable input list for generate the id
 * @param {string} outputVar  the output variable name
 */

WOQLQuery.prototype.idgen = function(prefix, inputVarList, outputVar) {
    if (prefix && prefix == 'woql:args') return ['woql:base', 'woql:key_list', 'woql:uri']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:IDGenerator'
    this.cursor['woql:base'] = {"@type": "woql:Datatype"}
    this.cursor['woql:base']["woql:datatype"]=this.cleanObject(this.iri(prefix))
    //this.cursor['woql:base'] = this.cleanObject(this.string(prefix))
    this.cursor['woql:key_list'] = this.vlist(inputVarList)
    this.cursor['woql:uri'] = this.cleanClass(outputVar)
    return this
}

WOQLQuery.prototype.idgenerator = WOQLQuery.prototype.idgen

WOQLQuery.prototype.upper = function(l, u) {
    if (l && l == 'woql:args') return ['woql:left', 'woql:right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Upper'
    this.cursor['woql:left'] = this.cleanObject(l)
    this.cursor['woql:right'] = this.cleanObject(u)
    return this
}

WOQLQuery.prototype.lower = function(u, l) {
    if (u && u == 'woql:args') return ['woql:left', 'woql:right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Lower'
    this.cursor['woql:left'] = this.cleanObject(u)
    this.cursor['woql:right'] = this.cleanObject(l)
    return this
}

WOQLQuery.prototype.pad = function(input, pad, len, output) {
    if (input && input == 'woql:args')
        return ['woql:pad_string', 'woql:pad_char', 'woql:pad_times', 'woql:pad_result']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Pad'
    this.cursor['woql:pad_string'] = this.cleanObject(input)
    this.cursor['woql:pad_char'] = this.cleanObject(pad)
    this.cursor['woql:pad_times'] = this.cleanObject(len, 'xsd:integer')
    this.cursor['woql:pad_result'] = this.cleanObject(output)
    return this
}

WOQLQuery.prototype.split = function(input, glue, output) {
    if (input && input == 'woql:args')
        return ['woql:split_string', 'woql:split_pattern', 'woql:split_list']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Split'
    this.cursor['woql:split_string'] = this.cleanObject(input)
    this.cursor['woql:split_pattern'] = this.cleanObject(glue)
    this.cursor['woql:split_list'] = this.wlist(output)
    return this
}

WOQLQuery.prototype.member = function(El, List) {
    if (El && El == 'woql:args') return ['woql:member', 'woql:member_list']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Member'
    this.cursor['woql:member'] = this.cleanObject(El)
    this.cursor['woql:member_list'] = this.wlist(List)
    return this
}

WOQLQuery.prototype.concat = function(list, v) {
    if (list && list == 'woql:args') return ['woql:concat_list', 'woql:concatenated']
    if (typeof list == 'string') {
        var slist = list.split(/(v:)/)
        var nlist = []
        if (slist[0]) nlist.push(slist[0])
        for (var i = 1; i < slist.length; i = i + 2) {
            if (slist[i]) {
                if (slist[i] == 'v:') {
                    var slist2 = slist[i + 1].split(/([^\w_])/)
                    let x = slist2.shift()
                    nlist.push('v:' + x)
                    let rest = slist2.join('')
                    if (rest) nlist.push(rest)
                }
            }
        }
        list = nlist
    }
    if (Array.isArray(list)) {
        if (this.cursor['@type']) this.wrapCursorWithAnd()
        this.cursor['@type'] = 'woql:Concatenate'
        this.cursor['woql:concat_list'] = this.wlist(list, true)
        this.cursor['woql:concatenated'] = this.cleanObject(v)
    }
    return this
}

WOQLQuery.prototype.concatenate = WOQLQuery.prototype.concat

WOQLQuery.prototype.join = function(input, glue, output) {
    if (input && input == 'woql:args') return ['woql:join_list', 'woql:join_separator', 'woql:join']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Join'
    this.cursor['woql:join_list'] = this.wlist(input)
    this.cursor['woql:join_separator'] = this.cleanObject(glue)
    this.cursor['woql:join'] = this.cleanObject(output)
    return this
}

WOQLQuery.prototype.sum = function(input, output) {
    if (input && input == 'woql:args') return ['woql:sum_list', 'woql:sum']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Sum'
    this.cursor['woql:sum_list'] = this.wlist(input)
    this.cursor['woql:sum'] = this.cleanObject(output)
    return this
}

WOQLQuery.prototype.start = function(start, query) {
    if (start && start == 'woql:args') return ['woql:start', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Start'
    this.cursor['woql:start'] = this.cleanObject(start, 'xsd:nonNegativeInteger')
    return this.addSubQuery(query)
}

WOQLQuery.prototype.limit = function(limit, query) {
    if (limit && limit == 'woql:args') return ['woql:limit', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Limit'
    this.cursor['woql:limit'] = this.cleanObject(limit, 'xsd:nonNegativeInteger')
    return this.addSubQuery(query)
}

WOQLQuery.prototype.re = function(p, s, m) {
    if (p && p == 'woql:args') return ['woql:pattern', 'woql:regexp_string', 'woql:regexp_list']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Regexp'
    this.cursor['woql:pattern'] = this.cleanObject(p)
    this.cursor['woql:regexp_string'] = this.cleanObject(s)
    this.cursor['woql:regexp_list'] = this.wlist(m)
    return this
}

WOQLQuery.prototype.regexp = WOQLQuery.prototype.re

WOQLQuery.prototype.length = function(va, vb) {
    if (va && va == 'woql:args') return ['woql:length_list', 'woql:length']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Length'
    this.cursor['woql:length_list'] = this.cleanObject(va)
    if (typeof vb == 'number') {
        this.cursor['woql:length'] = this.cleanObject(vb, 'xsd:nonNegativeInteger')
    } else if (typeof vb == 'string') {
        this.cursor['woql:length'] = this.varj(vb)
    }
    return this
}

/**
 * Negation of passed or chained query
 */
WOQLQuery.prototype.not = function(query) {
    if (query && query == 'woql:args') return ['woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Not'
    return this.addSubQuery(query)
}

/**
 * Results in one solution of the subqueries
 */
WOQLQuery.prototype.once = function(query) {
    if (query && query == 'woql:args') return ['woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Once'
    return this.addSubQuery(query)
}

/**
 * Immediately run without backtracking
 */
WOQLQuery.prototype.immediately = function(query) {
    if (query && query == 'woql:args') return ['woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Immediately'
    return this.addSubQuery(query)
}

/**
 * Count of query
 */
WOQLQuery.prototype.count = function(countvar,query) {
    if (countvar && countvar == 'woql:args') return ['woql:count', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Count'
    this.cursor['woql:count'] = this.cleanObject(countvar)
    return this.addSubQuery(query)
}

WOQLQuery.prototype.cast = function(val, type, vb) {
    if (val && val == 'woql:args')
        return ['woql:typecast_value', 'woql:typecast_type', 'woql:typecast_result']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Typecast'
    this.cursor['woql:typecast_value'] = this.cleanObject(val)
    this.cursor['woql:typecast_type'] = this.cleanObject(type)
    this.cursor['woql:typecast_result'] = this.cleanObject(vb)
    return this
}

WOQLQuery.prototype.typecast = WOQLQuery.prototype.cast

WOQLQuery.prototype.order_by = function(...orderedVarlist) {
    if (orderedVarlist && orderedVarlist[0] == 'woql:args')
        return ['woql:variable_ordering', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:OrderBy'
    this.cursor['woql:variable_ordering'] = []

    if (!orderedVarlist || orderedVarlist.length === 0) {
        return this.parameterError(
            'Order by must be passed at least one variables to order the query',
        )
    }
    let embedquery =
        typeof orderedVarlist[orderedVarlist.length - 1] === 'object' &&
        orderedVarlist[orderedVarlist.length - 1].json
            ? orderedVarlist.pop()
            : false

    let vars = []

    for (var i = 0; i < orderedVarlist.length; i++) {
        if (orderedVarlist[i] == 'asc') {
            vars[vars.length-1]['order'] = 'woql:ascending'
        } else if (orderedVarlist[i] == 'desc') {
            vars[vars.length-1]['order'] = 'woql:descending'
        } else if (typeof orderedVarlist[i] == 'string') {
            vars.push({varname: orderedVarlist[i], order: 'woql:ascending'})
        } else {
            vars.push(orderedVarlist[i])
        }
    }
    for (var i = 0; i < vars.length; i++) {
        if (vars[i].varname) {
            let obj = {
                '@type': 'woql:VariableOrdering',
                'woql:index': this.jlt(i, 'xsd:nonNegativeInteger'),
                'woql:variable': this.varj(vars[i].varname),
            }
            if (vars[i].order == 'woql:ascending') {
                obj['woql:ascending'] = this.jlt(true, 'xsd:boolean')
            } else {
                obj['woql:ascending'] = this.jlt(false, 'xsd:boolean')
            }
            this.cursor['woql:variable_ordering'].push(obj)
        } else {
            vars[i]['woql:index'] = this.jlt(i, 'xsd:nonNegativeInteger')
            this.cursor['woql:variable_ordering'].push(vars[i])
        }
    }
    return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.group_by = function(gvarlist, groupedvar, output, groupquery) {
    if (gvarlist && gvarlist == 'woql:args')
        return ['woql:group_by', 'woql:group_template', 'woql:grouped', 'woql:query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:GroupBy'
    this.cursor['woql:group_by'] = []

    if (typeof gvarlist == 'string') gvarlist = [gvarlist]
    for (var i = 0; i < gvarlist.length; i++) {
        let onevar = this.varj(gvarlist[i])
        onevar['@type'] = 'woql:VariableListElement'
        onevar['woql:index'] = this.jlt(i, 'nonNegativeInteger')
        this.cursor['woql:group_by'].push(onevar)
    }
    if (typeof groupedvar == 'string') {
        this.cursor['woql:group_template'] = this.varj(groupedvar)
    }
    else {
        this.cursor['woql:group_template'] = []
        for (var i = 0; i < groupedvar.length; i++) {
            let onevar = this.varj(groupedvar[i])
            onevar['@type'] = 'woql:VariableListElement'
            onevar['woql:index'] = this.jlt(i, 'nonNegativeInteger')
            this.cursor['woql:group_template'].push(onevar)
        }
    }
    this.cursor['woql:grouped'] = this.varj(output)
    return this.addSubQuery(groupquery)
}

WOQLQuery.prototype.true = function() {
    this.cursor['@type'] = 'woql:True'
    return this
}

WOQLQuery.prototype.path = function(Subject, Pattern, Object, Path) {
    if (Subject && Subject == 'woql:args')
        return ['woql:subject', 'woql:path_pattern', 'woql:object', 'woql:path']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Path'
    this.cursor['woql:subject'] = this.cleanSubject(Subject)
    if (typeof Pattern == 'string') Pattern = this.compilePathPattern(Pattern)
    this.cursor['woql:path_pattern'] = Pattern
    this.cursor['woql:object'] = this.cleanObject(Object)
    this.cursor['woql:path'] = this.varj(Path)
    return this
}

WOQLQuery.prototype.size = function(Graph, Size) {
    if (Graph && Graph == 'woql:args') return ['woql:resource', 'woql:size']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:Size'
    this.cursor['woql:resource'] = this.cleanGraph(Graph)
    this.cursor['woql:size'] = this.varj(Size)
    return this
}

WOQLQuery.prototype.triple_count = function(Graph, TripleCount) {
    if (Graph && Graph == 'woql:args') return ['woql:resource', 'woql:triple_count']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:TripleCount'
    this.cursor['woql:resource'] = this.cleanGraph(Graph)
    this.cursor['woql:triple_count'] = this.varj(TripleCount)
    return this
}

WOQLQuery.prototype.type_of = function(a, b) {
    if (a && a == 'woql:args') return ['woql:value', 'woql:type']
    if (!a || !b) return this.parameterError('type_of takes two parameters, both values')
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'woql:TypeOf'
    this.cursor['woql:value'] = this.cleanClass(a)
    this.cursor['woql:type'] = this.cleanClass(b)
    return this
}
