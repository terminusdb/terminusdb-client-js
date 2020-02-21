const UTILS = require('./utils');

/**
 * The WOQL object is a wrapper around the WOQLQuery object
 * Syntactic sugar to allow writing WOQL.triple()... instead of new WOQLQuery().triple()
 * Every function matches one of the public api functions of the woql query object
 */
let WOQL = {};

/*
 * We expose all the real woql predicates via the WOQL object,
 * for ease of typing all return a WOQL query object
 */

 /**
 * When the sub-query in Condition is met, the Update query is executed
 * @param {object or boolean} Query - WOQL Query object or bool
 * @param {object} Update - WOQL Query object, optional
 * @return {object} WOQLQuery
 *
 * Functions which take a query as an argument advance the cursor to make the chaining of queries fall into the corrent place in the encompassing json.
 */
WOQL.when = function(Query, Update){ return new WOQLQuery().when(Query, Update);}

/**
 * The Query in the Optional argument is specified as optional
 * @param {object} query - WOQL Query object
 * @example
 * WOQL.opt(WOQL.triple("v:optionalSubject", "v:optionalObject", "v:optionalValue"))
 * @return {object} WOQLQuery
 */
WOQL.opt = function(query){ return new WOQLQuery().opt(query); }

/**
 * Specifies the database URL that will be the default database for the enclosed query
 * @param {string} dburl - url of the database
 * @param {object} query - WOQL Query object, optional
 * @return {object} WOQLQuery
 */
WOQL.from = function(dburl, query){ return new WOQLQuery().from(dburl, query); }

/**
 * Sets the current output graph for writing output to.
 * @param {string} dburl - url of the database
 * @param {object} query - WOQL Query object, optional
 * @return {object} WOQLQuery
 */
WOQL.into = function(dburl, query){ return new WOQLQuery().into(dburl, query); }

/**
 * Specifies that only the first Number of rows will be returned
 * @param {integer} limit - number of maximum results returned
 * @param {object} query - WOQL Query object, optional
 * @return {object} WOQLQuery
 */
WOQL.limit = function(limit, query){ return new WOQLQuery().limit(limit, query); }

/**
 * Specifies that the start of the query returned
 * @param {integer} start - index of the frist result got returned
 * @param {object} query - WOQL Query object, optional
 * @return {object} WOQLQuery
 */
WOQL.start = function(start, query){ return new WOQLQuery().start(start, query); }

/**
 * Filters the query so that only the variables included in [V1...Vn] are returned in the bindings
 * @param list - only these variables are returned
 * @return {object} WOQLQuery
 */
WOQL.select = function(...list){ return new WOQLQuery().select(...list); }

/**
 * Creates a logical OR of the arguments
 * @param queries - WOQL Query objects
 * @return {object} WOQLQuery
 */
WOQL.or = function(...queries){	return new WOQLQuery().or(...queries); }

/**
 * Creates a logical AND of the arguments
 * @param queries - WOQL Query objects
 * @return {object} WOQLQuery
 */
WOQL.and = function(...queries){ return new WOQLQuery().and(...queries); }

/**
 * Creates a logical NOT of the arguments
 * @param queries - WOQL Query objects
 * @return {object} WOQLQuery
 */
WOQL.not = function(query){ return new WOQLQuery().not(query); }

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object)
 * @param {string} a - Subject
 * @param {string} b - Predicate
 * @param {string} c - Object
 * @return {object} WOQLQuery
 */
WOQL.triple = function(a, b, c){ return new WOQLQuery().triple(a, b, c); }

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)
 * @param {string} a - Subject
 * @param {string} b - Predicate
 * @param {string} c - Object
 * @param {string} d - Graph
 * @return {object} WOQLQuery
 */
WOQL.quad = function(a, b, c, d){ return new WOQLQuery().quad(a, b, c, d); }

/**
 * Returns true if ClassA is a sub-class of ClassB, according to the current DB schema
 * @param {string} a - classA
 * @param {string} b - classB, optional
 * @return {boolean} WOQLQuery
 */
WOQL.sub = function(a, b){ return new WOQLQuery().sub(a, b); }

/**
 * Matches if Instance is a member of Class, according to the current state of the DB
 * @param {string} a - classA
 * @param {string} b - classB, optional
 * @return {boolean} WOQLQuery
 */
WOQL.isa = function(a, b){	return new WOQLQuery().isa(a, b);	}

/**
 * Matches if a is equal to b
 * @param {string} a - object in the graph
 * @param {string} b - object in the graph
 * @return {object} WOQLQuery
 */
WOQL.eq = function(a, b){ return new WOQLQuery().eq(a, b);}

