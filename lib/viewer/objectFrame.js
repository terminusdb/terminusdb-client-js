const FrameHelper = require('../utils');
const FrameConfig = require('./frameConfig');
const FrameRule = require('./frameRule');

/**
 * @file Javascript Terminus Document Classes
 * @license Apache Version 2
 * Helper classes for accessing documents returned by the Terminus DB API programmatically
 *
 * @example
 * let doc = new TerminusDocument(client);
 *
 * //These set the objects document property and return promises:
 *
 * doc.loadDocument(URL).then(() => console.log(this.document));
 * doc.loadComplete(URL, CLS).then(() => console.log(this.document))
 * doc.loadSchema(cls).then(() => console.log(this.document))
 *
 * //These just set the object's document property
 * doc.loadJSON(json_frames, cls) //console.log(this.document)
 * doc.loadDataFrames(json_frames, cls)
 * doc.loadClassFrames(json_frames, cls)
 * @example
 *
 * @description Represents a frame for programmatic access to object frame, anywhere within a document
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

function ObjectFrame(cls, jsonld, classframes, parent) {
	// the class of the frame - mandatory
	this.empty();
	this.cls = cls;

	// array of frames representing the full class frame
	// (optional - required to be able to safely add missing properties)
	if (classframes && typeof classframes === 'object') {
        this.loadClassFrames(classframes);
	}
	if (jsonld && typeof jsonld == 'object' && Object.keys(jsonld).length) {
		this.originalDocument = jsonld;
        this.loadJSONLDDocument(jsonld);
	} else {
		this.originalDocument = false;
	}
	// parent object frame
	this.parent = parent;
	// set to true if this is a newly created document
	this.newDoc = false;
}

/**
 * Loads class frames for the object's class - the instructions about how to put an object together
 */
