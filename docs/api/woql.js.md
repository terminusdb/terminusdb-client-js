
## WOQL
#### WOQL
**License**: Apache Version 2  

#### new WOQL()
The WOQL object is a wrapper around the WOQLQuery object
Syntactic sugar to allow writing WOQL.triple()... instead of new WOQLQuery().triple()
Every function matches one of the public api functions of the woql query object


### eval
#### WOQL.eval ⇒ <code>WOQLQuery</code>
Evaluates the passed arithmetic expression and generates or matches the result value

**Returns**: <code>WOQLQuery</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| arithExp | <code>object</code> \| <code>WOQLQuery</code> \| <code>string</code> | query or JSON-LD representing the query |
| resultVarName | <code>string</code> | output variable |


### using
#### WOQL.using(refPath, subquery) ⇒ <code>WOQLQuery</code>
Query running against any specific commit Id


| Param | Type | Description |
| --- | --- | --- |
| refPath | <code>string</code> | path to specific reference Id or commit Id |
| subquery | <code>WOQLQuery</code> | subquery for the specific commit point |

**Example**  
```js
WOQL.using("userName/dbName/local/commit|branch/commitID").triple("v:A", "v:B", "v:C")
```

### comment
#### WOQL.comment(comment, subquery) ⇒ <code>WOQLQuery</code>
Adds a text comment to a query - can also be used to wrap any part of a query to turn it off


| Param | Type | Description |
| --- | --- | --- |
| comment | <code>string</code> | text comment |
| subquery | <code>WOQLQuery</code> | query that is "commented out" |


### select
#### WOQL.select(...varNames) ⇒ <code>WOQLQuery</code>

| Param | Type | Description |
| --- | --- | --- |
| ...varNames | <code>string</code> | only these variables are returned |

**Example**  
```js
WOQL.select("v:a",triple("v:a","v:b","v:c"))
Filters the query so that only the variables included in [V1...Vn] are returned in the bindings
```

### distinct
#### WOQL.distinct(...varNames) ⇒ <code>WOQLQuery</code>
Filter the query to return only results that are distinct in the given variables


| Param | Type | Description |
| --- | --- | --- |
| ...varNames | <code>string</code> | these variables are guaranteed to be unique as a tuple |


### and
#### WOQL.and(...subqueries) ⇒ <code>WOQLQuery</code>
Logical conjunction of the contained queries - all queries must match or the entire clause fails

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery object containing the conjunction of queries  

| Param | Type | Description |
| --- | --- | --- |
| ...subqueries | <code>WOQLQuery</code> | A list of one or more woql queries to execute as a conjunction |

**Example**  
```js
//find triples that are of type scm:Journey, and have
//a start_station v:Start, and that start_station is labeled
//v:Start_Label

WOQL.and(
     WOQL.triple("v:Journey", "type", "scm:Journey"),
     WOQL.triple("v:Journey", "start_station", "v:Start"),
     WOQL.triple("v:Start", "label", "v:Start_Label"))
```

### read_object
#### ~~WOQL.read\_object()~~
***Deprecated***

Use [read_document](#read_document) instead.


### read_document
#### WOQL.read\_document(IRI, output, formatObj) ⇒ <code>object</code>
Read a node identified by an IRI as a JSON-LD document

**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| IRI | <code>string</code> | The document id  or a variable |
| output | <code>string</code> | variable name |
| formatObj | <code>object</code> |  |


### insert_document
#### WOQL.insert\_document(docjson, [IRI]) ⇒ <code>object</code>
Insert a document in the graph.

**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| docjson | <code>object</code> | The document to insert. Must either have an '@id' or have a class specified key. |
| [IRI] | <code>string</code> | An optional identifier specifying the document location. |


### update_document
#### WOQL.update\_document(docjson, [IRI]) ⇒ <code>object</code>
Update a document identified by an IRI

**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| docjson | <code>object</code> | The document to update. Must either have an '@id' or have a class specified key. |
| [IRI] | <code>string</code> | An optional identifier specifying the document location. |


### delete_document
#### WOQL.delete\_document(IRI) ⇒ <code>object</code>
Delete a document from the graph.

**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| IRI | <code>string</code> | The document id  or a variable |


### or
#### WOQL.or(...subqueries) ⇒ <code>WOQLQuery</code>
Creates a logical OR of the arguments

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery object containing the logical Or of the subqueries  

| Param | Type | Description |
| --- | --- | --- |
| ...subqueries | <code>WOQLQuery</code> | A list of one or more woql queries to execute as alternatives |

**Example**  
```js
or(
  triple("v:Subject", 'label', "A"),
  triple("v:Subject", "label", "a")
 )
```

### from
#### WOQL.from(graphRef-, [query]) ⇒ <code>WOQLQuery</code>
Specifies the database URL that will be the default database for the enclosed query

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the from expression  

| Param | Type | Description |
| --- | --- | --- |
| graphRef- | <code>typedef.GraphRef</code> | A valid graph resource identifier string |
| [query] | <code>WOQLQuery</code> | The query |


### into
#### WOQL.into(graphRef-, subquery) ⇒ <code>WOQLQuery</code>
Specifies the graph resource to write the contained query into

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which will be written into the graph in question  

| Param | Type | Description |
| --- | --- | --- |
| graphRef- | <code>typedef.GraphRef</code> | A valid graph resource identifier string |
| subquery | <code>WOQLQuery</code> | The query which will be written into the graph |

**Example**  
```js
//Subq is an argument or a chained query
using("admin/minecraft").into("instance/main").add_triple("a", "type", "scm:X")
//writes a single tripe (doc:a, rdf:type, scm:X) into the main instance graph
```

### triple
#### WOQL.triple(subject, predicate, object) ⇒ <code>WOQLQuery</code>
Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object)


| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### added_triple
#### WOQL.added\_triple(subject, predicate, object) ⇒ <code>WOQLQuery</code>
Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object) added in the current layer


| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### removed_triple
#### WOQL.removed\_triple(subject, predicate, object) ⇒ <code>WOQLQuery</code>
Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object) added in the current commit


| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### quad
#### WOQL.quad(subject, predicate, object, graphRef) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)


| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graphRef | <code>typedef.GraphRef</code> | A valid graph resource identifier string |


### added_quad
#### WOQL.added\_quad(subject, predicate, object, graphRef-) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph) removed from the current commit


| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graphRef- | <code>typedef.GraphRef</code> | A valid graph resource identifier string |


### removed_quad
#### WOQL.removed\_quad(subject, predicate, object, graphRef-) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph) removed from the current commit


| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graphRef- | <code>typedef.GraphRef</code> | A valid graph resource identifier string |


### sub
#### WOQL.sub(classA, classB) ⇒ <code>boolean</code>
Returns true if ClassA subsumes ClassB, according to the current DB schema

**Returns**: <code>boolean</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| classA | <code>string</code> | ClassA |
| classB | <code>string</code> | ClassB |


### eq
#### WOQL.eq(varName, varValue) ⇒ <code>WOQLQuery</code>
Matches if a is equal to b


| Param | Type | Description |
| --- | --- | --- |
| varName | <code>string</code> | literal, variable or id |
| varValue | <code>string</code> | literal, variable or id |


### substr
#### WOQL.substr(string, before, [length], [after], [substring]) ⇒ <code>WOQLQuery</code>
Substring


| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | String or variable |
| before | <code>number</code> | integer or variable (characters from start to begin) |
| [length] | <code>number</code> | integer or variable (length of substring) |
| [after] | <code>number</code> | integer or variable (number of characters after substring) |
| [substring] | <code>string</code> | String or variable |


### get
#### WOQL.get(asvars, queryResource) ⇒ <code>WOQLQuery</code>
Retrieves the exernal resource defined by QueryResource and copies values from it into variables defined in AsVars

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the get expression  

| Param | Type | Description |
| --- | --- | --- |
| asvars | <code>WOQLQuery</code> | an array of AsVar variable mappings (see as for format below) |
| queryResource | <code>WOQLQuery</code> | an external resource (remote, file, post) to query |

**Example**  
```js
let [a, b] = vars("a", "b")
get(as("a", a).as("b", b)).remote("http://my.url.com/x.csv")
//copies the values from column headed "a" into a variable a and from column
//"b" into a variable b from remote CSV
```

### put
#### WOQL.put(varsToExp, query, fileResource) ⇒ <code>WOQLQuery</code>
**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the put expression  
**Put**: Outputs the results of a query to a file  

| Param | Type | Description |
| --- | --- | --- |
| varsToExp | <code>WOQLQuery</code> | an array of AsVar variable mappings (see as for format below) |
| query | <code>WOQLQuery</code> | The query which will be executed to produce the results |
| fileResource | <code>string</code> | an file resource local to the server |

**Example**  
```js
let [s, p, o] = vars("Subject", "Predicate", "Object")
WOQL.put(WOQL.as("s", s).as("p", p).as("o", o), WOQL.all())
.file({file:"/app/local_files/dump.csv"})
```

### as
#### WOQL.as(source, target, [type]) ⇒ <code>WOQLQuery</code>
Imports the value identified by Source to a Target variable


| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> \| <code>number</code> | Source |
| target | <code>string</code> | Target |
| [type] | <code>string</code> | type to cast value to string|number etc... |

**Example**  
```js
WOQL.as("first var", "v:First_Var",{} "string").as("second var", "v:Second_Var")
 WOQL.as(["first var", "v:First_Var", "string"], ["second var", "v:Second_Var"])
```

### remote
#### WOQL.remote(remoteObj, [formatObj]) ⇒ <code>WOQLQuery</code>
Identifies a remote resource by URL and specifies the format of the resource through the options

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the remote resource identifier  

| Param | Type | Description |
| --- | --- | --- |
| remoteObj | <code>object</code> | The URL at which the remote resource can be accessed |
| [formatObj] | <code>typedef.DataFormatObj</code> | The format of the resource data {} |

**Example**  
```js
remote({url:"http://url.of.resource"}, {type: "csv"})
```

### file
#### WOQL.file(url, [formatObj]) ⇒ <code>WOQLQuery</code>
Identifies a file resource as a path on the server and specifies the format through the options

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the file resource identifier  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>object</code> | The Path on the server at which the file resource can be accessed |
| [formatObj] | <code>typedef.DataFormatObj</code> | imput options |

**Example**  
```js
file("/path/to/file", {type: 'turtle'} )
```

