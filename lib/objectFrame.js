/**
 * Represents a frame for visualising a specific object frame, anywhere within a document
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

ObjectFrame.prototype.getAsFrame = function (prop, parent) {
	if (this.parentframe) return this.parentframe;
	const ff = { type: 'objectProperty', property: prop };
	ff.range = this.cls;
	ff.domain = parent.cls;
	ff.domainValue = parent.subjid;
	ff.frame = [];
	for (const pFrame of Object.keys(this.dataframes)) {
		for (let i = 0; i < this.dataframes[pFrame].length; i += 1) {
			ff.frame.push(this.dataframes[pFrame][i].getAsFrame());
		}
	}
	for (const key of Object.keys(this.children)) {
		for (let i = 0; i < this.children[key].length; i += 1) {
			ff.frame.push(this.children[key][i].getAsFrame(key, this));
		}
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
	this.classframes = {};
	this.dataframes = {};
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
		if (this.children[prop]) this.children[prop] = [];
		if (this.dataframes[prop]) this.dataframes[prop] = [];
		this.loadDataFrames(props);
	} else {
		this.dataframes = {};
		this.restrictions = {};
		this.children = {};
		this.loadDataFrames(this.originalFrames);
	}
};

/*
 * Clears out any specific information from a tree
 */
ObjectFrame.prototype.clear = function () {
	this.clearData();
	const newkids = {};
	for (const prop of Object.keys(this.children)) {
		// change all the object ids in the
		for (let i = 0; i < this.children[prop].length; i += 1) {
			if (typeof newkids[prop] === 'undefined') newkids[prop] = [];
			this.children[prop][i].subjid = FrameHelper.genBNID();
			this.children[prop][i].clear();
		}
	}
	return this;
};

/**
 * Empties out all of the object's dataframes
 */
ObjectFrame.prototype.clearData = function () {
	for (const prop of Object.keys(this.dataframes)) {
		for (let i = 0; i < this.dataframes[prop].length; i += 1) {
			this.dataframes[prop][i].clear();
		}
	}
	return this;
};

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
			if (cf.isObject() && this.children[classframes[j].property]) {
				for (let i = 0; i < this.children[classframes[j].property].length; i += 1) {
					this.children[classframes[j].property][i].loadClassFrames(classframes[j].frame);
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
		if (cframe && cframe.isData()) {
			const df = new DataFrame(frames[i], this);
			if (typeof this.dataframes[frames[i].property] === 'undefined') {
				this.dataframes[frames[i].property] = [];
			}
			this.dataframes[frames[i].property].push(df);
		} else if (cframe && cframe.isObject()) {
			const kid = new ObjectFrame(cframe.range, cframe.frame, frames[i].frame, this, frames[i]);
			if (typeof this.children[frames[i].property] === 'undefined') {
				this.children[frames[i].property] = [];
			}
			this.children[frames[i].property].push(kid);
		}
	}
	return this;
};

ObjectFrame.prototype.compare = function (pat) {
	// if(pat.range && pat.range !== this.range) return false;
	if (pat.domain && pat.domain !== this.cls) return false;
	return true;
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
	if (this.dataframes && this.dataframes[prop]) {
		return this.dataframes[prop][0];
	}
	if (this.children && this.children[prop]) {
		const basis = this.children[prop][0].parentframe;
		if (basis) {
			const cf = new ClassFrame(basis);
			return cf;
		}
	}
	return false;
};

/**
 * Missing properties are those that are present in the classframe,
 * but not instantiated in the current object frame
 * for this to work we need to load the frame with the associated classframe
 */
ObjectFrame.prototype.getMissingPropertyList = function () {
	const missing = [];
	for (const prop of Object.keys(this.classframes)) {
		if (!(this.dataframes[prop] || this.children[prop])) {
			const cframe = this.getPropertyClassFrame(prop);
			const newb = { label: cframe.getLabel(), value: prop };
			missing.push(newb);
		}
	}
	return missing;
};

/**
 * List of properties that are filled in the object
 */
