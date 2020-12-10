const Config  = require('./viewConfig.js');
const FrameRule  = require('./frameRule.js');
const DocumentFrame  = require('./documentFrame.js');


/**
 * @file Frame Config 
 * @license Apache Version 2
 */
function FrameConfig(){
    Config.ViewConfig.call(this); 
    this.type = "document";
}

FrameConfig.prototype = Object.create(Config.ViewConfig.prototype);
FrameConfig.prototype.constructor = Config.ViewConfig;

FrameConfig.prototype.create = function(client){
	var tf = new DocumentFrame(client, this);
	return tf;
}

FrameConfig.prototype.prettyPrint = function(){
    var str = "view = View.document();\n";
    str += this.getBasicPrettyPrint();
	if(typeof this.load_schema() != "undefined"){
		str += "view.load_schema(" + this.load_schema() + ")\n";
	}
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint() + "\n";
	}
	return str;
}

FrameConfig.prototype.json = function(){
	var conf = this.getBasicJSON();
	if(typeof this.load_schema() != "undefined"){
		conf['load_schema'] = this.load_schema();
	}
	let mj = {"frame" :conf, "rules": this.getRulesJSON()};
	return mj;
}

FrameConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new DocumentRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
    this.rules = jr;
    this.loadBasicJSON(config);
	if(typeof config.load_schema != "undefined"){
		this.load_schema(config.load_schema);
	}
	return this;
}

FrameConfig.prototype.json_rules = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	return jr;
}

FrameConfig.prototype.load_schema = function(tf){
	if(typeof tf == "undefined") return this.get_schema;
	this.get_schema = tf;
	return this;
}

FrameConfig.prototype.show_all = function(r){
	this.all().renderer(r);
	return this;
}

FrameConfig.prototype.show_parts = function(o, p, d){
	this.object().renderer(o);
	this.property().renderer(p);
	this.data().renderer(d);
	return this;
}

