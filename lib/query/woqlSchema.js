
/**
 * The WOQL Query object implements the WOQL language via the fluent style
 * @param query - json version of query
 * @returns WOQLQuery object
 */

/**
 * Schema manipulation shorthand
 */
WOQLQuery.prototype.add_class = function(c, graph){
	if(c){
		graph = (graph ? this.cleanGraph(graph) : "db:schema");
		c = (c.indexOf(":") == -1) ? "scm:" + c : c;
		this.adding_class = c;
		this.add_quad(c,"rdf:type","owl:Class",graph);
	}
	return this;
}

WOQLQuery.prototype.add_property = function(p, t, g){
	t = (t ? t : "xsd:string");
	if(p){
		var graph = (g ? this.cleanGraph(g) : "db:schema");
		p = (p.indexOf(":") == -1) ?  "scm:" + p : p;
		t = (t.indexOf(":") == -1) ? this.cleanType(t) : t ;
		var tc = this.cursor;
		var pref = t.split(":");
		if(pref[0] && (pref[0] == "xdd" || pref[0] == "xsd")) {
		    this.and(
				new WOQLQuery().add_quad(p, "rdf:type", "owl:DatatypeProperty", graph),
				new WOQLQuery().add_quad(p, "rdfs:range", t, graph)
			);
		}
		else {
			this.and(
				new WOQLQuery().add_quad(p, "rdf:type", "owl:ObjectProperty", graph),
				new WOQLQuery().add_quad(p, "rdfs:range", t, graph)
			);
		}
	}
	return this.updated();
}

WOQLQuery.prototype.delete_class = function(c, graph){
	if(c){
		graph = (graph ? this.cleanGraph(graph) : "db:schema");
		c = (c.indexOf(":") == -1) ?  "scm:" + c : c;
		return this.and(
			new WOQLQuery().delete_quad(c, "v:All", "v:Al2", graph),
			new WOQLQuery().opt().delete_quad("v:Al3", "v:Al4", c, graph)
		);
	}
	return this;
}

WOQLQuery.prototype.delete_property = function(p, graph){
	if(p){
		graph = (graph ? this.cleanGraph(graph) : "db:schema");
		p = (p.indexOf(":") == -1) ? "scm:" + p : p;
		return this.and(
			new WOQLQuery().delete_quad(p, "v:All", "v:Al2", graph),
			new WOQLQuery().delete_quad("v:Al3", "v:Al4", p, graph)
		);
	}
	return this;
}

//requires classes to have first character capitalised
WOQLQuery.prototype.boxClasses = function(prefix, classes, except, graph){	
	graph = (graph ? this.cleanGraph(graph) : "db:schema");
	prefix = prefix || "scm:";
	var subs = [];
	for(var i = 0; i<classes.length; i++){
		subs.push(new WOQLQuery().sub("v:Cid", this.cleanClass(classes[i])));
	}
	var nsubs = [];
	for(var i = 0; i<except.length; i++){
		nsubs.push(new WOQLQuery().not().sub("v:Cid", this.cleanClass(except[i])));
	}
	//property punning
	//generate a property id that is the same as the classname but starting with a lowercase letter
	let idgens = [
		new WOQLQuery().re("#(.)(.*)", "v:Cid", ["v:AllB", "v:FirstB", "v:RestB"]),
        new WOQLQuery().lower("v:FirstB", "v:Lower"),
        new WOQLQuery().concat(["v:Lower", "v:RestB"], "v:Propname"),
        new WOQLQuery().concat(["Scoped", "v:FirstB", "v:RestB"], "v:Cname"),
        new WOQLQuery().idgen(prefix, ["v:Cname"], "v:ClassID"),
        new WOQLQuery().idgen(prefix, ["v:Propname"], "v:PropID")
	];

    const filter = new WOQLQuery().and(
		new WOQLQuery().quad("v:Cid", "rdf:type", "owl:Class", graph),
		new WOQLQuery().not().abstract("v:Cid", graph),
		new WOQLQuery().or(...subs),
		new WOQLQuery().and(...nsubs),
		new WOQLQuery().and(...idgens),
        new WOQLQuery().quad("v:Cid", "rdfs:label", "v:Label", graph),
		new WOQLQuery().quad("v:Cid", "rdfs:comment", "v:Desc", graph)
    )
    return new WOQLQuery().when(filter, new WOQLQuery().and(
        new WOQLQuery().add_class("v:ClassID")
            .label("v:Label")
            .description("v:Desc"),
		new WOQLQuery().add_property("v:PropID", "v:Cid")
            .label("v:Label")
            .description("v:Desc")
		    .domain("v:ClassID")
    ));
}

