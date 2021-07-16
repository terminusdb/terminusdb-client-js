////@ts-check
//WOQLQuery
let WOQLQuery = require('./woqlCore')

//I HAVE TO REVIEW THE Inheritance and the prototype chain
/*class WOQLQuery extends WOQLCore {
    constructor(query) {
        super(query)
    }
}*/

/**
 * Contains definitions of the WOQL functions which map directly to JSON-LD types
 * All other calls and queries can be composed from these
 */

//moved from woqlCore
WOQLQuery.prototype.wrapCursorWithAnd = function() {
    if (this.cursor && this.cursor['@type'] == 'And') {
        let newby = this.cursor['and'].length
        this.and({})
        this.cursor = this.cursor['and'][newby]['query']
        return
    } else {
        let nj = new WOQLQuery().json(this.cursor)
        for (var k in this.cursor) delete this.cursor[k]
        //create an empty json for the new query
        this.and(nj, {})
        this.cursor = this.cursor['and'][1]['query']
    }
}

WOQLQuery.prototype.using = function(Collection, Subq) {
    //if (Collection && Collection == 'args')
    //return ['collection', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Using'
    if (!Collection || typeof Collection != 'string') {
        return this.parameterError('The first parameter to using must be a Collection ID (string)')
    }
    this.cursor['collection'] = this.jlt(Collection)
    //this.cursor['@context'] = '/api/prefixes/' + Collection
    return this.addSubQuery(Subq)
}

WOQLQuery.prototype.comment = function(comment, Subq) {
    //if (comment && comment == 'args')
    //return ['comment', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Comment'
    this.cursor['comment'] = this.jlt(comment)
    return this.addSubQuery(Subq)
}

