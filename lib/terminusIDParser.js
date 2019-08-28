
/*
 * Helper class for parsing and decomposing Terminus URLs /
 * dealing with prefixed URLs
 */
function TerminusIDParser(inputStr, context) {
	this.contents = inputStr.trim();
	this.context = context;
	this.server_url = false;
	this.db = false;
	this.doc = false;
}

TerminusIDParser.prototype.server = function () {
	return this.server_url;
};

TerminusIDParser.prototype.dbid = function () {
	return this.db;
};

TerminusIDParser.prototype.docid = function () {
	return this.doc;
};

TerminusIDParser.prototype.parseServerURL = function (str) {
	str = str || this.contents;
	if (this.validURL(str)) {
		this.server_url = str;
	} else if (this.context && this.validPrefixedURL(str, context)) {
		this.server_url = this.expandPrefixed(str, context);
	}
	if (
		this.server_url
    && this.server_url.lastIndexOf('/') !== this.server_url.length - 1
	) {
		this.server_url += '/';
	}
	return this.server_url;
};

TerminusIDParser.prototype.parseDBID = function (str) {
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

TerminusIDParser.prototype.parseDocumentURL = function (str) {
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

TerminusIDParser.prototype.parseSchemaURL = function (str) {
	str = str || this.contents;
	if (this.context && this.validPrefixedURL(str, context)) {
		str = this.expandPrefixed(str, context);
	}
	if (this.validURL(str)) {
		str = this.stripOptionalPath(str, 'schema');
	}
	return this.parseDBID(str);
};

TerminusIDParser.prototype.parseQueryURL = function (str) {
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

TerminusIDParser.prototype.stripOptionalPath = function (str, bit) {
	if (str.indexOf(`/${bit}`) !== -1) str = str.substring(0, str.indexOf(`/${bit}`));
	return str;
};

TerminusIDParser.prototype.parseClassFrameURL = function (str) {
	str = str || this.contents;
	if (this.context && this.validPrefixedURL(str, context)) {
		str = this.expandPrefixed(str, context);
	}
	if (this.validURL(str)) {
		str = this.stripOptionalPath(str, 'schema');
	}
	return this.parseDBID(str);
};

TerminusIDParser.prototype.validURL = function (str) {
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

TerminusIDParser.prototype.validPrefixedURL = function (str, context) {
	const parts = str.split(':');
	if (parts.length !== 2) return false;
	if (parts[0].length < 1 || parts[1].length < 1) return false;
	if (context && context[parts[0]] && this.validIDString(parts[1])) return true;
	return false;
};

TerminusIDParser.prototype.validIDString = function (str) {
	if (str.indexOf(' ') !== -1 || str.indexOf('/') !== -1) return false;
	return true;
};

TerminusIDParser.prototype.expandPrefixed = function (str, context) {
	const parts = str.split(':');
	return context[parts[0]] + parts[1];
};

module.exports = TerminusIDParser;
