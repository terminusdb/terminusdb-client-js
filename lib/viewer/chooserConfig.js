const Config  = require('./viewConfig.js');
const WOQLChooser  = require('./woqlChooser.js');
const UTILS = require('../utils');

function WOQLChooserConfig(){
    Config.ViewConfig.call(this); 
    this.type = "chooser";
}

WOQLChooserConfig.prototype = Object.create(Config.ViewConfig.prototype);
WOQLChooserConfig.prototype.constructor = Config.ViewConfig;

WOQLChooserConfig.prototype.create = function(client){
	var wqt = new WOQLChooser(client, this);
	return wqt;
}

WOQLChooserConfig.prototype.prettyPrint = function(){
    var str = "view = View.chooser();\n";
    str += this.getBasicPrettyPrint();
	if(typeof this.change() != "undefined"){
		str += "view.change(" + this.change() + ")\n";
	}
	if(typeof this.show_empty() != "undefined"){
		str += "view.show_empty('" + this.show_empty() + "')\n";
	}
	if(typeof this.values() != "undefined"){
		str += "view.values('" + UTILS.removeNamespaceFromVariable(this.values()) + "')\n";
	}
	if(typeof this.labels() != "undefined"){
		str += "view.labels('" + UTILS.removeNamespaceFromVariable(this.labels()) + "')\n";
	}
	if(typeof this.titles() != "undefined"){
		str += "view.titles('" + UTILS.removeNamespaceFromVariable(this.titles()) + "')\n";
	}
	if(typeof this.sort() != "undefined"){
		str += "view.sort(" + this.sort() + ")\n";
	}
	if(typeof this.direction() != "undefined"){
		str += "view.direction('" + this.direction() + "')\n";
	}
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint("chooser") + "\n";
	}
	return str;
}

WOQLChooserConfig.prototype.json = function(){
	var conf = this.getBasicJSON();
	if(typeof this.change() != "undefined"){
		conf['change'] = this.change();
	}
	if(typeof this.show_empty() != "undefined"){
		conf['show_empty'] = this.show_empty();
	}
	if(typeof this.values() != "undefined"){
		conf['values'] = this.values();
	}
	if(typeof this.labels() != "undefined"){
		conf['labels'] = this.labels();
	}
	if(typeof this.titles() != "undefined"){
		conf['titles'] = this.titles();
	}
	if(typeof this.sort() != "undefined"){
		conf['sort'] = this.sort();
	}
	if(typeof this.direction() != "undefined"){
		conf['direction'] = this.direction();
	}
	let mj = {"chooser" :conf, "rules": this.getRulesJSON()};
	return mj;
}

WOQLChooserConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLChooserRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
    this.rules = jr;
    this.loadBasicJSON(config);
	if(typeof config.change != "undefined"){
		this.change(config.change);
	}
	if(typeof config.show_empty != "undefined"){
		this.show_empty(config.show_empty);
	}
	if(typeof config.values != "undefined"){
		this.values(config.values);
	}
	if(typeof config.labels != "undefined"){
		this.labels(config.labels);
	}
	if(typeof config.titles != "undefined"){
		this.titles(config.titles);
	}
	if(typeof config.sort != "undefined"){
		this.sort(config.sort);
	}
	if(typeof config.direction != "undefined"){
		this.direction(config.direction);
	}
}

WOQLChooserConfig.prototype.change = function(v){
	if(typeof v != "undefined"){
		this.onChange = v;
		return this;
	}
	return this.onChange;
}

WOQLChooserConfig.prototype.show_empty = function(p){
	if(typeof p != "undefined"){
		this.placeholder = p;
		return this;
	}
	return this.placeholder;
}

WOQLChooserConfig.prototype.rule = function(v){
	let nr = new WOQLChooserRule().scope("row");
    this.rules.push(nr);
    if(v) nr.vars(v);
    //if(v) nr.v(v);
    return nr;
}

WOQLChooserConfig.prototype.values = function(v){
	if(typeof v != "undefined"){
		if(v.substring(0, 2) == "v:") v = v.substring(2);
		this.value_variable = v;
		return this;
	}
	return this.value_variable;
}

WOQLChooserConfig.prototype.labels = function(v){
	if(v){
		if(v.substring(0, 2) == "v:") v = v.substring(2);
		this.label_variable = v;
		return this;
	}
	return this.label_variable;
}

WOQLChooserConfig.prototype.titles = function(v){
	if(v){
		if(v.substring(0, 2) == "v:") v = v.substring(2);
		this.title_variable = v;
		return this;
	}
	return this.title_variable;
}

WOQLChooserConfig.prototype.sort = function(v){
	if(v){
		if(v.substring(0, 2) == "v:") v = v.substring(2);
		this.sort_variable = v;
		return this;
	}
	return this.sort_variable;
}

WOQLChooserConfig.prototype.direction = function(v){
	if(v){
		this.sort_direction = v;
		return this;
	}
	return this.sort_direction;
}


function WOQLChooserRule(scope){
	Config.WOQLViewRule.call(this,scope); 
};

WOQLChooserRule.prototype = Object.create(Config.WOQLViewRule.prototype);
WOQLChooserRule.prototype.constructor = Config.WOQLViewRule;

WOQLChooserRule.prototype.label = function(l){
	if(l){
		this.rule.label = l;
		return this;
	}
	return this.rule.label;
}

WOQLChooserRule.prototype.title = function(l){
	if(l){
		this.rule.title = l;
		return this;
	}
	return this.rule.title;
}

WOQLChooserRule.prototype.values = function(l){
	if(l){
		this.rule.values = l;
		return this;
	}
	return this.rule.values;
}

WOQLChooserRule.prototype.selected = function(s){
	if(typeof s != "undefined"){
		this.rule.selected = s;
		return this;
	}
	return this.rule.selected;
}

WOQLChooserRule.prototype.prettyPrint = function(type){
	var str = WOQLViewRule.prototype.prettyPrint.apply(this);
    if(typeof this.selected() != "undefined"){
	    str += ".selected(" + this.selected() + ")";
    }
    if(typeof this.label() != "undefined"){
	    str += ".label(\"" + this.label() + "\")";
    }
    if(typeof this.title() != "undefined"){
	    str += ".title(\"" + this.title() + "\")";
    }
    if(typeof this.values() != "undefined"){
	    str += ".values(\"" + this.values() + "\")";
	}
	return str;
}

module.exports = WOQLChooserConfig;