ObjectFrame.prototype.getFilledPropertyList = function () {
	const filled = [];
	for (const prop of Object.keys(this.dataframes)) {
		const cframe = this.getPropertyClassFrame(prop);
		const newb = { label: cframe.getLabel(), value: prop };
		filled.push(newb);
	}
	for (const prop of Object.keys(this.children)) {
		const cframe = this.getPropertyClassFrame(prop);
		const newb = { label: cframe.getLabel(), value: prop };
		filled.push(newb);
	}
	return filled;
};

ObjectFrame.prototype.fillFromSchema = function (newid) {
	if (newid) this.subjid = newid;
	const dataframes = {};
	const children = {};
	for (const prop of Object.keys(this.classframes)) {
		const pf = this.getPropertyClassFrame(prop);
		if (pf && pf.isData()) {
			if (pf.hasRestriction() && pf.restriction.min) {
				dataframes[prop] = [];
				for (let i = 0; i < pf.restriction.min; i += 1) {
					dataframes[prop].push(pf.createEmpty(newid));
				}
			} else {
				dataframes[prop] = [pf.createEmpty(newid)];
			}
		} else if (pf && pf.isObject() && !pf.isClassChoice()) {
			if (pf.hasRestriction() && pf.restriction.min) {
				children[prop] = [];
				for (let i = 0; i < pf.restriction.min; i += 1) {
					const empty = pf.createEmpty(FrameHelper.genBNID());
					children[prop].push(empty);
				}
			} else {
				const empty = pf.createEmpty(FrameHelper.genBNID());
				children[prop] = [empty];
			}
		} else if (pf.isClassChoice()) {
			const clss = pf.getClassChoices();
			if (clss && clss.length) {
				const empty = pf.createEmptyChoice(clss[0], FrameHelper.genBNID());
				children[prop] = [empty];
			}
		}
	}
	this.dataframes = dataframes;
	this.children = children;
	this.originalFrames = [];
	for (const prop of Object.keys(this.dataframes)) {
		for (let i = 0; i < this.dataframes[prop].length; i += 1) {
			this.originalFrames.push(this.dataframes[prop][i].getAsFrame());
		}
	}
	for (const prop of Object.keys(this.children)) {
		for (let i = 0; i < this.children[prop].length; i += 1) {
			this.originalFrames.push(this.children[prop][i].getAsFrame(prop, this));
		}
	}
	return this;
};

ObjectFrame.prototype.clone = function (newid) {
	const dataframes = {};
	const children = {};
	const cloned = new ObjectFrame(this.cls, false, false, this.parent);
	cloned.classframes = this.classframes;
	cloned.subjid = newid;
	if (this.dataframes && typeof this.dataframes === 'object') {
		for (const prop of Object.keys(this.dataframes)) {
			const pf = this.getPropertyClassFrame(prop);
			if (pf.isData()) {
				dataframes[prop] = [];
				for (let i = 0; i < this.dataframes[prop].length; i += 1) {
					const clonedval = pf.clone(newid, this.dataframes[prop][i]);
					dataframes[prop].push(clonedval);
				}
			}
		}
	}
	if (this.children && typeof this.children === 'object') {
		for (const prop of Object.keys(this.children)) {
			// const pf = this.getPropertyClassFrame(prop);
			for (let i = 0; i < this.children[prop].length; i += 1) {
				const kid = this.children[prop][i];
				if (typeof children[prop] === 'undefined') children[prop] = [];
				const kidclone = kid.clone(FrameHelper.genBNID());
				children[prop].push(kidclone);
			}
		}
	}
	cloned.dataframes = dataframes;
	cloned.children = children;
	return cloned;
};


/**
 * Returns an array of the child object frames for a given property
 * or false if there is no such property
 */
ObjectFrame.prototype.getChildren = function (prop) {
	if (prop && typeof this.children[prop] !== 'undefined') {
		return this.children[prop];
	}
	return false;
};

/**
 * Returns a child frame with a particular id
 * If the second parameter is included, it will only look in that specific property
 * Otherwise searches all properties for the child
 */
ObjectFrame.prototype.getChild = function (childid, prop) {
	if (prop && typeof this.children[prop] !== 'undefined') {
		const kids = this.children[prop];
		for (let i = 0; i < kids.length; i += 1) {
			if (kids[i].subjid === childid) return kids[i];
		}
	}
	if (!prop) {
		for (const key of Object.keys(this.children)) {
			for (let i = 0; i < this.children[key].length; i += 1) {
				if (this.children[key][i].subjid === childid) return this.children[key][i];
			}
		}
	}
	return false;
};

