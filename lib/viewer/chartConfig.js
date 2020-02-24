
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
    for(var i = 0; i<this.rules.length ; i++){
		str += "view." + this.rules[i].prettyPrint() + "\n";
	}
	if(typeof this.margin() != "undefined"){
		str += "view.margin(" + this.margin() + ")\n";
	}
	if(typeof this.title() != "undefined"){
		str += "view.title('" + this.title() + "')\n";
	}
	if(typeof this.description() != "undefined"){
		str += "view.description('" + this.description() + "')\n";
	}
	if(typeof this.layout() != "undefined"){
		str += "view.layout('" + this.layout() + "')\n";
	}
	
    str += this.getBasicPrettyPrint();
	return str;
}

WOQLChartConfig.prototype.json = function(){
	/*
	*general properties 
	*/
	var conf = {};
	if(typeof this.margin() != "undefined"){
		conf['margin'] = this.margin();
	}
	if(typeof this.title() != "undefined"){
		conf['title'] = this.title();
	}
	if(typeof this.description() != "undefined"){
		conf['description'] = this.description();
	}
	if(typeof this.layout() != "undefined"){
		conf['layout'] = this.layout();
	}

	let mj = {"chart" :conf, "rules": this.getRulesJSON()};
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
	if(typeof config.margin != "undefined"){
		this.margin(config.margin);
	}
	if(typeof config.title != "undefined"){
		this.title(config.title);
	}
	if(typeof config.description != "undefined"){
		this.description(config.description);
	}
	if(typeof config.layout != "undefined"){
		this.layout(config.layout);
	}
}

WOQLChartConfig.prototype.title = function(title){
	if(typeof title == "undefined"){
		return this._title;
	}
	this._title = title;
	return this;
}

WOQLChartConfig.prototype.description=function(description){
	if(description){
		this._description=description;
		return this
	}
	return this._description;
}

//layout "vertical" | "horizontal"
WOQLChartConfig.prototype.layout=function(layout){
	if(layout){
		this._layout=layout;
		return this
	}
	return this._layout;
}


//default is { top: 10, right: 30, left: 0, bottom: 80 }
WOQLChartConfig.prototype.margin=function(marginObj){
	if(marginObj){
		this._margin=marginObj;
		return this
	}

	return this._margin;
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

WOQLChartConfig.prototype.legend = function(...vars){
	let woqlRule = new WOQLChartRule().scope("Legend");
	woqlRule.setVariables(vars);
	this.rules.push(woqlRule);
	return woqlRule;
}

WOQLChartConfig.prototype.yAxis = function(...vars){
	let woqlRule = new WOQLChartRule().scope("YAxis");
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

//fillOpacity
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

WOQLChartRule.prototype.label = function(label){
	if(label){
		this.rule.label = label;
		return this;
	}
	return this.rule.label;
}

/*
*line is the default value
* 'line' | 'square' | 'rect'| 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye' | 'none'
*/

WOQLChartRule.prototype.legendType = function(legendType){
	if(legendType){
		this.rule.legendType = legendType;
		return this;
	}
	return this.rule.legendType;
}


WOQLChartRule.prototype.fillOpacity = function(fillOpacity){
	if(fillOpacity || fillOpacity===0){
		this.rule.fillOpacity = fillOpacity;
		return this;
	}
	return this.rule.fillOpacity;
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
	if(angle!==undefined){
		this.rule.labelRotate = angle;
		return this
	}
	return this.rule.labelRotate;
}

//Specify the padding of x-axis. DEFAULT: { left: 0, right: 0 }
WOQLChartRule.prototype.padding=function(paddingObj){
	if(paddingObj){
		this.rule.padding=paddingObj;
		return this
	}

	return this.rule.padding;
}

/*
* 
*/

WOQLChartRule.prototype.labelDateInput=function(labelDateInput){
	if(labelDateInput){
		this.rule.labelDateInput=labelDateInput
		return this;
	}
	return this.rule.labelDateInput
}

/*
* output date example 'YYYY-MM-DD' : 2020:03:11 or ''YYYY [text] YYYY',  2020 mytext 2020' 
*/

WOQLChartRule.prototype.labelDateOutput=function(labelDateOutput){
	if(labelDateOutput){
		this.rule.labelDateOutput=labelDateOutput
		return this;
	}
	return this.rule.labelDateOutput
}

WOQLChartRule.prototype.stackId=function(stackId){
	if(stackId){
		this.rule.stackId=stackId
		return this;
	}
	return this.rule.stackId
}



/*
* The type of xAxis 'number' | 'category' default is 'category' 
* The type of yAxis 'number' | 'category' default is 'number' 
* The type of line chart 'basis'|'basisClosed'|'basisOpen'|'linear'|'linearClosed'|'natural'|'monotoneX'|'monotoneY'|'monotone' | 'step' | 'stepBefore' | 'stepAfter' | 
*/



WOQLChartRule.prototype.type=function(type){
	if(type){
		this.rule.type=type
		return this;
	}
	return this.rule.type
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

/*
* 
* @param {string} name of the variable for the custom color
*/

WOQLChartRule.prototype.colorEntry=function(propValue){
	if(propValue){
		this.rule.colorEntry=propValue
		return this;
	}
	return this.rule.colorEntry
}

/*
* 
* @param {object} an object of possible value and color {"value1":"#ff0000"...}
*/

WOQLChartRule.prototype.customColors=function(colorsObj){
	if(colorsObj){
		this.rule.customColors=colorsObj
		return this;
	}
	return this.rule.customColors
}

/*
* @param {array} payload array of the object for descrive the legend [{value:"legend label",color:"#ff0000",type:"rect"}]
*/

WOQLChartRule.prototype.payload=function(payloadArr){
	if(payloadArr){
		this.rule.payload=payloadArr
		return this;
	}
	return this.rule.payload
}


WOQLChartRule.prototype.barSize=function(barSize){
	if(barSize){
		this.rule.barSize=barSize
		return this;
	}
	return this.rule.barSize
}

module.exports = WOQLChartConfig;