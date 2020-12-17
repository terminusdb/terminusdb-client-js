const TerminusRule = require('./terminusRule.js');

/**
 * @file Frame Rule
 * @license Apache Version 2
 */

function FrameRule(){
	TerminusRule.TerminusRule.call(this); 
	this.pattern = new FramePattern();
}
FrameRule.prototype = Object.create(TerminusRule.TerminusRule.prototype);
FrameRule.prototype.constructor = TerminusRule.TerminusRule;

/**
 * Returns an array of rules that match the paased frame
 * @param {[FrameRule]} rules - array of rules to be tested
 * @param {Frame} frame - object frame, property frame or data from to be tested
 * @param {function} [onmatch] - optional function to be called with args (frame, rule) on each match 
 */
FrameRule.prototype.testRules = function(rules, frame, onmatch){
	var matched_rules = [];
	if(rules && rules.length){
		for(var i = 0; i<rules.length; i++){
			var match = (!rules[i].pattern || this.patternMatchesFrame(rules[i].pattern, frame));
			if(match){
				matched_rules.push(rules[i]);
				if(onmatch && typeof onmatch == "function"){
					onmatch(frame, rules[i]);
				}
			}
		}
	}
	return matched_rules;
}

/**
 * Determines whether a given pattern matches a given frame
 */
FrameRule.prototype.patternMatchesFrame = function(pattern, frame){
	if(pattern.checkFrame) {
		return pattern.checkFrame(frame);
	}
	else {
		var fp = new FramePattern().setPattern(pattern);
		return fp.checkFrame(frame);
	}
}

/**
 * Specifies that only one from among the list of properties will match 
 */
FrameRule.prototype.property = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.property;
    this.pattern.property = prop;
    return this;
}

/**
 * Specifies that only one from among the list of frame_types will match
 * frame_types are: data, oneOf, document, object? 
 */
FrameRule.prototype.frame_type = function(...frame_type){
    if(!frame_type || frame_type.length == 0) return this.pattern.frame_type;
    this.pattern.frame_type = frame_type;
    return this;
}

/**
 * Specifies that only one from among the list of labels will match
 */
FrameRule.prototype.label = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.label;
    this.pattern.label = prop;
    return this;
}

/**
 * Specifies that only one from among the list of subject ids will match
 */
FrameRule.prototype.subject = function(...prop){
    if(!prop|| prop.length == 0) return this.pattern.subject;
    this.pattern.subject = prop;
    return this;
}

/**
 * Specifies that only one from among the list of subject classes will match
 */
FrameRule.prototype.subjectClass = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.subjectClass;
    this.pattern.subjectClass = prop;
    return this;
}

/**
 * Specifies that only one from among the list of range types will match
 */
FrameRule.prototype.range = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.range;
    this.pattern.range = prop;
    return this;
}

/**
 * Specifies that only one from among the list of range types will match
 */
FrameRule.prototype.value = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.value;
    this.pattern.value = prop;
    return this;
}


/**
 * Specifies that only frames of the specified depth will match the rule
 */
FrameRule.prototype.depth = function(depth){
    if(typeof depth == "undefined") return this.pattern.depth;
    this.pattern.depth=depth;
    return this;
}

/**
 * Specifies that only frames of the specified index will match the rule (index is the order of a value in the property frame)
 */
FrameRule.prototype.index = function(...index){
    if(!index || index.length == 0) return this.pattern.index;
    this.pattern.index=index;
    return this;
}

/**
 * Specifies that only frames with the given statuses will match the rule
 */
FrameRule.prototype.status = function(...status){
    if(!status || status.length == 0) return this.pattern.status;
    this.pattern.status=status;
    return this;
}

/**
 * Specifies that the frame will only match if its parent matches the pattern passed as par
 */
FrameRule.prototype.parent = function(par){
    if(!par) return this.pattern.parent;
    this.pattern.parent = par;
    return this;
}

FrameRule.prototype.children = function(...children){
	if(typeof children == "undefined" || children.length == 0) return this.pattern.children;
	if(typeof this.pattern.children == "undefined"){
		this.pattern.children = [];
	}
	for (let i = 0; i < children.length; i++) {
		this.pattern.children.push(children[i]);
	}
	return this;
};