ObjectFrame.prototype.loadClassFrames = function (classframes) {
	for (let j = 0; j < classframes.length; j += 1) {
		if (classframes[j]['@context']) this.jsonld_context = classframes[j]['@context'];

        const cf = new ClassFrame(classframes[j], this);
		if (cf.isValid()) {
			if(!this.classframes) this.classframes = {};
			if(typeof this.classframes[classframes[j].property] === 'undefined') {
				this.classframes[classframes[j].property] = [];
			}
			this.classframes[classframes[j].property] = cf;
			if (cf.isObject() && this.properties[classframes[j].property]) {
				for (let i = 0; i < this.properties[classframes[j].property].values.length; i += 1) {
					this.properties[classframes[j].property].values[i].loadClassFrames(classframes[j].frame);
				}
			}
        }
        else {
            console.log("Invalid classframe", cf)
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
/*ObjectFrame.prototype.loadDataFrames = function (frames) {
	if (typeof frames !== 'object' || !frames.length) return undefined;
	if (!this.originalFrames) this.originalFrames = frames;
	if (!this.subjid && frames[0].domainValue) this.subjid = frames[0].domainValue;
	for (let i = 0; i < frames.length; i += 1) {
		if (frames[i]['@context']) this.jsonld_context = frames[i]['@context'];
		let cframe = this.getPropertyClassFrame(frames[i].property, frames[i]);
		if (cframe && cframe.isClassChoice()) {
			cframe = cframe.getChosenClassFrame(frames[i].range);
			if (!cframe) {
				console.log(`no choice frame ${frames[i].range}`);
			}
		} else if (cframe && cframe.isLogic()) {
			cframe = cframe.getChosenFrame(frames[i]);
		}
		if (cframe) {
			if (typeof this.properties[frames[i].property] === 'undefined') {
				this.properties[frames[i].property] = new PropertyFrame(frames[i].property, cframe, this);
			}
			this.properties[frames[i].property].addFrame(frames[i]);
		}
	}
	return this;
};*/

ObjectFrame.prototype.loadJSONLDDocument = function (doc) {
    if (typeof doc !== 'object') return undefined;
	if (!this.originalDocument) this.originalDocument = doc;
    if (!this.subjid && doc["@id"]){
        this.subjid = doc["@id"]
    }
    if (doc['@context']) this.jsonld_context = doc['@context'];
    for(var prop in doc){
        if(prop[0] == "@" || (typeof doc[prop] == "object" && Object.keys(doc[prop]).length == 0)) continue
        let cframe = this.getPropertyClassFrame(prop, doc)
		if (cframe && cframe.isClassChoice()) {
			cframe = cframe.getChosenClassFrame(doc[prop]["@type"])
			if (!cframe) {
				console.log(`no choice frame ${doc[prop]["@type"]}`);
			}
		} else if (cframe && cframe.isLogic()) {
			cframe = cframe.getChosenFrame(doc[prop]);
		}
		if (cframe) {
			if (typeof this.properties[prop] === 'undefined') {
				this.properties[prop] = new PropertyFrame(prop, cframe, this);
			}
			this.properties[prop].addJSONLDDocument(doc[prop]);
		}
    }
	return this;
};


/*
 * Serialises the javascript object as an array of frames
 */
ObjectFrame.prototype.getAsFrame = function (prop, parent) {
	if (this.parentframe) return this.parentframe;
	const ff = { type: 'objectProperty', property: prop };
	ff.range = this.cls;
	ff.domain = parent.cls;
	ff.domainValue = parent.subjid;
	ff.frame = [];
	for (const prop of Object.keys(this.properties)) {
		ff.frame = ff.frame.concat(ff.frame, this.properties[prop].getAsFrames());
	}
	return ff;
};

ObjectFrame.prototype.getAsFrames = function (prop, parent) {
	var frames = [];
	for (const prop of Object.keys(this.properties)) {
		frames = frames.concat(frames, this.properties[prop].getAsFrames());
	}
	return frames;
}

/**
 * Cleans out object and sets everything empty
 */
ObjectFrame.prototype.empty = function () {
	// all indexed by property
	this.properties = {};
	this.restrictions = {};
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
ObjectFrame.prototype.mfilter = function (rules, onmatch) {
	var hits = new FrameRule().testRules(rules, this, onmatch);
	for (const prop of Object.keys(this.properties)) {
        if(!this.properties[prop].mfilter){
            console.log(prop, this.properties[prop])
        }
        else {
            this.properties[prop].mfilter(rules, onmatch);
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
ObjectFrame.prototype.getPropertyClassFrame = function (prop, jsonlddoc) {
    prop = FrameHelper.unshorten(prop)
	if (this.classframes && typeof this.classframes === 'object' && typeof this.classframes[prop] === 'object') {
        //console.log("returning " + prop, this.classframes[prop])
		return this.classframes[prop];
	}
	if (jsonlddoc) {
        const cf = new ClassFrame();
        cf.loadFromJSONLD(jsonlddoc, prop)
		return cf;
	}
	if (this.properties[prop]) {
		return new ClassFrame(this.properties[prop].values[0]);
	}
	return false;
};

/*
 * Returns a list of properties - type can be filled|missing|all
 */
ObjectFrame.prototype.getProperties = function (type) {
	if(type == "filled" || !this.classframes){
		return Object.keys(this.properties);
	}
	if (type == 'missing') {
		const filled = Object.keys(this.properties).map((item) => FrameHelper.unshorten(item))
		const all = Object.keys(this.classframes).map((item) => FrameHelper.unshorten(item))
		const missing = [];
		for (let i = 0; i < all.length; i++) {
			if (filled.indexOf(all[i]) == -1 && missing.indexOf(all[i]) == -1) {
				missing.push(all[i]);
			}
		}
		return missing;
	}
	return Object.keys(this.classframes);
};

/**
 * Missing properties are those that are present in the classframe,
 * but not instantiated in the current object frame
 * for this to work we need to load the frame with the associated classframe
 */
ObjectFrame.prototype.getMissingPropertyList = function () {
	var missing = this.getProperties("missing");
	const nmissing = [];
	for (let i = 0; i < missing.length; i++) {
		const cframe = this.getPropertyClassFrame(missing[i]);
		if(cframe){
			var newb = { label: cframe.getLabel(), value: missing[i] };
		}
		else {
			var newb = { label: missing[i], value: missing[i]};
		}
		nmissing.push(newb);
	}
	return nmissing;
};

/**
 * List of properties that are filled in the object
 */
ObjectFrame.prototype.getFilledPropertyList = function () {
	var props = this.getProperties("filled");
	const filled = [];
	for (let i = 0; i < props.length; i++) {
		const cframe = this.getPropertyClassFrame(props[i]);
		if(cframe){
			var newb = { label: cframe.getLabel(), value: props[i] };
		}
		else {
			var newb = { label: props[i], value: props[i]};
		}
		filled.push(newb);
	}
	return filled;
};

/*
 * Fills the object frame from the schema - adding all the necessary property frames, etc to make it complete
 */
ObjectFrame.prototype.fillFromSchema = function (newid) {
	if (newid) this.subjid = newid;
	newid = (newid || FrameHelper.genBNID(FrameHelper.urlFragment(this.cls)+"_"));
	const properties = {};
	if(this.classframes){
		for (const prop of Object.keys(this.classframes)) {
            const pf = this.getPropertyClassFrame(prop);
            properties[prop] = new PropertyFrame(prop, pf, this);
			properties[prop].fillFromSchema(newid);
		}
	}
	this.properties = properties;
	this.originalFrames = [];
	for (const prop of Object.keys(this.properties)) {
		this.originalFrames.push(this.properties[prop].getAsFrames());
	}
	return this;
};

/*
 * Clones an object frame to be a copy of the current frame
 */
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
 * Returns a child frame with a particular id
 * If the second parameter is included, it will only look in that specific property
 * Otherwise searches all properties for the child
 */
ObjectFrame.prototype.getChild = function (childid, prop) {
	let pframe = this.getProperty(prop);
	for (let i = 0; i < pframe.values.length; pframe++) {
		if (pframe.values[i].isObject() && pframe.values[i].subject === childid) return pframe.values[i];
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
	var ndata = false;
	if(cframe){
		const nprop = new PropertyFrame(prop, cframe, this);
		if(cframe.isObject()){
			if (!cframe.isClassChoice()) {
				ndata = cframe.createEmpty(FrameHelper.genBNID(FrameHelper.urlFragment(cframe.range) + "_"));
			}
			if (cls) {
				ndata = cframe.createEmptyChoice(cls, FrameHelper.genBNID(FrameHelper.urlFragment(cls)+ "_"));
			}
			const clss = cframe.getClassChoices();
			if (clss && clss.length) {
				ndata = cframe.createEmptyChoice(clss[0], FrameHelper.genBNID(FrameHelper.urlFragment(clss[0])+ "_"));
			}
		}
		else {
			ndata = cframe.createEmpty();
		}
		if(ndata){
			nprop.addValueFrame(ndata);
		}
		if (typeof this.properties[prop] === 'undefined') {
			this.properties[prop] = nprop;
		}
		else {
            //this.properties[prop].push(nprop);
        }
		return nprop;
	}
	return false;
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
	if (pframe.values.length == 0) {
		this.removeProperty(prop);
	}
};

ObjectFrame.prototype.error = function (msg) {
    if(!this.errors) this.errors = []
    this.errors.push({"type": "Internal Object Frame Error", msg})
}

ObjectFrame.prototype.extract = function(){
    var extracts = {};
	for(var prop in this.properties){
        //if(!Array.isArray(this.properties[prop])) this.properties[prop] = [this.properties[prop]]
		//for(var i = 0; i<this.properties[prop].length; i++){
            var extracted = this.properties[prop].extract();
			if(!FrameHelper.empty(extracted)){
				if(typeof extracts[prop] == "undefined") extracts[prop] = [];
				extracts[prop] = extracts[prop].concat(extracted);
			}
        //}
        if(extracts[prop] && extracts[prop].length == 1) extracts[prop] = extracts[prop][0] 
	}
	if(FrameHelper.empty(extracts) && this.parent){
		return false;
	}
	else {
		var ext = this.extractJSONLD(extracts);
		return ext;
	}
}

ObjectFrame.prototype.extractJSONLD = function(extracts){
	extracts["@type"] = this.cls;
	if(this.subject() != "_:")	extracts["@id"] = this.subject();
	if(this.jsonld_context) extracts['@context'] = this.jsonld_context;
	return extracts;
}


ObjectFrame.prototype.subject = function () {
	return this.subjid || "";
};

ObjectFrame.prototype.get = ObjectFrame.prototype.subject;
ObjectFrame.prototype.set = function(val){
	this.subjid = val;
}

ObjectFrame.prototype.isObject = function () { return true; };
ObjectFrame.prototype.isProperty = function () { return false; };
ObjectFrame.prototype.isData = function () { return false; };


ObjectFrame.prototype.subjectClass = function () {
	return this.cls;
};

ObjectFrame.prototype.depth = function () {
	if (this.parent) return (this.parent.depth() + 1);
	return 0;
};

ObjectFrame.prototype.getProperty = function (prop) {
	return this.properties[prop];
};

ObjectFrame.prototype.first = function (prop) {
	if (this.properties && this.properties[prop]) {
		return this.properties[prop].first();
	}
};

ObjectFrame.prototype.property = function (prop) {
	if (this.parent) return this.parent.property();
	return false;
};

ObjectFrame.prototype.parentObject = function () {
	if (this.parent && this.parent.parent) {
		return this.parent.parent;
	}
	return false;
};

ObjectFrame.prototype.root = function () {
	if (this.parent) return false;
	return true;
};

ObjectFrame.prototype.renderProperties = function () {
	const props = this.sortProperties();
	const nprops = [];
	for (let i = 0; i < props.length; i++) {
		if (this.properties[props[i]].render) {
			const rend = this.properties[props[i]].render(this.properties[props[i]]);
			if (rend) nprops.push(rend);
		}
	}
	return nprops;
};

ObjectFrame.prototype.sortProperties = function () {
	const unsorted = Object.keys(this.properties);
	if (this.compare) {
		return unsorted.sort((a, b) => this.compare(a, b, this));
	}
	return unsorted.sort((a, b) => this.standardCompare(a, b, this));
};

/*
 * Label first, then datatype properties, then object properties
 */
ObjectFrame.prototype.standardCompare = function (a, b, doc) {
	if (FrameHelper.shorten(a) == 'rdfs:label') return -1;
	if (FrameHelper.shorten(b) == 'rdfs:label') return 1;
	if (FrameHelper.shorten(a) == 'rdfs:comment') return -1;
	if (FrameHelper.shorten(b) == 'rdfs:comment') return 1;
	if (doc.properties[a].isData() && doc.properties[b].isObject()) return -1;
	if (doc.properties[b].isData() && doc.properties[a].isObject()) return 1;
	return 0;
};

ObjectFrame.prototype.cardControlAllows = function(action){
	if(!this.parent) return true;
	if(this.parent.cframe.hasRestriction()){
		var rest = this.parent.cframe.restriction;
		var currentnum = this.parent.values.length;
		if(action == "add" || action == "clone"){
			if(rest.max && currentnum >= rest.max){
				return false;
			}
		}
		if(action == "delete" && (rest.min && currentnum <= rest.min)){
			return false;
		}
	}
	return true;
}

ObjectFrame.prototype.isUpdated = function(){
	var i = 0;
	for(var prop in this.properties){
		if(this.originalFrames[i] != prop) return true;
		if(this.properties[prop].isUpdated()) return true;
		i++;
	}
	if(i != this.originalFrames.length) return true;
	return false;
}

ObjectFrame.prototype.isNew = function(){
	return (this.subject().substring(0, 2) == "_:");
}

ObjectFrame.prototype.getSummary = function(){
	var ret = { status: "ok" };
	if(this.isUpdated()) ret.status = "updated";
	if(this.isNew()) ret.status = "new";
	ret.propcount = 0;
	for(var prop in this.properties){
		ret.propcount++;
	}
	ret.long = ret.propcount + " properties";
	return ret;
}

function PropertyFrame(property, cframe, parent) {
	this.predicate = property;
	this.cframe = cframe;
	this.parent = parent;
	this.values = [];
}


PropertyFrame.prototype.addJSONLDDocument = function(jsonld){
	if(this.cframe.isData()){
        if(Array.isArray(jsonld)){
            for(var i = 0; i<jsonld.length; i++){
                var df = new DataFrame(jsonld[i], this, this.values.length);
                this.values.push(df);
            }
        }
        else {
    		var df = new DataFrame(jsonld, this, this.values.length);
            this.values.push(df);
        }
	} else {
        if(Array.isArray(jsonld)){
            for(var i = 0; i<jsonld.length; i++){
                const kid = new ObjectFrame(FrameHelper.unshorten(jsonld[i]["@type"]), jsonld[i], this.cframe.frame, this);
                this.values.push(kid);
            }
        }
        else {
    		const kid = new ObjectFrame(jsonld["@type"], jsonld, this.cframe.frame, this);
            this.values.push(kid);
        }
	}
}

PropertyFrame.prototype.addFrame = function (frame) {
	if(this.cframe.isData()){
		var df = new DataFrame(frame, this, this.values.length);
		this.values.push(df);
	} else {
		const kid = new ObjectFrame(this.range(), this.cframe.frame, frame.frame, this, frame);
		this.values.push(kid);
	}
};

PropertyFrame.prototype.addValueFrame = function (oframe) {
	oframe.parent = this;
	oframe.index = this.values.length;
	this.values.push(oframe);
};


PropertyFrame.prototype.fillFromSchema = function (newid) {
	if (this.isData() || (this.isObject() && !this.isClassChoice())) {
		var values = [];
		if (this.cframe.hasRestriction() && this.cframe.restriction.min) {
			for (let i = 0; i < this.cframe.restriction.min; i += 1) {
				var nframe = this.createEmpty(newid);
				nframe.parent = this;
				values.push(nframe);
			}
		}
		else {
			var nframe = this.createEmpty(newid);
			nframe.parent = this;
			values.push(nframe);
		}
		this.values = values;
	}
	else if (this.isClassChoice()) {
        const clss = this.cframe.getClassChoices();
		if (clss && clss.length) {
			const empty = this.cframe.createEmptyChoice(clss[0], FrameHelper.genBNID(FrameHelper.urlFragment(clss[0])+ "_"));
			empty.parent = this;
			this.values = [empty];
		}
	}
};

PropertyFrame.prototype.isData = function () {
	return this.cframe.isData();
};

PropertyFrame.prototype.isObject = function () {
	return this.cframe.isObject();
};

PropertyFrame.prototype.isProperty = function () {
	return true;
};

PropertyFrame.prototype.property = function () {
	return this.predicate;
};

PropertyFrame.prototype.extract = function () {
    const extracts = [];
    const hasVal = (val) => {
        if(val['@value']){
            for(var i = 0; i<extracts.length; i++){
                if(extracts[i]["@value"] && extracts[i]["@value"] == val["@value"] 
                && extracts[i]["@type"] && extracts[i]["@type"] == val["@type"]) return true
            }
            return false

        }
        else if(val["@id"]){
            for(var i = 0; i<extracts.length; i++){
                if(extracts[i]["@id"] && extracts[i]["@id"] == val["@id"]) return true
            }
            return false
        }
    }
 	for (let i = 0; i < this.values.length; i++) {
        const val = this.values[i].extract();
  		if (val !== '' && val !== false && typeof val !== 'undefined' && !hasVal(val)) extracts.push(val);
 	}
	return extracts;
};

PropertyFrame.prototype.subject = function () {
	return (this.parent ? this.parent.subject() : false);
};
PropertyFrame.prototype.subjectClass = function () {
	return (this.parent ? this.parent.subjectClass() : false);
};
PropertyFrame.prototype.depth = function () {
	return (this.parent ? this.parent.depth() : false);
};
PropertyFrame.prototype.updated = function () {
	return (this.parent ? this.parent.childUpdated() : false);
};
PropertyFrame.prototype.range = function () {
	return (this.cframe ? this.cframe.range : '');
};
PropertyFrame.prototype.getLabel = function () {
	return (
		this.cframe ? this.cframe.getLabel() : '');
};
PropertyFrame.prototype.getComment = function () {
	return (this.cframe ? this.cframe.getComment() : false);
};
PropertyFrame.prototype.hasCardinalityRestriction = function () {
	return (this.cframe ? this.cframe.hasRestriction() : false);
};
PropertyFrame.prototype.getRestriction = function () {
	return (this.cframe ? this.cframe.restriction : false);
};
PropertyFrame.prototype.isClassChoice = function () {
	return (this.cframe ? this.cframe.isClassChoice() : false);
};

PropertyFrame.prototype.deletePropertyValue = function (value, index) {
	this.parent.removePropertyValue(this.property(), value, index);
};

PropertyFrame.prototype.removeValue = function (value, index) {
    let nvals = []
    for(var i = 0; i<this.values.length; i++){
        if(this.values[i].get() != value){
            nvals.push(this.values[i])
        }
    }
    this.values = nvals
}


PropertyFrame.prototype.get = function(){
	var gets = [];
	for(var i = 0; i<this.values.length; i++){
		if(this.values[i]) {
			var x = this.values[i].get();
			if(x) gets.push(x);
		}
	}
	return gets;
}

PropertyFrame.prototype.set = function(val){
	for(var i = 0; i<this.values.length; i++){
		if(this.values[i]) {
			this.values[i].set(val);
		}
	}
}


PropertyFrame.prototype.clear = function(){
	for(var i = 0 ; i<this.values.length; i++){
		this.values[i].clear();
	}
}

PropertyFrame.prototype.clone = function(){
	const cvalues = [];
	const cloned = new PropertyFrame(this.predicate, this.cframe, this.parent);
	for(var i = 0 ; i<this.values.length; i++){
		cvalues.push(this.values[i].clone());
	}
	cloned.values = cvalues;
	return cloned;
	//
}

PropertyFrame.prototype.getAsFrames = function(){
	var fs = [];
	for(var i = 0; i<this.values.length; i++){
		if(this.values[i]){
			if(this.isData()){
				fs.push(this.values[i].getAsFrame());
			}
			else {
				fs = fs.concat(this.values[i].getAsFrames());
			}
		}
	}
	return fs;
}

PropertyFrame.prototype.createEmpty = function(){
	if (this.cframe.isData()) {
        const df = this.cframe.copy(this.subject());        
		df.set('');
		return df;
	}
	else if (this.cframe.isObject()) {
		if (!this.cframe.isClassChoice()) {
			const df = this.cframe.createEmpty(FrameHelper.genBNID(FrameHelper.urlFragment(this.cframe.range)+ "_"));
			return df;
		}
		const clss = this.cframe.getClassChoices();
		if (clss && clss.length) {
			const df = this.cframe.createEmptyChoice(clss[0], FrameHelper.genBNID(FrameHelper.urlFragment(clss[0])+ "_"));
			return df;
		}
	}
}

PropertyFrame.prototype.mfilter = function (rules, onmatch) {
	var hits = new FrameRule().testRules(rules, this, onmatch);
	for (var i = 0; i<this.values.length; i++){
		this.values[i].mfilter(rules, onmatch);
	}
	return this;
}

/*
 * Shorthand functions to make it easier to access the underlying data
 */

PropertyFrame.prototype.first = function () {
	if (this.values && this.values[0]) {
		return this.values[0].get();
	}
};

PropertyFrame.prototype.renderValues = function(){
	var sortedVals = this.sortValues();
	var vals = [];
	for(var i = 0; i<sortedVals.length; i++){
		if(sortedVals[i] && sortedVals[i].render){
			var rend = sortedVals[i].render(sortedVals[i]);
			if(rend) vals.push(rend);
		}
	}
	return vals;
};

PropertyFrame.prototype.sortValues = function () {
	if (this.compare) {
		return this.values.sort((a, b) => this.compare(a, b, this));
	}
	return this.values;
};

PropertyFrame.prototype.cardControlAllows = function(action){
	if(this.cframe.hasRestriction()){
		var rest = this.cframe.restriction;
		var currentnum = this.values.length;
		if(action == "add" || action == "clone"){
			if(rest.max && currentnum >= rest.max){
				return false;
			}
		}
		if(action == "delete" && (rest.min)){
			return false;
		}
	}
	return true;
}

PropertyFrame.prototype.isUpdated = function(){
	return true;
	if(this.values.length != this.originalValues.length) return true;
	for(var i = 0 ; i < this.values.length; i++){
		if(this.cframe && this.cframe.isData()){
			if(this.values[i].value() != this.originalValues[i]){
				return true;
			}
		}
		else {
			if(this.values[i].subject() != this.originalValues[i]) {
				return true;
			}
			if(this.values[i].isUpdated()) {
				return true;
			}
		}
	}
	return false;
}


function DataFrame(jsonld, parent, index) {
    this.err = false;
	this.index = index;
    if(parent){
        this.loadParent(parent)
    }
    if(jsonld){
        this.rangeValue = jsonld
        if(jsonld['@type']) this.range = jsonld['@type']
        if(!this.type) this.type = (jsonld['@value'] ? "datatypeProperty" : "objectProperty") 
    }
    return this
}

DataFrame.prototype.loadParent = function (parent, index) {
	this.parent = parent;
	this.type = parent.type
	// the id of the object that owns this dataframe
	this.domainValue = parent.subject();
	this.subjid = (parent.subject() || false);
    this.domain = parent.cframe ? parent.cframe.domain : parent.subjectClass();
    this.predicate = parent.cframe ? parent.cframe.predicate : parent.property();
	this.frame = parent.cframe ? parent.cframe.frame : false;
    this.label = parent.getLabel();
    this.comment = parent.getComment();
    this.range = ((parent && parent.cframe) ? parent.cframe.range : false)
	const restriction = (parent.cframe ? parent.cframe.restriction : false);
	this.restriction = false;
	if (restriction && typeof restriction === 'object') {
		this.restriction = new Restriction(restriction);
	}
}

DataFrame.prototype.copy = function (newid) {
    const copy = new DataFrame();
    copy.parent = this.parent
    copy.range=this.range
    copy.rangeValue=false
    copy.index=this.index
    copy.type=this.type
    copy.domainValue = newid || this.domainValue
    copy.predicate = this.predicate
    copy.frame = this.frame
    copy.label = this.label
    copy.comment = this.comment
    if(this.restriction) copy.restriction = this.restriction
	return copy;
};

DataFrame.prototype.mfilter = function (rules, onmatch) {
	var hits = new FrameRule().testRules(rules, this, onmatch);
	return this;
};

DataFrame.prototype.delete = function () {
	this.parent.deletePropertyValue(this.get(), this.index);
};

DataFrame.prototype.save = function () {
	if (this.parent) {
		this.parent.save();
	}
};

DataFrame.prototype.reset = function () {
	this.set(this.originalValue);
	// this.redraw();
};

DataFrame.prototype.clone = function () {
	const newb = this.parent.addPropertyValue(this.get());
	const nrend = this.copy(newb);
	nrend.setNew();
	nrend.mode = 'edit';
	nrend.index = this.parent.values.length;
	this.parent.values.push(nrend);
};


DataFrame.prototype.depth = function () { return (this.parent ? this.parent.depth() : false); };
DataFrame.prototype.property = function () { return (this.parent ? this.parent.property() : false); };
DataFrame.prototype.subject = function () { return (this.parent ? this.parent.subject() : false); };
DataFrame.prototype.subjectClass = function () { return (this.parent ? this.parent.subjectClass() : false); };
DataFrame.prototype.type = function () {	return (this.range ? this.range : false); };

DataFrame.prototype.isValidType = function (dt) {
	const vtypes = ['datatypeProperty', 'objectProperty', 'restriction '];
	if (vtypes.indexOf(dt) === -1) return false;
	return true;
};


DataFrame.prototype.getAsFrame = function () {
	 const ff = { type: this.type, property: this.property() };
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

DataFrame.prototype.getLabel = function () {
	let lab = '';
	if(FrameHelper.shorten(this.predicate) == "rdfs:label") return "Name";
	if(FrameHelper.shorten(this.predicate) == "rdfs:comment") return "Description";
	if (this.label && typeof this.label === 'object') lab = this.label['@value'];
	if (this.label && typeof this.label === 'string') lab = this.label;
	// always return something
	if (!lab && this.predicate){
        lab = FrameHelper.labelFromURL(this.predicate)
    }
	if (!lab) lab = FrameHelper.labelFromURL(this.cls);
	return lab;
};

DataFrame.prototype.getType = function () {
	if (this.range) return this.range;
	if (this.rangeValue && this.rangeValue["@type"]) return this.rangeValue["@type"];
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
    if (msg) this.err = msg;
    if(!this.errors) this.errors = []
    this.errors.push({"type": "Internal Data Frame Error", msg})    
	return this.err;
};

DataFrame.prototype.isValid = function () {
	if (!(this.type && this.isValidType(this.type))) {
		this.error(`Missing or Illegal Frame Type ${this.type}`);
		return false;
	}
	if (!(this.predicate)) {
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
	const sh = FrameHelper.getShorthand(this.getType());
	return (sh || this.getType());
};

DataFrame.prototype.get = function () {
	if (this.contents) {
		return this.contents;
	}
	if (this.isDatatypeProperty() && this.rangeValue && typeof this.rangeValue['@value'] !== 'undefined') {
		return this.rangeValue['@value'];
	}
	if (this.isChoice() || this.isDocument()) {
		return (this.rangeValue && this.rangeValue["@id"] ? this.rangeValue['@id'] : "")
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

DataFrame.prototype.cardControlAllows = function(action){
	if(this.parent.cframe.hasRestriction()){
		var rest = this.parent.cframe.restriction;
		var currentnum = this.parent.values.length;
		if(action == "add" || action == "clone"){
			if(rest.max && currentnum >= rest.max){
				return false;
			}
		}
		if(action == "delete" && (rest.min && currentnum <= rest.min)){
			return false;
		}
	}
	return true;
}

DataFrame.prototype.extract = function(){
	let val = this.get();
	if(val !== "" && val !== false){
        let objlit = {}
        if(!this.isDocument()){
            objlit["@type"] = this.getType()
        }
        if(this.isChoice() || this.isDocument()){
            objlit["@id"] = val
        }
        else {
            objlit["@value"] = val
        }
        return objlit;
	}
	return val;
}


/*
 * Class frames represent the archetypal version of a property frame as returned by the class frame api
 */
function ClassFrame(frame, parent) {
	this.err = false;
	this.parent = parent;
	// the id of the object that owns this dataframe
	this.subjid = (parent ? parent.subjid : false);
	if (frame) {
		this.load(frame);
	}
}
ClassFrame.prototype = DataFrame.prototype;

ClassFrame.prototype.load = function (frame) {
	if (typeof frame !== 'object') {
		this.error('No frame passed to load');
		return;
    }
    this.domainValue = frame.domainValue;
	this.subjid = (frame.domainValue ? frame.domainValue : false);
	this.type = frame.type;
    this.domain = frame.domain;
    this.predicate = frame.property;
	this.frame = frame.frame;
	this.label = frame.label ? frame.label["@value"] : ""
    this.comment = frame.comment ? frame.comment['@value'] : ""
    this.range = frame.range;

	// all the meta-data carried in frames:
	this.rangeValue = frame.rangeValue
};



//cf.loadFromJSONLD(jsonlddoc)
ClassFrame.prototype.loadFromJSONLD = function (jsonld, prop) {
    prop = FrameHelper.shorten(prop)
    if(jsonld[prop]){
        this.predicate = FrameHelper.unshorten(prop)
        this.type = (jsonld[prop]["@value"] ? 'datatypeProperty' : 'objectProperty')
        this.range = FrameHelper.unshorten(jsonld[prop]["@type"])
        this.rangeValue = jsonld[prop]["@id"] ? jsonld[prop]["@id"] : jsonld[prop]
    }
	this.domain = FrameHelper.unshorten(jsonld["@type"])
	this.domainValue = FrameHelper.unshorten(jsonld["@id"])
    this.label = FrameHelper.labelFromURL(this.predicate)
    this.comment = ""//this.getComment()
}


ClassFrame.prototype.loadFromObjectFrame = function (par, child) {
	// all the meta-data carried in frames:
	this.type = 'objectProperty';
	this.predicate = par.property;
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
		const dataframe = this.copy(newid);
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
	if (this.frame.operands) {
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

module.exports = ObjectFrame;
