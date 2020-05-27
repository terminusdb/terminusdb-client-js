const WOQLQuery = require('./woqlCore');
const WOQLSchema = require('./woqlSchema')
const WOQLLibrary = require("./woqlLibrary")


WOQLQuery.prototype.star = function(Graph, Subj, Pred, Obj){
	Subj = Subj || "v:Subject"
	Pred = Pred || "v:Predicate"
	Obj = Obj  ||  "v:Object"
	Graph = Graph || false;
	if(Graph){
		return this.quad(Subj, Pred, Obj, Graph);
	}
	else {
		return this.triple(Subj, Pred, Obj);
	}
}

WOQLQuery.prototype.lib = function(){
    return new WOQLLibrary()
}


/**
 * Internal Triple-builder functions which allow chaining of partial queries
 */


WOQLQuery.prototype.lib = function(){
    return new WOQLLibrary()
}


WOQLQuery.prototype.abstract = function(graph, subj){
    if(!this.tripleBuilder) this.createTripleBuilder(subj)
	this.tripleBuilder.addPO("terminus:tag", "terminus:abstract", graph);
	return this;
}


WOQLQuery.prototype.node = function(node, type){
	if(!this.tripleBuilder) this.createTripleBuilder(node, type)
	this.tripleBuilder.subject = node
	return this;
}

/**
 * Add a property at the current class/document
 * 
 * @param {string} proId - property ID
 * @param {string} type  - property type (range) 
 * @returns WOQLQuery object
 *
 * A range could be another class/document or an "xsd":"http://www.w3.org/2001/XMLSchema#" type 
 * like string|integer|datatime|nonNegativeInteger|positiveInteger etc ..
 * (you don't need the prefix xsd for specific a type)
 */

WOQLQuery.prototype.property = function(proId,type){
	if(!this.tripleBuilder) this.createTripleBuilder()
	if(this.adding_class){
		let part = this.findLastSubject(this.cursor)
		let g = false
		let gpart;
		if(part) gpart = part['woql:graph_filter'] || part['woql:graph']
		if(gpart) g = gpart["@value"]
		let nq = new WOQLSchema().add_property(proId, type, g).domain(this.adding_class)
		let combine = new WOQLQuery().json(this.query)
		var nwoql = new WOQLQuery().and(combine, nq)
		nwoql.adding_class = this.adding_class;
		return nwoql.updated();
	}
	else {
		proId = this.cleanPredicate(proId);
		this.tripleBuilder.addPO(proId, type);
	}
	return this;
}

WOQLQuery.prototype.insert = function(id, type, refGraph){
	type = this.cleanType(type, true)
	if(refGraph) {
		return this.add_quad(id, "type", type, refGraph)
	}
	return this.add_triple(id, "type", type)
}

WOQLQuery.prototype.insert_data = function(data, refGraph){
    if(data.type && data.id){
        type = this.cleanType(data.type, true)    
        this.insert(data.id, type, refGraph)
        if(data.label){
            this.label(data.label)
        }
        if(data.description){
            this.description(data.description)
        }
        for(var k in data){
            if(["id", "label", "type", "description"].indexOf(k) == -1){
                this.property(k, data[k])
            }
        }
    }
    return this
}

WOQLQuery.prototype.graph = function(g){
	if(!this.tripleBuilder) this.createTripleBuilder()
	this.tripleBuilder.graph(g);
	return this;
}

WOQLQuery.prototype.domain = function(d){
	if(!this.tripleBuilder) this.createTripleBuilder()
	d = this.cleanClass(d);
 	this.tripleBuilder.addPO('rdfs:domain',d);
	return this;
}

WOQLQuery.prototype.label = function(l, lang){
	if(!this.tripleBuilder) this.createTripleBuilder()
	this.tripleBuilder.label(l, lang);
	return this;
}

WOQLQuery.prototype.description = function(c, lang){
	if(!this.tripleBuilder) this.createTripleBuilder()
	this.tripleBuilder.description(c, lang);
	return this;
}


/**
 * Specifies that a new class should have parents class  
 * @param {array} parentList the list of parent class []
 *
 */
WOQLQuery.prototype.parent = function(...parentList){
	if(!this.tripleBuilder) this.createTripleBuilder()
	for(var i = 0 ; i<parentList.length; i++){
		var pn = this.cleanClass(parentList[i]);
		this.tripleBuilder.addPO('rdfs:subClassOf', pn);
	}
	return this;
}


WOQLQuery.prototype.max = function(m){
	if(this.tripleBuilder) this.tripleBuilder.card(m, "max");
	return this;
}

