/**
 * FramePatternMatcher does pattern matching on frames 
 * Does a given pattern match a given frame?
 */
const FramePatternMatcher = {}

/**
 * Runs an array of matching rules across a frame and calls the passed onmatch function on each match
 * The optional onmatch function is called with each hit and is passed the frame and the rule that hit it.
 * A list of the matched rules is returned. 
 * 
 */
FramePatternMatcher.testRules = function(rules, frame, onmatch){
	var matched_rules = [];
	if(rules && rules.length){
		for(var i = 0; i<rules.length; i++){
			var match = (!rules[i].pattern || FramePatternMatcher.patternMatchesFrame(rules[i].pattern, frame));
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
FramePatternMatcher.patternMatchesFrame = function(pattern, frame){
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


/**
 * A frame pattern can have the following variables
 * renderer : object, property, data, * - matches a specific part of the frame 
 * label : matches the label of a property
 * frame_type: object, data, document, oneOf
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

FramePattern = function(pattern){
	if(pattern){
		this.setPattern(pattern);
	}
}

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
	if(pattern.children){
		for(var i = 0 ; i < pattern.children.length ; i++){
			this.children.push(new FramePattern(pattern.children[i]));
		}
	}
	this.depth = (typeof pattern.depth != "undefined" ? pattern.depth : false);
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
} 

FramePattern.prototype.illegalRuleType = function(rtype){
	//data frames have no children
	if(rtype == 'data' && this.children.length ) return true;
	//object frames have no range
	if(rtype == 'object' && this.range ) return true;
	return false;
}

/* subject is an id or an array of ids, 
/* match is positive if the renderer's subject appears in the array or is the id
 */
FramePattern.prototype.checkSubject = function(subject, frame){
	if(typeof this.subject != "object" || !this.subject.length) this.subject = [this.subject];
	var rsubj = frame.subject();
	for(var i = 0 ; i<this.subject.length; i++){
		if(this.IDsMatch(subject[i], rsubj)){
			return true;
		}
	}
	return false;
}

//at least one child must match all child rules
FramePattern.prototype.checkChildren = function(rtype, frame){
	for(var i = 0 ; i<this.children.length; i++){
		var found = false;
		if(rtype == "object"){
			for(var prop in frame.properties){
				if(this.children[i].checkFrame(frame.properties[prop])) {
					found = true;
					continue;
				}
			}
		}
		else if(rtype == "property"){
			for(var j = 0; j <= renderer.values.length; j++){
				if(this.children[j].checkFrame(frame.values[j])) {
					found = true;
					continue;
				}
			}
		}
		if(!found) return false;
	}
	return true;
}

FramePattern.prototype.checkStatus = function(rtype, frame){
	if(typeof this.status != "object" || this.status.length == 0) this.status = [this.status];
	for(var i = 0; i<this.status.length; i++){
		if(this.status[i] == "updated" && !frame.isUpdated()) return false;
		if(this.status[i] == "new" && !frame.isNew()) return false;
		if(this.status[i] == "unchanged" && frame.isUpdated()) return false;
	}
	return true;
}

FramePattern.prototype.checkDepth = function(rtype, frame){
	return this.numberMatch(this.depth, frame.depth());
}

FramePattern.prototype.checkParent = function(rtype, frame){
	return this.parent.checkFrame(frame.parent);
}

FramePattern.prototype.checkIndex = function(rtype, frame){
	if(rtype == 'data'){
		return this.index == frame.index;
	}
	return false;
}

FramePattern.prototype.checkProperty  = function(rtype, frame){
	if(typeof this.property != "object" || !this.property.length) this.property = [this.property];
	for(var i = 0 ; i<this.property.length; i++){
		if(this.propertyIDsMatch(frame.property(), this.property[i])){
			return true;
		}
	}
	return false;
}

//returns true if any of the values are found
FramePattern.prototype.checkValue = function(rtype, frame){
	if(typeof this.value != "object" || !this.value.length) this.value = [this.value];
	for(var i = 0 ; i<this.value.length; i++){
		if(rtype == "data"){
			if(this.valuesMatch(frame.value(), this.value[i])){
				return true;
			}
		}
		else if(rtype == "property"){
			for(var j = 0; j<= frame.values.length;  j++){
				if(this.getRendererType(frame.values[i]) == 'data' &&
						this.valuesMatch(frame.values[i].get(), this.value[i])){
					return true;
				}
			}
		}
		else if(rtype == "object"){
			for(var prop in frame.properties){
				if(this.checkValue(this.getRendererType(frame.properties[prop]), frame.properties[prop])){
					return true;
				}
			}
		}
	}
	return false;
}

FramePattern.prototype.checkRange  = function(rtype, frame){
	if(typeof this.range != "object" || !this.range.length) this.range = [this.range];
	for(var i = 0 ; i<this.range.length; i++){
		if(this.rangeIDsMatch(frame.range(), this.range[i])){ 
			return true;
		}
	}
	return false;
}

FramePattern.prototype.checkSubjectClass = function(rtype, frame){
	if(typeof this.subjectClass != "object" || !this.subjectClass.length) this.subjectClass = [this.subjectClass];
	var rcls = frame.subjectClass();
	for(var i = 0 ; i<this.subjectClass.length; i++){
		if(this.classIDsMatch(this.subjectClass[i], rcls)){
			return true;
		}
	}
	return false;
}

FramePattern.prototype.checkFrameType = function (rtype, frame){
	if(rtype == "object") return this.frame_type == "object";
	if(rtype == "data") {
		if(frame.frame){
			return this.frame_type == frame.frame.ftype();
		}
	}
	if(rtype == "property") return false;
}

FramePattern.prototype.checkLabel = function(rtype, frame){
	if(typeof frame.getLabel != "function"){
		console.log(new Error("Rule passed to check label with broken renderer object - no getLabel"));
		return false;
	}
	return this.stringMatch(this.label, frame.getLabel());
}

FramePattern.prototype.IDsMatch = function(ida, idb){
	return TerminusClient.FrameHelper.compareIDs(ida, idb);
}

FramePattern.prototype.classIDsMatch = function(ida, idb){
	return this.IDsMatch(ida, idb);
}
FramePattern.prototype.propertyIDsMatch = function(ida, idb){
	var match = this.IDsMatch(ida, idb);
	return match;
}
FramePattern.prototype.rangeIDsMatch = function(ida, idb){
	return this.IDsMatch(ida, idb);
}
FramePattern.prototype.valuesMatch = function(vala, valb){
	return vala == valb;
}
FramePattern.prototype.numberMatch = function(vala, valb){
	if(typeof vala == "string"){
		try {
			return eval(valb + vala);
		}
		catch(e){
			return false;
		}
	}
	return vala === valb;
}

FramePattern.prototype.stringMatch = function(vala, valb){
	var pat = new RegExp(vala);
	return pat.test(valb);
}

FramePattern.prototype.getRendererType = function(frame){
	if(frame.isProperty()) return "property";
    if(frame.isObject()) return "object";
    if(frame.isData()) return "data";
	if(frame.renderer_type) return frame.renderer_type;
	console.log(new Error("frame configuration passed non-renderer type " + frame.constructor.name));
	console.log(renderer);
	return false;
}

function FrameRule(){
	this.rule = { pattern: {} };
	return this;
}

FrameRule.prototype.scope = function(scope){
	this.rule.pattern.scope = scope;
	return this;
}

FrameRule.prototype.frame_type = function(...frametype){
	this.rule.pattern.frametype = frame_type;
	return this;
}

FrameRule.prototype.label = function(...label){
	this.rule.pattern.label = label;
	return this;
}

FrameRule.prototype.subject = function(...subject){
	this.rule.pattern.subject = subject;
	return this;
}

FrameRule.prototype.subjectClass = function(...subjectClass){
	this.rule.pattern.subjectClass = subjectClass;
	return this;
}

FrameRule.prototype.property = function(...property){
	this.rule.pattern.property = property;
	return this;
}

FrameRule.prototype.depth = function(depth){
	this.rule.pattern.depth = depth;
	return this;
}

FrameRule.prototype.range = function(...range){
	this.rule.pattern.range = range;
	return this;
}

FrameRule.prototype.value = function(...value){
	this.rule.pattern.value = value;
	return this;
}

FrameRule.prototype.pattern = function(){
	return this.rule.pattern;
}

FrameRule.prototype.json = function(){
	return this.rule;
}

FrameRule.prototype.parent = function(parent){
	this.rule.pattern.parent = parent.pattern();
	return this;
}

FrameRule.prototype.children = function(...children){
	if(typeof this.rule.pattern.children == "undefined"){
		this.rule.pattern.children = [];
	}
	for(var i = 0; i<children.length; i++){
		this.rule.pattern.children.push(children[i].pattern());
	}
	return this;
}

FrameRule.prototype.index = function(...index){
	this.rule.pattern.index = index;
	return this;	
}

FrameRule.prototype.status = function(...status){
	this.rule.pattern.status = status;
	return this;	
}

FrameRule.prototype.renderer = function(rend){
	if(!rend) return this.rule.renderer;
	this.rule.renderer = rend;
	return this;
}

FrameRule.prototype.render = function(func){
	if(func){
		this.rule.render = func;
		return this;
	}
	return func;
}

FrameRule.prototype.args = function(json){
	if(!json) return this.rule.args;
	this.rule.args = json;
	return this;
}

FrameRule.prototype.compare = function(func){
	if(!func) return this.rule.compare;
	this.rule.compare = func;
	return this;
}

FrameRule.prototype.mode = function(m){
	if(!m) return this.rule.mode;
	this.rule.mode = m;
	return this;
}

FrameRule.prototype.collapse = function(m){
	if(!m) return this.rule.collapse;
	this.rule.collapse = m;
	return this;
}


FrameRule.prototype.hidden = function(m){
	if(!m) return this.rule.hidden;
	this.rule.hidden = m;
	return this;
}

FrameRule.prototype.view = function(m){
	if(!m) return this.rule.view;
	this.rule.view = m;
	return this;
}

FrameRule.prototype.show_disabled_buttons = function(m){
	if(!m) return this.rule.show_disabled_buttons;
	this.rule.hide_disabled_buttons = m;
	return this;
}

FrameRule.prototype.features = function(m){
	if(!m) return this.rule.features;
	this.rule.features = m;
	return this;
}

FrameRule.prototype.header_features = function(m){
	if(!m) return this.rule.header_features;
	this.rule.header_features = m;
	return this;
}

FrameRule.prototype.header = function(m){
	if(!m) return this.rule.header;
	this.rule.header = m;
	return this;
}

FrameRule.prototype.feature_renderers = function(m){
	if(!m) return this.rule.feature_renderers;
	this.rule.feature_renderers = m;
	return this;
}

FrameRule.prototype.show_empty = function(m){
	if(!m) return this.rule.show_empty;
	this.rule.show_empty = m;
	return this;
}

FrameRule.prototype.dataviewer = function(m){
	if(!m) return this.rule.dataviewer;
	this.rule.dataviewer = m;
	return this;
}

FrameRule.prototype.dataviewer_options = function(m){
	if(!m) return this.rule.dataviewer_options;
	this.rule.dataviewer_options = m;
	return this;
}

module.exports = {FramePatternMatcher, FramePattern, FrameRule } ;
