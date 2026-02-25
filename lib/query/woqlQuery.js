/* eslint-disable class-methods-use-this */
/* eslint-disable no-redeclare */
/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-param-reassign */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable prefer-destructuring */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */

/// /@ts-check
// WOQLQuery
/**
 * defines the internal functions of the woql query object - the
 * language API is defined in WOQLQuery
 * @module WOQLQuery
 * @constructor
 * @param {object} [query] json-ld query for initialisation
 * @returns {WOQLQuery}
 */

const WOQLCore = require('./woqlCore');
const {
  Var, Vars, Doc, VarsUnique,
} = require('./woqlDoc');
// eslint-disable-next-line no-unused-vars
const typedef = require('../typedef');

// I HAVE TO REVIEW THE Inheritance and the prototype chain
class WOQLQuery extends WOQLCore {
  /**
   * defines the internal functions of the woql query object - the
   * language API is defined in WOQLQuery
   * @module WOQLQuery
   * @constructor
   * @param {object} [query] json-ld query for initialisation
   * @returns {WOQLQuery}
   */

  /**
 * Update a pattern matching rule for the triple (Subject, Predicate, oldObjValue) with the
 * new one (Subject, Predicate, newObjValue)
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} newObjValue - The value to update or a literal
 * @param {string|Var} oldObjValue - The old value of the object
 * @returns {WOQLQuery} A WOQLQuery which contains the a Update Triple Statement
 */
  update_triple(subject, predicate, newObjValue, oldObjValue) { return this; }

  /**
 * Generates a query that by default matches all triples in a graph identified by "graph"
 * or in all the current terminusDB's graph
 * @param {string | boolean} [graph] - false or the resource identifier of a graph possible
 * value are schema/{main - myschema - *} | instance/{main - myschema - *}  |
 * inference/{main - myschema - *}
 * @param {string|Var} [subject] - The IRI of a triple’s subject or a variable,
 * default value "v:Subject"
 * @param {string|Var} [predicate] - The IRI of a property or a variable,
 *  default value "v:Predicate"
 * @param {string|Var} [object] - The IRI of a node or a variable, or a literal,
 * default value "v:Object"
 * @returns {WOQLQuery} A WOQLQuery which contains the pattern matching expression
 */
  star(graph, subject, predicate, object) { return this; }

  /**
  * Update a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)
  * @param {string|Var} subject - The IRI of a triple’s subject or a variable
  * @param {string|Var} predicate - The IRI of a property or a variable
  * @param {string|Var} newObject - The value to update or a literal
  * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
  * @returns {WOQLQuery} A WOQLQuery which contains the a Update Quad Statement
  */
  update_quad(subject, predicate, newObject, graphRef) { return this; }

  /**
   * @param {string|Var} id - IRI string or variable containing
   * @param {string|Var} type  -  IRI string or variable containing the IRI of the
   * @param {typedef.GraphRef} [refGraph] - Optional Graph resource identifier
   * @returns {WOQLQuery} A WOQLQuery which contains the insert expression
   */
  insert(id, type, refGraph) { return this; }

  /**
  * Sets the graph resource ID that will be used for subsequent chained function calls
  * @param {typedef.GraphRef} [graphRef] Resource String identifying the graph which will
  * be used for subsequent chained schema calls
  * @returns {WOQLQuery} A WOQLQuery which contains the partial Graph pattern matching expression
  */
  graph(graphRef) { return this; }

  /**
   * Specifies the identity of a node that can then be used in subsequent builder functions.
   * Note that node() requires subsequent chained functions to complete the triples / quads
   * that it produces - by itself it only generates the subject.
   * @param {string|Var} nodeid -  The IRI of a node or a variable containing an IRI which will
   * be the subject of the builder functions
   * @param {typedef.FuntionType} [chainType] - Optional type of builder function to build
   * (default is triple)
   * @returns {WOQLQuery} - A WOQLQuery which contains the partial Node pattern matching expression
   */
  node(nodeid, chainType) { return this; }

  /**
   * Deletes all triples in the passed graph (defaults to instance/main)
   * @param {typedef.GraphRef} [graphRef] - Resource String identifying the graph from
   * which all triples will be removed
   * @returns {WOQLQuery} - A WOQLQuery which contains the deletion expression
   * @example
   * nuke("schema/main")
   * //will delete everything from the schema/main graph
   */
  nuke(graphRef) { return this; }

  /**
   * @param {string|Var} [Subj] - The IRI of a triple’s subject or a variable
   * @param {string|Var} [Pred] - The IRI of a property or a variable
   * @param {string|Var} [Obj] - The IRI of a node or a variable, or a literal
   * @param {typedef.GraphRef} [Graph] - the resource identifier of a graph possible
   * @returns {WOQLQuery} - A WOQLQuery which contains the pattern matching expression
   */
  all(Subj, Pred, Obj, Graph) { return this; }

  /**
   * @param {boolean} tf
   * @returns {object}
   */
  boolean(tf) { return {}; }

  /**
   * @param {string} s
   * @returns {object}
   */
  string(s) { return {}; }

  /**
 * @param {any} s
 * @param {string} t
 * @returns {object}

 */
  literal(s, t) { return {}; }

  /**
   * @param {string} s
   * @returns {object}
   */
  iri(s) { return {}; }

  // eslint-disable-next-line no-underscore-dangle
  _set_context(ctxt) { return this; }

  /**
   * @param {WOQLQuery} Subq
   * @returns {WOQLQuery}
   */
  addSubQuery(Subq) {
    super.addSubQuery(Subq);
    return this;
  }

  /**
   * @param {string} msg
   * @returns {WOQLQuery}
   */
  parameterError(msg) {
    super.parameterError(msg);
    return this;
  }

  /**
   * @returns {WOQLQuery}
   */
  updated() {
    super.updated();
    return this;
  }

  // eslint-disable-next-line no-useless-constructor
  constructor(query) {
    super(query);
  }
}

/**
 * Read a node identified by an IRI as a JSON-LD document
 * @param {string} IRI -  The document id  or a variable to read
 * @param {string} output - Variable which will be bound to the document.
 * @return {WOQLQuery} WOQLQuery
 */
WOQLQuery.prototype.read_document = function (IRI, output) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'ReadDocument';
  this.cursor.identifier = this.cleanNodeValue(IRI);
  this.cursor.document = this.expandValueVariable(output);
  return this;
};

/**
 * Insert a document in the graph.
 * @param {object} docjson -  The document to insert. Must either have an '@id' or
 * have a class specified key.
 * @param {string} [IRI] - An optional identifier specifying the document location.
 * @return {WOQLQuery} WOQLQuery
 */

WOQLQuery.prototype.insert_document = function (docjson, IRI) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'InsertDocument';
  if (typeof IRI !== 'undefined') this.cursor.identifier = this.cleanNodeValue(IRI);

  this.cursor.document = this.cleanObject(docjson);

  return this.updated();
};

/**
 * Update a document identified by an IRI
 * @param {object} docjson -  The document to update. Must either have an '@id' or
 * have a class specified key.
 * @param {string} [IRI] - An optional identifier specifying the document location.
 * @return {WOQLQuery} WOQLQuery
 */

WOQLQuery.prototype.update_document = function (docjson, IRI) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'UpdateDocument';
  if (typeof IRI !== 'undefined') this.cursor.identifier = this.cleanNodeValue(IRI);

  this.cursor.document = this.cleanObject(docjson);

  return this.updated();
};

/**
 * Delete a document from the graph.
 * @param {string} IRI -  The document id  or a variable
 * @return {WOQLQuery} WOQLQuery
 */

WOQLQuery.prototype.delete_document = function (IRI) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'DeleteDocument';
  this.cursor.identifier = this.cleanNodeValue(IRI);
  return this.updated();
};

/**
 * Contains definitions of the WOQL functions which map directly to JSON-LD types
 * All other calls and queries can be composed from these
 */

// moved from woqlCore
WOQLQuery.prototype.wrapCursorWithAnd = function () {
  if (this.cursor && this.cursor['@type'] === 'And') {
    const newby = this.cursor.and.length;
    this.and({});
    this.cursor = this.cursor.and[newby];
  } else {
    const nj = new WOQLQuery().json(this.cursor);
    for (const k in this.cursor) delete this.cursor[k];
    // create an empty json for the new query
    this.and(nj, {});
    this.cursor = this.cursor.and[1];
  }
};

