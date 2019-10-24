/**
 * Represents a frame for programmatic access to object frame, anywhere within a document
 * Recursive data structure where this.children contains an indexed array of object frames
 * and this.dataframes contains a property indexed array of data frames
 * Every object frame carries a reference to its classframe
 * This gives us instructions as to how to create new frames according to the schema
 * After that it's turtles all the way down.
 * @param cls - ID of the class (URL)
 * @param classframe - an array of frames representing a class
 * @param archetypes list of class frames
 * @param parent parent object
 * @returns
 */
const FrameHelper = require('./frameHelper');

function ObjectFrame(cls, dataframes, classframes, parent, parentframe) {
	// the class of the frame - mandatory
	this.empty();
	this.cls = cls;

	// array of frames representing the full class frame
	// (optional - required to be able to safely add missing properties)
	if (classframes && typeof classframes === 'object') {
		this.loadClassFrames(classframes);
	}
	if (dataframes && typeof dataframes === 'object') {
		this.originalFrames = dataframes;
		this.loadDataFrames(dataframes);
	} else {
		this.originalFrames = false;
	}
	// parent object frame
	this.parent = parent;
	// original frame used by parent to create me
	this.parentframe = parentframe;
	// set to true if this is a newly created document
	this.newDoc = false;
}

/**
 * Loads class frames for the object's class - the instructions about how to put an object together
 */
ObjectFrame.prototype.loadClassFrames = function (classframes) {
	for (let j = 0; j < classframes.length; j += 1) {
		if (classframes[j]['@context']) this.jsonld_context = classframes[j]['@context'];

		const cf = new ClassFrame(classframes[j]);
		if (cf.isValid()) {
			if (typeof this.classframes[classframes[j].property] === 'undefined') {
				this.classframes[classframes[j].property] = [];
			}
			this.classframes[classframes[j].property] = cf;
			if (cf.isObject() && this.properties[classframes[j].property]) {
				for (let i = 0; i < this.properties[classframes[j].property].values.length; i += 1) {
					this.properties[classframes[j].property].values[i].loadClassFrames(classframes[j].frame);
				}
			}
		}
	}
	return this;
};

/**
 * Does this object have a schema loaded?
 */
ObjectFrame.prototype.hasSchema = function () {
	return !FrameHelper.empty(this.classframes);
};

/*
 * Loads an array of data frames into the object's internal index
 * {property: [frames]}
 */
ObjectFrame.prototype.loadDataFrames = function (frames) {
	if (typeof frames !== 'object' || !frames.length) return undefined;
	if (!this.originalFrames) this.originalFrames = frames;
	if (!this.subjid && frames[0].domainValue) this.subjid = frames[0].domainValue;
	for (let i = 0; i < frames.length; i += 1) {
		if (frames[i]['@context']) this.jsonld_context = frames[i]['@context'];
		let cframe = this.getPropertyClassFrame(frames[i].property, frames[i]);
		if (cframe.isClassChoice()) {
			cframe = cframe.getChosenClassFrame(frames[i].range);
			if (!cframe) {
				console.log(`no choice frame ${frames[i].range}`);
			}
		} else if (cframe.isLogic()) {
			cframe = cframe.getChosenFrame(frames[i]);
		}
		if(cframe){
			if (typeof this.properties[frames[i].property] === 'undefined') {
				this.properties[frames[i].property] = new PropertyFrame(frames[i].property, cframe, this);
			}
			this.properties[frames[i].property].addFrame(frames[i])
		}
	}
	return this;
};

ObjectFrame.prototype.getAsFrame = function (prop, parent) {
	if (this.parentframe) return this.parentframe;
	const ff = { type: 'objectProperty', property: prop };
	ff.range = this.cls;
	ff.domain = parent.cls;
	ff.domainValue = parent.subjid;
	ff.frame = [];
	for (const prop of Object.keys(this.properties)) {
		ff.frame = ff.frame.concat(ff.frame, this.properties[prop].getAsFrames())
	}
	return ff;
};

ObjectFrame.prototype.isnew = function () {
	return this.newDoc;
};

/**
 * Cleans out object and sets everything empty
 */
ObjectFrame.prototype.empty = function () {
	// all indexed by property
	this.properties = {};
	this.restrictions = {};
	this.children = {};
	this.subjid = false;
	this.cls = false;
};

