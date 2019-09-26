/**
 * Helper functions for dealing with frames and linked data documents
 */
let FrameHelper = {
	standard_urls: {
		"rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		"rdfs": "http://www.w3.org/2000/01/rdf-schema#",
		"xsd": "http://www.w3.org/2001/XMLSchema#",
		"owl": "http://www.w3.org/2002/07/owl#",
		"dcogbox": "https://datachemist.net/ontology/dcogbox#",
		"dcog": "https://datachemist.net/ontology/dcog#",
		"xdd": "https://datachemist.net/ontology/xdd#",
		"terminus": "https://datachemist.net/ontology/terminus#",
		"vio": "https://datachemist.net/ontology/vio#",
		"docu": "https://datachemist.net/ontology/documentation#"
	}
};

FrameHelper.addURLPrefix = function(prefix, url){
	this.standard_urls[prefix] = url;
}


FrameHelper.removeChildren = function(node){
	if(node) { while(node.hasChildNodes()){
		node.removeChild(node.childNodes[0]);
	}}
}

FrameHelper.empty = function(obj){
	   // null and undefined are "empty"
    if (obj == null) return true;
    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0)    return false;
    if (obj.length === 0)  return true;
    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
    }
    return true;
}

FrameHelper.genBNID = function(dom){
	let r = Math.random().toString(36).substring(7);
	var d = new Date();
	let bnid = "_:" + r + d.getTime();
	return bnid;
}

FrameHelper.getShorthand = function(link){
	if(link && typeof link == "string"){
		for(var pref in this.standard_urls){
			var full = this.standard_urls[pref];
			if(link.substring(0, full.length) == full){
				var sh = pref + ":" + link.substring(full.length);
				return sh;
			}
		}
	}
	return false;
}

FrameHelper.compareIDs = function(ida, idb){
	if(ida == idb) return true;
	if(this.unshorten(ida) == idb) return true;
	if(this.unshorten(ida) == this.unshorten(idb)) return true;
	var sha = this.getShorthand(ida);
	var shb = this.getShorthand(idb);
	if(sha && ((sha == idb) || (sha == shb))) return true;
	if(shb && shb == ida) return true;
	return false;
}

FrameHelper.unshorten = function(url){
	if(this.validURL(url)) return url;
	if(!url) return url;
	var bits = url.split(":");
	if(bits[1]){
		if(this.standard_urls[bits[0]]){
			return this.standard_urls[bits[0]] + bits[1];
		}
	}
	return url;
}

FrameHelper.validURL = function(str) {
	var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    'localhost|((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
	return !!pattern.test(str);
}

FrameHelper.labelFromURL = function(url){
	var nurl = this.urlFragment(url);
	nurl = (nurl ? nurl : url.substring(url.lastIndexOf("/")+1));
	return nurl.charAt(0).toUpperCase() + nurl.slice(1);
}

FrameHelper.urlFragment = function(url){
	url = (typeof url != "string") ? window.location.href : url;
	bits = url.split('#');
	if(bits.length <= 1){
		bits = url.split(":");
	}
	if(bits.length >= 1){
		url = bits[1];
		if(url) url = url.split("?")[0];
	}
	return url;
}

FrameHelper.isStringType = function(stype){
	if(stype == "http://www.w3.org/2001/XMLSchema#string") return true;
	if(stype == "xsd:string") return true;
	return false;
}

FrameHelper.lastURLBit = function(url){
	url = (typeof url == "undefined") ? window.location.href : url;
	url = url.split('#')[0];
	url = url.split("?")[0];
	url = url.substring(url.lastIndexOf("/")+1);
	return url;
}


FrameHelper.getStdURL = function(pref, ext, url){
	if(this.standard_urls[pref]) {
		if(url) {
			if(url == this.standard_urls[pref] + ext) return url;
		}
		else {
			return this.standard_urls[pref] + ext;
		}
	}
	return false;
}

FrameHelper.viewIncludesProperties = function(view, type){
	if(view == "full" || view == "production" || view == "terse"){
		return true;
	}
	return false;
}

FrameHelper.viewIncludesChildren = function(view, type){
	return this.viewIncludesProperties(view, type);
}

FrameHelper.viewIncludesValue = function(view, type){
	return this.viewIncludesProperties(view, type);
}

FrameHelper.numberWithCommas = function(value){
	if(value >= 1000 || value <= -1000){
	    var parts = value.toString().split(".");
	    if(value <= -1000) parts[0] = parts[0].substring(1);
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	    if(value <= -1000) value = "-" + parts.join(".");
	    else value = parts.join(".");
	}
	return value;
}

