
/**
 * Contains definitions of the WOQL functions which map directly to JSON-LD types
 * All other calls and queries can be composed from these
 */

WOQLQuery.prototype.using = function(Collection, Subq){
	this.cursor['@type'] = "woql:Using"
	if(!Collection || typeof Collection != "string"){
		return this.parameterError("The first parameter to using must be a Collection ID (string)")
	}
	this.cursor['woql:collection'] = this.jlt(Collection)
	return this.addSubQuery(Subq)
}

WOQLQuery.prototype.comment = function(comment, Subq){
	this.cursor['@type'] = "woql:Comment"
	this.cursor['woql:comment'] = this.jlt(comment)
	return this.addSubQuery(Subq)
}

WOQLQuery.prototype.select = function (...list) {
	this.cursor['@type'] = "woql:Select"
	if(!list || list.length <= 0){
		return this.parameterError("Select must be given a list of variable names")
	}
	let embedquery = ((typeof this.cursor.select[list.length - 1] === 'object') ? list.pop() : false);
	this.cursor['woql:variable_list'] = [];//"woql:Select"
	for(var i = 0; i<list.length; i++){
		let onevar = { 
			"@type": "woql:VariableListElement", 
			"woql:index" : this.jlt(i, "nonNegativeInteger"),
			"woql:variable_name" : UTILS.addNamespaceToVariable(list[i])
		}
		this.cursor['woql:variable_list'].push(onevar)
	}
	this.addSubQuery(embedquery)
	return this
};

WOQLQuery.prototype.and = function (...queries) {
	this.cursor['@type'] = "woql:And"
	if(!queries || queries.length <= 0){
		return this.parameterError("And must be given a list of sub-queries as a parameter")
	}
	if(typeof this.cursor['woql:query_list'] == "undefined") this.cursor['woql:query_list'] = []
	for (let i = 0; i < queries.length; i++) {
		let qobj = this.jobj(queries[i])
		let onevar = { 
			"@type": "woql:QueryListElement", 
			"woql:index" : this.jlt(i, "nonNegativeInteger"),
			"woql:query" : qobj
		}
		this.cursor['woql:query_list'].push(onevar)		
	}
	return this;
};

WOQLQuery.prototype.or = function (...queries) {
	this.cursor['@type'] = "woql:Or"
	if(!queries || queries.length <= 0){
		return this.parameterError("Or must be given a list of sub-queries as a parameter")
	}
	if(typeof this.cursor['woql:query_list'] == "undefined") this.cursor['woql:query_list'] = []
	for (let i = 0; i < queries.length; i++) {
		let qobj = this.jobj(queries[i])
		let onevar = { 
			"@type": "woql:QueryListElement", 
			"woql:index" : this.jlt(i, "nonNegativeInteger"),
			"woql:query" : qobj
		}
		this.cursor['woql:query_list'].push(onevar)		
	}
	return this;
};

WOQLQuery.prototype.from = function(graph_filter, query){
	this.cursor['@type'] = "woql:From"
	if(!graph_filter || typeof graph_filter != "string"){
		return this.parameterError("The first parameter to from must be a Graph Filter Expression (string)")
	}
	this.cursor['woql:graph_filter'] = this.jlt(graph_filter)
	return this.addSubQuery(query)
}

WOQLQuery.prototype.into = function(graph_descriptor, query){
	this.cursor['@type'] = "woql:Into"
	if(!graph_descriptor || typeof graph_descriptor != "string"){
		return this.parameterError("The first parameter to from must be a Graph Filter Expression (string)")
	}
	this.cursor['woql:graph'] = this.jlt(graph_descriptor)
	return this.addSubQuery(query)
};

WOQLQuery.prototype.triple = function(a, b, c){
	this.cursor['@type'] = "woql:Triple"
	if(!a || !b || !c) return this.parameterError("Triple takes three parameters, the first two should be URIs, the third can be a URI or a literal")
	this.cursor['woql:subject'] = this.cleanSubject(a);
	this.cursor['woql:predicate'] = this.cleanPredicate(b);
	this.cursor['woql:object'] = this.cleanObject(c);
	return this;
}