/*
 * Resets object state to original state
 */
ObjectFrame.prototype.reset = function (prop) {
	if (prop) {
		const props = [];
		for (let i = 0; i < this.originalFrames.length; i += 1) {
			if (this.originalFrames[i].property === prop) {
				props.push(this.originalFrames[i]);
			}
		}
		if (this.properties[prop]) this.properties[prop] = [];
		this.loadDataFrames(props);
	} else {
		this.restrictions = {};
		this.properties = {};
		this.loadDataFrames(this.originalFrames);
	}
};

/*
 * Clears out any specific information from a tree
 */
ObjectFrame.prototype.clear = function () {
	for (const prop of Object.keys(this.properties)) {
		this.properties[prop].clear();
	}
	return this;
};

/*
 * Filters the frame and its children
 */
ObjectFrame.prototype.filter = function (rules, onmatch, options) {
	const cascading = (options && options.ignore_failure ? true : false);
	var hits = FramePatternMatcher.testRules(rules, this, onmatch);
	if(hits.length || cascading){
		for (const prop of Object.keys(this.properties)) {
			this.properties[prop].filter(rules, onmatch, options);
		}	
	}
	return this;
};



/**
 * If a class frame is present, it is returned for the given property
 * If no class frame is present and an instance frame is passed in the
 * this enables make it up as you go along editing
 * second argument a class frame will be created from the instance frame.
 */
ObjectFrame.prototype.getPropertyClassFrame = function (prop, instance) {
	if (this.classframes && typeof this.classframes === 'object' && typeof this.classframes[prop] === 'object') {
		return this.classframes[prop];
	}
	if (instance) {
		const cf = new ClassFrame(instance);
		return cf;
	}
	if(this.properties[prop]){
		return new ClassFrame(this.properties[prop].values[0]);
	}
	return false;
};

ObjectFrame.prototype.properties = function (type) {
	if(type == "filled"){
		return Object.keys(this.properties);
	}
	if(type == "missing"){
		var filled = Object.keys(this.properties);
		var all = Object.keys(this.classframes);
		var missing = [];
		for(var i = 0; i<all.length; i++){
			if(filled.indexOf(all[i]) == -1 && missing.indexOf(all[i]) ==-1){
				missing.push(all[i]);
			}
		}
		return missing;
	}
	return Object.keys(this.classframes);
}

/**
 * Missing properties are those that are present in the classframe,
 * but not instantiated in the current object frame
 * for this to work we need to load the frame with the associated classframe
 */
ObjectFrame.prototype.getMissingPropertyList = function () {
	var missing = this.properties("missing");
	const nmissing = [];
	for(var i = 0; i<missing.length; i++){
		const cframe = this.getPropertyClassFrame(missing[i]);
		const newb = { label: cframe.getLabel(), value: missing[i]};
		nmissing.push(newb);
	}
	return nmissing;
};

/**
 * List of properties that are filled in the object
 */
ObjectFrame.prototype.getFilledPropertyList = function () {
	var props = this.properties("filled");
	const filled = [];
	for(var i = 0; i<props.length; i++){
		const cframe = this.getPropertyClassFrame(props[i]);
		const newb = { label: cframe.getLabel(), value: props[i]};
		filled.push(newb);
	}
	return filled;
};

ObjectFrame.prototype.fillFromSchema = function (newid) {
	if (newid) this.subjid = newid;
	newid = (newid ? newid : FrameHelper.genBNID());
	let properties = {};
	for (const prop of Object.keys(this.classframes)) {
		const pf = this.getPropertyClassFrame(prop);
		properties[prop] = new PropertyFrame(prop, pf);
		properties[prop].fillFromSchema(newid);
	}
	this.properties = properties;
	this.originalFrames = [];
	for (const prop of Object.keys(this.properties)) {
		this.originalFrames.push(this.properties[prop].getAsFrames());
	}
	return this;
};

ObjectFrame.prototype.clone = function (newid) {
	const properties = {};
	const cloned = new ObjectFrame(this.cls, false, false, this.parent);
	cloned.classframes = this.classframes;
	cloned.subjid = newid;
	for (const prop of Object.keys(this.properties)) {
		properties[prop] = this.properties[prop].clone();
	}
	cloned.properties = properties;
	return cloned;
};


