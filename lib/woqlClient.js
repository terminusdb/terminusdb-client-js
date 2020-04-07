const CONST = require('./const');
const DispatchRequest = require('./dispatchRequest');
const ErrorMessage = require('./errorMessage');
const ConnectionCapabilities = require('./connectionCapabilities');
const ConnectionConfig = require('./connectionConfig');
const WOQL = require('./woql.js');


/**
 * @file Javascript WOQL client object
 * @license Apache Version 2
 * Simple Javascript Client for accessing the Terminus DB API
 * Constructor - takes an option json list of connection parameters
 * @param {Object} params a json object containing connection parameters
 * which can be:
 * params.server URL of server to connect to
 * params.dbid ID of database to connect to
 * params.docid = ID of document to load;
 */
function WOQLClient(params) {
	// current connection context variables
	this.connectionConfig = new ConnectionConfig(params);
	this.connection = new ConnectionCapabilities(this.connectionConfig);
}

WOQLClient.CONST = CONST;

/**
 * Short cut functions which get and set the state of the current connection
 */

/**
 * @returns {string} the current connected server - can only be set by connect 
 */
WOQLClient.prototype.server = function () {
	return this.connectionConfig.serverURL()
};

WOQLClient.prototype.db = function (dbid, accountid, branchid) {
	if(typeof dbid != "undefined"){
		this.connectionConfig.setCursor(accountid, dbid, branchid)
	}
	return this.connectionConfig.db()
};

WOQLClient.prototype.account = function (accountid, dbid, branchid) {
	if(typeof accountid != "undefined"){
		this.connectionConfig.setCursor(accountid, dbid, branchid)
	}
	return this.connectionConfig.account()
};

WOQLClient.prototype.checkout = function (branchid, dbid, accountid) {
	if(typeof branchid != "undefined"){
		this.connectionConfig.setCursor(accountid, dbid, branchid)
	}
	return this.connectionConfig.branch()
};

WOQLClient.prototype.key = function (key, user) {
	if(typeof key != "undefined"){
		this.connectionConfig.setKey(key, user)
	}
	return this.connectionConfig.key()
};

WOQLClient.prototype.jwt = function (jwt) {
	if(typeof jwt != "undefined"){
		this.connectionConfig.setJWT(key)
	}
	return this.connectionConfig.jwt()
};


/**
 * Connect to a Terminus server at the given URI with an API key
 * Stores the terminus:ServerCapability document returned
 * in the connection register which stores, the url, key, capabilities,
 * and database meta-data for the connected server
 *
 * If the curl argument is false or null,
 * this.connectionConfig.server will be used if present,
 * or the promise will be rejected.

 * @param  {string} curl Terminus server URI
 * @param {object} config - connection configuration json consisting of the following optional settings: 
 * key: api key 
 * jwt: jwt token 
 * db: set cursor to this db
 * branch: set branch to this id
 * account: set account to this id
 *  * @public
 */
WOQLClient.prototype.connect = function (curl, config) {
	config = config || {}
	if(curl) config.server = curl
	this.connectionConfig = new ConnectionConfig(config);
	if(!this.connectionConfig.serverURL()){
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(curl, CONST.CONNECT))
		);
	}
	// unset the current server setting until successful connect
	return this.dispatch(CONST.CONNECT, this.server())
	.then((response) => {
	    this.connection.setCapabilities(response);
	    return response;
	});
};


/**
 * Create a Terminus Database by posting
 * a terminus:Database document to the Terminus API
 * a mandatory rdfs:label field and an optional rdfs:comment field.
 * an optional terminus:default_branch_id
 * an optional set of terminus:
 * The key argument contains an optional API key (terminus:user_key)
 *
 * @param {object} details - a terminus:Database document
 * @param {string} key
 * @return {Promise}
 * @public
 */
WOQLClient.prototype.createDatabase = function(dbid, doc, accountid) {
	if(dbid && this.db(dbid, accountid)){
		return this.dispatch(CONST.CREATE_DATABASE, this.connectionConfig.dbURL(), doc);
	}
	else {
		let errmsg = `Create database parameter error - you must specify a valid database id  - ${dbid} is invalid`;
		return Promise.reject(
			new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_DATABASE, errmsg))
		);
	}
};