### post
#### WOQL.post(url, [formatObj], [source]) ⇒ <code>WOQLQuery</code>
Identifies a resource as a local path on the client, to be sent to the server through a
HTTP POST request, with the format defined through the options

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Post resource identifier  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The Path on the server at which the file resource can be accessed |
| [formatObj] | <code>typedef.DataFormatObj</code> | imput options, optional |
| [source] | <code>string</code> | It defines the source of the file, it can be 'url','post' |

**Example**  
```js
post("/.../.../", {type:'csv'})
```

### delete_triple
#### WOQL.delete\_triple(subject, predicate, object) ⇒ <code>WOQLQuery</code>
Deletes a single triple from the default graph of the database

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Triple Deletion statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |

**Example**  
```js
delete_triple("john", "age", 42)
```

### delete_quad
#### WOQL.delete\_quad(subject, predicate, object, graphRef) ⇒ <code>WOQLQuery</code>
Deletes a single triple from the graph [Subject, Predicate, Object, Graph]

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Delete Quad Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graphRef | <code>typedef.GraphRef</code> | A valid graph resource identifier string |

**Example**  
```js
remove the class Person from the schema/main graph
WOQL.delete_quad("Person", "type", "owl:Class", "schema/main")
```

### add_triple
#### WOQL.add\_triple(subject, predicate, object) ⇒ <code>object</code>
Adds triples according to the the pattern [subject,predicate,object]

**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### add_quad
#### WOQL.add\_quad(subject, predicate, object, graphRef-) ⇒ <code>object</code>
Adds quads according to the pattern [S,P,O,G]

**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graphRef- | <code>typedef.GraphRef</code> | A valid graph resource identifier string |


### trim
#### WOQL.trim(inputStr, resultVarName) ⇒ <code>WOQLQuery</code>
Remove whitespace from both sides of a string:

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Trim pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| inputStr | <code>string</code> | A string or variable containing the untrimmed version of the string |
| resultVarName | <code>string</code> | A string or variable containing the trimmed version of the string |

**Example**  
```js
trim("hello   ","v:trimmed")
//trimmed contains "hello"
```

### evaluate
#### WOQL.evaluate(arithExp, resultVarName) ⇒ <code>WOQLQuery</code>
Evaluates the passed arithmetic expression and generates or matches the result value

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Arithmetic function  

| Param | Type | Description |
| --- | --- | --- |
| arithExp | <code>object</code> \| <code>WOQLQuery</code> \| <code>string</code> | A WOQL query containing a valid WOQL Arithmetic Expression, which is evaluated by the function |
| resultVarName | <code>string</code> \| <code>number</code> | Either a variable, in which the result of the expression will be stored, or a numeric literal which will be used as a test of result of the evaluated expression |

**Example**  
```js
evaluate(plus(2, minus(3, 1)), "v:result")
```

### plus
#### WOQL.plus(...args) ⇒ <code>WOQLQuery</code>
Adds the numbers together

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the addition expression  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | a variable or numeric containing the values to add |

**Example**  
```js
evaluate(plus(2, plus(3, 1)), "v:result")
```

### minus
#### WOQL.minus(...args) ⇒ <code>WOQLQuery</code>
Subtracts Numbers N1..Nn

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the subtraction expression  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | variable or numeric containing the value that will be subtracted from |

**Example**  
```js
evaluate(minus(2.1, plus(0.2, 1)), "v:result")
```

### times
#### WOQL.times(...args) ⇒ <code>WOQLQuery</code>
Multiplies numbers N1...Nn together

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the multiplication expression  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | a variable or numeric containing the value |

**Example**  
```js
evaluate(times(10, minus(2.1, plus(0.2, 1))), "v:result")
 //result contains 9.000000000000002y
```

### divide
#### WOQL.divide(...args) ⇒ <code>WOQLQuery</code>
Divides numbers N1...Nn by each other left, to right precedence

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the division expression
evaluate(divide(times(10, minus(2.1, plus(0.2, 1))), 10), "v:result")
 //result contains 0.9000000000000001  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | numbers to tbe divided |


### div
#### WOQL.div(...args) ⇒ <code>WOQLQuery</code>
Division - integer division - args are divided left to right

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the division expression  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | numbers for division |

**Example**  
```js
let [result] = vars("result")
evaluate(div(10, 3), result)
//result contains 3
```

### exp
#### WOQL.exp(varNum, expNum) ⇒ <code>WOQLQuery</code>
Exponent - raises varNum01 to the power of varNum02

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the exponent expression  

| Param | Type | Description |
| --- | --- | --- |
| varNum | <code>string</code> \| <code>number</code> | a variable or numeric containing the number to be raised to the power of the second number |
| expNum | <code>number</code> | a variable or numeric containing the exponent |

**Example**  
```js
evaluate(exp(3, 2), "v:result")
//result contains 9
```

### floor
#### WOQL.floor(varNum) ⇒ <code>WOQLQuery</code>
Generates the nearest lower integer to the passed number

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the floor expression  

| Param | Type | Description |
| --- | --- | --- |
| varNum | <code>string</code> \| <code>number</code> | Variable or numeric containing the number to be floored |

**Example**  
```js
let [result] = vars("result")
evaluate(divide(floor(times(10, minus(2.1, plus(0.2, 1)))), 10), result)
//result contains 0.9 - floating point error removed
```

