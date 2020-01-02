const FrameHelper = require('./frameHelper');



FrameRule.prototype.unpack = function(arr, nonstring){
	if(nonstring) var str = arr.join(",");
	var str = "'" + arr.join("','") + "'";
	return str;
}

FrameRule.prototype.unpackFeatures = function(feats){
	let extensions = {};
	var fstr = "";
	for(var i = 0; i<feats.length; i++){
		if(typeof feats[i] == "string"){
			fstr += '"' + feats[i] + '"';
		}
		else if(typeof feats[i] == "object"){
			var fid = Object.keys(feats[i])[0];
			fstr += '"' +  fid + '"';
			for(var prop in feats[i][fid]){
				extensions[prop] = feats[i][fid][prop];
			}
		}
		if(i < feats.length - 1){
			fstr += ", "
		}
	}
	for(var k = 0; k < Object.keys(extensions).length; k++){
		var ext = Object.keys(extensions)[k];
		var val = extensions[ext];
		fstr += ")." + ext + "(";
		if(typeof val == "function"){
			fstr += val;
		}
		else if(typeof val == "string"){
			fstr += '"' + val + '"';
		}
		else if(typeof val == "object"){
			fstr += JSON.stringify(val);
		}
	}
	return fstr;
}

FrameRule.prototype.prettyPrint = function(type){
	//starts with obj. ...
	if(this.scope() == "*"){
		var str = "all()";
	}
	else {
		var str = this.scope() + "()";
	}
	if(typeof this.frameType() != "undefined"){
		str += ".frame_type(" + this.unpack(this.frameType()) + ")";
	}
	if(typeof this.label() != "undefined"){
		str += ".label(" + this.unpack(this.label()) + ")";
	}
	if(typeof this.subject() != "undefined"){
		str += ".subject(" + this.unpack(this.subject()) + ")";
	}
	if(typeof this.subjectClass() != "undefined"){
		str += ".subjectClass(" + this.unpack(this.subjectClass()) + ")";
	}
	if(typeof this.property() != "undefined"){
		str += ".property(" + this.unpack(this.property()) + ")";
	}
	if(typeof this.range() != "undefined"){
		str += ".range(" + this.unpack(this.range()) + ")";
	}
	if(typeof this.value() != "undefined"){
		str += ".value(" + this.unpack(this.value()) + ")";
	}
	if(typeof this.children() != "undefined" && this.children.length > 0){
		str += ".children(\n";
		var kids = this.children();
		for(var i = 0; i< kids.length; i++){
			str += kids.prettyPrint() + "\n";
		}
		str += ")";
	}
	if(typeof this.parent() != "undefined"){
		str += ".parent(" + this.parent.prettyPrint() + ")";
	}
	if(typeof this.depth() != "undefined"){
		var d = this.depth();
		if(typeof d == "string"){
			str += ".depth('" + this.depth() + "')";
		}
		else {
			str += ".depth(" + this.depth() + ")";
		}
	}
	if(typeof this.index() != "undefined"){
		str += ".index(" + this.unpack(this.index(), true) + ")";
	}
	if(typeof this.status() != "undefined"){
		str += ".status(" + this.unpack(this.status()) + ")";
	}
	if(typeof this.renderer() != "undefined"){
		str += ".renderer('" + this.renderer() + "')";
	}
	if(typeof this.render() != "undefined"){
		str += ".render(" + this.render + ")";
	}
	if(typeof this.compare() != "undefined"){
		str += ".compare(" + this.compare() + ")";
	}
	if(typeof this.mode() != "undefined"){
		str += ".mode('" + this.mode() + "')";
	}
	if(typeof this.collapse() != "undefined"){
		str += ".collapse(" + this.collapse() + ")";
	}
	if(typeof this.hidden() != "undefined"){
		str += ".hidden(" + this.hidden() + ")";
	}
	if(typeof this.view() != "undefined"){
		str += ".view('" + this.view() + "')";
	}
	if(typeof this.showDisabledButtons() != "undefined"){
		str += ".showDisabledButtons(" + this.showDisabledButtons() + ")";
	}
	if(typeof this.header() != "undefined"){
		str += ".header(" + this.header() + ")";
	}
	if(typeof this.style() != "undefined"){
		str += ".style(\"" + this.style() + "\")";
	}
	if(typeof this.headerStyle() != "undefined"){
		str += ".headerStyle(\"" + this.headerStyle() + "\")";
	}
	if(typeof this.args() != "undefined"){
		str += ".args(" + JSON.stringify(this.args()) + ")";
	}
	if(typeof this.showEmpty() != "undefined"){
		str += ".showEmpty(" + this.show_empty() + ")";
	}
	if(typeof this.dataviewer() != "undefined"){
		str += ".dataviewer(\"" + this.dataviewer() + "\")";
	}
	if(typeof this.features() != "undefined"){
		str += ".features(" + this.unpackFeatures(this.features()) + ")";
	}
	if(typeof this.headerFeatures() != "undefined"){
		str += ".headerFeatures(" + this.unpackFeatures(this.headerFeatures()) + ")";
	}
	return str;
}


/**
 * The below correspond to rule actions - what happens when a pattern matches
 */

