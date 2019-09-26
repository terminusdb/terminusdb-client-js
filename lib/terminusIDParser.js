/*
11.75s$ npm install
6.39s$ npm test
*/
/*
 * Helper class for parsing and decomposing Terminus URLs /
 * dealing with prefixed URLs
 */
//const URL = require('url').URL;

/*
"@context": {
    "owl":"http://www.w3.org/2002/07/owl#",
    "rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
    "xsd":"http://www.w3.org/2001/XMLSchema#"
  } */


function IDParser(context) {
	// console.log(inputStr);
	// this.contents = inputStr ? inputStr.trim() : '';
	this.context = context;
	this.server_url = false;
	this.db = false;
	this.doc = false;
}

IDParser.prototype.server = function () {
	return this.server_url;
};

IDParser.prototype.dbid = function () {
	return this.db;
};

IDParser.prototype.docid = function () {
	return this.doc;
};

IDParser.prototype.setContext = function (context) {
	this.context = context;
};

IDParser.prototype.parseServerURL = function (str) {
	this.server_url = false;

	if (this.validURL(str)) {
		this.server_url = str;
	} else if (this.context && this.validPrefixedURL(str, this.context)) {
		this.server_url = this.expandPrefixed(str, this.context);
	}

	if (this.server_url && this.server_url.lastIndexOf('/') !== this.server_url.length - 1
	) {
		this.server_url += '/';
	}
	return this.server_url;
};

IDParser.prototype.parseDBID = function (str) {
	this.db = false;

	if (this.context && this.validPrefixedURL(str, this.context)) {
		str = this.expandPrefixed(str, this.context);
	}
	if (this.validURL(str)) {
		if (str.lastIndexOf('/') === str.length - 1) {
			// trim trailing slash
			str = str.substring(0, str.length - 1);
		}
		const index = str.lastIndexOf('/');

		const serverURL = str.substring(0, index);
		// only dbNamer
		console.log('INSIDE VALID URL', str);
		str = str.substring(index + 1);

		if (this.parseServerURL(serverURL) === false) return false;
	}
	console.log('STR IN parseDBID', str);
	if (this.validIDString(str)) {
		this.db = str;
	}
	return this.db;
};

IDParser.prototype.parseDocumentURL = function (str) {
	this.doc = false;
	if (this.context && this.validPrefixedURL(str, this.context)) {
		str = this.expandPrefixed(str, this.context);
	}

	if (this.validURL(str)) {
		let dbURL = str;
		if (str.lastIndexOf('/document/') !== -1) {
			// get dbURL
			dbURL = str.substring(0, str.lastIndexOf('/document/'));
			str = str.substring(str.lastIndexOf('/document/') + 10);
		}
		if (this.parseDBID(dbURL) === false) return false;
	}
	if(str.substring(0, 4) == "doc:") str = str.substring(4);
	// check if the document's name hasn't space or '/'
	if (this.validIDString(str)) {
		this.doc = str;
	}
	return this.doc;
};

IDParser.prototype.parseSchemaURL = function (str) {
	if (this.context && this.validPrefixedURL(str, this.context)) {
		str = this.expandPrefixed(str, this.context);
	}
	if (this.validURL(str)) {
		str = this.stripOptionalPath(str, 'schema');
	}
	return this.parseDBID(str);
};

IDParser.prototype.parseQueryURL = function (str) {
	if (this.context && this.validPrefixedURL(str, this.context)) {
		str = this.expandPrefixed(str, this.context);
	}
	if (this.validURL(str)) {
		str = this.stripOptionalPath(str, 'woql');
		str = this.stripOptionalPath(str, 'query');
	}
	return this.parseDBID(str);
};

IDParser.prototype.stripOptionalPath = function (str, bit) {
	if (str.indexOf(`/${bit}`) !== -1) str = str.substring(0, str.indexOf(`/${bit}`));
	return str;
};

IDParser.prototype.parseClassFrameURL = function (str) {
	if (this.context && this.validPrefixedURL(str, this.context)) {
		str = this.expandPrefixed(str, this.context);
	}
	if (this.validURL(str)) {
		str = this.stripOptionalPath(str, 'frame');
	}
	return this.parseDBID(str);
};

//
IDParser.prototype.validURL = function (str) {
	console.log(str);
	const pattern = new RegExp(
		'^(https?:\\/\\/)?' // protocol
    + 'localhost|((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' // domain name
    + '((\\d{1,3}\\.){3}\\d{1,3}))' // OR ip (v4) address
    + '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' // port and path
    + '(\\?[;&a-z\\d%_.~+=-]*)?' // query string
    + '(\\#[-a-z\\d_]*)?$',
		'i'
	) // fragment locator
	return pattern.test(str);
}

IDParser.prototype.validPrefixedURL = function (str, context) {
	if (typeof str !== 'string' || typeof context !== 'object') return false;
	const parts = str.split(':');
	if (parts.length !== 2) return false;
	if (parts[0].length < 1 || parts[1].length < 1) return false;
	if (context && context[parts[0]] && this.validIDString(parts[1])) return true;
	return false;
};

IDParser.prototype.validIDString = function (str) { // str.indexOf(':') !== -1 ||
	if (typeof str !== 'string') return false;
	if (str.indexOf(':') !== -1 || str.indexOf(' ') !== -1 || str.indexOf('/') !== -1) return false;
	return true;
};

IDParser.prototype.expandPrefixed = function (str, context) {
	const parts = str.split(':');
	return context[parts[0]] + parts[1];
};

module.exports = IDParser;
