const WOQLQuery = require('./woqlCore')
const UTILS = require('../utils')
const default_schema_graph = 'schema/main' 
/**
 * The WOQL Schema Class provides pre-built WOQL queries for schema manipulation
 * a) adding and deleting classes and properties
 * b) loading datatype libraries
 * c) boxing classes
 */
function WOQLSchema(g) {
    let graph = g || default_schema_graph
    let n = new WOQLQuery().graph(g)
}

WOQLQuery.prototype._sg = function(g){
    if(g) return g
    if(this.triple_builder_context && this.triple_builder_context.graph) return this.triple_builder_context.graph     
    return default_schema_graph
}

/**
 * Add a class (id c) to the schema
 *
 * @param {string} c - class ID
 * @param {string} [graph] - schema graph identifier
 * @returns WOQLQuery object
 */
WOQLQuery.prototype.add_class = function(c, graph) {
    graph = this._sg(graph)
    if (c) {
        c = this.cleanClass(c, true)
        this.add_quad(c, 'rdf:type', 'owl:Class', graph)
        this._set_adding_class(c)
    }
    return this
}

/**
 * Adds a bunch of class data in one go
 * @param {data} json with id, label, description, parent and properties
 */

WOQLQuery.prototype.insert_class_data = function(data, graph) {
    graph = this._sg(graph)
    if (data.id) {
        c = this.cleanClass(data.id, true)
        this.add_class(c, graph)
        if (data.label) {
            this.label(data.label)
        }
        if (data.description) {
            this.description(data.description)
        }
        if(data.abstract===true){
            this.abstract()
        }
        if (data.parent) {
            if (!Array.isArray(data.parent)) data.parent = [data.parent]
            this.parent(...data.parent)
        }
        for (var k in data) {
            if (['id', 'label', 'description', 'parent'].indexOf(k) == -1) {
                data[k].id = k
                data[k].domain = c
                this.insert_property_data(data[k], graph)
            }
        }
    }
    return this
}

WOQLQuery.prototype.insert_doctype_data = function(data, refGraph) {
    if (!data.parent) data.parent = []
    if (!Array.isArray(data.parent)) data.parent = [data.parent]
    data.parent.push('Document')
    return this.insert_class_data(data, refGraph)
}

/**
 * Add a property to the schema
 *
 * @param {string} p - property ID
 * @param {string} t - property type (range)
 * @param {string} [graph] - graph identifier
 * @returns WOQLQuery object
 */
WOQLQuery.prototype.add_property = function(p, t, graph) {
    graph = this._sg(graph)
    t = t ? this.cleanType(t, true) : 'xsd:string'
    graph = graph || this.graph
    if (p) {
        p = this.cleanPathPredicate(p)
        if (UTILS.TypeHelper.isDatatype(t)) {
            this.and(
                new WOQLQuery().add_quad(p, 'rdf:type', 'owl:DatatypeProperty', graph),
                new WOQLQuery().add_quad(p, 'rdfs:range', t, graph),
            )
        } else {
            this.and(
                new WOQLQuery().add_quad(p, 'rdf:type', 'owl:ObjectProperty', graph),
                new WOQLQuery().add_quad(p, 'rdfs:range', t, graph),
            )
        }
        this.updated()
    }
    return this
}


WOQLQuery.prototype.insert_property_data = function(data, graph) {
    graph = this._sg(graph)
    if (data.id) {
        p = this.cleanPathPredicate(data.id)
        t = data.range ? this.cleanType(data.range, true) : 'xsd:string'
        this.add_property(p, t, graph)
        if (data.label) {
            this.label(data.label)
        }
        if (data.description) {
            this.description(data.description)
        }
        if (data.domain) {
            this.domain(data.domain)
        }
        if (data.max) this.max(data.max)
        if (data.min) this.min(data.min)
        if (data.cardinality) this.cardinality(data.cardinality)
    }
    return this
}

/*Below two probably contain embedded variable names, which should be removed*/

/**
 * Deletes a class from the schema
 *
 * @param {string} c - class ID
 * @param {string} [graph] - schema graph identifier
 * @returns WOQLQuery object
 */
WOQLQuery.prototype.delete_class = function(c, graph, cvar) {
    cvar = cvar || 'v:Class'
    c = this.cleanClass(c, true)
    return this.and(new WOQLQuery().eq(c, cvar), new WOQLQuery()._nuke_schema_element(cvar, graph))
}

