/**
 * The WOQL object is a wrapper around the WOQLQuery object
 * Syntactic sugar to allow writing WOQL.triple()... instead of new WOQLQuery().triple()
 * Every function matches one of the public api functions of the woql query object
 */
const UTILS = require('./utils');
const WOQLRule = require('./woqlRule');
const FrameRule = require('./frameRule');

const WOQL = {};

/*
 * We expose all the real woql predicates via the WOQL object,
 * for ease of typing all return a WOQL query object
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
WOQL.get = function(vars, cols, target){	return new WOQLQuery().get(vars, cols, target); }
WOQL.as = function(map, vari){	return new WOQLQuery().as(map, vari); }
WOQL.remote = function(url){	return new WOQLQuery().remote(url); }
WOQL.file = function(url){	return new WOQLQuery().file(url); }
WOQL.list = function(...vars){	return new WOQLQuery().list(...vars); }
WOQL.order_by = function(gvarlist, query){	return new WOQLQuery().order_by(gvarlist, query); }
WOQL.asc = function(varlist_or_var){	return new WOQLQuery().asc(varlist_or_var); }
WOQL.desc = function(varlist_or_var){	return new WOQLQuery().desc(varlist_or_var); }
WOQL.group_by = function(gvarlist, groupedvar, groupquery, output){	return new WOQLQuery().group_by(gvarlist, groupedvar, groupquery, output); }
WOQL.update = function(Q){	return new WOQLQuery().update(Q); }

/* String and other processing functions */
WOQL.concat = function(list, v){	return new WOQLQuery().concat(list, v); }
WOQL.lower = function(u, l){	return new WOQLQuery().lower(u, l); }
WOQL.pad = function(input, pad, len, output){	return new WOQLQuery().pad(input, pad, len, output); }
WOQL.join = function(...list){	return new WOQLQuery().join(...list); }
WOQL.unique = function(prefix, vari, type){	return new WOQLQuery().unique(prefix, vari, type); }
WOQL.idgen = function(prefix, vari, type, output){	return new WOQLQuery().idgen(prefix, vari, type, output); }
WOQL.typecast = function(vara, type, varb){	return new WOQLQuery().typecast(vara, type, varb); }
WOQL.cast = WOQL.typecast;
WOQL.re = function(pattern, test, matches){	return new WOQLQuery().re(pattern, test, matches); }

WOQL.less = function(v1, v2){	return new WOQLQuery().less(v1, v2); }
WOQL.greater = function(v1, v2){	return new WOQLQuery().greater(v1, v2); }


/* Mathematical Processing */
WOQL.eval = function(arith, v){	return new WOQLQuery().eval(arith, v);}
WOQL.plus = function(...args){	return new WOQLQuery().plus(...args);}
WOQL.minus = function(...args){	return new WOQLQuery().minus(...args); }
WOQL.times = function(...args){	return new WOQLQuery().times(...args); }
WOQL.divide = function(...args){ return new WOQLQuery().divide(...args); }
WOQL.exp = function(a, b){	return new WOQLQuery().exp(a, b); }
WOQL.div = function(...args){	return new WOQLQuery().div(...args); }
WOQL.comment = function(arg){	return new WOQLQuery().comment(arg); }
WOQL.length = function(var1, res){	return new WOQLQuery().length(var1, res);}


//language extensions that can be chained after 'grounded' stuff (clauses with a specific subject) sub, isa, delete_triple, add_triple, delete_quad, add_quad, node
//WOQL.value = function(vars){	return new WOQLQuery().list(vars); }
//These ones are special ones for dealing with the schema only...
WOQL.star = function(G, S, P, O){	return new WOQLQuery().star(G, S, P, O); }
WOQL.add_class = function(classid, graph){	return new WOQLQuery().add_class(classid, graph); }
WOQL.add_property = function(propid, type, graph){	return new WOQLQuery().add_property(propid, type, graph); }
WOQL.delete_class = function(classid, graph){	return new WOQLQuery().delete_class(classid, graph); }
WOQL.delete_property = function(propid, type, graph){	return new WOQLQuery().delete_property(propid, type, graph); }
WOQL.node = function(nodeid, type){	return new WOQLQuery().node(nodeid, type); }