/**
 * Query running against any specific commit Id
 * @param {string}  refPath  - path to specific reference Id or commit Id
 * @param {WOQLQuery} [subquery] - subquery for the specific commit point
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.using = function (refPath, subquery) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Using';
  if (!refPath || typeof refPath !== 'string') {
    return this.parameterError('The first parameter to using must be a Collection ID (string)');
  }
  this.cursor.collection = refPath;
  return this.addSubQuery(subquery);
};

/**
 * Adds a text comment to a query - can also be used to wrap any part of a query to turn it off
 * @param {string} comment - text comment
 * @param {WOQLQuery} [subquery]  - query that is "commented out"
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.comment = function (comment, subquery) {
  // if (comment && comment === 'args')
  // return ['comment', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Comment';
  this.cursor.comment = this.jlt(comment);
  return this.addSubQuery(subquery);
};

/**
 * Filters the query so that only the variables included in [V1...Vn] are returned in the bindings
 * @param {...string|...Var} varNames - only these variables are returned
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.select = function (...varNames) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Select';
  if (!varNames || varNames.length <= 0) {
    return this.parameterError('Select must be given a list of variable names');
  }
  const last = varNames[varNames.length - 1];
  /**
  *@type {any}
  */
  let embedquery = false;
  if (typeof last === 'object' && !(last instanceof Var) && last.json) {
    embedquery = varNames.pop();
  } // else var embedquery = false
  this.cursor.variables = this.rawVarList(varNames);
  return this.addSubQuery(embedquery);
};

/**
 * Build a localized scope for variables to prevent leaking local variables to outer scope.
 * Returns a tuple [localized, v] where:
 * - localized: function that wraps queries with select("") and eq() bindings
 * - v: object with unique variable names for use in the inner query
 *
 * Parameters with non-null values are bound from outer scope via eq().
 * Parameters with null values are local-only variables.
 *
 * @param {object} paramSpec - Object mapping parameter names to values (or null for local vars)
 * @returns {LocalizeResult} Tuple of [localized function, variables object]
 * @example
 * const [localized, v] = WOQL.localize({ consSubject, valueVar, last_cell: null });
 * return localized(
 *   WOQL.and(
 *     WOQL.triple(v.consSubject, 'rdf:type', 'rdf:List'),
 *     WOQL.triple(v.last_cell, 'rdf:rest', 'rdf:nil')
 *   )
 * );
 */
WOQLQuery.prototype.localize = function (paramSpec) {
  // Generate unique variable names for all parameters
  const paramNames = Object.keys(paramSpec);
  const v = VarsUnique(...paramNames);

  const localized = (queryOrUndefined) => {
    // CRITICAL: Create eq bindings for outer parameters OUTSIDE select("")
    // This ensures outer parameters are visible in query results
    const outerEqBindings = [];
    for (const paramName of paramNames) {
      const outerValue = paramSpec[paramName];
      if (outerValue !== null) {
        // If the outer value is a variable, add eq(var, var) to register it in outer scope
        if (typeof outerValue === 'string' && outerValue.startsWith('v:')) {
          outerEqBindings.push(new WOQLQuery().eq(outerValue, outerValue));
        }
        // Bind the unique variable to the outer parameter OUTSIDE the select("")
        outerEqBindings.push(new WOQLQuery().eq(v[paramName], outerValue));
      }
    }

    if (queryOrUndefined) {
      // Functional mode: wrap query in select(""), then add outer eq bindings
      const localizedQuery = new WOQLQuery().select('').and(queryOrUndefined);

      if (outerEqBindings.length > 0) {
        // Wrap: eq(outer) AND select("") { query }
        return new WOQLQuery().and(...outerEqBindings, localizedQuery);
      }
      return localizedQuery;
    }

    // Fluent mode: return wrapper that applies pattern on and()
    const fluentWrapper = new WOQLQuery();
    // eslint-disable-next-line no-underscore-dangle
    fluentWrapper._localizeOuterEq = outerEqBindings;

    // Override and() to apply the localize pattern
    fluentWrapper.and = function (...args) {
      const innerQuery = new WOQLQuery().and(...args);
      const localizedQuery = new WOQLQuery().select('').and(innerQuery);

      // eslint-disable-next-line no-underscore-dangle
      if (fluentWrapper._localizeOuterEq.length > 0) {
        // eslint-disable-next-line no-underscore-dangle
        return new WOQLQuery().and(...fluentWrapper._localizeOuterEq, localizedQuery);
      }
      return localizedQuery;
    };

    return fluentWrapper;
  };

  return [localized, v];
};

/**
 * Filter the query to return only results that are distinct in the given variables
 * @param {...string|...Var} varNames - these variables are guaranteed to be unique as a tuple
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.distinct = function (...varNames) {
  // if (list && list[0] === 'args')
  // return ['variable_list', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Distinct';
  if (!varNames || varNames.length <= 0) {
    return this.parameterError('Distinct must be given a list of variable names');
  }
  const last = varNames[varNames.length - 1];
  /**
     * @type {any}
     */
  let embedquery = false;
  if (typeof last === 'object' && !(last instanceof Var) && last.json) {
    embedquery = varNames.pop();
  } // else var embedquery = false
  this.cursor.variables = this.rawVarList(varNames);
  return this.addSubQuery(embedquery);
};

/**
* Logical conjunction of the contained queries - all queries must match or the entire clause fails
* @param {...WOQLQuery} subqueries - A list of one or more woql queries to execute as a conjunction
* @returns {WOQLQuery} - A WOQLQuery object containing the conjunction of queries
*/

WOQLQuery.prototype.and = function (...subqueries) {
  if (this.cursor['@type'] && this.cursor['@type'] !== 'And') {
    const nj = new WOQLQuery().json(this.cursor);
    for (const k in this.cursor) delete this.cursor[k];
    subqueries.unshift(nj);
  }
  this.cursor['@type'] = 'And';
  if (typeof this.cursor.and === 'undefined') this.cursor.and = [];
  for (let i = 0; i < subqueries.length; i++) {
    const onevar = this.jobj(subqueries[i]);
    if (
      onevar['@type'] === 'And'
      && onevar.and
    ) {
      for (let j = 0; j < onevar.and.length; j++) {
        const qjson = onevar.and[j];
        if (qjson) {
          const subvar = this.jobj(qjson);
          this.cursor.and.push(subvar);
        }
      }
    } else {
      this.cursor.and.push(onevar);
    }
  }
  return this;
};

/**
 * Creates a logical OR of the arguments
 * @param {...WOQLQuery} subqueries - A list of one or more woql queries
 * to execute as alternatives
 * @returns {WOQLQuery} - A WOQLQuery object containing the logical Or of the subqueries
 */

WOQLQuery.prototype.or = function (...subqueries) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Or';
  if (typeof this.cursor.or === 'undefined') this.cursor.or = [];
  for (let i = 0; i < subqueries.length; i++) {
    const onevar = this.jobj(subqueries[i]);
    this.cursor.or.push(onevar);
  }
  return this;
};
/**
 * Specifies the database URL that will be the default database for the enclosed query
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @param {WOQLQuery} [query] - The query
 * @returns {WOQLQuery} A WOQLQuery object containing the from expression
 */

/**
 * Specifies the database URL that will be the default database for the enclosed query
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @param {WOQLQuery} [query] - The query
 * @returns {WOQLQuery} A WOQLQuery object containing the from expression
 */

WOQLQuery.prototype.from = function (graphRef, query) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'From';
  if (!graphRef || typeof graphRef !== 'string') {
    return this.parameterError(
      'The first parameter to from must be a Graph Filter Expression (string)',
    );
  }
  this.cursor.graph = this.jlt(graphRef);
  return this.addSubQuery(query);
};

/**
 * Specifies the graph resource to write the contained query into
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @param {WOQLQuery} [subquery] - The query which will be written into the graph
 * @returns {WOQLQuery} A WOQLQuery which will be written into the graph in question
 */

