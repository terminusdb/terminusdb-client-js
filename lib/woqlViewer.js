const WOQLResult = require('./woqlResult');


function WOQLViewer(client, config){
	this.client = client;
	this.config = config;
	return this;
}

WOQLViewer.prototype.query = function(query){
	this.query = query;
	return this;
}

WOQLViewer.prototype.show = function(then){
	return this.query.execute(this.client).then((results) => {
		this.result = new WOQLResult(results, this.query);
		this.render(this.result, then);
	});	
	return this;
}

WOQLViewer.prototype.render = function(wres, then){
	let renderer = this.getRenderer(wres);
	if(wres && renderer){
		if(renderer.render){
			var rendered = renderer.render(wres, this.query);
		}
		else {
			var rendered = renderer(wres, this.query);
		}
		if(then){
			then(rendered, wres, then);
		}
	}
	return rendered || false;
}

WOQLViewer.prototype.setRenderer = function(renderer){
	this.renderer = renderer;
}

WOQLViewer.prototype.getRenderer = function(results){
	if(this.renderer) return this.renderer;
}

module.exports = WOQLViewer;