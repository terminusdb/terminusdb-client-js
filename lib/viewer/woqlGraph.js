const WOQLGraphConfig = require("./graphConfig");
const UTILS = require('../utils');
const WOQLRule = require('../woqlRule');

function WOQLGraph(client, config){
	this.client = client;
	this.config = (config ? config : new WOQLGraphConfig());
	this.nodes = [];
	this.edges = [];
}

WOQLGraph.prototype.options = function(config){
	this.config = config;
	return this;
}

WOQLGraph.prototype.setResult = function(result){
	this.result = result;
	this.calculateVariableTypes(result);
}

WOQLGraph.prototype.calculateVariableTypes = function(){
	var bindings = this.result.getBindings();
	if(bindings && bindings.length){
		for(var i = 0; i<bindings.length; i++){
			this.extractFromBinding(bindings[i], i);
		}
	}
	this.edges = this.combineEdges(this.edges);
	this.nodes = this.combineNodes(this.nodes);
}

WOQLGraph.prototype.extractFromBinding = function(row, rownum){
	//
	if(this.includeRow(row, rownum)){
		//get all the nodes (ids - non literals) //
		//see which nodes are excluded ...
		var nodes = [];
		var lits = [];
		for(var k in row){
			if(typeof row[k] == "string"){
				if(row[k] && row[k] != "unknown" && this.includeNode(k, row)) nodes.push(k);
			}
			else if(row[k]["@value"] && this.includeLiteralNode(k, row)){
				lits.push(k);
			}
		}
		if(nodes.length == 0) return;
		//first of all we need to make the literal nodes targets of 
		for(var i = 0; i<lits.length; i++){
			//make an edge and put the lit in as a node...
			var nid = UTILS.genBNID().substring(2);
			let source = this.getLiteralOwner(nodes, lits[i], row);
			if(source) {
				this.addAdornedNode(nid, lits[i], row);
				this.addAdornedEdge(row[source], nid, source, lits[i], row);
			}
		}
		this.createEdgesFromIDs(nodes, row);
		for(var i = 0; i<nodes.length; i++){
			var ndid = row[nodes[i]];
			this.addAdornedNode(ndid, nodes[i], row);
		}
	}
}

WOQLGraph.prototype.addAdornedEdge = function(source, target, ks, kt, row){
	var edge = { type: "link", target: target, source: source, text: kt};
	const matched_rules = new WOQLRule().matchEdge(this.config.rules, row, ks, kt);
	for(var i = 0; i<matched_rules.length; i++){
		var rule = matched_rules[i].rule;
		if(rule.size){
			edge.radius = UTILS.getConfigValue(rule.size, row);
		}
		if(rule.text){
			edge.text = UTILS.getConfigValue(rule.text, row);
		}
		if(rule.color){
			edge.color = UTILS.getConfigValue(rule.color, row);
		}
		if(rule.distance){
			edge.distance = UTILS.getConfigValue(rule.distance, row);
		}
		if(rule.arrow){
			edge.arrow = UTILS.getConfigValue(rule.arrow, row);
		}
		if(rule.symmetric){
			edge.symmetric = UTILS.getConfigValue(rule.symmetric, row);
		}
		if(rule.weight){
			edge.weight = UTILS.getConfigValue(rule.weight, row);
		}
	}
	this.edges.push(edge);	
}

WOQLGraph.prototype.addAdornedNode = function(nid, k, row){
	var node = { type: "node", id: nid, nodetype: k };
	const matched_rules = new WOQLRule().matchNode(this.config.rules, row, k, nid);
	for(var i = 0; i<matched_rules.length; i++){
		var rule = matched_rules[i].rule;
		if(rule.size){
			node.radius = UTILS.getConfigValue(rule.size, row);
		}
		if(rule.color){
			node.color = UTILS.getConfigValue(rule.color, row);
		}
		if(rule.charge){
			node.charge = UTILS.getConfigValue(rule.charge, row);
		}
		if(rule.collisionRadius ){
			node.collisionRadius = UTILS.getConfigValue(rule.collisionRadius, row);
		}
		if(rule.icon ){
			node.icon = UTILS.getConfigValue(rule.icon, row);
		}
		if(rule.text){
			node.text = UTILS.getConfigValue(rule.text, row);
		}
		if(rule.border){
			node.border = UTILS.getConfigValue(rule.border, row);
		}
	}
	if(!node.text){
		if(typeof row[k] == "string") node.text = row[k];
		else if(row[k]['@value']) node.text = row[k]['@value'];
	}
	this.nodes.push(node);
}