WOQLQuery.prototype.into = function (graphRef, subquery) {
  // if (graph_descriptor && graph_descriptor === 'args')
  // return ['graph', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Into';
  if (!graphRef || typeof graphRef !== 'string') {
    return this.parameterError(
      'The first parameter to from must be a Graph Filter Expression (string)',
    );
  }
  this.cursor.graph = this.jlt(graphRef);
  return this.addSubQuery(subquery);
};

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate, Object)
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.triple = function (subject, predicate, object) {
  // if (a && a === 'args')
  // return ['subject', 'predicate', 'object']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Triple';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanObject(object);
  return this;
};

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] with a half-open
 * value range [Low, High) on the object. Returns triples whose typed object value
 * falls within the specified range.
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {object} low - The inclusive lower bound as a typed value, e.g. literal(10, "integer")
 * @param {object} high - The exclusive upper bound as a typed value, e.g. literal(100, "integer")
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.triple_slice = function (subject, predicate, object, low, high) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'TripleSlice';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanObject(object);
  this.cursor.low = this.cleanObject(low);
  this.cursor.high = this.cleanObject(high);
  return this;
};

/**
 * Creates a triple pattern matching rule for the quad [S, P, O, G] with a half-open
 * value range [Low, High) on the object and an explicit graph selector.
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {object} low - The inclusive lower bound as a typed value
 * @param {object} high - The exclusive upper bound as a typed value
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.quad_slice = function (subject, predicate, object, low, high, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.triple_slice(subject, predicate, object, low, high);
  if (!graphRef) return this.parameterError('quad_slice takes six parameters, the last should be a graph filter');
  this.cursor['@type'] = 'TripleSlice';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this;
};

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] with a half-open
 * value range [Low, High) on the object, returning results in reverse (descending)
 * object order. Same semantics as triple_slice but iterates from highest to lowest.
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {object} low - The inclusive lower bound as a typed value
 * @param {object} high - The exclusive upper bound as a typed value
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.triple_slice_rev = function (subject, predicate, object, low, high) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'TripleSliceRev';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanObject(object);
  this.cursor.low = this.cleanObject(low);
  this.cursor.high = this.cleanObject(high);
  return this;
};

/**
 * Creates a triple pattern matching rule for the quad [S, P, O, G] with a half-open
 * value range [Low, High) on the object in reverse order, with an explicit graph selector.
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {object} low - The inclusive lower bound as a typed value
 * @param {object} high - The exclusive upper bound as a typed value
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.quad_slice_rev = function (subject, predicate, object, low, high, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.triple_slice_rev(subject, predicate, object, low, high);
  if (!graphRef) return this.parameterError('quad_slice_rev takes six parameters, the last should be a graph filter');
  this.cursor['@type'] = 'TripleSliceRev';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this;
};

/**
 * Finds the next object value after a reference for a given subject-predicate pair.
 * When object is bound and next is free, finds the smallest next > object.
 * When next is bound and object is free, finds the largest object < next.
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The current object value or a variable
 * @param {object|Var} next - The next object value or a variable
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.triple_next = function (subject, predicate, object, next) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'TripleNext';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanObject(object);
  this.cursor.next = this.cleanObject(next);
  return this;
};

/**
 * Finds the next object value with an explicit graph selector.
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The current object value or a variable
 * @param {object|Var} next - The next object value or a variable
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.quad_next = function (subject, predicate, object, next, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.triple_next(subject, predicate, object, next);
  if (!graphRef) return this.parameterError('quad_next takes five parameters, the last should be a graph filter');
  this.cursor['@type'] = 'TripleNext';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this;
};

/**
 * Finds the previous object value before a reference for a given subject-predicate pair.
 * When object is bound and previous is free, finds the largest previous < object.
 * When previous is bound and object is free, finds the smallest object > previous.
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The current object value or a variable
 * @param {object|Var} previous - The previous object value or a variable
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.triple_previous = function (subject, predicate, object, previous) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'TriplePrevious';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanObject(object);
  this.cursor.previous = this.cleanObject(previous);
  return this;
};

/**
 * Finds the previous object value with an explicit graph selector.
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The current object value or a variable
 * @param {object|Var} previous - The previous object value or a variable
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.quad_previous = function (subject, predicate, object, previous, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.triple_previous(subject, predicate, object, previous);
  if (!graphRef) return this.parameterError('quad_previous takes five parameters, the last should be a graph filter');
  this.cursor['@type'] = 'TriplePrevious';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this;
};

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate,
 * Object) added in the current layer
 * @param {string|Var} subject - The IRI of a triple's subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.added_triple = function (subject, predicate, object) {
  // if (a && a === 'args')
  // return ['subject', 'predicate', 'object']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'AddedTriple';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanObject(object);
  return this;
};

/**
 * Creates a triple pattern matching rule for the triple [S, P, O] (Subject, Predicate,
 * Object) added in the current commit
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.removed_triple = function (subject, predicate, object) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'DeletedTriple';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanObject(object);
  return this;
};

/**
 * Creates a pattern matching rule for triple [Subject, Predicate, Object]
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery} A WOQLQuery which contains the a quad or a triple Statement
 */

WOQLQuery.prototype.link = function (subject, predicate, object) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Triple';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanSubject(object);
  return this;
};

/**
 * Creates a pattern matching rule for triple [Subject, Predicate, Object]
 * add extra information about the type of the value object
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string | number | boolean | Var} objValue - an specific value
 * @returns {WOQLQuery} A WOQLQuery which contains the a quad or a triple Statement
 */

WOQLQuery.prototype.value = function (subject, predicate, objValue) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Triple';
  this.cursor.subject = this.cleanSubject(subject);
  this.cursor.predicate = this.cleanPredicate(predicate);
  this.cursor.object = this.cleanDataValue(objValue, 'xsd:string');
  return this;
};

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate, Object, Graph)
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.quad = function (subject, predicate, object, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(subject, predicate, object);
  // if (a && a === 'args')
  // return args.concat(['graph'])
  if (!graphRef) return this.parameterError('Quad takes four parameters, the last should be a graph filter');
  this.cursor['@type'] = 'Triple';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this;
};

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate,
 * Object, Graph) removed from the current commit
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.added_quad = function (subject, predicate, object, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(subject, predicate, object);
  // if (a && a === 'args')
  // return args.concat(['graph'])
  if (!graphRef) return this.parameterError('Quad takes four parameters, the last should be a graph filter');
  this.cursor['@type'] = 'AddedQuad';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this;
};

/**
 * Creates a pattern matching rule for the quad [S, P, O, G] (Subject, Predicate,
 * Object, Graph) removed from the current commit
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef- A valid graph resource identifier string
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.removed_quad = function (subject, predicate, object, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(subject, predicate, object);
  // if (a && a === 'args')
  // return args.concat(['graph'])
  if (!graphRef) return this.parameterError('Quad takes four parameters, the last should be a graph filter');
  this.cursor['@type'] = 'DeletedQuad';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this;
};

/**
 * Returns true if ClassA subsumes ClassB, according to the current DB schema
 * @param {string} classA - ClassA
 * @param {string} classB - ClassB
 * @returns {boolean} WOQLQuery
 */
WOQLQuery.prototype.sub = function (classA, classB) {
  if (!classA || !classB) return this.parameterError('Subsumption takes two parameters, both URIs');
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Subsumption';
  this.cursor.parent = this.cleanNodeValue(classA);
  this.cursor.child = this.cleanNodeValue(classB);
  return this;
};

WOQLQuery.prototype.subsumption = WOQLQuery.prototype.sub;

/**
 * Matches if a is equal to b
 * @param {string|number|boolean|array|Var} varName - literal, variable, array, or id
 * @param {string|number|boolean|array|Var} varValue - literal, variable, array, or id
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.eq = function (varName, varValue) {
  // if (a && a === 'args') return ['left', 'right']
  if (typeof varName === 'undefined' || typeof varValue === 'undefined') return this.parameterError('Equals takes two parameters');
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Equals';
  this.cursor.left = this.cleanObject(varName);
  this.cursor.right = this.cleanObject(varValue);
  return this;
};

WOQLQuery.prototype.equals = WOQLQuery.prototype.eq;

/**
 * Substring
 * @param {string|Var} string - String or variable
 * @param {number|Var} before - integer or variable (characters from start to begin)
 * @param {number|Var} [length] - integer or variable (length of substring)
 * @param {number|Var} [after] - integer or variable (number of characters after substring)
 * @param {string|Var} [subString] - String or variable
 * @returns {WOQLQuery}
 */
