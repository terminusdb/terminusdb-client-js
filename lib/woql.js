////@ts-check
//I HAVE TO REVIEW THE Inheritance and the prototype chain
const typedef = require('./typedef')
const WOQLQuery = require('./query/woqlBuilder')
//const WOQLQuery = require('./query/woqlCore')
//const WOQLJSON = require('./query/woqlQuery')
//const WOQLBuilder = require('./query/woqlBuilder')
//const WOQLSchema = require('./query/woqlSchema')
const WOQLPrinter = require('./query/woqlPrinter')
const WOQLLibrary = require('./query/woqlLibrary')

/**
 * @license Apache Version 2
 * @module WOQL
 * @constructor WOQL
 * @description The WOQL object is a wrapper around the WOQLQuery object
 * Syntactic sugar to allow writing WOQL.triple()... instead of new WOQLQuery().triple()
 * Every function matches one of the public api functions of the woql query object
 */
let WOQL = {}

/**
 * WOQL primitives are WOQL.js functions which directly map onto words in
 * the underlying JSON-LD language. All other WOQL.js functions are compound functions
 * which translate into multiple WOQL primitives, or are helper functions which reduce
 * the need to write verbose JSON-LD directly.
 */

/**
 * WOQL Literals, Prefixes & IRI Constant
 */

/*
 * We expose all the real woql predicates via the WOQL object,
 * for ease of typing all return a WOQL query object
 */

/**
 * Query running against any specific commit Id
 * @param {string}  refPath  - path to specific reference Id or commit Id
 * @param {WOQLQuery} subquery - subquery for the specific commit point
 * @returns {WOQLQuery}
 * @example
 * WOQL.using("userName/dbName/local/commit|branch/commitID").triple("v:A", "v:B", "v:C")
 */
WOQL.using = function(refPath, subquery) {
    return new WOQLQuery().using(refPath, subquery)
}

/**
 * Adds a text comment to a query - can also be used to wrap any part of a query to turn it off
 * @param {string} comment - text comment
 * @param {WOQLQuery} subquery  - query that is "commented out"
 * @returns {WOQLQuery}
 */
WOQL.comment = function(comment, subquery) {
    return new WOQLQuery().comment(comment, subquery)
}

/**
 * @example WOQL.select("v:a",triple("v:a","v:b","v:c"))
 * Filters the query so that only the variables included in [V1...Vn] are returned in the bindings
 * @param {...string} varNames - only these variables are returned
 * @returns {WOQLQuery}
 */
WOQL.select = function(...varNames) {
    return new WOQLQuery().select(...varNames)
}

/**
 * Filter the query to return only results that are distinct in the given variables
 * @param {...string} varNames - these variables are guaranteed to be unique as a tuple
 * @returns {WOQLQuery}
 */
WOQL.distinct = function(...varNames) {
    return new WOQLQuery().distinct(...varNames)
}

/**
 * Logical conjunction of the contained queries - all queries must match or the entire clause fails
 * @param {...WOQLQuery} subqueries - A list of one or more woql queries to execute as a conjunction
 * @returns {WOQLQuery} - A WOQLQuery object containing the conjunction of queries
 * @example
 * //find triples that are of type scm:Journey, and have
 * //a start_station v:Start, and that start_station is labeled
 * //v:Start_Label
 *
 * WOQL.and(
 *      WOQL.triple("v:Journey", "type", "scm:Journey"),
 *      WOQL.triple("v:Journey", "start_station", "v:Start"),
 *      WOQL.triple("v:Start", "label", "v:Start_Label"))
 *
 */

WOQL.and = function(...subqueries) {
    return new WOQLQuery().and(...subqueries)
}

/**
 * Creates a logical OR of the arguments
 * @param {...WOQLQuery} subqueries - A list of one or more woql queries to execute as alternatives
 * @returns {WOQLQuery} - A WOQLQuery object containing the logical Or of the subqueries
 * @example
 * or(
 *   triple("v:Subject", 'label', "A"),
 *   triple("v:Subject", "label", "a")
 *  )
 */
WOQL.or = function(...subqueries) {
    return new WOQLQuery().or(...subqueries)
}

/**
 * Specifies the database URL that will be the default database for the enclosed query
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @param {WOQLQuery} [query] - The query
 * @returns {WOQLQuery} A WOQLQuery object containing the from expression
 */

WOQL.from = function(graphRef, query) {
    return new WOQLQuery().from(graphRef, query)
}

/**
 * Specifies the graph resource to write the contained query into
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @param {WOQLQuery} subquery - The query which will be written into the graph
 * @returns {WOQLQuery} A WOQLQuery which will be written into the graph in question
 * @example
 * //Subq is an argument or a chained query
 * using("admin/minecraft").into("instance/main").add_triple("a", "type", "scm:X")
 * //writes a single tripe (doc:a, rdf:type, scm:X) into the main instance graph
 *
 */
WOQL.into = function(graphRef, subquery) {
    return new WOQLQuery().into(graphRef, subquery)
}

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object)
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery}
 */
WOQL.triple = function(subject, predicate, object) {
    return new WOQLQuery().triple(subject, predicate, object)
}

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object) added in the current layer
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery}
 */
WOQL.added_triple = function(subject, predicate, object) {
    return new WOQLQuery().added_triple(subject, predicate, object)
}

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object) added in the current commit
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery}
 */
WOQL.removed_triple = function(subject, predicate, object) {
    return new WOQLQuery().removed_triple(subject, predicate, object)
}

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery}
 */
WOQL.quad = function(subject, predicate, object, graphRef) {
    return new WOQLQuery().quad(subject, predicate, object, graphRef)
}

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph) removed from the current commit
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @returns {WOQLQuery}
 */
WOQL.added_quad = function(subject, predicate, object, graphRef) {
    return new WOQLQuery().added_quad(subject, predicate, object, graphRef)
}

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph) removed from the current commit
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @returns {WOQLQuery}
 */
WOQL.removed_quad = function(subject, predicate, object, graphRef) {
    return new WOQLQuery().removed_quad(subject, predicate, object, graphRef)
}

/**
 * Returns true if ClassA subsumes ClassB, according to the current DB schema
 * @param {string} classA - ClassA
 * @param {string} classB - ClassB
 * @returns {boolean} WOQLQuery
 */
WOQL.sub = function(classA, classB) {
    return new WOQLQuery().sub(classA, classB)
}

WOQL.subsumption = WOQL.sub

/**
 * Matches if a is equal to b
 * @param {string} varName - literal, variable or id
 * @param {string} varValue - literal, variable or id
 * @returns {WOQLQuery}
 *
 *
 */
WOQL.eq = function(varName, varValue) {
    return new WOQLQuery().eq(varName, varValue)
}
WOQL.equals = WOQL.eq

/**
 * Substring
 * @param {string} string - String or variable
 * @param {string} before - integer or variable (characters from start to begin)
 * @param {string} [length] - integer or variable (length of substring)
 * @param {string} [after] - integer or variable (number of characters after substring)
 * @param {string} [substring] - String or variable
 * @returns {WOQLQuery}
 */

