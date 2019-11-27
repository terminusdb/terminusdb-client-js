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
WOQL.limit = function(limit, query){ return new WOQLQuery().limit(limit, query); }
WOQL.select = function(...list){ return new WOQLQuery().select(...list); }
WOQL.or = function(...queries){	return new WOQLQuery().or(...queries); }
WOQL.and = function(...queries){ return new WOQLQuery().and(...queries); }
WOQL.not = function(query){ return new WOQLQuery().not(query); }
WOQL.triple = function(a, b, c){ return new WOQLQuery().triple(a, b, c); }
WOQL.quad = function(a, b, c, d){ return new WOQLQuery().quad(a, b, c, d); }
WOQL.eq = function(a, b){ return new WOQLQuery().eq(a, b);}
WOQL.sub = function(a, b){ return new WOQLQuery().sub(a, b); }
WOQL.isa = function(a, b){	return new WOQLQuery().isa(a, b);	}
WOQL.trim = function(a, b){	return new WOQLQuery().trim(a, b);	}
WOQL.delete = function(JSON_or_IRI){ return new WOQLQuery().delete(JSON_or_IRI);	}
WOQL.delete_triple = function( S, P, O ){ return new WOQLQuery().delete_triple (S, P, O);	}
WOQL.add_triple = function( S, P, O ){ return new WOQLQuery().add_triple (S, P, O); }
WOQL.delete_quad = function( S, P, O, G ){ return new WOQLQuery().delete_triple (S, P, O, G); }
WOQL.add_quad = function( S, P, O, G ){ 	return new WOQLQuery().add_triple (S, P, O, G);}
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
WOQL.list = function(vars){	return new WOQLQuery().list(vars); }
//WOQL.value = function(vars){	return new WOQLQuery().list(vars); }

/*
 * Beneath here are pseudo predicates - they belong to the javascript object
 * but not to the WOQL language
 */
//returns empty query object
WOQL.query = function(){	return new WOQLQuery(); }
//loads query from json
WOQL.json = function(json){	return new WOQLQuery().json(json); }
//returns a special schema object for terse schema updates
WOQL.schema = function(){	return new WOQLSchema(); }

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
	return this;
}

/*
 * Control Functions 
 */

/**
 * Advances internal cursor to support chaining of calls: limit(50).start(50). rather than (limit, [50, (start, [50, (lisp-style (encapsulation)))))
 */
WOQLQuery.prototype.advanceCursor = function(action, value){
	this.cursor[action] = [value];
	this.cursor[action][1] = {};
	this.cursor = this.cursor[action][1];	
} 

/** 
 * Called to indicate that this is the last call that is chainable - for example triple pattern matching..
 * 
 */
WOQLQuery.prototype.last = function(){
	this.chain_ended = true;
	return this;
}

WOQLQuery.prototype.isPaged = function(q){
	q = (q ? q : this.query);
	for (const prop of Object.keys(q)) {
		if(prop == "limit") return true;
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			return this.isPaged(q[prop][q[prop].length-1])
		}
	}
}

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

WOQLQuery.prototype.addStart = function(val, q){
	q = (q ? q : this.query);	
	for (const prop of Object.keys(q)) {
		if(prop == "limit") {
			var nval = { "start": [0, q[prop][1]]}
			q[prop][1] = nval;
		}
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			this.addStart(val, q[prop][q[prop].length-1]);
		}
	}
	return this;
}

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

WOQLQuery.prototype.nspaces = function(n){
	let spaces = "";
	for(var i = 0; i<n; i++){
		spaces += " ";
	}
	return spaces;
}


WOQLQuery.prototype.prettyPrint = function(indent, show_context, q, embed){
	if(!embed) this.indent = indent;
	q = (q ? q : this.query);
	var str = "";
	for(var key in q){
		if(key == "@context"){
			//ignore context
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
				str += "(\n" + this.nspaces(indent) + "WOQL." + clauses.join(",\n"+ this.nspaces(indent) + "WOQL.") + "\n" + this.nspaces(indent - this.indent) + ")";
				
			}
			else if(typeof val[val.length-1] == "object" ){
				var nvals = []
				for(var i = 0; i<val.length-1; i++){
					if(key == "limit" || key == "start"){
						nvals.push(val[i]);						
					}
					else {
						nvals.push('"'+val[i]+'"');
					}
				}
				if(nvals.length){
					str += "(" + nvals.join(",");
					if(key == "from") str += ")\n.";
					else str +=").";
				}
				else {
					str += "().";					
				}
				str += this.prettyPrint(indent, show_context, val[val.length-1], true);
			}
			else {
				str += '("' + val.join('", "') + '")';
			}
		}
	}
	return str;
}

WOQLQuery.prototype.setLimit = function(limit){
	return this.setPagingProperty("limit", limit); 
}