/**
 * Delete a Database (must first be connected to db)
 * @param {String} key an optional API key
 * @return {Promise}
 *
 */
WOQLClient.prototype.deleteDatabase = function (dbid, accountid) {
	if(dbid) this.db(dbid, accountid)
	return this.dispatch(CONST.DELETE_DATABASE, this.connectionConfig.dbURL())
	.then((response) => {
		this.connection.removeDB(this.db(), this.account());
		return response;
	});
};

/**
* Creates a new graph in the current database context
* @param {string} type inference || schema || instance
* @param {string} gid local id of graph
* @param {object} commit_msg json structure containing a commit message which describes the reason for the action
*/
WOQLClient.prototype.createGraph = function (type, gid, commit_msg) {
	return this.dispatch(CONST.CREATE_GRAPH, this.connectionConfig.graphURL(type, gid), commit_msg);
};

/**
* Deletes a graph from the current database context
* @param {string} type inference || schema || instance
* @param {string} gid local id of graph
* @param {object} commit_msg json structure containing a commit message which describes the reason for the action
*/
WOQLClient.prototype.deleteGraph = function (type, gid, commit_msg) {
	return this.dispatch(CONST.DELETE_GRAPH, this.connectionConfig.graphURL(type, gid), commit_msg);
};



/**
 * Retrieves the schema of the specified database
 *
 * @param {object} opts is an options object
 * @param {string} [sgid] TerminusDB Graph Pattern
 * @return {Promise} with result contents being the schema in owl turtle encoding
 *
 */
WOQLClient.prototype.getSchema = function (sgid) {
	return this.dispatch(CONST.GET_SCHEMA, this.connectionConfig.schemaURL(sgid));
};

/**
 * Updates the Schema of the specified database
 *
 * @param {string} sgid TerminusDB schema Graph ID to update
 * @param {string} doc is a valid owl ontology in turtle format
 * @return {Promise}
 *
 * opts.format is used to specify which format is being used (*json / turtle)
 * opts.key is an optional API key
 */
WOQLClient.prototype.updateSchema = function (sgid, doc) {
	return this.dispatch(CONST.UPDATE_SCHEMA, this.connectionConfig.schemaURL(sgid), doc);
};

/**
 * Retrieves a class frame for the specified clas
 *
 * @param {string} cls is the URL / ID of a document class that exists in the database schema
 */
WOQLClient.prototype.getClassFrame = function (cls) {
	opts = {};
	opts['terminus:class'] = cls;
	return this.dispatch(CONST.CLASS_FRAME, this.connectionConfig.classFrameURL(cls), opts);
};

/**
 * Executes a WOQL query on the specified database and returns the results
 *
 * @param {string} woql is a "woql query object"
 *
 */
WOQLClient.prototype.query = function (woql) {
	return this.dispatch(CONST.WOQL_QUERY, this.connectionConfig.queryURL(), woql);
};

WOQLClient.prototype.clone = function (clone_source, newid) {
	return this.dispatch(CONST.CLONE, this.connectionConfig.cloneURL(newid), clone_source);
};

WOQLClient.prototype.fetch = function (repoid) {
	return this.dispatch(CONST.FETCH, this.connectionConfig.fetchURL(repoid));
};

WOQLClient.prototype.rebase = function (remote_repo_id, remote_branch_id) {
	return this.dispatch(CONST.REBASE, this.connectionConfig.rebaseURL(remote_repo_id, remote_branch_id));
};

WOQLClient.prototype.push = function (target_repo, target_branch) {
	return this.dispatch(CONST.PUSH, this.connectionConfig.pushURL(target_repo, target_branch));
};

WOQLClient.prototype.branch = function (new_branch_id) {
	let current_branch = this.branch()
	this.checkout(new_branch_id)
	let source = { "terminus:resource": current_branch }
	return this.dispatch(CONST.BRANCH, this.connectionConfig.branchURL(new_branch_id), source);
};

/**
 * Common request dispatch function
 */
WOQLClient.prototype.dispatch = function (action, api_url, payload) {
	if(!api_url){
		return Promise.reject(
			new Error(ErrorMessage.getInvalidParameterMessage(action, this.connectionConfig.connection_error))
		);
	}
	return DispatchRequest(api_url, action, payload, this.key(), this.jwt());
};



module.exports = WOQLClient;
