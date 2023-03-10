/* eslint-disable no-underscore-dangle */
/* eslint-disable no-use-before-define */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-unused-vars */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-redeclare */
/* eslint-disable no-plusplus */
/* eslint-disable block-scoped-var */
/* eslint-disable no-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-param-reassign */
/// /@ts-check
const UTILS = require('../utils');
const WOQLPrinter = require('./woqlPrinter');
const { Var, Vars, Doc } = require('./woqlDoc');

// eslint-disable-next-line no-unused-vars
const typedef = require('../typedef');

/**
 * defines the internal functions of the woql query object - the
 * language API is defined in WOQLQuery
 * @module WOQLQuery
 * @constructor
 * @param {object} [query] json-ld query for initialisation
 * @returns {WOQLQuery}
 */
/* function WOQLQuery(query) {
  this.query = query || {};
  this.errors = [];
  this.cursor = this.query;
  this.chain_ended = false;
  this.contains_update = false;
  // operators which preserve global paging
  this.paging_transitive_properties = ['select', 'from', 'start', 'when', 'opt', 'limit'];

  this.update_operators = [
    'AddTriple',
    'DeleteTriple',
    'AddQuad',
    'DeleteQuad',
    'InsertDocument',
    'DeleteDocument',
    'UpdateDocument',
  ];

  this.vocab = this.loadDefaultVocabulary();
  // object used to accumulate triples from fragments to support usage like node("x").label("y");
  this.tripleBuilder = false;
  return this;
} */

class WOQLQuery {
  triple_builder_context = {};

  query = null;

  counter = 1;

  errors = [];

  cursor = {};

  chain_ended = false;

  contains_update = false;

  // operators which preserve global paging
  paging_transitive_properties = ['select', 'from', 'start', 'when', 'opt', 'limit'];

  update_operators = [
    'AddTriple',
    'DeleteTriple',
    'AddQuad',
    'DeleteQuad',
    'InsertDocument',
    'DeleteDocument',
    'UpdateDocument',
  ];

  vocab = this.loadDefaultVocabulary();

  // object used to accumulate triples from fragments to support usage like node("x").label("y");
  tripleBuilder = false;
  /**
   * defines the internal functions of the woql query object - the
   * language API is defined in WOQLQuery
   * @module WOQLQuery
   * @constructor
   * @param {object} [query] json-ld query for initialisation
   * @returns {WOQLQuery}
   */

  constructor(query) {
    this.query = query || {};
    // this.errors = [];
    this.cursor = this.query;

    // eslint-disable-next-line no-constructor-return
    return this;
  }
}

/**
 * Basic Error handling
 */
WOQLQuery.prototype.parameterError = function (msg) {
  this.errors.push({ type: this.cursor['@type'], message: msg });
  return this;
};

WOQLQuery.prototype.hasErrors = function () {
  return this.errors.length > 0;
};

/**
 * Internal library function which adds a subquery and sets the cursor
 */
WOQLQuery.prototype.addSubQuery = function (Subq) {
  if (Subq) {
    this.cursor.query = this.jobj(Subq);
  } else {
    const nv = {};
    this.cursor.query = nv;
    this.cursor = nv;
  }
  return this;
};

/**
 * Does this query contain an update
 */
WOQLQuery.prototype.containsUpdate = function (json) {
  json = json || this.query;
  if (this.update_operators.indexOf(json['@type']) !== -1) return true;
  if (json.consequent && this.containsUpdate(json.consequent)) return true;
  if (json.query) return this.containsUpdate(json.query);
  if (json.and) {
    for (var i = 0; i < json.and.length; i++) {
      if (this.containsUpdate(json.and[i])) return true;
    }
  }
  if (json.or) {
    for (var i = 0; i < json.or.length; i++) {
      if (this.containsUpdate(json.or[i])) return true;
    }
  }

  return false;
};

/**
 * Called to inidicate that this query will cause an update to the DB
 */
WOQLQuery.prototype.updated = function () {
  this.contains_update = true;
  return this;
};