WOQLQuery.prototype.quad = function(a, b, c, g){
	this.triple(a, b, c);
	if(!g) return this.parameterError("Quad takes four parameters, the last should be a graph filter")
	this.cursor['@type'] = "woql:Quad"
	this.cursor['woql:graph_filter'] = this.cleanGraph(g);
	return this
}

WOQLQuery.prototype.sub = function(a, b){
	if(!a || !b) return this.parameterError("Subsumption takes two parameters, both URIs")
	this.cursor['@type'] = "woql:Subsumption"
	this.cursor["woql:parent"] = this.cleanClass(a);
	this.cursor["woql:child"] = this.cleanClass(b);
	return this;
}

WOQLQuery.prototype.subsumption = WOQLQuery.prototype.sub

WOQLQuery.prototype.eq = function(a, b){
	if(!a || !b) return this.parameterError("Equals takes two parameters")
	this.cursor['@type'] = "woql:Equals"
	this.cursor['woql:left'] = this.cleanObject(a)
	this.cursor['woql:right'] = this.cleanObject(b)
	return this
};

WOQLQuery.prototype.equals = WOQLQuery.prototype.eq

WOQLQuery.prototype.substr = function(String, Before, Length, After, SubString){
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
	this.cursor['woql:substring'] = this.cleanObject(SubString)
	this.cursor['woql:length'] = this.cleanObject(Length, "xsd:nonNegativeInteger")
	this.cursor['woql:before'] = this.cleanObject(Before, "xsd:nonNegativeInteger")
	this.cursor['woql:after'] = this.cleanObject(After, "xsd:nonNegativeInteger")
	return this
};

WOQLQuery.prototype.substring = WOQLQuery.prototype.substr


WOQLQuery.prototype.update = function(docjson){
	this.cursor['@type'] = "woql:Update"
	this.cursor['woql:document'] = [ docjson ];
	return this.updated()
}

WOQLQuery.prototype.delete = function (JSON_or_IRI) {
	this.cursor['@type'] = "woql:Delete"
	this.cursor['woql:document'] = [ JSON_or_IRI ];
	return this.updated()
}

/**
 * Takes an as structure
 */