/**
 * Returns an array of the child object frames for a given property
 * or false if there is no such property
 */
/*ObjectFrame.prototype.getChildren = function (prop) {
	if (prop && typeof this.children[prop] !== 'undefined') {
		return this.children[prop];
	}
	return false;
};*/

/**
 * Returns a child frame with a particular id
 * If the second parameter is included, it will only look in that specific property
 * Otherwise searches all properties for the child
 */
ObjectFrame.prototype.getChild = function (childid, prop) {
	var pframe = this.getProperty(prop);
	for(var i = 0; i<pframe.values.length; pframe++){
		if(pframe.values[i].isObject() && pframe.values[i].subject === childid) return pframe.values[i];
	}
	if (!prop) {
		for (const key of Object.keys(this.properties)) {
			for (let i = 0; i < this.properties[key].values.length; i += 1) {
				if (this.properties[key].values[i].subject() === childid) return this.properties[key].values[i];
			}
		}
	}
	return false;
};

ObjectFrame.prototype.addProperty = function (prop, cls) {
	const cframe = this.getPropertyClassFrame(prop);
	const nprop = new PropertyFrame(prop, cframe);
	if (nprop.isData()) {
		const df = cframe.copy();
		df.set('');
	}
	if (cframe.isObject()) {
		if (!cframe.isClassChoice()) {
			const df = cframe.createEmpty(FrameHelper.genBNID());
		}
		if (cls) {
			const df = cframe.createEmptyChoice(cls, FrameHelper.genBNID());
		}
		const clss = cframe.getClassChoices();
		if (clss && clss.length) {
			const df = cframe.createEmptyChoice(clss[0], FrameHelper.genBNID());
		}
	}
	if(typeof this.properties[prop] == "undefined"){
		this.properties[prop] = [];
	}
	this.properties[prop].push(df);
	return df;
};

ObjectFrame.prototype.addPropertyValue = function (prop, value) {
	const pframe = this.properties[prop];
	return pframe.addValue(value);
};

ObjectFrame.prototype.removeProperty = function (prop) {
	if (typeof this.properties[prop] !== 'undefined') {
		delete (this.properties[prop]);
	}
};

ObjectFrame.prototype.removePropertyValue = function (prop, value, index) {
	const pframe = this.properties[prop];
	pframe.removeValue(value, index);
	if(pframe.values.length == 0){
		this.removeProperty(prop);
	}
};

ObjectFrame.prototype.error = function (msg) {
	console.error(msg);
};


ObjectFrame.prototype.subject = function(){
	return this.subjid;
}

ObjectFrame.prototype.isObject = function () { return true; };
ObjectFrame.prototype.isProperty = function () { return false; };
ObjectFrame.prototype.isData = function () { return false; };


ObjectFrame.prototype.subjectClass = function(){
	return this.cls;
}

ObjectFrame.prototype.depth = function(){
	if(this.parent) return (this.parent.depth() + 1);
	return 0;
}

ObjectFrame.prototype.getProperty = function(prop){
	return this.properties[prop];
}

ObjectFrame.prototype.property = function(prop){
	if(this.parent) return this.parent.property();
	return false;
}

ObjectFrame.prototype.parentObject = function(){
	if(this.parent && this.parent.parent){
		return this.parent.parent;
	}
	return false;
}

ObjectFrame.prototype.root = function(){
	if(this.parent) return false;
	return true;
}

ObjectFrame.prototype.renderProperties = function(){
	var props = [];
	for (const prop of Object.keys(this.properties)) {
		if(this.properties[prop].render){
			var rend = this.properties[prop].render(this.properties[prop]);
			if(rend) props.push(rend);
		}
	}
	return props;
}


function PropertyFrame(property, cframe, parent){
	this.predicate = property;
	this.cframe = cframe;
	this.parent = parent;
	this.values = [];
}

PropertyFrame.prototype.addFrame = function (frame) {
	if(this.cframe.isData()){
		var df = new DataFrame(frame, this);
		this.values.push(df);
	}
	else {
		const kid = new ObjectFrame(this.range(), cframe.frame, frame.frame, this, frame);
		this.values.push(kid);
	}
}