/*
 * Beneath here are pseudo predicates - they belong to the javascript object
 * but not to the WOQL language
 */
//returns empty query object
WOQL.query = function(){	return new WOQLQuery(); }
//loads query from json
WOQL.json = function(json){	return new WOQLQuery().json(json); }

WOQL.rule = function(type){ 
	if(type && type == "frame") return new FrameRule(); 
	return new WOQLRule(); 
}
WOQL.getMatchingRules = function(rules, row, key, context, action){
	return new WOQLRule().getMatchingRules(rules, row, key, context, action);
}

WOQL.insert = function(Node, Type, Graph){
	var q = new WOQLQuery();
	if(Graph){
		return q.add_quad(Node, "rdf:type", q.cleanType(Type), Graph);
	}
	else {
		return q.add_triple(Node, "rdf:type", q.cleanType(Type));
	}
}

WOQL.doctype = function(Type, Graph){
	return new WOQLQuery().add_class(Type, Graph).parent("Document");	
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
	// operators which preserve global paging
	this.paging_transitive_properties = ['select', 'from', 'start', 'when', 'opt', 'limit'];
	this.vocab = this.loadDefaultVocabulary();
	//object used to accumulate triples from fragments to support usage like node("x").label("y");
	this.tripleBuilder = false;
	return this;
}

/**
 * Takes an array of variables, an optional array of column names
 */
WOQLQuery.prototype.get = function(arr1, arr2, target){
	if(arr1.json){
		var map = arr1.json();
		target = arr2;
	}
	else {
		var map = this.buildAsClauses(arr1, arr2);
	}
	if(target){
		if(target.json) target = target.json();
		this.cursor['get'] = [map, target];
	}
	else {
		this.cursor['get'] = [map, {}];
		this.cursor = this.cursor["get"][1];
	}
	return this;
}

WOQLQuery.prototype.buildAsClauses = function(vars, cols){
	var clauses = [];
	if(vars && typeof vars == "object" && vars.length){
		for(var i = 0; i<vars.length; i++){
			var v = vars[i];
			if(cols && typeof cols == "object" && cols.length){
				var c = cols[i];
				if(typeof c == "string"){
					c = {"@value": c};
				}
				clauses.push({as: [c, v]});
			}
			else {
				v.as ? clauses.push(v) : clauses.push({as: [v]});
			}
		}
	}
	return clauses;
}

WOQLQuery.prototype.typecast = function(va, type, vb){
	this.cursor['typecast'] = [va, type, vb];
	return this;
}

/**
 * Shorthand of above
 */
WOQLQuery.prototype.cast = WOQLQuery.prototype.typecast;


WOQLQuery.prototype.length = function(va, vb){
	this.cursor['length'] = [va, vb];
	return this;
}

WOQLQuery.prototype.re = function(p, s, m){
	this.cursor['re'] = [p, s, m];
	return this;
}

WOQLQuery.prototype.remote = function(json){
	this.cursor['remote'] = [json];
	return this;
}

WOQLQuery.prototype.file = function(json){
	this.cursor['file'] = [json];
	return this;
}

WOQLQuery.prototype.order_by = function(gvarlist, asc_or_desc, query){
	let ordering = gvarlist;
	if(gvarlist.json) {
		ordering = gvarlist.json();
	}
	if(typeof ordering != "object"){
		ordering = [ordering];
	}
	if(Array.isArray(ordering)){
		const vars = UTILS.addNamespacesToVariables(ordering);
		asc_or_desc = asc_or_desc || "asc";
		ordering = {};
		ordering[asc_or_desc] = vars; 
	}
	this.advanceCursor("order_by", ordering);
	if(query){
		this.cursor = (query.json ? query.json() : query);
	}
	return this;
}

WOQLQuery.prototype.asc = function(varlist_or_var){
	if(!Array.isArray(varlist_or_var)){
		varlist_or_var = [varlist_or_var];
	}
	this.cursor["asc"] = varlist_or_var;
	return this;
}

WOQLQuery.prototype.desc = function(varlist_or_var){
	if(!Array.isArray(varlist_or_var)){
		varlist_or_var = [varlist_or_var];
	}
	this.cursor["desc"] = varlist_or_var;
	return this;
}