WOQLQuery.prototype.getLimit = function(){
	return this.getPagingProperty("limit");
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


WOQLQuery.prototype.hasStart = function(){
	return (typeof this.getPagingProperty("start") != "undefined");
}

WOQLQuery.prototype.getStart = function(){
	return this.getPagingProperty("start");
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

WOQLQuery.prototype.hasSelect = function(){
	return this.getPagingProperty("select"); 
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

WOQLQuery.prototype.setStart = function(start){
	return this.setPagingProperty("start", start); 
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

/*
 * Called to indicate an update that is the last chainable element in a query
 */
WOQLQuery.prototype.lastUpdate = function(){
	this.last();
	this.contains_update = true;
	return this;
}

/*
 * JSON context specifying prefixes
 */
WOQLQuery.prototype.context = function(Context){
	this.cursor["@context"] = Context;
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
 * Executes the query using the passed client to connect to a server
 */
WOQLQuery.prototype.execute = function(client){
	if(!this.query["@context"]){
		this.query["@context"] = this.defaultContext(client.connectionConfig.dbURL());
		var json = this.json();
	}
	else {
		var json = this.json();
	}
	if(this.contains_update){
		return client.update(false, json);
	}
	else {
		return client.select(false, json);		
	}
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
	this.advanceCursor("when", Query);	
	if(Update){
		this.cursor = Update.json();
	}
	return this;
}

WOQLQuery.prototype.opt = function(query){
	if(query){
		this.cursor["opt"] = [query];
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
	this.cursor["triple"] = [a,b,c];
	return this.last();
}

WOQLQuery.prototype.quad = function(a, b, c, g){
	this.cursor["quad"] = [a,b,c,g];
	return this.last();
}

WOQLQuery.prototype.eq = function(a, b){
	this.cursor["eq"] = [a,b];
	return this.last();
}

WOQLQuery.prototype.sub = function(a, b){
	this.cursor["sub"] = [a,b];
	return this.last();
}

WOQLQuery.prototype.isa = function(a, b){
	this.cursor["isa"] = [a,b];
	return this.last();
}

WOQLQuery.prototype.trim = function(a, b){
	this.cursor['trim'] = [a, b];
	return this.last();
}

WOQLQuery.prototype.eval = function(arith, v){
	this.cursor['eval'] = [arith, v];
	return this.last();
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
	this.cursor['delete_triple'] = [ Subject, Predicate, Object_or_Literal ];
	return this.lastUpdate();
}

WOQLQuery.prototype.add_triple = function( Subject, Predicate, Object_or_Literal ){
	this.cursor['add_triple'] = [ Subject, Predicate, Object_or_Literal ];
	return this.lastUpdate();	
}

WOQLQuery.prototype.delete_quad = function( Subject, Predicate, Object_or_Literal, Graph ){
	this.cursor['delete_quad'] = [ Subject, Predicate, Object_or_Literal, Graph ];
	return this.lastUpdate();	
}

WOQLQuery.prototype.add_quad = function( Subject, Predicate, Object_or_Literal, Graph){
	this.cursor['add_quad'] = [ Subject, Predicate, Object_or_Literal, Graph ];
	return this.lastUpdate();		
}

WOQLQuery.prototype.update = function(json){
	this.cursor['update'] = [ json ];
	return this.lastUpdate();		
}

/*
 * higher level composite queries
 */

WOQLQuery.prototype.abstract = function(varname){
	varname = (varname ? varname : "v:".FrameHelper.genBNID());
	return this.quad(varname, "tcs:tag", "tcs:abstract", "db:schema");
}

WOQLQuery.prototype.getEverything = function(GraphIRI){
	if(GraphIRI){
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

function WOQLSchema(){
	this.triples = [];
	this.subject = false;
}

WOQLSchema.prototype.execute = function(client){
	var subs = [];
	for(var i = 0; i<this.triples.length; i++){
		subs.push(WOQL.add_quad(...this.triples[i], "db:schema"));
	}
	return WOQL.and(subs).execute(client);
}

WOQLSchema.prototype.getO = function(s, p){
	for(var i = 0; i<this.triples.length; i++){
		if(this.triples[i][0] == s && this.triples[i][1] == p ) return this.triples[i][2];
	}
	return false;
}

WOQLSchema.prototype.addPO = function(p, o){
	this.triples.push([this.subject, p, o]);
	return this;
}

WOQLSchema.prototype.addClass = function(c){
	this.subject = c;
	return this.addPO("rdf:type", "owl:Class");
}

WOQLSchema.prototype.addProperty = function(p, t){
	this.subject = p;
	this.addPO("rdfs:range", t);
	if(WOQL.isLiteralType(t)){
		return this.addPO("rdf:type", "owl:DatatypeProperty");
	}
	else {
		return this.addPO("rdf:type", "owl:ObjectProperty");		
	}
}

WOQLSchema.prototype.label = function(l, lang){
	lang = (lang ? lang : "en");
	return this.addPO('rdfs:label', {"@value": l, "@language": "en"});
}

WOQLSchema.prototype.comment = function(c, lang){
	lang = (lang ? lang : "en");
	return this.addPO('rdfs:comment', {"@value": c, "@language": "en"});
}

WOQLSchema.prototype.parent = function(...p){
	return this.addPO('rdfs:subClassOf', p);
}

WOQLSchema.prototype.abstract = function(){
	return this.addPO('tcs:tag', "tcs:abstract");
}

WOQLSchema.prototype.entity = function(){
	return this.parent("tcs:Entity");
}

WOQLSchema.prototype.relationship = function(){
	return this.parent("tcs:Relationship");
}

WOQLSchema.prototype.card = function(n, which){
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
		this.triples.push([od, "rdfs:subClassOf", this.subject]);
	}
	this.subject = os;
	return this;
}

WOQLSchema.prototype.max = function(m){
	return this.card(m, "max");
}

WOQLSchema.prototype.min = function(m){
	return this.card(m, "min");	
}

WOQLSchema.prototype.cardinality = function(m){
	return this.card(m, "cardinality");	
}

WOQLSchema.prototype.domain = function(d){
	return this.addPO('rdfs:domain', d);
}
/*
 * 

 let s = WOQL.schema();
 s.addClass("myclass").label("whatever").comment("yo").entity();
 s.addProperty("myprop", "string").label("whatever").comment("yo").domain("myclass").max(1);
 s.execute(client).then()
 
 WOQL.when(WQOL.query().get(mytwitterfriends).column("adfa").as("v:X").update(triple(v:X));
 
 WOQL.select("fadfadf").execute().done()
 g = WOQL.graph()....
 show(result, g);
 
 * 
 *
 *
 *
 
 
 * 
 */


module.exports = WOQL;