### isa
#### WOQL.isa(instanceIRI, classId) ⇒ <code>WOQLQuery</code>
Tests whether a given instance IRI has type Class, according to the current state of the DB

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the type test  

| Param | Type | Description |
| --- | --- | --- |
| instanceIRI | <code>string</code> | A string IRI or a variable that identify the class instance |
| classId | <code>string</code> | A Class IRI or a variable |

**Example**  
```js
let [subject] = vars("subject")
isa(subject, "Person")
```

### like
#### WOQL.like(stringA, stringB, distance) ⇒ <code>WOQLQuery</code>
Generates a string Leverstein distance measure between stringA and stringB

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Like pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| stringA | <code>string</code> | string literal or variable representing a string to be compared |
| stringB | <code>string</code> | string literal or variable representing the other string to be compared |
| distance | <code>number</code> \| <code>string</code> | variable representing the distance between the variables |

**Example**  
```js
let [dist] = vars('dist')
like("hello", "hallo", dist)
//dist contains 0.7265420560747664
```

### less
#### WOQL.less(varNum01, varNum02) ⇒ <code>WOQLQuery</code>
Compares the value of v1 against v2 and returns true if v1 is less than v2

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the comparison expression  

| Param | Type | Description |
| --- | --- | --- |
| varNum01 | <code>string</code> \| <code>number</code> | a variable or numeric containing the number to be compared |
| varNum02 | <code>string</code> \| <code>number</code> | a variable or numeric containing the second comporator |

**Example**  
```js
less(1, 1.1).eq("v:result", literal(true, "boolean"))
//result contains true
```

### greater
#### WOQL.greater(varNum01, varNum02) ⇒ <code>WOQLQuery</code>
Compares the value of v1 against v2 and returns true if v1 is greater than v2

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the comparison expression  

| Param | Type | Description |
| --- | --- | --- |
| varNum01 | <code>string</code> \| <code>number</code> | a variable or numeric containing the number to be compared |
| varNum02 | <code>string</code> \| <code>number</code> | a variable or numeric containing the second comporator |

**Example**  
```js
greater(1.2, 1.1).eq("v:result", literal(true, "boolean"))
//result contains true
```

### opt
#### WOQL.opt([subquery]) ⇒ <code>WOQLQuery</code>
Specifies that the Subquery is optional - if it does not match the query will not fail

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the optional sub Query  

| Param | Type | Description |
| --- | --- | --- |
| [subquery] | <code>WOQLQuery</code> | A subquery which will be optionally matched |

**Example**  
```js
let [subject] = vars("subject")
opt(triple(subject, 'label', "A"))
//Subq is an argument or a chained query
opt().triple(subject, 'label', "A")
```

### unique
#### WOQL.unique(prefix, inputVarList, resultVarName) ⇒ <code>WOQLQuery</code>
Generate a new IRI from the prefix and a hash of the variables which will be unique for any given combination of variables

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the unique ID generating function  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | A prefix for the IRI - typically formed of the doc prefix and the classtype of the entity (“doc:Person”) |
| inputVarList | <code>array</code> \| <code>string</code> | An array of variables and / or strings from which the unique hash will be generated |
| resultVarName | <code>string</code> | Variable in which the unique ID is stored |

**Example**  
```js
unique("doc:Person", ["John", "Smith"], "v:newid")
```

### idgen
#### WOQL.idgen(prefix, inputVarList, resultVarName) ⇒ <code>WOQLQuery</code>
Generate a new IRI from the prefix and concatention of the variables

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the ID generating function  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | A prefix for the IRI - typically formed of the doc prefix and the classtype of the entity (“doc:Person”) |
| inputVarList | <code>array</code> \| <code>string</code> | An array of variables and / or strings from which the unique hash will be generated |
| resultVarName | <code>string</code> | Variable in which the unique ID is stored |

**Example**  
```js
let [newid] = vars("newid")
idgen("doc:Person", ["John", "Smith"], newid)
```

### upper
#### WOQL.upper(inputVarName, resultVarName) ⇒ <code>WOQLQuery</code>
Changes a string to upper-case

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Upper case pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| inputVarName | <code>string</code> | string or variable representing the uncapitalized string |
| resultVarName | <code>string</code> | variable that stores the capitalized string output |

**Example**  
```js
upper("aBCe", "v:allcaps")
//upper contains "ABCE"
```

### lower
#### WOQL.lower(inputVarName, resultVarName) ⇒ <code>WOQLQuery</code>
Changes a string to lower-case

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Lower case pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| inputVarName | <code>string</code> | string or variable representing the non-lowercased string |
| resultVarName | <code>string</code> | variable that stores the lowercased string output |

**Example**  
```js
let [lower] = var("l")
lower("aBCe", lower)
//lower contains "abce"
```

### pad
#### WOQL.pad(inputVarName, pad, len, resultVarName) ⇒ <code>WOQLQuery</code>
Pads out the string input to be exactly len long by appending the pad character pad to form output

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Pad pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| inputVarName | <code>string</code> | The input string or variable in unpadded state |
| pad | <code>string</code> | The characters to use to pad the string or a variable representing them |
| len | <code>number</code> \| <code>string</code> | The variable or integer value representing the length of the output string |
| resultVarName | <code>string</code> | stores output |

