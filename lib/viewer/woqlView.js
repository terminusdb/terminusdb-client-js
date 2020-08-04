const WOQLTableConfig = require('./tableConfig');
const WOQLChooserConfig = require('./chooserConfig');
const WOQLGraphConfig = require('./graphConfig');
const WOQLChartConfig = require('./chartConfig');
const WOQLStreamConfig = require('./streamConfig');
const FrameConfig = require('./frameConfig');
const WOQLRule = require('./woqlRule');
const FrameRule = require('./frameRule');

/**
 * @constructor 
 * We bundle the useful functions in a View object and just export that for ease of consumption
 */
const View = {};

View.table = function(){ return new WOQLTableConfig(); }
View.chart = function(){ return new WOQLChartConfig(); }
View.graph = function(){ return new WOQLGraphConfig(); }
View.chooser = function(){ return new WOQLChooserConfig(); }
View.stream = function(){ return new WOQLStreamConfig(); }
View.document = function(){ return new FrameConfig(); }
View.loadConfig = function(config){
	if(config.table){
		var view = new WOQLTableConfig();
		view.loadJSON(config.table, config.rules);
	}
	else if(config.chooser){
		var view = new WOQLChooserConfig();
		view.loadJSON(config.chooser, config.rules);
	}
	else if(config.graph){
		var view = new WOQLGraphConfig();
		view.loadJSON(config.graph, config.rules);
	}
	else if(config.chart){
		var view = new WOQLChartConfig();
		view.loadJSON(config.chart, config.rules);
	}
	else if(config.stream){
		var view = new WOQLStreamConfig();
		view.loadJSON(config.stream, config.rules);
	}
	else if(config.frame){
		var view = new FrameConfig();
		view.loadJSON(config.frame, config.rules);
	}
	return view;
}

/**
 * Shorthand functions for accessing the pattern matching capabilities
 */
View.rule = function(type){ 
	if(type && type == "frame") return new FrameRule(); 
	return new WOQLRule(); 
}

View.pattern = function(type){ 
	if(type && type == "woql") return new WOQLRule().pattern;
	else return new FrameRule().pattern;
}

/**
 * Called to match an entire row of results is matched by a set of rules
 * returns array of rules that matched
 */
View.matchRow = function(rules, row, rownum, action){
	return new WOQLRule().matchRow(rules, row, rownum, action);
}

/**
 * Called to test whether an entire column of results is matched by a set of rules
 * returns array of rules that matched
 */
View.matchColumn = function(rules, key, action){
	return new WOQLRule().matchColumn(rules, key, action);
}

/**
 * Called to test whether a specific cell is matched by a set of rules
 * returns array of rules that matched
 */
View.matchCell = function(rules, row, key, rownum, action){
	return new WOQLRule().matchCell(rules, row, key, rownum, action);
}

/**
 * Called to test whether a specific node is matched by a set of rules
 * returns array of rules that matched
 */
View.matchNode = function(rules, row, key, nid, action){
	return new WOQLRule().matchNode(rules, row, key, nid, action);
}

/**
 * Called to test whether a specific edge (source -> target) is matched by a set of rules
 * returns array of rules that matched
 */
View.matchEdge = function(rules, row, keya, keyb, action){
	return new WOQLRule().matchPair(rules, row, keya, keyb, action);
}

/**
 * Called to test whether a specific frame is matched by a set of rules
 */
View.matchFrame = function(rules, frame, onmatch){
	return new FrameRule().testRules(rules, frame, onmatch);
}

module.exports = View;
