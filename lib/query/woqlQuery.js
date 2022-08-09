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
const WOQLQuery = require('./woqlCore');
const { Var, Doc } = require('./woqlDoc');

// I HAVE TO REVIEW THE Inheritance and the prototype chain
/* class WOQLQuery extends WOQLCore {
    constructor(query) {
        super(query)
    }
} */

WOQLQuery.prototype.read_document = function (IRI, OutputVar) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'ReadDocument';
  this.cursor.identifier = this.cleanNodeValue(IRI);
  this.cursor.document = this.expandValueVariable(OutputVar);
  return this;
};

WOQLQuery.prototype.insert_document = function (docjson, IRI) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'InsertDocument';
  if (typeof IRI !== 'undefined') this.cursor.identifier = this.cleanNodeValue(IRI);

  this.cursor.document = this.cleanObject(docjson);

  return this.updated();
};

WOQLQuery.prototype.update_document = function (docjson, IRI) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'UpdateDocument';
  if (typeof IRI !== 'undefined') this.cursor.identifier = this.cleanNodeValue(IRI);

  this.cursor.document = this.cleanObject(docjson);

  return this.updated();
};

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

WOQLQuery.prototype.using = function (Collection, Subq) {
  // if (Collection && Collection === 'args')
  // return ['collection', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Using';
  if (!Collection || typeof Collection !== 'string') {
    return this.parameterError('The first parameter to using must be a Collection ID (string)');
  }
  this.cursor.collection = Collection;
  return this.addSubQuery(Subq);
};

WOQLQuery.prototype.comment = function (comment, Subq) {
  // if (comment && comment === 'args')
  // return ['comment', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Comment';
  this.cursor.comment = this.jlt(comment);
  return this.addSubQuery(Subq);
};

WOQLQuery.prototype.select = function (...list) {
  // if (list && list[0] === 'args')
  // return ['variable_list', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Select';
  if (!list || list.length <= 0) {
    return this.parameterError('Select must be given a list of variable names');
  }
  const last = list[list.length - 1];
  /**
     *@type {any}
     */
  let embedquery = false;
  if (typeof last === 'object' && last.json) {
    embedquery = list.pop();
  } // else var embedquery = false
  this.cursor.variables = this.rawVarList(list);
  return this.addSubQuery(embedquery);
};

WOQLQuery.prototype.distinct = function (...list) {
  // if (list && list[0] === 'args')
  // return ['variable_list', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Distinct';
  if (!list || list.length <= 0) {
    return this.parameterError('Distinct must be given a list of variable names');
  }
  const last = list[list.length - 1];
  /**
     * @type {any}
     */
  let embedquery = false;
  if (typeof last === 'object' && last.json) {
    embedquery = list.pop();
  } // else var embedquery = false
  this.cursor.variables = this.rawVarList(list);
  return this.addSubQuery(embedquery);
};