/**
 * Removes a property from the schema
 *
 * @param {string} p - property ID
 * @param {string} t - property type (range)
 * @param {string} [graph] - schema graph identifier
 * @returns WOQLQuery object
 */
WOQLQuery.prototype.delete_property = function(p, graph, propvar) {
    propvar = propvar || 'v:Property'
    p = this.cleanClass(p, true)
    return this.and(new WOQLQuery().eq(p, propvar), new WOQLQuery()._nuke_schema_element(propvar, graph))
}

/**
 * Removes an element from the passed graph and all incoming and outgoing references to it -
 * (for schema graph - in data graphs we can just use delete_object(id))
 */
WOQLQuery.prototype._nuke_schema_element = function(elvar, graph) {
    elvar = elvar || 'v:SchemaElement'
    graph = this._sg(graph)
    let outp = elvar + '_pout'
    let outv = elvar + '_vout'
    let inp = elvar + '_pin'
    let ins = elvar + '_sin'
    return this.and(
        new WOQLQuery()
            .opt()
            .and(
                new WOQLQuery().quad(elvar, outp, outv, graph),
                new WOQLQuery().delete_quad(elvar, outp, outv, graph),
            ),
        new WOQLQuery()
            .opt()
            .and(
                new WOQLQuery().quad(ins, inp, elvar, graph),
                new WOQLQuery().delete_quad(ins, inp, elvar, graph),
            ),
    )
}

/**
 * Experimental / Unstable API
 */
WOQLQuery.prototype.genEnum = function(prop, cls, clslabel, clsdesc, graph) {
    clslabel = clslabel || cls
    graph = this._sg(graph)

    let add_class =  new WOQLQuery()
        .add_quad(cls, "type", "owl:Class", graph) 
        .add_quad(cls, "label", clslabel, graph)           
    if(clsdesc){
        add_class.add_quad(cls, "comment", clsdesc, graph)
    }

    this.and(
        new WOQLQuery().select("v:PV").distinct("v:PV").triple("v:A", prop, "v:PV"),
        new WOQLQuery().idgen(cls, ["v:PV"], "v:ChoiceID"),
        add_class,
        new WOQLQuery().add_quad("v:ChoiceID", "type", cls, graph)
            .add_quad("v:ChoiceID", "label", "v:PV", graph)       
    )    
    return this
}

WOQLQuery.prototype.finishEnum = function(client, cls, graph) {
    graph = this._sg(graph)
    let q = new WOQLQuery().quad("v:ChoiceID", "type", cls, graph)
    return client.query(q).then((results) => {
        let ids = []
        for(var i = 0; i< results.bindings.length; i++){
            ids.push(results.bindings[i]["ChoiceID"])
        }
        return client.query(this._oneOfList(cls, ids, graph))
    })
}

WOQLQuery.prototype.makeEnum = function(client, prop, cls, clslabel, clsdesc, graph) {
    client.query(new WOQLQuery().genEnum( prop, cls, clslabel, clsdesc, graph))
    .then(() => new WOQLQuery().finishEnum(client, cls, graph))
    graph = this._sg(graph)
    return new WOQLQuery().quad("v:Choice", "type", cls, graph)
}

//makeEnum(client(), "", "scm:DealType", "Deal Type", "The stage of the deal")

/**
 * Generates a class representing a choice list - an enumerated list of specific options
 * @param {string} cls - the id of the choice list class
 * @param {string} clslabel - the name of the class
 * @param {string} [clsdesc] - description of the class
 * @param {Array} choices - an array of choices, with each entry being an array ["choiceid", "choice label", "choice description"]
 * @param {string} graph - the id of the graph that the choice list will be written to
 * @param {string} parent - the id of a class that this class inherits from (e.g. scm:Enumerated)
 */