/**
 * A bunch of internal functions for formatting values for JSON-LD translation
 */

/**
 * Wraps the passed value in a json-ld literal carriage
 */
WOQLQuery.prototype.jlt = function (val, type) {
  if (!type) type = 'xsd:string';
  else type = type.indexOf(':') === -1 ? `xsd:${type}` : type;
  return { '@type': type, '@value': val };
};

WOQLQuery.prototype.varj = function (varb) {
  if (varb instanceof Var) varb = varb.name;
  if (varb.substring(0, 2) === 'v:') varb = varb.substring(2);
  if (typeof varb === 'string') {
    return {
      '@type': 'Value',
      variable: varb,
    };
  }
  return varb;
};

WOQLQuery.prototype.rawVar = function (varb) {
  if (varb instanceof Var) return varb.name;
  if (varb.substring(0, 2) === 'v:') varb = varb.substring(2);
  return varb;
};

WOQLQuery.prototype.rawVarList = function (vl) {
  const ret = [];
  for (let i = 0; i < vl.length; i++) {
    const co = this.rawVar(vl[i]);
    ret.push(co);
  }
  return ret;
};

/**
 * Transforms a javascript representation of a query into a json object if needs be
 */
WOQLQuery.prototype.jobj = function (qobj) {
  if (qobj.json) {
    return qobj.json();
  }
  if (qobj === true) return { '@type': 'True' };
  return qobj;
  // return new WOQLQuery.json(qobj);
};

/**
 * Wraps the elements of an AS variable in the appropriate json-ld
 */
WOQLQuery.prototype.asv = function (colname_or_index, variable, type) {
  const asvar = {};
  if (typeof colname_or_index === 'number') {
    asvar['@type'] = 'Column';
    asvar.indicator = { '@type': 'Indicator', index: colname_or_index };
  } else if (typeof colname_or_index === 'string') {
    asvar['@type'] = 'Column';
    asvar.indicator = { '@type': 'Indicator', name: colname_or_index };
  }
  if (variable instanceof Var) {
    asvar.variable = variable.name;
  } else if (variable.substring(0, 2) === 'v:') {
    asvar.variable = variable.substring(2);
  } else {
    asvar.variable = variable;
  }
  if (type) asvar.type = type;
  return asvar;
};

/**
 * JSON LD Format Descriptor
 * @param {object} opts
 */
WOQLQuery.prototype.wform = function (opts) {
  if (opts && opts.type) {
    this.cursor.format = {
      '@type': 'Format',
      format_type: { '@value': opts.type, '@type': 'xsd:string' },
    };
    if (typeof opts.format_header !== 'undefined') {
      const h = !!opts.format_header;
      this.cursor.format.format_header = {
        '@value': h,
        '@type': 'xsd:boolean',
      };
    }
  }
  return this;
};

/**
 * Wraps arithmetic operators in the appropriate json-ld
 */
WOQLQuery.prototype.arop = function (arg) {
  if (typeof arg === 'object') {
    return arg.json ? arg.json() : arg;
  }
  return this.cleanArithmeticValue(arg, 'xsd:decimal');
};

/**
 * takes input that can be either a string (variable name)
 * or an array - each element of the array is a member of the list
 */
WOQLQuery.prototype.dataList = function (wvar, string_only) {
  if (typeof wvar === 'string') return this.expandDataVariable(wvar, true);
  if (Array.isArray(wvar)) {
    const ret = [];
    for (let i = 0; i < wvar.length; i++) {
      const co = this.cleanDataValue(wvar[i]);
      ret.push(co);
    }
    return ret;
  }
};

/**
 * takes a list of input that can be any value
 */
WOQLQuery.prototype.valueList = function (wvar, string_only) {
  if (typeof wvar === 'string') return this.expandValueVariable(wvar, true);
  if (Array.isArray(wvar)) {
    const ret = [];
    for (let i = 0; i < wvar.length; i++) {
      let co = this.cleanObject(wvar[i]);
      if (typeof co === 'string') co = { node: co };
      ret.push(co);
    }
    return ret;
  }
};

