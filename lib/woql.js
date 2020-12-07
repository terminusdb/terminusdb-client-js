const WOQLQuery = require('./query/woqlCore')
const WOQLJSON = require('./query/woqlQuery')
const WOQLBuilder = require('./query/woqlBuilder')
const WOQLSchema = require('./query/woqlSchema')
const WOQLPrinter = require('./query/woqlPrinter')
const WOQLLibrary = require('./query/woqlLibrary')
/**
 * The WOQL object is a wrapper around the WOQLQuery object
 * Syntactic sugar to allow writing WOQL.triple()... instead of new WOQLQuery().triple()
 * Every function matches one of the public api functions of the woql query object
 */
let WOQL = {}

/*
 * We expose all the real woql predicates via the WOQL object,
 * for ease of typing all return a WOQL query object
 */

/**
 * allow you to do a query against a specific commit point
 *
 * example WOQL.using("userName/dbName/local/commit|branch/commitID").triple("v:A", "v:B", "v:C")..
 *
 * @param {string}   		 - refPath  path to specific refId
 * @param {WOQLQuery object} - subquery for the specific commit point
 * @return WOQLQuery
 */
WOQL.using = function(refPath, Query) {
    return new WOQLQuery().using(refPath, Query)
}

/**
 * Adds a text comment to a query - can also be used to wrap any part of a query to turn it off
 * @param {string} comment - text comment
 * @param {WOQLQuery} Subq  - subquery that is "commented out"
 * @return {WOQLQuery}
 */
WOQL.comment = function(comment, Subq) {
    return new WOQLQuery().comment(comment, Subq)
}

/**
 * Filters the query so that only the variables included in [V1...Vn] are returned in the bindings
 * @param list - only these variables are returned
 * @return {WOQLQuery}
 */
WOQL.select = function(...list) {
    return new WOQLQuery().select(...list)
}

/**
 * Filter the query to return only results that are distinct in the given variables
 * @param list - these variables are guaranteed to be unique as a tuple
 * @return {WOQLQuery}
 */
WOQL.distinct = function(...list) {
    return new WOQLQuery().distinct(...list)
}

/**
 * Creates a logical AND of the arguments
 * @param queries - WOQL Query objects
 * @return {object} WOQLQuery
 */
WOQL.and = function(...queries) {
    return new WOQLQuery().and(...queries)
}

/**
 * Creates a logical OR of the arguments
 * @param queries - WOQL Query objects
 * @return {object} WOQLQuery
 */
WOQL.or = function(...queries) {
    return new WOQLQuery().or(...queries)
}

/**
 * Specifies the database URL that will be the default database for the enclosed query
 * @param {string} graph_filter - a graph filter expression (e.g. schema/*)
 * @param {object} query - WOQL Query object, optional
 * @return {object} WOQLQuery
 */
WOQL.from = function(graph_filter, query) {
    return new WOQLQuery().from(graph_filter, query)
}

/**
 * Sets the current output graph for writing output to.
 * @param {string} graph_descriptor - a id of a specific graph (e.g. instance/main) that will be written to
 * @param {object} query - WOQL Query object, optional
 * @return {object} WOQLQuery
 */
WOQL.into = function(graph_descriptor, query) {
    return new WOQLQuery().into(graph_descriptor, query)
}

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object)
 * @param {string} a - Subject
 * @param {string} b - Predicate
 * @param {string} c - Object
 * @return {object} WOQLQuery
 */
WOQL.triple = function(a, b, c) {
    return new WOQLQuery().triple(a, b, c)
}

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object) added in the current layer
 * @param {string} a - Subject
 * @param {string} b - Predicate
 * @param {string} c - Object
 * @return {object} WOQLQuery
 */
WOQL.added_triple = function(a, b, c) {
    return new WOQLQuery().added_triple(a, b, c)
}

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object) added in the current commit
 * @param {string} a - Subject
 * @param {string} b - Predicate
 * @param {string} c - Object
 * @return {object} WOQLQuery
 */