WOQLQuery.prototype.substr = function (string, before, length, after, subString) {
  // if (String && String === 'args')
  // return ['string', 'before', 'length', 'after', 'substring']
  if (!subString) {
    subString = after;
    after = 0;
  }
  if (!subString) {
    subString = length;
    length = subString.length + before;
  }
  if (!string || !subString || typeof subString !== 'string') {
    return this.parameterError(
      'Substr - the first and last parameters must be strings representing the full and substring variables / literals',
    );
  }
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Substring';
  this.cursor.string = this.cleanDataValue(string, 'xsd:string');
  this.cursor.before = this.cleanDataValue(before, 'xsd:nonNegativeInteger');
  this.cursor.length = this.cleanDataValue(length, 'xsd:nonNegativeInteger');
  this.cursor.after = this.cleanDataValue(after, 'xsd:nonNegativeInteger');
  this.cursor.substring = this.cleanDataValue(subString, 'xsd:string');
  return this;
};

WOQLQuery.prototype.substring = WOQLQuery.prototype.substr;

/**
 * Use the document inteface to import documents
 * @deprecated
 * Retrieves the exernal resource defined by QueryResource and copies values
 * from it into variables defined in AsVars
 * @param {Vars | array<Var>} asvars - an array of AsVar variable mappings (see as for format below)
 * @param {WOQLQuery} queryResource - an external resource (remote, file, post) to query
 * @returns {WOQLQuery} A WOQLQuery which contains the get expression
 */
WOQLQuery.prototype.get = function (asvars, queryResource) {
  this.cursor['@type'] = 'Get';
  this.cursor.columns = asvars.json ? asvars.json() : new WOQLQuery().as(...asvars).json();
  if (queryResource) {
    this.cursor.resource = this.jobj(queryResource);
  } else {
    this.cursor.resource = {};
  }
  this.cursor = this.cursor.resource;
  return this;
};

/**
 * Use the document inteface to import documents
 * @deprecated
 * @put Outputs the results of a query to a file
 * @param {Vars | array<Var>} varsToExp - an array of AsVar variable
 * mappings (see as for format below)
 * @param {WOQLQuery} query - The query which will be executed to produce the results
 * @param {string} fileResource - an file resource local to the server
 * @returns {WOQLQuery} A WOQLQuery which contains the put expression
 */
WOQLQuery.prototype.put = function (varsToExp, query, fileResource) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Put';
  if (Array.isArray(varsToExp) && typeof varsToExp[0] !== 'object') {
    const nasvars = [];
    for (let i = 0; i < varsToExp.length; i++) {
      const iasv = this.asv(i, varsToExp[i]);
      nasvars.push(iasv);
      this.cursor.columns = nasvars;
    }
  } else {
    this.cursor.columns = varsToExp.json
      ? varsToExp.json()
      : new WOQLQuery().as(...varsToExp).json();
  }
  this.cursor.query = this.jobj(query);
  if (fileResource) {
    this.cursor.resource = this.jobj(fileResource);
  } else {
    this.cursor.resource = {};
  }
  this.cursor = this.cursor.resource;
  return this;
};

/**
 * @param {...(array|string|Var)} varList variable number of arguments
 * @returns WOQLQuery
 */
WOQLQuery.prototype.as = function (...varList) {
  // if (varList && varList[0] == 'args')
  // return [['indexed_as_var', 'named_as_var']]
  if (!Array.isArray(this.query)) this.query = [];
  if (Array.isArray(varList[0])) {
    if (!varList[1]) {
      // indexed as vars
      for (var i = 0; i < varList[0].length; i++) {
        const iasv = this.asv(i, varList[0][i]);
        this.query.push(iasv);
      }
    } else {
      for (var i = 0; i < varList.length; i++) {
        const onemap = varList[i];
        if (Array.isArray(onemap) && onemap.length >= 2) {
          const type = onemap && onemap.length > 2 ? onemap[2] : false;
          const oasv = this.asv(onemap[0], onemap[1], type);
          this.query.push(oasv);
        }
      }
    }
  } else if (typeof varList[0] === 'number' || typeof varList[0] === 'string') {
    if (varList[2] && typeof varList[2] === 'string') {
      var oasv = this.asv(varList[0], varList[1], varList[2]);
    } else if (varList[1] && varList[1] instanceof Var) {
      var oasv = this.asv(varList[0], varList[1]);
    } else if (varList[1] && typeof varList[1] === 'string') {
      if (varList[1].substring(0, 4) === 'xsd:' || varList[1].substring(0, 4) === 'xdd:') {
        var oasv = this.asv(this.query.length, varList[0], varList[1]);
      } else {
        var oasv = this.asv(varList[0], varList[1]);
      }
    } else {
      var oasv = this.asv(this.query.length, varList[0]);
    }
    this.query.push(oasv);
  } else if (typeof varList[0] === 'object') {
    // check if it is an class object with an json method
    this.query.push(varList[0].json ? varList[0].json() : varList[0]);
  }
  return this;
};

/**
 * Identifies a remote resource by URL and specifies the format of the resource through the options
 * @param {object} remoteObj - The URL at which the remote resource can be accessed
 * @param {typedef.DataFormatObj} [formatObj] - The format of the resource data {}
 * @returns {WOQLQuery} A WOQLQuery which contains the remote resource identifier
 */

WOQLQuery.prototype.remote = function (remoteObj, formatObj) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'QueryResource';
  this.cursor.source = { '@type': 'Source', url: remoteObj };
  this.cursor.format = 'csv'; // hard coded for now
  if (typeof opts !== 'undefined') this.cursor.options = formatObj;
  return this;
};

/**
 * Identifies a resource as a local path on the client, to be sent to the server through a
 * HTTP POST request, with the format defined through the options
 * @param {string} url - The Path on the server at which the file resource can be accessed
 * @param {typedef.DataFormatObj} [formatObj] - imput options, optional
 * @param {string} [source] - It defines the source of the file, it can be 'url','post'
 * @returns {WOQLQuery} A WOQLQuery which contains the Post resource identifier
 */

WOQLQuery.prototype.post = function (url, formatObj, source = 'post') {
  // if (fpath && fpath == 'args') return ['file', 'format']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'QueryResource';
  this.cursor.source = { '@type': 'Source', [source]: url };
  this.cursor.format = 'csv'; // hard coded for now
  this.cursor.options = formatObj;
  if (typeof formatObj !== 'undefined') this.cursor.options = formatObj;
  return this;
};

/**
 * Deletes a single triple from the default graph of the database
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery} - A WOQLQuery which contains the Triple Deletion statement
 */

WOQLQuery.prototype.delete_triple = function (subject, predicate, object) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(subject, predicate, object);
  this.cursor['@type'] = 'DeleteTriple';
  return this.updated();
};

/**
 * Adds triples according to the the pattern [subject,predicate,object]
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.add_triple = function (subject, predicate, object) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(subject, predicate, object);
  this.cursor['@type'] = 'AddTriple';
  return this.updated();
};

/**
 * Deletes a single triple from the graph [Subject, Predicate, Object, Graph]
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery} - A WOQLQuery which contains the Delete Quad Statement
 */
WOQLQuery.prototype.delete_quad = function (subject, predicate, object, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(subject, predicate, object);
  // if (a && a == 'args') return args.concat(['graph'])
  if (!graphRef) {
    return this.parameterError(
      'Delete Quad takes four parameters, the last should be a graph id',
    );
  }
  this.cursor['@type'] = 'DeleteTriple';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this.updated();
};

