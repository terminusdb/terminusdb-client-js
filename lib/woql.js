/**
 * The WOQL object is a wrapper around the WOQL query object
 * Syntactic sugar to allow you to write WOQL.triple()... instead of new WOQLQuery().triple()
 * Every function matches one of the public api functions of the woql query object
 */

const FrameHelper = require('./frameHelper');
const Pattern = require('./framePattern');

const WOQL = {};

/*
 * We expose all the real woql predicates via the WOQL object, 
 * for ease of typing - all return a WOQL query object
 */
WOQL.when = function(Query, Update){ return new WOQLQuery().when(Query, Update);}
WOQL.opt = function(query){ return new WOQLQuery().opt(query); }
WOQL.from = function(dburl, query){ return new WOQLQuery().from(dburl, query); }
WOQL.into = function(dburl, query){ return new WOQLQuery().into(dburl, query); }
WOQL.limit = function(limit, query){ return new WOQLQuery().limit(limit, query); }
WOQL.start = function(start, query){ return new WOQLQuery().start(start, query); }
WOQL.select = function(...list){ return new WOQLQuery().select(...list); }
WOQL.or = function(...queries){	return new WOQLQuery().or(...queries); }
WOQL.and = function(...queries){ return new WOQLQuery().and(...queries); }
WOQL.not = function(query){ return new WOQLQuery().not(query); }
WOQL.triple = function(a, b, c){ return new WOQLQuery().triple(a, b, c); }
WOQL.quad = function(a, b, c, d){ return new WOQLQuery().quad(a, b, c, d); }
WOQL.sub = function(a, b){ return new WOQLQuery().sub(a, b); }
WOQL.isa = function(a, b){	return new WOQLQuery().isa(a, b);	}
WOQL.eq = function(a, b){ return new WOQLQuery().eq(a, b);}
WOQL.trim = function(a, b){	return new WOQLQuery().trim(a, b);	}
WOQL.delete = function(JSON_or_IRI){ return new WOQLQuery().delete(JSON_or_IRI);	}
WOQL.delete_triple = function( S, P, O ){ return new WOQLQuery().delete_triple (S, P, O);	}
WOQL.delete_quad = function( S, P, O, G ){ return new WOQLQuery().delete_quad (S, P, O, G); }
WOQL.add_triple = function( S, P, O ){ return new WOQLQuery().add_triple (S, P, O); }
WOQL.add_quad = function( S, P, O, G ){ 	return new WOQLQuery().add_quad (S, P, O, G);}
WOQL.eval = function(arith, v){	return new WOQLQuery().eval(arith, v);}
WOQL.plus = function(...args){	return new WOQLQuery().plus(...args);}
WOQL.minus = function(...args){	return new WOQLQuery().minus(...args); }
WOQL.times = function(...args){	return new WOQLQuery().times(...args); }
WOQL.divide = function(...args){ return new WOQLQuery().divide(...args); }
WOQL.exp = function(a, b){	return new WOQLQuery().exp(a, b); }

WOQL.get = function(map, target){	return new WOQLQuery().get(map, target); }
WOQL.as = function(map, vari){	return new WOQLQuery().as(map, vari); }
WOQL.remote = function(url){	return new WOQLQuery().remote(url); }
WOQL.unique = function(prefix, vari){	return new WOQLQuery().unique(prefix, vari); }
WOQL.list = function(...vars){	return new WOQLQuery().list(...vars); }
WOQL.group_by = function(...vars){	return new WOQLQuery().group_by(...vars); }
WOQL.update = function(Q){	return new WOQLQuery().update(Q); }


//language extensions that can be chained after 'grounded' stuff (clauses with a specific subject) sub, isa, delete_triple, add_triple, delete_quad, add_quad, node
//WOQL.value = function(vars){	return new WOQLQuery().list(vars); }
//These ones are special ones for dealing with the schema only...
WOQL.addClass = function(classid, graph){	return new WOQLQuery().addClass(classid, graph); }
WOQL.addProperty = function(propid, type, graph){	return new WOQLQuery().addProperty(propid, type, graph); }
WOQL.deleteClass = function(classid, graph){	return new WOQLQuery().deleteClass(classid, graph); }
WOQL.deleteProperty = function(propid, type, graph){	return new WOQLQuery().deleteProperty(propid, type, graph); }
WOQL.node = function(nodeid, type){	return new WOQLQuery().node(nodeid, type); }


/*
 * Beneath here are pseudo predicates - they belong to the javascript object
 * but not to the WOQL language
 */
//returns empty query object
WOQL.query = function(){	return new WOQLQuery(); }
//loads query from json
WOQL.json = function(json){	return new WOQLQuery().json(json); }

WOQL.rule = function(){ return new Pattern.FrameRule(); }
//Simple utility function for typechecking
WOQL.isLiteralType = function(t){
	if(t){
		var pref = t.split(":");
		if(pref[0] == "xdd" || pref[0] == "xsd") return true;
	}
	return false;
}
/**
 * The WOQL Query object implements the WOQL language via the fluent style
 * @param query - json version of query
 * @returns WOQLQuery object
 */
