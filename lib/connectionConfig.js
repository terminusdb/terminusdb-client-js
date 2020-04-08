const IDParser = require('./terminusIDParser');

/**
 * @file Terminus DB connection configuration
 * @license Apache Version 2
 * @description Object representing the state of a connection to a terminus db - these are:
 * 1. server url (set on connect)
 * 2. current account id
 * 2. dbid, account, api key, jwt
 * along with some configuration information (key, connected mode, client_side_access_control)
 * provides methods for getting and setting connection parameters
 */
function ConnectionConfig(params) {
	const newParams = params || {};
	this.server = false
	this.jwt_token = false; //jwt token for authenticating to remote servers for push / fetch / clone
	this.basic_auth = false; // basic auth key for authenticating to local server
	//these operate as cursors - where within the connected server context, we currently are
	this.accountid = false
	this.dbid = false
	this.branchid = false

	this.connection_error = false

	if (newParams.server) this.setServer(newParams.server);
	if (newParams.account) this.setAccount(newParams.account);
	if (newParams.db) this.setDB(newParams.db);
	if (newParams.jwt) this.setJWT(newParams.jwt);
	if (newParams.key) this.setKey(newParams.key, newParams.user);
	if (newParams.branch) this.setBranch(newParams.branch);
}

/**
 * Simple gets to retrieve current connection status
 */
ConnectionConfig.prototype.serverURL = function () {
	return this.server;
};

ConnectionConfig.prototype.db = function () {
	return this.dbid;
};

ConnectionConfig.prototype.branch = function () {
	return this.branchid;
};

ConnectionConfig.prototype.account = function () {
	return this.accountid;
};

ConnectionConfig.prototype.key = function () {
	return this.basic_auth;
};

ConnectionConfig.prototype.jwt = function () {
	return this.jwt_token;
};

/** 
 * Clear cursor for connection
 */
ConnectionConfig.prototype.clearCursor = function () {
	this.accountid = false;
	this.branchid = false;
	this.dbid = false;
}

ConnectionConfig.prototype.setError = function (str) {
	this.connection_error = str
}


/**
 * Setting 3 connection oriented settings at once
 * @param {string} surl url of server
 * @param {string} key api key
 * @param {string} jwt jwt token
 */
ConnectionConfig.prototype.setServerConnection = function (surl, key, jwt) {
	if(this.setServer(surl)){
		if(key){
			if(!this.setKey(key)) return false
		}
		if(jwt){
			if(!this.setJWT(jwt)) return false
		}
		return true
	}
	return false
}

/**
 * Setting 3 cursor related state variables at once
 */
ConnectionConfig.prototype.setCursor = function (account, db, ref) {
	if(account && !this.setAccount(account)) return false
	if(db && !this.setDB(db)) return false
	if(ref && !this.setBranch(ref)) return false
	return true
}

/**
 * Server URL will always end in a / character - automatically appended if missing
 * Should only be called on connect
 */
ConnectionConfig.prototype.setServer = function (inputStr) {
	const parser = new IDParser();
	let surl = parser.parseServerURL(inputStr)
    if (surl) {
		this.clearCursor();
		this.server = surl
		return this.server;
	}
	this.setError(`Invalid Server URL: ${inputStr}`)
};

/**
 * @param {String} inputStr - local identifier of account
 */
ConnectionConfig.prototype.setAccount = function (inputStr) {
	const parser = new IDParser();
	let aid = parser.parseDBID(inputStr)
	if (aid) {
		this.clearCursor()
		this.accountid = aid
		return this.accountid;
	}
	this.setError(`Invalid Account ID: ${inputStr}`)
};

/**
 * @param {String} inputStr - local identifier of db
 */
ConnectionConfig.prototype.setDB = function (inputStr) {
	const parser = new IDParser();
	let dbid = parser.parseDBID(inputStr)
	if (dbid) {
		this.dbid = dbid
		this.branchid = false;
		return this.dbid;
	}
	this.setError(`Invalid Database ID: ${inputStr}`)
};

/**
 * @param {String} inputStr - id of branch
 */