WOQL.removed_triple = function(a, b, c) {
    return new WOQLQuery().removed_triple(a, b, c)
}

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)
 * @param {string} a - Subject
 * @param {string} b - Predicate
 * @param {string} c - Object
 * @param {string} d - Graph
 * @return {object} WOQLQuery
 */
WOQL.quad = function(a, b, c, d) {
    return new WOQLQuery().quad(a, b, c, d)
}

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph) removed from the current commit
 * @param {string} a - Subject
 * @param {string} b - Predicate
 * @param {string} c - Object
 * @param {string} d - Graph
 * @return {object} WOQLQuery
 */
WOQL.added_quad = function(a, b, c, d) {
    return new WOQLQuery().added_quad(a, b, c, d)
}

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph) removed from the current commit
 * @param {string} a - Subject
 * @param {string} b - Predicate
 * @param {string} c - Object
 * @param {string} d - Graph
 * @return {object} WOQLQuery
 */
WOQL.removed_quad = function(a, b, c, d) {
    return new WOQLQuery().removed_quad(a, b, c, d)
}

/**
 * Returns true if ClassA subsumes ClassB, according to the current DB schema
 * @param {string} a - classA
 * @param {string} b - classB
 * @return {boolean} WOQLQuery
 */
WOQL.sub = function(a, b) {
    return new WOQLQuery().sub(a, b)
}
WOQL.subsumption = WOQL.sub
/**
 * Matches if a is equal to b
 * @param {string} a - literal, variable or id
 * @param {string} b - literal, variable or id
 * @return {object} WOQLQuery
 *
 *
 * @example
 * // find triples that are of type scm:Journey, and have
 * // a start_station v:Start, and that start_station is labeled
 * // v:Start_Label
 *
 * WOQL.and(
 *      WOQL.triple("v:Journey", "type", "scm:Journey"),
 *      WOQL.or(
 *          WOQL.triple("v:Journey", "scm:start_station", "doc:Station31007"),
 *          WOQL.triple("v:Journey", "scm:start_station", "doc:Station31114")),
 *      WOQL.triple("v:Journey", "scm:start_station", "v:Start"),
 *      WOQL.triple("v:Start", "label", "v:Start_Label"))
 *
 * @see WOQLQuery().woql_or for WOQL.py version of the same function
 */
WOQL.eq = function(a, b) {
    return new WOQLQuery().eq(a, b)
}
WOQL.equals = WOQL.eq

/**
 * Substring
 * @param {string} String - String or variable
 * @param {string} Before - integer or variable (characters from start to begin)
 * @param {string} [Length] - integer or variable (length of substring)
 * @param {string} [After] - integer or variable (number of characters after substring)
 * @param {string} Substring - String or variable
 * @return {object} WOQLQuery
 *
 * @example
 * // find triples that are of type scm:Journey, and have
 * // a start_station v:Start, and that start_station is labeled
 * // v:Start_Label
 *
 * WOQL.and(
 *      WOQL.triple("v:Journey", "type", "scm:Journey"),
 *      WOQL.triple("v:Journey", "start_station", "v:Start"),
 *      WOQL.triple("v:Start", "label", "v:Start_Label"))
 *
 * @see WOQLQuery().woql_and for WOQL.py version of the same function
 */
WOQL.substr = function(String, Before, Length, After, SubString) {
    return new WOQLQuery().substr(String, Before, Length, After, SubString)
}
WOQL.substring = WOQL.substr

/**
 * Updates a document (or any object) in the db with the passed copy
 * @param {string} JSON - JSON-LD document
 * @return {object} WOQLQuery
 */
WOQL.update_object = function(JSON) {
    return new WOQLQuery().update_object(JSON)
}

/**
 * Deletes a node identified by an IRI or a JSON-LD document
 * @param {string} JSON_or_IRI - IRI or a JSON-LD document
 * @return {object} WOQLQuery
 */
WOQL.delete_object = function(JSON_or_IRI) {
    return new WOQLQuery().delete_object(JSON_or_IRI)
}