/**
 * A trimmed version of StringA (with leading and trailing whitespace removed) is copied into VariableA
 * @param {string} a - StringA
 * @param {string} b - VariableA
 * @return {object} WOQLQuery
 */
WOQL.trim = function(a, b){	return new WOQLQuery().trim(a, b);	}

/**
 * Deletes a node identified by an IRI or a JSON-LD document
 * @param {string} JSON_or_IRI - IRI or a JSON-LD document
 * @return {object} WOQLQuery
 */
WOQL.delete = function(JSON_or_IRI){ return new WOQLQuery().delete(JSON_or_IRI);	}

/**
 * Deletes any triples that match the rule [S,P,O]
 * @param {string} S - Subject
 * @param {string} P - Predicate
 * @param {string} O - Object
 * @return {object} WOQLQuery
 */
WOQL.delete_triple = function( S, P, O ){ return new WOQLQuery().delete_triple (S, P, O);	}

/**
 * Deletes any quads that match the rule [S, P, O, G] (Subject, Predicate, Object, Graph)
 * @param {string} S - Subject
 * @param {string} P - Predicate
 * @param {string} O - Object
 * @param {string} G - Graph
 * @return {object} WOQLQuery
 */
WOQL.delete_quad = function( S, P, O, G ){ return new WOQLQuery().delete_quad (S, P, O, G); }

/**
 * Adds triples according to the the pattern [S,P,O]
 * @param {string} S - Subject
 * @param {string} P - Predicate
 * @param {string} O - Object
 * @return {object} WOQLQuery
 */
WOQL.add_triple = function( S, P, O ){ return new WOQLQuery().add_triple (S, P, O); }

/**
 * Adds quads according to the pattern [S,P,O,G]
 * @param {string} S - Subject
 * @param {string} P - Predicate
 * @param {string} O - Object
 * @param {string} G - Graph
 * @return {object} WOQLQuery
 */
WOQL.add_quad = function( S, P, O, G ){ 	return new WOQLQuery().add_quad (S, P, O, G);}

/**
 * Imports the Target Resource to the variables defined in vars
 * @param {object or array} vars - If WQOLQuery object, cols will replace the target. If list, its column names of the source csv
 * @param {array or string} cols - List, if arr1 is list and it will take the variable names for the input. Str, if arr1 is WQOLQuery, it will be the target
 * @param {string} target - optional, target of the source data, used only if vars and cols is list
 * @return {object} WOQLQuery
 */
WOQL.get = function(vars, cols, target){	return new WOQLQuery().get(vars, cols, target); }

/**
 * Exports the Target Resource to the file file, with the variables defined in as
 * @param {object or array} as - WQOLQuery as object
 * @param {array or string} cols - List, if arr1 is list and it will take the variable names for the input. Str, if arr1 is WQOLQuery, it will be the target
 * @param {string} target - optional, target of the source data, used only if vars and cols is list
 * @return {object} WOQLQuery
 */
WOQL.put = function(as, query, file){	return new WOQLQuery().put(as, query, file); }


/**
 * Reads source into a temporary in-memory graph and runs the query on it.
 * @param {string} graph - graph id
 * @param {object} source - WOQLQuery object
 * @param {object} query - WOQLQuery object, optional
 * @return {object} WOQLQuery
 */
WOQL.with = function(graph, source, query){	return new WOQLQuery().with(graph, source, query); }

/**
 * Imports the value identified by Source to a Target variable
 * @param {string} map - Source
 * @param {string} vari - Target
 * @return {object} WOQLQuery
 */
WOQL.as = function(map, vari, ty){	return new WOQLQuery().as(map, vari, ty); }

/**
 * Provides details of a remote data source in a JSON format that includes a URL property
 * @param {object} url - remote data source in a JSON format
 * @param {object} opts - imput options, optional
 * @return {object} WOQLQuery
 */
WOQL.remote = function(url, opts){	return new WOQLQuery().remote(url, opts); }

/**
 * Provides details of a file source in a JSON format that includes a URL property
 * @param {object} url - file data source in a JSON format
 * @param {object} opts - imput options, optional
 * @return {object} WOQLQuery
 */
WOQL.file = function(url, opts){	return new WOQLQuery().file(url, opts); }


/**
 * Provides details of a file source in a JSON format that includes a URL property
 * @param {object} url - file data source in a JSON format
 * @param {object} opts - imput options, optional
 * @return {object} WOQLQuery
 */
WOQL.post = function(url, opts){	return new WOQLQuery().post(url, opts); }


/**
 * Create a list of variables for WOQL
 * @param vars - variables to be put in the list
 * @return {object} WOQLQuery
 */
WOQL.list = function(...vars){	return new WOQLQuery().list(...vars); }