/**
 * @file Frame Pattern
 * A frame pattern can have the following variables
 * scope : object, property, data, * - matches a specific part of the frame
 * label : matches the label of a property
 * frame_type: object, data, document, id, oneOf
 * subject: id of the subject
 * subjectClass: class of the subject
 * range: type of a property (applies to property and data)
 * property: property id or list of property ids (parent property if it is an object or data)
 * value: value of the property
 * parent: a pattern relating to the parent of this frame
 * children: patterns for matching on the children of a frame
 * depth: how deep are we in the document? starts from 0
 * index: the index of a value in an array
 * status: updated, error, new, ok,
 */

function FramePattern(){
	TerminusRule.TerminusPattern.call(this); 
};

FramePattern.prototype = Object.create(TerminusRule.TerminusPattern.prototype);
FramePattern.prototype.constructor = TerminusRule.TerminusPattern;



FramePattern.prototype.setPattern = function(pattern){
	if(pattern.scope) this.scope = pattern.scope;
	if(typeof pattern.literal != "undefined") this.literal = pattern.literal;
	if(typeof pattern.type != "undefined") this.type = pattern.type;
	if(typeof pattern.label != "undefined") this.label = pattern.label;
	if(typeof pattern.frame_type != "undefined") this.frame_type = pattern.frame_type ;
	if(typeof pattern.subject != "undefined") this.subject = pattern.subject;
	if(typeof pattern.subjectClass != "undefined") this.subjectClass = pattern.subjectClass;
	if(typeof pattern.range != "undefined") this.range = pattern.range;
	if(typeof pattern.property != "undefined") this.property = pattern.property;
	if(typeof pattern.value != "undefined") this.value = pattern.value;
	if(typeof pattern.parent != "undefined"){
		let parent = pattern.parent;
		if(typeof parent.json != "function"){ 
			parent = new FramePattern().setPattern(parent);
		}
		this.parent = parent;
	} 
	if (pattern.children) {
		this.children = [];
		for (let i = 0; i < pattern.children.length; i++) {
			var kid = pattern.children[i];
			if(typeof kid.json != "function"){ 
				kid = new FramePattern().setPattern(kid);
			}
			this.children.push(kid);
		}
	}
	if(typeof pattern.depth != "undefined") this.depth = pattern.depth;
	if(typeof pattern.index != "undefined") this.index = pattern.index;
	if(typeof pattern.status != "undefined") this.status = pattern.status;
}

FramePattern.prototype.json = function(){
    var json = {};
	if(typeof this.literal != "undefined") json.literal = this.literal;
	if(this.type) json.type = this.type;
    if(this.scope) json.scope = this.scope;
    if(typeof this.value != "undefined") json.value = this.value;
    if(typeof this.label != "undefined") json.label = this.label;
    if(typeof this.frame_type != "undefined") json.frame_type = this.frame_type;
    if(typeof this.subject != "undefined") json.subject = this.subject;
    if(typeof this.subjectClass != "undefined") json.subjectClass = this.subjectClass;
    if(typeof this.range != "undefined") json.range = this.range;
    if(typeof this.property != "undefined") json.property = this.property;
    if(typeof this.parent != "undefined") json.parent = (this.parent.json ? this.parent.json() : this.parent);
    if(typeof this.children != "undefined") {
		json.children = [];
		for(var i = 0; i<this.children.length; i++){
			json.children.push((this.children[i].json ? this.children[i].json() : this.children[i]));
		}
	}
    if(typeof this.depth != "undefined") json.depth = this.depth;
    if(typeof this.index != "undefined") json.index = this.index;
    if(typeof this.status != "undefined") json.status = this.status;
    return json;
}

FramePattern.prototype.checkFrame = function(frame){
	var rtype = this.getRendererType(frame);
	if(!rtype) return false;
	if(this.scope && (this.scope != rtype) && (this.scope != "*" )) return false;
	if(this.illegalRuleType(rtype)) return false;
	if(this.frame_type && !this.checkFrameType(rtype, frame)) return false;
	if(this.label && !this.checkLabel(rtype, frame)) return false;
	if(this.subject && !this.checkSubject(rtype, frame)) return false;
	if(this.subjectClass && !this.checkSubjectClass(rtype, frame)) return false;
	if(this.property && !this.checkProperty(rtype, frame)) return false;
	if(typeof this.depth !== "undefined" && !this.checkDepth(rtype, frame)) return false;
	if(this.range && !this.checkRange(rtype, frame)) return false;
	if(typeof this.value != "undefined" && !this.checkValue(rtype, frame)) return false;
	if(this.type && !this.checkType(rtype, frame)) return false;
	if(typeof this.literal != "undefined" && !this.checkLiteral(rtype, frame)) return false;
	if(this.parent && !this.checkParent(rtype, frame)) return false;
	if(this.children && this.children.length && !this.checkChildren(rtype, frame)) return false;
	if(this.index && !this.checkIndex(rtype, frame)) return false;
	if(this.status && !this.checkStatus(rtype, frame)) return false;
	return true;
};