WOQLQuery.prototype.and = function (...queries) {
  if (this.cursor['@type'] && this.cursor['@type'] !== 'And') {
    const nj = new WOQLQuery().json(this.cursor);
    for (const k in this.cursor) delete this.cursor[k];
    queries.unshift(nj);
  }
  this.cursor['@type'] = 'And';
  if (typeof this.cursor.and === 'undefined') this.cursor.and = [];
  for (let i = 0; i < queries.length; i++) {
    const onevar = this.jobj(queries[i]);
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

WOQLQuery.prototype.or = function (...queries) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Or';
  if (typeof this.cursor.or === 'undefined') this.cursor.or = [];
  for (let i = 0; i < queries.length; i++) {
    const onevar = this.jobj(queries[i]);
    this.cursor.or.push(onevar);
  }
  return this;
};

WOQLQuery.prototype.from = function (graph, query) {
  // if (graph && graph === 'args')
  // return ['graph', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'From';
  if (!graph || typeof graph !== 'string') {
    return this.parameterError(
      'The first parameter to from must be a Graph Filter Expression (string)',
    );
  }
  this.cursor.graph = graph;
  return this.addSubQuery(query);
};

WOQLQuery.prototype.into = function (graph_descriptor, query) {
  // if (graph_descriptor && graph_descriptor === 'args')
  // return ['graph', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Into';
  if (!graph_descriptor || typeof graph_descriptor !== 'string') {
    return this.parameterError(
      'The first parameter to from must be a Graph Filter Expression (string)',
    );
  }
  this.cursor.graph = this.jlt(graph_descriptor);
  return this.addSubQuery(query);
};

WOQLQuery.prototype.triple = function (a, b, c) {
  // if (a && a === 'args')
  // return ['subject', 'predicate', 'object']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Triple';
  this.cursor.subject = this.cleanSubject(a);
  this.cursor.predicate = this.cleanPredicate(b);
  this.cursor.object = this.cleanObject(c);
  return this;
};

WOQLQuery.prototype.added_triple = function (a, b, c) {
  // if (a && a === 'args')
  // return ['subject', 'predicate', 'object']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'AddedTriple';
  this.cursor.subject = this.cleanSubject(a);
  this.cursor.predicate = this.cleanPredicate(b);
  this.cursor.object = this.cleanObject(c);
  return this;
};

WOQLQuery.prototype.removed_triple = function (a, b, c) {
  // if (a && a === 'args')
  // return ['subject', 'predicate', 'object']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'DeletedTriple';
  this.cursor.subject = this.cleanSubject(a);
  this.cursor.predicate = this.cleanPredicate(b);
  this.cursor.object = this.cleanObject(c);
  return this;
};

WOQLQuery.prototype.link = function (a, b, c) {
  // if (a && a === 'args')
  // return ['subject', 'predicate', 'object']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Triple';
  this.cursor.subject = this.cleanSubject(a);
  this.cursor.predicate = this.cleanPredicate(b);
  this.cursor.object = this.cleanSubject(c);
  return this;
};

WOQLQuery.prototype.value = function (a, b, c) {
  // if (a && a === 'args')
  // return ['subject', 'predicate', 'object']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Triple';
  this.cursor.subject = this.cleanSubject(a);
  this.cursor.predicate = this.cleanPredicate(b);
  this.cursor.object = this.cleanDataValue(c, 'xsd:string');
  return this;
};

/**
 * @description Creates a pattern matching rule for a quad [Subject, Predicate, Object, Graph]
 * or for a triple [Subject, Predicate, Object]
 * add extra information about the type of the value object
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string | number | boolean} objValue - an specific value
 * @param {string} [graph] - specify a graph type, default is instance schema|instance
 */
/* WOQLQuery.prototype.value = function (subject, predicate, objValue, graph) {
  if (typeof objValue === 'string') {
    objValue = this.string(objValue);
  } else if (typeof objValue === 'number') {
    objValue = this.literal(objValue, 'xsd:decimal');
  } else if (typeof objValue === 'boolean') {
    objValue = this.literal(objValue, 'xsd:boolean');
  }
  if (graph) {
    return this.quad(subject, predicate, objValue, graph);
  }
  return this.triple(subject, predicate, objValue);
};

WOQLQuery.prototype.link = function (a, b, c, g) {
  if (typeof c === 'string') {
    c = this.iri(c);
  }
  if (g) {
    return this.quad(a, b, c, g);
  }
  return this.triple(a, b, c);
}; */

WOQLQuery.prototype.quad = function (a, b, c, g) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(a, b, c);
  // if (a && a === 'args')
  // return args.concat(['graph'])
  if (!g) return this.parameterError('Quad takes four parameters, the last should be a graph filter');
  this.cursor['@type'] = 'Triple';
  this.cursor.graph = this.cleanGraph(g);
  return this;
};

WOQLQuery.prototype.added_quad = function (a, b, c, g) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(a, b, c);
  // if (a && a === 'args')
  // return args.concat(['graph'])
  if (!g) return this.parameterError('Quad takes four parameters, the last should be a graph filter');
  this.cursor['@type'] = 'AddedQuad';
  this.cursor.graph = this.cleanGraph(g);
  return this;
};

