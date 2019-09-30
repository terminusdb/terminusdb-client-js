/**
 * Helper functions for dealing with frames and linked data documents
 */
const FrameHelper = {
	standard_urls: {
		rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
		rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
		xsd: 'http://www.w3.org/2001/XMLSchema#',
		owl: 'http://www.w3.org/2002/07/owl#',
		tcs: 'http://terminusdb.com/schema/tcs#',
		tbs: 'http://terminusdb.com/schema/tbs#',
		xdd: 'http://terminusdb.com/schema/xdd#',
		terminus: 'http://terminusdb.com/schema/terminus#',
		vio: 'http://terminusdb.com/schema/vio#',
		docs: 'http://terminusdb.com/schema/documentation#'
	}
};

FrameHelper.addURLPrefix = function (prefix, url) {
	this.standard_urls[prefix] = url;
};


FrameHelper.removeChildren = function (node) {
	if (node) {
		while (node.hasChildNodes()) {
			node.removeChild(node.childNodes[0]);
		}
	}
};

FrameHelper.empty = function (obj) {
	   // null and undefined are "empty"
	if (!obj) return true;
	// Assume if it has a length property with a non-zero value
	// that that property is correct.
	if (obj.length > 0) return false;
	if (obj.length === 0) return true;
	// Otherwise, does it have any properties of its own?
	// Note that this doesn't handle
	// toString and valueOf enumeration bugs in IE < 9
	// for (const key in obj) {
	if (typeof obj === 'object') {
		for (const key of Object.keys(obj)) {
			if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
		}
	}
	return true;
};

FrameHelper.genBNID = function () {
	const r = Math.random().toString(36).substring(7);
	const d = new Date();
	const bnid = `_:${r}${d.getTime()}`;
	return bnid;
};

FrameHelper.getShorthand = function (link) {
	if(typeof link == "object" && link.length) link = link[0];
	if (link && typeof link === 'string') {
		for (const pref of Object.keys(this.standard_urls)) {
			const full = this.standard_urls[pref];
			if (link.substring(0, full.length) === full) {
				const sh = `${pref}:${link.substring(full.length)}`;
				return sh;
			}
		}
	}
	return false;
};

FrameHelper.compareIDs = function (ida, idb) {
	if (ida === idb) return true;
	if (this.unshorten(ida) === idb) return true;
	if (this.unshorten(ida) === this.unshorten(idb)) return true;
	const sha = this.getShorthand(ida);
	const shb = this.getShorthand(idb);
	if (sha && ((sha === idb) || (sha === shb))) return true;
	if (shb && shb === ida) return true;
	return false;
};

FrameHelper.unshorten = function (url) {
	if (this.validURL(url)) return url;
	if (!url) return url;
	const bits = url.split(':');
	if (bits[1]) {
		if (this.standard_urls[bits[0]]) {
			return this.standard_urls[bits[0]] + bits[1];
		}
	}
	return url;
};

//Valid URLs are those that start with http:// or https:// 
FrameHelper.validURL = function (str) {
	if(str.substring(0, 7) == "http://" || str.substring(0, 8) == "https://") return true;
	return false;
};


FrameHelper.labelFromURL = function (url) {
	let nurl = this.urlFragment(url);
	nurl = (nurl || url);
	if(nurl.lastIndexOf("/") < nurl.length-1){
		nurl = nurl.substring(nurl.lastIndexOf("/") + 1); 
	}
	nurl = nurl.replace("_", " ");
	return nurl.charAt(0).toUpperCase() + nurl.slice(1);
};

FrameHelper.urlFragment = function (url) {
	url = (typeof url !== 'string') ? window.location.href : url;
	let bits = url.split('#');
	if (bits.length <= 1) {
		if(!this.validURL(url)){
			bits = url.split(':');
		}
	}
	if (bits.length >= 1) {
		const [, urlStr] = bits;

		if (urlStr) {
			const [baseUrl] = urlStr.split('?');
			url = baseUrl;
		}
	}
	return url;
};