/**
 * creates an unadorned variable name list
 */
WOQLQuery.prototype.vlist = function (list) {
  const vl = [];
  for (let i = 0; i < list.length; i++) {
    const v = this.expandValueVariable(list[i]);
    vl.push(v.variable);
  }
  return vl;
};

/**
 * Wraps data values
 */
WOQLQuery.prototype.dataValueList = function (list) {
  const dvl = [];
  for (let i = 0; i < list.length; i++) {
    const o = this.cleanDataValue(list[i]);
    dvl.push(o);
  }
  return dvl;
};

/**
 * Transforms whatever is passed in as the subject into the appropriate json-ld for variable or id
 */
WOQLQuery.prototype.cleanSubject = function (s) {
  /**
     * @type {any}
     */
  let subj = false;
  if (s instanceof Var) {
    return this.expandNodeVariable(s);
  } if (typeof s === 'object') {
    return s;
  } if (typeof s === 'string') {
    if (s.indexOf('v:') !== -1) subj = s;
    else subj = s;
    return this.expandNodeVariable(subj);
  }
  this.parameterError('Subject must be a URI string');
  return `${s}`;
};

/**
 * Transforms whatever is passed in as the predicate (id or variable) into the
 * appropriate json-ld form
 */
WOQLQuery.prototype.cleanPredicate = function (p) {
  /**
    * @type {any}
    */
  let pred = false;
  if (p instanceof Var) return this.expandNodeVariable(p);
  if (typeof p === 'object') return p;
  if (typeof p !== 'string') {
    this.parameterError('Predicate must be a URI string');
    return `${p}`;
  }
  if (p.indexOf(':') !== -1) pred = p;
  else if (this.wellKnownPredicate(p)) pred = p;// this.vocab[p]
  else pred = p;// 'scm'
  // else pred = 'scm:' + p
  return this.expandNodeVariable(pred);
};

WOQLQuery.prototype.wellKnownPredicate = function (p, noxsd) {
  if (this.vocab && this.vocab[p]) {
    const full = this.vocab[p];
    const start = full.substring(0, 3);
    if (full === 'system:abstract' || start === 'xdd' || start === 'xsd') return false;
    return true;
  }
  return false;
};

WOQLQuery.prototype.cleanPathPredicate = function (p) {
  let pred = false;
  if (p.indexOf(':') !== -1) pred = p;
  else if (this.wellKnownPredicate(p)) pred = this.vocab[p];
  else pred = p; // 'scm:' + p
  return pred;
};

/**
 * Transforms whatever is passed in as the object of
 * a triple into the appropriate json-ld form (variable, literal or id)
 */
WOQLQuery.prototype.cleanObject = function (o, t) {
  const obj = { '@type': 'Value' };
  if (o instanceof Var) {
    return this.expandValueVariable(o);
  } if (o instanceof Doc) {
    return o.encoded;
  } if (typeof o === 'string') {
    if (o.indexOf('v:') !== -1) {
      return this.expandValueVariable(o);
    }
    obj.node = o;
  } else if (typeof o === 'number') {
    t = t || 'xsd:decimal';
    obj.data = this.jlt(o, t);
  } else if (typeof o === 'boolean') {
    t = t || 'xsd:boolean';
    obj.data = this.jlt(o, t);
  } else if (typeof o === 'object' && o) {
    if (typeof o['@value'] !== 'undefined') obj.data = o;
    else return o;
  // eslint-disable-next-line no-dupe-else-if
  } else if (typeof o === 'boolean') {
    t = t || 'xsd:boolean';
    obj['woql:datatype'] = this.jlt(o, t);
  }
  return obj;
};