WOQLQuery.prototype.removed_quad = function (a, b, c, g) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(a, b, c);
  // if (a && a === 'args')
  // return args.concat(['graph'])
  if (!g) return this.parameterError('Quad takes four parameters, the last should be a graph filter');
  this.cursor['@type'] = 'RemovedQuad';
  this.cursor.graph = this.cleanGraph(g);
  return this;
};

WOQLQuery.prototype.sub = function (a, b) {
  // if (a && a === 'args')
  // return ['parent', 'child']
  if (!a || !b) return this.parameterError('Subsumption takes two parameters, both URIs');
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Subsumption';
  this.cursor.parent = this.cleanNodeValue(a);
  this.cursor.child = this.cleanNodeValue(b);
  return this;
};

WOQLQuery.prototype.subsumption = WOQLQuery.prototype.sub;

WOQLQuery.prototype.eq = function (a, b) {
  // if (a && a === 'args') return ['left', 'right']
  if (typeof a === 'undefined' || typeof b === 'undefined') return this.parameterError('Equals takes two parameters');
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Equals';
  this.cursor.left = this.cleanObject(a);
  this.cursor.right = this.cleanObject(b);
  return this;
};

WOQLQuery.prototype.equals = WOQLQuery.prototype.eq;

WOQLQuery.prototype.substr = function (String, Before, Length, After, SubString) {
  // if (String && String === 'args')
  // return ['string', 'before', 'length', 'after', 'substring']
  if (!SubString) {
    SubString = After;
    After = 0;
  }
  if (!SubString) {
    SubString = Length;
    Length = SubString.length + Before;
  }
  if (!String || !SubString || typeof SubString !== 'string') {
    return this.parameterError(
      'Substr - the first and last parameters must be strings representing the full and substring variables / literals',
    );
  }
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Substring';
  this.cursor.string = this.cleanDataValue(String, 'xsd:string');
  this.cursor.before = this.cleanDataValue(Before, 'xsd:nonNegativeInteger');
  this.cursor.length = this.cleanDataValue(Length, 'xsd:nonNegativeInteger');
  this.cursor.after = this.cleanDataValue(After, 'xsd:nonNegativeInteger');
  this.cursor.substring = this.cleanDataValue(SubString, 'xsd:string');
  return this;
};

WOQLQuery.prototype.substring = WOQLQuery.prototype.substr;

/**
 * Takes an as structure
 */
WOQLQuery.prototype.get = function (asvars, query_resource) {
  // if (asvars && asvars === 'args')
  // return ['as_vars', 'query_resource']
  this.cursor['@type'] = 'Get';
  this.cursor.columns = asvars.json ? asvars.json() : new WOQLQuery().as(...asvars).json();
  if (query_resource) {
    this.cursor.resource = this.jobj(query_resource);
  } else {
    this.cursor.resource = {};
  }
  this.cursor = this.cursor.resource;
  return this;
};

/**
 * Takes an array of variables, an optional array of column names
 */
WOQLQuery.prototype.put = function (asvars, query, query_resource) {
  // if (asvars && asvars === 'args')
  // return ['as_vars', 'query', 'query_resource']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Put';
  if (Array.isArray(asvars) && typeof asvars[0] !== 'object') {
    const nasvars = [];
    for (let i = 0; i < asvars.length; i++) {
      const iasv = this.asv(i, asvars[i]);
      nasvars.push(iasv);
      this.cursor.columns = nasvars;
    }
  } else {
    this.cursor.columns = asvars.json
      ? asvars.json()
      : new WOQLQuery().as(...asvars).json();
  }
  this.cursor.query = this.jobj(query);
  if (query_resource) {
    this.cursor.resource = this.jobj(query_resource);
  } else {
    this.cursor.resource = {};
  }
  this.cursor = this.cursor.resource;
  return this;
};

