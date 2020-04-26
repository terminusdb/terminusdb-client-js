/**
 * @file Terminus ID Parser
 * @license Apache Version 2
 * Object representing a terminus ID / URL 
 * Helper methods for parsing and validating terminus IDS
 * and dealing with namespace prefixed URLs
 * @param {Object} context JSON-LD context to be used for prefixes
 */

function IDParser() {}

/**
 * parses a Terminus Server URL to ensure it is a valid url and appends a trailing slash if not present
 */
IDParser.prototype.parseServerURL = function (str) {
	if (!this.validURL(str)) {
		return false
	}
	if (str.lastIndexOf('/') !== str.length - 1) {
		str += '/'
	}
	return str
}

/**
 * Ensures that passed database ids are valid local identifiers
 */
IDParser.prototype.parseDBID = function (str) {
	if (this.validIDString(str, "db")) {
		return str
	}
	return false
};

/**
 * Ensures that passed account ids are valid local identifiers
 */
IDParser.prototype.parseAccount = function (str) {
	if (this.validIDString(str, "account")) {
		return str
	}
	return false
}

/**
 * Ensures that passed branch ids are valid local identifiers
 */
IDParser.prototype.parseBranch = function (bid) {
	if (this.validIDString(bid, "branch")) {
		return bid
	}
	return false
}

/**
 * just put in for future-proofing if we want to do client side checking of keys
 */
IDParser.prototype.parseJWT = function (jwt) {
	return jwt
}

IDParser.prototype.parseKey = function (key) {
	return key
};


// Valid URLs are those that start with http:// or https://
IDParser.prototype.validURL = function (str) {
	if (str && str.substring(0, 7) === 'http://' || str.substring(0, 8) === 'https://') return true;
	return false;
};

IDParser.prototype.validIDString = function (str) {
	if (typeof str !== 'string') return false;
	if (str.indexOf(':') !== -1 || str.indexOf(' ') !== -1 || str.indexOf('/') !== -1) return false;
	return true;
};


module.exports = IDParser;