WOQL.substr = function(string, before, length, after, substring) {
    return new WOQLQuery().substr(string, before, length, after, substring)
}
WOQL.substring = WOQL.substr

/**
 * Updates a document (or any object) in the db with the passed copy
 * @param {string} JSON - JSON-LD document
 * @returns {WOQLQuery}
 */
WOQL.update_object = function(JSON) {
    return new WOQLQuery().update_object(JSON)
}

/**
 * Deletes a node identified by an IRI or a JSON-LD document
 * @param {string | object} JSON_or_IRI - IRI or a JSON-LD document
 * @returns {WOQLQuery}
 */
WOQL.delete_object = function(JSON_or_IRI) {
    return new WOQLQuery().delete_object(JSON_or_IRI)
}

/**
 * Saves the entire document with IRI DocumentIRI into the JSONLD variable
 * @param {string} IRI - either an IRI literal or a variable containing an IRI
 * @param {string} output - a variable into which the document’s will be saved
 * @param {typedef.DataFormatObj} [formatObj] - the export format descriptor, default value is JSON-LD
 * @returns {WOQLQuery} A WOQLQuery which contains the document retrieval expression
 * @example
 * const [mydoc] = vars("mydoc")
 * read_object("doc:a", mydoc)
 * //mydoc will have the json-ld document with ID doc:x stored in it
 */
WOQL.read_object = function(IRI, output, formatObj) {
    return new WOQLQuery().read_object(IRI, output, formatObj)
}

/**
 * Retrieves the exernal resource defined by QueryResource and copies values from it into variables defined in AsVars
 * @param {WOQLQuery} asvars - an array of AsVar variable mappings (see as for format below)
 * @param {WOQLQuery} queryResource - an external resource (remote, file, post) to query
 * @returns {WOQLQuery} A WOQLQuery which contains the get expression
 * @example
 * let [a, b] = vars("a", "b")
 * get(as("a", a).as("b", b)).remote("http://my.url.com/x.csv")
 * //copies the values from column headed "a" into a variable a and from column
 * //"b" into a variable b from remote CSV
 */
WOQL.get = function(asvars, queryResource) {
    return new WOQLQuery().get(asvars, queryResource)
}

/**
 * @put Outputs the results of a query to a file
 * @param {WOQLQuery} varsToExp - an array of AsVar variable mappings (see as for format below)
 * @param {WOQLQuery} query - The query which will be executed to produce the results
 * @param {string} fileResource - an file resource local to the server
 * @returns {WOQLQuery} A WOQLQuery which contains the put expression
 * @example
 * let [s, p, o] = vars("Subject", "Predicate", "Object")
 * WOQL.put(WOQL.as("s", s).as("p", p).as("o", o), WOQL.all())
 * .file("/app/local_files/dump.csv")
 */
WOQL.put = function(varsToExp, query, fileResource) {
    return new WOQLQuery().put(varsToExp, query, fileResource)
}

/**
 * Imports the value identified by Source to a Target variable
 * @param {string | number} source - Source
 * @param {string} target - Target
 * @param {string} [type] - type to cast value to string|number etc...
 * @returns {WOQLQuery}
 * @example
 *  WOQL.as("first var", "v:First_Var", "string").as("second var", "v:Second_Var")
 *  WOQL.as(["first var", "v:First_Var", "string"], ["second var", "v:Second_Var"])
 */

WOQL.as = function(source, target, type) {
    return new WOQLQuery().as(source, target, type)
}

/**
 * Identifies a remote resource by URL and specifies the format of the resource through the options
 * @param {string} url - The URL at which the remote resource can be accessed
 * @param {typedef.DataFormatObj} [formatObj] - The format of the resource data {}
 * @returns {WOQLQuery} A WOQLQuery which contains the remote resource identifier
 * @example
 * remote("http://url.of.resource", {type: "csv"})
 */
//
WOQL.remote = function(url, formatObj) {
    return new WOQLQuery().remote(url, formatObj)
}

/**
 * Identifies a file resource as a path on the server and specifies the format through the options
 * @param {object} url - The Path on the server at which the file resource can be accessed
 * @param {typedef.DataFormatObj} [formatObj] - imput options
 * @returns {WOQLQuery} A WOQLQuery which contains the file resource identifier
 * @example
 * file("/path/to/file", {type: 'turtle'} )
 */
WOQL.file = function(url, formatObj) {
    return new WOQLQuery().file(url, formatObj)
}

/**
 * Identifies a resource as a local path on the client, to be sent to the server through a
 * HTTP POST request, with the format defined through the options
 * @param {string} url - The Path on the server at which the file resource can be accessed
 * @param {typedef.DataFormatObj} [formatObj] - imput options, optional
 * @returns {WOQLQuery} A WOQLQuery which contains the Post resource identifier
 * @example
 * post("/.../.../", {type:'csv'})
 */
WOQL.post = function(url, formatObj) {
    return new WOQLQuery().post(url, formatObj)
}

/**
 * Deletes a single triple from the default graph of the database
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery} - A WOQLQuery which contains the Triple Deletion statement
 * @example
 * delete_triple("john", "age", 42)
 */
WOQL.delete_triple = function(subject, predicate, object) {
    return new WOQLQuery().delete_triple(subject, predicate, object)
}

/**
 * Deletes a single triple from the graph [Subject, Predicate, Object, Graph]
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery} - A WOQLQuery which contains the Delete Quad Statement
 * @example remove the class Person from the schema/main graph
 * WOQL.delete_quad("Person", "type", "owl:Class", "schema/main")
 */
WOQL.delete_quad = function(subject, predicate, object, graphRef) {
    return new WOQLQuery().delete_quad(subject, predicate, object, graphRef)
}

/**
 * Adds triples according to the the pattern [subject,predicate,object]
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @returns {object} WOQLQuery
 */
WOQL.add_triple = function(subject, predicate, object) {
    return new WOQLQuery().add_triple(subject, predicate, object)
}

/**
 * Adds quads according to the pattern [S,P,O,G]
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @returns {object} WOQLQuery
 */
WOQL.add_quad = function(subject, predicate, object, graphRef) {
    return new WOQLQuery().add_quad(subject, predicate, object, graphRef)
}

/**
 *
 * When the subquery is met, the update query is executed
 * @param {WOQLQuery} subquery - the condition query
 * @param {WOQLQuery} [updateQuery]
 * @returns {WOQLQuery} -  A WOQLQuery which contains the when expression
 * @example
 * when(true()).triple("a", "b", "c")
 */

//Functions which take a query as an argument advance the cursor to make the chaining of queries fall into the corrent place in the encompassing json.
WOQL.when = function(subquery, updateQuery) {
    return new WOQLQuery().when(subquery, updateQuery)
}

/**
 *
 * Remove whitespace from both sides of a string:
 * @param {string} inputStr - A string or variable containing the untrimmed version of the string
 * @param {string} resultVarName - A string or variable containing the trimmed version of the string
 * @returns {WOQLQuery} A WOQLQuery which contains the Trim pattern matching expression
 * @example
 * trim("hello   ","v:trimmed")
 * //trimmed contains "hello"
 */