FramePattern.prototype.prettyPrint = function(type){
	//starts with obj. ...
	if(this.scope == "*"){
		var str = "all()";
	}
	else {
		var str = this.scope + "()";
    }
    if(typeof this.literal != "undefined"){
		str += ".literal(" + this.literal + ")";
	}
	if(typeof this.type != "undefined"){
		str += ".type(" + this.unpack(this.type) + ")";
	}
	if(typeof this.range != "undefined"){
		str += ".range(" + this.unpack(this.range) + ")";
	}
	if(typeof this.frame_type != "undefined"){
		str += ".frame_type(" + this.unpack(this.frameType) + ")";
	}
	if(typeof this.label != "undefined"){
		str += ".label(" + this.unpack(this.label) + ")";
	}
	if(typeof this.subject != "undefined"){
		str += ".subject(" + this.unpack(this.subject) + ")";
	}
	if(typeof this.subjectClass != "undefined"){
		str += ".subjectClass(" + this.unpack(this.subjectClass) + ")";
	}
	if(typeof this.property != "undefined"){
		str += ".property(" + this.unpack(this.property) + ")";
	}
	if(typeof this.value != "undefined"){
		str += ".value(" + this.unpack(this.value, true) + ")";
	}
	if(typeof this.children != "undefined" && this.children.length > 0){
		str += ".children(\n";
		var kids = this.children;
		for(var i = 0; i< kids.length; i++){
			str += "View.pattern()." + kids[i].prettyPrint();
			if(i < kids.length-1) str += ",";
			str += "\n";
		}
		str += ")";
	}
	if(typeof this.parent != "undefined"){
		str += ".parent(View.pattern()." + this.parent.prettyPrint() + ")";
	}
	if(typeof this.depth != "undefined"){
		str += ".depth(" + this.unpack(this.depth, true) + ")";
	}
	if(typeof this.index != "undefined"){
		str += ".index(" + this.unpack(this.index, true) + ")";
	}
	if(typeof this.status != "undefined"){
		str += ".status(" + this.unpack(this.status) + ")";
	}
	return str;
}

FramePattern.prototype.illegalRuleType = function (rtype) {
	// data frames have no children
	if (rtype == 'data' && this.children && this.children.length) return true;
	// object frames have no range
	if (rtype == 'object' && this.range) return true;
	return false;
};

/* subject is an id or an array of ids,
/* match is positive if the renderer's subject appears in the array or is the id
 */
FramePattern.prototype.checkSubject = function (subject, frame) {
	if (typeof this.subject !== 'object' || !this.subject.length) this.subject = [this.subject];
	const rsubj = frame.subject();
	for (let i = 0; i < this.subject.length; i++) {
		if (this.IDsMatch(subject[i], rsubj)) {
			return true;
		}
	}
	return false;
};

// at least one child must match all child rules
FramePattern.prototype.checkChildren = function (rtype, frame) {
	for (let i = 0; i < this.children.length; i++) {
		let found = false;
		if (rtype == 'object') {
			for (const prop in frame.properties) {
				if (this.children[i].checkFrame(frame.properties[prop])) {
					found = true;
					continue;
				}
			}
		} else if (rtype == 'property') {
			for (let j = 0; j <= renderer.values.length; j++) {
				if (this.children[j].checkFrame(frame.values[j])) {
					found = true;
					continue;
				}
			}
		}
		if (!found) return false;
	}
	return true;
};

FramePattern.prototype.checkStatus = function (rtype, frame) {
	if (typeof this.status !== 'object' || this.status.length == 0) this.status = [this.status];
	for (let i = 0; i < this.status.length; i++) {
		if (this.status[i] == 'updated' && !frame.isUpdated()) return false;
		if (this.status[i] == 'new' && !frame.isNew()) return false;
		if (this.status[i] == 'unchanged' && frame.isUpdated()) return false;
	}
	return true;
};