**Example**  
```js
let [fixed] = vars("fixed length")
pad("joe", " ", 8, fixed)
//fixed contains "joe     "
```

### split
#### WOQL.split(inputVarName, separator, resultVarName) ⇒ <code>WOQLQuery</code>
Splits a string (Input) into a list strings (Output) by removing separator

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Split pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| inputVarName | <code>string</code> | A string or variable representing the unsplit string |
| separator | <code>string</code> | A string or variable containing a sequence of charatcters to use as a separator |
| resultVarName | <code>string</code> | variable that stores output list |

**Example**  
```js
split("joe has a hat", " ", "v:words")
```

### member
#### WOQL.member(element, list) ⇒ <code>WOQLQuery</code>
Matches if List includes Element

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the List inclusion pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| element | <code>string</code> \| <code>object</code> | Either a variable, IRI or any simple datatype |
| list | <code>string</code> | List ([string, literal] or string*) Either a variable representing a list or a list of variables or literals |

**Example**  
```js
let [name] = vars("name")
member("name", ["john", "joe", "frank"])
```

### concat
#### WOQL.concat(varList, resultVarName) ⇒ <code>WOQLQuery</code>
takes a variable number of string arguments and concatenates them into a single string

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Concatenation pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| varList | <code>array</code> \| <code>string</code> | a variable representing a list or a list of variables or strings - variables can be embedded in the string if they do not contain spaces |
| resultVarName | <code>string</code> | A variable or string containing the output string |

**Example**  
```js
concat(["v:first_name", " ", "v:last_name"], "v:full_name")
WOQL.concat(["first_name", " ", "last_name"], "full_name")
//both versions work
```

### join
#### WOQL.join(varList, glue, resultVarName) ⇒ <code>WOQLQuery</code>
Joins a list variable together (Input) into a string variable (Output) by glueing the strings together with Glue

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Join pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| varList | <code>string</code> \| <code>array</code> | a variable representing a list or a list of strings and / or variables |
| glue | <code>string</code> | A variable (v:glue) or (glue) string representing the characters to put in between the joined strings in input |
| resultVarName | <code>string</code> | A variable or string containing the output string |

**Example**  
```js
join(["joe", "has", "a", "hat", " ", "v:sentence")
```

### sum
#### WOQL.sum(subquery, total) ⇒ <code>WOQLQuery</code>
computes the sum of the List of values passed. In contrast to other arithmetic functions, sum self-evaluates - it does not have to be passed to evaluate()

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Sum expression  

| Param | Type | Description |
| --- | --- | --- |
| subquery | <code>WOQLQuery</code> | a subquery or ([string or numeric]) - a list variable, or a list of variables or numeric literals |
| total | <code>number</code> | the variable name with the sum result of the values in List |

**Example**  
```js
sum([2, 3, 4, 5], "v:total")
```

### start
#### WOQL.start(start, [subquery]) ⇒ <code>WOQLQuery</code>
Specifies an offset position in the results to start listing results from

**Returns**: <code>WOQLQuery</code> - A WOQLQuery whose results will be returned starting from the specified offset  

| Param | Type | Description |
| --- | --- | --- |
| start | <code>number</code> \| <code>string</code> | A variable that refers to an interger or an integer literal |
| [subquery] | <code>WOQLQuery</code> | WOQL Query object, you can pass a subquery as an argument or a chained query |

**Example**  
```js
let [a, b, c] = vars("a", "b", "c")
start(100).triple(a, b, c)
```

### limit
#### WOQL.limit(limit, [subquery]) ⇒ <code>WOQLQuery</code>
Specifies a maximum number of results that will be returned from the subquery

**Returns**: <code>WOQLQuery</code> - A WOQLQuery whose results will be returned starting from the specified offset  

| Param | Type | Description |
| --- | --- | --- |
| limit | <code>number</code> \| <code>string</code> | A variable that refers to an non-negative integer or a non-negative integer |
| [subquery] | <code>WOQLQuery</code> | A subquery whose results will be limited |

**Example**  
```js
let [a, b, c] = vars("a", "b", "c")
limit(100).triple(a, b, c)
//subquery is an argument or a chained query
limit(100,triple(a, b, c))
```

### re
#### WOQL.re(pattern, inputVarName, resultVarList) ⇒ <code>WOQLQuery</code>
Matches the regular expression defined in Patern against the Test string, to produce the matched patterns in Matches

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Regular Expression pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| pattern | <code>string</code> | string or variable using normal PCRE regular expression syntax with the exception that special characters have to be escaped twice (to enable transport in JSONLD) |
| inputVarName | <code>string</code> | string or variable containing the string to be tested for patterns with the regex |
| resultVarList | <code>string</code> \| <code>array</code> \| <code>object</code> | variable representing the list of matches or a list of strings or variables |

**Example**  
```js
WOQL.re("h(.).*", "hello", ["v:All", "v:Sub"])
//e contains 'e', llo contains 'llo'
//p is a regex pattern (.*) using normal regular expression syntax, the only unusual thing is that special characters have to be escaped twice, s is the string to be matched and m is a list of matches:
```

