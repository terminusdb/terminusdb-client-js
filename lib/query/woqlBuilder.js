const WOQLQuery = require('./woqlCore')
const WOQLSchema = require('./woqlSchema')
const WOQLLibrary = require('./woqlLibrary')

/**
 * Simple composite functions which produce WOQL queries
 */
WOQLQuery.prototype.star = function(Graph, Subj, Pred, Obj) {
    Subj = Subj || 'v:Subject'
    Pred = Pred || 'v:Predicate'
    Obj = Obj || 'v:Object'
    Graph = Graph || false
    if (Graph) {
        return this.quad(Subj, Pred, Obj, Graph)
    } else {
        return this.triple(Subj, Pred, Obj)
    }
}

WOQLQuery.prototype.all = function(Subj, Pred, Obj, Graph) {
    return this.star(Graph, Subj, Pred, Obj)
}

WOQLQuery.prototype.lib = function() {
    return new WOQLLibrary()
}

WOQLQuery.prototype.abstract = function(graph, subj) {
    this._add_partial(subj, 'system:tag', 'system:abstract', graph)
    return this
}

WOQLQuery.prototype.string = function(s) {
    return {'@type': 'xsd:string', '@value': String(s)}
}

WOQLQuery.prototype.boolean = function(tf) {
    tf = tf || false
    return this.literal(tf, "boolean")
}

WOQLQuery.prototype.literal = function(s, t) {
    t = t.indexOf(':') == -1 ? 'xsd:' + t : t
    return {'@type': t, '@value': s}
}

WOQLQuery.prototype.iri = function(s) {
    return {
        '@type': 'woql:Node',
        'woql:node': s,
    }
}

WOQLQuery.prototype.update_triple = function(subject, predicate, new_object) {
    return this.and(
        new WOQLQuery().opt(
            new WOQLQuery().triple(subject, predicate, "v:AnyObject")
            .delete_triple(subject, predicate, "v:AnyObject")
            .not().triple(subject, predicate, new_object)
        ),
        new WOQLQuery().add_triple(subject, predicate, new_object)
    )
}

WOQLQuery.prototype.update_quad = function(subject, predicate, new_object, graph) {
    return this.and(
        new WOQLQuery().opt(
            new WOQLQuery().quad(subject, predicate, "v:AnyObject", graph)
            .delete_quad(subject, predicate, "v:AnyObject", graph)
            .not().quad(subject, predicate, new_object, graph)
        ),
        new WOQLQuery().add_quad(subject, predicate, new_object, graph)
    )
}


/**
 * Removes all triples from a graph
 * @param {[string]} g - optional graph resource identifier 
 */

WOQLQuery.prototype.nuke = function(g) {
    if(g){
        return this.quad("v:A", "v:B", "v:C", g).delete_quad("v:A", "v:B", "v:C", g)
    }
    else {
        return this.triple("v:A", "v:B", "v:C").delete_triple("v:A", "v:B", "v:C")
    }
}

/**
 * Add a property at the current class/document
 *
 * @param {string} proId - property ID
 * @param {string} type  - property type (range) (on class inserts) property value on data inserts
 * @returns WOQLQuery object
 *
 * A range could be another class/document or an "xsd":"http://www.w3.org/2001/XMLSchema#" type
 * like string|integer|datatime|nonNegativeInteger|positiveInteger etc ..
 * (you don't need the prefix xsd for specific a type)
 */

WOQLQuery.prototype.property = function(proId, type_or_value) {
    if (this._adding_class()) {
        let part = this.findLastSubject(this.cursor)
        let g = false
        let gpart
        if (part) gpart = part['woql:graph_filter'] || part['woql:graph']
        if (gpart) g = gpart['@value']
        let nprop = new WOQLQuery()
            .add_property(proId, type_or_value, g)
            .domain(this._adding_class())
        this.and(nprop)
    } else {
        this._add_partial(false, proId, type_or_value)
    }
    return this
}

WOQLQuery.prototype.node = function(node, type) {
    type = type || false
    if (type == 'add_quad') type = 'AddQuad'
    else if (type == 'delete_quad') type = 'DeleteQuad'
    else if (type == 'add_triple') type = 'AddTriple'
    else if (type == 'delete_triple') type = 'DeleteTriple'
    else if (type == 'quad') type = 'Quad'
    else if (type == 'triple') type = 'Triple'
    if (type && type.indexOf(':') == -1) type = 'woql:' + type
    let ctxt = {subject: node}
    if (type) ctxt.action = type
    this._set_context(ctxt)
    return this
}