FrameHelper.datatypes = [
	"xdd:coordinate", "xdd:coordinatePolyline",
	"xdd:coordinatePolygon", "xdd:dateRange", "xdd:gYearRange", "xdd:integerRange",
	"xdd:decimalRange","xdd:cc", "xdd:email","xdd:html", "xdd:url", "xsd:anySimpleType",
	"xsd:string", "xsd:boolean", "xsd:decimal", "xsd:double", "xsd:float", "xsd:time", "xsd:date",
	"xsd:dateTime", "xsd:dateTimeStamp", "xsd:gYear", "xsd:gMonth", "xsd:gDay", "xsd:gYearMonth",
	"xsd:gMonthDay", "xsd:duration", "xsd:yearMonthDuration", "xsd:dayTimeDuration",
	"xsd:byte", "xsd:short", "xsd:integer", "xsd:long", "xsd:unsignedByte",	"xsd:unsignedInt",
	"xsd:unsignedLong",	"xsd:nonNegativeInteger", "xsd:positiveInteger", "xsd:negativeInteger",
	"xsd:nonPositiveInteger", "xsd:base64Binary", "xsd:anyURI", "xsd:language", "xsd:normalizedString",
	"xsd:token", "xsd:NMTOKEN",	"xsd:Name",	"xsd:NCName","xsd:NOTATION", "xsd:QName", "xsd:ID",
	"xsd:IDREF", "xsd:ENTITY", "rdf:XMLLiteral","rdf:PlainLiteral","rdfs:Literal", "xdd:json"
];

FrameHelper.parseDate = function(ty, value){
	if(ty == "xsd:date"){
		var parsed = this.parseXsdDate(value);
	}
	else if(ty == "xsd:dateTime"){
		var parsed = this.parseXsdDateTime(value);
	}
	else if(ty == "xsd:gYear"){
		var parsed = { year: value };
	}
	else if(ty == "xsd:gYearRange"){
		var parsed = { year: value };
	}
	else if(ty == "xsd:gMonth"){
		var parsed = { month: value };
	}
	else if(ty == "xsd:gDay"){
		var parsed = { day: value };
	}
	else if(ty == "xsd:gYearMonth"){
		var bits = value.split("-");
		while (bits.length < 2) bits.push("");
		var parsed = { year: bits[0], month: bits[1]};
	}
	else if(ty == "xsd:gMonthDay"){
		var bits = value.split("-");
		while (bits.length < 2) bits.push("");
		var parsed = { month: bits[0], day: bits[1]};
	}
	else if(ty == "xsd:dateTimeStamp"){
		var bits = value.split("-");
		while (bits.length < 2) bits.push("");
		var parsed = { month: bits[0], day: bits[1]};
	}
	return parsed;
}

FrameHelper.parseXsdDate = function(val){
	var tz = this.extractXsdTimezone(val);
	if(tz){
		val = val.substring(0, val.length - tz.length);
	}
	if(val.substring(0, 1) == '-'){
		var year = val.substring(0,5);
	}
	else {
		var year = val.substring(0,4);
	}
	if(year && Math.abs(year) < 10000){
		var month = val.substring(year.length+1, year.length+3);
		if(month) month = month.toNumber();
		else return false;
		var day = val.substring(year.length+4);
		if(day) day = day.toNumber();
		else return false;
		var parsed = {
			year: year,
			month: month,
			day: day,
			timezone: tz
		}
	}
	return parsed;
}

FrameHelper.addXsdPadding = function(parsed){
	var nparsed = {};
	if(typeof parsed.year != "undefined" && parsed.year !== false && parsed.year < 1000){
		if(Math.abs(parsed.year) < 10) nparsed.year = (parsed.year < 0 ? "-000" + Math.abs(parsed.year) : "000" + parsed.year);
		else if(Math.abs(parsed.year) < 100) nparsed.year = (parsed.year < 0 ? "-00" + Math.abs(parsed.year) : "00" + parsed.year);
		else nparsed.year = (parsed.year < 0 ? "-0" + Math.abs(parsed.year) : "0" + parsed.year);
	}
	else if(parsed.year){
		nparsed.year = parsed.year;
	}
	if(typeof parsed.month != "undefined" && parsed.month !== false && parsed.month < 10){
		nparsed.month = "0" + parsed.month;
	}
	else if(parsed.month){
		nparsed.month = parsed.month;
	}
	if(typeof parsed.day != "undefined" && parsed.day !== false && parsed.day < 10){
		nparsed.day = "0" + parsed.day
	}
	else if(parsed.day){
		nparsed.day = parsed.day;
	}
	if(typeof parsed.hour != "undefined" && parsed.hour !== false && parsed.hour < 10){
		nparsed.hour = "0" + parsed.hour;
	}
	else if(parsed.hour){
		nparsed.hour = parsed.hour;
	}
	if(typeof parsed.minute != "undefined" && parsed.minute !== false && parsed.minute < 10){
		nparsed.minute = "0" + parsed.minute;
	}
	else if(parsed.minute){
		nparsed.minute = parsed.minute;
	}
	if(typeof parsed.second != "undefined" && parsed.second !== false && parsed.second < 10){
		nparsed.second= "0" + parsed.second;
	}
	else if(parsed.second){
		nparsed.second = parsed.second;
	}
	return nparsed;
}


