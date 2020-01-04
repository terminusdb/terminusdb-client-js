/**
 * @file Terminus Rules 
 * @license Apache Version 2
 * @summary Terminus Rules support pattern matching on documents and results with an effect being carried out on each match
 */
const TerminusRule = require('./terminusRule.js');
const UTILS = require('./utils.js');

function WOQLRule(){
	TerminusRule.TerminusRule.call(this); 
	this.pattern = new WOQLPattern();
}


WOQLRule.prototype = Object.create(TerminusRule.TerminusRule.prototype);
WOQLRule.prototype.constructor = TerminusRule.TerminusRule;

WOQLRule.prototype.setVariables = function(vars){
	if(vars && vars.length){
		this.pattern.variables = UTILS.addNamespacesToVariables(vars);
		this.current_variable = this.pattern.variables[this.pattern.variables.length - 1];
	}
	return this;
}

WOQLRule.prototype.v = function(v){
	if(v){
		if(v.substring(0, 2) != "v:") v = "v:" + v;
		this.current_variable = v;
		return this;
	}
	return this.current_variable;
}

WOQLRule.prototype.in = function(...list){
	if(this.current_variable){
		if(!this.pattern.constraints) this.pattern.constraints = {};
		if(!this.pattern.constraints[this.current_variable]) this.pattern.constraints[this.current_variable] = [];
		this.pattern.constraints[this.current_variable].push(list);
	}
	return this;
}

WOQLRule.prototype.filter = function(tester){
	if(this.current_variable){
		if(!this.pattern.constraints) this.pattern.constraints = {};
		if(!this.pattern.constraints[this.current_variable]) this.pattern.constraints[this.current_variable] = [];
		this.pattern.constraints[this.current_variable].push(tester);
	}
	return this;
}

WOQLRule.prototype.match = function(data, key, context, action){
	if(context && this.pattern.scope != context) return false;
	if(key){
		if(this.pattern.variables && this.pattern.variables.length){
			if(typeof key == "object"){
				if(this.pattern.variables.indexOf(key[0]) == -1) return false;
				if(this.pattern.variables.indexOf(key[1]) == -1) return false;
			}
			else if(this.pattern.variables.indexOf(key) == -1) return false;
		}
		if(this.pattern && this.pattern.type){
			if(typeof key == "object"){
				if(!(data[key][0]["@type"] && this.pattern.type.indexOf(data[key][0]["@type"]) != -1)){
					return false;
				}
			}
			else if(!(data[key]["@type"] && this.pattern.type.indexOf(data[key]["@type"]) != -1)){
				return false;
			}
		}
		if(this.pattern && typeof this.pattern.literal != "undefined"){
			if(typeof key == "object"){
				if(data[key[0]]['@value']) {
					if(!this.pattern.literal) return false;
				}
				else if(this.pattern.literal) return false;
			}
			else {
				if(data[key]['@value']) {
					if(!this.pattern.literal) return false;
				}
				else if(this.pattern.literal) return false;
			}
		}
		if(typeof key == "object"){
			if(this.pattern.constraints && this.pattern.constraints[key[0]]){
				if(!data) return false;
				for(var i = 0; i<this.pattern.constraints[key[0]].length; i++){
					if(!this.test(data[key[0]], this.pattern.constraints[key][0])){
						return false;
					}
				}
			}
			if(this.pattern.constraints && this.pattern.constraints[key[1]]){
				if(!data) return false;
				for(var i = 0; i<this.pattern.constraints[key[1]].length; i++){
					if(!this.test(data[key[1]], this.pattern.constraints[key][1])){
						return false;
					}
				}
			}
		}
		else if(this.pattern.constraints && this.pattern.constraints[key]){
			if(!data) return false;
			for(var i = 0; i<this.pattern.constraints[key].length; i++){
				if(!this.test(data[key], this.pattern.constraints[key])){
					return false;
				}
			}
		}
		if(context == "edge"){
			if(this.pattern.source && this.pattern.source != key[0]) return false;
			if(this.pattern.target && this.pattern.target != key[1]) return false;
		}
	}
	else {
		for(var k in this.pattern.constraints){
			if(!data) return false;
			for(var i = 0; i<this.pattern.constraints[k].length; i++){
				if(!this.test(data[k], this.pattern.constraints[k])){
					return false;
				}
			}
		}
	}
	if(action && typeof this.pattern[action] == "undefined") return false;
	return true;
}

WOQLRule.prototype.test = function(value, constraint){
	if(typeof constraint == "object" && constraint.length){
		var vundertest = (value['@value'] ? value['@value'] : value);
		return (constraint.indexOf(vundertest) != -1);
	}
	if(typeof constraint == "function"){
		return constraint(value);
	}
}

WOQLRule.prototype.getMatchingRules = function(rules, row, key, context, action){
	var matches = [];
	for(var i = 0; i<rules.length; i++){
		if(rules[i].match(row, key, context, action)){
			matches.push(rules[i].pattern);
		}
	}
	return matches;
}

function WOQLPattern(pattern){
	TerminusRule.TerminusPattern.call(this,pattern); 
};

WOQLPattern.prototype = Object.create(TerminusRule.TerminusPattern.prototype);
WOQLPattern.prototype.constructor = TerminusRule.TerminusPattern;

WOQLPattern.prototype.prettyPrint = function(type){
	//starts with obj. ...
	var str = this.scope + "('";
	if(this.variables){
		str += this.variables.join("', '");
	 }
	 str += "')";
	if(typeof this.literal != "undefined"){
		str += ".literal(" + this.literal + ")";
	}
	if(typeof this.type != "undefined"){
		str += ".type(" + JSON.stringify(UTILS.removeNamespacesFromVariables(this.type)) + ")";
	}
	for(var v in this.constraints){
		str += ".v('" + v + "')";
		for(var i = 0; i<this.constraints[v].length; i++){
			if(typeof(this.constraints[v][i]) == "function"){
				str += ".filter(" + this.pattern.constraints[v][i] + ")";
			}
			else {
				str += ".in(" + JSON.stringify(this.pattern.constraints[v][i]) + ")";
			}
		}
	}
	return str;
}


module.exports = WOQLRule ;