WOQLQuery.prototype.insert = function(id, type, refGraph) {
    type = this.cleanType(type, true)
    refGraph = refGraph || (this.triple_builder_context ? this.triple_builder_context.graph : false)
    if (refGraph) {
        return this.add_quad(id, 'type', type, refGraph)
    }
    return this.add_triple(id, 'type', type)
}

WOQLQuery.prototype.insert_data = function(data, refGraph) {
    if (data.type && data.id) {
        type = this.cleanType(data.type, true)
        this.insert(data.id, type, refGraph)
        if (data.label) {
            this.label(data.label)
        }
        if (data.description) {
            this.description(data.description)
        }
        for (var k in data) {
            if (['id', 'label', 'type', 'description'].indexOf(k) == -1) {
                this.property(k, data[k])
            }
        }
    }
    return this
}

WOQLQuery.prototype.value = function(a, b, c, g) {
    if(typeof c == "string"){
        c = this.string(c)
    }
    else if(typeof c == "number"){
        c = this.literal(c, "xsd:decimal")
    }
    else if(typeof c == "boolean"){
        c = this.literal(c, "xsd:boolean")
    }
    if(g){
        this.quad(a, b, c, g)
    }
    else {
        this.triple(a, b, c)
    }
}

WOQLQuery.prototype.link = function(a, b, c, g) {
    if(typeof c == "string"){
        c = this.iri(c)
    }
    if(g){
        this.quad(a, b, c, g)
    }
    else {
        this.triple(a, b, c)
    }
}


WOQLQuery.prototype.graph = function(g) {
    return this._set_context({graph: g})
}

WOQLQuery.prototype.domain = function(d) {
    d = this.cleanClass(d)
    return this._add_partial(false, 'rdfs:domain', d)
}

WOQLQuery.prototype.label = function(l, lang) {
    lang = lang ? lang : 'en'
    if (l.substring(0, 2) == 'v:') {
        var d = l
    } else {
        var d = {'@value': l, '@type': 'xsd:string', '@language': lang}
    }
    return this._add_partial(false, 'rdfs:label', d)
}

WOQLQuery.prototype.description = function(c, lang) {
    lang = lang ? lang : 'en'
    if (c.substring(0, 2) == 'v:') {
        var d = c
    } else {
        var d = {'@value': c, '@type': 'xsd:string', '@language': lang}
    }
    return this._add_partial(false, 'rdfs:comment', d)
}

/**
 * Specifies that a new class should have parents class
 * @param {array} parentList the list of parent class []
 *
 */
WOQLQuery.prototype.parent = function(...parentList) {
    for (var i = 0; i < parentList.length; i++) {
        var pn = this.cleanClass(parentList[i])
        this._add_partial(false, 'rdfs:subClassOf', pn)
    }
    return this
}

WOQLQuery.prototype.max = function(m) {
    this._card(m, 'max')
    return this
}

WOQLQuery.prototype.cardinality = function(m) {
    this._card(m, 'cardinality')
    return this
}

WOQLQuery.prototype.min = function(m) {
    this._card(m, 'min')
    return this
}

/**
 * Adds partially specified triples / quads as used in add_class, add_property, property, label, etc
 */
WOQLQuery.prototype._add_partial = function(s, p, o, g) {
    let ctxt = this.triple_builder_context || {}
    s = s || ctxt.subject
    g = g || ctxt.graph
    let lastsubj = this.findLastSubject(this.cursor)
    if (lastsubj && !s) s = lastsubj['woql:subject']
    let t = ctxt.action || lastsubj['@type']
    if (!g) {
        const gobj = lastsubj['woql:graph_filter'] || lastsubj['woql:graph']
        g = gobj ? gobj['@value'] : "schema/main"
    }
    if (t == 'woql:AddTriple') this.and(new WOQLQuery().add_triple(s, p, o))
    else if (t == 'woql:DeleteTriple') this.and(new WOQLQuery().delete_triple(s, p, o))
    else if (t == 'woql:AddQuad') this.and(new WOQLQuery().add_quad(s, p, o, g))
    else if (t == 'woql:DeleteQuad') this.and(new WOQLQuery().delete_quad(s, p, o, g))
    else if (t == 'woql:Quad') this.and(new WOQLQuery().quad(s, p, o, g))
    else this.and(new WOQLQuery().triple(s, p, o))
    return this
}