PropertyFrame.prototype.fillFromSchema = function(newid){
	if (this.isData() || (this.isObject() && !this.isClassChoice())) {
		if (this.hasRestriction() && this.restriction.min) {
			values = [];
			for (let i = 0; i < this.restriction.min; i += 1) {
				values.push(this.createEmpty(newid));
			}
		} 
		else {
			values = [this.createEmpty(newid)];
		}
	} 
	else if (this.isClassChoice()) {
		const clss = this.getClassChoices();
		if (clss && clss.length) {
			const empty = this.createEmptyChoice(clss[0], FrameHelper.genBNID());
			values = [empty];
		}
	}
	this.values = values;
}

PropertyFrame.prototype.isData = function(){
	return this.cframe.isData();
}

PropertyFrame.prototype.isObject = function () { 
	return this.cframe.isObject() 
};

PropertyFrame.prototype.isProperty = function () { 
	return true; 
};


PropertyFrame.prototype.property = function(){
	return this.predicate;
}

PropertyFrame.prototype.extract = function(){
 	var extracts = [];
 	for(var i = 0; i<this.values.length; i++){
 		var val = this.values[i].extract();
 		if(val !== "" && val !== false && typeof val != "undefined") extracts.push(val);
 	}
	return extracts;
}

PropertyFrame.prototype.subject = function(){return (this.parent ? this.parent.subject() : false);};
PropertyFrame.prototype.subjectClass = function(){return (this.parent ? this.parent.subjectClass() : false);};
PropertyFrame.prototype.depth = function(){return (this.parent ? this.parent.depth() : false);};
PropertyFrame.prototype.updated = function(){ return (this.parent ? this.parent.childUpdated() : false);};
PropertyFrame.prototype.range = function(){	return (this.cframe ? this.cframe.range : "");};
PropertyFrame.prototype.getLabel = function(){ return (this.cframe ? this.cframe.getLabel() : "" );};
PropertyFrame.prototype.getComment = function(){ return (this.cframe ? this.cframe.getComment() : false);}
PropertyFrame.prototype.hasCardinalityRestriction = function(){return (this.cframe ? this.cframe.hasRestriction() : false);};
PropertyFrame.prototype.getRestriction = function(){return (this.cframe ? this.cframe.restriction : false);};
PropertyFrame.prototype.isClassChoice = function(){	return (this.cframe ? this.cframe.isClassChoice() : false);};
PropertyFrame.prototype.deletePropertyValue = function(value, index){
	this.parent.removePropertyValue(this.property(), value, index);
}

PropertyFrame.prototype.clear = function(){}
PropertyFrame.prototype.clone = function(){}

PropertyFrame.prototype.getAsFrames = function(){}
PropertyFrame.prototype.createEmpty = function(){}

PropertyFrame.prototype.filter = function (rules, onmatch, options) {
	const cascading = (options && options.ignore_failure ? true : false);
	var hits = FramePatternMatcher.testRules(rules, this, onmatch);
	if(hits.length || cascading){
		for (var i = 0; i<this.values.length; i++){
			this.values[i].filter(rules, onmatch, options);
		}	
	}
	return this;	
}

/*
 * Shorthand functions to make it easier to access the underlying data
 */

PropertyFrame.prototype.first = function(){
	if(this.values && this.values[0]){
		return this.values[0].get();
	}
}

PropertyFrame.prototype.renderValues = function(){
	var vals = [];
	for(var i = 0; i<this.values.length; i++){
		if(this.values[i].render){
			var rend = this.values[i].render(this.values[i]);
			if(rend) vals.push(rend);
		}
	}
	return vals;
}



function DataFrame(frame, parent) {
	this.err = false;
	this.parent = parent;
	// the id of the object that owns this dataframe
	this.subjid = (parent ? parent.subjid : false);
	if (frame) {
		this.load(frame);
	}
}

DataFrame.prototype.load = function (frame) {
	if (typeof frame !== 'object') {
		this.error('No frame passed to load');
		return;
	}
	// all the meta-data carried in frames:
	this.type = frame.type;
	this.property = frame.property;
	this.range = frame.range;
	this.rangeValue = frame.rangeValue;
	this.domain = frame.domain;
	this.domainValue = frame.domainValue;
	this.frame = frame.frame;
	this.label = frame.label;
	this.comment = frame.comment;
	const { restriction } = frame;
	this.restriction = false;
	if (restriction && typeof restriction === 'object') {
		this.restriction = new Restriction(restriction);
	}
};

