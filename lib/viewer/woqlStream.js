const WOQLStreamConfig = require("./streamConfig");

function WOQLStream(client, config){
	this.client = client;
	this.config = (config ? config : new WOQLStreamConfig());
	return this;
}

WOQLStream.prototype.options = function(config){
	this.config = config;
	return this;
}

WOQLStream.prototype.setResult = function(wqrs){
	this.result = wqrs;
}

module.exports = WOQLStream;