WOQLQuery.prototype.select = function(...list) {
    //if (list && list[0] == 'args')
    //return ['variable_list', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Select'
    if (!list || list.length <= 0) {
        return this.parameterError('Select must be given a list of variable names')
    }
    let last = list[list.length - 1]
    /**
     *@type {any}
     */
    let embedquery = false
    if (typeof last == 'object' && last.json) {
        embedquery = list.pop()
    } //else var embedquery = false
    this.cursor['variable_list'] = []
    for (var i = 0; i < list.length; i++) {
        let onevar = this.varj(list[i])
        onevar['@type'] = 'VariableListElement'
        onevar['index'] = this.jlt(i, 'nonNegativeInteger')
        this.cursor['variable_list'].push(onevar)
    }
    return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.distinct = function(...list) {
    //if (list && list[0] == 'args') 
    //return ['variable_list', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Distinct'
    if (!list || list.length <= 0) {
        return this.parameterError('Distinct must be given a list of variable names')
    }
    let last = list[list.length - 1]
    /**
     * @type {any}
     */
    let embedquery = false
    if (typeof last == 'object' && last.json) {
        embedquery = list.pop()
    } //else var embedquery = false
    this.cursor['variables'] = list
    return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.and = function(...queries) {
    if (this.cursor['@type'] && this.cursor['@type'] != 'And') {
        let nj = new WOQLQuery().json(this.cursor)
        for (var k in this.cursor) delete this.cursor[k]
        queries.unshift(nj)
    }
    //if (queries && queries[0] == 'args')
    //return ['query_list']
    this.cursor['@type'] = 'And'
    if (typeof this.cursor['query_list'] == 'undefined') this.cursor['query_list'] = []
    for (let i = 0; i < queries.length; i++) {
        let index = this.cursor['and'].length
        let onevar = this.qle(queries[i], index)
        if (
            onevar['query']['@type'] == 'And' &&
            onevar['query']['and']
        ) {
            this.cursor['and'] = onevar['query']['and']
        } else {
            this.cursor['and'].push(onevar)
        }
    }
    return this
}

WOQLQuery.prototype.or = function(...queries) {
    //if (queries && queries[0] == 'args')
    //return ['query_list']
    /*if (this.cursor['@type'] && this.cursor['@type'] != 'Or') {
        let nj = new WOQLQuery().json(this.cursor)
        for (var k in this.cursor) delete this.cursor[k]
        queries.unshift(nj)
    }*/
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Or'
    if (typeof this.cursor['or'] == 'undefined') this.cursor['or'] = []
    this.cursor['or'] = queries
    return this
}

WOQLQuery.prototype.from = function(graph_filter, query) {
    //if (graph_filter && graph_filter == 'args')
    //return ['graph_filter', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'From'
    if (!graph_filter || typeof graph_filter != 'string') {
        return this.parameterError(
            'The first parameter to from must be a Graph Filter Expression (string)',
        )
    }
    this.cursor['graph_filter'] = this.jlt(graph_filter)
    return this.addSubQuery(query)
}

WOQLQuery.prototype.into = function(graph_descriptor, query) {
    //if (graph_descriptor && graph_descriptor == 'args')
    //return ['graph', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Into'
    if (!graph_descriptor || typeof graph_descriptor != 'string') {
        return this.parameterError(
            'The first parameter to from must be a Graph Filter Expression (string)',
        )
    }
    this.cursor['graph'] = this.jlt(graph_descriptor)
    return this.addSubQuery(query)
}

WOQLQuery.prototype.triple = function(a, b, c) {
    //if (a && a == 'args') 
    //return ['subject', 'predicate', 'object']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Triple'
    this.cursor['subject'] = this.cleanSubject(a)
    this.cursor['predicate'] = this.cleanPredicate(b)
    this.cursor['object'] = this.cleanObject(c)
    return this
}

WOQLQuery.prototype.added_triple = function(a, b, c) {
    //if (a && a == 'args') 
    //return ['subject', 'predicate', 'object']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'AddedTriple'
    this.cursor['subject'] = this.cleanSubject(a)
    this.cursor['predicate'] = this.cleanPredicate(b)
    this.cursor['object'] = this.cleanObject(c)
    return this
}

WOQLQuery.prototype.removed_triple = function(a, b, c) {
    //if (a && a == 'args') 
    //return ['subject', 'predicate', 'object']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'RemovedTriple'
    this.cursor['subject'] = this.cleanSubject(a)
    this.cursor['predicate'] = this.cleanPredicate(b)
    this.cursor['object'] = this.cleanObject(c)
    return this
}

WOQLQuery.prototype.quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    //if (a && a == 'args') 
    //return args.concat(['graph_filter'])
    if (!g)
        return this.parameterError('Quad takes four parameters, the last should be a graph filter')
    this.cursor['@type'] = 'Triple'
    this.cursor['graph'] = this.cleanGraph(g)
    return this
}

WOQLQuery.prototype.added_quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    //if (a && a == 'args') 
    //return args.concat(['graph_filter'])
    if (!g)
        return this.parameterError('Quad takes four parameters, the last should be a graph filter')
    this.cursor['@type'] = 'AddedQuad'
    this.cursor['graph_filter'] = this.cleanGraph(g)
    return this
}

WOQLQuery.prototype.removed_quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    //if (a && a == 'args') 
    //return args.concat(['graph_filter'])
    if (!g)
        return this.parameterError('Quad takes four parameters, the last should be a graph filter')
    this.cursor['@type'] = 'RemovedQuad'
    this.cursor['graph_filter'] = this.cleanGraph(g)
    return this
}

WOQLQuery.prototype.sub = function(a, b) {
    //if (a && a == 'args') 
    //return ['parent', 'child']
    if (!a || !b) return this.parameterError('Subsumption takes two parameters, both URIs')
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Subsumption'
    this.cursor['parent'] = this.cleanClass(a)
    this.cursor['child'] = this.cleanClass(b)
    return this
}

WOQLQuery.prototype.subsumption = WOQLQuery.prototype.sub

WOQLQuery.prototype.eq = function(a, b) {
    //if (a && a == 'args') return ['left', 'right']
    if (typeof a == 'undefined' || typeof b == 'undefined')
        return this.parameterError('Equals takes two parameters')
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Equals'
    this.cursor['left'] = this.cleanObject(a)
    this.cursor['right'] = this.cleanObject(b)
    return this
}

WOQLQuery.prototype.equals = WOQLQuery.prototype.eq