WOQL.trim = function(inputStr, resultVarName) {
    return new WOQLQuery().trim(inputStr, resultVarName)
}

/**
 *
 * Evaluates the passed arithmetic expression and generates or matches the result value
 * @param {object| WOQLQuery | string} arithExp - A WOQL query containing a valid WOQL Arithmetic Expression, which is evaluated by the function
 * @param {string | number} resultVarName - Either a variable, in which the result of the expression will be stored, or a numeric literal which will be used as a test of result of the evaluated expression
 * @returns {WOQLQuery} A WOQLQuery which contains the Arithmetic function
 * @example
 * evaluate(plus(2, minus(3, 1)), "v:result")
 */
WOQL.evaluate = function(arithExp, resultVarName) {
    return new WOQLQuery().eval(arithExp, resultVarName)
}

/**
 * Evaluates the passed arithmetic expression and generates or matches the result value
 * @param {object| WOQLQuery | string} arithExp - query or JSON-LD representing the query
 * @param {string} resultVarName - output variable
 * @returns {WOQLQuery} WOQLQuery
 */

WOQL.eval = WOQL.evaluate

/**
 *
 * Adds the numbers together
 * @param {...(string |number)} args - a variable or numeric containing the values to add
 * @returns {WOQLQuery} A WOQLQuery which contains the addition expression
 * @example
 * evaluate(plus(2, plus(3, 1)), "v:result")
 */
WOQL.plus = function(...args) {
    return new WOQLQuery().plus(...args)
}

/**
 *
 * Subtracts Numbers N1..Nn
 * @param {...(string |number)} args - variable or numeric containing the value that will be subtracted from
 * @returns {WOQLQuery} A WOQLQuery which contains the subtraction expression
 * @example
 * evaluate(minus(2.1, plus(0.2, 1)), "v:result")
 */
WOQL.minus = function(...args) {
    return new WOQLQuery().minus(...args)
}

/**
 *
 * Multiplies numbers N1...Nn together
 * @param {...(string |number)} args - a variable or numeric containing the value
 * @returns {WOQLQuery} A WOQLQuery which contains the multiplication expression
 * @example
 * evaluate(times(10, minus(2.1, plus(0.2, 1))), "v:result")
 *  //result contains 9.000000000000002y
 */
WOQL.times = function(...args) {
    return new WOQLQuery().times(...args)
}

/**
 *
 * Divides numbers N1...Nn by each other left, to right precedence
 * @param {...(string |number)} args - numbers to tbe divided
 * @returns {WOQLQuery} A WOQLQuery which contains the division expression
 * evaluate(divide(times(10, minus(2.1, plus(0.2, 1))), 10), "v:result")
 *  //result contains 0.9000000000000001
 */
WOQL.divide = function(...args) {
    return new WOQLQuery().divide(...args)
}

/**
 *
 * Division - integer division - args are divided left to right
 * @param {...(string |number)} args - numbers for division
 * @returns {WOQLQuery} A WOQLQuery which contains the division expression
 * @example
 * let [result] = vars("result")
 * evaluate(div(10, 3), result)
 * //result contains 3
 */
WOQL.div = function(...args) {
    return new WOQLQuery().div(...args)
}

/*
 * @param {integer or double} a - base number
 * @param {integer or double} b - power of
 * @returns {object} WOQLQuery*/

/**
 *
 * Exponent - raises varNum01 to the power of varNum02
 * @param {string | number} varNum -  a variable or numeric containing the number to be raised to the power of the second number
 * @param {number} expNum -  a variable or numeric containing the exponent
 * @returns {WOQLQuery} A WOQLQuery which contains the exponent expression
 * @example
 * evaluate(exp(3, 2), "v:result")
 * //result contains 9
 */
WOQL.exp = function(varNum, expNum) {
    return new WOQLQuery().exp(varNum, expNum)
}

/**
 *
 * Generates the nearest lower integer to the passed number
 * @param {string | number} varNum - Variable or numeric containing the number to be floored
 * @returns {WOQLQuery} A WOQLQuery which contains the floor expression
 * @example
 * let [result] = vars("result")
 * evaluate(divide(floor(times(10, minus(2.1, plus(0.2, 1)))), 10), result)
 * //result contains 0.9 - floating point error removed
 */
WOQL.floor = function(varNum) {
    return new WOQLQuery().floor(varNum)
}

/**
 *
 * Tests whether a given instance IRI has type Class, according to the current state of the DB
 * @param {string} instanceIRI - A string IRI or a variable that identify the class instance
 * @param {string} classId - A Class IRI or a variable
 * @returns {WOQLQuery} A WOQLQuery object containing the type test
 * @example
 * let [subject] = vars("subject")
 * isa(subject, "Person")
 */
WOQL.isa = function(instanceIRI, classId) {
    return new WOQLQuery().isa(instanceIRI, classId)
}

/**
 *
 * Generates a string Leverstein distance measure between stringA and stringB
 * @param {string} stringA - string literal or variable representing a string to be compared
 * @param {string} stringB - string literal or variable representing the other string to be compared
 * @param {number | string} distance - variable representing the distance between the variables
 * @returns {WOQLQuery} A WOQLQuery which contains the Like pattern matching expression
 * @example
 * let [dist] = vars('dist')
 * like("hello", "hallo", dist)
 * //dist contains 0.7265420560747664
 */
WOQL.like = function(stringA, stringB, distance) {
    return new WOQLQuery().like(stringA, stringB, distance)
}

/**
 *
 * Compares the value of v1 against v2 and returns true if v1 is less than v2
 * @param {string | number} varNum01 - a variable or numeric containing the number to be compared
 * @param {string | number} varNum02 - a variable or numeric containing the second comporator
 * @returns {WOQLQuery} A WOQLQuery which contains the comparison expression
 * @example
 * less(1, 1.1).eq("v:result", literal(true, "boolean"))
 * //result contains true
 */
WOQL.less = function(varNum01, varNum02) {
    return new WOQLQuery().less(varNum01, varNum02)
}

/**
 *
 * Compares the value of v1 against v2 and returns true if v1 is greater than v2
 * @param {string | number} varNum01 - a variable or numeric containing the number to be compared
 * @param {string | number} varNum02 - a variable or numeric containing the second comporator
 * @returns {WOQLQuery} A WOQLQuery which contains the comparison expression
 * @example
 * greater(1.2, 1.1).eq("v:result", literal(true, "boolean"))
 * //result contains true
 */
WOQL.greater = function(varNum01, varNum02) {
    return new WOQLQuery().greater(varNum01, varNum02)
}

/**
 *
 * Specifies that the Subquery is optional - if it does not match the query will not fail
 * @param {WOQLQuery} [subquery] - A subquery which will be optionally matched
 * @returns {WOQLQuery} A WOQLQuery object containing the optional sub Query
 * @example
 * let [subject] = vars("subject")
 * opt(triple(subject, 'label', "A"))
 * //Subq is an argument or a chained query
 * opt().triple(subject, 'label', "A")
 */
WOQL.opt = function(subquery) {
    return new WOQLQuery().opt(subquery)
}