/**
 * Adds quads according to the pattern [S,P,O,G]
 * @param {string|Var} subject - The IRI of a triple’s subject or a variable
 * @param {string|Var} predicate - The IRI of a property or a variable
 * @param {string|Var} object - The IRI of a node or a variable, or a literal
 * @param {typedef.GraphRef} graphRef - A valid graph resource identifier string
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.add_quad = function (subject, predicate, object, graphRef) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(subject, predicate, object);
  if (!graphRef) return this.parameterError('Add Quad takes four parameters, the last should be a graph id');
  this.cursor['@type'] = 'AddTriple';
  this.cursor.graph = this.cleanGraph(graphRef);
  return this.updated();
};

/**
 * Remove whitespace from both sides of a string:
 * @param {string|Var} inputStr - A string or variable containing
 * the untrimmed version of the string
 * @param {string|Var} resultVarName - A string or variable
 * containing the trimmed version of the string
 * @returns {WOQLQuery} A WOQLQuery which contains the Trim pattern matching expression
 */

WOQLQuery.prototype.trim = function (inputStr, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Trim';
  this.cursor.untrimmed = this.cleanDataValue(inputStr);
  this.cursor.trimmed = this.cleanDataValue(resultVarName);
  return this;
};

/**
 * Evaluates the passed arithmetic expression and generates or matches the result value
 * @param {object| WOQLQuery | string} arithExp - query or JSON-LD representing the query
 * @param {string|Var} resultVarName - output variable
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.eval = function (arithExp, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Eval';
  this.cursor.expression = arithExp.json ? arithExp.json() : arithExp;
  this.cursor.result = this.cleanArithmeticValue(resultVarName);
  return this;
};

/**
 * Evaluates the passed arithmetic expression and generates or matches the result value.
 * Alias for eval() to support both naming conventions in fluent/chained style.
 * @param {object|WOQLQuery|string} arithExp - A WOQL query containing a valid arithmetic expression
 * @param {string|number|Var} resultVarName - Either a variable to store the result, or a numeric
 * literal to test against the evaluated expression
 * @returns {WOQLQuery}
 */

WOQLQuery.prototype.evaluate = function (arithExp, resultVarName) {
  return this.eval(arithExp, resultVarName);
};

/**
 * Adds the numbers together
 * @param {...(string|number|Var)} args - a variable or numeric containing the values to add
 * @returns {WOQLQuery} A WOQLQuery which contains the addition expression
 */

WOQLQuery.prototype.plus = function (...args) {
  // if (args && args[0] == 'args') return ['first', 'second']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Plus';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().plus(...args.map(this.arop)));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

/**
 *
 * Subtracts Numbers N1..Nn
 * @param {...(string|number|Var)} args - variable or numeric containing the value that will be
 * subtracted from
 * @returns {WOQLQuery} A WOQLQuery which contains the subtraction expression
 */
WOQLQuery.prototype.minus = function (...args) {
  // if (args && args[0] === 'args') return ['first', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Minus';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().minus(...args.map(this.arop)));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

/**
 *
 * Multiplies numbers N1...Nn together
 * @param {...(string|number|Var)} args - a variable or numeric containing the value
 * @returns {WOQLQuery} A WOQLQuery which contains the multiplication expression
 */
WOQLQuery.prototype.times = function (...args) {
  // if (args && args[0] === 'args') return ['first', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Times';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().times(...args.map(this.arop)));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

/**
 * Divides numbers N1...Nn by each other left, to right precedence
 * @param {...(string|number|Var )} args - numbers to tbe divided
 * @returns {WOQLQuery} A WOQLQuery which contains the division expression
 */
WOQLQuery.prototype.divide = function (...args) {
  // if (args && args[0] === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Divide';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().divide(...args.map(this.arop)));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

/**
 * Division - integer division - args are divided left to right
 * @param {...(string|number|Var)} args - numbers for division
 * @returns {WOQLQuery} A WOQLQuery which contains the division expression
 */

WOQLQuery.prototype.div = function (...args) {
  // if (args && args[0] === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Div';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().div(...args.map(this.arop)));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

/**
 * Exponent - raises varNum01 to the power of varNum02
 * @param {string|number|Var} varNum -  a variable or numeric containing the number to be
 * raised to the power of the second number
 * @param {number} expNum -  a variable or numeric containing the exponent
 * @returns {WOQLQuery} A WOQLQuery which contains the exponent expression
 */
WOQLQuery.prototype.exp = function (varNum, expNum) {
  // if (a && a === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Exp';
  this.cursor.left = this.arop(varNum);
  this.cursor.right = this.arop(expNum);
  return this;
};

/**
 * Generates the nearest lower integer to the passed number
 * @param {string|number|Var} varNum - Variable or numeric containing the number to be floored
 * @returns {WOQLQuery} A WOQLQuery which contains the floor expression
 */
WOQLQuery.prototype.floor = function (varNum) {
  // if (a && a === 'args') return ['argument']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Floor';
  this.cursor.argument = this.arop(varNum);
  return this;
};

/**
 * Tests whether a given instance IRI has type Class, according to the current state of the DB
 * @param {string|Var} instanceIRI - A string IRI or a variable that identify the class instance
 * @param {string|Var} classId - A Class IRI or a variable
 * @returns {WOQLQuery} A WOQLQuery object containing the type test
 */
WOQLQuery.prototype.isa = function (instanceIRI, classId) {
  // if (a && a === 'args') return ['element', 'of_type']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'IsA';
  this.cursor.element = this.cleanNodeValue(instanceIRI);
  this.cursor.type = this.cleanNodeValue(classId);
  return this;
};

/**
 * Generates a string Leverstein distance measure between stringA and stringB
 * @param {string|Var} stringA - string literal or variable representing a string to be compared
 * @param {string|Var } stringB - string literal or variable
 * representing the other string to be compared
 * @param {number|string|Var} distance - variable representing the distance between the variables
 * @returns {WOQLQuery} A WOQLQuery which contains the Like pattern matching expression
 */
WOQLQuery.prototype.like = function (stringA, stringB, distance) {
  // if (a && a === 'args')
  // return ['left', 'right', 'like_similarity']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Like';
  this.cursor.left = this.cleanDataValue(stringA, 'xsd:string');
  this.cursor.right = this.cleanDataValue(stringB, 'xsd:string');
  if (distance) {
    this.cursor.similarity = this.cleanDataValue(distance, 'xsd:decimal');
  }
  return this;
};

/**
 * Compares the value of v1 against v2 and returns true if v1 is less than v2
 * @param {string|number|Var} varNum01 - a variable or numeric containing
 * the number to be compared
 * @param {string|number|Var} varNum02 - a variable or numeric containing the second comporator
 * @returns {WOQLQuery} A WOQLQuery which contains the comparison expression
 */
WOQLQuery.prototype.less = function (varNum01, varNum02) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Less';
  this.cursor.left = this.cleanDataValue(varNum01);
  this.cursor.right = this.cleanDataValue(varNum02);
  return this;
};

/**
 * Compares the value of v1 against v2 and returns true if v1 is greater than v2
 * @param {string|number|Var} varNum01 - a variable or numeric containing the number to be compared
 * @param {string|number|Var} varNum02 - a variable or numeric containing the second comporator
 * @returns {WOQLQuery} A WOQLQuery which contains the comparison expression
 */
WOQLQuery.prototype.greater = function (varNum01, varNum02) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Greater';
  this.cursor.left = this.cleanDataValue(varNum01);
  this.cursor.right = this.cleanDataValue(varNum02);
  return this;
};

/**
 * Specifies that the Subquery is optional - if it does not match the query will not fail
 * @param {WOQLQuery} [subquery] - A subquery which will be optionally matched
 * @returns {WOQLQuery} A WOQLQuery object containing the optional sub Query
 */
WOQLQuery.prototype.opt = function (subquery) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Optional';
  this.addSubQuery(subquery);
  return this;
};

WOQLQuery.prototype.optional = WOQLQuery.prototype.opt;

/**
 * Generate a new IRI from the prefix and a hash of the variables which will be unique for any
 * given combination of variables
 * @param {string} prefix - A prefix for the IRI - typically formed of the doc prefix and the
 * classtype of the entity (“doc:Person”)
 * @param {array|string|Var} inputVarList - An array of variables and / or strings from which the
 * unique hash will be generated
 * @param {string|Var} resultVarName - Variable in which the unique ID is stored
 * @returns {WOQLQuery} A WOQLQuery object containing the unique ID generating function
 */
WOQLQuery.prototype.unique = function (prefix, inputVarList, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'HashKey';
  this.cursor.base = this.cleanDataValue(prefix, 'xsd:string');
  this.cursor.key_list = this.cleanDataValue(inputVarList);
  this.cursor.uri = this.cleanNodeValue(resultVarName);
  return this;
};

/**
 * Generates the node's ID combined the variable list with a specific prefix (URL base).
 * If the input variables's values are the same, the output value will be the same.
 * @param {string} prefix
 * @param {string |array}  inputVarList the variable input list for generate the id
 * @param {string} outputVar  the output variable name
 */

WOQLQuery.prototype.idgen = function (prefix, inputVarList, outputVar) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'LexicalKey';
  this.cursor.base = this.cleanDataValue(prefix, 'xsd:string');
  // this.cursor['base'] = this.cleanObject(this.string(prefix))
  this.cursor.key_list = this.dataValueList(inputVarList);
  this.cursor.uri = this.cleanNodeValue(outputVar);
  return this;
};

WOQLQuery.prototype.idgenerator = WOQLQuery.prototype.idgen;

/**
 * Generates a random ID with a specified prefix
 * Uses cryptographically secure random base64 encoding to generate unique identifiers
 * @param {string} prefix - prefix for the generated ID
 * @param {string} outputVar - variable that stores the generated ID
 * @returns {WOQLQuery} A WOQLQuery which contains the random ID generation pattern
 * idgen_random("Person/", "v:person_id")
 */
WOQLQuery.prototype.idgen_random = function (prefix, outputVar) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'RandomKey';
  this.cursor.base = this.cleanDataValue(prefix, 'xsd:string');
  this.cursor.uri = this.cleanNodeValue(outputVar);
  return this;
};

