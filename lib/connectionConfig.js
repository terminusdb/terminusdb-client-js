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
	this.server = false
	this.jwt_token = false //jwt token for authenticating to remote servers for push / fetch / clone
	this.jwt_user = false //user id associated with the jwt token
	this.basic_auth = false; // basic auth string for authenticating to local server
	//these operate as cursors - where within the connected server context, we currently are
	this.accountid = false
	this.dbid = false
	
	this.default_branch_id = "master"
	this.default_repo_id = "local"
	//default repository and branch ids
	this.branchid = this.default_branch_id 
	this.repoid = this.default_repo_id  
	//set if pointing at a commit within a branch
	this.refid = false 

	this.connection_error = false

	this.update(params)
}

/**
 * Creates a new connection config object and copies all the state information from this one into it
 */
ConnectionConfig.prototype.copy = function () {
	let other = new ConnectionConfig()
	other.server = this.server
	other.jwt_token = this.jwt_token 
	other.jwt_user = this.jwt_user
	other.basic_auth = this.basic_auth
	other.accountid = this.accountid 
	other.dbid = this.dbid 
	other.branchid = this.branchid
	other.repoid = this.repoid 
	other.refid = this.refid
	return other
}

/**
 * updates connection config with new values set in json params object
 */
ConnectionConfig.prototype.update = function (params) {
	const newParams = params || {};
	if (typeof newParams.server != "undefined") this.setServer(newParams.server);
	if (typeof newParams.account != "undefined") this.setAccount(newParams.account);
	if (typeof newParams.db != "undefined") this.setDB(newParams.db);
	if (typeof newParams.jwt != "undefined") this.setJWT(newParams.jwt, newParams.jwt_user);
	if (typeof newParams.key != "undefined") this.setKey(newParams.key, newParams.user);
	if (typeof newParams.branch != "undefined") this.setBranch(newParams.branch);
	if (typeof newParams.ref != "undefined") this.setREf(newParams.ref);
	if (typeof newParams.repo != "undefined") this.setRepo(newParams.repo);
};


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

ConnectionConfig.prototype.ref = function () {
	return this.refid;
};


ConnectionConfig.prototype.account = function () {
	return this.accountid;
};

ConnectionConfig.prototype.repo = function () {
	return this.repoid;
};


ConnectionConfig.prototype.key = function () {
	return this.basic_auth;
};

ConnectionConfig.prototype.jwt = function () {
	return this.jwt_token;
};

ConnectionConfig.prototype.user = function (ignore_jwt) {
	if(!ignore_jwt && this.jwt_user) return this.jwt_user
	if(this.basic_auth){
		return this.basic_auth.split(":")[0]
	}
};

/** 
 * Clear cursor for connection
 */
ConnectionConfig.prototype.clearCursor = function () {
	this.branchid = this.default_branch_id 
	this.repoid = this.default_repo_id  
	this.accountid = false;
	this.dbid = false;
	this.refid = false;
}

/**
 * Setting all 5 cursor related state variables at once
 */