/**
 * Forms
 *   1. indexedasvars
 *   2. namedasvars
 *
 * Imports the value identified by Source to a Target variable
 *
 * Examples:
 *
 *   WOQL.as("first var", "v:First_Var", "string").as("second var", "v:Second_Var")
 *
 *   WOQL.as(["first var", "v:First_Var", "string"], ["second var", "v:Second_Var"])
 *
 *   let [First_Var,Second_Var] = WOQL.vars("First_Var","Second_Var")
 *   WOQL.as("first var", First_Var, "string").as("second var", Second_Var)
 *
 * @param {...(array|string)} varList variable number of arguments
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

WOQLQuery.prototype.file = function (fpath, opts) {
  // if (fpath && fpath == 'args') return ['file', 'format']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'QueryResource';
  this.cursor.source = { '@type': 'Source', file: fpath };
  this.cursor.format = 'csv'; // hard coded for now
  if (typeof opts !== 'undefined') this.cursor.options = opts;
  return this;
};

WOQLQuery.prototype.remote = function (uri, opts) {
  // if (uri && uri == 'args') return ['remote_uri', 'format']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'QueryResource';
  this.cursor.source = { '@type': 'Source', url: uri };
  this.cursor.format = 'csv'; // hard coded for now
  if (typeof opts !== 'undefined') this.cursor.options = opts;
  return this;
};

WOQLQuery.prototype.post = function (fpath, opts, source = 'post') {
  // if (fpath && fpath == 'args') return ['file', 'format']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'QueryResource';
  this.cursor.source = { '@type': 'Source', [source]: fpath };
  this.cursor.format = 'csv'; // hard coded for now
  this.cursor.options = opts;
  if (typeof opts !== 'undefined') this.cursor.options = opts;
  return this;
};

WOQLQuery.prototype.delete_triple = function (Subject, Predicate, Object_or_Literal) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(Subject, Predicate, Object_or_Literal);
  // if (Subject && Subject == 'args') return args
  this.cursor['@type'] = 'DeleteTriple';
  return this.updated();
};

WOQLQuery.prototype.add_triple = function (Subject, Predicate, Object_or_Literal) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(Subject, Predicate, Object_or_Literal);
  // if (Subject && Subject == 'args') return args
  this.cursor['@type'] = 'AddTriple';
  return this.updated();
};

WOQLQuery.prototype.delete_quad = function (a, b, c, g) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(a, b, c);
  // if (a && a == 'args') return args.concat(['graph'])
  if (!g) {
    return this.parameterError(
      'Delete Quad takes four parameters, the last should be a graph id',
    );
  }
  this.cursor['@type'] = 'DeleteTriple';
  this.cursor.graph = this.cleanGraph(g);
  return this.updated();
};

WOQLQuery.prototype.add_quad = function (a, b, c, g) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  const args = this.triple(a, b, c);
  // if (a && a == 'args') return args.concat(['graph'])
  if (!g) return this.parameterError('Add Quad takes four parameters, the last should be a graph id');
  this.cursor['@type'] = 'AddTriple';
  this.cursor.graph = this.cleanGraph(g);
  return this.updated();
};

WOQLQuery.prototype.trim = function (untrimmed, trimmed) {
  // if (untrimmed && untrimmed == 'args')
  // return ['untrimmed', 'trimmed']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Trim';
  this.cursor.untrimmed = this.cleanDataValue(untrimmed);
  this.cursor.trimmed = this.cleanDataValue(trimmed);
  return this;
};

WOQLQuery.prototype.eval = function (arith, res) {
  // if (arith && arith == 'args')
  // return ['expression', 'result']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Eval';
  this.cursor.expression = arith.json ? arith.json() : arith;
  this.cursor.result = this.cleanArithmeticValue(res);
  return this;
};

WOQLQuery.prototype.plus = function (...args) {
  // if (args && args[0] == 'args') return ['first', 'second']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Plus';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().plus(...args));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

WOQLQuery.prototype.minus = function (...args) {
  // if (args && args[0] === 'args') return ['first', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Minus';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().minus(...args));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

WOQLQuery.prototype.times = function (...args) {
  // if (args && args[0] === 'args') return ['first', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Times';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().times(...args));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

WOQLQuery.prototype.divide = function (...args) {
  // if (args && args[0] === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Divide';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().divide(...args));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

WOQLQuery.prototype.div = function (...args) {
  // if (args && args[0] === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Div';
  this.cursor.left = this.arop(args.shift());
  if (args.length > 1) {
    this.cursor.right = this.jobj(new WOQLQuery().div(...args));
  } else {
    this.cursor.right = this.arop(args[0]);
  }
  return this;
};

WOQLQuery.prototype.exp = function (a, b) {
  // if (a && a === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Exp';
  this.cursor.left = this.arop(a);
  this.cursor.right = this.arop(b);
  return this;
};

WOQLQuery.prototype.floor = function (a) {
  // if (a && a === 'args') return ['argument']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Floor';
  this.cursor.argument = this.arop(a);
  return this;
};

WOQLQuery.prototype.isa = function (a, b) {
  // if (a && a === 'args') return ['element', 'of_type']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'IsA';
  this.cursor.element = this.cleanNodeValue(a);
  this.cursor.type = this.cleanNodeValue(b);
  return this;
};

WOQLQuery.prototype.like = function (a, b, dist) {
  // if (a && a === 'args')
  // return ['left', 'right', 'like_similarity']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Like';
  this.cursor.left = this.cleanDataValue(a, 'xsd:string');
  this.cursor.right = this.cleanDataValue(b, 'xsd:string');
  if (dist) {
    this.cursor.similarity = this.cleanDataValue(dist, 'xsd:decimal');
  }
  return this;
};

WOQLQuery.prototype.less = function (v1, v2) {
  // if (v1 && v1 === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Less';
  this.cursor.left = this.cleanDataValue(v1);
  this.cursor.right = this.cleanDataValue(v2);
  return this;
};

WOQLQuery.prototype.greater = function (v1, v2) {
  // if (v1 && v1 === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Greater';
  this.cursor.left = this.cleanDataValue(v1);
  this.cursor.right = this.cleanDataValue(v2);
  return this;
};

WOQLQuery.prototype.opt = function (query) {
  // if (query && query === 'args') return ['query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Optional';
  this.addSubQuery(query);
  return this;
};

WOQLQuery.prototype.optional = WOQLQuery.prototype.opt;

WOQLQuery.prototype.unique = function (prefix, vari, type) {
  // if (prefix && prefix === 'args')
  // return ['base', 'key_list', 'uri']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'HashKey';
  this.cursor.base = this.cleanDataValue(prefix, 'xsd:string');
  this.cursor.key_list = this.cleanDataValue(vari);
  this.cursor.uri = this.cleanNodeValue(type);
  return this;
};

/**
 * example WOQL.idgen("doc:Journey",["v:Start_ID","v:Start_Time","v:Bike"],"v:Journey_ID"),
 *
 * Generates the node's ID combined the variable list with a specific prefix (URL base).
 * If the input variables's values are the same, the output value will be the same.
 * @param {string} prefix
 * @param {string |array}  inputVarList the variable input list for generate the id
 * @param {string} outputVar  the output variable name
 */