/**
 * Backward-compatible alias for idgen_random
 * @deprecated Use idgen_random instead
 */
WOQLQuery.prototype.random_idgen = WOQLQuery.prototype.idgen_random;

/**
 * Changes a string to upper-case
 * @param {string|Var} inputVarName - string or variable representing the uncapitalized string
 * @param {string|Var} resultVarName -  variable that stores the capitalized string output
 * @returns {WOQLQuery} A WOQLQuery which contains the Upper case pattern matching expression
 */
WOQLQuery.prototype.upper = function (inputVarName, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Upper';
  this.cursor.mixed = this.cleanDataValue(inputVarName);
  this.cursor.upper = this.cleanDataValue(resultVarName);
  return this;
};

/**
 * Changes a string to lower-case
 * @param {string|Var} inputVarName -  string or variable representing the non-lowercased string
 * @param {string|Var} resultVarName - variable that stores the lowercased string output
 * @returns {WOQLQuery} A WOQLQuery which contains the Lower case pattern matching expression
 */

WOQLQuery.prototype.lower = function (inputVarName, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Lower';
  this.cursor.mixed = this.cleanDataValue(inputVarName);
  this.cursor.lower = this.cleanDataValue(resultVarName);
  return this;
};

/**
 * Pads out the string input to be exactly len long by appending the pad character pad to
 * form output
 * @param {string|Var} inputVarName - The input string or variable in unpadded state
 * @param {string|Var} pad - The characters to use to pad the string or a variable representing them
 * @param {number | string | Var} len - The variable or integer value representing the length of
 * the output string
 * @param {string|Var} resultVarName - stores output
 * @returns {WOQLQuery} A WOQLQuery which contains the Pad pattern matching expression
 */

WOQLQuery.prototype.pad = function (inputVarName, pad, len, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Pad';
  this.cursor.string = this.cleanDataValue(inputVarName);
  this.cursor.char = this.cleanDataValue(pad);
  this.cursor.times = this.cleanDataValue(len, 'xsd:integer');
  this.cursor.result = this.cleanDataValue(resultVarName);
  return this;
};

/**
 * Splits a string (Input) into a list strings (Output) by removing separator
 * @param {string|Var} inputVarName - A string or variable representing the unsplit string
 * @param {string|Var} separator - A string or variable containing a sequence of charatcters
 * to use as a separator
 * @param {string|Var} resultVarName - variable that stores output list
 * @returns {WOQLQuery} A WOQLQuery which contains the Split pattern matching expression
 */

WOQLQuery.prototype.split = function (inputVarName, separator, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Split';
  this.cursor.string = this.cleanDataValue(inputVarName);
  this.cursor.pattern = this.cleanDataValue(separator);
  this.cursor.list = this.cleanDataValue(resultVarName);
  return this;
};

/**
 * Matches if List includes Element
 * @param {string|object|Var} element - Either a variable, IRI or any simple datatype
 * @param {string|array|Var} list - List ([string, literal] or string*) Either a variable
 * representing a list or a list of variables or literals
 * @returns {WOQLQuery} A WOQLQuery which contains the List inclusion pattern matching expression
 */
WOQLQuery.prototype.member = function (element, list) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Member';
  this.cursor.member = this.cleanObject(element);
  this.cursor.list = this.valueList(list);
  return this;
};

/**
 * Computes the set difference between two lists (elements in listA but not in listB)
 * @param {string|Var|array} listA - First list or variable
 * @param {string|Var|array} listB - Second list or variable
 * @param {string|Var} result - Variable to store the result
 * @returns {WOQLQuery} A WOQLQuery which contains the SetDifference expression
 */
WOQLQuery.prototype.set_difference = function (listA, listB, result) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'SetDifference';
  this.cursor.list_a = this.valueList(listA);
  this.cursor.list_b = this.valueList(listB);
  this.cursor.result = this.valueList(result);
  return this;
};

/**
 * Computes the set intersection of two lists (elements in both listA and listB)
 * @param {string|Var|array} listA - First list or variable
 * @param {string|Var|array} listB - Second list or variable
 * @param {string|Var} result - Variable to store the result
 * @returns {WOQLQuery} A WOQLQuery which contains the SetIntersection expression
 */
WOQLQuery.prototype.set_intersection = function (listA, listB, result) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'SetIntersection';
  this.cursor.list_a = this.valueList(listA);
  this.cursor.list_b = this.valueList(listB);
  this.cursor.result = this.valueList(result);
  return this;
};

/**
 * Computes the set union of two lists (all unique elements from both lists)
 * @param {string|Var|array} listA - First list or variable
 * @param {string|Var|array} listB - Second list or variable
 * @param {string|Var} result - Variable to store the result
 * @returns {WOQLQuery} A WOQLQuery which contains the SetUnion expression
 */
WOQLQuery.prototype.set_union = function (listA, listB, result) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'SetUnion';
  this.cursor.list_a = this.valueList(listA);
  this.cursor.list_b = this.valueList(listB);
  this.cursor.result = this.valueList(result);
  return this;
};

/**
 * Checks if an element is a member of a set (efficient O(log n) lookup)
 * @param {string|Var|any} element - Element to check
 * @param {string|Var|array} set - Set (list) to check membership in
 * @returns {WOQLQuery} A WOQLQuery which contains the SetMember expression
 */
WOQLQuery.prototype.set_member = function (element, set) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'SetMember';
  this.cursor.element = this.cleanObject(element);
  this.cursor.set = this.valueList(set);
  return this;
};

/**
 * Converts a list to a set (removes duplicates and sorts)
 * @param {string|Var|array} list - Input list or variable
 * @param {string|Var} set - Variable to store the resulting set
 * @returns {WOQLQuery} A WOQLQuery which contains the ListToSet expression
 */
WOQLQuery.prototype.list_to_set = function (list, set) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'ListToSet';
  this.cursor.list = this.valueList(list);
  this.cursor.set = this.valueList(set);
  return this;
};

/**
 * takes a variable number of string arguments and concatenates them into a single string
 * @param {array|string|Var} varList -  a variable representing a list or a list of variables or
 * strings - variables can be embedded in the string if they do not contain spaces
 * @param {string|Var}  resultVarName - A variable or string containing the output string
 * @returns {WOQLQuery} A WOQLQuery which contains the Concatenation pattern matching expression
 */

