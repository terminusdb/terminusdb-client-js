/**
 * @file Terminus Rules
 * @license Apache Version 2
 * @summary Abstract object to support applying matching rules to result sets and documents
 * sub-classes are FrameRule and WOQLRule - this just has common functions
 */

const UTILS = require('./utils.js');

function TerminusRule(){}

TerminusRule.prototype.literal = function(tf){
	if(typeof tf == "undefined"){
		return this.pattern.literal;
	}
	this.pattern.literal = tf;
	return this;
}

TerminusRule.prototype.type = function(...list){
	if(typeof list == "undefined" || list.length == 0){
		return this.pattern.type;
	}
	this.pattern.type = list;
	return this;
}

TerminusRule.prototype.scope = function(scope){
	if(typeof scope == "undefined"){
		return this.pattern.scope;
	}
	this.pattern.scope = scope;
	return this;
}

TerminusRule.prototype.value = function(val){
	if(typeof val == "undefined"){
		return this.pattern.value;
	}
	this.pattern.value = val;
	return this;
}

TerminusRule.prototype.json = function(mjson){
	if(!mjson) {
		var njson = {};
		if(this.pattern) njson.pattern = this.pattern.json();
		return njson;
	}
	else {
		this.setPattern(mjson.pattern);
	}
	return this;
}

function TerminusPattern(pattern){};


TerminusPattern.prototype.setPattern = function(pattern){
	if(typeof pattern.literal != "undefined") this.literal = pattern.literal;
	if(pattern.type) this.pattern.type = pattern.type;
	if(pattern.scope) this.pattern.scope = pattern.scope;
}

TerminusPattern.prototype.json = function(){
    var json = {};
	if(typeof this.literal != "undefined") json.literal = this.literal;
	if(this.type) json.type = this.type;
    if(this.scope) json.scope = this.scope;
    if(this.value) json.value = this.value;
    return json;
}


TerminusPattern.prototype.IDsMatch = function (ida, idb) {
	return UTILS.compareIDs(ida, idb);
};

TerminusPattern.prototype.classIDsMatch = function (ida, idb) {
	return this.IDsMatch(ida, idb);
};
TerminusPattern.prototype.propertyIDsMatch = function (ida, idb) {
	const match = this.IDsMatch(ida, idb);
	return match;
};
TerminusPattern.prototype.rangeIDsMatch = function (ida, idb) {
	return this.IDsMatch(ida, idb);
};
TerminusPattern.prototype.valuesMatch = function (vala, valb) {
	return vala == valb;
};
TerminusPattern.prototype.numberMatch = function (vala, valb) {
	if (typeof vala === 'string') {
		try {
			return eval(valb + vala);
		} catch (e) {
			return false;
		}
	}
	return vala === valb;
};

TerminusPattern.prototype.stringMatch = function (vala, valb) {
	const pat = new RegExp(vala);
	return pat.test(valb);
};


 module.exports = {TerminusRule, TerminusPattern};