DataFrame.prototype.filter = function (rules, onmatch) {
	FramePatternMatcher.testRules(rules, this, onmatch);
	return this;	
}


DataFrame.prototype.delete = function(){
	this.parent.deletePropertyValue(this.get(), this.index);
}

DataFrame.prototype.save = function(){
	if(this.parent) {
		this.parent.save();
	}
}

DataFrame.prototype.reset = function(){
	this.set(this.originalValue);
	//this.redraw();
}

DataFrame.prototype.clone = function(){
	var newb = this.parent.addPropertyValue(this.get());
	var nrend = this.copy(newb);
	nrend.setNew();
	nrend.mode = "edit";
	nrend.index = this.parent.values.length;
	this.parent.values.push(nrend);
}


DataFrame.prototype.depth = function(){return (this.parent ? this.parent.depth() : false);};
DataFrame.prototype.property = function(){ return (this.parent ? this.parent.property() : false);};
DataFrame.prototype.subject = function(){ return (this.parent ? this.parent.subject() : false);};
DataFrame.prototype.subjectClass = function(){ return (this.parent ? this.parent.subjectClass() : false);};
DataFrame.prototype.range = function(){	return (this.frame ? this.frame.range : false);};




DataFrame.prototype.isValidType = function (dt) {
	const vtypes = ['datatypeProperty', 'objectProperty', 'restriction '];
	if (vtypes.indexOf(dt) === -1) return false;
	return true;
};


DataFrame.prototype.getAsFrame = function () {
	 const ff = { type: this.type, property: this.property };
	 if (this.range) ff.range = this.range;
	 if (this.rangeValue) ff.rangeValue = this.rangeValue;
	 if (this.domain) ff.domain = this.domain;
	 if (this.domainValue) ff.domainValue = this.domainValue;
	 if (this.frame) ff.frame = this.frame;
	 if (this.label) ff.label = this.label;
	 if (this.comment) ff.comment = this.comment;
	 return ff;
};

DataFrame.prototype.hasRestriction = function () {
	 if (this.restriction) {
		 return this.restriction.hasCardRestriction();
	 }
	 return false;
};

DataFrame.prototype.copy = function (newid) {
	const copy = new DataFrame(this, this.parent);
	if (newid) copy.domainValue = newid;
	return copy;
};

DataFrame.prototype.getLabel = function () {
	let lab = '';
	if (this.label && typeof this.label === 'object') lab = this.label['@value'];
	if (this.label && typeof this.label === 'string') lab = this.label;
	// always return something
	if (!lab && this.property) lab = FrameHelper.labelFromURL(this.property);
	if (!lab) lab = FrameHelper.labelFromURL(this.cls);
	return lab;
};

DataFrame.prototype.getType = function () {
	if (this.range) return this.range;
	if (this.rangeValue && this.rangeValue.type) return this.rangeValue.type;
	return false;
};

ObjectFrame.prototype.getLabel = DataFrame.prototype.getLabel;

DataFrame.prototype.getComment = function () {
	let comment = '';
	if (this.comment && typeof this.comment === 'object') comment = this.comment['@value'];
	if (this.comment && typeof this.comment === 'string') comment = this.comment;
	return comment;
};

ObjectFrame.prototype.getComment = DataFrame.prototype.getComment;


DataFrame.prototype.error = function (msg) {
	if (msg)	this.err = msg;
	return this.err;
};

DataFrame.prototype.isValid = function () {
	if (!(this.type && this.isValidType(this.type))) {
		this.error(`Missing or Illegal Frame Type ${this.type}`);
		return false;
	}
	if (!(this.property)) {
		this.error('Missing Frame Property');
		return false;
	}
	if (!(this.domain)) {
		this.error('Missing Frame Domain');
		return false;
	}
	if (!(this.range)) {
		this.error('Missing Frame Range');
		return false;
	}
	if (this.isObjectProperty() && !(this.frame && typeof this.frame === 'object')) {
		this.error('Missing Object Frame');
		return false;
	}
	return true;
};