FrameConfig.prototype.object = function(){
	let fp = new DocumentRule().scope("object");
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.property = function(){
	let fp = new DocumentRule().scope("property");
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.scope = function(scope){
	let fp = new DocumentRule().scope(scope);
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.data = function(){
	let fp = new DocumentRule().scope("data");
	this.rules.push(fp);
	return fp;
}

FrameConfig.prototype.all = function(){
	let fp = new DocumentRule().scope("*");
	this.rules.push(fp);
	return fp;
}

/**
 * Attaches display options to frames from matching rules
 */
FrameConfig.prototype.setFrameDisplayOptions = function(frame, rule){
	if(typeof frame.display_options == "undefined") frame.display_options = {};
	if(typeof rule.mode() != "undefined") {	frame.display_options.mode = rule.mode();}
	if(typeof rule.view() != "undefined") frame.display_options.view = rule.view();
	if(typeof rule.showDisabledButtons() != "undefined") frame.display_options.show_disabled_buttons = rule.showDisabledButtons();
	if(typeof rule.hidden() != "undefined") frame.display_options.hidden = rule.hidden();
	if(typeof rule.collapse() != "undefined") frame.display_options.collapse = rule.collapse();
	if(typeof rule.style() != "undefined") frame.display_options.style = rule.style();
	if(typeof rule.headerStyle() != "undefined") frame.display_options.header_style = rule.headerStyle();
	if(typeof rule.features() != "undefined") {		frame.display_options.features = this.setFrameFeatures(frame.display_options.features, rule.features());	}
	if(typeof rule.headerFeatures() != "undefined") frame.display_options.header_features = this.setFrameFeatures(frame.display_options.header_features, rule.headerFeatures());
	if(typeof rule.header() != "undefined") frame.display_options.header = rule.header();
	if(typeof rule.showEmpty() != "undefined") frame.display_options.show_empty = rule.showEmpty();
	if(typeof rule.dataviewer() != "undefined") frame.display_options.dataviewer = rule.dataviewer();
	if(typeof rule.args() != "undefined") frame.display_options.args = this.setFrameArgs(frame.display_options.args, rule.args());
}

/*
Consolidates properties of features sent in in different rules
*/
FrameConfig.prototype.setFrameFeatures = function(existing, fresh){
	//preserve order of existing
	if(!existing || !existing.length) return fresh;
	if(!fresh || !fresh.length)  return existing;
	let got = [];
	for(var i = 0; i< existing.length; i++){
		var key = (typeof existing[i] == "string" ? existing[i] : Object.keys(existing[i])[0]);
		got.push(key);
	}
	for(var j = 0; j< fresh.length; j++){
		var fkey = (typeof fresh[j] == "string" ? fresh[j] : Object.keys(fresh[j])[0]);
		var rep = got.indexOf(fkey);
		if(rep == -1) existing.push(fresh[j]);
		else if(typeof fresh[j] == "object"){
			var val = existing[rep];
			if(typeof val == 'string') existing[rep] = fresh[j];
			else if(typeof val == 'object'){
				var props = fresh[j][fkey];
				for(var p in props){
					existing[rep][fkey][p] = props[p];
				}
			}
		}
	}
	return existing;	
}

FrameConfig.prototype.setFrameArgs = function(existing, fresh){
	if(!existing) return fresh;
	if(!fresh) return existing;
	for(var k in fresh){
		existing[k] = fresh[k];
	}
	return existing;
}

/**
 * @file Document Rule
 * @license Apache Version 2
 */

function DocumentRule(){
	FrameRule.call(this); 
	this.rule = {};
};

DocumentRule.prototype = Object.create(FrameRule.prototype);
DocumentRule.prototype.constructor = FrameRule;

DocumentRule.prototype.renderer = function(rend){
	if(typeof rend == "undefined"){
		return this.rule.renderer;
	}
	this.rule.renderer = rend;
	return this;
}

DocumentRule.prototype.compare = function(func){
	if(typeof func == "undefined"){
		return this.rule.compare;
	}
	this.rule.compare = func;
	return this;
}

DocumentRule.prototype.mode = function(mode){
	if(typeof mode == "undefined"){
		return this.rule.mode;
	}
	this.rule.mode = mode;
	return this;
}

DocumentRule.prototype.collapse = function(func){
	if(typeof func == "undefined"){
		return this.rule.collapse;
	}
	this.rule.collapse = func;
	return this;
}

DocumentRule.prototype.view = function(m){
	if(!m) return this.rule.view;
	this.rule.view = m;
	return this;
}

/**
 * Should actions which are disabled in the given context be displayed?
 */
DocumentRule.prototype.showDisabledButtons = function(m){
	if(typeof m == "undefined") return this.rule.show_disabled_buttons;
	this.rule.show_disabled_buttons = m;
	return this;
}

DocumentRule.prototype.header = function(m){
	if(!m) return this.rule.header;
	this.rule.header = m;
	return this;
}


DocumentRule.prototype.errors = function(errs){
	if(!errs) return this.rule.errors;
	this.rule.errors = errs;
	return this;
}


DocumentRule.prototype.headerStyle = function(m){
	if(!m) return this.rule.headerStyle;
	this.rule.headerStyle = m;
	return this;
}

DocumentRule.prototype.showEmpty = function(m){
	if(!m) return this.rule.show_empty;
	this.rule.show_empty = m;
	return this;
}

DocumentRule.prototype.dataviewer = function(m){
	if(!m) return this.rule.dataviewer;
	this.rule.dataviewer = m;
	return this;
}

DocumentRule.prototype.features = function(...m){
	if(typeof m == "undefined" || m.length == 0) return this.rule.features;
	this.rule.features = m;
	return this;
}

DocumentRule.prototype.headerFeatures = function(...m){
	if(typeof m == "undefined" || m.length == 0) return this.rule.header_features;
	this.rule.header_features = m;
	return this;
}

DocumentRule.prototype.render = function(func){
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

DocumentRule.prototype.style = function(style){
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
DocumentRule.prototype.hidden = function(m){
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
DocumentRule.prototype.args = function(json){
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
DocumentRule.prototype.applyFeatureProperty = function(feats, prop, val){
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

DocumentRule.prototype.unpackFeatures = function(feats){
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

DocumentRule.prototype.prettyPrint = function(){
	if(this.pattern){
		str = this.pattern.prettyPrint();
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
	if(typeof this.errors() != "undefined"){
		str += ".errors(" + JSON.stringify(this.errors()) + ")";
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

module.exports = FrameConfig;