/**
 * Orders the results by the list of variables including in gvarlist, asc_or_desc is a WOQL.asc or WOQ.desc list of variables
 * @param {array or object} gvarlist - list of variables to order
 * @param {object} asc_or_desc - WOQL.asc or WOQ.desc, optional, default is asc
 * @param {object} query - WOQLQuery object, optional
 * @return {object} WOQLQuery
 */
WOQL.order_by = function(asc_or_desc, query){	return new WOQLQuery().order_by(asc_or_desc, query); }

/**
 * Orders the list by ascending order
 * @param {array or string} varlist_or_var - list of variables to order
 * @return {object} WOQLQuery
 */
WOQL.asc = function(varlist_or_var){	return new WOQLQuery().asc(varlist_or_var); }

/**
 * Orders the list by descending value
 * @param {array or string} varlist_or_var - list of variables to order
 * @return {object} WOQLQuery
 */
WOQL.desc = function(varlist_or_var){	return new WOQLQuery().desc(varlist_or_var); }

/**
 * Groups the results of groupquery together by the list of variables gvarlist, using the variable groupedvar as a grouping and saves the result into variable output.
 * @param {array or object} gvarlist - list of variables to group
 * @param {array or string} groupedvar - grouping variable(s)
 * @param {object} groupquery - WOQLQuery object
 * @param {string} output - output variable, optional
 * @return {object} WOQLQuery
 */
WOQL.group_by = function(gvarlist, groupedvar, groupquery, output){	return new WOQLQuery().group_by(gvarlist, groupedvar, groupquery, output); }

/* String and other processing functions */

/**
 * Concatenates the list of variables into a string and saves the result in v
 * @param {array} list - list of variables to concatenate
 * @param {string} v - saves the results
 * @return {object} WOQLQuery
 */
WOQL.concat = function(list, v){	return new WOQLQuery().concat(list, v); }

/**
 * Changes a string to lower-case - input is in u, output in l
 * @param {string} u - input string
 * @param {string} l - stores output
 * @return {object} WOQLQuery
 */
WOQL.lower = function(u, l){	return new WOQLQuery().lower(u, l); }

/**
 * Pads out the string input to be exactly len long by appending the pad character pad to form output
 * @param {string} input - input string
 * @param {string} pad - padding character(s)
 * @param {integer} len - length to pad
 * @param {string} output - stores output
 * @return {object} WOQLQuery
 */
WOQL.pad = function(input, pad, len, output){	return new WOQLQuery().pad(input, pad, len, output); }

/**
 * Joins a list variable together (input) into a string variable (output) by glueing the strings together with glue
 * @param {array} input - a list of variables
 * @param {string} glue - joining character(s)
 * @param {string} output - variable that stores output
 * @return {object} WOQLQuery
 */
WOQL.join = function(input, glue, output){	return new WOQLQuery().join(input, glue, output); }

/**
 * Splits a variable apart (input) into a list of variables (output) by separating the strings together with separator
 * @param {string} input - a string or variable
 * @param {string} separator - character string to separate string into list
 * @param {string} output - variable that stores output list
 * @return {object} WOQLQuery
 */
WOQL.split = function(input, separator, output){	return new WOQLQuery().split(input, separator, output); }

/**
 * Iterates through a list and returns a value for each member
 * @param {string} El - a variable representing an element of the list
 * @param {string} List - A list variable
 * @return {object} WOQLQuery
 */
WOQL.member = function(El, List){	return new WOQLQuery().member(El, List); }

/**
 * Generates an ID for a node as a function of the passed VariableList with a specific prefix (URL base). If the values of the passed variables are the same, the output will be the same
 * @param {string} prefix - prefix for the id
 * @param {string} vari - variable to generate id for
 * @param {string} type - the variable to hold the id
 * @return {object} WOQLQuery
 */
WOQL.unique = function(prefix, vari, type){	return new WOQLQuery().unique(prefix, vari, type); }

/**
 * Generates an ID for a node as a function of the passed VariableList with a specific prefix (URL base). If the values of the passed variables are the same, the output will be the same
 * @param {string} prefix - prefix for the id
 * @param {string or array} vari - variable to generate id for
 * @param {string} type - the variable to hold the id
 * @param {string} output - idgen mode
 * @return {object} WOQLQuery
 */
WOQL.idgen = function(prefix, vari, type, output){	return new WOQLQuery().idgen(prefix, vari, type, output); }

/**
 * Changes the type of va to type and saves the return in vb
 * @param {string} vara - original variable
 * @param {string} type - type to be changed
 * @param {string} varb - save the return variable
 * @return {object} WOQLQuery
 */
WOQL.typecast = function(vara, type, varb){	return new WOQLQuery().typecast(vara, type, varb); }
WOQL.cast = WOQL.typecast;