WOQLQuery.prototype.substr = function(String, Before, Length, After, SubString) {
    //if (String && String == 'args')
    //return ['string', 'before', 'length', 'after', 'substring']
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
    this.cursor['@type'] = 'Substring'
    this.cursor['string'] = this.cleanObject(String)
    this.cursor['before'] = this.cleanObject(Before, 'xsd:nonNegativeInteger')
    this.cursor['length'] = this.cleanObject(Length, 'xsd:nonNegativeInteger')
    this.cursor['after'] = this.cleanObject(After, 'xsd:nonNegativeInteger')
    this.cursor['substring'] = this.cleanObject(SubString)
    return this
}

WOQLQuery.prototype.substring = WOQLQuery.prototype.substr

WOQLQuery.prototype.update_object = function(docjson) {
    //if (docjson && docjson == 'args') return ['document']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'UpdateObject'
    this.cursor['document'] =
        typeof docjson == 'string' ? this.expandVariable(docjson, true) : docjson
    return this.updated()
}

WOQLQuery.prototype.update = WOQLQuery.prototype.update_object

WOQLQuery.prototype.delete_object = function(JSON_or_IRI) {
    //if (JSON_or_IRI && JSON_or_IRI == 'args') return ['document']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'DeleteObject'
    this.cursor['document_uri'] = this.expandVariable(JSON_or_IRI)
    return this.updated()
}

WOQLQuery.prototype.delete = WOQLQuery.prototype.delete_object

WOQLQuery.prototype.read_object = function(IRI, OutputVar, Format) {
    //if (IRI && IRI == 'args') return ['document_uri', 'document']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'ReadObject'
    this.cursor['document_uri'] = this.expandVariable(IRI)
    this.cursor['document'] = this.expandVariable(OutputVar)
    return this.wform(Format)
}

WOQLQuery.prototype.read = WOQLQuery.prototype.read_object

/**
 * Takes an as structure
 */
WOQLQuery.prototype.get = function(asvars, query_resource) {
    //if (asvars && asvars == 'args') 
    //return ['as_vars', 'query_resource']
    this.cursor['@type'] = 'Get'
    this.cursor['columns'] = asvars.json ? asvars.json() : new WOQLQuery().as(...asvars).json()
    if (query_resource) {
        this.cursor['resource'] = this.jobj(query_resource)
    } else {
        this.cursor['resource'] = {}
    }
    this.cursor = this.cursor['resource']
    return this
}

/**
 * Takes an array of variables, an optional array of column names
 */
WOQLQuery.prototype.put = function(asvars, query, query_resource) {
    //if (asvars && asvars == 'args')
    //return ['as_vars', 'query', 'query_resource']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Put'
    if (Array.isArray(asvars) && typeof asvars[0] !== 'object') {
        let nasvars = []
        for (var i = 0; i < asvars.length; i++) {
            let iasv = this.asv(i, asvars[i])
            nasvars.push(iasv)
            this.cursor['columns'] = nasvars
        }
    } else {
        this.cursor['columns'] = asvars.json
            ? asvars.json()
            : new WOQLQuery().as(...asvars).json()
    }
    this.cursor['query'] = this.jobj(query)
    if (query_resource) {
        this.cursor['resource'] = this.jobj(query_resource)
    } else {
        this.cursor['resource'] = {}
    }
    this.cursor = this.cursor['resource']
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
 * @param {...(array|string)} varList variable number of arguments
 * @returns WOQLQuery
 */
WOQLQuery.prototype.as = function(...varList) {
    //if (varList && varList[0] == 'args')
    //return [['indexed_as_var', 'named_as_var']]
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
        if (varList[2] && typeof varList[2] == 'string') {
            var oasv = this.asv(varList[0], varList[1], varList[2])
        } else if (varList[1] && typeof varList[1] == 'string') {
            if (varList[1].substring(0, 4) == 'xsd:' || varList[1].substring(0, 4) == 'xdd:') {
                var oasv = this.asv(this.query.length, varList[0], varList[1])
            } else {
                var oasv = this.asv(varList[0], varList[1])
            }
        } else {
            var oasv = this.asv(this.query.length, varList[0])
        }
        this.query.push(oasv)
    } else if (typeof varList[0] == 'object') {
        //check if it is an class object with an json method
        this.query.push(varList[0].json ? varList[0].json() : varList[0])
    }
    return this
}