FramePattern.prototype.checkDepth = function (rtype, frame) {
	return this.numberMatch(this.depth, frame.depth());
};

FramePattern.prototype.checkParent = function (rtype, frame) {
	return this.parent.checkFrame(frame.parent);
};

FramePattern.prototype.checkIndex = function (rtype, frame) {
	if (rtype == 'data') {
		return this.index == frame.index;
	}
	return false;
};

FramePattern.prototype.checkProperty = function (rtype, frame) {
	if (typeof this.property !== 'object' || !this.property.length) this.property = [this.property];
	for (let i = 0; i < this.property.length; i++) {
		if (this.propertyIDsMatch(frame.property(), this.property[i])) {
			return true;
		}
	}
	return false;
};


/**
 * Checks to make sure the frame is among the specified types 
 */
FramePattern.prototype.checkType = function (rtype, frame) {
	if(rtype == "object") var vs = frame.subjectClass();
	else var vs = typeof frame.range == "function" ? frame.range() : frame.range;
    if(!Array.isArray(this.type)) this.type = [this.type];
	if(this.type.indexOf(vs) === -1) return false;
	return true;
}

FramePattern.prototype.checkLiteral = function (rtype, frame) {
	if(rtype == "object") return false;
	if(rtype == "property") return false;
	if(rtype == "data") return frame.isDatatypeProperty();
	return true;
}


// returns true if any of the values are found
FramePattern.prototype.checkValue = function (rtype, frame) {
	if (typeof this.value !== 'object' || !this.value.length) this.value = [this.value];
	for (let i = 0; i < this.value.length; i++) {
		if (rtype == 'data') {
			if (this.valuesMatch(frame.get(), this.value[i])) {
				return true;
			}
		} else if (rtype == 'property') {
			for (let j = 0; j <= frame.values.length; j++) {
				if (this.getRendererType(frame.values[i]) == 'data'
						&& this.valuesMatch(frame.values[i].get(), this.value[i])) {
					return true;
				}
			}
		} else if (rtype == 'object') {
			for (const prop in frame.properties) {
				if (this.checkValue(this.getRendererType(frame.properties[prop]), frame.properties[prop])) {
					return true;
				}
			}
		}
	}
	return false;
};

FramePattern.prototype.checkRange = function (rtype, frame) {
	if (typeof this.range !== 'object' || !this.range.length) this.range = [this.range];
	for (let i = 0; i < this.range.length; i++) {
		if (this.rangeIDsMatch(frame.range(), this.range[i])) {
			return true;
		}
	}
	return false;
};

FramePattern.prototype.checkSubjectClass = function (rtype, frame) {
	if (typeof this.subjectClass !== 'object' || !this.subjectClass.length) this.subjectClass = [this.subjectClass];
	const rcls = frame.subjectClass();
	for (let i = 0; i < this.subjectClass.length; i++) {
		if (this.classIDsMatch(this.subjectClass[i], rcls)) {
			return true;
		}
	}
	return false;
};

FramePattern.prototype.checkFrameType = function (rtype, frame) {
	if (rtype == 'object') return (this.frame_type.indexOf('object') != -1);
	if (rtype == 'data') {
		if (frame.frame) {
			return (this.frame_type.indexOf(frame.frame.ftype()) != -1);
		}
	}
	if (rtype == 'property') return false;
};

FramePattern.prototype.checkLabel = function (rtype, frame) {
	if (typeof frame.getLabel !== 'function') {
		console.log(new Error('Rule passed to check label with broken renderer object - no getLabel'));
		return false;
	}
	for (let i = 0; i < this.label.length; i++) {
		if(this.stringMatch(this.label[i], frame.getLabel())) return true;
	}
	return false;
};


FramePattern.prototype.getRendererType = function (frame) {
	if (frame.isProperty()) return 'property';
	if (frame.isObject()) return 'object';
	if (frame.isData()) return 'data';
	if (frame.renderer_type) return frame.renderer_type;
	console.log(new Error(`frame configuration passed non-renderer type ${frame.constructor.name}`));
	return false;
};

module.exports = FrameRule;