### length
#### WOQL.length(inputVarList, resultVarName) ⇒ <code>WOQLQuery</code>
Calculates the length of the list in va and stores it in vb

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Length pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| inputVarList | <code>string</code> \| <code>array</code> | Either a variable representing a list or a list of variables or literals |
| resultVarName | <code>string</code> | A variable in which the length of the list is stored or the length of the list as a non-negative integer |

**Example**  
```js
let [count] = vars("count")
length(["john", "joe", "frank"], count)
```

### not
#### WOQL.not([subquery]) ⇒ <code>WOQLQuery</code>
Logical negation of the contained subquery - if the subquery matches, the query will fail to match

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the negated sub Query  

| Param | Type | Description |
| --- | --- | --- |
| [subquery] | <code>string</code> \| <code>WOQLQuery</code> | A subquery which will be negated |

**Example**  
```js
let [subject, label] = vars("subject", "label")
not().triple(subject, 'label', label)
```

### once
#### WOQL.once([subquery]) ⇒ <code>WOQLQuery</code>
Results in one solution of the subqueries

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the once sub Query  

| Param | Type | Description |
| --- | --- | --- |
| [subquery] | <code>string</code> \| <code>WOQLQuery</code> | WOQL Query objects |


### immediately
#### WOQL.immediately([subquery]) ⇒ <code>WOQLQuery</code>
Runs the query without backtracking on side-effects

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the immediately sub Query  

| Param | Type | Description |
| --- | --- | --- |
| [subquery] | <code>string</code> \| <code>WOQLQuery</code> | WOQL Query objects |


### count
#### WOQL.count(countVarName, [subquery]) ⇒ <code>WOQLQuery</code>
Creates a count of the results of the query

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the count sub Query  

| Param | Type | Description |
| --- | --- | --- |
| countVarName | <code>string</code> \| <code>number</code> | variable or integer count |
| [subquery] | <code>WOQLQuery</code> |  |

**Example**  
```js
WOQL.count("v:count").triple("v:Person","type","scm:Person")
```

### typecast
#### WOQL.typecast(varName, varType, resultVarName) ⇒ <code>WOQLQuery</code>
Casts the value of Input to a new value of type Type and stores the result in CastVar

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the casting expression  

| Param | Type | Description |
| --- | --- | --- |
| varName | <code>string</code> \| <code>number</code> \| <code>object</code> | Either a single variable or a literal of any basic type |
| varType | <code>string</code> | Either a variable or a basic datatype (xsd / xdd) |
| resultVarName | <code>string</code> | save the return variable |

**Example**  
```js
cast("22/3/98", "xsd:dateTime", "v:time")
```

### order_by
#### WOQL.order\_by(...varNames) ⇒ <code>WOQLQuery</code>
Orders the results of the contained subquery by a precedence list of variables

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the ordering expression  

| Param | Type | Description |
| --- | --- | --- |
| ...varNames | <code>string</code> | A sequence of variables, by which to order the results, each optionally followed by either “asc” or “desc” to represent order as a list, by default it will sort the variable in ascending order |

**Example**  
```js
WOQL.order_by("v:A", ["v:B", "asc"], ["v:C", "desc"]).triple("v:A", "v:B", "v:C");
```

### group_by
#### WOQL.group\_by(varList, patternVars, resultVarName, [subquery]) ⇒ <code>WOQLQuery</code>
Groups the results of the contained subquery on the basis of identical values for Groupvars, extracts the patterns defined in PatternVars and stores the results in GroupedVar

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the grouping expression  

| Param | Type | Description |
| --- | --- | --- |
| varList | <code>array</code> \| <code>string</code> | Either a single variable or an array of variables |
| patternVars | <code>array</code> \| <code>string</code> | Either a single variable or an array of variables |
| resultVarName | <code>string</code> | output variable name |
| [subquery] | <code>WOQLQuery</code> | The query whose results will be grouped |

**Example**  
```js
//subquery is an argument or a chained query
let [age, last_name, first_name, age_group, person] = vars("age", "last name", "first name", "age group", "person")
group_by(age, [last_name, first_name], age_group)
  .triple(person, "first_name", first_name)
  .triple(person, "last_name", last_name)
  .triple(person, "age", age)
```

### true
#### WOQL.true() ⇒ <code>WOQLQuery</code>
A function that always matches, always returns true

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the true value that will match any pattern  
**Example**  
```js
when(true()).triple("a", "b", "c")
```

### path
#### WOQL.path(subject, pattern, object, [resultVarName]) ⇒ <code>WOQLQuery</code>
Performs a path regular expression match on the graph

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the path regular expression matching expression  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | An IRI or variable that refers to an IRI representing the subject, i.e. the starting point of the path |
| pattern | <code>string</code> | (string) - A path regular expression describing a pattern through multiple edges of the graph Path regular expressions consist of a sequence of predicates and / or a set of alternatives, with quantification operators The characters that are interpreted specially are the following: | representing alternative choices , - representing a sequence of predcitates + - Representing a quantification of 1 or more of the preceding pattern in a sequence {min, max} - Representing at least min examples and at most max examples of the preceding pattern - Representing any predicate () - Parentheses, interpreted in the normal way to group clauses |
| object | <code>string</code> | An IRI or variable that refers to an IRI representing the object, i.e. ending point of the path |
| [resultVarName] | <code>string</code> | A variable in which the actual paths traversed will be stored |