WOQL.read_object = function(IRI, Output, Format) {
    return new WOQLQuery().read_object(IRI, Output, Format)
}

/**
 * Imports the Target Resource to the variables defined in vars
 * @param {object} asvars - An AS query (or json representation)
 * @param {object} query_resource - description of where the resource is to be got from (WOQL.file, WOQL.remote, WOQL.post)
 * @return {object} WOQLQuery
 */
WOQL.get = function(asvars, query_resource) {
    return new WOQLQuery().get(asvars, query_resource)
}

/**
 * Exports the Target Resource to the file file, with the variables defined in as
 * @param {object} asvars - An AS query (or json representation)
 * @param {object} query - A sub-query to be dumpted out
 * @param {object} query_resource - description of where the resource is to be put
 * @return {object} WOQLQuery
 */
WOQL.put = function(asvars, query, query_resource) {
    return new WOQLQuery().put(asvars, query, query_resource)
}

/**
 * Imports the value identified by Source to a Target variable
 * @param {string or integer} map - Source
 * @param {string} vari - Target
 * @param {string} [ty] - optional type to cast value to
 * @return {object} WOQLQuery
 */
WOQL.as = function(map, vari, ty) {
    return new WOQLQuery().as(map, vari, ty)
}

/**
 * Provides details of a remote data source in a JSON format that includes a URL property
 * @param {object} url - remote data source in a JSON format
 * @param {object} opts - imput options, optional
 * @return {object} WOQLQuery
 */
WOQL.remote = function(url, opts) {
    return new WOQLQuery().remote(url, opts)
}

/**
 * Provides details of a file source in a JSON format that includes a URL property
 * @param {object} url - file data source in a JSON format
 * @param {object} opts - imput options, optional
 * @return {object} WOQLQuery
 */
WOQL.file = function(url, opts) {
    return new WOQLQuery().file(url, opts)
}

/**
 * Provides details of a file source in a JSON format that includes a URL property
 * @param {object} url - file data source in a JSON format
 * @param {object} opts - imput options, optional
 * @return {object} WOQLQuery
 */
WOQL.post = function(url, opts) {
    return new WOQLQuery().post(url, opts)
}

/**
 * Deletes any triples that match the rule [S,P,O]
 * @param {string} S - Subject
 * @param {string} P - Predicate
 * @param {string} O - Object
 * @return {object} WOQLQuery
 */
WOQL.delete_triple = function(S, P, O) {
    return new WOQLQuery().delete_triple(S, P, O)
}

/**
 * Deletes any quads that match the rule [S, P, O, G] (Subject, Predicate, Object, Graph)
 * @param {string} S - Subject
 * @param {string} P - Predicate
 * @param {string} O - Object
 * @param {string} G - Graph
 * @return {object} WOQLQuery
 */
WOQL.delete_quad = function(S, P, O, G) {
    return new WOQLQuery().delete_quad(S, P, O, G)
}

/**
 * Adds triples according to the the pattern [S,P,O]
 * @param {string} S - Subject
 * @param {string} P - Predicate
 * @param {string} O - Object
 * @return {object} WOQLQuery
 */
WOQL.add_triple = function(S, P, O) {
    return new WOQLQuery().add_triple(S, P, O)
}

/**
 * Adds quads according to the pattern [S,P,O,G]
 * @param {string} S - Subject
 * @param {string} P - Predicate
 * @param {string} O - Object
 * @param {string} G - Graph
 * @return {object} WOQLQuery
 */
WOQL.add_quad = function(S, P, O, G) {
    return new WOQLQuery().add_quad(S, P, O, G)
}

/**
 * When the sub-query in Condition is met, the Update query is executed
 * @param {object or boolean} Query - WOQL Query object or bool
 * @param {object} Update - WOQL Query object, optional
 * @return {object} WOQLQuery
 *
 * Functions which take a query as an argument advance the cursor to make the chaining of queries fall into the corrent place in the encompassing json.
 */
WOQL.when = function(Query, Update) {
    return new WOQLQuery().when(Query, Update)
}

