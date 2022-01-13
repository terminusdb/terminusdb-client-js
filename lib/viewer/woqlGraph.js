/* eslint-disable prettier/prettier */
const WOQLGraphConfig = require('./graphConfig');
const UTILS = require('../utils');
const WOQLRule = require('./woqlRule');

function WOQLGraph(client, config) {
  this.client = client;
  this.config = (config || new WOQLGraphConfig());
  this.nodes = [];
  this.edges = [];
}

/* "nodes": [
    {
      "id": 1,
      "name": "A"
    },
    {
      "id": 2,
      "name": "B"
    },
    {
      "id": 3,
      "name": "C"
    }
]

"link" :[
	{
      "source": 1,
      "target": 2
    }
] */

WOQLGraph.prototype.options = function (config) {
  this.config = config;
  return this;
};

WOQLGraph.prototype.setResult = function (result) {
  this.result = result;
  this.calculateVariableTypes(result);
};

WOQLGraph.prototype.calculateVariableTypes = function () {
  // var bindings = this.result.getBindings();
  const bindings = this.result;
  if (bindings && bindings.length) {
    for (let i = 0; i < bindings.length; i++) {
      this.extractFromBinding(bindings[i], i);
    }
  }
  this.edges = this.combineEdges(this.edges);
  this.nodes = this.combineNodes(this.nodes);
};

WOQLGraph.prototype.extractFromBinding = function (row, rownum) {
  /*
	* check if I have to add the row
	*/
  if (this.includeRow(row, rownum)) {
    // get all the nodes (ids - non literals) //
    // see which nodes are excluded ...
    const nodes = [];
    const lits = [];
    for (const k in row) {
      if (typeof row[k] === 'string') {
        if (row[k] && row[k] !== 'system:unknown' && this.includeNode(k, row)) {
          nodes.push(k);
        }
      } else if (row[k]['@value'] && this.includeLiteralNode(k, row)) {
        nodes.push(k);
      }
    }
    if (nodes.length === 0) return;
    this.createEdgesFromIDs(nodes, row);
    for (let i = 0; i < nodes.length; i++) {
      let ndid = row[nodes[i]];
      ndid = (ndid['@value'] ? ndid['@value'] : ndid);
      this.addAdornedNode(ndid, nodes[i], row);
    }
  }
};

WOQLGraph.prototype.addAdornedEdge = function (source, target, ks, kt, row) {
  source = (source['@value'] ? source['@value'] : source);
  target = (target['@value'] ? target['@value'] : target);
  const edge = {
    type: 'link', target, source, text: target,
  };
  const matched_rules = new WOQLRule().matchEdge(this.config.rules, row, ks, kt);
  let hid = false;
  for (let i = 0; i < matched_rules.length; i++) {
    const { rule } = matched_rules[i];
    if (typeof rule.hidden !== 'undefined') {
      hid = rule.hidden;
    }
    if (rule.size) {
      edge.size = UTILS.getConfigValue(rule.size, row);
    }
    if (rule.text) {
      edge.text = UTILS.getConfigValue(rule.text, row);
    }
    if (rule.color) {
      edge.color = UTILS.getConfigValue(rule.color, row);
    }
    if (rule.icon) {
      edge.icon = UTILS.getConfigValue(rule.icon, row);
    }
    if (rule.distance) {
      edge.distance = UTILS.getConfigValue(rule.distance, row);
    }
    if (rule.arrow) {
      edge.arrow = UTILS.getConfigValue(rule.arrow, row);
    }
    if (rule.symmetric) {
      edge.symmetric = UTILS.getConfigValue(rule.symmetric, row);
    }
    if (rule.weight) {
      edge.weight = UTILS.getConfigValue(rule.weight, row);
    }
  }
  if (!hid) this.edges.push(edge);
};

/*
* the rules' order are important
*/

WOQLGraph.prototype.addAdornedNode = function (nid, k, row) {
  const node = { type: 'node', id: nid, nodetype: k };
  const matched_rules = new WOQLRule().matchNode(this.config.rules, row, k, nid);
  for (let i = 0; i < matched_rules.length; i++) {
    const { rule } = matched_rules[i];
    if (rule.size) {
      node.radius = UTILS.getConfigValue(rule.size, row);
    }
    if (rule.color) {
      node.color = UTILS.getConfigValue(rule.color, row);
    }
    if (rule.charge) {
      node.charge = UTILS.getConfigValue(rule.charge, row);
    }
    if (rule.collisionRadius) {
      node.collisionRadius = UTILS.getConfigValue(rule.collisionRadius, row);
    }
    if (rule.icon) {
      node.icon = UTILS.getConfigValue(rule.icon, row);
    }
    if (rule.text) {
      node.text = UTILS.getConfigValue(rule.text, row);
    }
    if (rule.border) {
      node.border = UTILS.getConfigValue(rule.border, row);
    }
  }
  if (!node.text) {
    if (typeof row[k] === 'string') node.text = row[k];
    else if (row[k]['@value']) node.text = row[k]['@value'];
  }
  this.nodes.push(node);
};