/**
 * Called to indicate that a add class chain has started
 * needed to ensure that we maintain a second state (class) as well as a property state
 */
WOQLQuery.prototype._adding_class = function(string_only) {
    if (this.triple_builder_context) {
        let x = this.triple_builder_context['adding_class']
        if (x && string_only && typeof x == 'object') return x['woql:node']
        return x
    }
    return false
}

WOQLQuery.prototype._set_adding_class = function(c) {
    if (!this.triple_builder_context) this.triple_builder_context = {}
    this.triple_builder_context['adding_class'] = c
    return this
}

/**
 * Sets the internal context for triple building functions
 */
WOQLQuery.prototype._set_context = function(ctxt) {
    if (!this.triple_builder_context) this.triple_builder_context = {}
    for (var k in ctxt) {
        this.triple_builder_context[k] = ctxt[k]
    }
    return this
}

/**
 * gets the object (value) for a triple earlier in the query that has a specific subject and predicate
 * used to find the class that a property cardinality restriction is applied to
 */
WOQLQuery.prototype._get_object = function(s, p) {
    if (this.cursor['@type'] == 'woql:And') {
        for (var i = 0; i < this.cursor['woql:query_list'].length; i++) {
            let subq = this.cursor['woql:query_list'][i]['woql:query']
            if (
                this._same_entry(subq['woql:subject'], s) &&
                this._same_entry(subq['woql:predicate'], p)
            )
                return subq['woql:object']
        }
    }
    return false
}

WOQLQuery.prototype._same_entry = function(a, b) {
    if (a == b) return true
    if (typeof a == 'object' && typeof b == 'string') {
        return this._string_matches_object(b, a)
    }
    if (typeof b == 'object' && typeof a == 'string') {
        return this._string_matches_object(a, b)
    }
    if (typeof a == 'object' && typeof b == 'object') {
        for (var k in a) {
            if (!b[k] || a[k] != b[k]) return false
        }
        for (var k in b) {
            if (!a[k] || a[k] != b[k]) return false
        }
        return true
    }
}

/**
 * Checks to see if a string and a node / datatype / variable are in fact the same
 */
WOQLQuery.prototype._string_matches_object = function(s, o) {
    if (o['woql:node']) return s == o['woql:node']
    if (o['@value']) return s == o['@value']
    if (o['woql:variable_name']) return s == 'v:' + o['woql:variable_name']['@value']
    return false
}

WOQLQuery.prototype._card = function(n, which) {
    //need to generate a new id for the cardinality restriction object
    //and point it at the property in question via the onProperty function
    let ctxt = this.triple_builder_context || {}
    let s = ctxt.subject
    let g = ctxt.graph
    let lastsubj = this.findLastProperty(this.cursor)
    if (lastsubj && !s) s = lastsubj['woql:subject']
    if (typeof s == 'object') {
        if (s['woql:node']) s = s['woql:node']
        else return
    }
    if (lastsubj && !g) {
        const gobj = lastsubj['woql:graph_filter'] || lastsubj['woql:graph']
        g = gobj ? gobj['@value'] : false
    }
    let newid = s + '_' + which + '_' + n
    this.and(
        new WOQLQuery()
            .add_quad(newid, 'type', 'owl:Restriction', g)
            .add_quad(newid, 'owl:onProperty', s, g)
    )
    switch (which) {
        case 'max':
            this.and(
                new WOQLQuery().add_quad(
                    newid,
                    'owl:maxCardinality',
                    {'@value': n, '@type': 'xsd:nonNegativeInteger'},
                    g,
                ),
            )
            break
        case 'min':
            this.and(
                new WOQLQuery().add_quad(
                    newid,
                    'owl:minCardinality',
                    {'@value': n, '@type': 'xsd:nonNegativeInteger'},
                    g,
                ),
            )
            break
        default:
            this.and(
                new WOQLQuery().add_quad(
                    newid,
                    'owl:cardinality',
                    {'@value': n, '@type': 'xsd:nonNegativeInteger'},
                    g,
                ),
            )
    }
    //then make the domain of the property into a subclass of the restriction
    let od = this._get_object(s, 'rdfs:domain')
    if (od) {
        this.and(new WOQLQuery().add_quad(od, 'subClassOf', newid, g))
    }    
    return this
}