WOQLQuery.prototype.cleanDataValue = function (o, t) {
  const obj = { '@type': 'DataValue' };
  if (o instanceof Var) {
    return this.expandDataVariable(o);
  } if (o instanceof Doc) {
    return o.encoded;
  } if (typeof o === 'string') {
    if (o.indexOf('v:') !== -1) {
      return this.expandDataVariable(o);
    }
    obj.data = this.jlt(o, t);
  } else if (typeof o === 'number') {
    t = t || 'xsd:decimal';
    obj.data = this.jlt(o, t);
  } else if (typeof o === 'boolean') {
    t = t || 'xsd:boolean';
    obj.data = this.jlt(o, t);
  } else if (Array.isArray(o)) {
    const res = [];
    for (let i = 0; i < o.length; i++) {
      res.push(this.cleanDataValue(o[i]));
    }
    obj.list = res;
  } else if (typeof o === 'object' && o) {
    if (o['@value']) obj.data = o;
    else return o;
  }
  return obj;
};

WOQLQuery.prototype.cleanArithmeticValue = function (o, t) {
  const obj = { '@type': 'ArithmeticValue' };
  if (o instanceof Var) {
    return this.expandArithmeticVariable(o);
  } if (typeof o === 'string') {
    if (o.indexOf('v:') !== -1) {
      return this.expandArithmeticVariable(o);
    }
    obj.data = this.jlt(o, t);
  } else if (typeof o === 'number') {
    t = t || 'xsd:decimal';
    obj.data = this.jlt(o, t);
  } else if (typeof o === 'object' && o) {
    if (o['@value']) obj.data = o;
    else return o;
  }
  return obj;
};

WOQLQuery.prototype.cleanNodeValue = function (o, t) {
  const obj = { '@type': 'NodeValue' };
  if (o instanceof Var) {
    return this.expandNodeVariable(o);
  } if (typeof o === 'string') {
    if (o.indexOf('v:') !== -1) {
      return this.expandNodeVariable(o);
    }
    obj.node = o;
  } else if (typeof o === 'object' && o) {
    return o;
  }
  return obj;
};

/**
 * Transforms a graph filter or graph id into the proper json-ld form
 */
WOQLQuery.prototype.cleanGraph = function (g) {
  return g;
};

/**
 * Transforms strings that start with v: into variable json-ld structures
 * @param varname - will be transformed if it starts with v:
 */
WOQLQuery.prototype.expandVariable = function (varname, type, always) {
  if (varname instanceof Var) {
    return {
      '@type': type,
      variable: varname.name,
    };
  } if (varname.substring(0, 2) === 'v:' || always) {
    if (varname.substring(0, 2) === 'v:') varname = varname.substring(2);
    return {
      '@type': type,
      variable: varname,
    };
  }
  return {
    '@type': type,
    node: varname,
  };
};

WOQLQuery.prototype.expandValueVariable = function (varname, always) {
  return this.expandVariable(varname, 'Value', always);
};

WOQLQuery.prototype.expandNodeVariable = function (varname, always) {
  return this.expandVariable(varname, 'NodeValue', always);
};

WOQLQuery.prototype.expandDataVariable = function (varname, always) {
  return this.expandVariable(varname, 'DataValue', always);
};

WOQLQuery.prototype.expandArithmeticVariable = function (varname, always) {
  return this.expandVariable(varname, 'ArithmeticValue', always);
};

WOQLQuery.prototype.defaultContext = function (DB_IRI) {
  const def = {};
  for (const pref in UTILS.standard_urls) {
    def[pref] = UTILS.standard_urls[pref];
  }
  def.scm = `${DB_IRI}/schema#`;
  def.doc = `${DB_IRI}/data/`;
  return def;
};

/**
 * Retrieves the value of the current json-ld context
 */
WOQLQuery.prototype.getContext = function (q) {
  q = q || this.query;
  for (const prop of Object.keys(q)) {
    if (prop === '@context') return q[prop];
    if (this.paging_transitive_properties.indexOf(prop) !== -1) {
      const nq = q[prop][1];
      const nc = this.getContext(nq);
      if (nc) return nc;
    }
  }
};

/**
 * sets the value of the current json-ld context on a full query scope
 */
WOQLQuery.prototype.context = function (c) {
  this.query['@context'] = c;
};

/**
 * vocabulary elements that can be used without prefixes in woql.js queries
 */