WOQLQuery.prototype.idgen = function (prefix, inputVarList, outputVar) {
  // if (prefix && prefix === 'args')
  // return ['base', 'key_list', 'uri']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'LexicalKey';
  this.cursor.base = this.cleanDataValue(prefix, 'xsd:string');
  // this.cursor['base'] = this.cleanObject(this.string(prefix))
  this.cursor.key_list = this.dataValueList(inputVarList);
  this.cursor.uri = this.cleanNodeValue(outputVar);
  return this;
};

WOQLQuery.prototype.idgenerator = WOQLQuery.prototype.idgen;

WOQLQuery.prototype.upper = function (l, u) {
  // if (l && l === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Upper';
  this.cursor.mixed = this.cleanDataValue(l);
  this.cursor.upper = this.cleanDataValue(u);
  return this;
};

WOQLQuery.prototype.lower = function (u, l) {
  // if (u && u === 'args') return ['left', 'right']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Lower';
  this.cursor.mixed = this.cleanDataValue(u);
  this.cursor.lower = this.cleanDataValue(l);
  return this;
};

WOQLQuery.prototype.pad = function (input, pad, len, output) {
  // if (input && input === 'args')
  // return ['pad_string', 'pad_char', 'pad_times', 'pad_result']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Pad';
  this.cursor.string = this.cleanDataValue(input);
  this.cursor.char = this.cleanDataValue(pad);
  this.cursor.times = this.cleanDataValue(len, 'xsd:integer');
  this.cursor.result = this.cleanDataValue(output);
  return this;
};