ConnectionConfig.prototype.setCursor = function (account, db, repo, branch, ref) {
	if(account && !this.setAccount(account)) return false
	if(db && !this.setDB(db)) return false
	if(repo && !this.setRepo(repo)) return false
	if(branch && !this.setBranch(branch)) return false
	if(ref && !this.setRef(ref)) return false
	return true
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
 * Server URL will always end in a / character - automatically appended if missing
 * Should only be called on connect
 */
ConnectionConfig.prototype.setServer = function (inputStr) {
	const parser = new IDParser();
	let surl = parser.parseServerURL(inputStr)
    if (surl) {
		this.server = surl
		return this.server;
	}
	this.setError(`Invalid Server URL: ${inputStr}`)
};

/**
 * @param {String} inputStr - local identifier of account
 */
ConnectionConfig.prototype.setAccount = function (inputStr) {
	if(!inputStr) {
		this.accountid = false;
		return false
	}
	const parser = new IDParser();
	let aid = parser.parseDBID(inputStr)
	if (aid) {
		this.accountid = aid
		return this.accountid;
	}
	this.setError(`Invalid Account ID: ${inputStr}`)
};

/**
 * @param {String} inputStr - local identifier of db
 */
ConnectionConfig.prototype.setDB = function (inputStr) {
	if(!inputStr) {
		this.dbid = false;
		return false
	}
	const parser = new IDParser();
	let dbid = parser.parseDBID(inputStr)
	if (dbid) {
		this.dbid = dbid
		return this.dbid;
	}
	this.setError(`Invalid Database ID: ${inputStr}`)
};

/**
 * @param {String} inputStr - local identifier of repo
 */
ConnectionConfig.prototype.setRepo = function (inputStr) {
	if(!inputStr) {
		this.repoid = this.default_repo_id;
		return this.repoid
	}
	const parser = new IDParser();
	let repoid = parser.parseDBID(inputStr)
	if (repoid) {
		this.repoid = repoid
		return this.repoid;
	}
	this.setError(`Invalid Repo ID: ${inputStr}`)
};


/**
 * @param {String} inputStr - id of branch
 */
ConnectionConfig.prototype.setBranch = function (inputStr) {
	if(!inputStr) {
		this.branchid = this.default_branch_id;
		return this.branchid
	}
	const parser = new IDParser();
	let bid = parser.parseDBID(inputStr);
	if (bid) {
		this.branchid = bid
		return this.branchid;
	}
	this.setError(`Invalid Branch ID: ${inputStr}`)
}

/**
 * @param {String} inputStr - id of ref
 */
ConnectionConfig.prototype.setRef = function (inputStr) {
	if(inputStr){
		const parser = new IDParser();
		let bid = parser.parseDBID(inputStr)
		if (bid) {
			this.refid = bid
			return this.refid;
		}
		this.setError(`Invalid Branch ID: ${inputStr}`)
	}
	this.refid = false
	return this.refid;
}

/**
 * @param {String} inputStr - api key
 * @param {String} uid - basic auth user id key
 */
ConnectionConfig.prototype.setKey = function (inputStr, uid) {
	if(!inputStr) {
		this.basic_auth = false
		return false
	}
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
 * @param {String} inputStr - jwt token
 * @param {string} user_id - associated user id
 */
ConnectionConfig.prototype.setJWT = function (inputStr, user_id) {
	if(!inputStr) {
		this.jwt_token = false
		this.jwt_user = user_id || false
		return false
	}
	const parser = new IDParser();
	let jwt = parser.parseJWT(inputStr)
	if (jwt) {
		if(user_id) this.jwt_user = user_id
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
ConnectionConfig.prototype.triplesURL = function (type, gid) {
	if(this.db() == "terminus") var s = this.dbBase("triples") 
	else var s = this.branchBase("triples")
	const graphId = gid || 'main';	 
	s += `/${type}/${graphId}`
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
	if(this.db() == "terminus") return this.dbBase("frame")
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
	repoid = repoid || this.repo()
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
ConnectionConfig.prototype.branchURL = function (nuid) {
	let b = this.repoBase("branch")
	return b + `/branch/${nuid}`
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
ConnectionConfig.prototype.repoBase = function (action) {
	let b = this.dbBase(action)
	if(this.repo()) b += `/${this.repo()}`
	else b += "/" + this.default_repo_id
	return b
};

/**
 * Generate base branch url consisting of server/action/account/dbid/branchid
 */
ConnectionConfig.prototype.branchBase = function (action) {
	let b = this.repoBase(action)
	//_meta repo is magic - stores repository metadata
	if(this.repo() == "_meta"){
		return b
	}
	//_commits branch is magic - stores all commits for repo
	if(this.branch() == "_commits") {
		return b + `/${this.branch()}`
	}
	else if(this.ref()){
		return b + `/commit/${this.ref()}`
	}
	else if(this.branch()){
		return b + `/branch/${this.branch()}`
	}
	else b += "/branch/" + this.default_branch_id
	return b
}


/**
 * Generate url portion consisting of account/dbid (unless dbid = terminus in which case there is no account)
 */
ConnectionConfig.prototype.dbURLFragment = function () {
	if(this.db() == "terminus") return this.db()
	return this.account() + "/" + this.db()
};

module.exports = ConnectionConfig;