WOQL.optional = WOQL.opt

/**
 *
 * Generate a new IRI from the prefix and a hash of the variables which will be unique for any given combination of variables
 * @param {string} prefix - A prefix for the IRI - typically formed of the doc prefix and the classtype of the entity (“doc:Person”)
 * @param {array | string} inputVarList - An array of variables and / or strings from which the unique hash will be generated
 * @param {string} resultVarName - Variable in which the unique ID is stored
 * @returns {WOQLQuery} A WOQLQuery object containing the unique ID generating function
 * @example
 * unique("doc:Person", ["John", "Smith"], "v:newid")
 */
WOQL.unique = function(prefix, inputVarList, resultVarName) {
    return new WOQLQuery().unique(prefix, inputVarList, resultVarName)
}

/**
 *
 * Generate a new IRI from the prefix and concatention of the variables
 * @param {string} prefix - A prefix for the IRI - typically formed of the doc prefix and the classtype of the entity (“doc:Person”)
 * @param {array | string} inputVarList - An array of variables and / or strings from which the unique hash will be generated
 * @param {string} resultVarName - Variable in which the unique ID is stored
 * @returns {WOQLQuery} A WOQLQuery object containing the ID generating function
 * @example
 * let [newid] = vars("newid")
 * idgen("doc:Person", ["John", "Smith"], newid)
 */
WOQL.idgen = function(prefix, inputVarList, resultVarName) {
    return new WOQLQuery().idgen(prefix, inputVarList, resultVarName)
}
WOQL.idgenerator = WOQL.idgen

/**
 *
 * Changes a string to upper-case
 * @param {string} inputVarName - string or variable representing the uncapitalized string
 * @param {string} resultVarName -  variable that stores the capitalized string output
 * @returns {WOQLQuery} A WOQLQuery which contains the Upper case pattern matching expression
 * @example
 * upper("aBCe", "v:allcaps")
 * //upper contains "ABCE"
 */
WOQL.upper = function(inputVarName, resultVarName) {
    return new WOQLQuery().upper(inputVarName, resultVarName)
}

/**
 *
 * Changes a string to lower-case
 * @param {string} inputVarName -  string or variable representing the non-lowercased string
 * @param {string} resultVarName - variable that stores the lowercased string output
 * @returns {WOQLQuery} A WOQLQuery which contains the Lower case pattern matching expression
 * @example
 * let [lower] = var("l")
 * lower("aBCe", lower)
 * //lower contains "abce"
 */
WOQL.lower = function(inputVarName, resultVarName) {
    return new WOQLQuery().lower(inputVarName, resultVarName)
}

/**
 *
 * Pads out the string input to be exactly len long by appending the pad character pad to form output
 * @param {string} inputVarName - The input string or variable in unpadded state
 * @param {string} pad - The characters to use to pad the string or a variable representing them
 * @param {number | string} len - The variable or integer value representing the length of the output string
 * @param {string} resultVarName - stores output
 * @returns {WOQLQuery} A WOQLQuery which contains the Pad pattern matching expression
 * @example
 * let [fixed] = vars("fixed length")
 * pad("joe", " ", 8, fixed)
 * //fixed contains "joe     "
 */
WOQL.pad = function(inputVarName, pad, len, resultVarName) {
    return new WOQLQuery().pad(inputVarName, pad, len, resultVarName)
}

/**
 * Splits a string (Input) into a list strings (Output) by removing separator
 * @param {string} inputVarName - A string or variable representing the unsplit string
 * @param {string} separator - A string or variable containing a sequence of charatcters to use as a separator
 * @param {string} resultVarName - variable that stores output list
 * @returns {WOQLQuery} A WOQLQuery which contains the Split pattern matching expression
 * @example
 * split("joe has a hat", " ", "v:words")
 */
WOQL.split = function(inputVarName, separator, resultVarName) {
    return new WOQLQuery().split(inputVarName, separator, resultVarName)
}

/**
 * Matches if List includes Element
 * @param {string | object} element - Either a variable, IRI or any simple datatype
 * @param {string} list - List ([string, literal] or string*) Either a variable representing a list or a list of variables or literals
 * @returns {WOQLQuery} A WOQLQuery which contains the List inclusion pattern matching expression
 * @example
 * let [name] = vars("name")
 * member("name", ["john", "joe", "frank"])
 */
WOQL.member = function(element, list) {
    return new WOQLQuery().member(element, list)
}

/**
 *
 * takes a variable number of string arguments and concatenates them into a single string
 * @param {array | string} varList -  a variable representing a list or a list of variables or strings - variables can be embedded in the string if they do not contain spaces
 * @param {string}  resultVarName - A variable or string containing the output string
 * @returns {WOQLQuery} A WOQLQuery which contains the Concatenation pattern matching expression
 * @example
 * concat(["v:first_name", " ", "v:last_name"], "v:full_name")
 * WOQL.concat(["first_name", " ", "last_name"], "full_name")
 * //both versions work
 */
WOQL.concat = function(varList, resultVarName) {
    return new WOQLQuery().concat(varList, resultVarName)
}

/**
 *
 * Joins a list variable together (Input) into a string variable (Output) by glueing the strings together with Glue
 * @param {string | array} varList - a variable representing a list or a list of strings and / or variables
 * @param {string} glue - A variable (v:glue) or (glue) string representing the characters to put in between the joined strings in input
 * @param {string} resultVarName - A variable or string containing the output string
 * @returns {WOQLQuery} A WOQLQuery which contains the Join pattern matching expression
 * @example
 * join(["joe", "has", "a", "hat", " ", "v:sentence")
 */
WOQL.join = function(varList, glue, resultVarName) {
    return new WOQLQuery().join(varList, glue, resultVarName)
}

/**
 * computes the sum of the List of values passed. In contrast to other arithmetic functions, sum self-evaluates - it does not have to be passed to evaluate()
 * @param {WOQLQuery} subquery -  a subquery or ([string or numeric]) - a list variable, or a list of variables or numeric literals
 * @param {number} total - the variable name with the sum result of the values in List
 * @returns {WOQLQuery} - A WOQLQuery which contains the Sum expression
 * @example
 * sum([2, 3, 4, 5], "v:total")
 */
WOQL.sum = function(subquery, total) {
    return new WOQLQuery().sum(subquery, total)
}

/**
 *
 * Specifies an offset position in the results to start listing results from
 * @param {number | string} start - A variable that refers to an interger or an integer literal
 * @param {WOQLQuery} [subquery] - WOQL Query object, you can pass a subquery as an argument or a chained query
 * @returns {WOQLQuery} A WOQLQuery whose results will be returned starting from the specified offset
 * @example
 * let [a, b, c] = vars("a", "b", "c")
 * start(100).triple(a, b, c)
 */
WOQL.start = function(start, subquery) {
    return new WOQLQuery().start(start, subquery)
}

