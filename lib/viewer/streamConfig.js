const Config  = require('./viewConfig.js');
const WOQLStream  = require('./woqlStream.js');

function WOQLStreamConfig(){
    Config.ViewConfig.call(this); 
    this.type = "stream";
}

WOQLStreamConfig.prototype = Object.create(Config.ViewConfig.prototype);
WOQLStreamConfig.prototype.constructor = Config.ViewConfig;

WOQLStreamConfig.prototype.create = function(client){
	var wqt = new WOQLStream(client, this);
	return wqt;
}

WOQLStreamConfig.prototype.row = function(){
    var wqt = new WOQLStreamRule().scope("row");
    this.rules.push(wqt);    
	return wqt;
}

WOQLStreamConfig.prototype.template = function(template){
	if(!template) return this.mtemplate; 
	this.mtemplate = template;
	return this;
}


WOQLStreamConfig.prototype.prettyPrint = function(){
	var str = "view = View.stream();\n";
	if(typeof this.template() != "undefined"){
		str += "view.template(" + JSON.stringify(this.template()) + ")\n";
	}
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint() + "\n";
	}
	return str;
}

WOQLStreamConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLStreamRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
	if(config.template){
		this.mtemplate = config.template;
	}
}

WOQLStreamConfig.prototype.json = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	var conf = {};
	if(this.mtemplate){
		conf.template = this.mtemplate;
	}
	let mj = {"stream" :conf, "rules": jr};
	return mj;
}

function WOQLStreamRule(){
	Config.WOQLViewRule.call(this); 
};

WOQLStreamRule.prototype = Object.create(Config.WOQLViewRule.prototype);
WOQLStreamRule.prototype.constructor = Config.WOQLViewRule;

WOQLStreamRule.prototype.template = function(template){
	if(!template) return this.rule.template; 
	this.rule.template = template;
	return this;
}

module.exports = WOQLStreamConfig;