WOQLQuery.prototype.concat = function (varList, resultVarName) {
  if (typeof varList === 'string') {
    const slist = varList.split(/(v:)/);
    const nlist = [];
    if (slist[0]) nlist.push(slist[0]);
    for (let i = 1; i < slist.length; i += 2) {
      if (slist[i]) {
        if (slist[i] === 'v:') {
          const slist2 = slist[i + 1].split(/([^\w_])/);
          const x = slist2.shift();
          nlist.push(`v:${x}`);
          const rest = slist2.join('');
          if (rest) nlist.push(rest);
        }
      }
    }
    varList = nlist;
  }
  if (Array.isArray(varList)) {
    if (this.cursor['@type']) this.wrapCursorWithAnd();
    this.cursor['@type'] = 'Concatenate';
    this.cursor.list = this.cleanDataValue(varList, true);
    this.cursor.result = this.cleanDataValue(resultVarName);
  }
  return this;
};

WOQLQuery.prototype.concatenate = WOQLQuery.prototype.concat;

/**
 * Joins a list variable together (Input) into a string variable (Output) by glueing the strings
 * together with Glue
 * @param {string|array|Var} varList - a variable representing a list or a list of strings
 * and / or variables
 * @param {string|Var} glue - A variable (v:glue) or (glue) string representing the characters
 * to put in between the joined strings in input
 * @param {string|Var} resultVarName - A variable or string containing the output string
 * @returns {WOQLQuery} A WOQLQuery which contains the Join pattern matching expression
 */
WOQLQuery.prototype.join = function (varList, glue, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Join';
  this.cursor.list = this.cleanDataValue(varList);
  this.cursor.separator = this.cleanDataValue(glue);
  this.cursor.result = this.cleanDataValue(resultVarName);
  return this;
};

/**
 * computes the sum of the List of values passed. In contrast to other arithmetic functions,
 * sum self-evaluates - it does not have to be passed to evaluate()
 * @param {WOQLQuery} subquery -  a subquery or ([string or numeric]) - a list variable, or a
 * list of variables or numeric literals
 * @param {string|Var} total - the variable name with the sum result of the values in List
 * @returns {WOQLQuery} - A WOQLQuery which contains the Sum expression
 */
WOQLQuery.prototype.sum = function (subquery, total) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Sum';
  this.cursor.list = this.cleanDataValue(subquery);
  this.cursor.result = this.cleanObject(total);
  return this;
};

/**
 *
 * Specifies an offset position in the results to start listing results from
 * @param {number|string|Var} start - A variable that refers to an interger or an integer literal
 * @param {WOQLQuery} [subquery] - WOQL Query object, you can pass a subquery as an argument
 * or a chained query
 * @returns {WOQLQuery} A WOQLQuery whose results will be returned starting from
 * the specified offset
 */

WOQLQuery.prototype.start = function (start, subquery) {
  // if (start && start === 'args') return ['start', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Start';
  this.cursor.start = start;
  return this.addSubQuery(subquery);
};

/**
 * Specifies a maximum number of results that will be returned from the subquery
 * @param {number|string} limit - A variable that refers to an non-negative integer or a
 * non-negative integer
 * @param {WOQLQuery} [subquery] - A subquery whose results will be limited
 * @returns {WOQLQuery} A WOQLQuery whose results will be returned starting from
 * the specified offset
 */

WOQLQuery.prototype.limit = function (limit, subquery) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Limit';
  this.cursor.limit = limit;
  return this.addSubQuery(subquery);
};

/**
 * Matches the regular expression defined in Patern against the Test string, to produce
 * the matched patterns in Matches
 * @param {string} pattern - string or variable using normal PCRE regular expression syntax with
 * the exception that special characters have to be escaped twice (to enable transport in JSONLD)
 * @param {string|Var} inputVarName - string or variable containing the string to be tested for
 * patterns with the regex
 * @param {string|array|object|Var} resultVarList - variable representing the list of matches
 * or a list of strings or variables
 * @returns {WOQLQuery} A WOQLQuery which contains the Regular Expression pattern
 * matching expression
 */

WOQLQuery.prototype.re = function (pattern, inputVarName, resultVarList) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Regexp';
  this.cursor.pattern = this.cleanDataValue(pattern);
  this.cursor.string = this.cleanDataValue(inputVarName);
  this.cursor.result = this.cleanDataValue(resultVarList);
  return this;
};

WOQLQuery.prototype.regexp = WOQLQuery.prototype.re;

/**
 * Calculates the length of the list in va and stores it in vb
 * @param {string|array} inputVarList - Either a variable representing a list or a list of
 * variables or literals
 * @param {string|Var} resultVarName -  A variable in which the length of the list is stored or
 * the length of the list as a non-negative integer
 * @returns {WOQLQuery} A WOQLQuery which contains the Length pattern matching expression
 */
WOQLQuery.prototype.length = function (inputVarList, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Length';
  this.cursor.list = this.cleanDataValue(inputVarList);
  if (resultVarName !== undefined && resultVarName !== null) {
    if (typeof resultVarName === 'number') {
      this.cursor.length = this.cleanObject(resultVarName, 'xsd:nonNegativeInteger');
    } else {
      // Handle string, Var instances, or any other variable representation
      this.cursor.length = this.varj(resultVarName);
    }
  }
  return this;
};

/**
 * Extracts a contiguous subsequence from a list, following JavaScript's slice() semantics
 * @param {string|array|Var} inputList - Either a variable representing a list or a list of
 * variables or literals
 * @param {string|Var} resultVarName - A variable in which the sliced list is stored
 * @param {number|string|Var} start - The start index (0-based, supports negative indices)
 * @param {number|string|Var} [end] - The end index (exclusive, optional - defaults to list length)
 * @returns {WOQLQuery} A WOQLQuery which contains the Slice pattern matching expression
 * let [result] = vars("result")
 * slice(["a", "b", "c", "d"], result, 1, 3)  // result = ["b", "c"]
 * slice(["a", "b", "c", "d"], result, -2)    // result = ["c", "d"]
 */
WOQLQuery.prototype.slice = function (inputList, resultVarName, start, end) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Slice';
  this.cursor.list = this.cleanDataValue(inputList);
  this.cursor.result = this.cleanDataValue(resultVarName);
  if (typeof start === 'number') {
    this.cursor.start = this.cleanObject(start, 'xsd:integer');
  } else {
    this.cursor.start = this.cleanDataValue(start);
  }
  // end is optional - only set if provided
  if (end !== undefined) {
    if (typeof end === 'number') {
      this.cursor.end = this.cleanObject(end, 'xsd:integer');
    } else {
      this.cursor.end = this.cleanDataValue(end);
    }
  }
  return this;
};

/**
 *
 * Logical negation of the contained subquery - if the subquery matches, the query
 * will fail to match
 * @param {string | WOQLQuery} [subquery] -  A subquery which will be negated
 * @returns {WOQLQuery} A WOQLQuery object containing the negated sub Query
 */
WOQLQuery.prototype.not = function (subquery) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Not';
  return this.addSubQuery(subquery);
};

/**
 * Results in one solution of the subqueries
 * @param {string| WOQLQuery } [subquery] - WOQL Query objects
 * @returns {WOQLQuery} A WOQLQuery object containing the once sub Query
 */
WOQLQuery.prototype.once = function (subquery) {
  // if (query && query === 'args') return ['query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Once';
  return this.addSubQuery(subquery);
};

/**
 * Runs the query without backtracking on side-effects
 * @param {string| WOQLQuery } [subquery] - WOQL Query objects
 * @returns {WOQLQuery} A WOQLQuery object containing the immediately sub Query
 */
WOQLQuery.prototype.immediately = function (query) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Immediately';
  return this.addSubQuery(query);
};

/**
 * Creates a count of the results of the query
 * @param {string|number|Var} countVarName - variable or integer count
 * @param {WOQLQuery} [subquery]
 * @returns {WOQLQuery} A WOQLQuery object containing the count sub Query
 */
WOQLQuery.prototype.count = function (countVarName, subquery) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Count';
  this.cursor.count = this.cleanObject(countVarName);
  return this.addSubQuery(subquery);
};