/**
 * A trimmed version of StringA (with leading and trailing whitespace removed) is copied into VariableA
 * @param {string} a - StringA
 * @param {string} b - VariableA
 * @return {object} WOQLQuery
 */
WOQL.trim = function(a, b) {
    return new WOQLQuery().trim(a, b)
}

/**
 * Evaluates the Arithmetic Expression Arith and copies the output to variable V
 * @param {object} arith - query or JSON-LD representing the query
 * @param {string} v - output variable
 * @return {object} WOQLQuery
 */
WOQL.eval = function(arith, v) {
    return new WOQLQuery().eval(arith, v)
}

WOQL.evaluate = WOQL.eval


/**
 * Adds numbers N1...Nn together
 * @param args - numbers to add together
 * @return {object} WOQLQuery
 */
WOQL.plus = function(...args) {
    return new WOQLQuery().plus(...args)
}

/**
 * Subtracts Numbers N1..Nn
 * @param args - numbers to be subtracted
 * @return {object} WOQLQuery
 */
WOQL.minus = function(...args) {
    return new WOQLQuery().minus(...args)
}

/**
 * Multiplies numbers N1...Nn together
 * @param args - numbers to be multiplied
 * @return {object} WOQLQuery
 */
WOQL.times = function(...args) {
    return new WOQLQuery().times(...args)
}

/**
 * Divides numbers N1...Nn by each other left, to right precedence
 * @param args - numbers to tbe divided
 * @return {object} WOQLQuery
 */
WOQL.divide = function(...args) {
    return new WOQLQuery().divide(...args)
}

/**
 * Division - integer division - args are divided left to right
 * @param args - numbers for division
 * @return {object} WOQLQuery
 */
WOQL.div = function(...args) {
    return new WOQLQuery().div(...args)
}

/**
 * Raises A to the power of B
 * @param {integer or double} a - base number
 * @param {integer or double} b - power of
 * @return {object} WOQLQuery
 */
WOQL.exp = function(a, b) {
    return new WOQLQuery().exp(a, b)
}

/**
 * Floor (closest lower integer)
 * @param {integer or double} a
 * @return {object} WOQLQuery
 */
WOQL.floor = function(a) {
    return new WOQLQuery().floor(a)
}

/**
 * Matches if Instance is a member of Class, according to the current state of the DB
 * @param {string} a - classA
 * @param {string} b - classB, optional
 * @return {boolean} WOQLQuery
 */
WOQL.isa = function(a, b) {
    return new WOQLQuery().isa(a, b)
}

/**
 * Matches if a is similar to b (with distance dist)
 * @param {string} a - string a
 * @param {string} b - string b
 * @param {float} dist - distance 0-1.0
 * @return {boolean} WOQLQuery
 */
WOQL.like = function(a, b, dist) {
    return new WOQLQuery().like(a, b, dist)
}

/**
 * Compares the value of v1 against v2 and returns true if v1 is less than v2
 * @param {string} v1 - first variable to compare
 * @param {string} v2 - second variable to compare
 * @return {object} WOQLQuery
 */
WOQL.less = function(v1, v2) {
    return new WOQLQuery().less(v1, v2)
}

/**
 * Compares the value of v1 against v2 and returns true if v1 is greater than v2
 * @param {string} v1 - first variable to compare
 * @param {string} v2 - second variable to compare
 * @return {object} WOQLQuery
 */
WOQL.greater = function(v1, v2) {
    return new WOQLQuery().greater(v1, v2)
}

/**
 * The Query in the Optional argument is specified as optional
 * @param {object} query - WOQL Query object
 * @return {object} WOQLQuery
 */
WOQL.opt = function(query) {
    return new WOQLQuery().opt(query)
}

WOQL.optional = WOQL.opt

/**
 * Generates an ID for a node as a function of the passed VariableList with a specific prefix (URL base). If the values of the passed variables are the same, the output will be the same
 * @param {string} prefix - prefix for the id
 * @param {string} vari - variable to generate id for
 * @param {string} type - the variable to hold the id
 * @return {object} WOQLQuery
 */