DataFrame.prototype.isObjectProperty = function () {
	return this.type === 'objectProperty';
};

DataFrame.prototype.isDatatypeProperty = function () {
	return this.type === 'datatypeProperty';
};

DataFrame.prototype.isLogic = function () {
	if (this.type === 'and' || this.type === 'or' || this.type === 'xor') {
		return true;
	}
	return false;
};

DataFrame.prototype.isRestriction = function () {
	return this.type === 'restriction';
};

DataFrame.prototype.ftype = function () {
	if (this.isDocument()) return 'document';
	if (this.isDatatypeProperty()) return 'data';
	if (this.isChoice()) return 'oneOf';
	if (this.isObject()) return 'object';
	if (this.isLogic()) return 'logic';
	if (this.isClassChoice()) return 'class_choice';
	return undefined;
};


DataFrame.prototype.isClassChoice = function () {
	return (this.frame && this.frame.type === 'class_choice');
};

DataFrame.prototype.isString = function () {
	if (this.range === FrameHelper.getStdURL('xsd', 'string')) {
		return true;
	}
	return false;
};

DataFrame.prototype.getChoiceOptions = function () {
	const opts = [];
	for (let i = 0; i < this.frame.elements.length; i += 1) {
		const option = {};
		if (this.frame.elements[i].label) {
			option.label = this.frame.elements[i].label['@value'];
		} else {
			option.label = FrameHelper.labelFromURL(this.frame.elements[i].class);
		}
		option.value = this.frame.elements[i].class;
		opts.push(option);
	}
	return opts;
};

DataFrame.prototype.lang = function () {
	return 'en';
};

DataFrame.prototype.isChoice = function () {
	return (this.frame && this.frame.type === 'oneOf');
};

DataFrame.prototype.isDocument = function () {
	return (this.frame && this.frame.type === 'document');
};

DataFrame.prototype.isData = function () {
	return (this.isDocument() || this.isChoice() || this.isDatatypeProperty());
};

DataFrame.prototype.isObject = function () {
	return (this.isObjectProperty() && this.frame && !(this.isChoice() || this.isDocument()));
};

DataFrame.prototype.isProperty = function () {
	return false;
};

DataFrame.prototype.getTypeShorthand = function () {
	if (this.isDocument()) return 'document';
	if (this.isChoice()) return 'choice';
	var sh = FrameHelper.getShorthand(this.getType());
	return (sh ? sh : this.getType());
};

DataFrame.prototype.get = function () {
	if (this.contents) {
		return this.contents;
	}
	if (this.isDatatypeProperty() && this.rangeValue && typeof this.rangeValue['@value'] !== 'undefined') {
		return this.rangeValue['@value'];
	}
	if (this.isChoice() || this.isDocument()) {
		return this.frame.domainValue;
	}
	return '';
};

DataFrame.prototype.set = function (value, normalizer) {
	if (normalizer) value = normalizer(value, this);
	this.contents = value;
	if (this.isChoice() || this.isDocument()) {
		this.frame.domainValue = value;
	}
	if (this.isDatatypeProperty() && this.rangeValue) {
		this.rangeValue['@value'] = value;
	}
};

DataFrame.prototype.clear = function () {
	if (this.isDocument() || this.isChoice() || this.isDatatypeProperty()) {
		this.set('');
	}
};

/*
 * Class frames represent the archetypal version of a property frame as returned by the class frame api
 */
function ClassFrame(frame, parent) {
	this.err = false;
	this.parent = parent;
	this.children = {};
	// the id of the object that owns this dataframe
	this.subjid = (parent ? parent.subjid : false);
	if (frame) {
		this.load(frame);
	}
}

ClassFrame.prototype = DataFrame.prototype;

ClassFrame.prototype.loadFromObjectFrame = function (par, child) {
	// all the meta-data carried in frames:
	this.type = 'objectProperty';
	this.property = par.property;
	this.range = par.range;
	this.rangeValue = child.subjid;
	this.domain = par.cls;
	this.domainValue = par.subjid;
	this.label = par.getLabel();
	this.comment = par.getComment();
	this.restriction = par.restriction;
};

ClassFrame.prototype.createEmptyChoice = function (cls, newid) {
	const cf = this.getChosenClassFrames(cls);
	const objframe = new ObjectFrame(cls);
	if (newid) objframe.subjid = newid;
	objframe.loadClassFrames(cf);
	const fframe = objframe.fillFromSchema();
	return fframe;
};