WOQLQuery.prototype.group_by = function(gvarlist, groupedvar, groupquery, output){
	var args = [];
	this.cursor['group_by'] = args;
	if(gvarlist.json){
		args.push(gvarlist.json());
	}
	if(gvarlist['list']){
		args.push(gvarlist);
	}
	else {
		args.push({'list': gvarlist});
	}
	if(typeof groupedvar == "object" && Array.isArray(groupedvar)){
		const ng = UTILS.addNamespacesToVariables(groupedvar);
		groupedvar = {"list": ng};
	}
	else if(typeof groupedvar == "string"){
		groupedvar = UTILS.addNamespacesToVariables(groupedvar);
	}
	args.push(groupedvar);
	if(output){
		groupquery = groupquery.json ? groupquery.json() : groupquery;
		args.push(groupquery);
	}
	else {
		output = groupquery;
		var sq = {};
		this.cursor = sq;
		args.push(sq);
	}
	args.push(UTILS.addNamespaceToVariable(output));
	return this;
}

WOQLQuery.prototype.idgen = function(prefix, vari, type, mode){
	this.cursor['idgen'] = [prefix];
	if(vari.json){
		this.cursor['idgen'].push(vari.json());
	}
	else if(vari.list){
		this.cursor['idgen'].push(vari);
	}
	else {
		this.cursor['idgen'].push({"list": vari})
	}
	if(mode){
		this.cursor['idgen'].push(mode);
	}
	this.cursor['idgen'].push(type);
	return this;
}


WOQLQuery.prototype.unique = function(prefix, vari, type){
	this.cursor['unique'] = [prefix];
	if(vari.json){
		this.cursor['unique'].push(vari.json());
	}
	else if(vari.list){
		this.cursor['unique'].push(vari);
	}
	else {
		this.cursor['unique'].push({"list": vari})
	}
	this.cursor['unique'].push(type);
	return this;
}


WOQLQuery.prototype.concat = function(list, v){
	if(typeof list == "string"){
		var nlist = list.split(/(v:[\w_]+)\b/);
		var nxlist = [];
		for(var i = 1; i<nlist.length; i++){
			if(nlist[i-1].substring(nlist[i-1].length-1) == "v" && nlist[i].substring(0, 1) == ":"){
				nlist[i-1] = nlist[i-1].substring(0, nlist[i-1].length-1);
				nlist[i] = nlist[i].substring(1);
			}
		}
	}
	else if(list.list){
		var nlist = list.list;
	}
	else if(typeof list == "object"){
		var nlist = list;
	}
	var args = [];
	for(var i = 0; i<nlist.length; i++){
		if(!nlist[i]) continue;
		if(typeof nlist[i] == "string"){
			if(nlist[i].substring(0, 2) == "v:"){
				args.push(nlist[i]);
			}
			else {
				var nvalue = {"@value": nlist[i], "@type": "xsd:string"};
				args.push(nvalue);
			}
		}
		else if(nlist[i]){
			args.push(nlist[i]);
		}
	}
	if(v.indexOf(":") == -1) v = "v:" + v;
	this.cursor['concat'] = [{"list": args}, v];
	return this;
};

WOQLQuery.prototype.lower = function(u, l){
	this.cursor['lower'] = [u, l];
	return this;
};

WOQLQuery.prototype.pad = function(input, pad, len, output){
	this.cursor['pad'] = [input, pad, len, output];
	return this;
}

WOQLQuery.prototype.join = function(...list){
	this.cursor['join'] = list;
	return this;
}

WOQLQuery.prototype.less = function(v1, v2){
	this.cursor['less'] = [v1, v2];
	return this;
}

WOQLQuery.prototype.greater = function(v1, v2){
	this.cursor['greater'] = [v1, v2];
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
		if(Query){
			this.cursor["when"] = [{"true": []}, {}];
		}
		else {
			this.cursor["when"] = [{"false": []}, {}];
		}
	}
	else {
		var q = (Query.json ? Query.json() : Query);
		this.cursor['when'] = [q, {}];
	}
	if(Update){
		var upd = (Update.json ? Update.json() : Update);
		this.cursor["when"][1] = upd;
	}
	this.cursor = this.cursor["when"][1];
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
};