/**
 * These onces can apply to features - if the rule includes an earlier features or header_features call, subsequent render, style, hidden and args apply to it
 */
FrameRule.prototype.render = function(func){
	if(!func) return this.rule.render;
	var hf = this.headerFeatures(); 
	var f = this.features(); 
	if(hf && hf.length){
		var feats = this.applyFeatureProperty(hf, "render", func);
		this.headerFeatures(...feats);
	}
	else if(f && f.length){
		var feats = this.applyFeatureProperty(f, "render", func);
		this.features(...feats);
	}
	else {
		this.rule.render = func;
	}
	return this;
}

FrameRule.prototype.style = function(style){
	if(typeof style == "undefined") return this.rule.style;
	var hf = this.headerFeatures(); 
	var f = this.features(); 
	if(hf && hf.length){
		var feats = this.applyFeatureProperty(hf, "style", style);
		this.headerFeatures(...feats);
	}
	else if(f && f.length){
		var feats = this.applyFeatureProperty(f, "style", style);
		this.features(...feats);
	}
	else {
		this.rule.style = style;
	}
	return this;
};

/**
 * The frame or feature will be hidden or unhidden (boolean)
 */
FrameRule.prototype.hidden = function(m){
	if(typeof m == "undefined") return this.rule.hidden;
	var hf = this.headerFeatures(); 
	var f = this.features(); 
	if(hf && hf.length){
		var feats = this.applyFeatureProperty(hf, "hidden", m);
		this.headerFeatures(...feats);
	}
	else if(f && f.length){
		var feats = this.applyFeatureProperty(f, "hidden", m);
		this.features(...feats);
	}
	else {
		this.rule.hidden = m;
	}
	return this;
}

/**
 * Specifies arguments to a renderer 
 */
FrameRule.prototype.args = function(json){
	if(!json) return this.rule.args;
	var hf = this.headerFeatures(); 
	var f = this.features(); 
	if(hf && hf.length){
		var feats = this.applyFeatureProperty(hf, "args", json);
		this.headerFeatures(...feats);
	}
	else if(f && f.length){
		var feats = this.applyFeatureProperty(f, "args", json);
		this.features(...feats);
	}
	else {
		this.rule.args = json;
	}
	return this;
}

/**
 * Adds a property to a feature array
 */
FrameRule.prototype.applyFeatureProperty = function(feats, prop, val){
	var nfeats = [];
	for(var i = 0; i<feats.length; i++){
		if(typeof feats[i] == "string"){
			var nfeat = {};
			nfeat[feats[i]] = {};
			nfeat[feats[i]][prop] = val;
			nfeats.push(nfeat);
		}
		else if(typeof feats[i] == "object"){
			let fkey = Object.keys(feats[i])[0];
			if(fkey){
				var nfeat = feats[i];
				nfeat[fkey][prop] = val;
				nfeats.push(nfeat);
			}
		}
	}
	return nfeats;
}
	


/**
 * These apply to regular frames
 */
FrameRule.prototype.renderer = function(rend){
	if(!rend) return this.rule.renderer;
	this.rule.renderer = rend;
	return this;
}

FrameRule.prototype.headerStyle = function(hstyle){
	if(!hstyle) return this.rule.header_style;
	this.rule.header_style = hstyle;
	return this;
}

/**
 * Function which specifies the ordering of values in a frame
 */
FrameRule.prototype.compare = function(func){
	if(!func) return this.rule.compare;
	this.rule.compare = func;
	return this;
}

/**
 * Edit / view mode
 */
FrameRule.prototype.mode = function(m){
	if(!m) return this.rule.mode;
	this.rule.mode = m;
	return this;
}

/**
 * Specifies whether a frame should be presented in collapsed form or not
 */
FrameRule.prototype.collapse = function(m){
	if(!m) return this.rule.collapse;
	this.rule.collapse = m;
	return this;
}

/**
 * Specifies whether a frame should include a view selector
 */

FrameRule.prototype.view = function(m){
	if(!m) return this.rule.view;
	this.rule.view = m;
	return this;
}

/**
 * Should actions which are disabled in the given context be displayed?
 */
FrameRule.prototype.showDisabledButtons = function(m){
	if(!m) return this.rule.show_disabled_buttons;
	this.rule.show_disabled_buttons = m;
	return this;
}

FrameRule.prototype.features = function(...m){
	if(typeof m == "undefined" || m.length == 0) return this.rule.features;
	this.rule.features = m;
	return this;
}

FrameRule.prototype.headerFeatures = function(...m){
	if(typeof m == "undefined" || m.length == 0) return this.rule.header_features;
	this.rule.header_features = m;
	return this;
}

FrameRule.prototype.header = function(m){
	if(!m) return this.rule.header;
	this.rule.header = m;
	return this;
}

FrameRule.prototype.showEmpty = function(m){
	if(!m) return this.rule.show_empty;
	this.rule.show_empty = m;
	return this;
}

FrameRule.prototype.dataviewer = function(m){
	if(!m) return this.rule.dataviewer;
	this.rule.dataviewer = m;
	return this;
}

module.exports = {FramePatternMatcher, FramePattern, FrameRule } ;