WOQLQuery.prototype.generateChoiceList = function(cls, clslabel, clsdesc, choices, graph, parent) {
    graph = this._sg(graph)
    var clist = []
    var listid = '_:' + (cls.indexOf(':') == -1 ? cls : cls.split(':')[1])
    const className=this.cleanClass(cls, true)
    var lastid = listid
    let wq = new WOQLQuery().add_class(className, graph).label(clslabel)
    if (clsdesc) wq.description(clsdesc)
    if (parent) wq.parent(parent)
    var confs = [wq]
    for (var i = 0; i < choices.length; i++) {
        if (!choices[i]) continue
        if (Array.isArray(choices[i])) {
            var chid = choices[i][0]
            var clab = choices[i][1]
            var desc = choices[i][2] || false
        } else {
            var chid = choices[i]
            var clab = UTILS.labelFromURL(chid)
            var desc = false
        }
        let cq = new WOQLQuery().insert(chid, className, graph).label(clab)
        if (desc) cq.description(desc)
        confs.push(cq)
        var nextid = i < choices.length - 1 ? listid + '_' + i : 'rdf:nil'
        clist.push(new WOQLQuery().add_quad(lastid, 'rdf:first', new WOQLQuery().iri(chid), graph))
        clist.push(new WOQLQuery().add_quad(lastid, 'rdf:rest', new WOQLQuery().iri(nextid), graph))
        lastid = nextid
    }
    //do the owl oneof
    let oneof = new WOQLQuery().and(
        new WOQLQuery().add_quad(className, 'owl:oneOf', new WOQLQuery().iri(listid), graph),
        ...clist,
    )
    return this.and(...confs, oneof)
}

WOQLQuery.prototype._oneOfList = function(cls, ids, graph) {
    var listid = '_:' + (cls.indexOf(':') == -1 ? cls : cls.split(':')[1])
    var lastid = listid
    graph = this._sg(graph)
    let clist = []
    for (var i = 0; i < ids.length; i++) {
        var nextid = i < ids.length - 1 ? listid + '_' + i : 'rdf:nil'
        clist.push(new WOQLQuery().add_quad(lastid, 'rdf:first', new WOQLQuery().iri(ids[i]), graph))
        clist.push(new WOQLQuery().add_quad(lastid, 'rdf:rest', new WOQLQuery().iri(nextid), graph))
        lastid = nextid
    }    
    return this.and(
        new WOQLQuery().add_quad(cls, 'owl:oneOf', new WOQLQuery().iri(listid), graph),
        ...clist,
    )
}


WOQLQuery.prototype.deleteChoiceList = function(classId, graph) {
    graph = this._sg(graph)
    return new WOQLQuery().and(
        new WOQLQuery().from(graph).and(
            new WOQLQuery().select("v:Rest")
            .distinct("v:Rest").triple(classId, "owl:oneOf", "v:Clist")
            .path("v:Clist", "rdf:rest+", "v:Entry", "v:Path")
            .or(
                new WOQLQuery().triple("v:Entry", "rdf:first", "v:Rest"),
                new WOQLQuery().triple("v:Clist", "rdf:first", "v:First").eq("v:First", "v:Rest")
            ),
            new WOQLQuery().triple("v:Rest", "v:valprop", "v:valval")
            .triple("v:X", "rdf:first", "v:Rest")
            .triple("v:Y", "rdf:rest", "v:valRest")
            .triple(classId, "v:classProp", "v:classPropVal")
        ),
        new WOQLQuery().delete_quad("v:Rest", "v:valprop", "v:valval", graph)
        .delete_quad("v:X", "rdf:first", "v:Rest", graph)
        .delete_quad("v:Y", "rdf:rest", "v:valRest", graph)
        .delete_quad(classId, "v:classProp", "v:classPropVal", graph)
    )
}

WOQLQuery.prototype.updateChoiceList = function(cls, clslabel, clsdesc, choices, graph) {
    return new WOQLQuery().and(
        new WOQLQuery().opt(new WOQLQuery().deleteChoiceList(cls, graph)),
        new WOQLQuery().generateChoiceList(cls, clslabel, clsdesc, choices, graph)
    )
}

/**
 * Adds the xdd datataypes to the graph
 */