WOQLQuery.prototype.loadDefaultVocabulary = function () {
  const vocab = {};
  // vocab.type = 'rdf:type'
  // vocab.label = 'rdfs:label'
  vocab.Class = 'owl:Class';
  vocab.DatatypeProperty = 'owl:DatatypeProperty';
  vocab.ObjectProperty = 'owl:ObjectProperty';
  vocab.Document = 'system:Document';
  vocab.abstract = 'system:abstract';
  vocab.comment = 'rdfs:comment';
  vocab.range = 'rdfs:range';
  vocab.domain = 'rdfs:domain';
  vocab.subClassOf = 'rdfs:subClassOf';
  vocab.string = 'xsd:string';
  vocab.integer = 'xsd:integer';
  vocab.decimal = 'xsd:decimal';
  vocab.boolean = 'xdd:boolean';
  vocab.email = 'xdd:email';
  vocab.json = 'xdd:json';
  vocab.dateTime = 'xsd:dateTime';
  vocab.date = 'xsd:date';
  vocab.coordinate = 'xdd:coordinate';
  vocab.line = 'xdd:coordinatePolyline';
  vocab.polygon = 'xdd:coordinatePolygon';
  return vocab;
};

/**
 * Provides the query with a 'vocabulary' a list of well known predicates that can be used without
 * prefixes mapping: id: prefix:id ...
 */
WOQLQuery.prototype.setVocabulary = function (vocab) {
  this.vocab = vocab;
};

WOQLQuery.prototype.getVocabulary = function (vocab) {
  return this.vocab;
};

/**
 * Use instead woqlclient.query('myWOQLQuery')
 * @deprecated
 * Executes the query using the passed client to connect to a server
 *
 */
WOQLQuery.prototype.execute = function (client, commit_msg) {
  return client.query(this, commit_msg);
};

/**
 * converts back and forward from json
 * if the argument is present, the current query is set to it,
 * if the argument is not present, the current json version of this query is returned
 * @param {object} [json] a query in json format
 * @returns {object}
 */
WOQLQuery.prototype.json = function (json) {
  if (json) {
    this.query = copyJSON(json);
    return this;
  }
  return copyJSON(this.query, true);
};

/**
 * Returns a script version of the query
 *
 * @param {string} [clang] - either "js" or "python"
 */
WOQLQuery.prototype.prettyPrint = function (clang = 'js') {
  const printer = new WOQLPrinter(this.vocab, clang);
  return printer.printJSON(this.query);
};

/**
 * Finds the last woql element that has a subject in it and returns the json for that
 * used for triplebuilder to chain further calls - when they may be inside ands or ors or subqueries
 * @param {object} json
 */
WOQLQuery.prototype.findLastSubject = function (json) {
  if (json && json.and) {
    for (var i = json.and.length - 1; i >= 0; i--) {
      const lqs = this.findLastSubject(json.and[i]);
      if (lqs) return lqs;
    }
  }
  if (json && json.or) {
    for (var i = json.or.length - 1; i >= 0; i--) {
      const lqs = this.findLastSubject(json.or[i]);
      if (lqs) return lqs;
    }
  }
  if (json && json.query) {
    const ls = this.findLastSubject(json.query);
    if (ls) return ls;
  }
  // check for cardinality here
  if (json && json.subject) {
    return json;
  }
  return false;
};

/**
 * Finds the last woql element that has a subject in that is a property id
 * used for triplebuilder to chain further calls - when they may be inside ands or ors or subqueries
 * @param {object} json
 */
WOQLQuery.prototype.findLastProperty = function (json) {
  if (json && json.and) {
    for (var i = json.and.length - 1; i >= 0; i--) {
      const lqs = this.findLastProperty(json.and[i]);
      if (lqs) return lqs;
    }
  }
  if (json && json.or) {
    for (var i = json.or.length - 1; i >= 0; i--) {
      const lqs = this.findLastProperty(json.or[i]);
      if (lqs) return lqs;
    }
  }
  if (json && json.query) {
    const ls = this.findLastProperty(json.query);
    if (ls) return ls;
  }
  if (
    json
        && json.subject
        && this._is_property_triple(json.predicate, json.object)
  ) {
    return json;
  }
  return false;
};

