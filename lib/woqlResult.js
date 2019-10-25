function WOQLResult(results, query, config){
	this.bindings = results.bindings;
	this.query = query;
	this.cursor = 0;
	if(!(config && config.no_compress)){
		var context = (config && config.context ? config.context : false);
		this.compress(context);
	}
}

WOQLResult.prototype.compress = function(context){
	context = (context ? context : this.query.getContext());
	for(var i = 0; i<this.bindings.length; i++){
		for (const prop of Object.keys(this.bindings[i])) {
			const nprop = TerminusClient.FrameHelper.shorten(prop, context);
			const nval = ((typeof this.bindings[i][prop] == "string") 
				? TerminusClient.FrameHelper.shorten(this.bindings[i][prop], context) 
				: this.bindings[i][prop]	
			);
			delete(this.bindings[i][prop]);
			this.bindings[i][nprop] = nval;
		}	
	}
}

WOQLResult.prototype.first = function(){
	return this.bindings[0];
}

WOQLResult.prototype.last = function(){
	return this.bindings[this.bindings.length-1];
}

WOQLResult.prototype.next = function(){
	this.cursor++;
	return this.bindings[this.cursor];	
}

WOQLResult.prototype.prev = function(){
	if(this.cursor > 0){
		this.cursor--;
		return this.bindings[this.cursor];	
	}
}

WOQLResult.prototype.count = function(){
	return this.bindings.length;
}

WOQLResult.prototype.hasBindings = function(result){
	return (this.bindings && this.bindings.count());
}

WOQLResult.prototype.getBindings = function(){
	return this.bindings;
}

module.exports = WOQLResult;