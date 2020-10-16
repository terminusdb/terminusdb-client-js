const Config  = require('./viewConfig.js');
const WOQLGraph  = require('./woqlGraph.js');
const UTILS  = require('../utils.js');

function WOQLGraphConfig(){
    Config.ViewConfig.call(this); 
    this.type = "graph";
}

WOQLGraphConfig.prototype = Object.create(Config.ViewConfig.prototype);
WOQLGraphConfig.prototype.constructor = Config.ViewConfig;

WOQLGraphConfig.prototype.create = function(client){
	var wqt = new WOQLGraph(client, this);
	return wqt;
}

WOQLGraphConfig.prototype.literals = function(v){
	if(typeof v !== "undefined"){
		this.show_literals = v;
		return this;
	}
	return this.show_literals;
}

WOQLGraphConfig.prototype.source = function(v){
	if(v){
		//if(v.substring(0, 2) != "v:") v = "v:" + v;
		this.source_variable = UTILS.removeNamespaceFromVariable(v)
		return this;
	}
	return this.source_variable;
}

WOQLGraphConfig.prototype.fontfamily = function(v){
	if(typeof v != "undefined"){
		this.fontfam = v;
		return this;
	}
	//return 'Font Awesome 5 Free';
	return this.fontfam;
}

WOQLGraphConfig.prototype.show_force = function(v){
	if(typeof v != "undefined"){
		this.force = v;
		return this;
	}
	return this.force;
}

WOQLGraphConfig.prototype.fix_nodes = function(v){
	if(typeof v != "undefined"){
		this.fixed = v;
		return this;
	}
	return this.fixed;
}

WOQLGraphConfig.prototype.explode_out = function(v){
	if(typeof v != "undefined"){
		this.explode = v;
		return this;
	}
	return this.explode;
}

WOQLGraphConfig.prototype.selected_grows = function(v){
	if(typeof v != "undefined"){
		this.bigsel = v;
		return this;
	}
	return this.bigsel;
}

/**
 * no parameter get the graph width or
 * set the graph width and return the WOQLGraphConfig
 * @param {size} Number
 */

WOQLGraphConfig.prototype.width = function(size){
	if(typeof size != "undefined"){
		this.gwidth = size;
		return this;
	}
	return this.gwidth;
}

/**
 * no parameter get the graph height or
 * set the graph height and return the WOQLGraphConfig
 * @param {size} Number
 */

WOQLGraphConfig.prototype.height = function(size){
	if(typeof size != "undefined"){
		this.gheight = size;
		return this;
	}
	return this.gheight;
}

WOQLGraphConfig.prototype.edges = function(...edges){
	if(edges && edges.length){
		var nedges = [];
		for(var i = 0; i<edges.length; i++){
			nedges.push(UTILS.removeNamespacesFromVariables(edges[i]));
		}
		this.show_edges = nedges;
		return this;
	}
	return this.show_edges;
}

WOQLGraphConfig.prototype.edge = function(source, target){
	let nr = new WOQLGraphRule().edge(source, target);
	this.rules.push(nr);
	return nr;
}

WOQLGraphConfig.prototype.node = function(...cols){
	let nr = new WOQLGraphRule();
	if(cols && cols.length){
		nr.scope("node").setVariables(cols);
	}
	else {
		nr.scope("row");
	}
	this.rules.push(nr);
	return nr;
}

WOQLGraphConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLGraphRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
	if(typeof config.literals != "undefined"){
		this.literals(config.literals);
	}
	if(typeof config.source != "undefined"){
		this.source(config.source);
	}
	if(typeof config.fontfamily != "undefined"){
		this.fontfamily(config.fontfamily);
	}
	if(typeof config.show_force != "undefined"){
		this.show_force(config.show_force);
	}
	if(typeof config.fix_nodes != "undefined"){
		this.fix_nodes(config.fix_nodes);
	}
	if(typeof config.explode_out != "undefined"){
		this.explode_out(config.explode_out);
	}
	if(typeof config.selected_grows != "undefined"){
		this.selected_grows(config.selected_grows);
	}
	if(typeof config.width != "undefined"){
		this.width(config.width);
	}
	if(typeof config.height != "undefined"){
		this.height(config.height);
	}
	if(typeof config.edges != "undefined"){
		this.edges(...config.edges);
	}
}