WOQLQuery.prototype.file = function(fpath, opts) {
    //if (fpath && fpath == 'args') return ['file', 'format']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'QueryResource'
    this.cursor['source'] = {'@type': 'Source', 'file': fpath}
    this.cursor['format'] = "csv" // hard coded for now
    this.cursor['options'] = opts
}

WOQLQuery.prototype.remote = function(uri, opts) {
    //if (uri && uri == 'args') return ['remote_uri', 'format']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'QueryResource'
    this.cursor['source'] = {'@type': 'Source', 'url': uri}
    this.cursor['format'] = "csv" // hard coded for now
    this.cursor['options'] = opts
}

WOQLQuery.prototype.post = function(fpath, opts) {
    //if (fpath && fpath == 'args') return ['file', 'format']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'PostResource'
    this.cursor['source'] = {'@type': 'Source', 'file': fpath}
    this.cursor['format'] = "csv" // hard coded for now
    this.cursor['options'] = opts
}

WOQLQuery.prototype.delete_triple = function(Subject, Predicate, Object_or_Literal) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(Subject, Predicate, Object_or_Literal)
    //if (Subject && Subject == 'args') return args
    this.cursor['@type'] = 'DeleteTriple'
    return this.updated()
}

WOQLQuery.prototype.add_triple = function(Subject, Predicate, Object_or_Literal) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(Subject, Predicate, Object_or_Literal)
    //if (Subject && Subject == 'args') return args
    this.cursor['@type'] = 'AddTriple'
    return this.updated()
}

WOQLQuery.prototype.delete_quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    //if (a && a == 'args') return args.concat(['graph'])
    if (!g)
        return this.parameterError(
            'Delete Quad takes four parameters, the last should be a graph id',
        )
    this.cursor['@type'] = 'DeleteTriple'
    this.cursor['graph'] = this.cleanGraph(g)
    return this.updated()
}

WOQLQuery.prototype.add_quad = function(a, b, c, g) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    let args = this.triple(a, b, c)
    //if (a && a == 'args') return args.concat(['graph'])
    if (!g)
        return this.parameterError('Add Quad takes four parameters, the last should be a graph id')
    this.cursor['@type'] = 'AddTriple'
    this.cursor['graph'] = this.cleanGraph(g)
    return this.updated()
}

WOQLQuery.prototype.with = function(TempGraph, query_resource, query) {
    //if (TempGraph && TempGraph == 'args')
    //return ['graph', 'query_resource', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'With'
    this.cursor['graph'] = this.cleanObject(this.string(TempGraph))
    this.cursor['resource'] = this.jobj(query_resource)
    return this.addSubQuery(query)
}

WOQLQuery.prototype.trim = function(untrimmed, trimmed) {
    //if (untrimmed && untrimmed == 'args') 
    //return ['untrimmed', 'trimmed']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Trim'
    this.cursor['untrimmed'] = this.cleanObject(untrimmed)
    this.cursor['trimmed'] = this.cleanObject(trimmed)
    return this
}

WOQLQuery.prototype.eval = function(arith, res) {
    //if (arith && arith == 'args') 
    //return ['expression', 'result']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Eval'
    this.cursor['expression'] = arith.json ? arith.json() : arith
    this.cursor['result'] = this.cleanObject(res)
    return this
}