function WOQLQuery(query){
	this.query = (query ? query : {});
	this.cursor = this.query;
	this.chain_ended = false;
	this.contains_update = false;
	//operators which preserve global paging
	this.paging_transitive_properties = ['select', 'from', 'start', 'when', 'opt', 'limit'];
	this.vocab = this.loadDefaultVocabulary();
	//object used to accumulate triples from fragments to support usage like node("x").label("y");
	this.tripleBuilder = false;
	return this;
}

WOQLQuery.prototype.get = function(map, target){
	if(target){
		this.cursor['get'] = [map, target];
	}
	else {
		this.cursor['get'] = [map];
		this.cursor = this.cursor["get"][1];	
	}
	return this;
}

WOQLQuery.prototype.concat = function(list, v){
	this.cursor['concat'] = [list, v];
	return this;
}

WOQLQuery.prototype.lower = function(u, l){
	this.cursor['lower'] = [u, l];
	return this;
}

WOQLQuery.prototype.pad = function(input, pad, len, output){
	this.cursor['pad'] = [input, pad, len, output];
	return this;
}

WOQLQuery.prototype.join = function(...list){
	this.cursor['join'] = list;
	return this;
}


//concat() //"concat" : [{"list" : ["doc:", "v:Polity_Lower"]}, "v:Polity_ID"]},
/**
 * [{"list" : [{"@value" : "[", "@type" : "xsd:string"},
                                      "v:GYear",
                                      {"@value" : ",","@type" : "xsd:string"},
                                      "v:GYear",
                                      {"@value" : "]","@type" : "xsd:string"}]
 */
//lower(v1, v2) ["v:Polity", "v:Polity_Lower"]
//pad(var,pad,len,nvar]) ["v:Year",0,4,"v:GYear"]
//unique(prefix, vars, type)
//group_by
//file
//join(...x)
//{"join" : ["v:Records",
//{"@value" : ",", "@type" : "xsd:string"},
//"v:Coord_String"
//]},

WOQLQuery.prototype.remote = function(json){
	this.cursor['remote'] = [json];
	return this;
}

WOQLQuery.prototype.group_by = function(...grouped){
	var ngs = [];
	for(var i = 0; i<grouped.length; i++){
		ngs.push(grouped[i].json());
	}
	this.cursor['group_by'] = ngs;
	this.cursor = this.cursor["group_by"][ngs.length];	
	return this;
}


WOQLQuery.prototype.unique = function(prefix, vari, type){	
	this.cursor['unique'] = [prefix, vari, type]; 
	return this;
}

WOQLQuery.prototype.list  = function(...vars){	
	this.cursor['list'] = vars;
	return this;
}


/*
 * json version of query for passing to api
 */
WOQLQuery.prototype.json = function(json){
	if(json){
		this.query = json;
		return this;
	}
	return this.query;
}

/*
 * Functions which take a query as an argument advance the cursor to make the chaining of queries fall 
 * into the corrent place in the encompassing json 
 */
WOQLQuery.prototype.when = function(Query, Update){
	if(typeof Query == 'boolean'){
		this.cursor["when"] = [Query];
	}
	else {
		var q = (q.json ? q.json() : q);
		this.advanceCursor("when", q);	
	}
	if(Update){
		var upd = (Update.json ? Update.json() : Update);
		this.cursor["when"][1] = upd;
	}
	else {
		this.cursor["when"][1] = {};
		this.cursor = this.cursor["when"][1];
	}
	return this;
}

WOQLQuery.prototype.opt = function(query){
	if(query){
		var q = ((typeof query.json == "function") ? query.json() : query);
		this.cursor["opt"] = [q];
	}
	else {
		this.cursor['opt'] = [{}];		
		this.cursor = this.cursor["opt"][0];	
	}
	return this;
}

WOQLQuery.prototype.from = function(dburl, query){
	this.advanceCursor("from", dburl);
	if(query){
		this.cursor = query.json();
	}
	return this;
}

WOQLQuery.prototype.into = function(dburl, query){
	this.advanceCursor("into", dburl);
	if(query){
		this.cursor = query.json();
	}
	return this;
}


WOQLQuery.prototype.limit = function(limit, query){
	this.advanceCursor("limit", limit);
	if(query){
		this.cursor = query.json();
	}
	return this;
}

WOQLQuery.prototype.start = function(start, query){
	this.advanceCursor("start", start);
	if(query){
		this.cursor = query.json();
	}
	return this;
}

WOQLQuery.prototype.select = function(...list){
	this.cursor["select"] = list;
	var index = list.length;
	if(typeof this.cursor['select'][index-1] == "object"){
		this.cursor['select'][index-1] = this.cursor['select'][index-1].json(); 
	}
	else {
		this.cursor["select"][index] = {};
		this.cursor = this.cursor["select"][index];	
	}
	return this;
}