WOQLQuery.prototype.generateChoiceList = function(cls, clslabel, clsdesc, choices, graph, parent){
    parent = parent || "scm:Enumerated";
    graph = graph || "db:schema";
    var confs = [
        new WOQLQuery().add_class(cls, graph)
            .label(clslabel)
            .description(clsdesc)
            .parent(parent)
    ]; 
    for(var i = 0; i<choices.length; i++){
        if(!choices[i]) continue;
        confs.push(new WOQLQuery().insert(choices[i][0], cls, graph)
            .label(choices[i][1])
            .description(choices[i][2])
        )
    }
    //generate one of list
    var clist = [];
    var listid = "_:" + cls.split(":")[1];
    var lastid = listid;
    for(var i = 0; i <= choices.length; i++){
        if(!choices[i]) continue;
        var nextid = (i < (choices.length -1) ? listid + "_" + i : "rdf:nil");
        clist.push( new WOQLQuery().add_quad(lastid, "rdf:first", choices[i][0], graph))
        clist.push( new WOQLQuery().add_quad(lastid, "rdf:rest", nextid, graph));
        lastid = nextid;
    }
    //do the owl oneof
    let oneof = new WOQLQuery().and(
        new WOQLQuery().add_quad(cls, "owl:oneOf", listid, graph),
        ...clist
    )
    return new WOQLQuery().and(...confs, oneof);
}


WOQLQuery.prototype.libs = function(...libs){
	var bits = [];
	if(libs.indexOf("xdd") != -1){
		bits.push(this.loadXDD());
		if(libs.indexOf("box") != -1) {
			bits.push(this.loadXDDBoxes());
			bits.push(this.loadXSDBoxes());
		}
	}
	else if(libs.indexOf("box") != -1){
		bits.push(this.loadXSDBoxes());
	}
	if(bits.length > 1) return new WOQLQuery().and(...bits);
	return bits[0];
}

WOQLQuery.prototype.loadXDD = function(graph){
	return new WOQLQuery().and(
		//geograhpic datatypes
		this.addDatatype("xdd:coordinate", "Coordinate", 
			"A latitude / longitude pair making up a coordinate, encoded as: [lat,long]", graph),
		this.addDatatype("xdd:coordinatePolygon", "Coordinate Polygon", 
			"A JSON list of [[lat,long]] coordinates forming a closed polygon.", graph),
		this.addDatatype("xdd:coordinatePolyline", "Coordinate Polyline", 
			"A JSON list of [[lat,long]] coordinates.", graph),
		
		//uncertainty range datatypes
		this.addDatatype("xdd:dateRange", "Date Range", 
			`A date (YYYY-MM-DD) or an uncertain date range [YYYY-MM-DD1,YYYY-MM-DD2]. 
			Enables uncertainty to be encoded directly in the data`, graph),
		this.addDatatype("xdd:decimalRange", "Decimal Range", 
			`Either a decimal value (e.g. 23.34) or an uncertain range of decimal values 
			(e.g.[23.4, 4.143]. Enables uncertainty to be encoded directly in the data`),
		this.addDatatype("xdd:integerRange", "Integer Range", 
			`Either an integer (e.g. 30) or an uncertain range of integers [28,30]. 
			Enables uncertainty to be encoded directly in the data`, graph),
		this.addDatatype("xdd:gYearRange", "Year Range", 
			`A year (e.g. 1999) or an uncertain range of years: (e.g. [1999,2001]). 
			Enables uncertainty to be encoded directly in the data`, graph),
	
		//string refinement datatypes
		this.addDatatype("xdd:email", "Email", "A valid email address", graph),
		this.addDatatype("xdd:html", "HTML", "A string with embedded HTML", graph),
		this.addDatatype("xdd:json", "JSON", "A JSON encoded string", graph),
		this.addDatatype("xdd:url", "URL", "A valid http(s) URL", graph)
	)
}