/**
 * Casts the value of Input to a new value of type Type and stores the result in CastVar
 * @param {string|number|object|Var} varName - Either a single variable or a
 * literal of any basic type
 * @param {string|Var} varType - Either a variable or a basic datatype (xsd / xdd)
 * @param {string|Var} resultVarName - save the return variable
 * @returns {WOQLQuery} A WOQLQuery which contains the casting expression
 */

WOQLQuery.prototype.typecast = function (varName, varType, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Typecast';
  this.cursor.value = this.cleanObject(varName);
  this.cursor.type = this.cleanNodeValue(varType);
  this.cursor.result = this.cleanObject(resultVarName);
  return this;
};

WOQLQuery.prototype.cast = WOQLQuery.prototype.typecast;

/**
 * Orders the results of the contained subquery by a precedence list of variables
 * @param  {...string|...Var|...array} orderedVarlist - A sequence of variables,
 * by which to order the results,
 * each optionally followed by either “asc” or “desc” to represent order as a list, by default
 * it will sort the variable in ascending order
 * @returns  {WOQLQuery} A WOQLQuery which contains the ordering expression
 */
WOQLQuery.prototype.order_by = function (...orderedVarlist) {
  // if (orderedVarlist && orderedVarlist[0] === 'args')
  // return ['variable_ordering', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'OrderBy';
  this.cursor.ordering = [];

  if (!orderedVarlist || orderedVarlist.length === 0) {
    return this.parameterError(
      'Order by must be passed at least one variables to order the query',
    );
  }
  const embedquery = typeof orderedVarlist[orderedVarlist.length - 1] === 'object'
    && orderedVarlist[orderedVarlist.length - 1].json
    ? orderedVarlist.pop()
    : false;

  for (let i = 0; i < orderedVarlist.length; i++) {
    let obj;
    if ((typeof orderedVarlist[i] === 'string' || orderedVarlist[i] instanceof Var) && orderedVarlist[i] !== '') {
      obj = {
        '@type': 'OrderTemplate',
        variable: this.rawVar(orderedVarlist[i]),
        order: 'asc',
      };
    } else if (orderedVarlist[i].length === 2 && orderedVarlist[i][1] === 'asc') {
      obj = {
        '@type': 'OrderTemplate',
        variable: this.rawVar(orderedVarlist[i][0]),
        order: 'asc',
      };
    } else if (orderedVarlist[i].length === 2 && orderedVarlist[i][1] === 'desc') {
      obj = {
        '@type': 'OrderTemplate',
        variable: this.rawVar(orderedVarlist[i][0]),
        order: 'desc',
      };
    }

    if (obj) this.cursor.ordering.push(obj);
  }
  return this.addSubQuery(embedquery);
};

/**
 *
 * Groups the results of the contained subquery on the basis of identical values for Groupvars,
 * extracts the patterns defined in PatternVars and stores the results in GroupedVar
 * @param {array|string|Var} gvarlist - Either a single variable or an array of variables
 * @param {array|string|Var} groupedvar - Either a single variable or an array of variables
 * @param {string|Var} output - output variable name
 * @param {WOQLQuery} [groupquery] - The query whose results will be grouped
 * @returns {WOQLQuery} A WOQLQuery which contains the grouping expression
 */

WOQLQuery.prototype.group_by = function (gvarlist, groupedvar, output, groupquery) {
  // if (gvarlist && gvarlist === 'args')
  // return ['group_by', 'group_template', 'grouped', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'GroupBy';
  this.cursor.group_by = [];

  if (typeof gvarlist === 'string' || gvarlist instanceof Var) gvarlist = [gvarlist];
  this.cursor.group_by = this.rawVarList(gvarlist);
  if (typeof groupedvar === 'string' || groupedvar instanceof Var) groupedvar = [groupedvar];
  this.cursor.template = this.rawVarList(groupedvar);
  this.cursor.grouped = this.varj(output);
  return this.addSubQuery(groupquery);
};

/**
 * Collects all solutions of a sub-query into a list.
 * Completes the list/binding symmetry alongside member:
 * - Member: List → Bindings (destructure)
 * - Collect: Bindings → List (gather)
 *
 * @param {string|Var|array} template - A variable, or an array of variables, specifying what to
 * collect from each solution
 * @param {string|Var} into - Variable that will be bound to the collected list
 * @param {WOQLQuery} [subquery] - The query whose solutions will be collected
 * @returns {WOQLQuery} A WOQLQuery which contains the collect expression
 */
WOQLQuery.prototype.collect = function (template, into, subquery) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Collect';
  if (typeof template === 'string' || template instanceof Var) template = [template];
  this.cursor.template = this.rawVarList(template);
  this.cursor.into = this.varj(into);
  return this.addSubQuery(subquery);
};

/**
 * A function that always matches, always returns true
 * @returns {WOQLQuery} A WOQLQuery object containing the true value that will match any pattern
 */
WOQLQuery.prototype.true = function () {
  this.cursor['@type'] = 'True';
  return this;
};

/**
 * Performs a path regular expression match on the graph
 * @param {string|Var} subject -  An IRI or variable that refers to an IRI representing the subject,
 * i.e. the starting point of the path
 * @param {string} pattern -(string) - A path regular expression describing a pattern through
 * multiple edges of the graph (see: https://terminusdb.com/docs/path-query-reference-guide)
 * @param {string|Var} object - An IRI or variable that refers to an IRI representing the object,
 * i.e. ending point of the path
 * @param {string|Var} [resultVarName] - A variable in which the actual paths
 * traversed will be stored
 * @returns {WOQLQuery} - A WOQLQuery which contains the path regular expression matching expression
 */

WOQLQuery.prototype.path = function (subject, pattern, object, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Path';
  this.cursor.subject = this.cleanSubject(subject);
  if (typeof pattern === 'string') pattern = this.compilePathPattern(pattern);
  this.cursor.pattern = pattern;
  this.cursor.object = this.cleanObject(object);
  if (typeof resultVarName !== 'undefined') {
    this.cursor.path = this.varj(resultVarName);
  }
  return this;
};

/**
 * Extract the value of a key in a bound document.
 * @param {string|Var} document - Document which is being accessed.
 * @param {string|Var} field - The field from which the document which is being accessed.
 * @param {string|Var} value - The value for the document and field.
 * @returns {WOQLQuery} A WOQLQuery which contains the a dot Statement
 */

WOQLQuery.prototype.dot = function (document, field, value) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Dot';
  this.cursor.document = this.expandValueVariable(document);
  this.cursor.field = this.cleanDataValue(field, 'xsd:string');
  this.cursor.value = this.expandValueVariable(value);
  return this;
};

/**
 * Calculates the size in bytes of the contents of the resource identified in ResourceID
 * @param {string|Var} resourceId - A valid resource identifier string (can refer to any graph /
 * branch / commit / db)
 * @param {string|Var} resultVarName - The variable name
 */

WOQLQuery.prototype.size = function (resourceId, resultVarName) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Size';
  this.cursor.resource = this.cleanGraph(resourceId);
  this.cursor.size = this.varj(resultVarName);
  return this;
};

/**
 *
 * Calculates the number of triples of the contents of the resource identified in ResourceID
 * @param {string|Var} resourceId - A valid resource identifier string (can refer to any graph /
 * branch / commit / db)
 * @param {string|number|Var} tripleCount - An integer literal with the size in bytes or a
 * variable containing that integer
 * @returns {WOQLQuery} A WOQLQuery which contains the size expression
 */
WOQLQuery.prototype.triple_count = function (resourceId, TripleCount) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'TripleCount';
  this.cursor.resource = this.cleanGraph(resourceId);
  this.cursor.count = this.varj(TripleCount);
  return this;
};

/**
 * Returns true if 'elementId' is of type 'elementType', according to the current DB schema
 * @param {string|Var} elementId - the id of a schema graph element
 * @param {string|Var} elementType - the element type
 * @returns {WOQLQuery} A WOQLQuery object containing the type_of pattern matching rule
 */

WOQLQuery.prototype.type_of = function (elementId, elementType) {
  if (!elementId || !elementType) return this.parameterError('type_of takes two parameters, both values');
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'TypeOf';
  this.cursor.value = this.cleanObject(elementId);
  this.cursor.type = this.cleanSubject(elementType);
  return this;
};

module.exports = WOQLQuery;
