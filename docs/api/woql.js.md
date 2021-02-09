
## WOQL

#### WOQL
<?js
    var data = obj;
?>**License**: Apache Version 2  


#### new WOQL()
The WOQL object is a wrapper around the WOQLQuery object
Syntactic sugar to allow writing WOQL.triple()... instead of new WOQLQuery().triple()
Every function matches one of the public api functions of the woql query object

<?js
    var data = obj;
?>
### eval

#### WOQL.eval ⇒ <code>WOQLQuery</code>
Evaluates the passed arithmetic expression and generates or matches the result value

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| arithExp | <code>object</code> \| <code>WOQLQuery</code> \| <code>string</code> | query or JSON-LD representing the query |
| resultVarName | <code>string</code> | output variable |


### using

#### WOQL.using(refPath, subquery) ⇒ <code>WOQLQuery</code>
Query running against any specific commit Id

<?js
    var data = obj;
?>
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

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| comment | <code>string</code> | text comment |
| subquery | <code>WOQLQuery</code> | query that is "commented out" |


### select

#### WOQL.select(...varNames) ⇒ <code>WOQLQuery</code>
Filters the query so that only the variables included in [V1...Vn] are returned in the bindings

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| ...varNames | <code>string</code> | only these variables are returned |

**Example**  
```js
WOQL.select("v:a",triple("v:a","v:b","v:c"))
```

### distinct

#### WOQL.distinct(...varNames) ⇒ <code>WOQLQuery</code>
Filter the query to return only results that are distinct in the given variables

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| ...varNames | <code>string</code> | these variables are guaranteed to be unique as a tuple |


### and

#### WOQL.and(...subqueries) ⇒ <code>WOQLQuery</code>
Logical conjunction of the contained queries - all queries must match or the entire clause fails

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery object containing the conjunction of queries  

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

### or

#### WOQL.or(...subqueries) ⇒ <code>WOQLQuery</code>
Creates a logical OR of the arguments

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery object containing the logical Or of the subqueries  

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