ObjectFrame.prototype.getDataFrames = function (prop) {
	if (prop && typeof this.dataframes[prop] !== 'undefined') {
		return this.dataframes[prop];
	}
	return false;
};

ObjectFrame.prototype.removeProperty = function (prop) {
	if (typeof this.dataframes[prop] !== 'undefined') {
		delete (this.dataframes[prop]);
	} else if (typeof this.children[prop] !== 'undefined') {
		delete (this.children[prop]);
	}
};

ObjectFrame.prototype.addProperty = function (prop, cls) {
	const cframe = this.getPropertyClassFrame(prop);
	if (cframe.isData()) {
		const df = cframe.copy();
		df.set('');
		if (typeof this.dataframes[prop] === 'undefined') {
			this.dataframes[prop] = [];
		}
		this.dataframes[prop].push(df);
		return df;
	}
	if (cframe.isObject()) {
		if (typeof this.children[prop] === 'undefined') {
			this.children[prop] = [];
		}
		if (!cframe.isClassChoice()) {
			const empty = cframe.createEmpty(FrameHelper.genBNID());
			this.children[prop].push(empty);
			return empty;
		}
		if (cls) {
			const empty = cframe.createEmptyChoice(cls, FrameHelper.genBNID());
			this.children[prop].push(empty);
			return empty;
		}

		const clss = cframe.getClassChoices();
		if (clss && clss.length) {
			const empty = cframe.createEmptyChoice(clss[0], FrameHelper.genBNID());
			this.children[prop].push(empty);
			return empty;
		}
	}
	return false;
};

ObjectFrame.prototype.addPropertyValue = function (prop, value) {
	const cframe = this.getPropertyClassFrame(prop);
	const df = cframe.createEmpty();
	df.set(value);
	this.dataframes[prop].push(df);
	return df;
};

ObjectFrame.prototype.removePropertyValue = function (prop, value, index) {
	if (typeof this.dataframes[prop] !== 'undefined') {
		const nfvals = [];
		for (let i = 0; i < this.dataframes[prop].length; i += 1) {
			if (typeof index !== 'undefined' && index !== i) {
				this.dataframes[prop][i].index = nfvals.length;
				nfvals.push(this.dataframes[prop][i]);
			} else if (typeof index === 'undefined' && this.dataframes[prop][i].contents !== value) {
				this.dataframes[prop][i].index = nfvals.length;
				nfvals.push(this.dataframes[prop][i]);
			}
		}
		if (nfvals.length) {
			this.dataframes[prop] = nfvals;
		} else {
			delete (this.dataframes[prop]);
		}
	} else if (typeof this.children[prop] !== 'undefined') {
		const kids = this.children[prop];
		const nkids = [];
		for (let i = 0; i < kids.length; i += 1) {
			if (kids[i].subjid !== value) {
				nkids.push(kids[i]);
			}
			if (nkids.length) {
				this.children[prop] = nkids;
			} else {
				delete (this.children[prop]);
			}
		}
	} else {
		console.log(`No prop ${prop}`);
	}
};

ObjectFrame.prototype.error = function (msg) {
	console.error(msg);
};

ObjectFrame.prototype.isObject = function () { return true; };
ObjectFrame.prototype.isData = function () { return false; };


function DataFrame(frame, parent) {
	this.err = false;
	this.parent = parent;
	// the id of the object that owns this dataframe
	this.subjid = (parent ? parent.subjid : false);
	if (frame) {
		this.load(frame);
	}
}

DataFrame.prototype.isValidType = function (dt) {
	const vtypes = ['datatypeProperty', 'objectProperty', 'restriction '];
	if (vtypes.indexOf(dt) === -1) return false;
	return true;
};

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
	for (let i = 0; i < this.frame.length; i += 1) {
		for (let j = 0; j < this.frame[i].length; j += 1) {
			if (chosen === this.frame[i][j].domain) {
				nc = nc.concat(this.frame[i][j]);
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
	for (let i = 0; i < this.frame.length; i += 1) {
		const operand = this.frame[i];
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