ConnectionConfig.prototype.setBranch = function (inputStr) {
	const parser = new IDParser();
	let bid = parser.parseDBID(inputStr)
	if (bid) {
		this.branchid = bid
		return this.branchid;
	}
	this.setError(`Invalid Branch ID: ${inputStr}`)
}

/**
 * @param {String} inputStr - api key
 */
ConnectionConfig.prototype.setKey = function (inputStr, uid) {
	uid = uid || "admin"
	const parser = new IDParser();
	let key = parser.parseKey(inputStr)
	if (key) {
		this.basic_auth = `${uid}:${key}`
		return this.basic_auth;
	}
	this.setError(`Invalid API Key: ${inputStr}`)
}

/**
 * @param {String} inputStr - api key
 */
ConnectionConfig.prototype.setJWT = function (inputStr) {
	const parser = new IDParser();
	let jwt = parser.parseJWT(inputStr)
	if (jwt) {
		this.jwt_token = jwt
		return this.jwt_token;
	}
	this.setError(`Invalid JWT: ${inputStr}`)
}

/**
 * Simple gets to retrieve current connection status
 */
ConnectionConfig.prototype.serverURL = function () {
	return this.server;
};

/**
 * API endpoint url generation
 * 
 * for create / delete db
 */
ConnectionConfig.prototype.dbURL = function () {
	return this.dbBase("db")
};

/**
 * Generate URL for create / delete graph api endpoint
 */
ConnectionConfig.prototype.graphURL = function (type, gid) {
	return this.branchBase("graph") + `/${type}/${gid}`
};

/**
 * Generate URL for get / set schema api endpoint
 */
ConnectionConfig.prototype.schemaURL = function (sgid) {
	let s = this.branchBase("schema")
	if(sgid) s += `/${sgid}`
	return s
};

/**
 * Generate URL for woql query api endpoint
 */
ConnectionConfig.prototype.queryURL = function () {
	if(this.db() == "terminus") return this.dbBase("woql")
	return this.branchBase("woql")
};

/**
 * Generate URL for class frame api endpoint
 */
ConnectionConfig.prototype.classFrameURL = function () {
	return this.branchBase("frame")
};

/**
 * Generate URL for clone db endpoint
 */
ConnectionConfig.prototype.cloneURL = function (new_repo_id) {
	let crl = `${this.serverURL()}clone/${this.account()}`
	if(new_repo_id) crl += `/${new_repo_id}`
	return crl
};

/**
 * Generate URL for fetch endpoint
 */
ConnectionConfig.prototype.fetchURL = function (repoid) {
	return this.dbBase("fetch") + `/${repoid}`
}

/**
 * Generate URL for rebase endpoint
 */
ConnectionConfig.prototype.rebaseURL = function (source_repo, source_branch) {
	let purl = this.branchBase("rebase")
	if(source_repo){
		purl += `/${source_repo}`
		if(source_branch) purl += `/${source_branch}`
	}
	return purl
}

/**
 * Generate URL for push endpoint
 */
ConnectionConfig.prototype.pushURL = function (target_repo, target_branch) {
	let purl = this.branchBase("push")
	if(target_repo){
		purl += `/${target_repo}`
		if(target_branch) purl += `/${target_branch}`
	}
	return purl
}

/**
 * Generate URL for branch endpoint
 */
ConnectionConfig.prototype.branchURL = function () {
	return this.branchBase("branch")
}

/**
 * Generate base db url consisting of server/action/account/dbid
 */
ConnectionConfig.prototype.dbBase = function (action) {
	return  `${this.serverURL()}${action}/${this.dbURLFragment()}`
};

/**
 * Generate base branch url consisting of server/action/account/dbid/branchid
 */
ConnectionConfig.prototype.branchBase = function (action) {
	let b = this.dbBase(action)
	if(this.branch()) b += `/${this.branch()}`
	else b += "/master"
	return b
};

/**
 * Generate url portion consisting of account/dbid (unless dbid = terminus in which case there is no account)
 */
ConnectionConfig.prototype.dbURLFragment = function () {
	if(this.db() == "terminus") return this.db()
	return this.account() + "/" + this.db()
};

module.exports = ConnectionConfig;