FrameHelper.isStringType = function (stype) {
	if (stype === 'http://www.w3.org/2001/XMLSchema#string') return true;
	if (stype === 'xsd:string') return true;
	return false;
};

FrameHelper.lastURLBit = function (url) {
	url = (typeof url === 'undefined') ? window.location.href : url;
	const [urlFirst] = url.split('#');
	const [urlTmp] = urlFirst.split('?');
	url = urlTmp.substring(url.lastIndexOf('/') + 1);
	return url;
};


FrameHelper.getStdURL = function (pref, ext, url) {
	if (this.standard_urls[pref]) {
		if (url) {
			if (url === this.standard_urls[pref] + ext) return url;
		} else {
			return this.standard_urls[pref] + ext;
		}
	}
	return false;
};

FrameHelper.viewIncludesProperties = function (view) {
	if (view === 'full' || view === 'production' || view === 'terse') {
		return true;
	}
	return false;
};

FrameHelper.viewIncludesChildren = function (view, type) {
	return this.viewIncludesProperties(view, type);
};

FrameHelper.viewIncludesValue = function (view, type) {
	return this.viewIncludesProperties(view, type);
};

FrameHelper.numberWithCommas = function (value) {
	if (value >= 1000 || value <= -1000) {
	    const parts = value.toString().split('.');
	    if (value <= -1000) parts[0] = parts[0].substring(1);
	    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	    if (value <= -1000) value = `-${parts.join('.')}`;
	    else value = parts.join('.');
	}
	return value;
};

FrameHelper.datatypes = [
	'xdd:coordinate', 'xdd:coordinatePolyline',
	'xdd:coordinatePolygon', 'xdd:dateRange', 'xdd:gYearRange', 'xdd:integerRange',
	'xdd:decimalRange', 'xdd:cc', 'xdd:email', 'xdd:html', 'xdd:url', 'xsd:anySimpleType',
	'xsd:string', 'xsd:boolean', 'xsd:decimal', 'xsd:double', 'xsd:float', 'xsd:time', 'xsd:date',
	'xsd:dateTime', 'xsd:dateTimeStamp', 'xsd:gYear', 'xsd:gMonth', 'xsd:gDay', 'xsd:gYearMonth',
	'xsd:gMonthDay', 'xsd:duration', 'xsd:yearMonthDuration', 'xsd:dayTimeDuration',
	'xsd:byte', 'xsd:short', 'xsd:integer', 'xsd:long', 'xsd:unsignedByte',	'xsd:unsignedInt',
	'xsd:unsignedLong',	'xsd:nonNegativeInteger', 'xsd:positiveInteger', 'xsd:negativeInteger',
	'xsd:nonPositiveInteger', 'xsd:base64Binary', 'xsd:anyURI', 'xsd:language', 'xsd:normalizedString',
	'xsd:token', 'xsd:NMTOKEN',	'xsd:Name',	'xsd:NCName', 'xsd:NOTATION', 'xsd:QName', 'xsd:ID',
	'xsd:IDREF', 'xsd:ENTITY', 'rdf:XMLLiteral', 'rdf:PlainLiteral', 'rdfs:Literal', 'xdd:json'
];

FrameHelper.parseDate = function (ty, value) {
	let parsed;
	if (ty === 'xsd:date') {
		parsed = this.parseXsdDate(value);
	} else if (ty === 'xsd:time') {
		parsed = this.parseXsdTime(value);
	} else if (ty === 'xsd:dateTime') {
		parsed = this.parseXsdDateTime(value);
	} else if (ty === 'xsd:gYear') {
		parsed = { year: value };
	} else if (ty === 'xsd:gYearRange') {
		parsed = { year: value };
	} else if (ty === 'xsd:gMonth') {
		parsed = { month: value.substring(2) };
	} else if (ty === 'xsd:gDay') {
		parsed = { day: value };
	} else if (ty === 'xsd:gYearMonth') {
		const bits = value.split('-');
		while (bits.length < 2) bits.push('');
		parsed = { year: bits[0], month: bits[1] };
	} else if (ty === 'xsd:gMonthDay') {
		const bits = value.split('-');
		while (bits.length < 2) bits.push('');
		parsed = { month: bits[0], day: bits[1] };
	} else if (ty === 'xsd:dateTimeStamp') {
		parsed = this.parseXsdDateTime(value);
	}
	return parsed;
};