WOQLQuery.prototype._is_property_triple = function (pred, obj) {
  const pred_str = pred.node ? pred.node : pred;
  const obj_str = obj.node ? obj.node : obj;
  if (obj_str === 'owl:ObjectProperty' || obj_str === 'owl:DatatypeProperty') return true;
  if (pred_str === 'rdfs:domain' || pred_str === 'rdfs:range') return true;
  return false;
};

/**
 * Turns a textual path pattern into a JSON-LD description
 */
WOQLQuery.prototype.compilePathPattern = function (pat) {
  const toks = tokenize(pat);
  if (toks && toks.length) return tokensToJSON(toks, this);
  this.parameterError(`Pattern error - could not be parsed ${pat}`);
};

/**
 * Tokenizes the pattern into a sequence of tokens which may be clauses or operators
 * @param {string} pat
 */
function tokenize(pat) {
  let parts = getClauseAndRemainder(pat);
  const seq = [];
  while (parts.length === 2) {
    seq.push(parts[0]);
    parts = getClauseAndRemainder(parts[1]);
  }
  seq.push(parts[0]);
  return seq;
}

/**
 * Breaks a graph pattern up into two parts - the next clause, and the remainder of the string
 * @param {string} pat - graph pattern fragment
 */
function getClauseAndRemainder(pat) {
  pat = pat.trim();
  let open = 1;
  // if there is a parentheses, we treat it as a clause and go to the end
  if (pat.charAt(0) === '(') {
    for (var i = 1; i < pat.length; i++) {
      if (pat.charAt(i) === '(') open++;
      else if (pat.charAt(i) === ')') open--;
      if (open === 0) {
        const rem = pat.substring(i + 1).trim();
        if (rem) return [pat.substring(1, i), rem];
        // eslint-disable-next-line max-len
        return getClauseAndRemainder(pat.substring(1, i)); // whole thing surrounded by parentheses, strip them out and reparse
      }
    }
    return [];
  }
  if (pat[0] === '+' || pat[0] === ',' || pat[0] === '|' || pat[0] === '*') {
    const ret = [pat[0]];
    if (pat.substring(1)) ret.push(pat.substring(1));
    return ret;
  }
  if (pat.charAt(0) === '{') {
    const ret = [pat.substring(0, pat.indexOf('}') + 1)];
    if (pat.substring(pat.indexOf('}') + 1)) ret.push(pat.substring(pat.indexOf('}') + 1));
    return ret;
  }
  for (var i = 1; i < pat.length; i++) {
    if (pat[i] === ',' || pat[i] === '|' || pat[i] === '+' || pat[i] === '{' || pat[i] === '*') return [pat.substring(0, i), pat.substring(i)];
  }
  return [pat];
}

function compilePredicate(pp, q) {
  if (pp.indexOf('<') !== -1 && pp.indexOf('>') !== -1) {
    const pred = pp.slice(1, pp.length - 1);
    // eslint-disable-next-line no-multi-assign,no-constant-condition
    const cleaned = pred === '.' ? null : q.cleanPathPredicate(pred);
    return {
      '@type': 'PathOr',
      or: [{
        '@type': 'InversePathPredicate',
        predicate: cleaned,
      },
      {
        '@type': 'PathPredicate',
        predicate: cleaned,
      }],
    };
  } if (pp.indexOf('<') !== -1) {
    const pred = pp.slice(1, pp.length);
    const cleaned = pred === '.' ? null : q.cleanPathPredicate(pred);
    return { '@type': 'InversePathPredicate', predicate: cleaned };
  } if (pp.indexOf('>') !== -1) {
    const pred = pp.slice(0, pp.length - 1);
    const cleaned = pred === '.' ? null : q.cleanPathPredicate(pred);
    return { '@type': 'PathPredicate', predicate: cleaned };
  }
  const cleaned = pp === '.' ? null : q.cleanPathPredicate(pp);
  return { '@type': 'PathPredicate', predicate: cleaned };
}

