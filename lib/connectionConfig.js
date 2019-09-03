
const IDParser = require('./terminusIDParser');

function ConnectionConfig(params) {
	const newParams = params || {};
	this.server = newParams.server || false;
	this.dbid = newParams.db || false;
	this.docid = newParams.document || false;

	/*
  * client configuration options - connected_mode = connected
  * tells the client to first connect to the server before invoking other services
  */

	this.connected_mode = newParams.connected_mode || 'connected';
	// include a terminus:user_key API key in the calls
	this.include_key = newParams.include_key || true;
	// client side checking of access control (in addition to server-side access control)
	this.client_checks_capabilities = newParams.client_checks_capabilities || true;
}

ConnectionConfig.prototype.serverURL = function () {
	return this.server;
};


ConnectionConfig.prototype.connectionMode = function () {
	return this.connected_mode === 'connected';
};

ConnectionConfig.prototype.includeKey = function () {
	return this.include_key === true;
};

ConnectionConfig.prototype.schemaURL = function () {
	return `${this.dbURL()}/schema`;
};
ConnectionConfig.prototype.queryURL = function () {
	return `${this.dbURL()}/woql`;
};
ConnectionConfig.prototype.frameURL = function () {
	return `${this.dbURL()}/frame`;
};
ConnectionConfig.prototype.docURL = function () {
	return `${this.dbURL()}/document/${this.docid ? this.docid : ''}`;
};

ConnectionConfig.prototype.dbURL = function (call) {
	// url swizzling to talk to platform using server/dbid/platform/ pattern..
	if (this.platformEndpoint() && (!call || call !== 'create')) {
		return (
			`${this.server.substring(0, this.server.lastIndexOf('/platform/'))
			}/${
				this.dbid
			}/platform`
		);
	} if (this.platformEndpoint() && call === 'platform') {
		return (
			`${this.server.substring(0, this.server.lastIndexOf('/platform/'))
			}/${
				this.dbid}`
		);
	}
	return this.server + this.dbid;
};

ConnectionConfig.prototype.platformEndpoint = function () {
	if (this.server.lastIndexOf('/platform/') === this.server.length - 10) {
		return true;
	}
	return false;
};

/**
 * Utility functions for setting and parsing urls and determining
 * the current server, database and document
 */
ConnectionConfig.prototype.setServer = function (inputStr, context) {
	const parser = new IDParser(inputStr, context);
	if (parser.parseServerURL()) {
		this.server = parser.server();
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setDB = function (inputStr, context) {
	const parser = new IDParser(inputStr, context);
	if (parser.parseDBID()) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setSchemaURL = function (inputStr, context) {
	const parser = new IDParser(inputStr, context);
	if (parser.parseSchemaURL()) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setDocument = function (inputStr, context) {
	const parser = new IDParser(inputStr, context);
	if (parser.parseDocumentURL()) {
		if (parser.server()) this.server = parser.server();
		if (parser.dbid()) this.dbid = parser.dbid();
		if (parser.docid()) this.docid = parser.docid();
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setQueryURL = function (inputStr, context) {
	const parser = new IDParser(inputStr, context);
	if (parser.parseQueryURL()) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

ConnectionConfig.prototype.setClassFrameURL = function (inputStr, context) {
	const parser = new IDParser(inputStr, context);
	if (parser.parseClassFrameURL()) {
		if (parser.server()) this.server = parser.server();
		this.dbid = parser.dbid();
		this.docid = false;
		return true;
	}
	return false;
};

module.exports = ConnectionConfig;