WOQLQuery.prototype.plus = function(...args) {
    //if (args && args[0] == 'args') return ['first', 'second']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Plus'
    this.cursor['left'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['right'] = this.jobj(new WOQLQuery().plus(...args))
    } else {
        this.cursor['right'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.minus = function(...args) {
    //if (args && args[0] == 'args') return ['first', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Minus'
    this.cursor['left'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['right'] = this.jobj(new WOQLQuery().minus(...args))
    } else {
        this.cursor['right'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.times = function(...args) {
    //if (args && args[0] == 'args') return ['first', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Times'
    this.cursor['left'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['right'] = this.jobj(new WOQLQuery().times(...args))
    } else {
        this.cursor['right'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.divide = function(...args) {
    //if (args && args[0] == 'args') return ['left', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Divide'
    this.cursor['left'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['right'] = this.jobj(new WOQLQuery().divide(...args))
    } else {
        this.cursor['right'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.div = function(...args) {
    //if (args && args[0] == 'args') return ['left', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Div'
    this.cursor['left'] = this.arop(args.shift())
    if (args.length > 1) {
        this.cursor['right'] = this.jobj(new WOQLQuery().div(...args))
    } else {
        this.cursor['right'] = this.arop(args[0])
    }
    return this
}

WOQLQuery.prototype.exp = function(a, b) {
    //if (a && a == 'args') return ['left', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Exp'
    this.cursor['left'] = this.arop(a)
    this.cursor['right'] = this.arop(b)
    return this
}

WOQLQuery.prototype.floor = function(a) {
    //if (a && a == 'args') return ['argument']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Floor'
    this.cursor['argument'] = this.arop(a)
    return this
}

WOQLQuery.prototype.isa = function(a, b) {
    //if (a && a == 'args') return ['element', 'of_type']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'IsA'
    this.cursor['element'] = this.cleanSubject(a)
    this.cursor['type'] = this.cleanClass(b)
    return this
}

WOQLQuery.prototype.like = function(a, b, dist) {
    //if (a && a == 'args')
    //return ['left', 'right', 'like_similarity']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Like'
    this.cursor['left'] = this.cleanObject(a)
    this.cursor['right'] = this.cleanObject(b)
    if (dist) {
        this.cursor['similarity'] = this.cleanObject(dist, 'xsd:decimal')
    }
    return this
}

WOQLQuery.prototype.less = function(v1, v2) {
    //if (v1 && v1 == 'args') return ['left', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Less'
    this.cursor['left'] = this.cleanObject(v1)
    this.cursor['right'] = this.cleanObject(v2)
    return this
}

WOQLQuery.prototype.greater = function(v1, v2) {
    //if (v1 && v1 == 'args') return ['left', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Greater'
    this.cursor['left'] = this.cleanObject(v1)
    this.cursor['right'] = this.cleanObject(v2)
    return this
}

WOQLQuery.prototype.opt = function(query) {
    //if (query && query == 'args') return ['query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Optional'
    this.addSubQuery(query)
    return this
}

WOQLQuery.prototype.optional = WOQLQuery.prototype.opt

WOQLQuery.prototype.unique = function(prefix, vari, type) {
    //if (prefix && prefix == 'args')
    //return ['base', 'key_list', 'uri']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'HashKey'
    this.cursor['base'] = this.cleanObject(prefix)
    this.cursor['key_list'] = this.vlist(vari)
    this.cursor['uri'] = this.cleanClass(type)
    return this
}

/**
 * example WOQL.idgen("doc:Journey",["v:Start_ID","v:Start_Time","v:Bike"],"v:Journey_ID"),
 *
 * Generates the node's ID combined the variable list with a specific prefix (URL base).
 * If the input variables's values are the same, the output value will be the same.
 * @param {string} prefix
 * @param {string |array}  inputVarList the variable input list for generate the id
 * @param {string} outputVar  the output variable name
 */

WOQLQuery.prototype.idgen = function(prefix, inputVarList, outputVar) {
    //if (prefix && prefix == 'args')
    //return ['base', 'key_list', 'uri']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'LexicalKey'
    this.cursor['base'] = {'@type': 'Datatype'}
    this.cursor['base']['datatype'] = this.cleanObject(this.iri(prefix))
    //this.cursor['base'] = this.cleanObject(this.string(prefix))
    this.cursor['key_list'] = this.vlist(inputVarList)
    this.cursor['uri'] = this.cleanClass(outputVar)
    return this
}

WOQLQuery.prototype.idgenerator = WOQLQuery.prototype.idgen

WOQLQuery.prototype.upper = function(l, u) {
    //if (l && l == 'args') return ['left', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Upper'
    this.cursor['mixed'] = this.cleanObject(l)
    this.cursor['upper'] = this.cleanObject(u)
    return this
}

WOQLQuery.prototype.lower = function(u, l) {
    //if (u && u == 'args') return ['left', 'right']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Lower'
    this.cursor['mixed'] = this.cleanObject(u)
    this.cursor['lower'] = this.cleanObject(l)
    return this
}

WOQLQuery.prototype.pad = function(input, pad, len, output) {
    //if (input && input == 'args')
    //return ['pad_string', 'pad_char', 'pad_times', 'pad_result']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Pad'
    this.cursor['string'] = this.cleanObject(input)
    this.cursor['char'] = this.cleanObject(pad)
    this.cursor['times'] = this.cleanObject(len, 'xsd:integer')
    this.cursor['result'] = this.cleanObject(output)
    return this
}

WOQLQuery.prototype.split = function(input, glue, output) {
    //if (input && input == 'args')
    //return ['split_string', 'split_pattern', 'split_list']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Split'
    this.cursor['string'] = this.cleanObject(input)
    this.cursor['pattern'] = this.cleanObject(glue)
    this.cursor['list'] = this.wlist(output)
    return this
}

WOQLQuery.prototype.member = function(El, List) {
    //if (El && El == 'args') return ['member', 'member_list']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Member'
    this.cursor['member'] = this.cleanObject(El)
    this.cursor['list'] = this.wlist(List)
    return this
}

WOQLQuery.prototype.concat = function(list, v) {
    //) return ['concat_list', 'concatenated']
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
        this.cursor['@type'] = 'Concatenate'
        this.cursor['list'] = this.wlist(list, true)
        this.cursor['result'] = this.cleanObject(v)
    }
    return this
}

WOQLQuery.prototype.concatenate = WOQLQuery.prototype.concat

WOQLQuery.prototype.join = function(input, glue, output) {
    //if (input && input == 'args')
    //return ['join_list', 'join_separator', 'join']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Join'
    this.cursor['list'] = this.wlist(input)
    this.cursor['separator'] = this.cleanObject(glue)
    this.cursor['result'] = this.cleanObject(output)
    return this
}

WOQLQuery.prototype.sum = function(input, output) {
    //if (input && input == 'args') return ['sum_list', 'sum']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Sum'
    this.cursor['list'] = this.wlist(input)
    this.cursor['result'] = this.cleanObject(output)
    return this
}

WOQLQuery.prototype.start = function(start, query) {
    //if (start && start == 'args') return ['start', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Start'
    this.cursor['start'] = this.cleanObject(start, 'xsd:nonNegativeInteger')
    return this.addSubQuery(query)
}

WOQLQuery.prototype.limit = function(limit, query) {
    //if (limit && limit == 'args') return ['limit', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Limit'
    this.cursor['limit'] = this.cleanObject(limit, 'xsd:nonNegativeInteger')
    return this.addSubQuery(query)
}

WOQLQuery.prototype.re = function(p, s, m) {
    //if (p && p == 'args')
    // return ['pattern', 'regexp_string', 'regexp_list']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Regexp'
    this.cursor['pattern'] = this.cleanObject(p)
    this.cursor['string'] = this.cleanObject(s)
    this.cursor['result'] = this.wlist(m)
    return this
}

WOQLQuery.prototype.regexp = WOQLQuery.prototype.re

WOQLQuery.prototype.length = function(va, vb) {
    //if (va && va == 'args')
    //return ['length_list', 'length']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Length'
    this.cursor['list'] = this.cleanObject(va)
    if (typeof vb == 'number') {
        this.cursor['length'] = this.cleanObject(vb, 'xsd:nonNegativeInteger')
    } else if (typeof vb == 'string') {
        this.cursor['length'] = this.varj(vb)
    }
    return this
}

/**
 * Negation of passed or chained query
 */
WOQLQuery.prototype.not = function(query) {
    //if (query && query == 'args') return ['query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Not'
    return this.addSubQuery(query)
}

/**
 * Results in one solution of the subqueries
 */
WOQLQuery.prototype.once = function(query) {
    //if (query && query == 'args') return ['query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Once'
    return this.addSubQuery(query)
}

/**
 * Immediately run without backtracking
 */
WOQLQuery.prototype.immediately = function(query) {
    //if (query && query == 'args') return ['query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Immediately'
    return this.addSubQuery(query)
}

/**
 * Count of query
 */
WOQLQuery.prototype.count = function(countvar, query) {
    //if (countvar && countvar == 'args')
    //return ['count', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Count'
    this.cursor['count'] = this.cleanObject(countvar)
    return this.addSubQuery(query)
}

WOQLQuery.prototype.cast = function(val, type, vb) {
    //if (val && val == 'args')
    //return ['typecast_value', 'typecast_type', 'typecast_result']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Typecast'
    this.cursor['value'] = this.cleanObject(val)
    this.cursor['type'] = this.cleanObject(type)
    this.cursor['result'] = this.cleanObject(vb)
    return this
}

WOQLQuery.prototype.typecast = WOQLQuery.prototype.cast

WOQLQuery.prototype.order_by = function(...orderedVarlist) {
    //if (orderedVarlist && orderedVarlist[0] == 'args') 
    //return ['variable_ordering', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'OrderBy'
    this.cursor['ordering'] = []

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
            vars[vars.length - 1]['order'] = 'asc'
        } else if (orderedVarlist[i] == 'desc') {
            vars[vars.length - 1]['order'] = 'desc'
        } else if (typeof orderedVarlist[i] == 'string') {
            vars.push({varname: orderedVarlist[i], order: 'ascending'})
        } else {
            vars.push(orderedVarlist[i])
        }
    }
    for (var i = 0; i < vars.length; i++) {
        if (vars[i].varname) {
            let obj = {
                '@type': 'OrderTemplate',
                'variable': vars[i].varname,
                'ascending': vars[i].order
            }
            this.cursor['ordering'].push(obj)
        } else {
            vars[i]['index'] = this.jlt(i, 'xsd:nonNegativeInteger')
            this.cursor['ordering'].push(vars[i])
        }
    }
    return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.group_by = function(gvarlist, groupedvar, output, groupquery) {
    //if (gvarlist && gvarlist == 'args')
    //return ['group_by', 'group_template', 'grouped', 'query']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'GroupBy'
    this.cursor['group_by'] = []

    if (typeof gvarlist == 'string') gvarlist = [gvarlist]
        this.cursor['group_by'] = gvarlist
    if (typeof groupedvar == 'string') {
        this.cursor['template'] = this.varj(groupedvar)
    } else {
        this.cursor['template'] = []
        for (var i = 0; i < groupedvar.length; i++) {
            this.cursor['template'].push(groupedvar[i])
        }
    }
    this.cursor['grouped'] = this.varj(output)
    return this.addSubQuery(groupquery)
}

WOQLQuery.prototype.true = function() {
    this.cursor['@type'] = 'True'
    return this
}

WOQLQuery.prototype.path = function(Subject, Pattern, Object, Path) {
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Path'
    this.cursor['subject'] = this.cleanSubject(Subject)
    if (typeof Pattern == 'string') Pattern = this.compilePathPattern(Pattern)
    this.cursor['path_pattern'] = Pattern
    this.cursor['object'] = this.cleanObject(Object)
    this.cursor['path'] = this.varj(Path)
    return this
}

WOQLQuery.prototype.size = function(Graph, Size) {
    //if (Graph && Graph == 'args') 
    //return ['resource', 'size']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'Size'
    this.cursor['resource'] = this.cleanGraph(Graph)
    this.cursor['size'] = this.varj(Size)
    return this
}

WOQLQuery.prototype.triple_count = function(Graph, TripleCount) {
    //if (Graph && Graph == 'args') 
    //return ['resource', 'triple_count']
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'TripleCount'
    this.cursor['resource'] = this.cleanGraph(Graph)
    this.cursor['triple_count'] = this.varj(TripleCount)
    return this
}

WOQLQuery.prototype.type_of = function(a, b) {
    //if (a && a == 'args') return ['value', 'type']
    if (!a || !b) return this.parameterError('type_of takes two parameters, both values')
    if (this.cursor['@type']) this.wrapCursorWithAnd()
    this.cursor['@type'] = 'TypeOf'
    this.cursor['value'] = this.cleanClass(a)
    this.cursor['type'] = this.cleanClass(b)
    return this
}

module.exports = WOQLQuery