#### WOQL.from(graph, [query]) ⇒ <code>WOQLQuery</code>
Specifies the database URL that will be the default database for the enclosed query

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| graph | <code>string</code> | The resource identifier of a graph (e.g. schema/*) |
| [query] | <code>WOQLQuery</code> | WOQL Query object |


### into

#### WOQL.into(graph, query) ⇒ <code>WOQLQuery</code>
Sets the current output graph for writing output to.

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| graph | <code>string</code> | The resource identifier of a graph (e.g. instance/main) that will be written to |
| query | <code>WOQLQuery</code> | WOQL Query object |


### triple

#### WOQL.triple(subject, predicate, object) ⇒ <code>WOQLQuery</code>
Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object)

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### added_triple

#### WOQL.added\_triple(subject, predicate, object) ⇒ <code>WOQLQuery</code>
Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object) added in the current layer

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### removed_triple

#### WOQL.removed\_triple(subject, predicate, object) ⇒ <code>WOQLQuery</code>
Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object) added in the current commit

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### quad

#### WOQL.quad(subject, predicate, object, graph) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graph | <code>string</code> | the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |


### added_quad

#### WOQL.added\_quad(subject, predicate, object, graph) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph) removed from the current commit

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graph | <code>string</code> | the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |


### removed_quad

#### WOQL.removed\_quad(subject, predicate, object, graph) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph) removed from the current commit

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graph | <code>string</code> | the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |


### sub

#### WOQL.sub(classA, classB) ⇒ <code>boolean</code>
Returns true if ClassA subsumes ClassB, according to the current DB schema

<?js
    var data = obj;
?>**Returns**: <code>boolean</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| classA | <code>string</code> | ClassA |
| classB | <code>string</code> | ClassB |


### eq

#### WOQL.eq(varName, varValue) ⇒ <code>WOQLQuery</code>
Matches if a is equal to b

<?js
    var data = obj;
?>**See**: WOQLQuery().woql_or for WOQL.py version of the same function  

| Param | Type | Description |
| --- | --- | --- |
| varName | <code>string</code> | literal, variable or id |
| varValue | <code>string</code> | literal, variable or id |

**Example**  
```js
find triples that are of type scm:Journey, and have
a start_station v:Start, and that start_station is labeled
v:Start_Label

WOQL.and(
     WOQL.triple("v:Journey", "type", "scm:Journey"),
     WOQL.or(
         WOQL.triple("v:Journey", "scm:start_station", "doc:Station31007"),
         WOQL.triple("v:Journey", "scm:start_station", "doc:Station31114")),
     WOQL.triple("v:Journey", "scm:start_station", "v:Start"),
     WOQL.triple("v:Start", "label", "v:Start_Label"))
```

### substr

#### WOQL.substr(string, before, [length], [after], [substring]) ⇒ <code>WOQLQuery</code>
Substring

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| string | <code>string</code> | String or variable |
| before | <code>string</code> | integer or variable (characters from start to begin) |
| [length] | <code>string</code> | integer or variable (length of substring) |
| [after] | <code>string</code> | integer or variable (number of characters after substring) |
| [substring] | <code>string</code> | String or variable |


### update_object

#### WOQL.update\_object(JSON) ⇒ <code>WOQLQuery</code>
Updates a document (or any object) in the db with the passed copy

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| JSON | <code>string</code> | JSON-LD document |


### delete_object

#### WOQL.delete\_object(JSON_or_IRI) ⇒ <code>WOQLQuery</code>
Deletes a node identified by an IRI or a JSON-LD document

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| JSON_or_IRI | <code>string</code> \| <code>object</code> | IRI or a JSON-LD document |


### read_object

#### WOQL.read\_object(IRI, output, format) ⇒ <code>WOQLQuery</code>
Deletes a node identified by an IRI or a JSON-LD document

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| IRI | <code>string</code> | the url that identifies the document |
| output | <code>string</code> | - |
| format | <code>string</code> | the export format |


### get

#### WOQL.get(asvars, queryResource) ⇒ <code>WOQLQuery</code>
Imports the Target Resource to the variables defined in vars

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| asvars | <code>object</code> | An AS query (or json representation) |
| queryResource | <code>WOQLQuery</code> | description of where the resource is to be got from (WOQL.file, WOQL.remote, WOQL.post) |


### put

#### WOQL.put(varsToExp, query, fileResource) ⇒ <code>WOQLQuery</code>
<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - WOQLQuery  
**Put**: Exports the Target Resource to the file, with the variables defined in WOQL.as()  

| Param | Type | Description |
| --- | --- | --- |
| varsToExp | <code>WOQLQuery</code> | An AS query (or json representation) |
| query | <code>WOQLQuery</code> | The query which will be executed to produce the results |
| fileResource | <code>string</code> | an file resource local to the server |

**Example**  
```js
let [s, p, o] = vars("Subject", "Predicate", "Object")
WOQL.put(WOQL.as("s", s).as("p", p).as("o", o), WOQL.all())
.file("/app/local_files/dump.csv")
```

### as

#### WOQL.as(source, target, [type]) ⇒ <code>WOQLQuery</code>
Imports the value identified by Source to a Target variable

<?js
    var data = obj;
?>
| Param | Type | Description |
| --- | --- | --- |
| source | <code>string</code> \| <code>number</code> | Source |
| target | <code>string</code> | Target |
| [type] | <code>string</code> | type to cast value to string|number etc... |

**Example**  
```js
WOQL.as("first var", "v:First_Var", "string").as("second var", "v:Second_Var")
 WOQL.as(["first var", "v:First_Var", "string"], ["second var", "v:Second_Var"])
```

### remote

#### WOQL.remote(url, [opts]) ⇒ <code>WOQLQuery</code>
Identifies a remote resource by URL and specifies the format of the resource through the options

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL at which the remote resource can be accessed |
| [opts] | <code>typedef.resourceType</code> | The format of the resource data {} |

**Example**  
```js
WOQL.remote("http://seshatdatabank.info/wp-content/uploads/2020/01/Iron-Updated.csv")
```

### file

#### WOQL.file(url, opts) ⇒ <code>object</code>
Provides details of a file source in a JSON format that includes a URL property

<?js
    var data = obj;
?>**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>object</code> | file data source in a JSON format |
| opts | <code>object</code> | imput options, optional |


### post

#### WOQL.post(url, opts) ⇒ <code>WOQLQuery</code>
Provides details of a file source in a JSON format that includes a URL property

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - -  

| Param | Type | Description |
| --- | --- | --- |
| url | <code>object</code> | file data source in a JSON format |
| opts | <code>object</code> | imput options, optional |


### delete_triple

#### WOQL.delete\_triple(subject, predicate, object) ⇒ <code>WOQLQuery</code>
Deletes a single triple from the default graph of the database

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Triple Deletion statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### delete_quad

#### WOQL.delete\_quad(subject, predicate, object, graph) ⇒ <code>WOQLQuery</code>
Deletes any quads that match the rule [Subject, Predicate, Object, Graph]

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Delete Quad Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graph | <code>string</code> | the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |

**Example**  
```js
remove the class Person from the schema/main graph
WOQL.delete_quad("Person", "type", "owl:Class", "schema/main")
```

### add_triple

#### WOQL.add\_triple(subject, predicate, object) ⇒ <code>object</code>
Adds triples according to the the pattern [subject,predicate,object]

<?js
    var data = obj;
?>**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |


### add_quad

#### WOQL.add\_quad(subject, predicate, object, graph) ⇒ <code>object</code>
Adds quads according to the pattern [S,P,O,G]

<?js
    var data = obj;
?>**Returns**: <code>object</code> - WOQLQuery  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| graph | <code>string</code> | the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |


### when

#### WOQL.when(subquery, [updateQuery]) ⇒ <code>WOQLQuery</code>
When the subquery is met, the update query is executed

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - -  A WOQLQuery which contains the when expression  

| Param | Type | Description |
| --- | --- | --- |
| subquery | <code>WOQLQuery</code> \| <code>string</code> | the condition query |
| [updateQuery] | <code>WOQLQuery</code> |  |

**Example**  
```js
when(true()).triple("a", "b", "c")
```

### trim

#### WOQL.trim(inputStr, resultVarName) ⇒ <code>WOQLQuery</code>
Remove whitespace from both sides of a string:

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Trim pattern matching expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Arithmetic function  

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
Adds """two""" numbers together

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the addition expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the subtraction expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the multiplication expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the division expression
evaluate(divide(times(10, minus(2.1, plus(0.2, 1))), 10), "v:result")
 //result contains 0.9000000000000001  

| Param | Type | Description |
| --- | --- | --- |
| ...args | <code>string</code> \| <code>number</code> | numbers to tbe divided |


### div

#### WOQL.div(...args) ⇒ <code>WOQLQuery</code>
Division - integer division - args are divided left to right

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the division expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the exponent expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the floor expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery object containing the type test  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the Like pattern matching expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the comparison expression  

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

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the comparison expression  

| Param | Type | Description |
| --- | --- | --- |
| varNum01 | <code>string</code> \| <code>number</code> | a variable or numeric containing the number to be compared |
| varNum02 | <code>string</code> \| <code>number</code> | a variable or numeric containing the second comporator |

**Example**  
```js
greater(1.2, 1.1).eq("v:result", literal(true, "boolean"))
//result contains true
```

### sum

#### WOQL.sum(subquery, total) ⇒ <code>WOQLQuery</code>
computes the sum of the List of values passed. In contrast to other arithmetic functions, sum self-evaluates - it does not have to be passed to evaluate()

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Sum expression  

| Param | Type | Description |
| --- | --- | --- |
| subquery | <code>WOQLQuery</code> \| <code>array</code> | a subquery or ([string or numeric]) - a list variable, or a list of variables or numeric literals |
| total | <code>number</code> | the variable name with the sum result of the values in List |

**Example**  
```js
sum([2, 3, 4, 5], "v:total")
```

### insert_doctype_data

#### WOQL.insert\_doctype\_data(classObj, [schemaGraph]) ⇒ <code>WOQLQuery</code>
Inserts data about a class as a json object - enabling a class and all its properties to be specified in a single function

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the insertion expression  

| Param | Type | Description |
| --- | --- | --- |
| classObj | <code>typedef.ClassObj</code> | with id, label, description, parent and properties |
| [schemaGraph] | <code>string</code> | the resource identifier of a schema graph. The Default value is schema/main |

**Example**  
```js
let data = {
  id: "Person",
  label: "Person",
  age: {
      label: "Age",
      range: "xsd:integer",
      max: 1
   }
}
insert_doctype_data(data)
```

### insert_property_data

#### WOQL.insert\_property\_data(propObj, [schemaGraph]) ⇒ <code>WOQLQuery</code>
Inserts data about a document class as a json object - enabling a document class and all its properties to be specified in a single function

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the insertion expression  

| Param | Type | Description |
| --- | --- | --- |
| propObj | <code>typedef.PropertyObj</code> | json object which contains fields: |
| [schemaGraph] | <code>string</code> | the resource identifier of a schema graph. The Default value id schema/main |

**Example**  
```js
let data = {
  id: "prop",
  label: "Property",
  description: "prop desc",
  range: "X",
  domain: "X",
  max: 2,
  min: 1}
  insert_property_data(data)
```

### nuke

#### WOQL.nuke([graph]) ⇒ <code>WOQLQuery</code>
Deletes all triples in the passed graph (defaults to instance/main)

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the deletion expression  

| Param | Type | Description |
| --- | --- | --- |
| [graph] | <code>string</code> | Resource String identifying the graph from which all triples will be removed |

**Example**  
```js
nuke("schema/main")
//will delete everything from the schema/main graph
```

### query

#### WOQL.query() ⇒ <code>WOQLQuery</code>
Generates an empty WOQLQuery object

<?js
    var data = obj;
?>**Example**  
```js
let q = query()
//then q.triple(1, 1) ...
```

### json

#### WOQL.json([JSON_LD]) ⇒ <code>WOQLQuery</code> \| <code>object</code>
Generates a WOQLQuery object from the passed WOQL JSON - if an argument is passed, the query object is created from it, if none is passed, the current state is returned as a JSON-LD

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> \| <code>object</code> - either a JSON-LD or a WOQLQuery object

json version of query for passing to api  

| Param | Type | Description |
| --- | --- | --- |
| [JSON_LD] | <code>object</code> | JSON-LD woql document encoding a query |


### string

#### WOQL.string(val) ⇒ <code>object</code>
Generates explicitly a JSON-LD string literal from the input

<?js
    var data = obj;
?>**Returns**: <code>object</code> - - A JSON-LD string literal  

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

<?js
    var data = obj;
?>**Returns**: <code>object</code> - - A JSON-LD literal  

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

<?js
    var data = obj;
?>**Returns**: <code>object</code> - - A JSON-LD IRI value  

| Param | Type | Description |
| --- | --- | --- |
| val | <code>string</code> | string which will be treated as an IRI |


### vars

#### WOQL.vars(...varNames) ⇒ <code>array</code>
Generates javascript variables for use as WOQL variables within a query

<?js
    var data = obj;
?>**Returns**: <code>array</code> - an array of javascript variables which can be dereferenced using the array destructuring operation  

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

<?js
    var data = obj;
?>
| Param | Type |
| --- | --- |
| client | <code>WOQLClient</code> | 


### update_triple

#### WOQL.update\_triple(subject, predicate, newObjValue, oldObjValue) ⇒ <code>WOQLQuery</code>
Update a pattern matching rule for the triple (Subject, Predicate, oldObjValue) with the new one (Subject, Predicate, newObjValue)

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a Update Triple Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| newObjValue | <code>string</code> | The value to update or a literal |
| oldObjValue | <code>string</code> | The old value of the object |


### update_quad

#### WOQL.update\_quad(subject, predicate, newObject, graph) ⇒ <code>WOQLQuery</code>
Update a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a Update Quad Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| newObject | <code>string</code> | The value to update or a literal |
| graph | <code>string</code> | The resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |


### value

#### WOQL.value(subject, predicate, objValue, [graph]) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for a quad [Subject, Predicate, Object, Graph] or for a triple [Subject, Predicate, Object]
add extra information about the type of the value object

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a quad or a triple Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| objValue | <code>string</code> \| <code>number</code> \| <code>boolean</code> | an specific value |
| [graph] | <code>string</code> | the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |


### link

#### WOQL.link(subject, predicate, object, [graph]) ⇒ <code>WOQLQuery</code>
Creates a pattern matching rule for a quad [Subject, Predicate, Object, Graph] or for a triple [Subject, Predicate, Object]

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - A WOQLQuery which contains the a quad or a triple Statement  

| Param | Type | Description |
| --- | --- | --- |
| subject | <code>string</code> | The IRI of a triple’s subject or a variable |
| predicate | <code>string</code> | The IRI of a property or a variable |
| object | <code>string</code> | The IRI of a node or a variable, or a literal |
| [graph] | <code>string</code> | the resource identifier of a graph possible value are schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *} |


### makeEnum

#### WOQL.makeEnum(woqlClient, prop, classId, classLabel, [classDesc], [schemaGraph]) ⇒ <code>WOQLQuery</code>
<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Create Enum Class Statement  

| Param | Type | Description |
| --- | --- | --- |
| woqlClient | <code>WOQLClient</code> | an WoqlClient instance |
| prop | <code>\*</code> | ?? |
| classId | <code>string</code> | the enum class id |
| classLabel | <code>string</code> | the enum class label |
| [classDesc] | <code>string</code> | the enum class description |
| [schemaGraph] | <code>string</code> | the resource identifier of a schema graph. The Default value id schema/main |


### generateChoiceList

#### WOQL.generateChoiceList(classId, classLabel, classDesc, choices, [schemaGraph], [parent]) ⇒ <code>WOQLQuery</code>
Generates a class representing a choice list - an enumerated list of specific options

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Generate Enum/Choice Class Statement  

| Param | Type | Description |
| --- | --- | --- |
| classId | <code>string</code> | the enum class id |
| classLabel | <code>string</code> | the enum class label |
| classDesc | <code>string</code> | the enum class description |
| choices | <code>array</code> | an list of permitted values [[id,label,comment],[id,label,comment]] |
| [schemaGraph] | <code>string</code> | the resource identifier of a schema graph. The Default value id schema/main |
| [parent] | <code>string</code> | the id of a class that this class inherits from (e.g. scm:Enumerated) |


### updateChoiceList

#### WOQL.updateChoiceList(classId, classLabel, classDesc, choices, [schemaGraph]) ⇒ <code>WOQLQuery</code>
update or create an enumeration class. You have to add at least one permitted values in the list

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Update Enum/Choice Class Statement  

| Param | Type | Description |
| --- | --- | --- |
| classId | <code>string</code> | the enum class id |
| classLabel | <code>string</code> | the enum class label |
| classDesc | <code>string</code> | the enum class description |
| choices | <code>array</code> | an list of permitted values [[id,label,comment],[id,label,comment]] |
| [schemaGraph] | <code>string</code> | the resource identifier of a schema graph. The Default value id schema/main |


### deleteChoiceList

#### WOQL.deleteChoiceList(classId, [schemaGraph]) ⇒ <code>WOQLQuery</code>
delete the enum list for a specific enumeration class, but not the class

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Delete Choice List Statement  

| Param | Type | Description |
| --- | --- | --- |
| classId | <code>string</code> | the enum class name |
| [schemaGraph] | <code>string</code> | the resource identifier of a schema graph. The Default value id schema/main |


### libs

#### WOQL.libs(libs, parent, graph, prefix)
Called to load Terminus Predefined libraries:

<?js
    var data = obj;
?>
| Param | Type |
| --- | --- |
| libs | <code>\*</code> | 
| parent | <code>\*</code> | 
| graph | <code>\*</code> | 
| prefix | <code>\*</code> | 


### boxClasses

#### WOQL.boxClasses(prefix, classes, except, [schemaGraph]) ⇒ <code>WOQLQuery</code>
creating a structure ScopedMyClass -> myClass -> MyClass

<?js
    var data = obj;
?>**Returns**: <code>WOQLQuery</code> - - A WOQLQuery which contains the Box Classes Creating Statement  

| Param | Type | Description |
| --- | --- | --- |
| prefix | <code>string</code> | the url prefix that will be used for the boxed types (default scm:) |
| classes | <code>array</code> | the classes to box - these classes and all their subclasses will have special boxed classes created around them |
| except | <code>array</code> | the exceptions - these classes and their subclasses will not be boxed, even if they are included in the above array |
| [schemaGraph] | <code>string</code> | the resource identifier of a schema graph. The Default value id schema/main |