WOQLQuery.prototype.and = function(...queries){
	this.cursor["and"] = [];
	for(var i = 0; i<queries.length; i++){
		if(queries[i].contains_update) this.contains_update = true;
		this.cursor['and'].push(queries[i].json());
	}
	return this;
}

WOQLQuery.prototype.or = function(...queries){
	this.cursor["or"] = [];
	for(var i = 0; i<queries.length; i++){
		if(queries[i].contains_update) this.contains_update = true;
		this.cursor['or'].push(queries[i].json());
	}
	return this;
}

WOQLQuery.prototype.not = function(query){
	if(query){
		if(query.contains_update) this.contains_update = true;
		this.cursor["not"] = [query.json()];
	}
	else {
		this.cursor['not'] = [{}];		
		this.cursor = this.cursor["not"][0];	
	}
	return this;
}

WOQLQuery.prototype.triple = function(a, b, c){
	this.cursor["triple"] = [this.cleanSubject(a),this.cleanPredicate(b),this.cleanObject(c)];
	return this.last("triple", this.cleanSubject(a));
}

WOQLQuery.prototype.quad = function(a, b, c, g){
	this.cursor["quad"] = [this.cleanSubject(a),this.cleanPredicate(b),this.cleanObject(c),this.cleanGraph(g)];
	return this.last("quad", this.cleanSubject(a));
}

WOQLQuery.prototype.eq = function(a, b){
	this.cursor["eq"] = [this.cleanObject(a),this.cleanObject(b)];
	return this.last();
}

WOQLQuery.prototype.sub = function(a, b){
	if(!b && this.tripleBuilder){
		this.tripleBuilder.sub(this.cleanClass(a));
		return this;
	}
	this.cursor["sub"] = [this.cleanClass(a),this.cleanClass(b)];
	return this.last("sub", a);
}

WOQLQuery.prototype.abstract = function(varname){
	if(varname){
		return this.quad(varname, "tcs:tag", "tcs:abstract", "db:schema");
	}
	else if(this.tripleBuilder){
		this.tripleBuilder.abstract();
	}
	return this;
}

WOQLQuery.prototype.isa = function(a, b){
	if(!b && this.tripleBuilder){
		this.tripleBuilder.isa(this.cleanClass(a));
		return this;
	}
	if(b){
		this.cursor["isa"] = [this.cleanClass(a),this.cleanClass(b)];
		return this.last("isa", a);
	}
}

WOQLQuery.prototype.trim = function(a, b){
	this.cursor['trim'] = [a, b];
	return this.last('trim', b);
}

WOQLQuery.prototype.eval = function(arith, v){
	this.cursor['eval'] = [arith, v];
	return this.last('eval', v);
}

WOQLQuery.prototype.plus = function(...args){
	this.cursor['plus'] = args;
	return this.last();
}

WOQLQuery.prototype.minus = function(...args){
	this.cursor['minus'] = args;
	return this.last();
}

WOQLQuery.prototype.times = function(...args){
	this.cursor['times'] = args;
	return this.last();
}

WOQLQuery.prototype.divide = function(...args){
	this.cursor['divide'] = args;
	return this.last();
}

WOQLQuery.prototype.exp = function(a, b){
	this.cursor['exp'] = [a, b];
	return this.last();
}

WOQLQuery.prototype.delete = function(JSON_or_IRI){
	this.cursor['delete'] = [JSON_or_IRI];
	return this.lastUpdate();
}

WOQLQuery.prototype.delete_triple = function( Subject, Predicate, Object_or_Literal ){
	this.cursor['delete_triple'] = [this.cleanSubject(Subject),this.cleanPredicate(Predicate),this.cleanObject(Object_or_Literal)];
	return this.lastUpdate('delete_triple', this.cleanSubject(Subject));
}

WOQLQuery.prototype.add_triple = function( Subject, Predicate, Object_or_Literal ){
	this.cursor['add_triple'] =[this.cleanSubject(Subject),this.cleanPredicate(Predicate),this.cleanObject(Object_or_Literal)];
	return this.lastUpdate('add_triple', this.cleanSubject(Subject));	
}

WOQLQuery.prototype.delete_quad = function( Subject, Predicate, Object_or_Literal, Graph ){
	this.cursor['delete_quad'] =[this.cleanSubject(Subject),this.cleanPredicate(Predicate),this.cleanObject(Object_or_Literal),this.cleanGraph(Graph)];
	return this.lastUpdate('delete_quad', this.cleanSubject(Subject));	
}

WOQLQuery.prototype.add_quad = function( Subject, Predicate, Object_or_Literal, Graph){
	this.cursor['add_quad'] = [this.cleanSubject(Subject),this.cleanPredicate(Predicate),this.cleanObject(Object_or_Literal),this.cleanGraph(Graph)];
	return this.lastUpdate("add_quad", this.cleanSubject(Subject));		
}

WOQLQuery.prototype.update = function(woql){
	this.cursor['update'] = [ woql.json() ];
	return this.lastUpdate();		
}

/**
 * Schema manipulation shorthand
 */