WOQLQuery.prototype.from = function(dburl, query){
	this.advanceCursor("from", dburl);
	if(query){
		this.cursor = (query.json ? query.json() : query);
	}
	return this;
}

WOQLQuery.prototype.into = function(dburl, query){
	this.advanceCursor("into", dburl);
	if(query){
		this.cursor = (query.json ? query.json() : query);
	}
	return this;
};

WOQLQuery.prototype.limit = function(limit, query){
	this.advanceCursor("limit", limit);
	if(query){
		this.cursor = (query.json ? query.json() : query);
	}
	return this;
}

WOQLQuery.prototype.start = function(start, query){
	this.advanceCursor("start", start);
	if(query){
		this.cursor = query.json();
	}
	return this;
};

WOQLQuery.prototype.select = function (...list) {
	this.cursor.select = list;
	const index = list.length;
	if (typeof this.cursor.select[index - 1] === 'object') {
		this.cursor.select[index - 1] = this.cursor.select[index - 1].json();
	} else {
		this.cursor.select[index] = {};
		this.cursor = this.cursor.select[index];
	}
	return this;
};

WOQLQuery.prototype.and = function (...queries) {
	this.cursor.and = [];
	for (let i = 0; i < queries.length; i++) {
		if (queries[i].contains_update) this.contains_update = true;
		this.cursor.and.push(queries[i].json());
	}
	return this;
};

WOQLQuery.prototype.or = function (...queries) {
	this.cursor.or = [];
	for (let i = 0; i < queries.length; i++) {
		if (queries[i].contains_update) this.contains_update = true;
		this.cursor.or.push(queries[i].json());
	}
	return this;
};

/**
 * Negation of passed or chained query
 */
WOQLQuery.prototype.not = function (query) {
	if (query) {
		if (query.contains_update) this.contains_update = true;
		if(query.json) query = query.json();
		this.cursor.not = [query];
	} else {
		this.cursor.not = [{}];
		this.cursor = this.cursor.not[0];
	}
	return this;
};

WOQLQuery.prototype.triple = function(a, b, c){
	this.cursor["triple"] = [this.cleanSubject(a),this.cleanPredicate(b),this.cleanObject(c)];
	return this.chainable("triple", this.cleanSubject(a));
}

WOQLQuery.prototype.quad = function(a, b, c, g){
	this.cursor["quad"] = [this.cleanSubject(a),this.cleanPredicate(b),this.cleanObject(c),this.cleanGraph(g)];
	return this.chainable("quad", this.cleanSubject(a));
}

WOQLQuery.prototype.eq = function(a, b){
	this.cursor["eq"] = [this.cleanObject(a),this.cleanObject(b)];
	return this.last();
};

WOQLQuery.prototype.sub = function(a, b){
	if(!b && this.tripleBuilder){
		this.tripleBuilder.sub(this.cleanClass(a));
		return this;
	}
	this.cursor["sub"] = [this.cleanClass(a),this.cleanClass(b)];
	return this.last("sub", a);
}

WOQLQuery.prototype.comment = function(val){
	if(val && val.json){
		this.cursor['comment'] = [val.json()];
	}
	else if(typeof val == "string"){
		this.cursor['comment'] = [{"@value": val, "@language": "en"}];
	}
	else if(typeof val == "object"){
		if(val.length) this.cursor['comment'] = val;
		else this.cursor['comment'] = [val];
	}
	else {
		this.cursor['comment'] = [];
	}
	var last_index = this.cursor['comment'].length;
	this.cursor['comment'][last_index] = {};
	this.cursor = this.cursor['comment'][last_index];
	return this;
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
		return this.chainable("isa", a);
	}
}

WOQLQuery.prototype.trim = function(a, b){
	this.cursor['trim'] = [a, b];
	return this.chainable('trim', b);
}

WOQLQuery.prototype.eval = function(arith, v){
	arith = arith.json ? arith.json() : arith;
	this.cursor['eval'] = [arith, v];
	return this.chainable('eval', v);
}

WOQLQuery.prototype.plus = function (...args) {
	this.cursor.plus = [];
	for(var i = 0; i < args.length; i++){
		this.cursor.plus.push(args[i].json ? args[i].json() : args[i]);
	}
	return this.last();
};

