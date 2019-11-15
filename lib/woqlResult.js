const FrameHelper = require('./frameHelper');

function WOQLResult(results, query, config) {
	this.bindings = results.bindings;
	this.query = query;
	this.cursor = 0;
	if (!(config && config.no_compress)) {
		const context = (config && config.context ? config.context : false);
		this.compress(context);
	}
}

WOQLResult.prototype.compress = function (context) {
	context = (context || this.query.getContext());
	for (let i = 0; i < this.bindings.length; i++) {
		for (const prop of Object.keys(this.bindings[i])) {
			const nprop = FrameHelper.shorten(prop, context);
			const nval = ((typeof this.bindings[i][prop] === 'string')
				? FrameHelper.shorten(this.bindings[i][prop], context)
				: this.bindings[i][prop]
			);
			delete (this.bindings[i][prop]);
			this.bindings[i][nprop] = nval;
		}
	}
};

WOQLResult.prototype.first = function () {
	this.cursor = 0;
	return this.bindings[0];
};

WOQLResult.prototype.last = function () {
	this.curor = this.bindings.length - 1;
	return this.bindings[this.bindings.length - 1];
};

WOQLResult.prototype.next = function () {
	const res = this.bindings[this.cursor];
	this.cursor++;
	return res;
};

WOQLResult.prototype.prev = function () {
	if (this.cursor > 0) {
		this.cursor--;
		return this.bindings[this.cursor];
	}
};

WOQLResult.prototype.compareValues = function(a, b, asc_or_desc){
	if(!a || !b) return 0;
	if(typeof a['@value'] != "undefined" && typeof b['@value'] != "undefined"){
		a = a['@value'];
		b = b['@value'];
	}
	if (a > b) {
		return (asc_or_desc && asc_or_desc == 'asc' ? 1 : -1);
	}
	if (b > a) {
		return (asc_or_desc && asc_or_desc == 'asc' ? -1 : 1);
	}
};


WOQLResult.prototype.sort = function (key, asc_or_desc) {
	this.bindings.sort((a, b) => this.compareValues(a[key], b[key], asc_or_desc));
};

WOQLResult.prototype.getVariableList = function () {
	if (this.bindings && this.bindings[0]) {
		return Object.keys(this.bindings[0]);
	}
};

WOQLResult.prototype.count = function () {
	return this.bindings.length;
};

WOQLResult.prototype.hasBindings = function (result) {
	return (this.bindings && this.bindings.count());
};

WOQLResult.prototype.getBindings = function () {
	return this.bindings;
};

module.exports = WOQLResult;
