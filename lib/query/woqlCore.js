const UTILS = require('../utils');
const WOQLPrinter = require("./woqlPrinter")

function WOQLQuery(query){
    this.query = (query ? query : {});
    this.errors = [];
	this.cursor = this.query;
	this.chain_ended = false;
	this.contains_update = false;
	// operators which preserve global paging
	this.paging_transitive_properties = ['select', 'from', 'start', 'when', 'opt', 'limit'];
	this.vocab = this.loadDefaultVocabulary();
	//object used to accumulate triples from fragments to support usage like node("x").label("y");
	this.tripleBuilder = false;
	return this;
}


WOQLQuery.prototype.parameterError = function(msg){
    this.errors.push({"type": this.cursor['@type'], "message": msg})
    return this
}

WOQLQuery.prototype.hasErrors = function(){
    return (this.errors.length > 0)
}

/**
 * Internal library function which adds a subquery and sets the cursor
 */
WOQLQuery.prototype.addSubQuery = function(Subq){
	if(Subq) {
		this.cursor['woql:query'] = this.jobj(Subq)
	}
	else {
		var nv = {}
		this.cursor['woql:query'] = nv
		this.cursor = nv
	}
	return this
}

/**
 * Called to inidicate that this query will cause an update to the DB
 */
WOQLQuery.prototype.updated = function(){
	this.contains_update = true;
	return this;
}

/**
 * A bunch of internal functions for formatting values for JSON-LD translation
 */

/**
 * Wraps the passed value in a json-ld literal carriage
 */
WOQLQuery.prototype.jlt = function(val, type){
	if(!type) type = "xsd:string"
	else type = (type.indexOf(":") == -1 ? "xsd:" + type : type);
	return {"@type": type, "@value": val }
}

WOQLQuery.prototype.varj = function(varb){
	if(varb.substring(0, 2) == "v:") varb = varb.substring(2)
	if(typeof varb == "string") return {"@type": "woql:Variable", "woql:variable_name": {"@value": varb, "@type": "xsd:string" }}
	return varb
}

/**
 * Transforms a json representation of a query into a javascript query object if needs be
 */
WOQLQuery.prototype.jobj = function(qobj){
	if(qobj.json){
		return qobj.json();
	}
	return qobj
	//return new WOQLQuery.json(qobj);
}

WOQLQuery.prototype.asv = function(colname_or_index, vname, type){
	let asvar = { }
	if(typeof colname_or_index == "number"){
		asvar["@type"] = "woql:IndexedAsVar"
		asvar['woql:index'] = this.jlt(colname_or_index, "xsd:nonNegativeInteger")
	}
	else if(typeof colname_or_index == "string"){
		asvar["@type"] = "woql:NamedAsVar"
		asvar['woql:identifier'] = this.jlt(colname_or_index)
	}
	asvar["woql:variable_name"] = vname
	if(type) asvar["woql:var_type"] = this.jlt(type, "xsd:anyURI")
	return asvar
}

WOQLQuery.prototype.addASV = function(cursor, asv){
	if(asv["@type"] == "woql:IndexedAsVar"){
		if(!cursor['woql:indexed_as_var']) cursor['woql:indexed_as_var'] = []
		cursor['woql:indexed_as_var'].push(asv)
	}
	else {
		if(!cursor['woql:named_as_var']) cursor['woql:named_as_var'] = []
		cursor['woql:named_as_var'].push(asv)
	}
}


/**
 * JSON LD Format Descriptor
 */
WOQLQuery.prototype.wform = function(opts){
	if(opts && opts.format){
		this.cursor['woql:format'] = {
			"@type": "woql:Format",
			"woql:format_type": {"@value": opts.format, "@type": "xsd:string"},
		}
		if(opts.format_header){
			this.cursor['woql:format']["woql:format_header"] = {
				"@value": true, 
				"@type": "xsd:boolean"
			}
		}
	}
	return this
}

//arithmetic operators
WOQLQuery.prototype.arop = function (arg) {
	if(typeof arg == "object"){
		return (arg.json ? arg.json() : arg)
	}
	return {
		"@type": "woql:ArithmeticValue",
		"woql:arithmetic_value": this.cleanObject(arg, "xsd:decimal")
	}
}

WOQLQuery.prototype.vlist = function(list){
	let vobj = {
		"@type": "woql:ValueList",
		"woql:value_list_element": []
	}
	if(typeof list == "string"){
		list = [list]
	}
	for(var i = 0 ; i<list.length; i++){
		let co = this.cleanObject(list[i])
		co["@type"] = "woql:ValueListElement"
		co["woql:index"] = this.jlt(i, "xsd:nonNegativeInteger`")
		vobj["woql:value_list_element"].push(co)
	}
	return vobj
}