WOQLQuery.prototype.addClass = function(c, graph){
	if(c){
		graph = (graph ? this.cleanGraph(graph) : "db:schema");
		c = (c.indexOf(":") == -1) ? "scm:" + c : c;
		this.add_quad(c, "rdf:type", "owl:Class", graph);	
	}
	return this;
}

WOQLQuery.prototype.addProperty = function(p, t, g){
	t = (t ? t : "xsd:string");
	if(p){
		var graph = (g ? this.cleanGraph(g) : "db:schema");
		p = (p.indexOf(":") == -1) ?  "scm:" + p : p;
		t = (t.indexOf(":") == -1) ? this.cleanType(t) : t ;
		var tc = this.cursor;
		if(WOQL.isLiteralType(t)){
			this.and(
				WOQL.add_quad(p, "rdf:type", "owl:DatatypeProperty", graph), 
				WOQL.add_quad(p, "rdfs:range", t, graph)
			); 
		}
		else {
			this.and(
				WOQL.add_quad(p, "rdf:type", "owl:ObjectProperty", graph), 
				WOQL.add_quad(p, "rdfs:range", t, graph)
			); 
		}
	}
	return this;
}

WOQLQuery.prototype.deleteClass = function(c, graph){
	if(c){
		graph = (graph ? this.cleanGraph(graph) : "db:schema");
		c = (c.indexOf(":") == -1) ?  "scm:" + c : c;
		return this.and(
			WOQL.delete_quad(c, "v:All", "v:Al2", graph),
			WOQL.delete_quad("v:Al3", "v:Al4", c, graph)
		);
	}
	return this;
}

WOQLQuery.prototype.deleteProperty = function(p, graph){
	if(p){
		graph = (graph ? this.cleanGraph(graph) : "db:schema");
		p = (p.indexOf(":") == -1) ? "scm:" + p : p;
		return this.and(
			WOQL.delete_quad(p, "v:All", "v:Al2", graph),
			WOQL.delete_quad("v:Al3", "v:Al4", p, graph)
		);
	}
	return this;
}

/**
 * Language elements that cannot be invoked from the top level and therefore are not exposed in the WOQL api
 */
WOQLQuery.prototype.as = function(a, b){
	b = (b.indexOf(":") == -1 ? "v:" + b : b);
	this.cursor['as'] = [{ "@value" : a}, b];
	return this.lastUpdate();		
}

/**
 * WOQL API
 */