FrameHelper.parseXsdDate = function (val) {
	const tz = this.extractXsdTimezone(val);
	if (tz) {
		val = val.substring(0, val.length - tz.length);
	}
	let year;
	if (val.substring(0, 1) === '-') {
		year = val.substring(0, 5);
	} else {
		year = val.substring(0, 4);
	}
	let parsed;
	if (year && Math.abs(year) < 10000) {
		let month = val.substring(year.length + 1, year.length + 3);
		if (month) { month = parseInt(month)}
		else return false;
		let day = val.substring(year.length + 4);
		if (day) day = parseInt(day);
		else return false;
		parsed = {
			year,
			   month,
			   day,
			   timezone: tz
		};
	}
	return parsed;
};

FrameHelper.addXsdPadding = function (parsed) {
	const nparsed = {};
	if (typeof parsed.year !== 'undefined' && parsed.year !== false && parsed.year < 1000) {
		if (Math.abs(parsed.year) < 10) nparsed.year = (parsed.year < 0 ? `-000${Math.abs(parsed.year)}` : `000${parsed.year}`);
		else if (Math.abs(parsed.year) < 100) nparsed.year = (parsed.year < 0 ? `-00${Math.abs(parsed.year)}` : `00${parsed.year}`);
		else nparsed.year = (parsed.year < 0 ? `-0${Math.abs(parsed.year)}` : `0${parsed.year}`);
	} else if (parsed.year) {
		nparsed.year = parsed.year;
	}
	if (typeof parsed.month !== 'undefined' && parsed.month !== false && parsed.month < 10) {
		nparsed.month = `0${parsed.month}`;
	} else if (parsed.month) {
		nparsed.month = parsed.month;
	}
	if (typeof parsed.day !== 'undefined' && parsed.day !== false && parsed.day < 10) {
		nparsed.day = `0${parsed.day}`;
	} else if (parsed.day) {
		nparsed.day = parsed.day;
	}
	if (typeof parsed.hour !== 'undefined' && parsed.hour !== false && parsed.hour < 10) {
		nparsed.hour = `0${parsed.hour}`;
	} else if (parsed.hour) {
		nparsed.hour = parsed.hour;
	}
	if (typeof parsed.minute !== 'undefined' && parsed.minute !== false && parsed.minute < 10) {
		nparsed.minute = `0${parsed.minute}`;
	} else if (parsed.minute) {
		nparsed.minute = parsed.minute;
	}
	if (typeof parsed.second !== 'undefined' && parsed.second !== false && parsed.second < 10) {
		nparsed.second = `0${parsed.second}`;
	} else if (parsed.second) {
		nparsed.second = parsed.second;
	}
	return nparsed;
};


FrameHelper.xsdFromParsed = function (parsed, ty) {
	const xparsed = this.addXsdPadding(parsed);
	let ret;
	if (ty === 'xsd:gYear') {
		ret = (xparsed.year ? xparsed.year : false);
	}
	else if (ty === 'xsd:time') {
		return (xparsed.hour && xparsed.minute && xparsed.second) ? `${xparsed.hour}:${xparsed.minute}:${xparsed.second}` : false;
	} else if (ty === 'xsd:date') {
		return (xparsed.year && xparsed.month && xparsed.day) ? `${xparsed.year}-${xparsed.month}-${xparsed.day}` : false;
	} else if (ty === 'xsd:dateTime' || ty === 'xsd:dateTimeStamp') {
		ret = (xparsed.year && xparsed.month && xparsed.day) ? `${xparsed.year}-${xparsed.month}-${xparsed.day}T` : false;
		if (ret) ret += `${xparsed.hour ? xparsed.hour : '12'}:${xparsed.minute ? xparsed.minute : '00'}:${xparsed.second ? xparsed.second : '00'}`;
	} else if (ty === 'xsd:gMonth') {
		ret = (xparsed.month ? `--${xparsed.month}` : false);
	} else if (ty === 'xsd:gDay') {
		ret = (xparsed.day ? `---${xparsed.day}` : false);
	} else if (ty === 'xsd:gYearMonth') {
		ret = (xparsed.year && xparsed.month) ? `${xparsed.year}-${xparsed.month}` : false;
	} else if (ty === 'xsd:gMonthDay') {
		ret = (xparsed.day && xparsed.month) ? `--${xparsed.month}-${xparsed.day}` : false;
	}
	if (xparsed.timezone) {
		ret += xparsed.timezone;
	}
	return ret;
};