/**
 *
 * Specifies a maximum number of results that will be returned from the subquery
 * @param {number | string} limit - A variable that refers to an non-negative integer or a non-negative integer
 * @param {WOQLQuery} [subquery] - A subquery whose results will be limited
 * @returns {WOQLQuery} A WOQLQuery whose results will be returned starting from the specified offset
 * @example
 * let [a, b, c] = vars("a", "b", "c")
 * limit(100).triple(a, b, c)
 * //subquery is an argument or a chained query
 * limit(100,triple(a, b, c))
 */
WOQL.limit = function(limit, subquery) {
    return new WOQLQuery().limit(limit, subquery)
}

/**
 *
 * Matches the regular expression defined in Patern against the Test string, to produce the matched patterns in Matches
 * @param {string} pattern - string or variable using normal PCRE regular expression syntax with the exception that special characters have to be escaped twice (to enable transport in JSONLD)
 * @param {string} inputVarName - string or variable containing the string to be tested for patterns with the regex
 * @param {string | array | object} resultVarList - variable representing the list of matches or a list of strings or variables
 * @returns {WOQLQuery} A WOQLQuery which contains the Regular Expression pattern matching expression
 * @example
 * WOQL.re("h(.).*", "hello", ["v:All", "v:Sub"])
 * //e contains 'e', llo contains 'llo'
 * //p is a regex pattern (.*) using normal regular expression syntax, the only unusual thing is that special characters have to be escaped twice, s is the string to be matched and m is a list of matches:
 */
WOQL.re = function(pattern, inputVarName, resultVarList) {
    return new WOQLQuery().re(pattern, inputVarName, resultVarList)
}
WOQL.regexp = WOQL.re

/**
 *
 * Calculates the length of the list in va and stores it in vb
 * @param {string | array} inputVarList - Either a variable representing a list or a list of variables or literals
 * @param {string} resultVarName -  A variable in which the length of the list is stored or the length of the list as a non-negative integer
 * @returns {WOQLQuery} A WOQLQuery which contains the Length pattern matching expression
 * @example
 * let [count] = vars("count")
 * length(["john", "joe", "frank"], count)
 */
WOQL.length = function(inputVarList, resultVarName) {
    return new WOQLQuery().length(inputVarList, resultVarName)
}

/**
 *
 * Logical negation of the contained subquery - if the subquery matches, the query will fail to match
 * @param {string | WOQLQuery} [subquery] -  A subquery which will be negated
 * @returns {WOQLQuery} A WOQLQuery object containing the negated sub Query
 * @example
 * let [subject, label] = vars("subject", "label")
 * not().triple(subject, 'label', label)
 */
WOQL.not = function(subquery) {
    return new WOQLQuery().not(subquery)
}

/**
 * Results in one solution of the subqueries
 * @param {string| WOQLQuery } [subquery] - WOQL Query objects
 * @returns {WOQLQuery} A WOQLQuery object containing the once sub Query
 */
WOQL.once = function(subquery) {
    return new WOQLQuery().once(subquery)
}

/**
 * Runs the query without backtracking on side-effects
 * @param {string| WOQLQuery } [subquery] - WOQL Query objects
 * @returns {WOQLQuery} A WOQLQuery object containing the immediately sub Query
 */
WOQL.immediately = function(subquery) {
    return new WOQLQuery().immediately(subquery)
}

/**
 * Creates a count of the results of the query
 * @param {string | number} countVarName - variable or integer count
 * @param {WOQLQuery} [subquery]
 * @returns {WOQLQuery} A WOQLQuery object containing the count sub Query
 * @example
 * WOQL.count("v:count").triple("v:Person","type","scm:Person")
 */
WOQL.count = function(countVarName, subquery) {
    return new WOQLQuery().count(countVarName, subquery)
}

/**
 *
 * Casts the value of Input to a new value of type Type and stores the result in CastVar
 * @param {string | number | object} varName - Either a single variable or a literal of any basic type
 * @param {string} varType - Either a variable or a basic datatype (xsd / xdd)
 * @param {string} resultVarName - save the return variable
 * @returns {WOQLQuery} A WOQLQuery which contains the casting expression
 * @example
 * cast("22/3/98", "xsd:dateTime", "v:time")
 */
WOQL.typecast = function(varName, varType, resultVarName) {
    return new WOQLQuery().typecast(varName, varType, resultVarName)
}
WOQL.cast = WOQL.typecast

/**
 * Orders the results of the contained subquery by a precedence list of variables
 * @param  {...string} varNames - A sequence of variables, by which to order the results, each optionally followed by either “asc” or “desc” to represent order
 * @returns  {WOQLQuery} A WOQLQuery which contains the ordering expression
 * @example
 * WOQL.order_by("v:A", "v:B asc", "v:C desc").triple("v:A", "v:B", "v:C");
 */
WOQL.order_by = function(...varNames) {
    return new WOQLQuery().order_by(...varNames)
}

/**
 *
 * Groups the results of the contained subquery on the basis of identical values for Groupvars, extracts the patterns defined in PatternVars and stores the results in GroupedVar
 * @param {array | string} varList - Either a single variable or an array of variables
 * @param {array | string} patternVars - Either a single variable or an array of variables
 * @param {string} resultVarName - output variable name
 * @param {WOQLQuery} [subquery] - The query whose results will be grouped
 * @returns {WOQLQuery} A WOQLQuery which contains the grouping expression
 * @example
 * //subquery is an argument or a chained query
 * let [age, last_name, first_name, age_group, person] = vars("age", "last name", "first name", "age group", "person")
 * group_by(age, [last_name, first_name], age_group)
 *   .triple(person, "first_name", first_name)
 *   .triple(person, "last_name", last_name)
 *   .triple(person, "age", age)
 */
WOQL.group_by = function(varList, patternVars, resultVarName, subquery) {
    return new WOQLQuery().group_by(varList, patternVars, resultVarName, subquery)
}

/**
 *
 * A function that always matches, always returns true
 * @returns {WOQLQuery} A WOQLQuery object containing the true value that will match any pattern
 * @example
 * when(true()).triple("a", "b", "c")
 */
WOQL.true = function() {
    return new WOQLQuery().true()
}

/**
 *
 * Performs a path regular expression match on the graph
 * @param {string} subject -  An IRI or variable that refers to an IRI representing the subject, i.e. the starting point of the path
 * @param {string} pattern -(string) - A path regular expression describing a pattern through multiple edges of the graph
 * Path regular expressions consist of a sequence of predicates and / or a set of alternatives, with quantification operators
 * The characters that are interpreted specially are the following:
 * | representing alternative choices
 * , - representing a sequence of predcitates
 * + - Representing a quantification of 1 or more of the preceding pattern in a sequence
 * {min, max} - Representing at least min examples and at most max examples of the preceding pattern
 * - Representing any predicate
 * () - Parentheses, interpreted in the normal way to group clauses
 * @param {string} object - An IRI or variable that refers to an IRI representing the object, i.e. ending point of the path
 * @param {string} resultVarName - A variable in which the actual paths traversed will be stored
 * @returns {WOQLQuery} - A WOQLQuery which contains the path regular expression matching expression
 * @example
 * let [person, grand_uncle, lineage] = vars("person", "grand uncle", "lineage")
 * path(person, ((father|mother) {2,2}), brother), grand_uncle, lineage)
 */