/**
 * Regular Expression Call
 * @param {string} pattern - regex pattern
 * @param {string} test - string to be matched
 * @param {string or array or object} matches - store list of matches
 * @return {object} WOQLQuery
 *
 * p is a regex pattern (.*) using normal regular expression syntax, the only unusual thing is that special characters have to be escaped twice, s is the string to be matched and m is a list of matches:
 * e.g. WOQL.re("(.).*", "hello", ["v:All", "v:Sub"])
 */
WOQL.re = function(pattern, test, matches){	return new WOQLQuery().re(pattern, test, matches); }


/**
 * Compares the value of v1 against v2 and returns true if v1 is less than v2
 * @param {string} v1 - first variable to compare
 * @param {string} v2 - second variable to compare
 * @return {object} WOQLQuery
 */
WOQL.less = function(v1, v2){	return new WOQLQuery().less(v1, v2); }

/**
 * Compares the value of v1 against v2 and returns true if v1 is greater than v2
 * @param {string} v1 - first variable to compare
 * @param {string} v2 - second variable to compare
 * @return {object} WOQLQuery
 */
WOQL.greater = function(v1, v2){	return new WOQLQuery().greater(v1, v2); }


/* Mathematical Processing */

/**
 * Evaluates the Arithmetic Expression Arith and copies the output to variable V
 * @param {object} arith - query or JSON-LD representing the query
 * @param {string} v - output variable
 * @return {object} WOQLQuery
 */
WOQL.eval = function(arith, v){	return new WOQLQuery().eval(arith, v);}

/**
 * Adds numbers N1...Nn together
 * @param args - numbers to add together
 * @return {object} WOQLQuery
 */
WOQL.plus = function(...args){	return new WOQLQuery().plus(...args);}

/**
 * Adds a list of numbers together
 * @param input - input list variable
 * @param output - output numeric
 * @return {object} WOQLQuery
 */
WOQL.sum = function(input, output){	return new WOQLQuery().sum(input, output);}


/**
 * Subtracts Numbers N1..Nn
 * @param args - numbers to be subtracted
 * @return {object} WOQLQuery
 */
WOQL.minus = function(...args){	return new WOQLQuery().minus(...args); }

/**
 * Multiplies numbers N1...Nn together
 * @param args - numbers to be multiplied
 * @return {object} WOQLQuery
 */
WOQL.times = function(...args){	return new WOQLQuery().times(...args); }

/**
 * Divides numbers N1...Nn by each other left, to right precedence
 * @param args - numbers to tbe divided
 * @return {object} WOQLQuery
 */
WOQL.divide = function(...args){ return new WOQLQuery().divide(...args); }

/**
 * Raises A to the power of B
 * @param {integer or double} a - base number
 * @param {integer or double} b - power of
 * @return {object} WOQLQuery
 */
WOQL.exp = function(a, b){	return new WOQLQuery().exp(a, b); }

/**
 * Division - integer division - args are divided left to right
 * @param args - numbers for division
 * @return {object} WOQLQuery
 */
WOQL.div = function(...args){	return new WOQLQuery().div(...args); }

/**
 * Adds a text comment to a query - can also be used to wrap any part of a query to turn it off
 * @param {string} arg - text comment
 * @return {object} WOQLQuery
 */
WOQL.comment = function(arg){	return new WOQLQuery().comment(arg); }

/**
 * Calculates the length of the value in va and stores it in vb
 * @param {string} var1 - value to calculate length
 * @param {string} res - stores result
 * @return {object} WOQLQuery
 */
WOQL.length = function(var1, res){	return new WOQLQuery().length(var1, res);}


//language extensions that can be chained after 'grounded' stuff (clauses with a specific subject) sub, isa, delete_triple, add_triple, delete_quad, add_quad, node
//WOQL.value = function(vars){	return new WOQLQuery().list(vars); }

/**
 * Selects everything as triples in the graph identified by GraphIRI into variables Subj, Pred, Obj - by default they are "v:Subject", "v:Predicate", "v:Object"
 * @param {string} G - graphIRI
 * @param {string} S - target subject
 * @param {string} P - target predicate
 * @param {string} O - target object
 * @return {object} WOQLQuery
 */
WOQL.star = function(G, S, P, O){	return new WOQLQuery().star(G, S, P, O); }

/**
 * Selects nodes with the ID NodeID as the subject of subsequent sub-queries. The second argument PatternType specifies what type of sub-queries are being constructed, options are: triple, quad, update_triple, update_quad, delete_triple, delete_quad
 * @param {string} nodeid - node to be selected
 * @param {string} type - pattern type, optional (default is triple)
 * @return {object} WOQLQuery
 */
