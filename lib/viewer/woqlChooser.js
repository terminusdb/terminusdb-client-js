const WOQLChooserConfig = require("./chooserConfig");
const UTILS = require('../utils');
const WOQLRule = require('./woqlRule');

/*
 * Very simple implementation of a WOQL backed chooser
 * Makes a drop down from a WOQL query - configuration tells it which columns to use...
 */
function WOQLChooser(client, config){
	this.client = client;
	this.config = (config ? config : new WOQLChooserConfig());
	this.selected = false;
	this.cursor = 0;
	return this;
}

WOQLChooser.prototype.options = function(config){
	this.config = config;
	return this;
}

WOQLChooser.prototype.set = function(id){
	if(this.selected != id){
		this.selected = id;
		let ch = this.config.change;
		if(ch) ch(id);
	}
}

/*
 * Sets up the required variables from the result / config
 */
WOQLChooser.prototype.setResult = function(result){
	this.result = result;
	this.choices = [];
	let rows = 0;
	const variables = result.getVariableList();
	if(!this.config.values() && variables.length){
		this.config.values(variables[0]);
	}
	//sort it 
	if(this.config.sort()){
		this.result.sort(this.config.sort(), this.config.direction());
	}
	while(row = this.result.next()){
		if(row && this.includeRow(row, this.result.cursor)){
			this.choices.push(this.rowToChoice(row, rows++));
		}		
	}
	return this;
}

WOQLChooser.prototype.includeRow = function(row, index){
	const matched_rules = new WOQLRule().matchRow(this.config.rules, row, index, "hidden");
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].rule.hidden) return false;
	}
	return true;
}

WOQLChooser.prototype.rowToChoice = function(row, rownum){
	var choice = { 
		id: this.getRowID(row) 
	};
	choice.label = this.getLabelFromBinding(row, rownum);
	choice.title = this.getTitleFromBinding(row, rownum);
	choice.selected = this.getSelectedFromBinding(row, rownum);
	return choice;
}

WOQLChooser.prototype.getRowID = function(row){
	var rval = row[this.config.values()];
	if(rval['@value']) return rval['@value'];
	return rval;
}

WOQLChooser.prototype.getLabelFromBinding = function(row, rownum){
	let sp = this.getSpecialRenderer(row, rownum, "label");
	if(sp) return this.renderSpecial(sp, row, rownum);
	if(this.config.labels()){
		if(row[this.config.labels()]){
			var lab = row[this.config.labels()];
			if(lab["@value"]) lab = lab["@value"];
			if(lab != "system:unknown") return lab;
		}
	}
	return UTILS.labelFromURL(this.getRowID(row));
}

WOQLChooser.prototype.getTitleFromBinding = function(row, rownum){
	let sp = this.getSpecialRenderer(row, rownum, "title");
	if(sp) return this.renderSpecial(sp, row, rownum);
	if(this.config.titles()){
		if(row[this.config.titles()]){
			var lab = row[this.config.titles()];
			if(lab["@value"]) lab = lab["@value"];
			if(lab != "system:unknown") return lab;
		}
	}
	return false;
}

WOQLChooser.prototype.getSelectedFromBinding = function(row, rownum){
	const matched_rules =  new WOQLRule().matchRow(this.config.rules, row, rownum, "selected");
	if(matched_rules && matched_rules.length){
		return matched_rules[matched_rules.length - 1].rule.selected;
	}
	return false;
}

WOQLChooser.prototype.render = function(){
	if(this.renderer) return this.renderer.render(this);
}

WOQLChooser.prototype.setRenderer = function(rend){
	this.renderer = rend;
	return this;
}

WOQLChooser.prototype.getSpecialRenderer = function(row, index, type){
	const matched_rules =  new WOQLRule().matchRow(this.config.rules, row, index, type);
	for(var i = 0; i<matched_rules.length; i++){
		if(matched_rules[i].rule[type]) return matched_rules[i].rule[type];
	}
	return false;
}

WOQLChooser.prototype.renderSpecial = function(rule, row, rownum){
	if(rule && typeof rule == "function"){
		return rule(row);
	}
	if(rule && typeof rule == "string"){
		return rule;
	}
}

WOQLChooser.prototype.count = function(){
	return this.result.count();
}

WOQLChooser.prototype.first = function(){
	this.cursor = 0;
	return this.choices[this.cursor];
}

WOQLChooser.prototype.next = function () {
	const res = this.choices[this.cursor];
	this.cursor++;
	return res;
};

WOQLChooser.prototype.prev = function () {
	if (this.cursor > 0) {
		this.cursor--;
		return this.choices[this.cursor];
	}
};

module.exports = WOQLChooser;