WOQL.unique = function(prefix, vari, type) {
    return new WOQLQuery().unique(prefix, vari, type)
}

/**
 * Generates an ID for a node as a function of the passed VariableList with a specific prefix (URL base). If the values of the passed variables are the same, the output will be the same
 * @param {string} prefix - prefix for the id
 * @param {string or array} inputVarList - variable to generate id for
 * @param {string} outputVar - the variable to hold the id
 * @return {object} WOQLQuery
 */
WOQL.idgen = function(prefix, inputVarList, outputVar) {
    return new WOQLQuery().idgen(prefix, inputVarList, outputVar)
}
WOQL.idgenerator = WOQL.idgen

/**
 * Changes a string to upper-case - input is in l, output in u
 * @param {string} l - input string
 * @param {string} u - uppercase output
 * @return {object} WOQLQuery
 */
WOQL.upper = function(l, u) {
    return new WOQLQuery().upper(l, u)
}

/**
 * Changes a string to lower-case - input is in u, output in l
 * @param {string} u - input string
 * @param {string} l - stores output
 * @return {object} WOQLQuery
 */
WOQL.lower = function(u, l) {
    return new WOQLQuery().lower(u, l)
}

/**
 * Pads out the string input to be exactly len long by appending the pad character pad to form output
 * @param {string} input - input string
 * @param {string} pad - padding character(s)
 * @param {integer} len - length to pad to (the full length of the string with padding)
 * @param {string} output - stores output
 * @return {object} WOQLQuery
 */
WOQL.pad = function(input, pad, len, output) {
    return new WOQLQuery().pad(input, pad, len, output)
}

/**
 * Splits a variable apart (input) into a list of variables (output) by separating the strings together with separator
 * @param {string} input - a string or variable
 * @param {string} separator - character string to separate string into list
 * @param {string} output - variable that stores output list
 * @return {object} WOQLQuery
 */
WOQL.split = function(input, separator, output) {
    return new WOQLQuery().split(input, separator, output)
}

/**
 * Iterates through a list and returns a value for each member
 * @param {string} El - a variable representing an element of the list
 * @param {string} List - A list variable
 * @return {object} WOQLQuery
 */
WOQL.member = function(El, List) {
    return new WOQLQuery().member(El, List)
}

/**
 * Concatenates the list of variables into a string and saves the result in v
 * @param {array} list - list of variables to concatenate
 * @param {string} v - saves the results
 * @return {object} WOQLQuery
 */
WOQL.concat = function(list, v) {
    return new WOQLQuery().concat(list, v)
}

/**
 * Joins a list variable together (input) into a string variable (output) by glueing the strings together with glue
 * @param {array} input - a list of variables
 * @param {string} glue - joining character(s)
 * @param {string} output - variable that stores output
 * @return {object} WOQLQuery
 */
WOQL.join = function(input, glue, output) {
    return new WOQLQuery().join(input, glue, output)
}

/**
 * Adds a list of numbers together
 * @param input - input list variable
 * @param output - output numeric
 * @return {object} WOQLQuery
 */
WOQL.sum = function(input, output) {
    return new WOQLQuery().sum(input, output)
}

/**
 * Specifies that the start of the query returned
 * @param {integer} start - index of the frist result got returned
 * @param {object} query - WOQL Query object, optional
 * @return {object} WOQLQuery
 */
WOQL.start = function(start, query) {
    return new WOQLQuery().start(start, query)
}

/**
 * Specifies the number of records returned based on a limit value
 * @param {integer} limit - number of maximum results returned
 * @param {object} query - WOQL Query object, optional
 * @return {object} WOQLQuery
 */
WOQL.limit = function(limit, query) {
    return new WOQLQuery().limit(limit, query)
}

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
WOQL.re = function(pattern, test, matches) {
    return new WOQLQuery().re(pattern, test, matches)
}
WOQL.regexp = WOQL.re

