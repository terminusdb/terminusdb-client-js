
/**
 * Internal Triple-builder functions which allow chaining of partial queries
 * 
 * 
 */

WOQLQuery.prototype.node = function(node, type){
	if(!this.tripleBuilder) this.createTripleBuilder(node, type)
	this.tripleBuilder.subject = node
	return this;
}

WOQLQuery.prototype.property = function(p,val){
	if(!this.tripleBuilder) this.createTripleBuilder()
	if(this.adding_class){
		var nwoql = new WOQLquery().and(
			new WOQLquery().add_property(p, val).domain(this.adding_class),
			this
		)
		nwoql.adding_class = this.adding_class;
		return nwoql;
	}
	else {
		p = this.cleanPredicate(p);
		this.tripleBuilder.addPO(p, val);
	}
	return this;
}


WOQLQuery.prototype.insert = function(id, type, g){
	if(g) return this.add_quad(id, "type", type, g)
	return this.add_triple(id, "type", type)
}

WOQLQuery.prototype.graph = function(g){
	if(!this.tripleBuilder) this.createTripleBuilder()
	g = this.cleanGraph(g);
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

WOQLQuery.prototype.parent = function(...p){
	if(!this.tripleBuilder) this.createTripleBuilder()
	for(var i = 0 ; i<p.length; i++){
		var pn = this.cleanClass(p[i]);
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

WOQLQuery.prototype.abstract = function(graph){
	if(!this.tripleBuilder) this.createTripleBuilder()
	this.tripleBuilder.addPO("terminus:tag", "terminus:abstract", graph);
	return this;
}


WOQLQuery.prototype.createTripleBuilder = function(node, type){
	let t = this.cursor["@type"] || type
	if(!t) t = "woql:Triple"
	let subj = node || this.cursor['woql:subject']
	let caller = this.cursor
	let newq = WOQL.and(caller)
	this.cursor = newq.json()
	this.tripleBuilder = new TripleBuilder(t, this, subj)
}

/**
 * @file Triple Builder
 * higher level composite queries - not language or api elements
 * Class for enabling building of triples from pieces
 * type is add_quad / remove_quad / add_triple / remove_triple
 */
function TripleBuilder(type, query, s){
	//what accumulation type are we
	this.type = type;
	this.cursor = query.cursor;
	this.subject = (s ? s : false);
	this.query = query
	this.g = false;
}

TripleBuilder.prototype.label = function(l, lang){
	lang = (lang ? lang : "en");
	if(l.substring(0, 2) == "v:"){
		var d = l;//{"value": l, "@language": lang }
	}
	else {
		var d = {"@value": l, "@language": lang }
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
		var d = {"@value": c, "@language": lang }
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