WOQL.path = function(subject, pattern, object, resultVarName) {
    return new WOQLQuery().path(subject, pattern, object, resultVarName)
}

/**
 *
 * Calculates the size in bytes of the contents of the resource identified in ResourceID
 * @param {string} resourceId - A valid resource identifier string (can refer to any graph / branch / commit / db)
 * @param {string} resultVarName - The variable name
 * @example
 * size("admin/minecraft/local/branch/main/instance/main", "v:varSize")
 * //returns the number of bytes in the main instance graph on the main branch
 */
WOQL.size = function(resourceId, resultVarName) {
    return new WOQLQuery().size(resourceId, resultVarName)
}

/**
 *
 * Calculates the number of triples of the contents of the resource identified in ResourceID
 * @param {string} resourceId - A valid resource identifier string (can refer to any graph / branch / commit / db)
 * @param {string | number} tripleCount - An integer literal with the size in bytes or a variable containing that integer
 * @returns {WOQLQuery} A WOQLQuery which contains the size expression
 * @example
 * let [tc] = vars("s")
 * triple_count("admin/minecraft/local/_commits", tc)
 * //returns the number of bytes in the local commit graph
 */
WOQL.triple_count = function(resourceId, tripleCount) {
    return new WOQLQuery().triple_count(resourceId, tripleCount)
}

/**
 *
 * Returns true if 'elementId' is of type 'elementType', according to the current DB schema
 * @param {string} elementId - the id of a schema graph element
 * @param {string} elementType - the element type
 * @returns {WOQLQuery} A WOQLQuery object containing the type_of pattern matching rule
 */
WOQL.type_of = function(elementId, elementType) {
    return new WOQLQuery().type_of(elementId, elementType)
}

/**
 *
 * Generates a query that by default matches all triples in a graph identified by "graph" or in all the current terminusDB's graph
 * @param {string | boolean} [graph] - false or the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *}
 * @param {string} [subject] - The IRI of a triple’s subject or a variable,  default value "v:Subject"
 * @param {string} [predicate] - The IRI of a property or a variable, default value "v:Predicate"
 * @param {string} [object] - The IRI of a node or a variable, or a literal,  default value "v:Object"
 * @returns {WOQLQuery} A WOQLQuery which contains the pattern matching expression
 * @example
 * star("schema/main")
 * //will return every triple in schema/main graph
 */
WOQL.star = function(graph, subject, predicate, object) {
    return new WOQLQuery().star(graph, subject, predicate, object)
}

/**
 *
 * Generates a query that by default matches all triples in a graph - identical to star() except for order of arguments
 * @param {string} [subject] - The IRI of a triple’s subject or a variable
 * @param {string} [predicate] - The IRI of a property or a variable
 * @param {string} [object] - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} [graphRef] - the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *}
 * @returns {WOQLQuery} - A WOQLQuery which contains the pattern matching expression
 * all("mydoc")
 * //will return every triple in the instance/main graph that has "doc:mydoc" as its subject
 */
WOQL.all = function(subject, predicate, object, graphRef) {
    return new WOQLQuery().all(subject, predicate, object, graphRef)
}

/**
 *
 * Specifies the identity of a node that can then be used in subsequent builder functions. Note that node() requires subsequent chained functions to complete the triples / quads that it produces - by itself it only generates the subject.
 * @param {string} nodeid -  The IRI of a node or a variable containing an IRI which will be the subject of the builder functions
 * @param {typedef.FuntionType} [chainType] - Optional type of builder function to build  (default is triple)
 * @returns {WOQLQuery} - A WOQLQuery which contains the partial Node pattern matching expression
 * @example
 * node("mydoc").label("my label")
 * //equivalent to triple("mydoc", "label", "my label")
 */
WOQL.node = function(nodeid, chainType) {
    return new WOQLQuery().node(nodeid, chainType)
}
//These ones are special ones for dealing with the schema only...

/**
 * Inserts a single triple into the database declaring the Node to have type Type, optionally into the specified graph
 * @param {string} classId - IRI string or variable containing the IRI of the node to be inserted
 * @param {string} classType  -  IRI string or variable containing the IRI of the type of the node (class/document name)
 * @param {typedef.GraphRef} [graphRef] - Optional Graph resource identifier
 * @returns {WOQLQuery} A WOQLQuery which contains the insert expression
 * @example
 * insert("mydoc", "MyType")
 * //equivalent to add_triple("mydoc", "type", "MyType")
 */
WOQL.insert = function(classId, classType, graphRef) {
    return new WOQLQuery().insert(classId, classType, graphRef)
}

/**
 * Generates an empty query object - identical to query - included for backwards compatibility as before v3.0, the schema functions were in their own namespace.
 * @param {typedef.GraphRef} [graphRef] Resource String identifying the graph which will be used for subsequent chained schema calls
 * @returns {WOQLQuery} An empty WOQLQuery with the internal schema graph pointes set to Graph
 * @example
 * schema("schema/dev").add_class("X")
 */

WOQL.schema = function(graphRef) {
    let woql = new WOQLQuery()
    if (graphRef) woql.graph(graphRef)
    return woql
}

/**
 * Sets the graph resource ID that will be used for subsequent chained function calls
 * @param {typedef.GraphRef} [graphRef] Resource String identifying the graph which will be used for subsequent chained schema calls
 * @returns {WOQLQuery} A WOQLQuery which contains the partial Graph pattern matching expression
 * @example
 * node("MyClass", "AddQuad").graph("schema/main").label("My Class Label")
 * //equivalent to add_quad("MyClass", "label", "My Class Label", "schema/main")
 */

WOQL.graph = function(graphRef) {
    return new WOQLQuery().graph(graphRef)
}

/**
 *
 * Generates a new Class with the given ClassID and writes it to the DB schema
 * @param {string} classId - IRI or variable containing IRI of the new class to be added (prefix default to scm)
 * @param {string} [schemaGraph] - Optional Resource String identifying the schema graph into which the class definition will be written
 * @returns {WOQLQuery} A WOQLQuery which contains the add class expression
 * @example
 * add_class("MyClass")
 * //equivalent to add_quad("MyClass", "type", "owl:Class", "schema/main")
 */
WOQL.add_class = function(classId, schemaGraph) {
    return new WOQLQuery().add_class(classId, schemaGraph)
}

/**
 * Generates a new Property with the given PropertyID and a range of type and writes it to the DB schema
 * @param {string} propId - IRI or variable containing IRI of the new property to be added (prefix default to scm)
 * @param {string} propType - optional IRI or variable containing IRI of the range type of the new property (defaults to xsd:string)
 * @param {string} [schemaGraph] - Optional Resource String identifying the schema graph into which the property definition will be written
 * @returns {WOQLQuery} A WOQLQuery which contains the add property expression
 * @example
 * add_property("myprop")
 * //equivalent to add_quad("myprop", "type", "owl:DatatypeProperty", "schema/main")
 * //.add_quad("myprop", "range", "xsd:string", "schema/main")
 */
WOQL.add_property = function(propId, propType, schemaGraph) {
    return new WOQLQuery().add_property(propId, propType, schemaGraph)
}