WOQLQuery.prototype.minus = function (...args) {
	this.cursor.minus = [];
	for(var i = 0; i < args.length; i++){
		this.cursor.minus.push(args[i].json ? args[i].json() : args[i]);
	}
	return this.last();
};

WOQLQuery.prototype.times = function (...args) {
	this.cursor.times = [];
	for(var i = 0; i < args.length; i++){
		this.cursor.times.push(args[i].json ? args[i].json() : args[i]);
	}
	return this.last();
};

WOQLQuery.prototype.divide = function (...args) {
	this.cursor.divide = [];
	for(var i = 0; i < args.length; i++){
		this.cursor.divide.push(args[i].json ? args[i].json() : args[i]);
	}
	return this.last();
};

WOQLQuery.prototype.div = function (...args) {
	this.cursor.div = [];
	for(var i = 0; i < args.length; i++){
		this.cursor.div.push(args[i].json ? args[i].json() : args[i]);
	}
	return this.last();
};

WOQLQuery.prototype.exp = function (a, b) {
	a = (a.json ? a.json() : a);
	b = (b.json ? b.json() : b);
	this.cursor.exp = [a, b];
	return this.last();
};

WOQLQuery.prototype.delete = function (JSON_or_IRI) {
	this.cursor.delete = [JSON_or_IRI];
	return this.lastUpdate();
};

WOQLQuery.prototype.delete_triple = function( Subject, Predicate, Object_or_Literal ){
	this.cursor['delete_triple'] = [this.cleanSubject(Subject),this.cleanPredicate(Predicate),this.cleanObject(Object_or_Literal)];
	return this.chainableUpdate('delete_triple', Subject);
}

WOQLQuery.prototype.add_triple = function( Subject, Predicate, Object_or_Literal ){
	this.cursor['add_triple'] =[this.cleanSubject(Subject),this.cleanPredicate(Predicate),this.cleanObject(Object_or_Literal)];
	return this.chainableUpdate('add_triple', Subject);
}

WOQLQuery.prototype.delete_quad = function( Subject, Predicate, Object_or_Literal, Graph ){
	this.cursor['delete_quad'] =[this.cleanSubject(Subject),this.cleanPredicate(Predicate),this.cleanObject(Object_or_Literal),this.cleanGraph(Graph)];
	return this.chainableUpdate('delete_quad', Subject);
}

WOQLQuery.prototype.add_quad = function( Subject, Predicate, Object_or_Literal, Graph){
	this.cursor['add_quad'] = [this.cleanSubject(Subject),this.cleanPredicate(Predicate),this.cleanObject(Object_or_Literal),this.cleanGraph(Graph)];
	return this.chainableUpdate("add_quad", Subject);
}

WOQLQuery.prototype.update = function(woql){
	this.cursor['update'] = [ woql.json() ];
	return this.lastUpdate();
}

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
	return this.chainableUpdate("add_quad", p);
}

WOQLQuery.prototype.delete_class = function(c, graph){
	if(c){
		graph = (graph ? this.cleanGraph(graph) : "db:schema");
		c = (c.indexOf(":") == -1) ?  "scm:" + c : c;
		return this.and(
			WOQL.delete_quad(c, "v:All", "v:Al2", graph),
			WOQL.opt().delete_quad("v:Al3", "v:Al4", c, graph)
		);
	}
	return this;
}

WOQLQuery.prototype.delete_property = function(p, graph){
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
	if(!a || !b) return;
	if(!this.asArray){
		this.asArray = true;
		this.query = [];
	}
	b = (b.indexOf(":") == -1 ? "v:" + b : b);
	var val = (typeof a == "object" ? a : { "@value" : a});
	this.query.push({as: [val, b]});
	return this;
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

WOQLQuery.prototype.description = function(c, lang){
	if(this.tripleBuilder) this.tripleBuilder.description(c, lang);
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
		if(this.adding_class){
			var nwoql = WOQL.add_property(p, val).domain(this.adding_class);
			nwoql.query.and.push(this.json());
			nwoql.adding_class = this.adding_class;
			return nwoql; 
		}
		else {
			p = this.cleanPredicate(p);
			this.tripleBuilder.addPO(p, val);
		}
	}
	return this;
}
	