/**
 * takes input that can be either a string (variable name)
 * or an array - each element of the array is a member of the list
 */
WOQLQuery.prototype.wlist  = function(wvar){
	if(typeof wvar == "string") return this.expandVariable(wvar, true) 
	if(Array.isArray(wvar)){
		let ret = { "@type": "woql:Array", "woql:array_element": []}
		for(var i = 0; i<wvar.length; i++){
			let co = this.cleanObject(wvar[i])
			co["@type"] = "woql:ArrayElement"
			co["woql:index"] = this.jlt(i, "xsd:nonNegativeInteger`")
			ret["woql:array_element"].push(co)
		}
		return ret;
	}
}

/**
 * Query List Element Constructor
 */
WOQLQuery.prototype.qle  = function(query, i){
	let qobj = this.jobj(query)
	return { 
		"@type": "woql:QueryListElement", 
		"woql:index" : this.jlt(i, "nonNegativeInteger"),
		"woql:query" : qobj
	}	
}
	

/**
 * Transforms whatever is passed in as the subject into a anyURI structure
 */
WOQLQuery.prototype.cleanSubject = function(s){
    let subj = false; 
    if(typeof s == "object") {
		return s;
	}
	else if(typeof s == "string"){
		if(s.indexOf(":") != -1) subj = s;
		else if(this.vocab && this.vocab[s]) subj = this.vocab[s];
		else subj = "doc:" + s;
		return this.expandVariable(subj)
	}
	this.parameterError("Subject must be a URI string")
	return "" + s
}

/**
 * Transforms whatever is passed in as the subject into a anyURI structure
 */
WOQLQuery.prototype.cleanPredicate = function(p){
	let pred = false; 
	if(typeof p == "object") return p
    if(typeof p != "string") {
		this.parameterError("Predicate must be a URI string")
		return "" + p
    }
	if(p.indexOf(":") != -1) pred = p;
	else if(this.vocab && this.vocab[p]) pred = this.vocab[p];
	else pred = "scm:" + p;
	return this.expandVariable(pred)
}

/**
 * Objects can be literals or IDs 
 */
WOQLQuery.prototype.cleanObject = function(o, t){
    let obj = {"@type": "woql:DatatypeOrID"}
    if(typeof o == "string"){
        if(o.indexOf(":") !== -1){
            obj['woql:node'] = this.cleanClass(o) 
        }
        else if(this.vocab && this.vocab[o]){
            obj['woql:node'] = this.cleanClass(this.vocab[o])
        }
        else {
            obj['woql:value'] = this.jlt(o, t)
        }
    }
    else if(typeof o == "object"){
        obj['woql:value'] = o
	}
	else if(typeof o == "number"){
		t = t || "xsd:decimal"
		obj['woql:value'] = this.jlt(o, t)
	}
    return obj
}

WOQLQuery.prototype.cleanGraph = function(g){
    if(this.vocab && this.vocab[g]) g = this.vocab[g]
    return {"@type": "xsd:string", "@value": g}
}

WOQLQuery.prototype.expandVariable = function(varname, always){
	if(varname.substring(0, 2) == "v:" || always){
		if(varname.substring(0, 2) == "v:") varname = varname.substring(2) 
		return {
			"@type": "woql:Variable", 
			"woql:variable_name": {
				"@value": varname, 
				"@type": "xsd:string"
			}
		}
	}
	return varname
}


WOQLQuery.prototype.cleanClass = function(c){
	if(typeof c != "string") return "";
	if(c.indexOf(":") == -1) {
        if(this.vocab && this.vocab[c]) c = this.vocab[c]
        else c = "scm:" + c
	}
	return this.expandVariable(c)
}

WOQLQuery.prototype.cleanType = function(t){
    return this.cleanClass(t)
}

WOQLQuery.prototype.defaultContext = function(DB_IRI){
	let def = {}
	for(var pref in UTILS.standard_urls){
		def[pref] = UTILS.standard_urls[pref];
	}
	def.scm = DB_IRI + "/schema#"
	def.doc = DB_IRI + "/document/"
	def.db = DB_IRI + "/";
	return def;
}

/**
 * Retrieves the value of the current json-ld context
 */
WOQLQuery.prototype.getContext = function(q){
	q = (q ? q : this.query);
	for (const prop of Object.keys(q)) {
		if(prop == "@context") return q[prop];
		if(this.paging_transitive_properties.indexOf(prop) !== -1){
			var nq = q[prop][1];
			var nc = this.getContext(nq);
			if(nc) return nc;
		}
	}
}


