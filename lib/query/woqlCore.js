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
		if (Subq.contains_update) this.updated();
	}
	else this.cursor['woql:query'] = new WOQLQuery()
	this.cursor = this.cursor['woql:query']
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

/**
 * Transforms a json representation of a query into a javascript query object if needs be
 */
WOQLQuery.prototype.jobj = function(qobj){
	if(qobj.constructor.name == "WOQLQuery"){
		return qobj;
	}
	return new WOQLQuery.json(qobj);
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
			this.cursor['woql:format']["woql:format_header"] = {"@value": opts.format_header, "@type": "xsd:string"}
		}
	}
	return this
}

WOQLQuery.prototype.arop = function (arg) {
	if(typeof arg == "object"){
		return arg
	}
	return {
		"@type": "ArithmeticValue",
		"woql:arithmetic_value": {"@value": arg, "@type": "xsd:decimal"}
	}
}

WOQLQuery.prototype.vlist = function(list){
	let vobj = {
		"@type": "woql:ValueList",
		"woql:value_list_Element": []
	}
	for(var i = 0 ; i<list.length; i++){
		let co = this.cleanObject(list[i])
		co["@type"] = "woql:ValueListElement"
		co["woql:index"] = this.jlt(i, "xsd:nonNegativeInteger`")
		vobj["woql:value_list_Element"].push(co)
	}
	return vobj
}


/**
 * Transforms whatever is passed in as the subject into a anyURI structure
 */
WOQLQuery.prototype.cleanSubject = function(s){
    let subj = false; 
    if(typeof s != "string") {
        this.parameterError("Subject must be a URI string")
        return JSON.stringify(s)        
    }
	if(s.indexOf(":") != -1) subj = s;
	else if(this.vocab && this.vocab[s]) subj = this.vocab[s];
    else subj = "doc:" + s;
    return {"@type": "xsd:anyURI", "@value": subj}
}

/**
 * Transforms whatever is passed in as the subject into a anyURI structure
 */
WOQLQuery.prototype.cleanPredicate = function(p){
    let pred = false; 
    if(typeof p != "string") {
        this.parameterError("Predicate must be a URI string")
        return JSON.stringify(p)        
    }
	if(p.indexOf(":") != -1) pred = p;
	else if(this.vocab && this.vocab[p]) pred = this.vocab[p];
    else pred = "scm:" + p;
    return {"@type": "xsd:anyURI", "@value": pred}
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
    return obj
}

WOQLQuery.prototype.cleanGraph = function(g){
    if(this.vocab && this.vocab[g]) g = this.vocab[g]
    return {"@type": "xsd:string", "@value": g}
}


WOQLQuery.prototype.cleanClass = function(c){
	if(c.indexOf(":") == -1) {
        if(this.vocab && this.vocab[c]) c = this.vocab[c]
        else c = "scm:" + c
    }
    return {"@type": "xsd:anyURI", "@value": c}    	
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
 */
WOQLQuery.prototype.execute = function(client,fileList){
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
	return client.query(json);			
}


/*
 * json version of query for passing to api
 */
WOQLQuery.prototype.json = function(json){
	if(json){
		return this.j2q(json)
	}
	return this.q2j(this.query);
}

/**
 * Turns a query json structure which may contain sub-queries into a json
 */
WOQLQuery.prototype.j2q = function(j){  
    for(var k in j){
        if(["woql:query", "woql:consequent"].indexOf(k) != -1){
            this.cursor[k] = new WOQLQuery().json(j[k])
        }
        else if ( typeof j[k] == "object"){
            let oc = this.cursor
            this.cursor[k] = {}
            this.cursor = this.cursor[k]
            this.j2q(j[k])
            this.cursor = oc
        }
        else {
            this.cursor[k] = j[k]
        }
    }
    return this
}


/**
 * Turns a query json structure which may contain sub-queries into a json
 */
WOQLQuery.prototype.q2j = function(q){
    let mj = {}
    for(var k in q){
        if(q[k].json){
            mj[k] = q[k].json()
        }
        else if(typeof q[k] == "object"){
            mj[k] = this.q2j(q[k])
        }
        else {
            mj[k] = q[k]
        }
    }
    return mj
}

WOQLQuery.prototype.prettyPrint = function(level, cont){
    level = level || 0
    cont = cont || false

}


module.exports = WOQLQuery;