/**
 * Calculates the length of the list in va and stores it in vb
 * @param {string} var1 - list to calculate length
 * @param {string} res - stores result
 * @return {object} WOQLQuery
 */
WOQL.length = function(var1, res) {
    return new WOQLQuery().length(var1, res)
}

/**
 * Creates a logical NOT of the arguments
 * @param queries - WOQL Query objects
 * @return {object} WOQLQuery
 */
WOQL.not = function(query) {
    return new WOQLQuery().not(query)
}

/**
 * Results in one solution of the subqueries
 * @param queries - WOQL Query objects
 * @return {object} WOQLQuery
 */
WOQL.once = function(query) {
    return new WOQLQuery().once(query)
}

/**
 * Runs the query without backtracking on side-effects
 * @param queries - WOQL Query objects
 * @return {object} WOQLQuery
 */
WOQL.immediately = function(query) {
    return new WOQLQuery().immediately(query)
}

/**
 * Creates a count of the results of the query
 * @param count - variable or integer count
 * @param query - WOQL Query object
 * @return {object} WOQLQuery
 */
WOQL.count = function(countvar,query) {
    return new WOQLQuery().count(countvar,query)
}

/**
 * Changes the type of va to type and saves the return in vb
 * @param {string} vara - original variable
 * @param {string} type - type to be changed
 * @param {string} varb - save the return variable
 * @return {object} WOQLQuery
 */
WOQL.typecast = function(vara, type, varb) {
    return new WOQLQuery().typecast(vara, type, varb)
}
WOQL.cast = WOQL.typecast

/**
 * is used to sort the fetched data in either ascending or descending according to one or more variables
 * use the string asc or desc next to the variable name.
 *
 * examples:
 * WOQL.order_by("v:A", "v:B asc", "v:C asc").query()
 * WOQL.order_by("v:A", "v:B asc", "v:C asc", query)
 *
 * @param  {args} ordering - list of variables to order and the query object
 * @return {object} WOQLQuery
 */
WOQL.order_by = function(...ordering) {
    return new WOQLQuery().order_by(...ordering)
}

/**
 * Groups the results of groupquery together by the list of variables gvarlist, using the variable groupedvar as a grouping and saves the result into variable output.
 * @param {array or object} gvarlist - list of variables to group
 * @param {array or string} groupedvar - grouping variable(s)
 * @param {string} output - output variable, optional
 * @param {object} groupquery - WOQLQuery object
 * @return {object} WOQLQuery
 */
WOQL.group_by = function(gvarlist, groupedvar, output, groupquery) {
    return new WOQLQuery().group_by(gvarlist, groupedvar, output, groupquery)
}

WOQL.true = function() {
    return new WOQLQuery().true()
}

/**
 * Path Regular Expression
 */
WOQL.path = function(Subject, Pattern, Object, Path) {
    return new WOQLQuery().path(Subject, Pattern, Object, Path)
}

/**
 * Returns the size of the passed graph filter
 */
WOQL.size = function(Graph, Size) {
    return new WOQLQuery().size(Graph, Size)
}

/**
 * Returns the count of triples in the passed graph filter
 */
WOQL.triple_count = function(Graph, TripleCount) {
    return new WOQLQuery().triple_count(Graph, TripleCount)
}

/**
 * Returns true if 'a' is of type 'b', according to the current DB schema
 *
 * @param {string} a - value
 * @param {string} b - type
 * @return {boolean} WOQLQuery
 */
WOQL.type_of = function(a, b) {
    return new WOQLQuery().type_of(a, b)
}

/**
 * By default selects everything as triples ("v:Subject", "v:Predicate", "v:Object") in the graph identified by GraphIRI or in all the current terminusDB's graph
 *
 * example WOQL.star("schema/main") will give all triples in the main schema graph
 *
 * @param {string} graphRef 	- optional target graph 	false is the default value and get all the database's graphs, possible value are  | false | schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *}
 * @param {string} Subj 		- optional target subject   default value "v:Subject"
 * @param {string} Pred 		- optional target predicate default value "v:Predicate"
 * @param {string} Obj 			- optional target object    default value "v:Object"
 * @return {object} WOQLQuery
 */
