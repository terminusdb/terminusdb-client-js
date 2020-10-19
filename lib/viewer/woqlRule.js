const TerminusRule = require('./terminusRule.js');
const UTILS = require('../utils.js');

/**
 * @file WOQL Rules 
 * @license Apache Version 2
 * WOQL Rules support pattern matching on results of WOQL Queries 
 */

function WOQLRule(){
	TerminusRule.TerminusRule.call(this); 
	this.pattern = new WOQLPattern();
}
WOQLRule.prototype = Object.create(TerminusRule.TerminusRule.prototype);
WOQLRule.prototype.constructor = TerminusRule.TerminusRule;

/** 
 * Specifies that the rule only applies to specific variables returned by the WOQL query
 * @param {[String]} - array of strings, each representing a variable name, variable prefixes ("v:") are added automatically if absent
 */
WOQLRule.prototype.setVariables = function(vars){
	if(vars && vars.length){
		this.pattern.variables = UTILS.removeNamespacesFromVariables(vars);
		this.current_variable = this.pattern.variables[this.pattern.variables.length - 1];
	}
	return this;
}

/**
 * Shorthand to the above using spread operator
 */
WOQLRule.prototype.vars = function(...varlist){
	return this.setVariables(varlist);
}

/**
 * Specifies that the rule applies to a specific variable, variable prefix ("v:") is added automatically if absent
 */
WOQLRule.prototype.v = function(v){
	if(v){
		this.current_variable = UTILS.removeNamespaceFromVariable(v);
		return this;
	}
	return this.current_variable;
}


/**
 * Specifies that the rule applies to a specific edge, a source -> target pair of variables
 */
WOQLRule.prototype.edge = function(source, target){
	this.scope("edge");
	if(source){
		let vs = UTILS.removeNamespaceFromVariable(source);
		this.setVariables([vs]);
		this.pattern.source = vs;
	} 
	if(target){
		let vs = UTILS.removeNamespaceFromVariable(target);
		if(!source) this.setVariables([vs]);
		this.pattern.target = vs;
	}
	return this;
}

/**
 * Specifies that the rule applies to a specific edge, a source -> target pair of variables
 */
WOQLRule.prototype.rownum = function(rownum){
	if(typeof rownum == "undefined") return this.pattern.rownum; 
	this.pattern.rownum = rownum;
	return this;
}

/**
 * Specifies that the value of a variable must be one of the values contained in the list
 * @param {[String|Number]} list - parameters are any atomic value (string | number) - the rule will match only cells that have one of these values
 */
WOQLRule.prototype.in = function(...list){
	if(this.current_variable){
		if(!this.pattern.constraints) this.pattern.constraints = {};
		if(!this.pattern.constraints[this.current_variable]) this.pattern.constraints[this.current_variable] = [];
		this.pattern.constraints[this.current_variable].push(list);
	}
	return this;
}

/**
 * Specifies a filter function to apply to each element - only those values that return true when this filter is invoked will be matched
 * @param {function} tester - test function that will be used to filter values
 */
WOQLRule.prototype.filter = function(tester){
	if(this.current_variable){
		if(!this.pattern.constraints) this.pattern.constraints = {};
		if(!this.pattern.constraints[this.current_variable]) this.pattern.constraints[this.current_variable] = [];
		this.pattern.constraints[this.current_variable].push(tester);
	}
	return this;
}

WOQLRule.prototype.matchRow = function(rules, row, rownum, action){
	var matches = [];
	for(var i = 0; i<rules.length; i++){
		if(action && this.rule && typeof this.rule[action] === "undefined") continue;
		if(rules[i].pattern.matchRow(row, rownum)){
			matches.push(rules[i]);
		}
	}
	return matches;
}

WOQLRule.prototype.matchCell = function(rules, row, key, rownum, action){
	var matches = [];
	for(var i = 0; i<rules.length; i++){
		if(action && this.rule && typeof this.rule[action] == "undefined") continue;
		if(rules[i].pattern.matchCell(row, key, rownum)){
			matches.push(rules[i]);
		}
	}
	return matches;
}

WOQLRule.prototype.matchColumn = function(rules, key, action){
	var matches = [];
	for(var i = 0; i<rules.length; i++){
		if(action && this.rule && typeof this.rule[action] == "undefined") continue;
		if(rules[i].pattern.matchColumn(key)){
			matches.push(rules[i]);
		}
	}
	return matches;   
}

