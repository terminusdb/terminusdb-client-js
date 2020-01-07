
const Config  = require('./viewConfig.js');
const WOQLChart  = require('./woqlChart.js');

function WOQLChartConfig(){
    Config.ViewConfig.call(this); 
    this.type = "chart";
}

WOQLChartConfig.prototype = Object.create(Config.ViewConfig.prototype);
WOQLChartConfig.prototype.constructor = Config.ViewConfig;


WOQLChartConfig.prototype.prettyPrint = function(){
    var str = "view = View.chart();\n";
    str += this.getBasicPrettyPrint();
	for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint() + "\n";
	}
	return str;
}

WOQLChartConfig.prototype.json = function(){
	let mj = {"chart" :this.getBasicJSON(), "rules": this.getRulesJSON()};
	return mj;
}

WOQLChartConfig.prototype.loadJSON = function(config, rules){
    this.loadBasicJSON(config);
    var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLChartRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
}

WOQLChartConfig.prototype.create = function(client){
	var wqt = new WOQLChartConfig(client, this);
	return wqt;
}

/*
{"XAxis":{dataKey:"date_i",type:'number'}
							,"chartObj":
							[{'label':'Confident','dataKey':'conf',"chartType":"Area",
							"style":{"stroke":"#82ca9d", "fillOpacity":1, "fill":"#82ca9d"}},
							 {'label':'Predictions','dataKey':'predictions',"chartType":"Line",
							 "style":{"strokeWidth":2, "stroke":"#ff8000"}},
							 {'label':'Picks','dataKey':'picks',"chartType":"Point","style": 
							 {"stroke": '#8884d8', "fill": '#8884d8'}},
							 {'label':'Stock','dataKey':'stock',"chartType":"Line","style":
							  {"stroke": '#0000ff', "fill": '#0000ff'}}]}

{"XAxis":{dataKey:"v:Date","label":{rotate:"-50"}},"chartObj":
							  	[{'dot':true, 'label':'Quantity','dataKey':'v:Quantity',"chartType":"Line",  
							  	  "style": {"stroke": '#FF9800', "fill": '#FF9800'}}]
							  }
*/


WOQLChartConfig.prototype.xAxis = function(...vars){
	let woqlRule = new WOQLChartRule().scope("XAxis");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.bar = function(...vars){
	let woqlRule=new WOQLChartRule().scope("Bar");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.line=function(...vars){
	let woqlRule=new WOQLChartRule().scope("Line");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.point=function(...vars){
	let woqlRule=new WOQLChartRule().scope("Point");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.area=function(...vars){
	let woqlRule=new WOQLChartRule().scope("Area");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

/**
 * 
 * @param {Chart} scope  
 */
function WOQLChartRule(){
	Config.WOQLViewRule.call(this); 
};

WOQLChartRule.prototype = Object.create(Config.WOQLViewRule.prototype);
WOQLChartRule.prototype.constructor = Config.WOQLViewRule;

WOQLChartRule.prototype.style=function(key,value){
	if(value){
		this.rule[key]=value;
		return this;
	}
	return this.rule[key];
}

WOQLChartRule.prototype.fill=function(color){
	if(color){
		this.rule.fill = color;
		return this;
	}
	return this.rule.fill;
}

WOQLChartRule.prototype.stroke=function(color){
	if(color){
		this.rule['stroke'] = color;
		return this;
	}
	return this.rule['stroke'];
}


WOQLChartRule.prototype.strokeWidth=function(size){
	if(typeof size != "undefined"){
		this.rule.strokeWidth = size;
		return this;
	}
	return this.rule.strokeWidth;
}


WOQLChartRule.prototype.dot=function(isVisible){
	if(typeof isVisible != "undefined"){
		this.rule.dot = isVisible;
		return this;
	}
	return this.rule.dot;
}

WOQLChartRule.prototype.labelRotate=function(angle){
	if(angle){
		this.rule.labelRotate = angle;
		return this
	}
	return this.rule.labelRotate;
}

WOQLChartRule.prototype.axisType=function(type){
	if(type){
		this.pattern.scope=type
		return this;
	}
	return this.pattern.scope
}
/*
* works only if type is number
* domainArr =[min,max];
*/
WOQLChartRule.prototype.axisDomain=function(domainArr){
	if(domainArr){
		this.rule.domain=domainArr
		return this;
	}
	return this.rule.domain
}


WOQLChartRule.prototype.barSize=function(barSize){
	if(barSize){
		this.rule.barSize=barSize
		return this;
	}
	return this.rule.barSize
}

module.exports = WOQLChartConfig;