WOQL.star = function(graphRef, Subj, Pred, Obj) {
    return new WOQLQuery().star(graphRef, Subj, Pred, Obj)
}

WOQL.all = function(Subj, Pred, Obj, graphRef) {
    return new WOQLQuery().all(Subj, Pred, Obj, graphRef)
}

/**
 * Selects nodes with the ID NodeID as the subject of subsequent sub-queries. The second argument PatternType specifies what type of sub-queries are being constructed, options are: triple, quad, update_triple, update_quad, delete_triple, delete_quad
 * @param {string} nodeid - node to be selected
 * @param {string} type - pattern type, optional (default is triple)
 * @return {object} WOQLQuery
 */
WOQL.node = function(nodeid, type) {
    return new WOQLQuery().node(nodeid, type)
}
//These ones are special ones for dealing with the schema only...

/**
 * Insert a node with a specific type in a graph // statement is used to insert new records in a table.
 * document type
 * @param {string} Node 		- node to be insert
 * @param {string} Type 		- type of the node (class/document name)
 * @param {string} graphRef 	- optional target graph if not setted it get all the database's graphs, possible value are  | schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *}
 * @return {object} WOQLQuery
 */
WOQL.insert = function(Node, Type, graphRef) {
    return new WOQLQuery().insert(Node, Type, graphRef)
}

WOQL.schema = function(G) {
    let s = new WOQLQuery()
    if(G) s.graph(G)
    return s
}

WOQL.graph = function(graph) {
    return new WOQLQuery().graph(graph)
}

/**
 * Generates a new Class with the given ClassID and writes it to the DB schema
 * @param {string} classid - class to be added
 * @param {string} graph - target graph
 * @return {object} WOQLQuery
 */
WOQL.add_class = function(classid, graph) {
    return new WOQLQuery().add_class(classid, graph)
}

/**
 * Generates a new Property with the given PropertyID and a range of type and writes it to the DB schema
 * @param {string} propid - property id to be added
 * @param {string} type - type of the proerty
 * @param {string} graph - target graph, optional
 * @return {object} WOQLQuery
 */
WOQL.add_property = function(propid, type, graph) {
    return new WOQLQuery().add_property(propid, type, graph)
}

/**
 * Deletes the Class with the passed ID form the schema (and all references to it)
 * @param {string} classid - class to be added
 * @param {string} graph - target graph
 * @return {object} WOQLQuery
 */
WOQL.delete_class = function(classid, graph, cvar) {
    return new WOQLQuery().delete_class(classid, graph,cvar)
}

/**
 * Deletes the property with the passed ID from the schema (and all references to it)
 * @param {string} propid - property id to be added
 * @param {string} graph - target graph, optional
 * @return {object} WOQLQuery
 */
WOQL.delete_property = function(propid, graph,cvar) {
    return new WOQLQuery().delete_property(propid, graph,cvar)
}

/**
 * Creates a new document class in the schema - equivalent to: add_quad(type, "rdf:type", "owl:Class", graph), add_quad(type, subclassof, tcs:Document, graph)
 * @param {string} Type - type of the document
 * @param {string} Graph - target graph, optional
 * @return {object} WOQLQuery
 */
WOQL.doctype = function(Type, Graph) {
    return WOQL.add_class(Type, Graph).parent('Document')
}

/**
 * Composite functions which allow json objects to be sent in to specify many parts in one go
 */

/**
 * @param {object} data - json object which contains fields:
 * mandatory: id, type
 * optional: label, description, [property] (valid property ids)
 * @param {string} refGraph - Graph Identifier
 */
WOQL.insert_data = function(data, refGraph) {
    return new WOQLQuery().insert_data(data, refGraph)
}

/**
 * @param {object} data - json object which contains fields:
 * mandatory: id
 * optional: label, description, parent, [property] (valid property ids)
 * @param {string} refGraph - Graph Identifier
 */
