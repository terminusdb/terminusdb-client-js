const TerminusRule = require('./terminusRule.js');


function FrameRule(){
	TerminusRule.TerminusRule.call(this); 
	this.pattern = new FramePattern();
}


FrameRule.prototype = Object.create(TerminusRule.TerminusRule.prototype);
FrameRule.prototype.constructor = TerminusRule.TerminusRule;


FrameRule.prototype.testRules = function(rules, frame, onmatch){
	var matched_rules = [];
	if(rules && rules.length){
		for(var i = 0; i<rules.length; i++){
			var match = (!rules[i].pattern || this.patternMatchesFrame(rules[i].pattern.json(), frame));
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
	if(typeof pattern == "object" && pattern.length){ //multiple patterns are ANDed
		for(var i = 0 ; i<pattern.length; i++){
			var fp = new FramePattern(pattern[i]);
			if(!fp.checkFrame(frame)) return false;
		}
		return true;
	}
	else {
		var fp = new FramePattern(pattern);
		return fp.checkFrame(frame);
	}
}

FrameRule.prototype.property = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.property;
    this.pattern.property = prop;
    return this;
}

FrameRule.prototype.frame_type = function(...frame_type){
    if(!frame_type || frame_type.length == 0) return this.pattern.frame_type;
    this.pattern.frame_type = frame_type;
    return this;
}

FrameRule.prototype.label = function(prop){
    if(!prop || prop.length == 0) return this.pattern.label;
    this.pattern.label = prop;
    return this;
}

FrameRule.prototype.subject = function(...prop){
    if(!prop|| prop.length == 0) return this.pattern.subject;
    this.pattern.subject = prop;
    return this;
}

FrameRule.prototype.subjectClass = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.subjectClass;
    this.pattern.subjectClass = prop;
    return this;
}

FrameRule.prototype.range = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.range;
    this.pattern.range = prop;
    return this;
}

FrameRule.prototype.parent = function(par){
    if(!par) return this.pattern.parent;
    this.pattern.parent = par;
    return this;
}

FrameRule.prototype.children = function(...prop){
    if(!prop || prop.length == 0) return this.pattern.children;
    this.pattern.children= prop;
    return this;
}

FrameRule.prototype.depth = function(depth){
    if(!depth) return this.pattern.depth;
    this.pattern.depth=depth;
    return this;
}

FrameRule.prototype.index = function(...index){
    if(!index || index.length == 0) return this.pattern.index;
    this.pattern.index=index;
    return this;
}

FrameRule.prototype.status = function(...status){
    if(!status || status.length == 0) return this.pattern.status;
    this.pattern.status=status;
    return this;
}


function FramePattern(pattern){
	TerminusRule.TerminusPattern.call(this,pattern); 
};

FramePattern.prototype = Object.create(TerminusRule.TerminusPattern.prototype);
FramePattern.prototype.constructor = TerminusRule.TerminusPattern;

/**
 * A frame pattern can have the following variables
 * renderer : object, property, data, * - matches a specific part of the frame
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

FramePattern.prototype.setPattern = function(pattern){
	this.scope = (pattern.scope ? pattern.scope: false);
	this.label = (pattern.label ? pattern.label : false);
	this.frame_type = (pattern.frame_type ? pattern.frame_type : false);
	this.subject = (pattern.subject ? pattern.subject : false);
	this.subjectClass = (pattern.subjectClass ? pattern.subjectClass : false);
	this.range = (pattern.range ? pattern.range : false);
	this.property = (pattern.property ? pattern.property : false);
	this.value = (pattern.value ? pattern.value : false);
	this.parent = (pattern.parent ? new FramePattern(pattern.parent) : false);
	this.children = [];
	if (pattern.children) {
		for (let i = 0; i < pattern.children.length; i++) {
			this.children.push(new FramePattern(pattern.children[i]));
		}
	}
	this.depth = (typeof pattern.depth !== 'undefined' ? pattern.depth : false);
	this.index = (pattern.index ? pattern.index : false);
	this.status = (pattern.status ? pattern.status : false);
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
	if(this.depth !== false && !this.checkDepth(rtype, frame)) return false;
	if(this.range && !this.checkRange(rtype, frame)) return false;
	if(this.value && !this.checkValue(rtype, frame)) return false;
	if(this.parent && !this.checkParent(rtype, frame)) return false;
	if(this.children && this.children.length && !this.checkChildren(rtype, frame)) return false;
	if(this.index && !this.checkIndex(rtype, frame)) return false;
	if(this.status && !this.checkStatus(rtype, frame)) return false;
	return true;
};

FramePattern.prototype.unpack = function(arr, nonstring){
	if(nonstring) var str = arr.join(",");
	var str = "'" + arr.join("','") + "'";
	return str;
}

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
		str += ".type(" + JSON.stringify(UTILS.removeNamespacesFromVariables(this.type)) + ")";
	}
	if(typeof this.frameType != "undefined"){
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
		str += ".value(" + this.unpack(this.value) + ")";
	}
	if(typeof this.children != "undefined" && this.children.length > 0){
		str += ".children(\n";
		var kids = this.children;
		for(var i = 0; i< kids.length; i++){
			//str += "WOQL." + kids[i].prettyPrint() + "\n";
		}
		str += ")";
	}
	if(typeof this.parent() != "undefined"){
		//str += ".parent(" + this.parent.prettyPrint() + ")";
	}
	if(typeof this.depth != "undefined"){
		var d = this.depth;
		if(typeof d == "string"){
			str += ".depth('" + d + "')";
		}
		else {
			str += ".depth(" + d + ")";
		}
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
	if (rtype == 'data' && this.children.length) return true;
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

// returns true if any of the values are found
FramePattern.prototype.checkValue = function (rtype, frame) {
	if (typeof this.value !== 'object' || !this.value.length) this.value = [this.value];
	for (let i = 0; i < this.value.length; i++) {
		if (rtype == 'data') {
			if (this.valuesMatch(frame.value(), this.value[i])) {
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
	if (rtype == 'object') return this.frame_type == 'object';
	if (rtype == 'data') {
		if (frame.frame) {
			return this.frame_type == frame.frame.ftype();
		}
	}
	if (rtype == 'property') return false;
};

FramePattern.prototype.checkLabel = function (rtype, frame) {
	if (typeof frame.getLabel !== 'function') {
		console.log(new Error('Rule passed to check label with broken renderer object - no getLabel'));
		return false;
	}
	return this.stringMatch(this.label, frame.getLabel());
};


FramePattern.prototype.getRendererType = function (frame) {
	if (frame.isProperty()) return 'property';
	if (frame.isObject()) return 'object';
	if (frame.isData()) return 'data';
	if (frame.renderer_type) return frame.renderer_type;
	console.log(new Error(`frame configuration passed non-renderer type ${frame.constructor.name}`));
	console.log(renderer);
	return false;
};

module.exports = FrameRule;