WOQL.node = function(nodeid, type){	return new WOQLQuery().node(nodeid, type); }
//These ones are special ones for dealing with the schema only...

/**
 * Generates a new Class with the given ClassID and writes it to the DB schema
 * @param {string} classid - class to be added
 * @param {string} graph - target graph
 * @return {object} WOQLQuery
 */
WOQL.add_class = function(classid, graph){	return new WOQLQuery().add_class(classid, graph); }

/**
 * Generates a new Property with the given PropertyID and a range of type type and writes it to the DB schema
 * @param {string} propid - property id to be added
 * @param {string} type - type of the proerty
 * @param {string} graph - target graph, optional
 * @return {object} WOQLQuery
 */
WOQL.add_property = function(propid, type, graph){	return new WOQLQuery().add_property(propid, type, graph); }

/**
 * Generates a box class around a class (a property that has a name derived from the class which points at the class and a new class with name Scoped[ClassID]
 * This allows providing termporal scoping, etc to 
 * @param {string} prefix - url prefix that will be applied to new classes (default scm:)
 * @param {[classes]} classes - array of classnames, all non-abstract sub-classes will be boxed
 * @param {string} graph - target graph, optional - default is db:schema
 * @return {object} WOQLQuery
 */
WOQL.boxClasses = function(prefix, classes, except, graph){	return new WOQLQuery().boxClasses(prefix, classes, except, graph); }

WOQL.libs = function(...libs){ return new WOQLQuery().libs(...libs)}

WOQL.generateChoiceList = function(cls, clslabel, clsdesc, choices, graph, parent){ return new WOQLQuery().generateChoiceList(cls, clslabel, clsdesc, choices, graph, parent)}

/**
 * Deletes the Class with the passed ID form the schema (and all references to it)
 * @param {string} classid - class to be added
 * @param {string} graph - target graph
 * @return {object} WOQLQuery
 */
WOQL.delete_class = function(classid, graph){	return new WOQLQuery().delete_class(classid, graph); }

/**
 * Deletes the property with the passed ID from the schema (and all references to it)
 * @param {string} propid - property id to be added
 * @param {string} graph - target graph, optional
 * @return {object} WOQLQuery
 */
WOQL.delete_property = function(propid, graph){	return new WOQLQuery().delete_property(propid, graph); }


/**
 * Insert a node with a specific type in a graph
 * @param {string} Node - node to be insert
 * @param {string} Type - type of the node
 * @param {string} Graph - target graph, optional
 * @return {object} WOQLQuery
 */
WOQL.insert = function(Node, Type, Graph){
	var q = new WOQLQuery();
	if(Graph){
		return q.add_quad(Node, "rdf:type", q.cleanType(Type), Graph);
	}
	else {
		return q.add_triple(Node, "rdf:type", q.cleanType(Type));
	}
}

/**
 * Creates a new document class in the schema - equivalent to: add_quad(type, "rdf:type", "owl:Class", graph), add_quad(type, subclassof, tcs:Document, graph)
 * @param {string} Type - type of the docuemnt
 * @param {string} Graph - target graph, optional
 * @return {object} WOQLQuery
 */
WOQL.doctype = function(Type, Graph){
	return new WOQLQuery().add_class(Type, Graph).parent("Document");
}


/*
 * Beneath here are pseudo predicates - they belong to the javascript object
 * but not to the WOQL language
 */
//returns empty query object

/**
 * Creates a new Empty Query object
 * @return {object} WOQLQuery
 */
WOQL.query = function(){	return new WOQLQuery(); }

//loads query from json

/**
 * Generates a WOQLQuery object from the passed WOQL JSON
 * @param {object} json - JSON-LD object, optional
 * @return {object} WOQLQuery
 *
 * json version of query for passing to api
 */
WOQL.json = function(json){	return new WOQLQuery().json(json); }




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

/**
 * Takes an array of variables, an optional array of column names
 */
WOQLQuery.prototype.put = function(arr1, query, target){
	if(arr1.json){
		arr1 = arr1.json();
	}
	if(query.json){
		query = query.json();
	}
	this.cursor['put'] = [arr1, query];
	if(target){
		if(target.json) target = target.json();
		this.cursor['put'].push(target);
	}
	else {	
		this.cursor['put'].push({});
		this.cursor = this.cursor["put"][2];
	}
	return this;
}


/**
 * Takes an array of variables, an optional array of column names
 */
