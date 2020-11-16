
const WOQLRule = require("./woqlRule");

/**
 * Generic functions / configs that are available to all config types
 */
function ViewConfig(){
    this.rules = [];
}

ViewConfig.prototype.render = function(func){
	if(func) this.view_render = func;
	return this.view_render;
}

ViewConfig.prototype.renderer = function(val){
	if(val) this.view_renderer = val;
	return this.view_renderer;
}

ViewConfig.prototype.getRulesJSON = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	return jr;
}

ViewConfig.prototype.getBasicJSON = function(){
	let jr = {};
	if(this.view_render) jr.render = this.view_render;
	if(this.view_renderer) jr.renderer = this.view_renderer;
	if(this.vbindings) jr.bindings = this.vbindings;
	return jr;
}

ViewConfig.prototype.loadBasicJSON = function(json){
	if(json.render) this.view_render = json.view_render;
	if(json.renderer) this.view_renderer = json.view_renderer;
	if(json.bindings) this.vbindings = json.bindings
}

ViewConfig.prototype.getBasicprettyPrint = function(){
	let str = "";
	if(typeof this.render() != "undefined"){
		str += "view.render(" + this.render() + ")\n";
	}
	if(typeof this.renderer() != "undefined"){
		str += "view.renderer('" + this.renderer() + "')\n";
	}
	if(typeof this.bindings() != "undefined"){
		str += "view.bindings('" + this.bindings() + "')\n";
	}
	return str;
}

ViewConfig.prototype.bindings = function(bindings){
	if(typeof bindings != "undefined"){
        this.vbindings = bindings;
	}
	return this.vbindings;
}


function WOQLViewRule(){
	WOQLRule.call(this);
	this.rule = {}; 
};
	
WOQLViewRule.prototype = Object.create(WOQLRule.prototype);
WOQLViewRule.prototype.constructor = WOQLRule;

WOQLViewRule.prototype.prettyPrint = function(type){
	let str = "";
	if(this.pattern){
		str = this.pattern.prettyPrint(type);
	}
	if(typeof this.color() != "undefined"){
		str += ".color([" + this.color().join(",") + "])";
	}
	if(typeof this.hidden() != "undefined"){
		str += ".hidden(" + this.hidden() + ")";
	}
	if(typeof this.size() != "undefined"){
		str += ".size('" + this.size() + "')";
	}
	if(typeof this.icon() != "undefined"){
		str += ".icon(" + JSON.stringify(this.icon()) + ")";
	}
	if(typeof this.text() != "undefined"){
		str += ".text(" + JSON.stringify(this.text()) + ")";
	}
	if(typeof this.border() != "undefined"){
		str += ".border(" + JSON.stringify(this.border()) + ")";
	}
	if(typeof this.args() != "undefined"){
		str += ".args(" + JSON.stringify(this.args()) + ")";
	}
	if(typeof this.renderer() != "undefined"){
		str += ".renderer('" + this.renderer() + "')";
	}
	if(typeof this.render() != "undefined"){
		str += ".render(" + this.render() + ")";
	}
	if(typeof this.click() != "undefined"){
		str += ".click(" + this.click() + ")";
	}
	if(typeof this.hover() != "undefined"){
		str += ".hover(" + this.hover() + ")";
	}
	return str;
}

WOQLViewRule.prototype.json = function(mjson){
	if(!mjson) {
		var json = { }
		if(this.pattern) json.pattern = this.pattern.json();
		json.rule = this.rule;
	    return json;
	}
	this.rule = mjson.rule || {};
	if(mjson.pattern) this.pattern.setPattern(mjson.pattern);
	return this;
}


WOQLViewRule.prototype.size = function(size){
	if(typeof size == "undefined"){
		return this.rule.size;
	}
	this.rule.size = size;
	return this;
}

WOQLViewRule.prototype.color = function(color){
	if(typeof color == "undefined"){
		return this.rule.color;
	}
	this.rule.color = color;
	return this;
}

WOQLViewRule.prototype.icon = function(json){
	if(json){
		this.rule.icon = json;
		return this;
	}
	return this.rule.icon;
}

WOQLViewRule.prototype.text = function(json){
	if(json){
		this.rule.text = json;
		return this;
	}
	return this.rule.text;
}

WOQLViewRule.prototype.border = function(json){
	if(json){
		this.rule.border = json;
		return this;
	}
	return this.rule.border;
}

WOQLViewRule.prototype.renderer = function(rend){
	if(typeof rend == "undefined"){
		return this.rule.renderer;
	}
	this.rule.renderer = rend;
	return this;
}


WOQLViewRule.prototype.render = function(func){
	if(typeof func == "undefined"){
		return this.rule.render;
	}
	this.rule.render = func;
	return this;
}

WOQLViewRule.prototype.click = function(onClick){
	if(onClick){
		this.rule.click = onClick;
		return this;
	}
	return this.rule.click;
}

WOQLViewRule.prototype.hover = function(onHover){
	if(onHover){
		this.rule.hover = onHover;
		return this;
	}
	return this.rule.hover;
}

WOQLViewRule.prototype.hidden = function(hidden){
	if(typeof hidden == "undefined"){
		return this.rule.hidden;
	}
	this.rule.hidden = hidden;
	return this;
}

WOQLViewRule.prototype.args = function(args){
	if(typeof args == "undefined"){
		return this.rule.args;
	}
	this.rule.args = args;
	return this;
}

module.exports = {WOQLViewRule, ViewConfig}