WOQLQuery.prototype.loadXDD = function(graph) {
    graph = this._sg(graph)
    return new WOQLQuery().and(
        //geograhpic datatypes
        this.addDatatype(
            'xdd:coordinate',
            'Coordinate',
            'A latitude / longitude pair making up a coordinate, encoded as: [lat,long]',
            graph,
        ),
        this.addDatatype(
            'xdd:coordinatePolygon',
            'Coordinate Polygon',
            'A JSON list of [[lat,long]] coordinates forming a closed polygon.',
            graph,
        ),
        this.addDatatype(
            'xdd:coordinatePolyline',
            'Coordinate Polyline',
            'A JSON list of [[lat,long]] coordinates interpreted as a .',
            graph,
        ),

        //uncertainty range datatypes
        this.addDatatype(
            'xdd:dateRange',
            'Date Range',
            'A date (YYYY-MM-DD) or an uncertain date range [YYYY-MM-DD1,YYYY-MM-DD2]. ' +
                'Enables uncertainty to be encoded directly in the data',
            graph,
        ),
        this.addDatatype(
            'xdd:decimalRange',
            'Decimal Range',
            'Either a decimal value (e.g. 23.34) or an uncertain range of decimal values ' +
                '(e.g.[23.4, 4.143]. Enables uncertainty to be encoded directly in the data',
            graph,
        ),
        this.addDatatype(
            'xdd:integerRange',
            'Integer Range',
            'Either an integer (e.g. 30) or an uncertain range of integers [28,30]. ' +
                'Enables uncertainty to be encoded directly in the data',
            graph,
        ),
        this.addDatatype(
            'xdd:gYearRange',
            'Year Range',
            'A year (e.g. 1999) or an uncertain range of years: (e.g. [1999,2001]).' +
                'Enables uncertainty to be encoded directly in the data',
            graph,
        ),

        //string refinement datatypes
        this.addDatatype('xdd:email', 'Email', 'A valid email address', graph),
        this.addDatatype('xdd:html', 'HTML', 'A string with embedded HTML', graph),
        this.addDatatype('xdd:json', 'JSON', 'A JSON encoded string', graph),
        this.addDatatype('xdd:url', 'URL', 'A valid http(s) URL', graph),
    )
}

/* utility function for creating a datatype in woql */
WOQLQuery.prototype.addDatatype = function(id, label, descr, graph) {
    graph = this._sg(graph)
    var dt = this.insert(id, 'rdfs:Datatype', graph).label(label)
    if (descr) this.description(descr)
    return dt
}

/**
 * Loads box classes for all of the useful xsd classes the format is to generate the box classes for xsd:anyGivenType
 * as class(prefix:AnyGivenType) -> property(prefix:anyGivenType) -> datatype(xsd:anyGivenType)
 */