WOQLRule.prototype.matchNode = function(rules, row, key, nid, action){
	var matches = [];
	for(var i = 0; i<rules.length; i++){
		if(action && this.rule && typeof this.rule[action] == "undefined") continue;
		if(rules[i].pattern.matchNode(row, key, nid)){
			matches.push(rules[i]);
		}
	}
	return matches;
}

WOQLRule.prototype.matchPair = function(rules, row, keya, keyb, action){
	var matches = [];
	for(var i = 0; i<rules.length; i++){
		if(action && this.rule && typeof this.rule[action] == "undefined") continue;
		if(rules[i].pattern.matchPair(row, keya, keyb)){
			matches.push(rules[i]);
		}
	}
	return matches;
}

//alias
WOQLRule.prototype.matchEdge = WOQLRule.prototype.matchPair;


/**
 * Object to encapsulate the matching of woql result patterns - inherits from TerminusRule
 * @param {Object} pattern 
 */
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
		str += ".type(" + this.unpack(this.type) + ")";
	}
	if(typeof this.value != "undefined"){
		str += ".value(" + this.unpack(this.value, true) + ")";
	}
	for(var v in this.constraints){
		str += ".v('" + v + "')";
		for(var i = 0; i<this.constraints[v].length; i++){
			if(typeof(this.constraints[v][i]) == "function"){
				str += ".filter(" + this.constraints[v][i] + ")";
			}
			else {
				str += ".in(" + json.unpack(this.constraints[v][i]) + ")";
			}
		}
	}
	return str;
}

/**
 * @param {String|Object} data
 * @param {String|[String, String]} [key] - a variable or an array of two variables (in the case of edge scope) which constitutes the key being tested
 * @param {String} [scope] - the scope in which the test is being carried out (row, column, cell)
 */

WOQLPattern.prototype.matchRow = function(row, rownum){
	if(typeof this.rownum != "undefined" && typeof rownum != "undefined"){
		if(!this.numberMatch(this.rownum, rownum)) return false;
	}
	if(this.scope && this.scope != "row") return false;
	if(!this.testVariableConstraints(row)) return false;
	return true;
}

WOQLPattern.prototype.matchCell = function(row, key, rownum){
	if(typeof this.rownum != "undefined" && typeof rownum != "undefined"){
		if(!this.numberMatch(this.rownum, rownum)) return false;
	}
	if(!this.testBasics("column", row[key])) return false;
	if(this.variables && this.variables.length && this.variables.indexOf(key) == -1) return false;
	if(!this.testVariableConstraints(row)) return false;
	return true;	
}

WOQLPattern.prototype.matchNode = function(row, key, nid){
	if(!this.testBasics("node", row[key])) return false;
	if(this.variables && this.variables.length && this.variables.indexOf(key) == -1) return false;
	if(!this.testVariableConstraints(row)) return false;
	return true;	
}

WOQLPattern.prototype.matchColumn = function(key){
	if(this.scope && this.scope != "column") return false;	
	if(this.variables && this.variables.length && this.variables.indexOf(key) == -1) return false;
	return true;
}

WOQLPattern.prototype.matchPair = function(row, keya, keyb){
	if(this.scope && this.scope != "edge") return false;	
	if(this.source && this.source != keya) return false;
	if(this.target && this.target != keyb) return false;
	if(!this.testVariableConstraints(row)) return false;
	return true;
}

WOQLPattern.prototype.testVariableConstraints = function(row){
	for(var k in this.constraints){
		if(!this.testVariableConstraint(k, row[k])) return false;
	}
	return true;
}

WOQLPattern.prototype.testVariableConstraint = function(name, val){
	if(!this.constraints[name]) return true;
	for(var i = 0; i<this.constraints[name].length; i++){
		if(!this.testValue(val, this.constraints[name][i])){
			return false;
		}
	}
	return true;
}

WOQLPattern.prototype.setPattern = function(pattern){
	for(var key in pattern){
		this[key] = pattern[key];
	}
}

WOQLPattern.prototype.json = function(){
	var json = {};
	if(this.scope){
		json.scope = this.scope;
	}
	if(this.value){
		json.value = this.value;
	}
	if(this.rownum) json.rownum = this.rownum;
	if(this.variables) json.variables = this.variables;
	if(this.literal) json.literal = this.literal;
	if(this.type) json.type = this.type;
	if(this.constraints) json.constraints = this.constraints;
	if(this.source) json.source = this.source;
	if(this.target) json.target = this.target;
	return json;
}


module.exports = WOQLRule ;