FrameHelper.parseXsdTime = function (val) {
	if (!val) return {};
	const tz = this.extractXsdTimezone(val);
	if (tz) {
		val = val.substring(0, val.length - tz.length);
	}
	const parsed = {
		hour: val.substring(0, 2),
		minute: val.substring(3, 5),
		second: val.substring(6),
		timezone: tz
	};
	return parsed;
};

FrameHelper.convertTimestampToXsd = function (val) {
	  const a = new Date(val * 1000);
	  const parsed = {
		year: a.getFullYear(),
		month: a.getMonth() + 1,
		day: a.getDate(),
		hour: a.getHours(),
		minute: a.getMinutes(),
		second: a.getSeconds()
	  };
	  return parsed;
};

FrameHelper.parseXsdDateTime = function (val) {
	if (!val) return {};
	if (typeof val === 'number') {
		return this.convertTimestampToXsd(val);
	}
	const tz = this.extractXsdTimezone(val);
	if (tz) {
		val = val.substring(0, val.length - tz.length);
	}
	const datetime = this.parseXsdDate(val);
	const ptime = this.parseXsdTime(val.substring(val.indexOf('T') + 1));

	for (const i of Object.keys(ptime)) {
		datetime[i] = ptime[i];
	}
	datetime.timezone = tz;
	return datetime;
};

FrameHelper.extractXsdTimezone = function (val) {
	if (val && val.charAt(val.length - 1) === 'Z') {
		return 'Z';
	}
	if (val && (val.charAt(val.length - 6) === '+' || val.charAt(val.length - 6) === '-')) {
		val.substring(val.length - 6);
	}
	return false;
};

FrameHelper.parseRangeValue = function (val, dividor) {
	dividor = (dividor || ',');
	let vals = [];
	if (typeof val === 'object' && val.length) {
		vals = val;
	} else if (val) {
		if (typeof val !== 'string') {
			val = `${val}`;
		}
		if (val.length && (val.charAt(0) === '[') && val.charAt(val.length - 1) === ']') {
			vals.push(val.substring(1, val.indexOf(dividor)));
			vals.push(val.substring(val.indexOf(dividor) + 1, val.length - 1));
		} else {
			vals.push(val);
		}
	}
	return vals;
};

FrameHelper.loadDynamicScript = function (scriptid, src, callback) {
	const existingScript = document.getElementById(scriptid);
	if (!existingScript) {
		const script = document.createElement('script');
		script.src = src; // URL for the third-party library being loaded.
		document.body.appendChild(script);
		script.onload = function () {
			script.id = scriptid; // do it here so it doesn't trigger the callback below on multiple calls
			if (callback) callback(scriptid);
		};
	}
	if (existingScript && callback) {
		callback(scriptid);
	}
};

FrameHelper.loadDynamicCSS = function (cssid, src, callback) {
	const existingScript = document.getElementById(cssid);
	if (!existingScript) {
		const link = document.createElement('link');
		link.href = src; // URL for the third-party library being loaded.
		link.id = cssid; // e.g., googleMaps or stripe
		link.rel = 'stylesheet';
		document.body.appendChild(link);
		link.onload = function () {
			if (callback) callback(cssid);
		};
	}
	if (existingScript && callback) callback(cssid);
};

module.exports = FrameHelper;