/**
 * Deletes the Class with the passed ID form the schema (and all references to it)
 * @param {string} classId - IRI or variable containing IRI of the class to be deleted (prefix default to scm)
 * @param {string} [schemaGraph] - Optional Resource String identifying the schema graph
 * @param {string} [classVarName] - The var name, default value "v:Class"
 * @returns {WOQLQuery} A WOQLQuery which contains the class deletion expression
 * @example
 * delete_class("MyClass")
 */
WOQL.delete_class = function(classId, schemaGraph, classVarName) {
    return new WOQLQuery().delete_class(classId, schemaGraph, classVarName)
}

/**
 *
 * Deletes a property from the schema and all its references incoming and outgoing
 * @param {string} propId - IRI or a variable containing IRI of the property to be deleted (prefix defaults to scm)
 * @param {string} [schemaGraph] - Resource String identifying the schema graph from which the property definition will be deleted
 * @param {string} [propVarName]
 * @returns {WOQLQuery} A WOQLQuery which contains the property deletion expression
 * @example
 * delete_property("MyProp")
 */
WOQL.delete_property = function(propId, schemaGraph, propVarName) {
    return new WOQLQuery().delete_property(propId, schemaGraph, propVarName)
}

/**
 *
 * Creates a new document class in the schema
 * @param {string} classId -  IRI or variable containing IRI of the new document class to be added (prefix default to scm)
 * @param {string} [schemaGraph] - Resource String identifying the schema graph from which the document definition will be added
 * @returns {WOQLQuery} A WOQLQuery which contains the add document class expression
 * @example
 * doctype("MyClass")
 * //equivalent to add_quad("MyClass", "type", "owl:Class", "schema/main")
 * //.add_quad("MyClass", "subClassOf", "system:Document", "schema/main")
 */
WOQL.doctype = function(classId, schemaGraph) {
    return WOQL.add_class(classId, schemaGraph).parent('Document')
}

/**
 * Composite functions which allow json objects to be sent in to specify many parts in one go
 */
//how do dynamic key declaration

/**
 * Inserts data as an object - enabling multiple property values to be inserted in one go
 * @param {object} dataObj - json object which contains fields:
 * mandatory: id, type
 * optional: label, description, [property] (valid property ids)
 * @param {string} [instanceGraph] -  al graph resource identifier (defaults to “instance/main” if no using or into is specified)
 * @returns {WOQLQuery} A WOQLQuery which contains the insertion expression
 * @example
 * let data = {id: "doc:joe",
 *   type: "Person",
 *   label: "Joe",
 *   description: "My friend Joe",
 *   age: 42
 *  }
 *  insert_data(data)
 */
WOQL.insert_data = function(dataObj, instanceGraph) {
    return new WOQLQuery().insert_data(dataObj, instanceGraph)
}

/**
 *
 * Inserts data about a class as a json object - enabling a class and all its properties to be specified in a single function
 * @param {typedef.ClassObj} classObj with id, label, description, parent and properties
 * @param {string} [schemaGraph] - the resource identifier of a schema graph. The Default value is schema/main
 * @returns {WOQLQuery} - A WOQLQuery which contains the insertion expression
 * @example
 * let data = { id: "Robot", label: "Robot", parent: ["MyClass001", "MyClass002"]}
 * insert_class_data(data)
 */
WOQL.insert_class_data = function(classObj, schemaGraph) {
    return new WOQLQuery().insert_class_data(classObj, schemaGraph)
}

/**
 * Inserts data about a class as a json object - enabling a class and all its properties to be specified in a single function
 * @param {typedef.ClassObj} classObj with id, label, description, parent and properties
 * @param {string} [schemaGraph] - the resource identifier of a schema graph. The Default value is schema/main
 * @returns {WOQLQuery} - A WOQLQuery which contains the insertion expression
 * @example
 * let data = {
 *   id: "Person",
 *   label: "Person",
 *   age: {
 *       label: "Age",
 *       range: "xsd:integer",
 *       max: 1
 *    }
 * }
 * insert_doctype_data(data)
 */
WOQL.insert_doctype_data = function(classObj, schemaGraph) {
    return new WOQLQuery().insert_doctype_data(classObj, schemaGraph)
}

/**
 * Inserts data about a document class as a json object - enabling a document class and all its properties to be specified in a single function
 * @param {typedef.PropertyObj} propObj - json object which contains fields:
 * @param {string} [schemaGraph] - the resource identifier of a schema graph. The Default value id schema/main
 * @returns {WOQLQuery} - A WOQLQuery which contains the insertion expression
 * @example
 * let data = {
 *   id: "prop",
 *   label: "Property",
 *   description: "prop desc",
 *   range: "X",
 *   domain: "X",
 *   max: 2,
 *   min: 1}
 *   insert_property_data(data)
 */
WOQL.insert_property_data = function(propObj, schemaGraph) {
    return new WOQLQuery().insert_property_data(propObj, schemaGraph)
}

/**
 * Deletes all triples in the passed graph (defaults to instance/main)
 * @param {typedef.GraphRef} [graphRef] - Resource String identifying the graph from which all triples will be removed
 * @returns {WOQLQuery} - A WOQLQuery which contains the deletion expression
 * @example
 * nuke("schema/main")
 * //will delete everything from the schema/main graph
 */
WOQL.nuke = function(graphRef) {
    return new WOQLQuery().nuke(graphRef)
}

/**
 * Generates an empty WOQLQuery object
 * @returns {WOQLQuery}
 * @example
 * let q = query()
 * //then q.triple(1, 1) ...
 */
WOQL.query = function() {
    return new WOQLQuery()
}

/**
 * Generates a WOQLQuery object from the passed WOQL JSON - if an argument is passed, the query object is created from it, if none is passed, the current state is returned as a JSON-LD
 * @param {object} [JSON_LD] - JSON-LD woql document encoding a query
 * @returns {WOQLQuery | object} either a JSON-LD or a WOQLQuery object
 *
 * json version of query for passing to api
 */
WOQL.json = function(JSON_LD) {
    return new WOQLQuery().json(JSON_LD)
}

WOQL.lib = function(mode) {
    return new new WOQLQuery().lib(mode)
}

/**
 * Generates explicitly a JSON-LD string literal from the input
 * @param {string | boolean | number} val - any primitive literal type
 * @returns {object} - A JSON-LD string literal
 * @example
 * string(1)
 * //returns { "@type": "xsd:string", "@value": "1" }
 */
WOQL.string = function(val) {
    return new new WOQLQuery().string(val)
}

/**
 * Generates explicitly a JSON-LD string literal from the input
 * @param {string} val - any literal type
 * @param {string} type - an xsd or xdd type
 * @returns {object} - A JSON-LD literal
 * @example
 * literal(1, "nonNegativeInteger")
 * //returns { "@type": "xsd:nonNegativeInteger", "@value": 1 }
 */
WOQL.literal = function(val, type) {
    return new new WOQLQuery().literal(val, type)
}