WOQLQuery.prototype.node = function(node, type){
	type = (type ? type : "triple");
	this.tripleBuilder = new TripleBuilder(type, this.cursor, node);
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

WOQLQuery.prototype.graph = function(g){
	g = this.cleanGraph(g);
	var t = (this.type == "triple") ? "quad" : false;
	if(this.type == "add_triple") t = "add_quad";
	if(this.type == "delete_triple") t = "delete_quad";
	if(!this.tripleBuilder){
		this.tripleBuilder = new TripleBuilder(t, this.cursor);
	}
	this.tripleBuilder.graph(g);
	return this;
}

WOQLQuery.prototype.domain = function(d){
	d = this.cleanClass(d);
	if(this.tripleBuilder) this.tripleBuilder.addPO('rdfs:domain',d);
	return this;
}

WOQLQuery.prototype.label = function(l, lang){
	if(this.tripleBuilder) this.tripleBuilder.label(l, lang);
	return this;	
}

WOQLQuery.prototype.comment = function(c, lang){
	if(this.tripleBuilder) this.tripleBuilder.comment(c, lang);
	return this;	
}

WOQLQuery.prototype.parent = function(...p){
	if(this.tripleBuilder){
		for(var i = 0 ; i<p.length; i++){
			var pn = this.cleanClass(p[i]);
			this.tripleBuilder.addPO('rdfs:subClassOf', pn);
		}
	}
	return this;
}

WOQLQuery.prototype.entity = function(...p){
	return this.parent("tcs:Entity");
}

WOQLQuery.prototype.relationship = function(...p){
	return this.parent("tcs:Entity");
}

WOQLQuery.prototype.property = function(p,val){
	if(this.tripleBuilder) {
		p = this.cleanPredicate(p);
		this.tripleBuilder.addPO(p, val);
	}
	return this;
}


WOQLQuery.prototype.getEverything = function(GraphIRI){
	if(GraphIRI){
		GraphIRI = this.cleanGraph(GraphIRI);
		return this.quad("v:Subject", "v:Predicate", "v:Object", GraphIRI);
	}
	else {
		return this.triple("v:Subject", "v:Predicate", "v:Object");
	}
}

WOQLQuery.prototype.getAllDocuments = function(){
	return this.and(
		WOQL.triple("v:Document", "rdf:type", "v:Type"),
		WOQL.sub("v:Type", "tcs:Document")
	);
}
	
WOQLQuery.prototype.documentMetadata = function(){
	return this.and(
		WOQL.triple("v:ID", "rdf:type", "v:Class"),
		WOQL.sub("v:Class", "tcs:Document"),
		WOQL.opt().triple("v:ID", "rdfs:label", "v:Label"),
		WOQL.opt().triple("v:ID", "rdfs:comment", "v:Comment"),
		WOQL.opt().quad("v:Class", "rdfs:label", "v:Type", "db:schema"),
		WOQL.opt().quad("v:Class", "rdfs:comment", "v:Type_Comment", "db:schema")
	);
}

WOQLQuery.prototype.concreteDocumentClasses = function(){
	return this.and(
		WOQL.sub("v:Class", "tcs:Document"),
		WOQL.not().abstract("v:Class"),
		WOQL.opt().quad("v:Class", "rdfs:label", "v:Label", "db:schema"),
		WOQL.opt().quad("v:Class", "rdfs:comment", "v:Comment", "db:schema")
	);
}

WOQLQuery.prototype.propertyMetadata = function(){
	return this.and(
		WOQL.or(
			WOQL.quad("v:Property", "rdf:type", "owl:DatatypeProperty", "db:schema"),
			WOQL.quad("v:Property", "rdf:type", "owl:ObjectProperty", "db:schema")
		),
		WOQL.opt().quad("v:Property", "rdfs:range", "v:Range", "db:schema"),
		WOQL.opt().quad("v:Property", "rdf:type", "v:Type", "db:schema"),
		WOQL.opt().quad("v:Property", "rdfs:label", "v:Label", "db:schema"),
		WOQL.opt().quad("v:Property", "rdfs:comment", "v:Comment", "db:schema"),
		WOQL.opt().quad("v:Property", "rdfs:domain", "v:Domain", "db:schema")
	);
}

WOQLQuery.prototype.elementMetadata = function(){
	return this.and(
		WOQL.quad("v:Element", "rdf:type", "v:Type", "db:schema"),
		WOQL.opt().quad("v:Element", "tcs:tag", "v:Abstract", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:label", "v:Label", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:comment", "v:Comment", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:subClassOf", "v:Parent", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:domain", "v:Domain", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:range", "v:Range", "db:schema")
	);
}

WOQLQuery.prototype.classMetadata = function(){
	return this.and(
		WOQL.quad("v:Element", "rdf:type", "owl:Class", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:label", "v:Label", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:comment", "v:Comment", "db:schema"),
		WOQL.opt().quad("v:Element", "tcs:tag", "v:Abstract", "db:schema")
	);
}

WOQLQuery.prototype.getDataOfClass = function(chosen){
	return this.and(
		WOQL.triple("v:Document", "rdf:type", chosen),
		WOQL.opt().triple("v:Document", "v:Property", "v:Value")
	);
}

WOQLQuery.prototype.getDataOfProperty = function(chosen){
	return this.and(
		WOQL.triple("v:Document", chosen, "v:Value"),
		WOQL.opt().triple("v:Document", "rdfs:label", "v:Label")
	);
}

WOQLQuery.prototype.documentProperties = function(id){
	return this.and(
		WOQL.triple(id, "v:Property", "v:Property_Value"),
		WOQL.opt().quad("v:Property", "rdfs:label", "v:Property_Label", "db:schema"),
		WOQL.opt().quad("v:Property", "rdf:type", "v:Property_Type", "db:schema")
	);
}

WOQLQuery.prototype.getDocumentConnections = function(id){
	return this.and(
		WOQL.or(
			WOQL.triple(id, "v:Outgoing", "v:Entid"),
			WOQL.triple("v:Entid", "v:Incoming", id)
		), 
		WOQL.isa("v:Entid", "v:Enttype"),
		WOQL.sub("v:Enttype", "tcs:Document"),
		WOQL.opt().triple("v:Entid", "rdfs:label", "v:Label"),
		WOQL.opt().quad("v:Enttype", "rdfs:label", "v:Class_Label", "db:schema")
	);
}

WOQLQuery.prototype.getInstanceMeta = function(url){
	return this.and(
		WOQL.triple(url, "rdf:type", "v:InstanceType"),
		WOQL.opt().triple(url, "rdfs:label", "v:InstanceLabel"),
		WOQL.opt().triple(url, "rdfs:comment", "v:InstanceComment"),
		WOQL.opt().quad("v:InstanceType", "rdfs:label", "v:ClassLabel", "db:schema")
	);
}

WOQLQuery.prototype.simpleGraphQuery = function(){
	return this.and(
	    WOQL.triple("v:Source", "v:Edge", "v:Target"),
	    WOQL.isa("v:Source", "v:Source_Class"),
	    WOQL.sub("v:Source_Class", "tcs:Document"),
	    WOQL.isa("v:Target", "v:Target_Class"),
	    WOQL.sub("v:Target_Class", "tcs:Document"),
	    WOQL.opt().triple("v:Source", "rdfs:label", "v:Source_Label"),
	    WOQL.opt().triple("v:Source", "rdfs:comment", "v:Source_Comment"),
	    WOQL.opt().quad("v:Source_Class", "rdfs:label", "v:Source_Type", "db:schema"),
	    WOQL.opt().quad("v:Source_Class", "rdfs:comment", "v:Source_Type_Comment", "db:schema"),
	    WOQL.opt().triple("v:Target", "rdfs:label", "v:Target_Label"),
	    WOQL.opt().triple("v:Target", "rdfs:comment", "v:Target_Comment"),
	    WOQL.opt().quad("v:Target_Class", "rdfs:label", "v:Target_Type", "db:schema"),
	    WOQL.opt().quad("v:Target_Class", "rdfs:comment", "v:Target_Type_Comment", "db:schema"),
	    WOQL.opt().quad("v:Edge", "rdfs:label", "v:Edge_Type", "db:schema"),
	    WOQL.opt().quad("v:Edge", "rdfs:comment", "v:Edge_Type_Comment", "db:schema")
	);
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
							this.vocab[spl[1]] = v;
						}
					}
				}
			}
		}
	});
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

