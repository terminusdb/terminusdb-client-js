
/*
 * Helper class for parsing and decomposing Terminus URLs /
 * dealing with prefixed URLs
 */
function IDParser(inputStr, context) {
	console.log(inputStr);
	this.contents = inputStr ? inputStr.trim() : '';
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

IDParser.prototype.parseServerURL = function (str) {
	str = str || this.contents;
	if (this.validURL(str)) {
		this.server_url = str;
	} else if (this.context && this.validPrefixedURL(str, context)) {
		this.server_url = this.expandPrefixed(str, context);
	}
	if (this.server_url
    	&& this.server_url.lastIndexOf('/') !== this.server_url.length - 1
	) {
		this.server_url += '/';
	}
	console.log('IDParser',this.server_url);
	return this.server_url;
};

IDParser.prototype.parseDBID = function (str) {
	str = str || this.contents;
	if (this.context && this.validPrefixedURL(str, context)) {
		str = this.expandPrefixed(str, context);
	}
	if (this.validURL(str)) {
		if (str.lastIndexOf('/') === str.length - 1) str = str.substring(0, str.length - 1); // trim trailing slash
		const surl = str.substring(0, str.lastIndexOf('/'));
		const dbid = str.substring(str.lastIndexOf('/') + 1);
		if (this.parseServerURL(surl)) {
			this.db = dbid;
		}
	} else if (this.validIDString(str)) {
		this.db = str;
	}
	return this.db;
};

IDParser.prototype.parseDocumentURL = function (str) {
	str = str || this.contents;
	if (this.context && this.validPrefixedURL(str, context)) {
		str = this.expandPrefixed(str, context);
	}
	if (this.validURL(str)) {
		if (str.lastIndexOf('/document/') !== -1) {
			this.doc = str.substring(str.lastIndexOf('/document/') + 11);
			str = str.substring(0, str.lastIndexOf('/document/'));
		}
		return this.parseDBID(str);
	} if (this.validIDString(str)) {
		this.doc = str;
		return true;
	}
	return false;
};

IDParser.prototype.parseSchemaURL = function (str) {
	str = str || this.contents;
	if (this.context && this.validPrefixedURL(str, context)) {
		str = this.expandPrefixed(str, context);
	}
	if (this.validURL(str)) {
		str = this.stripOptionalPath(str, 'schema');
	}
	return this.parseDBID(str);
};

IDParser.prototype.parseQueryURL = function (str) {
	str = str || this.contents;
	if (this.context && this.validPrefixedURL(str, context)) {
		str = this.expandPrefixed(str, context);
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
	str = str || this.contents;
	if (this.context && this.validPrefixedURL(str, context)) {
		str = this.expandPrefixed(str, context);
	}
	if (this.validURL(str)) {
		str = this.stripOptionalPath(str, 'schema');
	}
	return this.parseDBID(str);
};

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
	); // fragment locator
	return pattern.test(str);
};

IDParser.prototype.validPrefixedURL = function (str, context) {
	const parts = str.split(':');
	if (parts.length !== 2) return false;
	if (parts[0].length < 1 || parts[1].length < 1) return false;
	if (context && context[parts[0]] && this.validIDString(parts[1])) return true;
	return false;
};

IDParser.prototype.validIDString = function (str) {
	if (str.indexOf(' ') !== -1 || str.indexOf('/') !== -1) return false;
	return true;
};

IDParser.prototype.expandPrefixed = function (str, context) {
	const parts = str.split(':');
	return context[parts[0]] + parts[1];
};

module.exports = IDParser;


