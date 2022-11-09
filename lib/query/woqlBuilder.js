/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-self-assign */
/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
// WOQLQuery
/**
 * module WOQLQuery
 *
 */

/**
 * defines the internal functions of the woql query object - the
 * language API is defined in WOQLQuery
 * @module WOQLQuery
 * @constructor
 * @param {object} [query] json-ld query for initialisation
 * @returns {WOQLQuery}
 */

const WOQLQueryExt = require('./woqlQuery');
// const WOQLLibrary = require('./woqlLibrary');

class WOQLQuery extends WOQLQueryExt {
  counter = 1;

  // eslint-disable-next-line no-useless-constructor
  constructor(query) {
    super(query);
  }
}

// WOQLQuery.prototype.counter = 1;

/**
 * Simple composite functions which produce WOQL queries
 */
WOQLQuery.prototype.star = function (Graph, Subj, Pred, Obj) {
  Subj = Subj || 'v:Subject';
  Pred = Pred || 'v:Predicate';
  Obj = Obj || 'v:Object';
  Graph = Graph || false;
  if (Graph) {
    return this.quad(Subj, Pred, Obj, Graph);
  }
  return this.triple(Subj, Pred, Obj);
};

WOQLQuery.prototype.all = function (Subj, Pred, Obj, Graph) {
  return this.star(Graph, Subj, Pred, Obj);
};

/* WOQLQuery.prototype.lib = function () {
  return new WOQLLibrary();
}; */

WOQLQuery.prototype.string = function (s) {
  return { '@type': 'xsd:string', '@value': String(s) };
};

WOQLQuery.prototype.boolean = function (tf) {
  tf = tf || false;
  return this.literal(tf, 'boolean');
};

WOQLQuery.prototype.literal = function (s, t) {
  t = t.indexOf(':') === -1 ? `xsd:${t}` : t;
  return { '@type': t, '@value': s };
};

WOQLQuery.prototype.iri = function (s) {
  return {
    '@type': 'NodeValue',
    node: s,
  };
};

WOQLQuery.prototype.update_triple = function (subject, predicate, new_object, old_object) {
  const tmp_name = old_object || `v:AnyObject__${this.counter += 1}`;
  return this.and(
    new WOQLQuery().opt(
      new WOQLQuery()
        .triple(subject, predicate, tmp_name)
        .delete_triple(subject, predicate, tmp_name)
        .not()
        .triple(subject, predicate, new_object),
    ),
    new WOQLQuery().add_triple(subject, predicate, new_object),
  );
};

/**
 * @description Update a pattern matching rule for the quad [S, P, O, G]
 * (Subject, Predicate, Object, Graph)
 * @param {string} subject - The IRI of a triple’s subject or a variable
 * @param {string} predicate - The IRI of a property or a variable
 * @param {string} newObject - The value to update or a literal
 * @param {string} graph - the resource identifier of a graph possible value are
 * schema/{main - myschema - *} | instance/{main - myschema - *}  | inference/{main - myschema - *}
 * @returns {WOQLQuery} A WOQLQuery which contains the a Update Quad Statement
 */

WOQLQuery.prototype.update_quad = function (subject, predicate, new_object, graph) {
  const tmp_name = `v:AnyObject__${this.counter += 1}`;
  return this.and(
    new WOQLQuery().opt(
      new WOQLQuery()
        .quad(subject, predicate, tmp_name, graph)
        .delete_quad(subject, predicate, tmp_name, graph)
        .not()
        .quad(subject, predicate, new_object, graph),
    ),
    new WOQLQuery().add_quad(subject, predicate, new_object, graph),
  );
};

/**
 * Removes all triples from a graph
 * @param {string} g - optional graph resource identifier
 */

WOQLQuery.prototype.nuke = function (g) {
  if (g) {
    return this.quad('v:A', 'v:B', 'v:C', g).delete_quad('v:A', 'v:B', 'v:C', g);
  }
  return this.triple('v:A', 'v:B', 'v:C').delete_triple('v:A', 'v:B', 'v:C');
};

WOQLQuery.prototype.node = function (node, type) {
  type = type || false;
  if (type === 'add_quad') type = 'AddTriple';
  else if (type === 'delete_quad') type = 'DeleteTriple';
  else if (type === 'add_triple') type = 'AddTriple';
  else if (type === 'delete_triple') type = 'DeleteTriple';
  else if (type === 'quad') type = 'Triple';
  else if (type === 'triple') type = 'Triple';
  if (type && type.indexOf(':') === -1) type = type;
  const ctxt = { subject: node };
  if (type) ctxt.action = type;
  this._set_context(ctxt);
  return this;
};

/**
 * set the graph type schema or instance
 * for the query we point at the instance graph so you use this only
 * if you would like to query the schema graph
 */
// do not remove
WOQLQuery.prototype.graph = function (g) {
  return this._set_context({
    graph: g,
  });
};
// do not remove
WOQLQuery.prototype._set_context = function (ctxt) {
  if (!this.triple_builder_context) this.triple_builder_context = {};

  for (const k in ctxt) {
    this.triple_builder_context[k] = ctxt[k];
  }

  return this;
};

WOQLQuery.prototype.insert = function (id, type, refGraph) {
  refGraph = refGraph || (this.triple_builder_context ? this.triple_builder_context.graph : false);
  if (refGraph) {
    return this.add_quad(id, 'rdf:type', `@schema:${type}`, refGraph);
  }
  return this.add_triple(id, 'rdf:type', `@schema:${type}`);
};

module.exports = WOQLQuery;