WOQL.insert_class_data = function(data, refGraph) {
    return new WOQLQuery().insert_class_data(data, refGraph)
}

/**
 * @param {object} data - json object which contains fields:
 * mandatory: id
 * optional: label, description, parent, [property] (valid property ids)
 * @param {string} refGraph - Graph Identifier
 */
WOQL.insert_doctype_data = function(data, refGraph) {
    return new WOQLQuery().insert_doctype_data(data, refGraph)
}

/**
 * @param {object} data - json object which contains fields:
 * mandatory: id, range, domain
 * optional: label, description, min, max, cardinality
 */
WOQL.insert_property_data = function(data, refGraph) {
    return new WOQLQuery().insert_property_data(data, refGraph)
}

/**
 * Deletes all triples in the passed graph (defaults to instance/main)
 * @param {string} Graph - graph resource id
 */
WOQL.nuke = function(Graph) {
    return new WOQLQuery().nuke(Graph)
}

/**
 * Creates a new Empty Query object
 * @return {object} WOQLQuery
 */
WOQL.query = function() {
    return new WOQLQuery()
}

//loads query from json

/**
 * Generates a WOQLQuery object from the passed WOQL JSON
 * @param {object} json - JSON-LD object, optional
 * @return {object} WOQLQuery
 *
 * json version of query for passing to api
 */
WOQL.json = function(json) {
    return new WOQLQuery().json(json)
}

WOQL.lib = function(mode) {
    return new new WOQLQuery().lib(mode)
}

WOQL.string = function(s) {
    return new new WOQLQuery().string(s)
}

WOQL.literal = function(s, t) {
    return new new WOQLQuery().literal(s, t)
}

WOQL.iri = function(s) {
    return new new WOQLQuery().iri(s)
}

WOQL.vars = function(...varray) {
    return varray.map((item) => 'v:' + item)
}

WOQL.client = function(client) {
    if(client) this._client = client
    return this._client
}


WOQL.emerge = function(auto_eval) {
    let unemerged = ['emerge', 'true', 'eval']
    function _emerge_str(k){
        let str = `function ${k}(...args){
            return WOQL.${k}(...args)
        }`
        return str
    }
    let funcs = []
    for(var k in this){
        if(typeof this[k] == 'function'){
            if(unemerged.indexOf(k) == -1){
                funcs.push(_emerge_str(k))
            }
        }
    }
    let str = funcs.join(";\n")
    if(auto_eval) eval(str)
    return str
}

WOQL.update_triple = function(a, b, c){
    return new WOQLQuery().update_triple(a, b, c)
}

WOQL.update_quad = function(a, b, c, g){
    return new WOQLQuery().update_quad(a, b, c, g)
}

WOQL.value = function(a, b, c, g){
    return new WOQLQuery().value(a, b, c, g)
}

WOQL.link = function(a, b, c, g){
    return new WOQLQuery().link(a, b, c, g)
}


WOQL.makeEnum = function(client, prop, cls, clslabel, clsdesc, graph){
    return new WOQLQuery().makeEnum(client, prop, cls, clslabel, clsdesc, graph)
}

WOQL.generateChoiceList = function(cls, clslabel, clsdesc, choices, graph, parent){
    return new WOQLQuery().generateChoiceList(cls, clslabel, clsdesc, choices, graph, parent)
}


WOQL.updateChoiceList = function(cls, clslabel, clsdesc, choices, graph){
    return new WOQLQuery().updateChoiceList(cls, clslabel, clsdesc, choices, graph)
}

WOQL.deleteChoiceList = function(cls, graph){
    return new WOQLQuery().deleteChoiceList(cls, graph)
}



WOQL.libs = function(libs, parent, graph, prefix){
    return new WOQLQuery().libs(libs, parent, graph, prefix)
}

WOQL.boxClasses = function(prefix, classes, except, graph){
    return new WOQLQuery().boxClasses(prefix, classes, except, graph)
}

module.exports = WOQL