WOQLQuery.prototype.split = function (input, glue, output) {
  // if (input && input === 'args')
  // return ['split_string', 'split_pattern', 'split_list']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Split';
  this.cursor.string = this.cleanDataValue(input);
  this.cursor.pattern = this.cleanDataValue(glue);
  this.cursor.list = this.cleanDataValue(output);
  return this;
};

WOQLQuery.prototype.member = function (El, List) {
  // if (El && El === 'args') return ['member', 'member_list']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Member';
  this.cursor.member = this.cleanObject(El);
  this.cursor.list = this.valueList(List);
  return this;
};

WOQLQuery.prototype.concat = function (list, v) {
  // ) return ['concat_list', 'concatenated']
  if (typeof list === 'string') {
    const slist = list.split(/(v:)/);
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
    list = nlist;
  }
  if (Array.isArray(list)) {
    if (this.cursor['@type']) this.wrapCursorWithAnd();
    this.cursor['@type'] = 'Concatenate';
    this.cursor.list = this.cleanDataValue(list, true);
    this.cursor.result = this.cleanDataValue(v);
  }
  return this;
};

WOQLQuery.prototype.concatenate = WOQLQuery.prototype.concat;

WOQLQuery.prototype.join = function (input, glue, output) {
  // if (input && input === 'args')
  // return ['join_list', 'join_separator', 'join']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Join';
  this.cursor.list = this.cleanDataValue(input);
  this.cursor.separator = this.cleanDataValue(glue);
  this.cursor.result = this.cleanDataValue(output);
  return this;
};

WOQLQuery.prototype.sum = function (input, output) {
  // if (input && input === 'args') return ['sum_list', 'sum']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Sum';
  this.cursor.list = this.cleanDataValue(input);
  this.cursor.result = this.cleanObject(output);
  return this;
};

WOQLQuery.prototype.start = function (start, query) {
  // if (start && start === 'args') return ['start', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Start';
  this.cursor.start = start;
  return this.addSubQuery(query);
};

WOQLQuery.prototype.limit = function (limit, query) {
  // if (limit && limit === 'args') return ['limit', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Limit';
  this.cursor.limit = limit;
  return this.addSubQuery(query);
};

WOQLQuery.prototype.re = function (p, s, m) {
  // if (p && p === 'args')
  // return ['pattern', 'regexp_string', 'regexp_list']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Regexp';
  this.cursor.pattern = this.cleanDataValue(p);
  this.cursor.string = this.cleanDataValue(s);
  this.cursor.result = this.cleanDataValue(m);
  return this;
};

WOQLQuery.prototype.regexp = WOQLQuery.prototype.re;

WOQLQuery.prototype.length = function (va, vb) {
  // if (va && va === 'args')
  // return ['length_list', 'length']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Length';
  this.cursor.list = this.cleanDataValue(va);
  if (typeof vb === 'number') {
    this.cursor.length = this.cleanObject(vb, 'xsd:nonNegativeInteger');
  } else if (typeof vb === 'string') {
    this.cursor.length = this.varj(vb);
  }
  return this;
};

/**
 * Negation of passed or chained query
 */
WOQLQuery.prototype.not = function (query) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Not';
  return this.addSubQuery(query);
};

/**
 * Results in one solution of the subqueries
 */
WOQLQuery.prototype.once = function (query) {
  // if (query && query === 'args') return ['query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Once';
  return this.addSubQuery(query);
};

/**
 * Immediately run without backtracking
 */