WOQLQuery.prototype.loadXSDBoxes = function(){
	return new WOQLQuery().and(
		this.boxDatatype("xsd:anySimpleType", "Any Simple Type", "Any basic data type such as string or integer. An xsd:anySimpleType value."),
		this.boxDatatype("xsd:string", "String", "Any text or sequence of characters"),
		this.boxDatatype("xsd:boolean", "Boolean", "A true or false value. An xsd:boolean value."),
	   	this.boxDatatype("xsd:decimal", "Decimal", "A decimal number. An xsd:decimal value."),
	   	this.boxDatatype("xsd:double",  "Double", "A double-precision decimal number. An xsd:double value."),
	   	this.boxDatatype("xsd:float", "Float", "A floating-point number. An xsd:float value."),
	   	this.boxDatatype("xsd:time", "Time", "A time. An xsd:time value. hh:mm:ss.ssss"),
	   	this.boxDatatype("xsd:date", "Date", "A date. An xsd:date value. YYYY-MM-DD"),
		this.boxDatatype("xsd:dateTime", "Date Time", "A date and time. An xsd:dateTime value."),
		this.boxDatatype("xsd:dateTimeStamp", "Date-Time Stamp", "An xsd:dateTimeStamp value."),
		this.boxDatatype("xsd:gYear", "Year", " A particular 4 digit year YYYY - negative years are BCE."),
		this.boxDatatype("xsd:gMonth", "Month", "A particular month. An xsd:gMonth value. --MM"),
		this.boxDatatype("xsd:gDay", "Day", "A particular day. An xsd:gDay value. ---DD"),
		this.boxDatatype("xsd:gYearMonth", "Year / Month", "A year and a month. An xsd:gYearMonth value."),
		this.boxDatatype("xsd:gMonthDay", "Month / Day", "A month and a day. An xsd:gMonthDay value."),
		this.boxDatatype("xsd:duration", "Duration", "A period of time. An xsd:duration value."),
		this.boxDatatype("xsd:yearMonthDuration", "Year / Month Duration", "A duration measured in years and months. An xsd:yearMonthDuration value."),
		this.boxDatatype("xsd:dayTimeDuration", "Day / Time Duration", "A duration measured in days and time. An xsd:dayTimeDuration value."),
		this.boxDatatype("xsd:byte", "Byte", "An xsd:byte value."),
		this.boxDatatype("xsd:short", "Short", "An xsd:short value."),
		this.boxDatatype("xsd:integer", "Integer", "A simple number. An xsd:integer value."),
		this.boxDatatype("xsd:long", "Long", "An xsd:long value."),
		this.boxDatatype("xsd:unsignedByte", "Unsigned Byte", "An xsd:unsignedByte value."),
		this.boxDatatype("xsd:unsignedInt", "Unsigned Integer", "An xsd:unsignedInt value."),
		this.boxDatatype("xsd:unsignedLong", "Unsigned Long Integer", "An xsd:unsignedLong value."),
		this.boxDatatype("xsd:positiveInteger", "Positive Integer", "A simple number greater than 0. An xsd:positiveInteger value."),
		this.boxDatatype("xsd:nonNegativeInteger", "Non-Negative Integer", "A simple number that can't be less than 0. An xsd:nonNegativeInteger value."),
		this.boxDatatype("xsd:negativeInteger", "Negative Integer", "A negative integer. An xsd:negativeInteger value."),
		this.boxDatatype("xsd:nonPositiveInteger", "Non-Positive Integer", "A number less than or equal to zero. An xsd:nonPositiveInteger value."),
		this.boxDatatype("xsd:base64Binary", "Base 64 Binary","An xsd:base64Binary value."),
		this.boxDatatype("xsd:anyURI", "Any URI", "Any URl. An xsd:anyURI value."),
		this.boxDatatype("xsd:language", "Language", "A natural language identifier as defined by by [RFC 3066] . An xsd:language value."),
		this.boxDatatype("xsd:normalizedString", "Normalized String", "An xsd:normalizedString value."),
		this.boxDatatype("xsd:token", "Token", "An xsd:token value."),
		this.boxDatatype("xsd:NMTOKEN", "NMTOKEN", "An xsd:NMTOKEN value."),
		this.boxDatatype("xsd:Name", "Name", "An xsd:Name value."),
		this.boxDatatype("xsd:NCName", "NCName", "An xsd:NCName value."),
		this.boxDatatype("xsd:NOTATION", "NOTATION", "An xsd:NOTATION value."),
		this.boxDatatype("xsd:QName", "QName", "An xsd:QName value."),
		this.boxDatatype("xsd:ID", "ID", "An xsd:ID value."),
		this.boxDatatype("xsd:IDREF", "IDREF", "An xsd:IDREF value."),
		this.boxDatatype("xsd:ENTITY", "ENTITY", "An xsd:ENTITY value."),
		//this.boxDatatype("rdf:XMLLiteral", "XML Literal", "An rdf:XMLLiteral value."),
		//this.boxDatatype("rdf:PlainLiteral", "Plain Literal", "An rdf:PlainLiteral value."),
		//this.boxDatatype("rdfs:Literal", "Literal", "An rdfs:Literal value.")	
	)
}