WOQLQuery.prototype.star = function(GraphIRI, Subj, Pred, Obj){
	Subj = (Subj ? this.cleanSubject(Subj) : "v:Subject");
	Pred = (Pred ? this.cleanPredicate(Pred) : "v:Predicate");
	Obj = (Obj  ? this.cleanObject(Obj) : "v:Object");
	GraphIRI = (GraphIRI ? this.cleanGraph(GraphIRI) : false);
	if(GraphIRI){
		return this.quad(Subj, Pred, Obj, GraphIRI);
	}
	else {
		console.log(Subj, Pred, Obj);
		return this.triple(Subj, Pred, Obj);
	}
}

/** 
 * These are composite functions, the above are primitives
 */
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
		WOQL.triple("v:Subject", "rdf:type", "v:Type"),
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
		WOQL.triple("v:Subject", "rdf:type", chosen),
		WOQL.opt().triple("v:Subject", "v:Property", "v:Value")
	);
}

WOQLQuery.prototype.getDataOfProperty = function(chosen){
	return this.and(
		WOQL.triple("v:Subject", chosen, "v:Value"),
		WOQL.opt().triple("v:Subject", "rdfs:label", "v:Label")
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
	for(var pref in UTILS.standard_urls){
		def[pref] = UTILS.standard_urls[pref];
	}
	def.scm = DB_IRI + "/schema#"
	def.doc = DB_IRI + "/document/"
	def.db = DB_IRI + "/";
	return def;
}



/**
 * Called to indicate that this is the last call in constructing a complete woql query object
 *
 */
WOQLQuery.prototype.last = function(){
	this.chain_ended = true;
	return this;
}

/**
 * Called to inidicate that this is the last call in constructing a complete WOQL update query
 */
WOQLQuery.prototype.lastUpdate = function(){
	this.contains_update = true;
	this.last();
	return this;
}

/**
 * Called to indicate internally that this is a chainable update - by setting the subject and call of the Triple Builder object which is used to build further triples
 */
WOQLQuery.prototype.chainable = function(call, subj){
	this.tripleBuilder = new TripleBuilder(call, this.cursor, this.cleanSubject(subj));
	this.last();
	return this;
}

/**
 * Called to indicate internally that this is a chainable update - by setting the subject and call of the Triple Builder object which is used to build further triples
 */
WOQLQuery.prototype.chainableUpdate = function(call, subj){
	this.tripleBuilder = new TripleBuilder(call, this.cursor, this.cleanSubject(subj));
	return this.lastUpdate();
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


/**
 * Retrieves the value of the current json-ld context
 */
WOQLQuery.prototype.context = function(c){
	this.cursor['@context'] = c;
}


/*
* Transforms from internal json representation to human writable WOQL.js format
*/
WOQLQuery.prototype.prettyPrint = function(indent, show_context, q, fluent){
	if(!this.indent) this.indent = indent;
	q = (q ? q : this.query);
	var str = "";
	const newlining_operators = ["get", "from", "into"];
	for(var operator in q){
		//ignore context in pretty print
		if(operator == "@context") {
			if( show_context){
				var c = this.getContext();
				if(c) str += "@context: " + JSON.stringify(c) + "\n";
			}
			continue;
		}
		//statement starts differently depending on indent and whether it is fluent style or regular function style
		str += this.getWOQLPrelude(operator, fluent, indent - this.indent);
		var val = q[operator];
		if(this.isChainable(operator, val[val.length-1])){
			//all arguments up until the last are regular function arguments
			str += this.uncleanArguments(operator,  val.slice(0, val.length-1), indent, show_context);
			if(newlining_operators.indexOf(operator) !== -1){
				//some fluent function calls demand a linebreak..
				str += "\n" + nspaces(indent-this.indent);
			}
			//recursive call to query included in tail
			str += this.prettyPrint(indent, show_context, val[val.length-1], true);
		}
		else {
			//non chainable operators all live inside the function call parameters
			str += this.uncleanArguments(operator,  val, indent, show_context);
		}
	}
	//remove any trailing dots in the chain (only exist in incompletely specified queries)
	if(str.substring(str.length-1) == "."){
		str = str.substring(0, str.length-1);
	}
	return str;
}

/**
 * Gets the starting characters for a WOQL query - varies depending on how the query is invoked and how indented it is
 */
WOQLQuery.prototype.getWOQLPrelude = function(operator, fluent, inline){
	if(operator === "true" || operator === "false"){
		return operator;
	}
	if(fluent){
		return "." + operator;
	}
	return (inline ? "\n" + nspaces(inline) : "") + "WOQL." + operator;
}

/**
 * Determines whether a given operator can have a chained query as its last argument
 */
WOQLQuery.prototype.isChainable = function(operator, lastArg){
	const non_chaining_operators = ["and", "or"];
	if(lastArg && typeof lastArg == "object" && typeof lastArg['@value'] == "undefined"  && typeof lastArg['@type'] == "undefined"  && typeof lastArg['value'] == "undefined" && non_chaining_operators.indexOf(operator) == -1){
		return true;
	}
	return false;
}

/**
 * Transforms arguments to WOQL functions from the internal (clean) version, to the WOQL.js human-friendly version
 */
WOQLQuery.prototype.uncleanArguments = function(operator, args, indent, show_context){
	str = '(';
	const args_take_newlines = ["and", "or"];
	if(this.hasShortcut(operator, args)){
		return this.getShortcut(args, indent);
	}
	else {
		for(var i = 0; i<args.length; i++){
			if(this.argIsSubQuery(operator, args[i], i)){
				str += this.prettyPrint(indent + this.indent, show_context, args[i], false);
			}
			else if(operator == "get" && i == 0){ // weird one, needs special casing
				str += "\n" + nspaces(indent-this.indent) + "WOQL";
				for(var j = 0; j < args[0].length; j++){
					var myas = (args[0][j].as ? args[0][j].as : args[0][j]);
					var lhs = myas[0];
					var rhs = myas[1];
					if(typeof lhs == "object" && lhs['@value']){
						lhs = lhs['@value'];
					}
					if(typeof lhs == "object") {
						lhs = JSON.stringify(lhs);
					}
					else {
						lhs = '"' + lhs + '"'
					}
					str += '.as(' + lhs;
					if(rhs) str += ', "' + rhs + '"';
					str += ")";
					str += "\n" + nspaces(indent);
				}
			}
			else {
				str += this.uncleanArgument(operator, args[i], i, args);
			}
			if(i < args.length -1) str +=  ',';
		}
	}
	if(args_take_newlines.indexOf(operator) != -1){
		str += "\n" + nspaces(indent-this.indent);
	}
	str += ")";
	return str;
}


/**
 * Passed as arguments: 1) the operator (and, triple, not, opt, etc)
 * 2) the value of the argument
 * 3) the index (position) of the argument.
 */
WOQLQuery.prototype.uncleanArgument = function(operator, val, index, allArgs){
	//numeric values go out untouched...
	const numeric_operators = ["limit", "start", "eval", "plus", "minus", "times", "divide", "exp", "div"];
	if(operator == "isa"){
		val = (index == 0 ? this.unclean(val, 'subject') : this.unclean(val, 'class'));
	}
	else if(operator == "sub"){
		val = this.unclean(val, 'class');
	}
	else if(["select"].indexOf(operator) != -1){
		if(val.substring(0, 2) == "v:") val = val.substring(2);
	}
	else if(["quad", "add_quad", "delete_quad", "add_triple", "delete_triple", "triple"].indexOf(operator) != -1){
		switch(index){
			case 0: val = this.unclean(val, "subject"); break;
			case 1: val = this.unclean(val, "predicate"); break;
			case 2: val = this.unclean(val, "object"); break;
			case 3: val = this.unclean(val, "graph"); break;
		}
	}
	if(typeof val == "object"){
		if(operator == "concat" && index == 0){
			var cstr = "";
			if(val.list){
				for(var i = 0 ; i<val.list.length; i++){
					if(val.list[i]['@value']) cstr += val.list[i]['@value'];
					else cstr += val.list[i];
				}
			}
			var oval = '"' + cstr + '"';
		}
		else {
			var oval = this.uncleanObjectArgument(operator, val, index);
		}
		return oval;
	}
	//else if(numeric_operators.indexOf(operator) !== -1){
	//	return val;
	//}
	if(typeof val == "string"){
		return '"' + val + '"';
	}
	return val;
}



WOQLQuery.prototype.uncleanObjectArgument = function(operator, val, index){
	if(val['@value'] && (val['@language'] || (val['@type'] && val['@type'] == "xsd:string"))) return '"' + val['@value'] + '"';
	if(val['@value'] && (val['@type'] && val['@type'] == "xsd:integer")) return val['@value'];
	if(val['list']) {
		var nstr = "[";
		for(var i = 0 ; i<val['list'].length; i++){
			if(typeof val['list'][i] == "object"){
				nstr += this.uncleanObjectArgument("list", val['list'][i], i);
			}
			else {
				nstr += '"' + val['list'][i] + '"';
			}
			if(i < val['list'].length-1){
				nstr += ",";
			}
		}
		nstr += "]";
		return nstr;
	}
	return JSON.stringify(val);
}

WOQLQuery.prototype.argIsSubQuery = function(operator, arg, index){
	const squery_operators = ["and", "or", "when", "not", "opt", "exp", "minus", "div", "divide", "plus", "multiply"];
	if(squery_operators.indexOf(operator) !== -1){
		if(arg && typeof arg != "object") return false;
		return true;
	}
	if(operator == "group_by" && index == 2) return true;
	else return false;
}

/**
 * Goes from the properly prefixed clean internal version of a variable to the WOQL.js unprefixed form
 */
WOQLQuery.prototype.unclean = function(s, part){
	if(typeof s != "string") return s;
	if(s.indexOf(":") == -1) return s;
	if(s.substring(0,4) == "http") return s;
	var suff = s.split(":")[1];
	if(this.vocab && this.vocab[suff] && this.vocab[suff] == s){
		return suff;
	}
	if(!part) return s;
	if(part == "subject" && (s.split(":")[0] == "doc")) return suff;
	if(part == "class" && (s.split(":")[0] == "scm")) return suff;
	if(part == "predicate" && (s.split(":")[0] == "scm")) return suff;
	if(part == "type" && (s.split(":")[0] == "scm")) return suff;
	if(part == "graph" && (s.split(":")[0] == "db")) return suff;
	return s;
}

WOQLQuery.prototype.hasShortcut = function(operator, args, indent, show_context){
	if(operator == "true") return true;
}

WOQLQuery.prototype.getShortcut = function(operator, args, indent, show_context){
	if(operator == "true") return true;
}

function nspaces(n){
	let spaces = "";
	for(var i = 0; i<n; i++){
		spaces += " ";
	}
	return spaces;
}

WOQLQuery.prototype.printLine = function(indent, clauses){
	return "(\n" + nspaces(indent) + "WOQL." + clauses.join(",\n"+ nspaces(indent) + "WOQL.") + "\n" + nspaces(indent - this.indent) + ")";
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
	if(l.substring(0, 2) == "v:"){
		var d = l;//{"value": l, "@language": lang }
	}
	else {
		var d = {"@value": l, "@language": lang }
	}
	var x = this.addPO('rdfs:label', d);
	return x;
}

TripleBuilder.prototype.description = function(c, lang){
	lang = (lang ? lang : "en");
	if(c.substring(0, 2) == "v:"){
		//var d = {"value": c, "@language": lang }
		var d = c;
	}
	else {
		var d = {"@value": c, "@language": lang }
	}
	return this.addPO('rdfs:comment', d);
}

TripleBuilder.prototype.addPO = function(p, o, g){
	if(this.type){
		var ttype = (this.type == "isa" || this.type == "sub" ? "triple" : this.type);
	}
	else var ttype = "triple";
	var evstr = ttype + '("' + this.subject + '", "' + p + '", ';
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
		evstr += ', "' + g + '"';
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
		case "max": this.addPO("owl:maxCardinality", {"@value": n, "@type": "xsd:nonNegativeInteger"});
			break;
		case "min": this.addPO("owl:minCardinality", {"@value": n, "@type": "xsd:nonNegativeInteger"});
			break;
		default: this.addPO("owl:cardinality", {"@value": n, "@type": "xsd:nonNegativeInteger"});
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
};

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