FrameHelper.xsdFromParsed = function(parsed, ty){
	var xparsed = this.addXsdPadding(parsed);
	if(ty == "xsd:gYear"){
		var ret = (xparsed.year ? xparsed.year : false);
	}
	else if(ty == "xsd:date"){
		return (xparsed.year && xparsed.month && xparsed.day) ? xparsed.year + "-" + xparsed.month + "-" + xparsed.day : false;
	}
	else if(ty == "xsd:dateTime" || ty == "xsd:dateTimeStamp"){
		var ret = (xparsed.year && xparsed.month && xparsed.day) ? xparsed.year + "-" + xparsed.month + "-" + xparsed.day + "T" : false;
		if(ret) ret += (xparsed.hour ? xparsed.hour : "12") + ":" + (xparsed.minute ? xparsed.minute : "00") + ":" + (xparsed.second ? xparsed.second : "00");
	}
	else if(ty == "xsd:gMonth"){
		var ret = (xparsed.month ? "--" + xparsed.month : false);
	}
	else if(ty == "xsd:gDay"){
		var ret = (xparsed.day ? "---" + xparsed.day : false) ;
	}
	else if(ty == "xsd:gYearMonth"){
		var ret = (xparsed.year && xparsed.month) ? xparsed.year + "-" + xparsed.month : false;
	}
	else if(ty == "xsd:gMonthDay"){
		var ret = (xparsed.day && xparsed.month) ? "--" + xparsed.month + "-" + xparsed.day : false;
	}
	if(xparsed.timezone){
		ret += xparsed.timezone;
	}
	return ret;
}


FrameHelper.parseXsdTime = function(val){
	if(!val)return {};
	var tz = this.extractXsdTimezone(val);
	if(tz){
		val = val.substring(0, val.length - tz.length);
	}
	var parsed = {
		hour: val.substring(0,2),
		minute: val.substring(3,5),
		second: val.substring(6),
		timezone: tz
	}
	return parsed;
}

FrameHelper.convertTimestampToXsd = function(val){
	  var a = new Date(val * 1000);
	  var parsed = {
			year: a.getFullYear(),
			month: a.getMonth() + 1,
			day: a.getDate(),
			hour: a.getHours(),
			minute: a.getMinutes(),
			second: a.getSeconds()
	  }
	  return parsed;
}

FrameHelper.parseXsdDateTime = function(val){
	if(!val)return {};
	if(typeof val == "number"){
		return this.convertTimestampToXsd(val);
	}
	var tz = this.extractXsdTimezone(val);
	if(tz){
		val = val.substring(0, val.length - tz.length);
	}
	var datetime = this.parseXsdDate(val);
	var ptime = this.paseXsdTime(val.substring(val.indexOf("T")));
	for(var i in ptime){
		datetime[i] = ptime[i];
	}
	datetime.timezone = tz;
	return datetime;
}

FrameHelper.extractXsdTimezone = function(val){
	if(val && val.charAt(val.length-1) == "Z"){
		return "Z";
	}
	if(val && val.charAt(val.length-6) == "+" || val.charAt(val.length-6) == "-" ){
		val.substring(val.length-6);
	}
	return false;

}

FrameHelper.parseRangeValue = function(val, dividor){
	dividor = (dividor ? dividor : ",");
	var vals = [];
	if(typeof val == "object" && val.length){
		vals = val;
	}
	else if(val){
		if(typeof val != "string"){
			val = "" + val;
		}
		if(val.length && (val.charAt(0) == "[") && val.charAt(val.length -1) == "]"){
			vals.push(val.substring(1, val.indexOf(dividor)));
			vals.push(val.substring(val.indexOf(dividor) + 1, val.length -1));
		}
		else {
			vals.push(val);
		}
	}
	return vals;
}

FrameHelper.loadDynamicScript = function(scriptid, src, callback) {
	const existingScript = document.getElementById(scriptid);
	if (!existingScript) {
		const script = document.createElement('script');
		script.src = src; // URL for the third-party library being loaded.
		document.body.appendChild(script);
		script.onload = function(){
			script.id = scriptid; //do it here so it doesn't trigger the callback below on multiple calls
			if (callback) callback(scriptid);
		};
	}
	if (existingScript && callback) {
		callback(scriptid);
	}
};

FrameHelper.loadDynamicCSS = function(cssid, src, callback) {
	const existingScript = document.getElementById(cssid);
	if (!existingScript) {
		const link = document.createElement('link');
		link.href = src; // URL for the third-party library being loaded.
		link.id = cssid; // e.g., googleMaps or stripe
		link.rel = "stylesheet";
		document.body.appendChild(link);
		link.onload = function(){
			if (callback) callback(cssid);
		};
	}
	if (existingScript && callback) callback(cssid);
};

module.exports=FrameHelper