ClassFrame.prototype.getChosenClassFrames = function (chosen) {
	let nc = [];
	for (let i = 0; i < this.frame.operands.length; i += 1) {
		for (let j = 0; j < this.frame.operands[i].length; j += 1) {
			if (chosen === this.frame.operands[i][j].domain) {
				nc = nc.concat(this.frame.operands[i][j]);
			}
		}
	}
	return nc;
};

ClassFrame.prototype.createEmpty = function (newid) {
	if (this.isObject()) {
		const objframe = new ObjectFrame(this.range);
		if (newid) objframe.subjid = newid;
		objframe.loadClassFrames(this.frame);
		const fframe = objframe.fillFromSchema();
		return fframe;
	}
	if (this.isData()) {
		const dataframe = this.copy();
		dataframe.set('');
		return dataframe;
	}
	return undefined;
};

ClassFrame.prototype.cloneDataFrame = function (newid, other) {
	return other;
};

ClassFrame.prototype.clone = function (newid, other) {
	if (this.isObject()) {
		console.log('cannot clone class frame');
	} else if (this.isData()) {
		return this.cloneDataFrame(newid, other);
	}
	return undefined;
};

ClassFrame.prototype.getClassChoices = function () {
	const choices = [];
	if(this.frame.operands){
		for (let i = 0; i < this.frame.operands.length; i += 1) {
			for (let j = 0; j < this.frame.operands[i].length; j += 1) {
				const domcls = this.frame.operands[i][j].domain;
				if (domcls && choices.indexOf(domcls) === -1) {
					choices.push(domcls);
				}
			}
		}
	}
	return choices;
};

ClassFrame.prototype.getChosenClassFrame = function (chosen) {
	for (let i = 0; i < this.frame.operands.length; i += 1) {
		const operand = this.frame.operands[i];
		if (operand.length) {
			for (let j = 0; j < operand.length; j += 1) {
				if (operand[j] && (chosen === operand[j].domain)) {
					const cf = new ClassFrame(operand);
					return cf;
				}
			}
		} else if (operand.range && chosen === operand.range) {
			const cf = new ClassFrame(operand);
			return cf;
		}
	}
	return false;
};

ClassFrame.prototype.getChosenFrame = function (dataframe) {
	return dataframe;
};


function Restriction(restriction) {
	this.min = 0;
	this.max = 0;
	if (restriction) this.loadRestriction(restriction);
}

Restriction.prototype.hasCardRestriction = function () {
	if (this.min === 0 && this.max === 0) return false;
	return true;
};

Restriction.prototype.loadRestriction = function (restriction) {
	if (typeof restriction.cardinality !== 'undefined') {
		this.max = restriction.cardinality;
		this.min = restriction.cardinality;
	} else if (typeof restriction.maxCardinality !== 'undefined') {
		this.max = restriction.maxCardinality;
	} else if (typeof restriction.minCardinality !== 'undefined') {
		this.min = restriction.minCardinality;
	} else if (typeof restriction.type !== 'undefined' && restriction.type === 'and' && typeof restriction.operands === 'object') {
		for (let i = 0; i < restriction.operands.length; i += 1) {
			const nrest = new Restriction(restriction.operands[i]);
			if (this.max === 0 && nrest.max > 0) this.max = nrest.max;
			else if (this.max > 0 && nrest.max > 0 && nrest.max < this.max) this.max = nrest.max;
			if (this.min === 0 && nrest.min > 0) this.min = nrest.min;
			else if (this.min > 0 && nrest.min > 0 && nrest.min > this.min) this.min = nrest.min;
		}
	}
};

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
	for(var i = 0; i<rules.length; i++){
		var match = (!rules[i].pattern || this.patternMatchesFrame(rules[i].pattern, frame));
		if(match){
			matched_rules.push(rules[i]);
			if(onmatch && typeof onmatch == "function"){
				onmatch(frame, rules[i]);
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
	this.renderer = (pattern.renderer ? pattern.renderer : false);
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
	if(this.renderer && (this.renderer != rtype) && (this.renderer != "*" )) return false;
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


module.exports = ObjectFrame;
