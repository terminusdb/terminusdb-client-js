const WOQLTableConfig = require("./tableConfig");
const UTILS = require('../utils');
const WOQLRule = require('./woqlRule');
const WOQLResult = require('./woqlResult');

/**
 * @file WOQL Table 
 * @license Apache Version 2 
 */

function WOQLTable(client, config){
	this.client = client;
	this.config = (config ? config : new WOQLTableConfig());
	return this;
}

WOQLTable.prototype.options = function(config){
	this.config = config;
	return this;
}

WOQLTable.prototype.setResult = function(res){
	this.result = res;
	return this;
}

WOQLTable.prototype.count = function(){
	return this.result.count();
}

WOQLTable.prototype.first = function(){
	return this.result.first();
}

WOQLTable.prototype.prev = function(){
	return this.result.prev();
}

WOQLTable.prototype.next = function(){
	return this.result.next();
}

WOQLTable.prototype.canAdvancePage = function(){
	return (this.result.count() == this.result.query.getLimit()); 
}

WOQLTable.prototype.canChangePage = function(){
	return this.canAdvancePage() || this.canRetreatPage();
}

WOQLTable.prototype.canRetreatPage = function(){
	return (this.result.query.getPage() > 1);
}

WOQLTable.prototype.getPageSize = function(){
	return this.result.query.getLimit() ;	
}

WOQLTable.prototype.setPage = function(l){
	return this.result.query.setPage(l);	
}

WOQLTable.prototype.getPage = function(){
	return this.result.query.getPage();	
}

WOQLTable.prototype.setPageSize = function(l){
	return this.update(this.result.query.setPageSize(l));
}

WOQLTable.prototype.nextPage = function(){
	return this.update(this.result.query.nextPage());
}

WOQLTable.prototype.firstPage = function(){
	return this.update(this.result.query.firstPage());
}

WOQLTable.prototype.previousPage = function(){
	return this.update(this.result.query.previousPage());
}

WOQLTable.prototype.getColumnsToRender = function(){
	if(this.hasColumnOrder()){
        var cols = this.getColumnOrder();
	}
	else {
        var cols = this.result.getVariableList();
	}
	var self = this;
	return (cols ? cols.filter(col => !self.hidden(col)) : []);
}

WOQLTable.prototype.getColumnHeaderContents = function(colid){
	colid = UTILS.removeNamespaceFromVariable(colid);
	let hr = new WOQLRule().matchColumn(this.config.rules, colid, "header");
	if(hr && hr.length){
		let h = hr[hr.length-1].rule.header;
		if(typeof h == "string"){
			return h;// document.createTextNode(h);			
		}
		else if(typeof h == "function"){
			return h(colid);
		}
		else return h;
	}
	return UTILS.labelFromVariable(colid);
	//return document.createTextNode(clab);
}


WOQLTable.prototype.hidden = function(col){
	colid = UTILS.removeNamespaceFromVariable(col);
	let matched_rules = new WOQLRule().matchColumn(this.config.rules, colid, "hidden");
	if(matched_rules.length){
		return matched_rules[matched_rules.length-1].rule.hidden;
	}
	return false;
}

/**
 * Called when you want to change the query associated with the table. 
 */
WOQLTable.prototype.update = function(nquery){
	return nquery.execute(this.client).then((results) => {
		var nresult = new WOQLResult(results, nquery);
		this.setResult(nresult);
		if(this.notify) this.notify(nresult);
		return nresult;
	});	
}

WOQLTable.prototype.hasDefinedEvent = function(row, key, scope, action, rownum){
	if(scope == "row"){
		var matched_rules = new WOQLRule().matchRow(this.config.rules, row, rownum, action);	
	}
	else {
		var matched_rules = new WOQLRule().matchCell(this.config.rules, row, key, rownum, action);	
	}
	if(matched_rules && matched_rules.length) return true;
	return false;
}

WOQLTable.prototype.getDefinedEvent = function(row, key, scope, action, rownum){
	if(scope == "row"){
		var matched_rules = new WOQLRule().matchRow(this.config.rules, row, rownum, action);	
	}
	else {
		var matched_rules = new WOQLRule().matchCell(this.config.rules, row, key, rownum, action);	
	}
	if(matched_rules && matched_rules.length) {
		var l = (matched_rules.length - 1);
		return matched_rules[l].rule[action];
	}
}