WOQLQuery.prototype.getLimit = function(){
	return this.getPagingProperty("limit");
}

WOQLQuery.prototype.setLimit = function(l){
	return this.setPagingProperty("limit", l);
}

WOQLQuery.prototype.isPaged = function(q){
	q = (q ? q : this.query);
	for (const prop of Object.keys(q)) {
		if(prop == "limit") return true;
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			return this.isPaged(q[prop][q[prop].length-1]);
		}
	}
	return false;
}

WOQLQuery.prototype.getPage = function(){
	if(this.isPaged()){
		var psize = this.getLimit();
		if(this.hasStart()){
			var s = this.getStart();
			return (parseInt(s / psize) + 1);
		}
		else return 1;
	}
	else return false;
}

WOQLQuery.prototype.setPage = function(pagenum){
	var pstart = (this.getLimit() * (pagenum - 1));
	if(this.hasStart()){
		this.setStart(pstart);
	}
	else {
		this.addStart(pstart);
	}
	return this;
}

WOQLQuery.prototype.nextPage = function(){
	return this.setPage(this.getPage() + 1);
}
	
WOQLQuery.prototype.firstPage = function(){
	return this.setPage(1);
}

WOQLQuery.prototype.previousPage = function(){
	const npage = this.getPage() - 1;
	if(npage > 0) this.setPage(npage);
	return this;
}

WOQLQuery.prototype.setPageSize = function(size){
	this.setPagingProperty("limit", size); 
	if(this.hasStart()){
		this.setStart(0);
	}
	else {
		this.addStart(0);
	}
	return this;
}

WOQLQuery.prototype.hasSelect = function(){
	return (this.getPagingProperty("select") ? true : false); 
}

WOQLQuery.prototype.getSelectVariables = function(q){
	q = (q ? q : this.query);	
	for (const prop of Object.keys(q)) {
		if(prop == "select") {
			var vars = q[prop].slice(0, q[prop].length - 1);
			return vars;
		}
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			var val = this.getSelectVariables(q[prop][q[prop].length-1]);
			if(typeof val != "undefined"){
				return val;
			}
		}
	}
}

WOQLQuery.prototype.hasStart = function(){
	return (typeof this.getPagingProperty("start") != "undefined");
}

WOQLQuery.prototype.getStart = function(){
	return this.getPagingProperty("start");
}

WOQLQuery.prototype.setStart = function(start){
	return this.setPagingProperty("start", start); 
}

WOQLQuery.prototype.addStart = function(s){
	if(this.hasStart()) this.setStart(s);
	else {
		var nq = {'start': [s, this.query]};
		this.query = nq;
	}
	return this;
}


/**
 * Executes the query using the passed client to connect to a server
 */
WOQLQuery.prototype.execute = function(client){
	if(!this.query["@context"]){
		this.query['@context'] = this.defaultContext(client.connectionConfig.dbURL());
		var json = this.json();
	}
	else {
		var json = this.json();
	}
	if(this.contains_update){
		return client.select(false, json);		
		//return client.update(false, json);
	}
	else {
		return client.select(false, json);		
	}
}

/*
 * Internal State Control Functions
 * Not part of public API -  
 */

 /**
 * Advances internal cursor to support chaining of calls: limit(50).start(50). rather than (limit, [50, (start, [50, (lisp-style (encapsulation)))))
 */
WOQLQuery.prototype.advanceCursor = function(action, value){
	this.cursor[action] = [value];
	this.cursor[action][1] = {};
	this.cursor = this.cursor[action][1];	
} 

