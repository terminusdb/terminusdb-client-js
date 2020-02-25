
const IDParser = require('./terminusIDParser');

/**
 * @file Terminus DB connection configuration
 * @license Apache Version 2
 * @description Object representing the state of a connection to a terminus db - server url, current dbid, document id
 * along with some configuration information (key, connected mode, client_side_access_control)
 * provides methods for getting and setting connection parameters
 */
function ConnectionConfig(params) {
	const newParams = params || {};
	this.server = false;
	this.dbid = false;
	this.branchid = false;
	this.docid = false;
	if (newParams.server) this.setServer(newParams.server);
	if (newParams.db) this.setDB(newParams.db);
	if (newParams.branchid) this.setBranch(newParams.branchid);
	if (newParams.doc) this.setDocument(newParams.doc);
	/*
     * client configuration options - connected_mode = connected
     * tells the client to first connect to the server before invoking other services
     */

	// include a terminus:user_key API key in the calls
	this.include_key = newParams.include_key || true;
}

/**
 * Server URL will always end in a / character - automatically appended if missing
 */
ConnectionConfig.prototype.setServer = function (inputStr, context) {
	const parser = new IDParser(context);
    if (parser.parseServerURL(inputStr)) {
		this.server = parser.server();
		this.branchid = false;
		this.dbid = false;
		this.docid = false;
		return true;
	}
	return false;
};


ConnectionConfig.prototype.serverURL = function () {
	return this.server;
};

/**
 * Database URL does not have a trailing slash "/" character and it will be chopped if it is passed in at the end of the input string
 * @param {String} inputStr - URL of DB or local id of DB
 */
ConnectionConfig.prototype.setDB = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseDBID(inputStr)) {
		this.dbid = parser.dbid();
		this.branchid = false;
		this.docid = false;
		return true;
	}
	return false;
};

/**
 * Database URL does not have a trailing slash "/" character and it will be chopped if it is passed in at the end of the input string
 * @param {String} inputStr - URL of DB or local id of DB
 */
ConnectionConfig.prototype.setBranch = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseDBID(inputStr)) {
		this.dbid = parser.dbid();
		this.branchid = false;
		this.docid = false;
		return true;
	}
	return false;
}

ConnectionConfig.prototype.db = function () {
	return this.dbid;
};

ConnectionConfig.prototype.branch = function () {
	return this.branchid;
};


/**
 * sets the connection to point at the schema api URL
 */
ConnectionConfig.prototype.setSchemaURL = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseSchemaURL(inputStr)) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

ConnectionConfig.prototype.schemaURL = function () {
	return `${this.server()}/schema/${this.db()}/${this.branch()}`;
};

/**
 * @param {String} inputStr - the URL of a Terminus DB base install or schema endpoint
 * @param {Object} [context] optional json-ld context
 * sets the connection to point at the query api URL
 */
ConnectionConfig.prototype.setQueryURL = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseQueryURL(inputStr)) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

ConnectionConfig.prototype.queryURL = function () {
	return `${this.server()}/query/${this.db()}/${this.branch()}`;
};



/**
 * @param {String} inputStr - the URL of a Terminus DB base install or frame endpoint
 * @param {Object} [context] optional json-ld context
 * sets the connection to point at the class frame api URL
 */
ConnectionConfig.prototype.setClassFrameURL = function (inputStr, context) {
	const parser = new IDParser(context);
	if (parser.parseClassFrameURL(inputStr)) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

ConnectionConfig.prototype.frameURL = function () {
	return `${this.server()}/frame/${this.db()}/${this.branch()}`;
};

/**
 * @param {String} inputStr - the URL of a Terminus DB base install or document endpoint
 * @param {Object} [context] optional json-ld context
 * sets the connection to point at the document api URL
 */
ConnectionConfig.prototype.setDocument = function (inputStr, context) {
	this.docid = inputStr;
	return true;
};

ConnectionConfig.prototype.docURL = function () {
	return `${this.server()}/document/${this.db()}/${this.branch()}/` && encodeURIComponent(this.docid);
};

/**
 * will a key be used in this connnection?
 */
ConnectionConfig.prototype.includeKey = function () {
	return this.include_key === true;
};

module.exports = ConnectionConfig;
