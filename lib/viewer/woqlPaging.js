const WOQLQuery = require('../query/woqlCore');
const UTILS = require('../utils');

/**
 * Functions to manipulate and check the paging related properties of a query
 */

WOQLQuery.prototype.getLimit = function(){
	return this.getPagingProperty("limit");
}

WOQLQuery.prototype.setLimit = function(l){
	return this.setPagingProperty("limit", l);
}

WOQLQuery.prototype.isPaged = function(q){
	q = (q ? q : this.query);
	for (const prop of Object.keys(q)) {
		if(prop == "limit") return true;
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			return this.isPaged(q[prop][q[prop].length-1]);
		}
	}
	return false;
}

WOQLQuery.prototype.getPage = function(){
	if(this.isPaged()){
		var psize = this.getLimit();
		if(this.hasStart()){
			var s = this.getStart();
			return (parseInt(s / psize) + 1);
		}
		else return 1;
	}
	else return false;
}

WOQLQuery.prototype.setPage = function(pagenum){
	var pstart = (this.getLimit() * (pagenum - 1));
	if(this.hasStart()){
		this.setStart(pstart);
	}
	else {
		this.addStart(pstart);
	}
	return this;
}

WOQLQuery.prototype.nextPage = function(){
	return this.setPage(this.getPage() + 1);
}

WOQLQuery.prototype.firstPage = function(){
	return this.setPage(1);
}

WOQLQuery.prototype.previousPage = function(){
	const npage = this.getPage() - 1;
	if(npage > 0) this.setPage(npage);
	return this;
}

WOQLQuery.prototype.setPageSize = function(size){
	this.setPagingProperty("limit", size);
	if(this.hasStart()){
		this.setStart(0);
	}
	else {
		this.addStart(0);
	}
	return this;
}

WOQLQuery.prototype.hasSelect = function(){
	return (this.getPagingProperty("select") ? true : false);
}

WOQLQuery.prototype.getSelectVariables = function(q){
	q = (q ? q : this.query);
	for (const prop of Object.keys(q)) {
		if(prop == "select") {
			var vars = q[prop].slice(0, q[prop].length - 1);
			return vars;
		}
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			var val = this.getSelectVariables(q[prop][q[prop].length-1]);
			if(typeof val != "undefined"){
				return val;
			}
		}
	}
}

WOQLQuery.prototype.hasStart = function(){
	return (typeof this.getPagingProperty("start") != "undefined");
}

WOQLQuery.prototype.getStart = function(){
	return this.getPagingProperty("start");
}

WOQLQuery.prototype.setStart = function(start){
	return this.setPagingProperty("start", start);
}

WOQLQuery.prototype.addStart = function(s){
	if(this.hasStart()) this.setStart(s);
	else {
		var nq = {'start': [s, this.query]};
		this.query = nq;
	}
	return this;
}


/**
 * Returns the value of one of the 'paging' related properties (limit, start,...)
 */
WOQLQuery.prototype.getPagingProperty = function(pageprop, q){
	q = (q ? q : this.query);
	for (const prop of Object.keys(q)) {
		if(prop == pageprop) return q[prop][0];
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			var val = this.getPagingProperty(pageprop, q[prop][q[prop].length-1]);
			if(typeof val != "undefined"){
				return val;
			}
		}
	}
}

/**
 * Sets the value of one of the paging_transitive_properties properties
 */
WOQLQuery.prototype.setPagingProperty = function(pageprop, val, q){
	q = (q ? q : this.query);
	for (const prop of Object.keys(q)) {
		if(prop == pageprop) {
			q[prop][0] = val;
		}
		else if(this.paging_transitive_properties.indexOf(prop) !== -1){
			this.setPagingProperty(pageprop, val, q[prop][q[prop].length-1]);
		}
	}
	return this;
}