WOQLQuery.prototype.immediately = function (query) {
  // if (query && query === 'args') return ['query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Immediately';
  return this.addSubQuery(query);
};

/**
 * Count of query
 */
WOQLQuery.prototype.count = function (countvar, query) {
  // if (countvar && countvar === 'args')
  // return ['count', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Count';
  this.cursor.count = this.cleanObject(countvar);
  return this.addSubQuery(query);
};

WOQLQuery.prototype.cast = function (val, type, vb) {
  // if (val && val === 'args')
  // return ['typecast_value', 'typecast_type', 'typecast_result']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Typecast';
  this.cursor.value = this.cleanObject(val);
  this.cursor.type = this.cleanNodeValue(type);
  this.cursor.result = this.cleanObject(vb);
  return this;
};

WOQLQuery.prototype.typecast = WOQLQuery.prototype.cast;
/*
{ "@id" : "OrderBy",
  "@type" : "Class",
  "@key" : { "@type" : "ValueHash" },
  "@inherits" : "Query",
  "ordering" : { "@type" : "List",
                 "@class" : "xsd:string" },
  "ascending" : { "@type" : "Optional",
                  "@class" : "Unit" } }
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
    if (typeof orderedVarlist[i] === 'string' && orderedVarlist[i] !== '') {
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

WOQLQuery.prototype.group_by = function (gvarlist, groupedvar, output, groupquery) {
  // if (gvarlist && gvarlist === 'args')
  // return ['group_by', 'group_template', 'grouped', 'query']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'GroupBy';
  this.cursor.group_by = [];

  if (typeof gvarlist === 'string') gvarlist = [gvarlist];
  this.cursor.group_by = this.rawVarList(gvarlist);
  if (typeof groupedvar === 'string') groupedvar = [groupedvar];
  this.cursor.template = this.rawVarList(groupedvar);
  this.cursor.grouped = this.varj(output);
  return this.addSubQuery(groupquery);
};

WOQLQuery.prototype.true = function () {
  this.cursor['@type'] = 'True';
  return this;
};

WOQLQuery.prototype.path = function (Subject, Pattern, Object, Path) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Path';
  this.cursor.subject = this.cleanSubject(Subject);
  if (typeof Pattern === 'string') Pattern = this.compilePathPattern(Pattern);
  this.cursor.pattern = Pattern;
  this.cursor.object = this.cleanObject(Object);
  if (typeof Path !== 'undefined') {
    this.cursor.path = this.varj(Path);
  }
  return this;
};

WOQLQuery.prototype.dot = function (Document, Field, Value) {
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Dot';
  this.cursor.document = this.expandValueVariable(Document);
  this.cursor.field = this.cleanDataValue(Field, 'xsd:string');
  this.cursor.value = this.expandValueVariable(Value);
  return this;
};

WOQLQuery.prototype.size = function (Graph, Size) {
  // if (Graph && Graph === 'args')
  // return ['resource', 'size']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'Size';
  this.cursor.resource = this.cleanGraph(Graph);
  this.cursor.size = this.varj(Size);
  return this;
};

/*
{ "@id" : "TripleCount",
  "@type" : "Class",
  "@key" : { "@type" : "ValueHash" },
  "@inherits" : "Query",
  "resource" : "xsd:string",
  "count" : "DataValue" } */

WOQLQuery.prototype.triple_count = function (Graph, TripleCount) {
  // if (Graph && Graph === 'args')
  // return ['resource', 'triple_count']
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'TripleCount';
  this.cursor.resource = this.cleanGraph(Graph);
  this.cursor.count = this.varj(TripleCount);
  return this;
};

WOQLQuery.prototype.type_of = function (a, b) {
  // if (a && a === 'args') return ['value', 'type']
  if (!a || !b) return this.parameterError('type_of takes two parameters, both values');
  if (this.cursor['@type']) this.wrapCursorWithAnd();
  this.cursor['@type'] = 'TypeOf';
  this.cursor.value = this.cleanObject(a);
  this.cursor.type = this.cleanSubject(b);
  return this;
};

module.exports = WOQLQuery;