WOQLQuery.prototype.loadXSDBoxes = function(parent, graph, prefix) {
    graph = this._sg(graph)
    return this.and(
        this.boxDatatype(
            'xsd:anySimpleType',
            'Any Simple Type',
            'Any basic data type such as string or integer. An xsd:anySimpleType value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:string',
            'String',
            'Any text or sequence of characters',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:boolean',
            'Boolean',
            'A true or false value. An xsd:boolean value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:decimal',
            'Decimal',
            'A decimal number. An xsd:decimal value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:double',
            'Double',
            'A double-precision decimal number. An xsd:double value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:float',
            'Float',
            'A floating-point number. An xsd:float value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:time',
            'Time',
            'A time. An xsd:time value. hh:mm:ss.ssss',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:date',
            'Date',
            'A date. An xsd:date value. YYYY-MM-DD',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:dateTime',
            'Date Time',
            'A date and time. An xsd:dateTime value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:dateTimeStamp',
            'Date-Time Stamp',
            'An xsd:dateTimeStamp value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:gYear',
            'Year',
            'A particular 4 digit year YYYY - negative years are BCE.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:gMonth',
            'Month',
            'A particular month. An xsd:gMonth value. --MM',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:gDay',
            'Day',
            'A particular day. An xsd:gDay value. ---DD',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:gYearMonth',
            'Year / Month',
            'A year and a month. An xsd:gYearMonth value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:gMonthDay',
            'Month / Day',
            'A month and a day. An xsd:gMonthDay value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:duration',
            'Duration',
            'A period of time. An xsd:duration value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:yearMonthDuration',
            'Year / Month Duration',
            'A duration measured in years and months. An xsd:yearMonthDuration value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:dayTimeDuration',
            'Day / Time Duration',
            'A duration measured in days and time. An xsd:dayTimeDuration value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype('xsd:byte', 'Byte', 'An xsd:byte value.', parent, graph, prefix),
        this.boxDatatype('xsd:short', 'Short', 'An xsd:short value.', parent, graph, prefix),
        this.boxDatatype(
            'xsd:integer',
            'Integer',
            'A simple number. An xsd:integer value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype('xsd:long', 'Long', 'An xsd:long value.', parent, graph, prefix),
        this.boxDatatype(
            'xsd:unsignedByte',
            'Unsigned Byte',
            'An xsd:unsignedByte value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:unsignedInt',
            'Unsigned Integer',
            'An xsd:unsignedInt value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:unsignedLong',
            'Unsigned Long Integer',
            'An xsd:unsignedLong value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:positiveInteger',
            'Positive Integer',
            'A simple number greater than 0. An xsd:positiveInteger value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:nonNegativeInteger',
            'Non-Negative Integer',
            "A simple number that can't be less than 0. An xsd:nonNegativeInteger value.",
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:negativeInteger',
            'Negative Integer',
            'A negative integer. An xsd:negativeInteger value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:nonPositiveInteger',
            'Non-Positive Integer',
            'A number less than or equal to zero. An xsd:nonPositiveInteger value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:base64Binary',
            'Base 64 Binary',
            'An xsd:base64Binary value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:anyURI',
            'Any URI',
            'Any URl. An xsd:anyURI value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:language',
            'Language',
            'A natural language identifier as defined by by [RFC 3066] . An xsd:language value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xsd:normalizedString',
            'Normalized String',
            'An xsd:normalizedString value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype('xsd:token', 'Token', 'An xsd:token value.', parent, graph, prefix),
        this.boxDatatype('xsd:NMTOKEN', 'NMTOKEN', 'An xsd:NMTOKEN value.', parent, graph, prefix),
        this.boxDatatype('xsd:Name', 'Name', 'An xsd:Name value.', parent, graph, prefix),
        this.boxDatatype('xsd:NCName', 'NCName', 'An xsd:NCName value.', parent, graph, prefix),
        this.boxDatatype(
            'xsd:NOTATION',
            'NOTATION',
            'An xsd:NOTATION value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype('xsd:QName', 'QName', 'An xsd:QName value.', parent, graph, prefix),
        this.boxDatatype('xsd:ID', 'ID', 'An xsd:ID value.', parent, graph, prefix),
        this.boxDatatype('xsd:IDREF', 'IDREF', 'An xsd:IDREF value.', parent, graph, prefix),
        this.boxDatatype('xsd:ENTITY', 'ENTITY', 'An xsd:ENTITY value.', parent, graph, prefix),
    )
}

/**
 * Generates a query to create box classes for all of the xdd datatypes. the format is to generate the box classes for xdd:anyGivenType
 * as class(prefix:AnyGivenType) -> property(prefix:anyGivenType) -> datatype(xdd:anyGivenType)
 */
WOQLQuery.prototype.loadXDDBoxes = function(parent, graph, prefix) {
    graph = this._sg(graph)
    return new WOQLQuery().and(
        this.boxDatatype(
            'xdd:coordinate',
            'Coordinate',
            'A particular location on the surface of the earth, defined by latitude and longitude . An xdd:coordinate value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xdd:coordinatePolygon',
            'Geographic Area',
            'A shape on a map which defines an area. within the defined set of coordinates   An xdd:coordinatePolygon value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xdd:coordinatePolyline',
            'Coordinate Path',
            'A set of coordinates forming a line on a map, representing a route. An xdd:coordinatePolyline value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype('xdd:url', 'URL', 'A valid url.', parent, graph, prefix),
        this.boxDatatype('xdd:email', 'Email', 'A valid email address.', parent, graph, prefix),
        this.boxDatatype('xdd:html', 'HTML', 'A safe HTML string', parent, graph, prefix),
        this.boxDatatype('xdd:json', 'JSON', 'A JSON Encoded String'),
        this.boxDatatype(
            'xdd:gYearRange',
            'Year',
            'A 4-digit year, YYYY, or if uncertain, a range of years. An xdd:gYearRange value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xdd:integerRange',
            'Integer',
            'A simple number or range of numbers. An xdd:integerRange value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xdd:decimalRange',
            'Decimal Number',
            'A decimal value or, if uncertain, a range of decimal values. An xdd:decimalRange value.',
            parent,
            graph,
            prefix,
        ),
        this.boxDatatype(
            'xdd:dateRange',
            'Date Range',
            'A date or a range of dates YYYY-MM-DD',
            parent,
            graph,
            prefix,
        ),
    )
}

/**
 *  utility function for boxing a datatype in woql
 * format is (predicate) prefix:datatype (domain) prefix:Datatype (range) xsd:datatype
 */
WOQLQuery.prototype.boxDatatype = function(datatype, label, descr, parent, graph, prefix) {
    graph = this._sg(graph)
    prefix = prefix || 'scm:'
    let ext = datatype.split(':')[1]
    let box_class_id = prefix + ext.charAt(0).toUpperCase() + ext.slice(1)
    let box_prop_id = prefix + ext.charAt(0).toLowerCase() + ext.slice(1)
    var box_class = new WOQLQuery().add_class(box_class_id, graph).label(label).description('Boxed Class for ' + datatype)
    if (parent) box_class.parent(parent)
    var box_prop = new WOQLQuery().add_property(box_prop_id, datatype, graph)
        .label(label)
        .domain(box_class_id)
    if (descr) box_prop.description(descr)
    return this.and(box_class, box_prop)
}

/**
 * Called to load Terminus Predefined libraries:
 * options are: xdd: extended datatypes, box: boxed datatypes
 */
WOQLQuery.prototype.libs = function(libs, parent, graph, prefix) {
    var bits = []
    if (libs.indexOf('xdd') != -1) {
        //bits.push(new WOQLQuery().loadXDD(graph))
        if (libs.indexOf('box') != -1) {
            bits.push(new WOQLQuery().loadXDDBoxes(parent, graph, prefix))
            bits.push(new WOQLQuery().loadXSDBoxes(parent, graph, prefix))
        }
    } else if (libs.indexOf('box') != -1) {
        bits.push(new WOQLQuery().loadXSDBoxes(parent, graph, prefix))
    }
    if (bits.length > 1) return this.and(...bits)
    return bits[0]
}



/**
 * This needs to be tested and improved
 *
 * Assumes that classes have the first character capitaised:
 *  e.g. MyClass
 * generates a box around it called Scoped[ClassName]
 * e.g. ScopedMyClass
 * And a property that links them called className (i.e. with lowercase start)
 * e.g. myClass
 *
 * creating a structure ScopedMyClass -> myClass -> MyClass
 *
 * @param {string} prefix - the url prefix that will be used for the boxed types (default scm:)
 * @param {Array} classes - the classes to box - these classes and all their subclasses will have special boxed classes created around them
 * @param {Array} except - the exceptions - these classes and their subclasses will not be boxed, even if they are included in the above array
 * @param {string} graph - the identifier of the graph in which the classes to be boxed live
 *
 */
WOQLQuery.prototype.boxClasses = function(prefix, classes, except, graph) {
    graph = this._sg(graph)
    prefix = prefix || 'scm:'
    var subs = []
    for (var i = 0; i < classes.length; i++) {
        subs.push(new WOQLQuery().sub(classes[i], 'v:Cid'))
    }
    var nsubs = []
    for (var i = 0; i < except.length; i++) {
        nsubs.push(new WOQLQuery().not().sub(except[i], 'v:Cid'))
    }
    //property punning
    //generate a property id that is the same as the classname but starting with a lowercase letter
    let idgens = [
        new WOQLQuery().re('#(.)(.*)', 'v:Cid', ['v:AllB', 'v:FirstB', 'v:RestB']),
        new WOQLQuery().lower('v:FirstB', 'v:Lower'),
        new WOQLQuery().concat(['v:Lower', 'v:RestB'], 'v:Propname'),
        new WOQLQuery().concat(['Scoped', 'v:FirstB', 'v:RestB'], 'v:Cname'),
        new WOQLQuery().concat([prefix, 'v:Cname'], 'v:Class').cast("v:Class", "owl:Thing", "v:ClassID"),
        new WOQLQuery().concat([prefix, 'v:Propname'], 'v:Prop').cast("v:Prop", "owl:Thing", "v:PropID")
    ]
    const filter = new WOQLQuery().and(
        new WOQLQuery().quad('v:Cid', 'rdf:type', 'owl:Class', graph),
        new WOQLQuery().not().quad('v:Cid', 'system:tag', 'system:abstract', graph),
        new WOQLQuery().and(...idgens),
        new WOQLQuery().quad('v:Cid', 'label', 'v:Label', graph),
        new WOQLQuery().concat('Box Class generated for class v:Cid', 'v:CDesc', graph),
        new WOQLQuery().concat(
            'Box Property generated to link box v:Class to class v:Cid',
            'v:PDesc',
            graph,
        ),
    )
    if (subs.length) {
        if (subs.length == 1) filter.and(subs[0])
        else filter.and(new WOQLQuery().or(...subs))
    }
    if (nsubs.length) {
        filter.and(new WOQLQuery().and(...nsubs))
    }
    let cls = new WOQLQuery().graph(graph)
        .add_class('v:ClassID')
        .label('v:Label')
        .description('v:CDesc')
    let prop = new WOQLQuery().graph(graph)
        .add_property('v:PropID', 'v:Cid')
        .label('v:Label')
        .description('v:PDesc')
        .domain('v:ClassID')
    let nq = new WOQLQuery().and(filter, cls, prop)
    return nq.updated()
}


module.exports = WOQLSchema