WOQLTable.prototype.getRowClick = function(row){
	let re = this.getDefinedEvent(row, false, "row", "click");
	return re;
}

WOQLTable.prototype.uncompressed = function(row, col){
	let re = this.getDefinedEvent(row, col, "row", "uncompressed");
	return re;
}


WOQLTable.prototype.getCellClick = function(row, col){
	let cc = this.getDefinedEvent(row, col, "column", "click");
	return cc;
}

WOQLTable.prototype.getRowHover = function(row){
	return this.getDefinedEvent(row, false, "row", "hover");
}

WOQLTable.prototype.getCellHover = function(row, key){
	return this.getDefinedEvent(row, key, "column", "hover");
}

WOQLTable.prototype.getColumnOrder = function(){
	return this.config.column_order();
}


WOQLTable.prototype.bindings = function(){
	return this.config.bindings();
}


WOQLTable.prototype.getColumnDimensions = function(key){
    let cstyle = {}
	let w = new WOQLRule().matchColumn(this.config.rules, key, "width");
    if(w && w.length && w[w.length-1].rule.width) {
        cstyle.width = w[w.length-1].rule.width;
    }
	let max = new WOQLRule().matchColumn(this.config.rules, key, "maxWidth");
    if(max && max.length) cstyle.maxWidth = max[max.length-1].rule.maxWidth;
	let min = new WOQLRule().matchColumn(this.config.rules, key, "minWidth");
    if(min && min.length) cstyle.minWidth = min[min.length-1].rule.minWidth;
    return cstyle
}

WOQLTable.prototype.hasColumnOrder = WOQLTable.prototype.getColumnOrder;
WOQLTable.prototype.hasCellClick = WOQLTable.prototype.getCellClick;
WOQLTable.prototype.hasRowClick = WOQLTable.prototype.getRowClick;
WOQLTable.prototype.hasCellHover = WOQLTable.prototype.getCellHover;
WOQLTable.prototype.hasRowHover = WOQLTable.prototype.getRowHover;

WOQLTable.prototype.getRenderer = function(key, row, rownum){
	return this.getDefinedEvent(row, key, "column", "renderer", rownum);
	//let args =  this.getDefinedEvent(row, key, "column", "args", rownum);
	if(!renderer){
		let r = this.getRendererForDatatype(row[key]);
		renderer = r.name;
		if(!args) args = r.args;
	}
	if(renderer){
		return this.datatypes.createRenderer(renderer, args);		
	}
}

WOQLTable.prototype.isSortableColumn = function(key){
    if(this.getDefinedEvent(false, key, "column", "unsortable")) return false
    return true
}


WOQLTable.prototype.renderValue = function(renderer, val, key, row){
	if(val && val['@type']){
		renderer.type = val['@type'];
		var dv = new DataValue(val['@value'], val['@type'], key, row);
	}	
	else if(val && val['@language']){
		renderer.type = "xsd:string";
		var dv = new DataValue(val['@value'], renderer.type, key, row);
	}
	else if(val && typeof val == "string"){
		renderer.type = "id";
		var dv = new DataValue(val, "id", key, row);
	}
	if(dv) return renderer.renderValue(dv);
	return "";
}

function DataValue(val, type){
	this.datavalue = (val == "system:unknown" ? "" : val);
	this.datatype = type;
}

DataValue.prototype.value = function(nvalue){
	if(nvalue) {
		this.datavalue = nvalue; 
		return this;
	}
	return this.datavalue;
}


WOQLTable.prototype.getRendererForDatatype = function(val){
	if(val && val['@type']){
		return this.datatypes.getRenderer(val['@type'], val['@value']);
	}
	else if(val && val['@language']){
		return this.datatypes.getRenderer("xsd:string", val['@value']);
	}
	else if(val && typeof val == "string"){
		return this.datatypes.getRenderer("id", val);		
	}
	return false;
}

WOQLTable.prototype.getSpecificRender = function(key, row){
	let rend = this.getDefinedEvent(row, key, "column", "render");
	return rend;
}

module.exports = WOQLTable;