WOQLGraphConfig.prototype.prettyPrint = function(){
	var str = "view = View.graph();\n";
	if(typeof this.literals() != "undefined"){
		str += "view.literals('" + this.literals() + "')\n";
	}
	if(typeof this.source() != "undefined"){
		str += "view.source('" + UTILS.removeNamespaceFromVariable(this.source()) + "')\n";
	}
	if(typeof this.fontfamily() != "undefined"){
		str += "view.fontfamily('" + this.fontfamily() + "')\n";
	}
	if(typeof this.show_force() != "undefined"){
		str += "view.show_force('" + this.show_force() + "')\n";
	}
	if(typeof this.fix_nodes() != "undefined"){
		str += "view.fix_nodes('" + this.fix_nodes() + "')\n";
	}
	if(typeof this.explode_out() != "undefined"){
		str += "view.explode_out('" + this.explode_out() + "')\n";
	}
	if(typeof this.selected_grows() != "undefined"){
		str += "view.selected_grows('" + this.selected_grows() + "')\n";
	}
	if(typeof this.width() != "undefined"){
		str += "view.width('" + this.width() + "')\n";
	}
	if(typeof this.height() != "undefined"){
		str += "view.height('" + this.height() + "')\n";
	}
	if(typeof this.edges() != "undefined"){
		var nedges = this.edges();
		var estrs = [];
		for(var i = 0; i<nedges.length; i++){
			estrs.push("['" + nedges[i][0] + ", " + nedges[i][1] + "']");
		}
		str += "view.edges('" + estrs.join(", ") + "')\n";
	}
	for(var i = 0; i<this.rules.length ; i++){
		let x = this.rules[i].prettyPrint();
		if(x) str += "view." + x + "\n";		
	}
	return str;
}

WOQLGraphConfig.prototype.json = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	var json = {};
	if(typeof this.literals() != "undefined"){
		json['literals'] = this.literals();
	}
	if(typeof this.source() != "undefined"){
		json['source'] = this.source();
	}
	if(typeof this.fontfamily() != "undefined"){
		json['fontfamily'] = this.fontfamily();
	}
	if(typeof this.show_force() != "undefined"){
		json['show_force'] = this.show_force();
	}
	if(typeof this.fix_nodes() != "undefined"){
		json['fix_nodes'] = this.fix_nodes();
	}
	if(typeof this.explode_out() != "undefined"){
		json['explode_out'] = this.explode_out();
	}
	if(typeof this.selected_grows() != "undefined"){
		json['selected_grows'] = this.selected_grows();
	}
	if(typeof this.width() != "undefined"){
		json['width'] = this.width();
	}
	if(typeof this.height() != "undefined"){
		json['height'] = this.height();
	}
	if(typeof this.edges() != "undefined"){
		json['edges'] = this.edges();
	}
	let mj = {"graph" :json, "rules": jr};
	return mj;
}

function WOQLGraphRule(scope){
	Config.WOQLViewRule.call(this,scope); 
};

WOQLGraphRule.prototype = Object.create(Config.WOQLViewRule.prototype);
WOQLGraphRule.prototype.constructor = Config.WOQLViewRule;

WOQLGraphRule.prototype.charge = function(v){
	if(typeof v == "undefined"){
		return this.rule.charge;
	}
	this.rule.charge = v;
	return this;
}

WOQLGraphRule.prototype.collisionRadius = function(v){
	if(typeof v == "undefined"){
		return this.rule.collisionRadius;
	}
	this.rule.collisionRadius = v;
	return this;
}

WOQLGraphRule.prototype.arrow = function(json){
	if(json){
		this.rule.arrow = json;
		return this;
	}
	return this.rule.arrow;
}

WOQLGraphRule.prototype.distance = function(d){
	if(typeof d != "undefined"){
		this.rule.distance = d;
		return this;
	}
	return this.rule.distance;
}

WOQLGraphRule.prototype.symmetric = function(d){
	if(typeof d != "undefined"){
		this.rule.symmetric = d;
		return this;
	}
	return this.rule.symmetric ;
}


WOQLGraphRule.prototype.weight = function(w){
	if(typeof w != "undefined"){
		this.rule.weight = w;
		return this;
	}
	return this.rule.weight;
}

WOQLGraphRule.prototype.prettyPrint = function(type){
	var str = Config.WOQLViewRule.prototype.prettyPrint.apply(this);
	if(typeof this.charge() != "undefined"){
		str += ".charge('" + this.charge() + "')";
	}
	if(typeof this.distance() != "undefined"){
		str += ".distance('" + this.distance() + "')";
	}
	if(typeof this.weight() != "undefined"){
		str += ".weight('" + this.weight() + "')";
	}
	if(typeof this.symmetric() != "undefined"){
		str += ".symmetric(" + this.symmetric() + ")";
	}
	if(typeof this.collisionRadius() != "undefined"){
		str += ".collisionRadius(" + this.collisionRadius() + ")";
	}	
	if(typeof this.arrow() != "undefined"){
		str += ".arrow(" + JSON.stringify(this.arrow()) + ")";
	}
	return str;
}

module.exports = WOQLGraphConfig;