WOQLGraph.prototype.getLiteralOwner = function (nodes, v, row) {
  const cs = this.config.source();
  if (cs && row[cs]) {
    return cs;
  }
  const edges = this.config.edges();
  if (edges) {
    for (let i = 0; i < edges.length; i++) {
      if (edges[i][1] == v) {
        return edges[i][0];
      }
    }
    return false;
  }
  return nodes[0];
};

WOQLGraph.prototype.createEdgesFromIDs = function (nodes, row) {
  if (nodes.length < 2) return;
  const cs = this.config.source();
  const es = this.config.edges();
  if (!cs && es && es.length) {
    for (var i = 0; i < es.length; i++) {
      if (nodes.indexOf(es[i][0]) != -1 && nodes.indexOf(es[i][1]) != -1) {
        this.addAdornedEdge(row[es[i][0]], row[es[i][1]], es[i][0], es[i][1], row);
      }
    }
    return;
  }
  const s = (cs && nodes.indexOf(cs) != -1) ? cs : nodes[0];
  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i] == s) continue;
    this.addAdornedEdge(row[s], row[nodes[i]], s, nodes[i], row);
  }
};

WOQLGraph.prototype.getEdges = function () {
  return this.edges;
};

WOQLGraph.prototype.combineNodes = function (nodes) {
  const nnodes = {};
  for (let i = 0; i < nodes.length; i++) {
    const n = nodes[i];
    if (this.nodes_referenced_by_edges.indexOf(n.id) === -1) continue;
    if (typeof nnodes[n.id] === 'undefined') {
      nnodes[n.id] = n;
    } else {
      for (const k in n) {
        if (typeof nnodes[n.id][k] === 'undefined') {
          nnodes[n.id][k] = n[k];
        }
      }
    }
  }
  return Object.values(nnodes);
};

WOQLGraph.prototype.combineEdges = function (edges) {
  this.nodes_referenced_by_edges = [];
  const nedges = {};
  for (let i = 0; i < edges.length; i++) {
    const e = edges[i];
    if (typeof nedges[e.source] === 'undefined') {
      nedges[e.source] = {};
    }
    if (typeof nedges[e.source][e.target] === 'undefined') {
      nedges[e.source][e.target] = e;
    } else {
      for (var k in e) {
        if (typeof nedges[e.source][e.target][k] === 'undefined') nedges[e.source][e.target][k] = e[k];
      }
    }
    if (this.nodes_referenced_by_edges.indexOf(e.source) === -1) this.nodes_referenced_by_edges.push(e.source);
    if (this.nodes_referenced_by_edges.indexOf(e.target) === -1) this.nodes_referenced_by_edges.push(e.target);
  }
  const fedges = [];
  for (var k in nedges) {
    for (const k2 in nedges[k]) {
      fedges.push(nedges[k][k2]);
    }
  }
  return fedges;
};

WOQLGraph.prototype.getNodes = function () {
  return this.nodes;
};

WOQLGraph.prototype.includeNode = function (v, row) {
  const matched_rules = new WOQLRule().matchNode(this.config.rules, row, v, false, 'hidden');
  for (let i = 0; i < matched_rules.length; i++) {
    if (matched_rules[i].rule.hidden) return false;
  }
  return true;
};

/*
* check if I have to visualise literals node
*/
WOQLGraph.prototype.includeLiteralNode = function (variableName, row) {
  if (this.config.literals() === false) return false;
  const matched_rules = new WOQLRule().matchNode(this.config.rules, row, variableName, false, 'hidden');
  for (let i = 0; i < matched_rules.length; i++) {
    if (matched_rules[i].rule.hidden) return false;
  }
  return true;
};

WOQLGraph.prototype.includeRow = function (row, num) {
  const matched_rules = new WOQLRule().matchRow(this.config.rules, row, num, 'hidden');
  for (let i = 0; i < matched_rules.length; i++) {
    if (matched_rules[i].rule.hidden) return false;
  }
  return true;
};

module.exports = WOQLGraph;