WOQLQuery.prototype.loadDefaultVocabulary = function(){
	var vocab = {};
	vocab.type = "rdf:type";
	vocab.label = "rdfs:label";
	vocab.Class = "owl:Class";
	vocab.DatatypeProperty = "owl:DatatypeProperty"; 
	vocab.ObjectProperty = "owl:ObjectProperty"; 
	vocab.Entity = "tcs:Entity"; 
	vocab.Document = "tcs:Document"; 
	vocab.Relationship = "tcs:Relationship"; 
	vocab.temporality = "tcs:temporality"; 
	vocab.geotemporality = "tcs:geotemporality"; 
	vocab.geography = "tcs:geography"; 
	vocab.abstract = "tcs:abstract"; 
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

WOQLQuery.prototype.defaultContext = function(DB_IRI){
	let def = {}
	for(var pref in FrameHelper.standard_urls){
		def[pref] = FrameHelper.standard_urls[pref];
	}
	def.scm = DB_IRI + "/schema#"
	def.doc = DB_IRI + "/document/"
	def.db = DB_IRI + "/";
	return def;
}



/** 
 * Called to indicate that this is the last call that is chainable - for example triple pattern matching..
 * 
 */
WOQLQuery.prototype.last = function(call, subject){
	this.chain_ended = true;
	if(call) this.tripleBuilder = new TripleBuilder(call, this.cursor, this.cleanSubject(subject));
	return this;
}

WOQLQuery.prototype.lastUpdate = function(call, subj){
	this.contains_update = true;
	var ret = this.last(call, subj);
	return ret;
}

/**
 * Returns the value of one of the 'paging' related properties (limit, start,...)
 */
WOQLQuery.prototype.getPagingProperty = function(pageprop, q){
	q = (q ? q : this.query);	
	for (const prop of Object.keys(q)) {
		if(prop == pageprop) return q[prop][0];
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			var val = this.getPagingProperty(pageprop, q[prop][q[prop].length-1]);
			if(typeof val != "undefined"){
				return val;
			}
		}
	}
}

/**
 * Sets the value of one of the paging_transitive_properties properties
 */
WOQLQuery.prototype.setPagingProperty = function(pageprop, val, q){
	q = (q ? q : this.query);	
	for (const prop of Object.keys(q)) {
		if(prop == pageprop) {
			q[prop][0] = val;
		}
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			this.setPagingProperty(pageprop, val, q[prop][q[prop].length-1]);
		}
	}
	return this;
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

/*
* Transforms from internal json representation to human writable WOQL.js format
*/
WOQLQuery.prototype.prettyPrint = function(indent, show_context, q, embed){
	if(!embed) this.indent = indent;
	q = (q ? q : this.query);
	var str = "";
	var self = this;
	var unclean = function(val){
		str = '('; 
		//return str + "'" + val.join("', '") + "')";
		for(var i = 0; i<val.length; i++){
			if(typeof val[i] == "string"){
				str += '"' + self.unclean(val[i]) + '"';
			}
			else if(typeof val[i] == "object"){
				str += JSON.stringify(val[i]);
			}
			else {
				str += val[i];
			}
			if(i < val.length -1) str +=  ',';
		}
		str += ")";
		return str;
	}

	var nspaces = function(n){
		let spaces = "";
		for(var i = 0; i<n; i++){
			spaces += " ";
		}
		return spaces;
	}
	
	for(var key in q){
		if(key == "@context"){
			//ignore context in pretty print
		}
		else {
			str += (embed ? key : "WOQL."+key);
			var val = q[key];
			if(key == "and" || key == "or"){
				var clauses = []
				for(var i = 0; i<val.length; i++){	
					var nxt = this.prettyPrint(this.indent+indent, show_context, val[i], true);
					clauses.push(nxt)
				}
				str += "(\n" + nspaces(indent) + "WOQL." + clauses.join(",\n"+ nspaces(indent) + "WOQL.") + "\n" + nspaces(indent - this.indent) + ")";				
			}
			else if(typeof val[val.length-1] == "object" && typeof val[val.length-1]['@value'] == "undefined"){
				var nvals = []
				for(var i = 0; i<val.length-1; i++){
					if(key == "limit" || key == "start"){
						nvals.push(val[i]);						
					}
					else {
						if(typeof val[i] == "string"){
							nvals.push(self.unclean(val[i]));
						}
						else if(typeof val[i] == "object"){
							nvals.push(JSON.stringify(val[i]));
						}
						else {
							nvals.push(val[i]);
						}
					}
				}
				if(nvals.length){
					str += unclean(nvals);
					if(key == "from") str += "\n    .";
					else str +=".";
				}
				else {
					str += "().";					
				}
				str += this.prettyPrint(indent, show_context, val[val.length-1], true);
			}
			else {
				str += unclean(val);
			}
		}
	}
	if(str.substring(str.length-1) == "."){
		str = str.substring(0, str.length-1);
	}
	return str;
}

/**
 * Goes from the properly prefixed clean internal version of a variable to the WOQL.js unprefixed form 
 */
WOQLQuery.prototype.unclean = function(s){
	if(typeof s != "string") return s;
	if(s.indexOf(":") == -1) return s;
	if(s.substring(0,4) == "http") return s;
	var suff = s.split(":")[1];
	if(this.vocab && this.vocab[suff]){
		return suff;
	} 
	return s;
}

WOQLQuery.prototype.cleanSubject = function(s){
	if(typeof s != "string") return s;
	if(s.indexOf(":") != -1) return s;
	if(this.vocab && this.vocab[s]) return this.vocab[s];
	return "doc:" + s;
}

