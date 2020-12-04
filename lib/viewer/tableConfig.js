const Config  = require('./viewConfig.js');
const WOQLTable  = require('./woqlTable.js');
const UTILS  = require('../utils.js');


function WOQLTableConfig(){
    Config.ViewConfig.call(this);
    this.type = "table";
}

WOQLTableConfig.prototype = Object.create(Config.ViewConfig.prototype);
WOQLTableConfig.prototype.constructor = Config.ViewConfig;

WOQLTableConfig.prototype.create = function(client){
	var wqt = new WOQLTable(client, this);
	return wqt;
}

WOQLTableConfig.prototype.json = function(){
	let jr = [];
	for(var i = 0; i<this.rules.length; i++){
		jr.push(this.rules[i].json());
	}
	var conf = {};
	if(typeof this.column_order() != "undefined"){
		conf['column_order'] = this.column_order();
	}
	if(typeof this.pagesize() != "undefined"){
		conf['pagesize'] = this.pagesize();
	}
	if(typeof this.renderer() != "undefined"){
		conf['renderer'] = this.renderer();
	}
	if(typeof this.pager() != "undefined"){
		conf['pager'] = this.pager();
    }
    if(typeof this.bindings() != "undefined"){
		conf['bindings'] = this.bindings();
	}
	if(typeof this.page() != "undefined"){
		conf['page'] = this.page();
	}
	if(typeof this.changesize() != "undefined"){
		conf['changesize'] = this.changesize();
	}
	let mj = {"table" :conf, "rules": jr};
	return mj;
}

WOQLTableConfig.prototype.loadJSON = function(config, rules){
	var jr = [];
	for(var i = 0; i<rules.length; i++){
		var nr = new WOQLTableRule();
		nr.json(rules[i]);
		jr.push(nr);
	}
	this.rules = jr;
	if(typeof config.column_order != "undefined"){
		this.column_order(...config.column_order);
	}
	if(typeof config.pagesize != "undefined"){
		this.pagesize(config.pagesize);
	}
	if(typeof config.renderer != "undefined"){
		this.renderer(config.renderer);
	}
	if(typeof config.bindings != "undefined"){
		this.bindings(config.bindings);
	}
	if(typeof config.pager != "undefined"){
		this.pager(config.pager);
	}
	if(typeof config.page != "undefined"){
		this.page(config.page);
	}
	if(typeof config.changesize != "undefined"){
		this.changesize(config.changesize);
    }
    return this;
}

WOQLTableConfig.prototype.prettyPrint = function(){
	var str = "view = View.table();\n";
	if(typeof this.column_order() != "undefined"){
		str += "view.column_order('" + this.column_order() + "')\n";
	}
	if(typeof this.pagesize() != "undefined"){
		str += "view.pagesize(" + this.pagesize() + ")\n";
	}
	if(typeof this.renderer() != "undefined"){
		str += "view.renderer('" + this.renderer() + "')\n";
	}
	if(typeof this.pager() != "undefined"){
		str += "view.pager(" + this.pager() + ")\n";
	}
	if(typeof this.page() != "undefined"){
		str += "view.page(" + this.page() + ")\n";
	}
    if(typeof this.changesize() != "undefined"){
        str += "view.changesize(" + this.changesize() + ")\n";
    }

    for(var i = 0; i<this.rules.length ; i++){
		let x = this.rules[i].prettyPrint();
		if(x) str += "view." + x + "\n";
	}
	return str;
}

WOQLTableConfig.prototype.renderer = function(rend){
	if(!rend) return this.trenderer;
	this.trenderer = rend;
	return this;
}

WOQLTableConfig.prototype.header = function(theader){
	if(typeof theader == "undefined") return this.theader;
	this.theader = theader;
	return this;
}

WOQLTableConfig.prototype.column_order = function(...val){
	if(typeof val == "undefined" || val.length == 0){
		return this.order;
	}
	this.order = UTILS.removeNamespacesFromVariables(val);
	return this;
}

WOQLTableConfig.prototype.pager = function(val){
	if(typeof val == "undefined"){
		return this.show_pager;
	}
	this.show_pager = val;
	return this;
}

WOQLTableConfig.prototype.changesize = function(val){
    if(typeof val == "undefined") return this.change_pagesize;
    this.change_pagesize = val;
    return this;
}


WOQLTableConfig.prototype.pagesize = function(val){
	if(typeof val == "undefined"){
		return this.show_pagesize;
	}
	this.show_pagesize = val;
	return this;
}

WOQLTableConfig.prototype.page = function(val){
	if(typeof val == "undefined"){
		return this.show_pagenumber;
	}
	this.show_pagenumber = val;
	return this;
}

WOQLTableConfig.prototype.column = function(...cols){
	let nr = new WOQLTableRule().scope("column");
	nr.setVariables(cols);
	this.rules.push(nr);
	return nr;
}

WOQLTableConfig.prototype.row = function(){
	let nr = new WOQLTableRule().scope("row");
	this.rules.push(nr);
	return nr;
}

/*
 * Table
 */


function WOQLTableRule(){
	Config.WOQLViewRule.call(this);
};

WOQLTableRule.prototype = Object.create(Config.WOQLViewRule.prototype);
WOQLTableRule.prototype.constructor = Config.WOQLViewRule;

WOQLTableRule.prototype.header = function(hdr){
	if(typeof hdr == "undefined"){
		return this.rule.header;
	}
	this.rule.header = hdr;
	return this;
}

WOQLTableRule.prototype.width = function(wid){
	if(typeof wid == "undefined"){
		return this.rule.width;
	}
	this.rule.width = wid;
	return this;
}

WOQLTableRule.prototype.maxWidth = function(wid){
	if(typeof wid == "undefined"){
		return this.rule.maxWidth;
	}
	this.rule.maxWidth = wid;
	return this;
}

WOQLTableRule.prototype.minWidth = function(wid){
	if(typeof wid == "undefined"){
		return this.rule.minWidth;
	}
	this.rule.minWidth = wid;
	return this;
}

WOQLTableRule.prototype.unsortable = function(unsortable){
	if(typeof unsortable == "undefined"){
		return this.rule.unsortable;
	}
	this.rule.unsortable = unsortable;
	return this;
}




WOQLTableRule.prototype.uncompressed = function(uncompressed){
	if(typeof uncompressed == "undefined"){
		return this.rule.uncompressed;
	}
	this.rule.uncompressed = uncompressed;
	return this;
}



WOQLTableRule.prototype.prettyPrint = function(type){
	var str = Config.WOQLViewRule.prototype.prettyPrint.apply(this);
    if(typeof this.header() != "undefined"){
	    str += ".header(" + this.header() + ")";
	}
    if(this.sortable()){
	    str += ".sortable(true)";
	}
    if(typeof this.width() != "undefined"){
	    str += ".width(" + this.width() + ")";
	}
    if(typeof this.maxWidth() != "undefined"){
	    str += ".maxWidth(" + this.maxWidth() + ")";
	}
    if(typeof this.minWidth() != "undefined"){
	    str += ".minWidth(" + this.minWidth() + ")";
	}
	return str;
}

module.exports = WOQLTableConfig;