WOQLQuery.prototype.get = function(asvars, query_resource){
	this.cursor['@type'] = "woql:Get"
	this.cursor['woql:as_vars'] = (asvars.json() ? asvars.json() : asvars)
	if(query_resource){
		this.cursor['woql:query_resource'] = query_resource;
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
WOQLQuery.prototype.put = function(asvars, query, query_resource){
	this.cursor['@type'] = "woql:Put"
	this.cursor['woql:as_vars'] = (asvars.json() ? asvars.json() : asvars)
	if(query_resource){
		this.cursor['woql:query_resource'] = query_resource;
	}
	else {
		this.cursor['woql:query_resource'] = {}
	}
	this.cursor = this.cursor['woql:query_resource'];
	return this.addSubQuery(query)
}

WOQLQuery.prototype.as = function(colname_or_index, varname, vartype){
	this.cursor['@type'] = "woql:AsVars"
	let asvar = { "woql:var":  UTILS.addNamespaceToVariable(varname) }
	if(vartype) asvar["woql:var_type"] = this.jlt(vartype, "xsd:anyURI")
	if(colname_or_index == "undefined" || colname_or_index === false){
		if(!this.cursor['woql:indexed_as_var']) this.cursor['woql:indexed_as_var'] = []
		asvar["@type"] = "woql:IndexedAsVar"
		asvar['woql:index'] = this.jlt(this.cursor['woql:indexed_as_var'].length, "xsd:nonNegativeInteger")
		this.cursor['woql:indexed_as_var'].push(asvar)
	}
	if(Number.isInteger(colname_or_index)){
		if(!this.cursor['woql:indexed_as_var']) this.cursor['woql:indexed_as_var'] = []
		asvar["@type"] = "woql:IndexedAsVar"
		asvar['woql:index'] = this.jlt(colname_or_index, "xsd:nonNegativeInteger")
		this.cursor['woql:indexed_as_var'].push(asvar)
	}
	else if(typeof colname_or_index == "string" ){
		if(!this.cursor['woql:named_as_var']) this.cursor['woql:named_as_var'] = []
		asvar["@type"] = "woql:NamedAsVar"
		asvar["woql:identifier"] = this.jlt(colname_or_index)
		this.cursor['woql:named_as_var'].push(asvar)
	}
	return this
}

WOQLQuery.prototype.file = function(fpath, opts){
	this.cursor['@type'] = "woql:FileResource"
	this.cursor['woql:file'] = [{"@type": "xsd:string", "@value": fpath}];
	return this.wform(opts)
}

WOQLQuery.prototype.remote = function(uri, opts){
	this.cursor['@type'] = "woql:RemoteResource"
	this.cursor['woql:remote_uri'] = [{"@type": "xsd:anyURI", "@value": uri}];
	return this.wform(opts)
}

WOQLQuery.prototype.post = function(fpath, opts){
	this.cursor['@type'] = "woql:PostResource"
	this.cursor['woql:file'] = [{"@type": "xsd:string", "@value": fpath}];
	return this.wform(opts)
}

WOQLQuery.prototype.delete_triple = function( Subject, Predicate, Object_or_Literal ){
	this.triple(Subject, Predicate, Object_or_Literal)
	this.cursor["@type"] = "woql:DeleteTriple"
	return this.updated()
}

WOQLQuery.prototype.add_triple = function( Subject, Predicate, Object_or_Literal ){
	this.triple(Subject, Predicate, Object_or_Literal)
	this.cursor["@type"] = "woql:AddTriple"
	return this.updated()
}

WOQLQuery.prototype.delete_quad = function( Subject, Predicate, Object_or_Literal, Graph ){
	this.quad(Subject, Predicate, Object_or_Literal, Graph)
	this.cursor["@type"] = "woql:DeleteQuad"
	return this.updated()
}

WOQLQuery.prototype.add_quad = function( Subject, Predicate, Object_or_Literal, Graph){
	this.quad(Subject, Predicate, Object_or_Literal, Graph)
	this.cursor["@type"] = "woql:AddQuad"
	return this.updated()
}


/*
 * Functions which take a query as an argument advance the cursor to make the chaining of queries fall
 * into the corrent place in the encompassing json
 */
WOQLQuery.prototype.when = function(Query, Consequent){
	this.cursor["@type"] = "woql:When"
	this.addSubQuery(Query)
	if(Consequent){
		this.cursor["woql:consequent"] = Consequent;
	}
	else {
		this.cursor["woql:consequent"] = new WOQLQuery()
	}
	this.cursor = this.cursor["woql:consequent"]
	return this
}


WOQLQuery.prototype.trim = function(untrimmed, trimmed){
	this.cursor["@type"] = "woql:Trim"
	this.cursor['woql:untrimmed'] = this.cleanObject(untrimmed)
	this.cursor['woql:trimmed'] = this.cleanObject(trimmed)
	return this
	//return this.chainable('trim', b);
}

WOQLQuery.prototype.eval = function(arith, res){
	this.cursor["@type"] = "woql:Eval"
	this.cursor['woql:expression'] = arith
	this.cursor['woql:result'] = this.cleanObject(res)
	return this;
	return this.chainable('eval', v);
}

WOQLQuery.prototype.plus = function (...args) {
	this.cursor["@type"] = "woql:Plus"
	this.cursor['woql:first'] = this.arop(args.unshift())
	if(args.length > 1){
		this.cursor['woql:second'] = new WOQLQuery().plus(args)
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
};

WOQLQuery.prototype.minus = function (...args) {
	this.cursor["@type"] = "woql:Minus"
	this.cursor['woql:first'] = this.arop(args.unshift())
	if(args.length > 1){
		this.cursor['woql:second'] = new WOQLQuery().minus(args)
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
};

WOQLQuery.prototype.times = function (...args) {
	this.cursor["@type"] = "woql:Times"
	this.cursor['woql:first'] = this.arop(args.unshift())
	if(args.length > 1){
		this.cursor['woql:second'] = new WOQLQuery().times(args)
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
};


WOQLQuery.prototype.divide = function (...args) {
	this.cursor["@type"] = "woql:Divide"
	this.cursor['woql:first'] = this.arop(args.unshift())
	if(args.length > 1){
		this.cursor['woql:second'] = new WOQLQuery().divide(args)
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
};

WOQLQuery.prototype.div = function (...args) {
	this.cursor["@type"] = "woql:Div"
	this.cursor['woql:first'] = this.arop(args.unshift())
	if(args.length > 1){
		this.cursor['woql:second'] = new WOQLQuery().div(args)
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
};

WOQLQuery.prototype.exp = function (a, b) {
	this.cursor["@type"] = "woql:Exp"
	this.cursor['woql:first'] = this.arop(args.unshift())
	if(args.length > 1){
		this.cursor['woql:second'] = new WOQLQuery().exp(args)
	}
	else {
		this.cursor['woql:second'] =  this.arop(args[0])
	}
	return this;
};

WOQLQuery.prototype.floor = function (a) {
	this.cursor["@type"] = "woql:Floor"
	this.cursor['woql:argument'] = this.arop(a)
	return this;
};

WOQLQuery.prototype.isa = function(a, b){
	this.cursor["@type"] = "woql:Floor"
	this.cursor['woql:element'] = this.cleanSubject(a)
	this.cursor['woql:of_type'] = this.cleanClass(a)
	return this
}

WOQLQuery.prototype.like = function(a, b, dist){
	this.cursor["@type"] = "woql:Like"
	this.cursor['woql:left'] = this.cleanObject(a)
	this.cursor['woql:right'] = this.cleanObject(b)
	if(dist){
		this.cursor['woql:like_similarity'] = this.cleanObject(dist, "xsd:decimal")
	}
	return this
}

WOQLQuery.prototype.less = function(v1, v2){
	this.cursor["@type"] = "woql:Less"
	this.cursor['woql:left'] = this.cleanObject(v1)
	this.cursor['woql:right'] = this.cleanObject(v2)
	return this;
}

WOQLQuery.prototype.greater = function(v1, v2){
	this.cursor["@type"] = "woql:Greater"
	this.cursor['woql:left'] = this.cleanObject(v1)
	this.cursor['woql:right'] = this.cleanObject(v2)
	return this;
}

WOQLQuery.prototype.opt = function(query){
	this.cursor["@type"] = "woql:Optional"
	this.addSubQuery(query)
	return this;
};

WOQLQuery.prototype.unique = function(prefix, vari, type){
	this.cursor["@type"] = "woql:Unique"
	this.cursor["woql:base"] = this.cleanSubject(prefix)
	this.cursor["woql:uri"] = this.cleanClass(type)
	this.cursor["woql:key_list"] = this.vlist(vari)
	return this
}

WOQLQuery.prototype.idgen = function(prefix, vari, type){
	this.cursor["@type"] = "woql:IDGenerator"
	this.cursor["woql:base"] = this.cleanSubject(prefix)
	this.cursor["woql:uri"] = this.cleanClass(type)
	this.cursor["woql:key_list"] = this.vlist(vari)
	return this
}

WOQLQuery.prototype.idgenerator = WOQLQuery.prototype.idgen


WOQLQuery.prototype.upper = function(u, l){
	this.cursor["@type"] = "woql:Upper"
	this.cursor['woql:left'] = this.cleanObject(u)
	this.cursor['woql:right'] = this.cleanObject(l)
	return this;
};

WOQLQuery.prototype.lower = function(u, l){
	this.cursor["@type"] = "woql:Lower"
	this.cursor['woql:left'] = this.cleanObject(u)
	this.cursor['woql:right'] = this.cleanObject(l)
	return this;
};

WOQLQuery.prototype.pad = function(input, pad, len, output){
	this.cursor["@type"] = "woql:Pad"
	this.cursor['woql:pad_string'] = this.cleanObject(input)
	this.cursor['woql:pad_char'] = this.cleanObject(pad)
	this.cursor['woql:pad_times'] = this.cleanObject(len, "xsd:integer")
	this.cursor['woql:pad_result'] = this.cleanObject(output)
	return this;
}

WOQLQuery.prototype.split = function(input, glue, output){
	this.cursor["@type"] = "woql:Split"
	this.cursor['woql:split_string'] = this.cleanObject(input)
	this.cursor['woql:split_pattern'] = this.cleanObject(glue)
	this.cursor['woql:split_list'] = this.cleanObject(output)
	return this;
}


WOQLQuery.prototype.member = function(El, List){
	this.cursor["@type"] = "woql:Member"
	this.cursor['woql:member'] = this.cleanObject(El)
	this.cursor['woql:member_list'] = this.cleanObject(List)
	return this;
}

WOQLQuery.prototype.concat = function(list, v){
	if(typeof list == "string"){
		var nlist = list.split(/(v:[\w_]+)\b/);
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
	this.cursor["@type"] = "woql:Concatenate"
	
	//var args = this.packStrings(nlist);
	this.cursor['woql:concatenated'] = this.cleanObject(v)
	//this.cursor['concat'] = [{"list": args}, v];
	return this;
};

WOQLQuery.prototype.concatenate = WOQLQuery.prototype.concat


WOQLQuery.prototype.join = function(input, glue, output){
	this.cursor["@type"] = "woql:Join"
	this.cursor['woql:join_separator'] = this.cleanObject(glue)
	this.cursor['woql:join_list'] = this.cleanObject(input)
	this.cursor['woql:join'] = this.cleanObject(output)
	return this;
}

WOQLQuery.prototype.sum = function (input, output) {
	this.cursor["@type"] = "woql:Sum"
	this.cursor['woql:sum_list'] = this.cleanObject(input)
	this.cursor['woql:sum'] = this.cleanObject(output)
	return this;
}

WOQLQuery.prototype.start = function(start, query){
	this.cursor["@type"] = "woql:Start"
	this.cursor['woql:start'] = this.cleanObject(start, "xsd:integer")
	this.addSubQuery(query)
};

WOQLQuery.prototype.limit = function(limit, query){
	this.cursor["@type"] = "woql:Limit"
	this.cursor['woql:limit'] = this.cleanObject(limit, "xsd:integer")
	this.addSubQuery(query)
}

WOQLQuery.prototype.re = function(p, s, m){
	this.cursor["@type"] = "woql:Regexp"
	this.cursor['woql:pattern'] = this.cleanObject(p)
	this.cursor['woql:regexp_string'] = this.cleanObject(s)
	this.cursor['woql:regexp_list'] = this.cleanObject(m)
	return this;
}

WOQLQuery.prototype.regexp = WOQLQuery.prototype.re


WOQLQuery.prototype.length = function(va, vb){
	this.cursor["@type"] = "woql:Length"
	this.cursor['woql:length_list'] = this.cleanObject(va)
	this.cursor['woql:length'] = this.cleanObject(vb, "xsd:integer")
	return this;
}


/**
 * Negation of passed or chained query
 */
WOQLQuery.prototype.not = function (query) {
	this.cursor["@type"] = "woql:Not"
	return this.addSubQuery(query)
};

WOQLQuery.prototype.cast = function(val, type, vb){
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
			if(cmds[1].trim() && cmds[1].trim().toLowerCase() == "asc"){
				obj['woql:ascending'] = this.jlt(true, "xsd:boolean")
			}
			let varname = cmds[0].trim()
			obj['woql:variable_name'] =  UTILS.addNamespaceToVariable(varname)
			this.cursor["woql:variable_ordering"].push(obj)
		}
		else {
			this.cursor["woql:variable_ordering"].push(orderedVarlist[i])
		}
	}
	return this.addSubQuery(embedquery)
}

WOQLQuery.prototype.group_by = function(gvarlist, groupedvar, output, groupquery){
	this.cursor["@type"] = "woql:GroupBy"
	this.cursor["woql:group_var"] = this.cleanObject(groupedvar)
	this.cursor["woql:grouped"] = this.cleanObject(output)
	this.cursor['woql:variable_list'] = [];
	for(var i = 0; i<gvarlist.length; i++){
		let onevar = { 
			"@type": "woql:VariableListElement", 
			"woql:index" : this.jlt(i, "nonNegativeInteger"),
			"woql:variable_name" : UTILS.addNamespaceToVariable(gvarlist[i])
		}
		this.cursor['woql:variable_list'].push(onevar)
	}
	return this.addSubQuery(groupquery)
}

/**
 * One outstanding issue
 */
WOQLQuery.prototype.list  = function(...vars){
	this.cursor['list'] = vars;
	return this;
}