WOQLQuery.prototype.loadXDDBoxes = function(){
	return new WOQLQuery().and(
		this.boxDatatype("xdd:coordinate", "Coordinate", "A particular location on the surface of the earth, defined by latitude and longitude . An xdd:coordinate value."),
		this.boxDatatype("xdd:coordinatePolygon", "Geographic Area", "A shape on a map which defines an area. within the defined set of coordinates   An xdd:coordinatePolygon value."),
		this.boxDatatype("xdd:coordinatePolyline", "Coordinate Path", "A set of coordinates forming a line on a map, representing a route. An xdd:coordinatePolyline value."),
		this.boxDatatype("xdd:url", "URL", "A valid url."),
		this.boxDatatype("xdd:email", "Email", "A valid email address."), 
		this.boxDatatype("xdd:html", "HTML", "A safe HTML string"), 
		this.boxDatatype("xdd:json", "JSON", "A JSON Encoded String"), 
		this.boxDatatype("xdd:gYearRange", "Year", "A 4-digit year, YYYY, or if uncertain, a range of years. An xdd:gYearRange value."), 
		this.boxDatatype("xdd:integerRange", "Integer", "A simple number or range of numbers. An xdd:integerRange value."), 
		this.boxDatatype("xdd:decimalRange", "Decimal Number", "A decimal value or, if uncertain, a range of decimal values. An xdd:decimalRange value."), 
		this.boxDatatype("xdd:dateRange", "Date Range","A date or a range of dates YYYY-MM-DD")
	)
}

/* utility function for creating a datatype in woql */
WOQLQuery.prototype.addDatatype = function(id, label, descr, graph){
	graph = graph || "db:schema";
	var dt = new WOQLQuery().insert(id, "rdfs:Datatype", graph).label(label);
	if(descr) dt.description(descr);
	return dt;
}

/* utility function for creating a datatype in woql */
WOQLQuery.prototype.boxDatatype = function(datatype, label, descr, graph, prefix){
	graph = graph || "db:schema";
	prefix = prefix || "scm:";
	let ext = datatype.split(":")[1];
	let box_class_id = prefix + ext.charAt(0).toUpperCase() + ext.slice(1);
	let box_prop_id = prefix + ext.charAt(0).toLowerCase() + ext.slice(1);
	var box_class = new WOQLQuery().add_class(box_class_id).label(label).parent("scm:Box");
	if(descr) box_class.description(descr);
	var box_prop = new WOQLQuery().add_property(box_prop_id, datatype).label(label).domain(box_class_id)
	if(descr) box_prop.description(descr);
	return WOQL.and(box_class, box_prop);
}


