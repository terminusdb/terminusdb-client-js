const WOQLChartConfig = require("./chartConfig");

function WOQLChart(client, config){
	this.client = client;
	this.config = (config ? config : new WOQLChartConfig());
	return this;
}

WOQLChart.prototype.options = function(config){
	this.config = config;
	return this;
}

WOQLChart.prototype.setResult = function(res){
	this.result = res;
	return this;
}