WOQLQuery.prototype.with = function(gid, remq, subq){
	this.cursor['with'] = [gid];
	if(remq){
		remq = (remq.json ? remq.json() : remq);
		if(subq){
			if(subq.json) subq = subq.json();
			this.cursor['with'] = [gid, remq, subq];
		}
		else {
			this.cursor['with'] = [gid, remq];
			//this.cursor = this.cursor["with"][2];
		}
	}
	else {
		this.cursor['with'][1] = remq;
		this.cursor = this.cursor["with"][2]; 
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

WOQLQuery.prototype.remote = function(json, opts){
	this.cursor['remote'] = (opts ? [json, opts] : [json]);
	return this;
}

WOQLQuery.prototype.post = function(json, opts){
	this.cursor['post'] = (opts ? [json, opts] : [json]);
	return this;
}

WOQLQuery.prototype.file = function(json, opts){
	this.cursor['file'] = (opts ? [json, opts] : [json]);
	return this;
}

WOQLQuery.prototype.order_by = function(asc_or_desc, query){
	let ovars = [];
	if(Array.isArray(asc_or_desc)){
		for(var i = 0; i<asc_or_desc.length; i++){
			ovars.push(asc_or_desc[i].json ? asc_or_desc[i].json() : asc_or_desc[i])
		}
	}
	else if(typeof asc_or_desc == "string"){
		ovars.push({"asc": [asc_or_desc]});
	}
	else {
		ovars.push(asc_or_desc.json ? asc_or_desc.json() : asc_or_desc)
	}
	this.cursor["order_by"] = [ovars]
	if(query){
		this.cursor["order_by"] .push(query.json ? query.json() : query);
	}
	else {
		this.cursor["order_by"].push({});
		this.cursor = this.cursor["order_by"][1]
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
		groupedvar = UTILS.addNamespaceToVariable(groupedvar);
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
		if(!Array.isArray(vari)) vari = [vari];
		let nvaris = [];
		for(var i = 0 ; i<vari.length; i++){
			let vr = vari[i];
			if(typeof vr == "string"){
				if(vr.substring(0,2) != "v:"){
					vr = {"@value" : vr, "@type": "xsd:string"}
				}
			}
			nvaris.push(vr);
		}
		this.cursor['idgen'].push({"list": nvaris})
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
		let nvaris = [];
		if(!Array.isArray(vari)) vari = [vari];
		for(var i = 0 ; i<vari.length; i++){
			let vr = vari[i];
			if(typeof vr == "string"){
				if(vr.substring(0,2) != "v:"){
					vr = {"@value" : vr, "@type": "xsd:string"}
				}
			}
			nvaris.push(vr);
		}
		this.cursor['unique'].push({"list": nvaris})
	}
	this.cursor['unique'].push(type);
	return this;
}

WOQLQuery.prototype.re = function(p, s, m){
	p = this.packString(p)
	s = this.packString(s)
	if(typeof m == "string") m = [m];
	if(!m.list){
		m = {list: m};
	}
	this.cursor['re'] = [p, s, m];
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
	var args = this.packStrings(nlist);
	if(v.indexOf(":") == -1) v = "v:" + v;
	this.cursor['concat'] = [{"list": args}, v];
	return this;
};

WOQLQuery.prototype.lower = function(u, l){
	this.cursor['lower'] = [u, l];
	return this;
};

WOQLQuery.prototype.pad = function(input, pad, len, output){
	pad = this.packString(pad)
	this.cursor['pad'] = [input, pad, len, output];
	return this;
}

WOQLQuery.prototype.member = function(El, List){
	this.cursor['member'] = [El, List];
	return this;
}

WOQLQuery.prototype.join = function(input, glue, output){
	glue = this.packString(glue);
	this.cursor['join'] = [input, glue, output];
	return this;
}

WOQLQuery.prototype.split = function(input, glue, output){
	glue = this.packString(glue);
	input = this.packString(input);
	this.cursor['split'] = [input, glue, output];
	return this;
}


WOQLQuery.prototype.less = function(v1, v2){
	v1 = (v1.json ? v1.json() : v1);
	v2 = (v2.json ? v2.json() : v2);
	this.cursor['less'] = [v1, v2];
	return this;
}

WOQLQuery.prototype.greater = function(v1, v2){
	v1 = (v1.json ? v1.json() : v1);
	v2 = (v2.json ? v2.json() : v2);
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
		this.cursor = (query.json ? query.json() : query);
	}
	return this;
};

WOQLQuery.prototype.select = function (...list) {
	this.cursor.select = list;
	const index = list.length;
	if (typeof this.cursor.select[index - 1] === 'object') {
		let embedquery = this.cursor.select[index - 1];
		this.cursor.select[index - 1] = (embedquery.json ? embedquery.json() : embedquery);
	} else {
		this.cursor.select[index] = {};
		this.cursor = this.cursor.select[index];
	}
	return this;
};

WOQLQuery.prototype.and = function (...queries) {
	this.cursor.and = this.cursor.and || [];
	for (let i = 0; i < queries.length; i++) {
		if (queries[i].contains_update) this.contains_update = true;
		var nquery = (queries[i].json ? queries[i].json() : queries[i]);
		if(nquery['and']){
			this.cursor.and = this.cursor.and.concat(nquery['and']);
		}
		else {
			this.cursor.and.push(nquery);
		}
	}
	return this;
};

WOQLQuery.prototype.or = function (...queries) {
	this.cursor.or = this.cursor.or || [];
	for (let i = 0; i < queries.length; i++) {
		if (queries[i].contains_update) this.contains_update = true;
		var nquery = (queries[i].json ? queries[i].json() : queries[i]);
		if(nquery['or']){
			this.cursor.and = this.cursor.or.concat(nquery['or']);
		}
		else {
			this.cursor.or.push(nquery);
		}
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


WOQLQuery.prototype.abstract = function(varname, gname){
	if(varname){
		gname = gname || "db:schema";
		return this.quad(varname, "tcs:tag", "tcs:abstract", gname);
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

WOQLQuery.prototype.sum = function (input, output) {
	this.cursor.sum = [input, output];
	return this.last();
}

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

//requires classes to have first character capitalised
WOQLQuery.prototype.boxClasses = function(prefix, classes, except, graph){	
	graph = (graph ? this.cleanGraph(graph) : "db:schema");
	prefix = prefix || "scm:";
	var subs = [];
	for(var i = 0; i<classes.length; i++){
		subs.push(WOQL.sub("v:Cid", this.cleanClass(classes[i])));
	}
	var nsubs = [];
	for(var i = 0; i<except.length; i++){
		nsubs.push(WOQL.not().sub("v:Cid", this.cleanClass(except[i])));
	}
	//property punning
	//generate a property id that is the same as the classname but starting with a lowercase letter
	let idgens = [
		WOQL.re("#(.)(.*)", "v:Cid", ["v:AllB", "v:FirstB", "v:RestB"]),
        WOQL.lower("v:FirstB", "v:Lower"),
        WOQL.concat(["v:Lower", "v:RestB"], "v:Propname"),
        WOQL.concat(["Scoped", "v:FirstB", "v:RestB"], "v:Cname"),
        WOQL.idgen(prefix, ["v:Cname"], "v:ClassID"),
        WOQL.idgen(prefix, ["v:Propname"], "v:PropID")
	];

    const filter = WOQL.and(
		WOQL.quad("v:Cid", "rdf:type", "owl:Class", graph),
		WOQL.not().abstract("v:Cid", graph),
		WOQL.or(...subs),
		WOQL.and(...nsubs),
		WOQL.and(...idgens),
        WOQL.quad("v:Cid", "rdfs:label", "v:Label", graph),
		WOQL.quad("v:Cid", "rdfs:comment", "v:Desc", graph)
    )
    return WOQL.when(filter, WOQL.and(
        WOQL.add_class("v:ClassID")
            .label("v:Label")
            .description("v:Desc"),
        WOQL.add_property("v:PropID", "v:Cid")
            .label("v:Label")
            .description("v:Desc")
		    .domain("v:ClassID")
    ));
}

WOQLQuery.prototype.generateChoiceList = function(cls, clslabel, clsdesc, choices, graph, parent){
    parent = parent || "scm:Enumerated";
    graph = graph || "db:schema";
    var confs = [
        WOQL.add_class(cls, graph)
            .label(clslabel)
            .description(clsdesc)
            .parent(parent)
    ]; 
    for(var i = 0; i<choices.length; i++){
        if(!choices[i]) continue;
        confs.push(WOQL.insert(choices[i][0], cls, graph)
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
        clist.push( WOQL.add_quad(lastid, "rdf:first", choices[i][0], graph))
        clist.push( WOQL.add_quad(lastid, "rdf:rest", nextid, graph));
        lastid = nextid;
    }
    //do the owl oneof
    let oneof = WOQL.and(
        WOQL.add_quad(cls, "owl:oneOf", listid, graph),
        ...clist
    )
    return WOQL.and(...confs, oneof);
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
	if(bits.length > 1) return WOQL.and(...bits);
	return bits[0];
}

WOQLQuery.prototype.loadXDD = function(graph){
	return WOQL.and(
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
	return WOQL.and(
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
	return WOQL.and(
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
	var dt = WOQL.insert(id, "rdfs:Datatype", graph).label(label);
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
	var box_class = WOQL.add_class(box_class_id).label(label).parent("scm:Box");
	if(descr) box_class.description(descr);
	var box_prop = WOQL.add_property(box_prop_id, datatype).label(label).domain(box_class_id)
	if(descr) box_prop.description(descr);
	return WOQL.and(box_class, box_prop);
}


WOQLQuery.prototype.as = function(a, b, c){
	if(!a) return;
	if(!this.asArray){
		this.asArray = true;
		this.query = [];
	}
	if(b){
		b = (b.indexOf(":") == -1 ? "v:" + b : b);
		var val = (typeof a == "object" ? a : { "@value" : a});

        if(c){
		    this.query.push({as: [val, b, c]});
        }else{
            this.query.push({as: [val, b]});
        }
	}
	else {
		a = (a.indexOf(":") == -1 ? "v:" + a : a);
		this.query.push({as: [a]});
	}
	return this;
}



/**
 * Internal Triple-builder functions which allow chaining of sub-queries
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
		//console.log(Subj, Pred, Obj);
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
		WOQL.eq("v:Docid", id),
		WOQL.or(
			WOQL.triple(id, "v:Outgoing", "v:Entid"),
			WOQL.triple("v:Entid", "v:Incoming", id)
		),
		WOQL.triple("v:Entid", "type", "v:Enttype"),
		WOQL.sub("v:Enttype", "tcs:Document"),
		WOQL.opt().triple("v:Entid", "rdfs:label", "v:Label"),
		WOQL.opt().quad("v:Enttype", "rdfs:label", "v:Class_Label", "db:schema")
	);
}

WOQLQuery.prototype.getAllDocumentConnections = function(){
	return this.and(
		WOQL.sub("v:Enttype", "tcs:Document"),
		WOQL.triple("v:doc1", "type", "v:Enttype"),
		WOQL.triple("v:doc1", "v:Predicate", "v:doc2"),
		WOQL.triple("v:doc2", "type", "v:Enttype2"),
		WOQL.sub("v:Enttype2", "tcs:Document"),
		WOQL.opt().triple("v:doc1", "rdfs:label", "v:Label1"),
		WOQL.opt().triple("v:doc2", "rdfs:label", "v:Label2"),
		WOQL.not().eq("v:doc1", "v:doc2")
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
							this.vocab[spl[0]] = spl[1];
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
WOQLQuery.prototype.execute = function(client,fileList){
	if(!this.query["@context"]){
		this.query['@context'] = client.connection.getJSONContext();
		for(var pref in UTILS.standard_urls){
			if(typeof this.query['@context'][pref] == "undefined")
			this.query['@context'][pref] = UTILS.standard_urls[pref];
		}
		this.query["@context"]["_"] = "_:";		
		var json = this.json();
	}
	else {
		var json = this.json();
	}
	const opts=fileList ? {fileList:fileList} : null;
	if(this.contains_update){
		//return client.select(false, json,opts);
		return client.update(false, json,opts);
	}
	else {
		//return client.select(false, json,opts);
		return client.update(false, json,opts);
	}
}

/*
 * Internal State Control Functions
 * Not part of public API -
 */

 /**
  * Wraps literal input in a json carriage 
  */
 WOQLQuery.prototype.packString = function(v){
	if(typeof v == "string" && v.substring(0,2) != "v:"){
		return {"@value" : v, "@type": "xsd:string"}
	}
	return v;
 }

 /**
  * Wraps an array of literal inputs in a json carriage where appropriate
  */
 WOQLQuery.prototype.packStrings = function(vs){
	 let nv = [];
	 for(var i = 0; i<vs.length; i++){
		if(vs[i]) nv.push(this.packString(vs[i]))
	 }
	 return nv;
 }

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
			if(!this.hasShortcut(operator, val, indent)){
				str += this.uncleanArguments(operator,  val, indent, show_context);
			}
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
	const non_chaining_operators = ["and", "or", "remote", "file", "re"];
	if(lastArg && typeof lastArg == "object" && typeof lastArg['@value'] == "undefined"  && typeof lastArg['@type'] == "undefined"  && typeof lastArg['value'] == "undefined" && non_chaining_operators.indexOf(operator) == -1){
		return true;
	}
	return false;
}

/**
 * Transforms arguments to WOQL functions from the internal (clean) version, to the WOQL.js human-friendly version
 */
WOQLQuery.prototype.uncleanArguments = function(operator, args, indent, show_context){
	if(this.hasShortcut(operator, args)){
		return this.getShortcut(operator, args, indent);
	}
	let str = '(';
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
	const args_take_newlines = ["and", "or"];
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
		//if(val.substring(0, 2) == "v:") val = val.substring(2);
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

WOQLQuery.prototype.hasShortcut = function(operator, args, indent){
	if(operator == "true") return true;
	return false;
}

WOQLQuery.prototype.getShortcut = function(operator, args, indent){
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

/**
 * @file Triple Builder
 * higher level composite queries - not language or api elements
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
		var cardcls = this.subject;
		this.subject = od;
		this.addPO("rdfs:subClassOf", cardcls);
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