/**
 * Retrieves the value of the current json-ld context
 */
WOQLQuery.prototype.context = function(c){
	this.cursor['@context'] = c;
}


WOQLQuery.prototype.loadDefaultVocabulary = function(){
	var vocab = {};
	vocab.type = "rdf:type";
	vocab.label = "rdfs:label";
	vocab.Class = "owl:Class";
	vocab.DatatypeProperty = "owl:DatatypeProperty";
	vocab.ObjectProperty = "owl:ObjectProperty";
	vocab.Document = "terminus:Document";
	vocab.abstract = "terminus:abstract";
	vocab.comment = "rdfs:comment";
	vocab.range = "rdfs:range";
	vocab.domain = "rdfs:domain";
	vocab.subClassOf = "rdfs:subClassOf";
	vocab.string = "xsd:string";
	vocab.integer = "xsd:integer";
	vocab.decimal = "xsd:decimal";
	vocab.email = "xdd:email";
	vocab.json = "xdd:json";
	vocab.dateTime = "xsd:dateTime";
	vocab.date = "xsd:date";
	vocab.coordinate = "xdd:coordinate";
	vocab.line = "xdd:coordinatePolyline";
	vocab.polygon = "xdd:coordinatePolygon";
	return vocab;
}


/**
 * Provides the query with a 'vocabulary' a list of well known predicates that can be used without prefixes mapping: id: prefix:id ...
 */
WOQLQuery.prototype.setVocabulary = function(vocab){
	this.vocab = vocab;
}

WOQLQuery.prototype.getVocabulary = function(vocab){
	return this.vocab;
}

/**
 * Queries the schema graph and loads all the ids found there as vocabulary that can be used without prefixes
 * ignoring blank node ids
 */
WOQLQuery.prototype.loadVocabulary = function(client){
	var nw = new WOQLQuery().quad("v:S", "v:P", "v:O", "db:schema");
	nw.execute(client).then( (result) => {
		if(result.bindings && result.bindings.length > 0){
			for(var i = 0; i<result.bindings.length; i++){
				for(var k in result.bindings[i]){
					var v = result.bindings[i][k]
					if(typeof v == "string"){
						var spl = v.split(":");
						if(spl.length == 2 && spl[1] && spl[0] != "_"){
							this.vocab[spl[0]] = spl[1];
						}
					}
				}
			}
		}
	});
}

/**
 * Executes the query using the passed client to connect to a server
 * at the moment we don't use fileList
 *
 */
WOQLQuery.prototype.execute = function(client,jwt,fileList){
	if(!this.query["@context"]){
		this.query['@context'] = client.connection.getJSONContext();
		for(var pref in UTILS.standard_urls){
			if(typeof this.query['@context'][pref] == "undefined")
			this.query['@context'][pref] = UTILS.standard_urls[pref];
		}
	}
	//for owl:oneOf choice lists
	this.query["@context"]["_"] = "_:";		
	var json = this.json();
	return client.query(json,null,null,jwt);			
}


/*
 * json version of query for passing to api
 */
WOQLQuery.prototype.json = function(json){
	if(json){
		this.query = copyJSON(json)
		return this
	}
	return this.query;
}

function copyJSON(orig){
	let nuj = {}
	for(var k in orig){
		let part = orig[k]
		if(Array.isArray(part)){
			let nupart = []
			for(var j = 0; j<part.length; j++){
				if(typeof part[j] == "object"){
					nupart.push(copyJSON(part[j]))
				}
				else {
					nupart.push(part[j])
				}
			}
			nuj[k] = nupart
		}
		else if(typeof part == "object"){
			nuj[k] = copyJSON(part)
		}
		else {
			nuj[k] = part
		}
	}
	return nuj

}


WOQLQuery.prototype.prettyPrint = function(clang){
	clang = clang || "js"
	let printer = new WOQLPrinter(this.vocab, clang)
	return printer.printJSON(this.query)
    //return WOQLPrinter.
}


/**
 * Finds the last woql element that has a woql:subject in it and returns the json for that
 * used for triplebuilder to chain further calls on - when they may be inside ands or ors or subqueries
 * @param {object} json 
 */
WOQLQuery.prototype.findLastSubject = function(json){
	if(json && json['woql:query_list']){
		for(var i = json['woql:query_list'].length-1; i>=0; i--){
			let lqs = this.findLastSubject(json['woql:query_list'][i])
			if(lqs) return lqs
		}
	}
	if(json && json["woql:query"]){
		let ls = this.findLastSubject(json["woql:query"])
		if(ls) return ls
	}
	if(json && json['woql:subject']){
		return json
	}
	return false
}


module.exports = WOQLQuery;