**Example**  
```js
let [person, grand_uncle, lineage] = vars("person", "grand uncle", "lineage")
path(person, ((father|mother) {2,2}), brother), grand_uncle, lineage)
```

### size
#### WOQL.size(resourceId, resultVarName)
Calculates the size in bytes of the contents of the resource identified in ResourceID


| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | A valid resource identifier string (can refer to any graph / branch / commit / db) |
| resultVarName | <code>string</code> | The variable name |

**Example**  
```js
size("admin/minecraft/local/branch/main/instance/main", "v:varSize")
//returns the number of bytes in the main instance graph on the main branch
```

### triple_count
#### WOQL.triple\_count(resourceId, tripleCount) ⇒ <code>WOQLQuery</code>
Calculates the number of triples of the contents of the resource identified in ResourceID

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the size expression  

| Param | Type | Description |
| --- | --- | --- |
| resourceId | <code>string</code> | A valid resource identifier string (can refer to any graph / branch / commit / db) |
| tripleCount | <code>string</code> \| <code>number</code> | An integer literal with the size in bytes or a variable containing that integer |

**Example**  
```js
triple_count("admin/minecraft/local/_commits", "v:count")
//returns the number of bytes in the local commit graph
```

### type_of
#### WOQL.type\_of(elementId, elementType) ⇒ <code>WOQLQuery</code>
Returns true if 'elementId' is of type 'elementType', according to the current DB schema

**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the type_of pattern matching rule  

| Param | Type | Description |
| --- | --- | --- |
| elementId | <code>string</code> | the id of a schema graph element |
| elementType | <code>string</code> | the element type |


### star
#### WOQL.star([graph], [subject], [predicate], [object]) ⇒ <code>WOQLQuery</code>
Generates a query that by default matches all triples in a graph identified by "graph" or in all the current terminusDB's graph

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| [graph] | <code>string</code> \| <code>boolean</code> | false or the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |
| [subject] | <code>string</code> | The IRI of a triple’s subject or a variable,  default value "v:Subject" |
| [predicate] | <code>string</code> | The IRI of a property or a variable, default value "v:Predicate" |
| [object] | <code>string</code> | The IRI of a node or a variable, or a literal,  default value "v:Object" |

**Example**  
```js
star("schema/main")
//will return every triple in schema/main graph
```

### all
#### WOQL.all([subject], [predicate], [object], [graphRef]) ⇒ <code>WOQLQuery</code>
Generates a query that by default matches all triples in a graph - identical to star() except for order of arguments

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the pattern matching expression
all("mydoc")
//will return every triple in the instance/main graph that has "doc:mydoc" as its subject  

| Param | Type | Description |
| --- | --- | --- |
| [subject] | <code>string</code> | The IRI of a triple’s subject or a variable |
| [predicate] | <code>string</code> | The IRI of a property or a variable |
| [object] | <code>string</code> | The IRI of a node or a variable, or a literal |
| [graphRef] | <code>typedef.GraphRef</code> | the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |


### node
#### WOQL.node(nodeid, [chainType]) ⇒ <code>WOQLQuery</code>
Specifies the identity of a node that can then be used in subsequent builder functions. Note that node() requires subsequent chained functions to complete the triples / quads that it produces - by itself it only generates the subject.

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the partial Node pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| nodeid | <code>string</code> | The IRI of a node or a variable containing an IRI which will be the subject of the builder functions |
| [chainType] | <code>typedef.FuntionType</code> | Optional type of builder function to build  (default is triple) |

**Example**  
```js
node("mydoc").label("my label")
//equivalent to triple("mydoc", "label", "my label")
```

### insert
#### WOQL.insert(classId, classType, [graphRef]) ⇒ <code>WOQLQuery</code>
Inserts a single triple into the database declaring the Node to have type Type, optionally into the specified graph

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the insert expression  

| Param | Type | Description |
| --- | --- | --- |
| classId | <code>string</code> | IRI string or variable containing the IRI of the node to be inserted |
| classType | <code>string</code> | IRI string or variable containing the IRI of the type of the node (class/document name) |
| [graphRef] | <code>typedef.GraphRef</code> | Optional Graph resource identifier |

**Example**  
```js
insert("mydoc", "MyType")
//equivalent to add_triple("mydoc", "type", "MyType")
```

### graph
#### WOQL.graph([graphRef]) ⇒ <code>WOQLQuery</code>
Sets the graph resource ID that will be used for subsequent chained function calls

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the partial Graph pattern matching expression  

| Param | Type | Description |
| --- | --- | --- |
| [graphRef] | <code>typedef.GraphRef</code> | Resource String identifying the graph which will be used for subsequent chained schema calls |

**Example**  
```js
WOQL.graph("schema")
//equivalent to add_quad("MyClass", "label", "My Class Label", "schema/main")
```

### nuke
#### WOQL.nuke([graphRef]) ⇒ <code>WOQLQuery</code>
Deletes all triples in the passed graph (defaults to instance/main)

**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the deletion expression  

| Param | Type | Description |
| --- | --- | --- |
| [graphRef] | <code>typedef.GraphRef</code> | Resource String identifying the graph from which all triples will be removed |

**Example**  
```js
nuke("schema/main")
//will delete everything from the schema/main graph
```

### query
#### WOQL.query() ⇒ <code>WOQLQuery</code>
Generates an empty WOQLQuery object