/**
 * Explicitly sets a value to be an IRI - avoiding automatic type marshalling
 * @param {string} val string which will be treated as an IRI
 * @returns {object} - A JSON-LD IRI value
 */
WOQL.iri = function(val) {
    return new new WOQLQuery().iri(val)
}

/**
 * Generates javascript variables for use as WOQL variables within a query
 * @param  {...string} varNames
 * @returns {array} an array of javascript variables which can be dereferenced using the array destructuring operation
 * @example
 * const [a, b, c] = WOQL.vars("a", "b", "c")
 * //a, b, c are javascript variables which can be used as WOQL variables in subsequent queries
 */

WOQL.vars = function(...varNames) {
    return varNames.map(item => 'v:' + item)
}

/**
 * Gets/Sets woqlClient
 * @param {WOQLClient}
 * @returns {WOQLClient}
 */
WOQL.client = function(client) {
    if (client) this._client = client
    return this._client
}

/**
 *
 * query module
 * allow you to use WOQL words as top level functions
 * @param {*} auto_eval
 */
WOQL.emerge = function(auto_eval) {
    let unemerged = ['emerge', 'true', 'eval']
    function _emerge_str(k) {
        let str = `function ${k}(...args){
            return WOQL.${k}(...args)
        }`
        return str
    }
    let funcs = []
    for (var k in this) {
        if (typeof this[k] == 'function') {
            if (unemerged.indexOf(k) == -1) {
                funcs.push(_emerge_str(k))
            }
        }
    }
    let str = funcs.join(';\n')
    if (auto_eval) eval(str)
    return str
}

/**
 * Update a pattern matching rule for the triple (Subject, Predicate, oldObjValue) with the new one (Subject, Predicate, newObjValue)
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} newObjValue - The value to update or a literal
 * @param {string} oldObjValue - The old value of the object
 * @returns {WOQLQuery} A WOQLQuery which contains the a Update Triple Statement
 */

WOQL.update_triple = function(subject, predicate, newObjValue, oldObjValue) {
    return new WOQLQuery().update_triple(subject, predicate, newObjValue, oldObjValue)
}

/**
 * Update a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} newObject - The value to update or a literal
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery} A WOQLQuery which contains the a Update Quad Statement
 */

WOQL.update_quad = function(subject, predicate, newObject, graphRef) {
    return new WOQLQuery().update_quad(subject, predicate, newObject, graphRef)
}

/**
 * Creates a pattern matching rule for a quad [Subject, Predicate, Object, Graph] or for a triple [Subject, Predicate, Object]
 * add extra information about the type of the value object
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string | number | boolean} objValue - an specific value
 * @param {typedef.GraphRef} [graphRef] - the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *}
 * @returns {WOQLQuery} A WOQLQuery which contains the a quad or a triple Statement
 */
WOQL.value = function(subject, predicate, objValue, graphRef) {
    return new WOQLQuery().value(subject, predicate, objValue, graphRef)
}

/**
 * Creates a pattern matching rule for a quad [Subject, Predicate, Object, Graph] or for a triple [Subject, Predicate, Object]
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} [graphRef] - the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *}
 * @returns {WOQLQuery} A WOQLQuery which contains the a quad or a triple Statement
 */
WOQL.link = function(subject, predicate, object, graphRef) {
    return new WOQLQuery().link(subject, predicate, object, graphRef)
}

/**
 * @param {WOQLClient} woqlClient - an WoqlClient instance
 * @param {string} propId - property id
 * @param {string} classId - the enum class id
 * @param {string} classLabel - the enum class label
 * @param {string} [classDesc]  - the enum class description
 * @param {string} [schemaGraph] - the resource identifier of a schema graph. The Default value id schema/main
 * @returns {WOQLQuery} - A WOQLQuery which contains the Create Enum Class Statement
 */
WOQL.makeEnum = function(woqlClient, propId, classId, classLabel, classDesc, schemaGraph) {
    return new WOQLQuery().makeEnum(woqlClient, prop, classId, classLabel, classDesc, schemaGraph)
}

/**
 * Generates a class representing a choice list - an enumerated list of specific options
 * @param {string} classId - the enum class id
 * @param {string} classLabel - the enum class label
 * @param {string} classDesc  - the enum class description
 * @param {array}  choices - an list of permitted values [[id,label,comment],[id,label,comment]]
 * @param {string} [schemaGraph] - the resource identifier of a schema graph. The Default value id schema/main
 * @param {string} [parent] - the id of a class that this class inherits from (e.g. scm:Enumerated)
 * @returns {WOQLQuery} - A WOQLQuery which contains the Generate Enum/Choice Class Statement
 */

WOQL.generateChoiceList = function(classId, classLabel, classDesc, choices, schemaGraph, parent) {
    return new WOQLQuery().generateChoiceList(
        classId,
        classLabel,
        classDesc,
        choices,
        schemaGraph,
        parent,
    )
}

/**
 * update or create an enumeration class. You have to add at least one permitted values in the list
 * @param {string} classId - the enum class id
 * @param {string} classLabel - the enum class label
 * @param {string} classDesc  - the enum class description
 * @param {array}  choices - an list of permitted values [[id,label,comment],[id,label,comment]]
 * @param {string} [schemaGraph] - the resource identifier of a schema graph. The Default value id schema/main
 * @returns {WOQLQuery} - A WOQLQuery which contains the Update Enum/Choice Class Statement
 */
WOQL.updateChoiceList = function(classId, classLabel, classDesc, choices, schemaGraph) {
    return new WOQLQuery().updateChoiceList(classId, classLabel, classDesc, choices, schemaGraph)
}

/**
 * delete the enum list for a specific enumeration class, but not the class
 * @param {string} classId - the enum class name
 * @param {string} [schemaGraph] - the resource identifier of a schema graph. The Default value id schema/main
 * @returns {WOQLQuery} - A WOQLQuery which contains the Delete Choice List Statement
 */

WOQL.deleteChoiceList = function(classId, schemaGraph) {
    return new WOQLQuery().deleteChoiceList(classId, schemaGraph)
}

/**
 * Called to load Terminus Predefined libraries:
 * @param {*} libs xsd,xdd,box
 * @param {*} parent
 * @param {*} graph --graph ref
 * @param {*} prefix --prefix you want use
 */
WOQL.libs = function(libs, parent, graph, prefix) {
    return new WOQLQuery().libs(libs, parent, graph, prefix)
}

/**
 * creating a structure ScopedMyClass -> myClass -> MyClass
 *
 * @param {string} prefix - the url prefix that will be used for the boxed types (default scm:)
 * @param {array} classes - the classes to box - these classes and all their subclasses will have special boxed classes created around them
 * @param {array} except - the exceptions - these classes and their subclasses will not be boxed, even if they are included in the above array
 * @param {string} [schemaGraph] - the resource identifier of a schema graph. The Default value id schema/main
 * @returns {WOQLQuery} - A WOQLQuery which contains the Box Classes Creating Statement
 */
WOQL.boxClasses = function(prefix, classes, except, schemaGraph) {
    return new WOQLQuery().boxClasses(prefix, classes, except, schemaGraph)
}

module.exports = WOQL