WOQLQuery.prototype.cardinality = function(m){
	if(this.tripleBuilder) this.tripleBuilder.card(m, "cardinality");
	return this;
}

WOQLQuery.prototype.min = function(m){
	if(this.tripleBuilder) this.tripleBuilder.card(m, "min");
	return this;
}

WOQLQuery.prototype.createTripleBuilder = function(node, type){
	let s = node
	let t = type
	let lastsubj = this.findLastSubject(this.cursor)
	let g = false 
	if(lastsubj){
		const gobj = lastsubj["woql:graph_filter"] || lastsubj["woql:graph"]
		g = (gobj ? gobj["@value"] : false)
		s = lastsubj['woql:subject']	
		t = type || lastsubj["@type"]	
	}	
	if(this.cursor["@type"]){
		let subq = new WOQLQuery().json(this.cursor)
		if(this.cursor["@type"] == "woql:And"){
			var newq = subq
		}
		else {
			var newq = new WOQLQuery().and(subq)
		}
		let nuj = newq.json()
		for(var k in this.cursor){
			delete(this.cursor[k])
		}
		for(var i in nuj){
			this.cursor[i] = nuj[i] 
		}
	}
	else {
		this.and()
    }
	this.tripleBuilder = new TripleBuilder(t, this, s, g)
}

/**
 * @file Triple Builder
 * higher level composite queries - not language or api elements
 * Class for enabling building of triples from pieces
 * type is add_quad / remove_quad / add_triple / remove_triple
 */
function TripleBuilder(type, query, s, g){
	//what accumulation type are we
	if(type && type.indexOf(":") == -1) type = "woql:" + type
	this.type = type;
	this.cursor = query.cursor;
	this.subject = (s ? s : false);
	this.query = query
	this.g = g;
}

TripleBuilder.prototype.label = function(l, lang){
	lang = (lang ? lang : "en");
	if(l.substring(0, 2) == "v:"){
		var d = l;
	}
	else {
		var d = {"@value": l, "@type": "xsd:string", "@language": lang }
	}
	var x = this.addPO('rdfs:label', d);
	return x;
}

TripleBuilder.prototype.graph = function(g){
	this.g = g;
}


TripleBuilder.prototype.description = function(c, lang){
	lang = (lang ? lang : "en");
	if(c.substring(0, 2) == "v:"){
		var d = c;
	}
	else {
		var d = {"@value": c, "@type": "xsd:string", "@language": lang }
	}
	return this.addPO('rdfs:comment', d);
}

TripleBuilder.prototype.addPO = function(p, o, g){
	g = g || this.g
	let newq = false
	if(this.type == "woql:Triple") newq = new WOQLQuery().triple(this.subject, p, o)
	else if(this.type == "woql:AddTriple") newq = new WOQLQuery().add_triple(this.subject, p, o)
	else if(this.type == "woql:DeleteTriple") newq = new WOQLQuery().delete_triple(this.subject, p, o)
	else if(this.type == "woql:Quad") newq = new WOQLQuery().quad(this.subject, p, o, g)
	else if(this.type == "woql:AddQuad") newq = new WOQLQuery().add_quad(this.subject, p, o, g)
	else if(this.type == "woql:DeleteQuad") newq = new WOQLQuery().delete_quad(this.subject, p, o, g)
	else if(g) newq = new WOQLQuery().quad(this.subject, p, o, g)
	else newq = new WOQLQuery().triple(this.subject, p, o)
	this.query.and(newq)
}

TripleBuilder.prototype.getO = function(s, p){
	if(this.cursor['@type'] == "woql:And"){
		for(var i = 0; i<this.cursor['query_list'].length; i++){
			let subq = this.cursor['query_list'][i]["woql:query"];
			if(subq.query["woql:subject"] == s && subq.query["woql:predicate"] == p) return subq.query["woql:object"]
		}
	}
	return false;
}

TripleBuilder.prototype.card = function(n, which){
	let os = this.subject;
	this.subject += "_" + which;
	this.addPO('rdf:type', "owl:Restriction");
	this.addPO("owl:onProperty", os);
	switch(which){
		case "max": this.addPO("owl:maxCardinality", {"@value": n, "@type": "xsd:nonNegativeInteger"});
			break;
		case "min": this.addPO("owl:minCardinality", {"@value": n, "@type": "xsd:nonNegativeInteger"});
			break;
		default: this.addPO("owl:cardinality", {"@value": n, "@type": "xsd:nonNegativeInteger"});
	}
	let od = this.getO(os, "rdfs:domain");
	if(od){
		var cardcls = this.subject;
		this.subject = od;
		this.addPO("rdfs:subClassOf", cardcls);
	}
	this.subject = os;
	return this;
};