**Example**  
```js
let q = query()
//then q.triple(1, 1) ...
```

### json
#### WOQL.json([JSON_LD]) ⇒ <code>WOQLQuery</code> \| <code>object</code>
Generates a WOQLQuery object from the passed WOQL JSON - if an argument is passed, the query object is created from it, if none is passed, the current state is returned as a JSON-LD

**Returns**: <code>WOQLQuery</code> \| <code>object</code> - either a JSON-LD or a WOQLQuery object

json version of query for passing to api  

| Param | Type | Description |
| --- | --- | --- |
| [JSON_LD] | <code>object</code> | JSON-LD woql document encoding a query |


### lib
#### WOQL.lib() ⇒ <code>WOQLQuery</code>
get the predefined library query [WOQLLibrary](/api/woqlLibrary.js?id=WOQLLibrary)

**Returns**: <code>WOQLQuery</code> - WOQLQuery object  
**Example**  
```js
//get commits older than the specified commit id
const query = WOQL.lib().previousCommits('m8vpxewh2aovfauebfkbzwmj4qwr5lb')

//return the commits of a specific branch starting from the head
//you can add the limit (how many results to return.) and the start point
//if a timestamp is given, gets the commits before the specified timestamp
//WOQL.lib().commits(branch='main',limit=0,start=0,timestamp=0)

const query = WOQL.lib().commits('main',10,2,1630683082.9278786)

//return the branches list with the timestamp and commits id
const query = WOQL.lib().branches()
```

### string
#### WOQL.string(val) ⇒ <code>object</code>
Generates explicitly a JSON-LD string literal from the input

**Returns**: <code>object</code> - - A JSON-LD string literal  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>string</code> \| <code>boolean</code> \| <code>number</code> | any primitive literal type |

**Example**  
```js
string(1)
//returns { "@type": "xsd:string", "@value": "1" }
```

### literal
#### WOQL.literal(val, type) ⇒ <code>object</code>
Generates explicitly a JSON-LD string literal from the input

**Returns**: <code>object</code> - - A JSON-LD literal  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>string</code> | any literal type |
| type | <code>string</code> | an xsd or xdd type |

**Example**  
```js
literal(1, "nonNegativeInteger")
//returns { "@type": "xsd:nonNegativeInteger", "@value": 1 }
```

### iri
#### WOQL.iri(val) ⇒ <code>object</code>
Explicitly sets a value to be an IRI - avoiding automatic type marshalling

**Returns**: <code>object</code> - - A JSON-LD IRI value  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>string</code> | string which will be treated as an IRI |


### vars
#### WOQL.vars(...varNames) ⇒ <code>array</code>
Generates javascript variables for use as WOQL variables within a query

**Returns**: <code>array</code> - an array of javascript variables which can be dereferenced using the array destructuring operation  

| Param | Type |
| --- | --- |
| ...varNames | <code>string</code> | 

**Example**  
```js
const [a, b, c] = WOQL.vars("a", "b", "c")
//a, b, c are javascript variables which can be used as WOQL variables in subsequent queries
```

### client
#### WOQL.client(client) ⇒ <code>WOQLClient</code>
Gets/Sets woqlClient


| Param | Type |
| --- | --- |
| client | <code>WOQLClient</code> | 


### emerge
#### WOQL.emerge(auto_eval)
query module
allow you to use WOQL words as top level functions


| Param | Type |
| --- | --- |
| auto_eval | <code>\*</code> | 


### update_triple
#### WOQL.update\_triple(subject, predicate, newObjValue, oldObjValue) ⇒ <code>WOQLQuery</code>
Update a pattern matching rule for the triple (Subject, Predicate, oldObjValue) with the new one (Subject, Predicate, newObjValue)

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a Update Triple Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| newObjValue | <code>string</code> | The value to update or a literal |
| oldObjValue | <code>string</code> | The old value of the object |


### update_quad
#### WOQL.update\_quad(subject, predicate, newObject, graphRef) ⇒ <code>WOQLQuery</code>
Update a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a Update Quad Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| newObject | <code>string</code> | The value to update or a literal |
| graphRef | <code>typedef.GraphRef</code> | A valid graph resource identifier string |


### value
#### WOQL.value(subject, predicate, objValue, [graphRef]) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for a quad [Subject, Predicate, Object, Graph] or for a triple [Subject, Predicate, Object]
add extra information about the type of the value object

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a quad or a triple Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| objValue | <code>string</code> \| <code>number</code> \| <code>boolean</code> | an specific value |
| [graphRef] | <code>typedef.GraphRef</code> | specify a graph type, default is instance schema|instance |


### link
#### WOQL.link(subject, predicate, object, [graphRef]) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for a quad [Subject, Predicate, Object, Graph] or for a triple [Subject, Predicate, Object]

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a quad or a triple Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| [graphRef] | <code>typedef.GraphRef</code> | specify a graph type, default is instance schema|instance |


### dot
#### WOQL.dot(document, field, value) ⇒ <code>WOQLQuery</code>
Extract the value of a key in a bound document.

**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a dot Statement  

| Param | Type | Description |
| --- | --- | --- |
| document | <code>string</code> | Document which is being accessed. |
| field | <code>string</code> | The field from which the document which is being accessed. |
| value | <code>string</code> | The value for the document and field. |

