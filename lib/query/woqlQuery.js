const WOQLQuery = require('./woqlCore');
const UTILS = require('../utils');

/**
 * Contains definitions of the WOQL functions which map directly to JSON-LD types
 * All other calls and queries can be composed from these
 */

WOQLQuery.prototype.using = function(Collection, Subq){
	if(Collection && Collection == "woql:args") return ["woql:collection", "woql:query"]
	this.cursor['@type'] = "woql:Using"
	if(!Collection || typeof Collection != "string"){
		return this.parameterError("The first parameter to using must be a Collection ID (string)")
	}
	this.cursor['woql:collection'] = this.jlt(Collection)
	return this.addSubQuery(Subq)
}

WOQLQuery.prototype.comment = function(comment, Subq){
	if(comment && comment == "woql:args") return ["woql:comment", "woql:query"]
	this.cursor['@type'] = "woql:Comment"
	this.cursor['woql:comment'] = this.jlt(comment)
	return this.addSubQuery(Subq)
}

WOQLQuery.prototype.select = function (...list) {
	if(list && list[0] == "woql:args") return ["woql:variable_list", "woql:query"]
	this.cursor['@type'] = "woql:Select"
	if(!list || list.length <= 0){
		return this.parameterError("Select must be given a list of variable names")
	}
	let last =list[list.length - 1]
	if(typeof last == "object" && last.json){
		var embedquery = list.pop()
	}
	else var embedquery = false;
	this.cursor['woql:variable_list'] = [];
	for(var i = 0; i<list.length; i++){
		let onevar = { 
			"@type": "woql:VariableListElement", 
			"woql:index" : this.jlt(i, "nonNegativeInteger"),
			"woql:variable" : this.varj(list[i])
		}
		this.cursor['woql:variable_list'].push(onevar)
	}
	return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.and = function (...queries) {
	if(queries && queries[0] == "woql:args") return ["woql:query_list"]
	this.cursor['@type'] = "woql:And"
	if(!queries || queries.length <= 0){
		return this.parameterError("And must be given a list of sub-queries as a parameter")
	}
	if(typeof this.cursor['woql:query_list'] == "undefined") this.cursor['woql:query_list'] = []
	for (let i = 0; i < queries.length; i++) {
		let index = this.cursor['woql:query_list'].length 
		let onevar = this.qle(queries[i], index)
		if(onevar['@type'] == "woql:And" && onevar['woql:query_list']){
			for(var j = 0; j<onevar['woql:query_list'].length; j++){
				let qjson = onevar['woql:query_list'][j]['woql:query']
				if(qjson) {
					index = this.cursor['woql:query_list'].length 
					let subvar = this.qle(qjson, index)
					this.cursor['woql:query_list'].push(subvar)		
				}
			}
		}
		else {
			this.cursor['woql:query_list'].push(onevar)		
		}
	}
	return this;
}

WOQLQuery.prototype.or = function (...queries) {
	if(queries && queries[0] == "woql:args") return ["woql:query_list"]
	this.cursor['@type'] = "woql:Or"
	if(!queries || queries.length <= 0){
		return this.parameterError("Or must be given a list of sub-queries as a parameter")
	}
	if(typeof this.cursor['woql:query_list'] == "undefined") this.cursor['woql:query_list'] = []
	for (let i = 0; i < queries.length; i++) {
		let onevar = this.qle(queries[i], i)
		this.cursor['woql:query_list'].push(onevar)		
	}
	return this;
}

WOQLQuery.prototype.from = function(graph_filter, query){
	if(graph_filter && graph_filter == "woql:args") return ["woql:graph_filter", "woql:query"]
	this.cursor['@type'] = "woql:From"
	if(!graph_filter || typeof graph_filter != "string"){
		return this.parameterError("The first parameter to from must be a Graph Filter Expression (string)")
	}
	this.cursor['woql:graph_filter'] = this.jlt(graph_filter)
	return this.addSubQuery(query)
}

WOQLQuery.prototype.into = function(graph_descriptor, query){
	if(graph_descriptor && graph_descriptor == "woql:args") return ["woql:graph", "woql:query"]
	this.cursor['@type'] = "woql:Into"
	if(!graph_descriptor || typeof graph_descriptor != "string"){
		return this.parameterError("The first parameter to from must be a Graph Filter Expression (string)")
	}
	this.cursor['woql:graph'] = this.jlt(graph_descriptor)
	return this.addSubQuery(query)
}

WOQLQuery.prototype.triple = function(a, b, c){
	if(a && a == "woql:args") return ["woql:subject", "woql:predicate", "woql:object"]
	this.cursor['@type'] = "woql:Triple"
	this.cursor['woql:subject'] = this.cleanSubject(a);
	this.cursor['woql:predicate'] = this.cleanPredicate(b);
	this.cursor['woql:object'] = this.cleanObject(c);
	return this;
}

WOQLQuery.prototype.quad = function(a, b, c, g){
	let args =	this.triple(a, b, c);
	if(a && a == "woql:args") return args.concat(["woql:graph_filter"])
	if(!g) return this.parameterError("Quad takes four parameters, the last should be a graph filter")
	this.cursor['@type'] = "woql:Quad"
	this.cursor['woql:graph_filter'] = this.cleanGraph(g);
	return this
}

WOQLQuery.prototype.sub = function(a, b){
	if(a && a == "woql:args") return ["woql:parent", "woql:child"]
	if(!a || !b) return this.parameterError("Subsumption takes two parameters, both URIs")
	this.cursor['@type'] = "woql:Subsumption"
	this.cursor["woql:parent"] = this.cleanClass(a);
	this.cursor["woql:child"] = this.cleanClass(b);
	return this;
}

WOQLQuery.prototype.subsumption = WOQLQuery.prototype.sub

WOQLQuery.prototype.eq = function(a, b){
	if(a && a == "woql:args") return ["woql:left", "woql:right"]
	if( typeof a == "undefined" ||  typeof b == "undefined") return this.parameterError("Equals takes two parameters")
	this.cursor['@type'] = "woql:Equals"
	this.cursor['woql:left'] = this.cleanObject(a)
	this.cursor['woql:right'] = this.cleanObject(b)
	return this
}

WOQLQuery.prototype.equals = WOQLQuery.prototype.eq

WOQLQuery.prototype.substr = function(String, Before, Length, After, SubString){
	if(String && String == "woql:args") return ["woql:string", "woql:before", "woql:length",  "woql:after", "woql:substring"]
	if(!SubString){
		SubString = After
		After = 0
	} 
	if(!SubString){
		SubString = Length
		Length = SubString.length + Before
	}
	if(!String || !SubString || typeof SubString != "string") 
	return this.parameterError("Substr - the first and last parameters must be strings representing the full and substring variables / literals")
	this.cursor['@type'] = "woql:Substring"
	this.cursor['woql:string'] = this.cleanObject(String)
	this.cursor['woql:before'] = this.cleanObject(Before, "xsd:nonNegativeInteger")
	this.cursor['woql:length'] = this.cleanObject(Length, "xsd:nonNegativeInteger")
	this.cursor['woql:after'] = this.cleanObject(After, "xsd:nonNegativeInteger")
	this.cursor['woql:substring'] = this.cleanObject(SubString)
	return this
}

WOQLQuery.prototype.substring = WOQLQuery.prototype.substr


WOQLQuery.prototype.update_object = function(docjson){
	if(docjson && docjson == "woql:args") return ["woql:document"]
	this.cursor['@type'] = "woql:UpdateObject"
	this.cursor['woql:document'] = docjson;
	return this.updated()
}

WOQLQuery.prototype.update = WOQLQuery.prototype.update_object


WOQLQuery.prototype.delete_object = function (JSON_or_IRI) {
	if(JSON_or_IRI && JSON_or_IRI == "woql:args") return ["woql:document"]
	this.cursor['@type'] = "woql:DeleteObject"
	this.cursor['woql:document'] = JSON_or_IRI;
	return this.updated()
}

WOQLQuery.prototype.delete = WOQLQuery.prototype.delete_object


WOQLQuery.prototype.read_object = function (IRI, Format) {
	if(IRI && IRI == "woql:args") return ["woql:document"]
	this.cursor['@type'] = "woql:ReadObject"
	this.cursor['woql:document'] = IRI ;
	return this.wform(Format)
}

WOQLQuery.prototype.read = WOQLQuery.prototype.read_object


/**
 * Takes an as structure
 */
WOQLQuery.prototype.get = function(asvars, query_resource){
	if(asvars && asvars == "woql:args") return ["woql:as_vars", "woql:query_resource"]
	this.cursor['@type'] = "woql:Get"
	this.cursor['woql:as_vars'] = (asvars.json() ? asvars.json() : asvars)
	if(query_resource){
		this.cursor['woql:query_resource'] = this.jobj(query_resource);
	}
	else {
		this.cursor['woql:query_resource'] = {}
	}
	this.cursor = this.cursor['woql:query_resource'];
	return this;
}

/**
 * Takes an array of variables, an optional array of column names
 */
WOQLQuery.prototype.put = function(asvars, query_resource, query){
	if(asvars && asvars == "woql:args") return ["woql:as_vars", "woql:query", "woql:query_resource"]
	this.cursor['@type'] = "woql:Put"
	this.cursor['woql:as_vars'] = (asvars.json() ? asvars.json() : asvars)
	if(query_resource){
		this.cursor['woql:query_resource'] = this.jobj(query_resource);
	}
	else {
		this.cursor['woql:query_resource'] = {}
	}
	return this.addSubQuery(query)
}

/**
 * Forms 
 *   1. indexedasvars
 *   2. namedasvars
 *   
 * calling: 
 *   WOQL.as(0, "man", type).as(1, "blah", "blue")
 *   WOQL.as(["col", "blah", type], ["col2", "blah", type])
 */
WOQLQuery.prototype.as = function(...varList){
	if(varList && varList[0] == "woql:args") return [["woql:indexed_as_var", "woql:named_as_var"]]
	if(Array.isArray(varList[0])){
		for(var i = 0 ; i<varList.length; i++){
			let onemap = varList[i]
			if(Array.isArray(onemap) && onemap.length >= 2){
				let type = (onemap && onemap.length > 2 ?  onemap[2] : false)
				let oasv = this.asv(onemap[0], onemap[1], type)
				this.addASV(this.cursor, oasv)
			}
		}
	}
	else if(typeof varList[0]  == "number" || typeof varList[0]  == "string"){
		let type = (varList.length > 2 ?  varList[2] : false)
		let oasv = this.asv(varList[0], varList[1], type)
		this.addASV(this.cursor, oasv)
	}
	else if(typeof varList[0]  == "object"){
		this.cursor = (varList[0].json ? varList[0].json() : varList[0])
	}
	if(this.cursor["woql:indexed_as_var"] && this.cursor["woql:indexed_as_var"].length > 0 && !this.cursor["woql:named_as_var"]){
		this.cursor['@type'] = "woql:IndexedAsVars"
	}
	else if(!this.cursor["woql:indexed_as_var"] && this.cursor["woql:named_as_var"] && this.cursor["woql:named_as_var"].length > 0){
		this.cursor['@type'] = "woql:NamedAsVars"
	}
	else {
		this.cursor['@type'] = "woql:AsVars"
	}
	return this
}

WOQLQuery.prototype.file = function(fpath, opts){
	if(fpath && fpath == "woql:args") return ["woql:file", "woql:format"]
	this.cursor['@type'] = "woql:FileResource"
	this.cursor['woql:file'] = [{"@type": "xsd:string", "@value": fpath}];
	return this.wform(opts)
}

WOQLQuery.prototype.remote = function(uri, opts){
	if(uri && uri == "woql:args") return ["woql:remote_uri", "woql:format"]
	this.cursor['@type'] = "woql:RemoteResource"
	this.cursor['woql:remote_uri'] = [{"@type": "xsd:anyURI", "@value": uri}];
	return this.wform(opts)
}

WOQLQuery.prototype.post = function(fpath, opts){
	if(fpath && fpath == "woql:args") return ["woql:file", "woql:format"]
	this.cursor['@type'] = "woql:PostResource"
	this.cursor['woql:file'] = [{"@type": "xsd:string", "@value": fpath}];
	return this.wform(opts)
}

WOQLQuery.prototype.delete_triple = function( Subject, Predicate, Object_or_Literal ){
	let args = this.triple(Subject, Predicate, Object_or_Literal)
	if(Subject && Subject == "woql:args") return args
	this.cursor["@type"] = "woql:DeleteTriple"
	return this.updated()
}

WOQLQuery.prototype.add_triple = function( Subject, Predicate, Object_or_Literal ){
	let args = this.triple(Subject, Predicate, Object_or_Literal)
	if(Subject && Subject == "woql:args") return args
	this.cursor["@type"] = "woql:AddTriple"
	return this.updated()
}

WOQLQuery.prototype.delete_quad = function( Subject, Predicate, Object_or_Literal, Graph ){
	let args = this.quad(Subject, Predicate, Object_or_Literal, Graph)
	if(Subject && Subject == "woql:args") return args
	this.cursor["@type"] = "woql:DeleteQuad"
	return this.updated()
}

WOQLQuery.prototype.add_quad = function( Subject, Predicate, Object_or_Literal, Graph){
	let args = this.quad(Subject, Predicate, Object_or_Literal, Graph)
	if(Subject && Subject == "woql:args") return args
	this.cursor["@type"] = "woql:AddQuad"
	return this.updated()
}


/*
 * Functions which take a query as an argument advance the cursor to make the chaining of queries fall
 * into the corrent place in the encompassing json
 */
WOQLQuery.prototype.when = function(Query, Consequent){
	if(Query && Query == "woql:args") return ["woql:query", "woql:consequent"]
	this.cursor["@type"] = "woql:When"
	this.addSubQuery(Query)
	if(Consequent){
		this.cursor["woql:consequent"] = this.jobj(Consequent);
	}
	else {
		this.cursor["woql:consequent"] = {}
	}
	this.cursor = this.cursor["woql:consequent"]
	return this
}


WOQLQuery.prototype.trim = function(untrimmed, trimmed){
	if(untrimmed && untrimmed == "woql:args") return ["woql:untrimmed", "woql:trimmed"]
	this.cursor["@type"] = "woql:Trim"
	this.cursor['woql:untrimmed'] = this.cleanObject(untrimmed)
	this.cursor['woql:trimmed'] = this.cleanObject(trimmed)
	return this
}

WOQLQuery.prototype.eval = function(arith, res){
	if(arith && arith == "woql:args") return ["woql:expression", "woql:result"]
	this.cursor["@type"] = "woql:Eval"
	this.cursor['woql:expression'] = (arith.json ? arith.json() : arith)
	this.cursor['woql:result'] = this.cleanObject(res)
	return this;
}

WOQLQuery.prototype.plus = function (...args) {
	if(args && args[0] == "woql:args") return ["woql:first", "woql:second"]
	this.cursor["@type"] = "woql:Plus"
	this.cursor['woql:first'] = this.arop(args.shift())
	if(args.length > 1){
		this.cursor['woql:second'] = this.jobj(new WOQLQuery().plus(...args))
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
}

WOQLQuery.prototype.minus = function (...args) {
	if(args && args[0] == "woql:args") return ["woql:first", "woql:second"]
	this.cursor["@type"] = "woql:Minus"
	this.cursor['woql:first'] = this.arop(args.shift())
	if(args.length > 1){
		this.cursor['woql:second'] = this.jobj(new WOQLQuery().minus(...args))
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
}

WOQLQuery.prototype.times = function (...args) {
	if(args && args[0] == "woql:args") return ["woql:first", "woql:second"]
	this.cursor["@type"] = "woql:Times"
	this.cursor['woql:first'] = this.arop(args.shift())
	if(args.length > 1){
		this.cursor['woql:second'] = this.jobj(new WOQLQuery().times(...args))
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
}


WOQLQuery.prototype.divide = function (...args) {
	if(args && args[0] == "woql:args") return ["woql:first", "woql:second"]
	this.cursor["@type"] = "woql:Divide"
	this.cursor['woql:first'] = this.arop(args.shift())
	if(args.length > 1){
		this.cursor['woql:second'] = this.jobj(new WOQLQuery().divide(...args))
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
}

WOQLQuery.prototype.div = function (...args) {
	if(args && args[0] == "woql:args") return ["woql:first", "woql:second"]
	this.cursor["@type"] = "woql:Div"
	this.cursor['woql:first'] = this.arop(args.shift())
	if(args.length > 1){
		this.cursor['woql:second'] = this.jobj(new WOQLQuery().div(...args))
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
}

WOQLQuery.prototype.exp = function (a, b) {
	if(a && a == "woql:args") return ["woql:first", "woql:second"]
	this.cursor["@type"] = "woql:Exp"
	this.cursor['woql:first'] = this.arop(a)
	this.cursor['woql:second'] = this.arop(b)
	return this;
}

WOQLQuery.prototype.floor = function (a) {
	if(a && a == "woql:args") return ["woql:argument"]
	this.cursor["@type"] = "woql:Floor"
	this.cursor['woql:argument'] = this.arop(a)
	return this;
}

WOQLQuery.prototype.isa = function(a, b){
	if(a && a == "woql:args") return ["woql:element", 'woql:of_type']
	this.cursor["@type"] = "woql:IsA"
	this.cursor['woql:element'] = this.cleanSubject(a)
	this.cursor['woql:of_type'] = this.cleanClass(b)
	return this
}

WOQLQuery.prototype.like = function(a, b, dist){
	if(a && a == "woql:args") return ["woql:left", "woql:right", 'woql:like_similarity']
	this.cursor["@type"] = "woql:Like"
	this.cursor['woql:left'] = this.cleanObject(a)
	this.cursor['woql:right'] = this.cleanObject(b)
	if(dist){
		this.cursor['woql:like_similarity'] = this.cleanObject(dist, "xsd:decimal")
	}
	return this
}

WOQLQuery.prototype.less = function(v1, v2){
	if(v1 && v1 == "woql:args") return ["woql:left", "woql:right"]
	this.cursor["@type"] = "woql:Less"
	this.cursor['woql:left'] = this.cleanObject(v1)
	this.cursor['woql:right'] = this.cleanObject(v2)
	return this;
}

WOQLQuery.prototype.greater = function(v1, v2){
	if(v1 && v1 == "woql:args") return ["woql:left", "woql:right"]
	this.cursor["@type"] = "woql:Greater"
	this.cursor['woql:left'] = this.cleanObject(v1)
	this.cursor['woql:right'] = this.cleanObject(v2)
	return this;
}

WOQLQuery.prototype.opt = function(query){
	if(query && query == "woql:args") return ["woql:query"]
	this.cursor["@type"] = "woql:Optional"
	this.addSubQuery(query)
	return this;
}

WOQLQuery.prototype.optional = WOQLQuery.prototype.opt 

WOQLQuery.prototype.unique = function(prefix, vari, type){
	if(prefix && prefix == "woql:args") return ["woql:base", "woql:key_list", "woql:uri"]
	this.cursor["@type"] = "woql:Unique"
	this.cursor["woql:base"] = this.cleanObject(prefix)
	this.cursor["woql:key_list"] = this.vlist(vari)
	this.cursor["woql:uri"] = this.cleanClass(type)
	return this
}

WOQLQuery.prototype.idgen = function(prefix, vari, type){
	if(prefix && prefix == "woql:args") return ["woql:base", "woql:key_list", "woql:uri"]
	this.cursor["@type"] = "woql:IDGenerator"
	this.cursor["woql:base"] = this.cleanObject(prefix)
	this.cursor["woql:key_list"] = this.vlist(vari)
	this.cursor["woql:uri"] = this.cleanClass(type)
	return this
}

WOQLQuery.prototype.idgenerator = WOQLQuery.prototype.idgen


WOQLQuery.prototype.upper = function(l, u){
	if(l && l == "woql:args") return ["woql:left", "woql:right"]
	this.cursor["@type"] = "woql:Upper"
	this.cursor['woql:left'] = this.cleanObject(l)
	this.cursor['woql:right'] = this.cleanObject(u)
	return this;
}

WOQLQuery.prototype.lower = function(u, l){
	if(u && u == "woql:args") return ["woql:left", "woql:right"]
	this.cursor["@type"] = "woql:Lower"
	this.cursor['woql:left'] = this.cleanObject(u)
	this.cursor['woql:right'] = this.cleanObject(l)
	return this;
}

WOQLQuery.prototype.pad = function(input, pad, len, output){
	if(input && input == "woql:args") return ["woql:pad_string", "woql:pad_char", "woql:pad_times", "woql:pad_result"]
	this.cursor["@type"] = "woql:Pad"
	this.cursor['woql:pad_string'] = this.cleanObject(input)
	this.cursor['woql:pad_char'] = this.cleanObject(pad)
	this.cursor['woql:pad_times'] = this.cleanObject(len, "xsd:integer")
	this.cursor['woql:pad_result'] = this.cleanObject(output)
	return this;
}

WOQLQuery.prototype.split = function(input, glue, output){
	if(input && input == "woql:args") return ["woql:split_string", "woql:split_pattern", "woql:split_list"]
	this.cursor["@type"] = "woql:Split"
	this.cursor['woql:split_string'] = this.cleanObject(input)
	this.cursor['woql:split_pattern'] = this.cleanObject(glue)
	this.cursor['woql:split_list'] = this.wlist(output)
	return this;
}

WOQLQuery.prototype.member = function(El, List){
	if(El && El == "woql:args") return ["woql:member", "woql:member_list"]
	this.cursor["@type"] = "woql:Member"
	this.cursor['woql:member'] = this.cleanObject(El)
	this.cursor['woql:member_list'] = this.wlist(List)
	return this;
}

WOQLQuery.prototype.concat = function(list, v){
	if(list && list == "woql:args") return ["woql:concat_list", "woql:concatenated"]
	if(typeof list == "string"){
		var nlist = list.split(/(v:[\w_]+)\b/);
		for(var i = 1; i<nlist.length; i++){
			if(nlist[i-1].substring(nlist[i-1].length-1) == "v" && nlist[i].substring(0, 1) == ":"){
				nlist[i-1] = nlist[i-1].substring(0, nlist[i-1].length-1);
				nlist[i] = nlist[i].substring(1);
			}
		}
		list = nlist
	}
	if(Array.isArray(list)){
		this.cursor["@type"] = "woql:Concatenate"
		this.cursor["woql:concat_list"] = this.wlist(list)
		this.cursor['woql:concatenated'] = this.cleanObject(v)
	}	
	return this;
}

WOQLQuery.prototype.concatenate = WOQLQuery.prototype.concat


WOQLQuery.prototype.join = function(input, glue, output){
	if(input && input == "woql:args") return ["woql:join_list", "woql:join_separator", "woql:join"]
	this.cursor["@type"] = "woql:Join"
	this.cursor['woql:join_list'] = this.wlist(input)
	this.cursor['woql:join_separator'] = this.cleanObject(glue)
	this.cursor['woql:join'] = this.cleanObject(output)
	return this;
}

WOQLQuery.prototype.sum = function (input, output) {
	if(input && input == "woql:args") return ["woql:sum_list", "woql:sum"]
	this.cursor["@type"] = "woql:Sum"
	this.cursor['woql:sum_list'] = this.wlist(input)
	this.cursor['woql:sum'] = this.cleanObject(output)
	return this;
}

WOQLQuery.prototype.start = function(start, query){
	if(start && start == "woql:args") return ["woql:start", "woql:query"]
	this.cursor["@type"] = "woql:Start"
	this.cursor['woql:start'] = this.cleanObject(start, "xsd:integer")
	return this.addSubQuery(query)
}

WOQLQuery.prototype.limit = function(limit, query){
	if(limit && limit == "woql:args") return ["woql:limit", "woql:query"]
	this.cursor["@type"] = "woql:Limit"
	this.cursor['woql:limit'] = this.cleanObject(limit, "xsd:integer")
	return this.addSubQuery(query)
}

WOQLQuery.prototype.re = function(p, s, m){
	if(p && p == "woql:args") return ["woql:pattern", "woql:regexp_string", "woql:regexp_list"]
	this.cursor["@type"] = "woql:Regexp"
	this.cursor['woql:pattern'] = this.cleanObject(p)
	this.cursor['woql:regexp_string'] = this.cleanObject(s)
	this.cursor['woql:regexp_list'] = this.wlist(m)
	return this;
}

WOQLQuery.prototype.regexp = WOQLQuery.prototype.re


WOQLQuery.prototype.length = function(va, vb){
	if(va && va == "woql:args") return ["woql:length_list", "woql:length"]
	this.cursor["@type"] = "woql:Length"
	this.cursor['woql:length_list'] = this.vlist(va)
	if(typeof vb == "number"){
		this.cursor['woql:length'] = this.cleanObject(vb, "xsd:nonNegativeInteger")
	}
	else if(typeof vb == "string"){
		this.cursor['woql:length'] = this.varj(vb)
	}
	return this;
}


/**
 * Negation of passed or chained query
 */
WOQLQuery.prototype.not = function (query) {
	if(query && query == "woql:args") return ["woql:query"]
	this.cursor["@type"] = "woql:Not"
	return this.addSubQuery(query)
}

WOQLQuery.prototype.cast = function(val, type, vb){
	if(val && val == "woql:args") return ["woql:typecast_value", 'woql:typecast_type', 'woql:typecast_result']
	this.cursor["@type"] = "woql:Typecast"
	this.cursor['woql:typecast_value'] = this.cleanObject(val)
	this.cursor['woql:typecast_type'] = this.cleanObject(type)
	this.cursor['woql:typecast_result'] = this.cleanObject(vb)
	return this;
}

WOQLQuery.prototype.typecast = WOQLQuery.prototype.cast

/**
 * Input format: 
 * order_by("v:A asc", "v:B", "v:C asc", query)
 * or
 * order_by("v:A asc", "v:B", "v:C asc").query()
 * or
 * order_by({"@type": "woql:VariableOrdering", "woql:index": { @value: 0, @type: "xsd:nonNegativeInteger"}})
 *
 */
WOQLQuery.prototype.order_by = function(...orderedVarlist){
	if(orderedVarlist && orderedVarlist[0] == "woql:args") return ["woql:variable_ordering", 'woql:query']
	this.cursor["@type"] = "woql:OrderBy"
	this.cursor["woql:variable_ordering"] = []
	if(!orderedVarlist || orderedVarlist.length == 0){
		return this.parameterError("Order by must be passed at least one variables to order the query")
	}
	let embedquery = (typeof orderedVarlist[orderedVarlist.length - 1] === 'object' && orderedVarlist[orderedVarlist.length - 1].json ? orderedVarlist.pop() : false)
	for(var i = 0; i<orderedVarlist.length; i++){
		if(typeof orderedVarlist[i] == "string" ){
			let obj = {
				"@type": "woql:VariableOrdering",
				"woql:index": this.jlt(i, "xsd:nonNegativeInteger"),
			}
			let cmds = orderedVarlist[i].split(" ")
			if(cmds[1] && cmds[1].trim() && cmds[1].trim().toLowerCase() == "asc"){
				obj['woql:ascending'] = this.jlt(true, "xsd:boolean")
			}
			let varname = cmds[0].trim()			
			obj['woql:variable'] =  this.varj(varname)
			this.cursor["woql:variable_ordering"].push(obj)
		}
		else {
			this.cursor["woql:variable_ordering"].push(orderedVarlist[i])
		}
	}
	return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.group_by = function(gvarlist, groupedvar, output, groupquery){
	if(gvarlist && gvarlist == "woql:args") return ["woql:variable_list", 'woql:group_var', "woql:grouped", "woql:query"]
	this.cursor["@type"] = "woql:GroupBy"
	this.cursor['woql:variable_list'] = [];
	if(typeof gvarlist == "string") gvarlist = [gvarlist]
	for(var i = 0; i<gvarlist.length; i++){
		let onevar = { 
			"@type": "woql:VariableListElement", 
			"woql:index" : this.jlt(i, "nonNegativeInteger"),
			"woql:variable" : this.varj(gvarlist[i])
		}
		this.cursor['woql:variable_list'].push(onevar)
	}
	this.cursor["woql:group_var"] = this.cleanObject(groupedvar)
	this.cursor["woql:grouped"] = this.cleanObject(output)
	return this.addSubQuery(groupquery)
}