/**
 * Turns a sequence of tokens into the appropriate JSON-LD
 * @param {Array} seq
 * @param {*} q
 */
function tokensToJSON(seq, q) {
  if (seq.length === 1) {
    // may need to be further tokenized
    const ntoks = tokenize(seq[0]);
    if (ntoks.length === 1) {
      // only a single element in clause - cannot be further tokenised
      const tok = ntoks[0].trim();
      return compilePredicate(tok, q);
    }
    return tokensToJSON(ntoks, q);
  } if (seq.indexOf('|') !== -1) {
    // binds most loosely
    const left = seq.slice(0, seq.indexOf('|'));
    const right = seq.slice(seq.indexOf('|') + 1);
    return {
      '@type': 'PathOr',
      or: [tokensToJSON(left, q), tokensToJSON(right, q)],
    };
  } if (seq.indexOf(',') !== -1) {
    // binds tighter
    const first = seq.slice(0, seq.indexOf(','));
    const second = seq.slice(seq.indexOf(',') + 1);
    return {
      '@type': 'PathSequence',
      sequence: [tokensToJSON(first, q), tokensToJSON(second, q)],
    };
  } if (seq[1] === '+') {
    // binds tightest of all
    return {
      '@type': 'PathPlus',
      plus: tokensToJSON([seq[0]], q),
    };
  } if (seq[1] === '*') {
    // binds tightest of all
    return {
      '@type': 'PathStar',
      star: tokensToJSON([seq[0]], q),
    };
  } if (seq[1].charAt(0) === '{') {
    // binds tightest of all
    // we need a test here
    const meat = seq[1].substring(1, seq[1].length - 1).split(',');
    return {
      '@type': 'PathTimes',
      from: meat[0],
      to: meat[1],
      times: tokensToJSON([seq[0]], q),
    };
  }
  // shouldn't get here - error
  q.parameterError(`Pattern error - could not be parsed ${seq[0]}`);
  return {
    '@type': 'PathPredicate',
    'rdfs:label': `failed to parse query ${seq[0]}`,
  };
}

/**
 * Creates a copy of the passed json representation of a woql query
 * Performing tidying up in doing so - strips out empty queries, rolls up
 * ands and ors with single entries
 *
 * @param {object} orig
 * @returns {object} copy of the passed json object
 */
function copyJSON(orig, rollup) {
  if (Array.isArray(orig)) return orig;
  if (rollup) {
    if (orig['@type'] === 'And') {
      if (!orig.and || !orig.and.length) return {};
      if (orig.and.length === 1) return copyJSON(orig.and[0], rollup);
    } else if (orig['@type'] === 'Or') {
      if (!orig.or || !orig.or.length) return {};
      if (orig.or.length === 1) return copyJSON(orig.or[0], rollup);
    }

    if (typeof orig.query !== 'undefined' && orig['@type'] !== 'Comment') {
      if (!orig.query['@type']) return {};
    } else if (orig['@type'] === 'Comment' && orig.comment) {
      if (!orig.query || !orig.query['@type']) return { '@type': 'Comment', comment: orig.comment };
    }
    if (typeof orig.consequent !== 'undefined') {
      if (!orig.consequent['@type']) return {};
    }
  }
  const nuj = {};
  for (const k in orig) {
    const part = orig[k];
    if (Array.isArray(part)) {
      const nupart = [];
      for (let j = 0; j < part.length; j++) {
        if (typeof part[j] === 'object') {
          const sub = copyJSON(part[j], rollup);
          if (!sub || !UTILS.empty(sub)) nupart.push(sub);
        } else {
          nupart.push(part[j]);
        }
      }
      nuj[k] = nupart;
    } else if (part === null) {
      // do nothing
    } else if (typeof part === 'object') {
      const q = copyJSON(part, rollup);
      if (!q || !UTILS.empty(q)) nuj[k] = q;
    } else {
      nuj[k] = part;
    }
  }
  return nuj;
}

module.exports = WOQLQuery;