WOQLGraph.prototype.getLiteralOwner = function(nodes, v, row){
	var cs = this.config.source();
	if(cs && row[cs]){
		return cs;
	}
	var edges = this.config.edges();
	if(edges){
		for(var i = 0; i < edges.length; i++){
			if(edges[i][1] == v){
				return edges[i][0];
			}
		}
		return false;
	}
	return nodes[0];
}

WOQLGraph.prototype.createEdgesFromIDs = function(nodes, row){
	if(nodes.length < 2) return;
	var cs = this.config.source();
	let es = this.config.edges();
	if(!cs && es && es.length){
		for(var i = 0; i< es.length; i++){
			if(nodes.indexOf(es[i][0]) != -1 && nodes.indexOf(es[i][1]) != -1 ){
				this.addAdornedEdge(row[es[i][0]], row[es[i][1]], es[i][0], es[i][1], row);
			}
		}
		return;
	}
	var s = (cs && nodes.indexOf(cs) != -1) ? cs : nodes[0];
	for(var i = 0; i<nodes.length; i++){
		if(nodes[i] == s) continue;
		this.addAdornedEdge(row[s], row[nodes[i]], s, nodes[i], row);
	}
}


WOQLGraph.prototype.getEdges = function(){
	return this.edges;
}

WOQLGraph.prototype.combineNodes = function(nodes){
	var nnodes = {};
	for(var i = 0; i<nodes.length; i++){
		var n = nodes[i];
		if(typeof nnodes[n.id] == "undefined"){
			nnodes[n.id] = n;
		}
		else {
			for(var k in n){
				if(typeof nnodes[n.id][k] == "undefined"){
					nnodes[n.id][k] = n[k];
				}
			}
		}
	}
	return Object.values(nnodes);
}


WOQLGraph.prototype.combineEdges = function(edges){
	var nedges = {};
	for(var i = 0; i<edges.length; i++){
		var e = edges[i];
		if(typeof nedges[e.source] == "undefined"){
			nedges[e.source] = {};
		}
		if(typeof nedges[e.source][e.target] == "undefined"){
			nedges[e.source][e.target] = e;
		}
		else {
			for(var k in e){
				if(typeof nedges[e.source][e.target][k] == "undefined") nedges[e.source][e.target][k] = e[k];
			}
		}
	}
	var fedges = [];
	for(var k in nedges){
		for(var k2 in nedges[k]){
			fedges.push(nedges[k][k2]);
		}
	}
	return fedges;
}



WOQLGraph.prototype.getNodes = function(){
	return  this.nodes;
}



WOQLGraph.prototype.includeNode = function(v, row){
	const matched_rules = new WOQLRule().matchNode(this.config.rules, row, v, false, "hidden");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].rule.hidden) return false;
	}
	return true;
}

WOQLGraph.prototype.includeLiteralNode = function(v, row){
	let l = this.config.literals();
	if(typeof l != "undefined" && !l) return false;
	const matched_rules = new WOQLRule().matchNode(this.config.rules, row, v, false, "hidden");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].rule.hidden) return false;
	}
	return true;
}


WOQLGraph.prototype.includeRow = function(row, num){
	const matched_rules = new WOQLRule().matchRow(this.config.rules, row, num, "hidden");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].rule.hidden) return false;
	}
	return true;
}



module.exports = WOQLGraph;