WOQLQuery.prototype.cleanPredicate = function(p){
	if(p.indexOf(":") != -1) return p;
	if(this.vocab && this.vocab[p]) return this.vocab[p];
	return "scm:" + p;
}
WOQLQuery.prototype.cleanType = function(t){
	if(t.indexOf(":") != -1) return t;
	if(this.vocab && this.vocab[t]) return this.vocab[t];
	return "scm:" + t;
}

WOQLQuery.prototype.cleanObject = function(o){
	if(typeof o != "string" || o.indexOf(":") != -1) return o;
	if(this.vocab && this.vocab[o]) return this.vocab[o];
	return { "@value": o, "@language": "en"};
}

WOQLQuery.prototype.cleanGraph = function(g){
	if(g.indexOf(":") != -1) return g;
	if(this.vocab && this.vocab[g]) return this.vocab[g];
	return "db:" + g;
}

WOQLQuery.prototype.cleanClass = function(c){
	if(c.indexOf(":") != -1) return c;
	if(this.vocab && this.vocab[c]) return this.vocab[c];
	return "scm:" + c;
}

/*
 * higher level composite queries - not language or api elements
 */
/**
 * Class for enabling building of triples from pieces
 * type is add_quad / remove_quad / add_triple / remove_triple
 */
function TripleBuilder(type, cursor, s){
	//what accumulation type are we
	this.type = type;
	this.cursor = cursor;
	this.subject = (s ? s : false);
	this.g = false;
}

TripleBuilder.prototype.label = function(l, lang){
	lang = (lang ? lang : "en");
	var x = this.addPO('rdfs:label', {"@value": l, "@language": lang});
	return x;
}

TripleBuilder.prototype.comment = function(c, lang){
	lang = (lang ? lang : "en");
	return this.addPO('rdfs:comment', {"@value": c, "@language": lang});
}

TripleBuilder.prototype.addPO = function(p, o, g){ 
	if(this.type){
		var ttype = (this.type == "isa" || this.type == "sub" ? "triple" : this.type);
	}
	else var ttype = "triple";
	var evstr = ttype + "('" + this.subject + "', '" + p + "', ";
	if(typeof o == "string"){
		evstr += "'" + o + "'";
	} 
	else if(typeof o == "object"){
		evstr += JSON.stringify(o);
	}
	else {
		evstr += o;
	}
	if(ttype.substring(ttype.length-4) == "quad" || this.g){
		var g = (g ? g : (this.g ? this.g : "db:schema"));
		evstr += ", '" + g + "'"; 
	}
	evstr += ")";
	try {
		var unit = eval("new WOQLQuery()." + evstr );		
		return this.addEntry(unit);
	}
	catch(e){
		console.error(e);
		return this;
	}
}

TripleBuilder.prototype.getO = function(s, p){ 
	if(this.cursor['and']){
		for(var i = 0; i<this.cursor['and'].length; i++){
			var clause = this.cursor['and'][i];
			var key = Object.keys(clause)[0];
			if(clause[key][0] == s && clause[key][1] == p && clause[key][2]) return clause[key][2];
		}
	}
	else if(Object.keys(this.cursor)) {
		var key =  Object.keys(this.cursor)[0];
		if(this.cursor[key][0] == s && this.cursor[key][1] == p && this.cursor[key][2])  return this.cursor[key][2];
	}
	return false;
}

TripleBuilder.prototype.addEntry = function(unit){
	if(this.cursor[this.type]){
		var next = {};
		next[this.type] = this.cursor[this.type];
		this.cursor['and'] = [next];
		delete(this.cursor[this.type]);
	}
	if(this.cursor['and']){
		this.cursor['and'].push(unit.json());
	}
	else {
		var j = unit.json();
		if(j[this.type]) this.cursor[this.type] = j[this.type];
		else {
			alert(JSON.stringify(j));
		}
	}
	return this;
}

TripleBuilder.prototype.card = function(n, which){
	let os = this.subject;
	this.subject += "_" + which;
	this.addPO('rdf:type', "owl:Restriction");
	this.addPO("owl:onProperty", os);
	switch(which){
		case "max": this.addPO("owl:maxCardinality", n);
			break;
		case "min": this.addPO("owl:minCardinality", n);
			break;
		default: this.addPO("owl:cardinality", n);			
	}
	let od = this.getO(os, "rdfs:domain");
	if(od){
		var x = this.subject;
		this.subject = od;
		this.addPO("rdfs:subClassOf", this.subject);
		//this.triples.push([od, "rdfs:subClassOf", this.subject]);
	}
	this.subject = os;
	return this;
}

TripleBuilder.prototype.isa = function(a){
	var unit = new WOQLQuery.isa(this.subject, a);
	this.tb.addEntry(unit);		
}

TripleBuilder.prototype.graph = function(g){
	this.g = g;
}

TripleBuilder.prototype.sub = function(s){
	var unit = new WOQLQuery.sub(this.subject, s);
	return this.addEntry(unit);
}

TripleBuilder.prototype.abstract = function(){
	return this.addPO('tcs:tag', "tcs:abstract");
}

module.exports = WOQL;