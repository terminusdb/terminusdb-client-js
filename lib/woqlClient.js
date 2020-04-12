const CONST = require('./const')
const DispatchRequest = require('./dispatchRequest')
const ErrorMessage = require('./errorMessage')
const ConnectionCapabilities = require('./connectionCapabilities')
const ConnectionConfig = require('./connectionConfig')

/**
 * @file Javascript WOQL client object
 * @license Apache Version 2
 * Simple Javascript Client for accessing the Terminus DB API
 * Constructor 
 * @param {object} params - a json object with the following connection parameters:
 * 	server: server url 
 * 	key: api key for basic auth
 * 	user: basic auth user id 
 * 	jwt: jwt token 
 * 	jwt_user: jwt user id 
 * 	account: set account to this id
 * 	db: set cursor to this db
 *  repo: set cursor to this repo
 *  branch: set branch to this id
 */
function WOQLClient(params) {
	// current connection context variables
	this.connectionConfig = new ConnectionConfig(params)
	this.connection = new ConnectionCapabilities(this.connectionConfig)
}

WOQLClient.CONST = CONST

/**
 * Short cut functions which get and set the state of the current connection
 */

/**
 * @returns {string} the current connected server - can only be set by connect 
 */
WOQLClient.prototype.server = function () {
	return this.connectionConfig.serverURL()
}

/**
 * Sets / gets the current account (and optionally sets dbid and branchid too)
 */
WOQLClient.prototype.account = function (accountid) {
	if(typeof accountid != "undefined"){
		this.connectionConfig.setAccount(accountid)
	}
	return this.connectionConfig.account()
}


/**
 * Sets / gets the current database (and optionally sets accountid and branchid too)
 */
WOQLClient.prototype.db = function (dbid) {
	if(typeof dbid != "undefined"){
		this.connectionConfig.setDB(dbid)
	}
	return this.connectionConfig.db()
}

/**
 * Sets / gets the current branch (and optionally sets dbid and accountid too)
 */
WOQLClient.prototype.repo = function (repoid) {
	if(typeof repoid != "undefined"){
		this.connectionConfig.setRepo(repoid)
	}
	return this.connectionConfig.repo()
}


/**
 * Sets / gets the current branch (and optionally sets dbid and accountid too)
 */
WOQLClient.prototype.checkout = function (branchid) {
	if(typeof branchid != "undefined"){
		this.connectionConfig.setBranch(branchid)
	}
	return this.connectionConfig.branch()
}

/**
 * Sets the basic auth user:password for authentication
 * user defaults to admin
 */
WOQLClient.prototype.key = function (key, user) {
	if(typeof key != "undefined"){
		this.connectionConfig.setKey(key, user)
	}
	return this.connectionConfig.key()
}

/**
 * Sets / gets the jwt token for authentication
 */
WOQLClient.prototype.jwt = function (jwt, user) {
	if(typeof jwt != "undefined"){
		this.connectionConfig.setJWT(key, user)
	}
	return this.connectionConfig.jwt()
}

/**
 * Gets the current user id 
 * @param {boolean} ignore_jwt - if true, the local userid will be returned rather than the jwt id if set
 * otherwise jwt will come back if set, if not set, local id
 */
WOQLClient.prototype.uid = function (ignore_jwt) {
	return this.connectionConfig.user(ignore_jwt)
}

/**
 * Connect to a Terminus server at the given URI with an API key
 * Stores the terminus:ServerCapability document returned
 * in the connection register which stores, the url, key, capabilities,
 * and database meta-data for the connected server
 *
 * If the curl argument is false or null,
 * this.connectionConfig.server will be used if present,
 * or the promise will be rejected.

 * @param {object} config - see constructor for structure
 * @public
 */
WOQLClient.prototype.connect = function (config) {
	if(config) this.connectionConfig.update(config)
	if(!this.server()){
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(curl, CONST.CONNECT))
		)
	}
	// unset the current server setting until successful connect
	return this.dispatch(CONST.CONNECT, this.server())
	.then((response) => {
		if(!this.account()) this.account(this.uid())
	    this.connection.setCapabilities(response)
	    return response
	})
}


/**
 * Create a Terminus Database 
 *
 * @param {string} dbid - the local id to give the db
 * @param {Object} doc - JSON containing details about the database to be created: 
 * doc.label: "Textual DB Name"
 * doc.comment: "Text description of DB"
 * doc.base_uri: base URI to use for data ids in the db
 * @param {string} [accountid] - optional account id - if absent default local account id is used
 * @return {Promise}
 * @public
 */
WOQLClient.prototype.createDatabase = function(dbid, doc, accountid) {
	if(dbid && this.db(dbid)){
		if(accountid) this.account(accountid)
		return this.dispatch(CONST.CREATE_DATABASE, this.connectionConfig.dbURL(), doc)
	}
	let errmsg = `Create database parameter error - you must specify a valid database id  - ${dbid} is invalid`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_DATABASE, errmsg))
	)
}

/**
 * Delete a Database (must first be connected to db)
 * @param {string} dbid - the local id to give the db
 * @param {string} [accountid] - optional account id - if absent default local account id is used
 * @return {Promise}
 */
WOQLClient.prototype.deleteDatabase = function (dbid, accountid) {
	if(dbid && this.db(dbid)){
		if(accountid) this.account(accountid)
		return this.dispatch(CONST.DELETE_DATABASE, this.connectionConfig.dbURL())
		.then((response) => {
			this.connection.removeDB(this.db(), this.account())
			return response
		})
	}
	let errmsg = `Delete database parameter error - you must specify a valid database id  - ${dbid} is invalid`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_DATABASE, errmsg))
	)
}

/**
* Creates a new graph in the current database context
* @param {string} type inference | schema | instance
* @param {string} gid local id of graph
* @param {string} commit_msg Textual message describing the reason for the update
*/
WOQLClient.prototype.createGraph = function (type, gid, commit_msg) {
	if(type && (["inference", "schema", "instance"].indexOf(type) != -1) && gid && commit_msg){
		let commit = this.generateCommitInfo(commit_msg)
		return this.dispatch(CONST.CREATE_GRAPH, this.connectionConfig.graphURL(type, gid), commit)
	}
	let errmsg = `Create graph parameter error - you must specify a valid type (inference, instance, schema), graph id and commit message`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_GRAPH, errmsg))
	)
}

/**
* Deletes a graph from the current database context
* @param {string} type inference | schema | instance
* @param {string} gid local id of graph
* @param {string} commit_msg Textual message describing the reason for the update
*/
WOQLClient.prototype.deleteGraph = function (type, gid, commit_msg) {
	if(type && (["inference", "schema", "instance"].indexOf(type) != -1) && gid && commit_msg){
		let commit = this.generateCommitInfo(commit_msg)
		return this.dispatch(CONST.DELETE_GRAPH, this.connectionConfig.graphURL(type, gid), commit)
	}
	let errmsg = `Delete graph parameter error - you must specify a valid type (inference, instance, schema), graph id and commit message`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_GRAPH, errmsg))
	)	
}

/**
 * Retrieves the schema of the specified database
 *
 * @param {object} opts is an options object
 * @param {string} sgid TerminusDB Graph Filter Pattern
 * @return {Promise} with result contents being the schema in owl turtle encoding
 *
 */
WOQLClient.prototype.getSchema = function (sgid) {
	return this.dispatch(CONST.GET_SCHEMA, this.connectionConfig.schemaURL(sgid))
}

/**
 * Updates the Schema of the specified database
 *
 * @param {string} sgid TerminusDB schema Graph ID to update
 * @param {string} doc is a valid owl ontology in turtle format
 * @param {string} commit_msg Textual message describing the reason for the update
 * @return {Promise}
 *
 * opts.format is used to specify which format is being used (*json / turtle)
 * opts.key is an optional API key
 */
WOQLClient.prototype.updateSchema = function (sgid, turtle, commit_msg) {
	if(commit_msg && turtle && sgid){
		let commit = this.generateCommitInfo(commit_msg)
		commit.turtle = turtle
		return this.dispatch(CONST.UPDATE_SCHEMA, this.connectionConfig.schemaURL(sgid), commit)
	}
	let errmsg = `Update schema parameter error - you must specify a valid graph id and commit message`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_SCHEMA, errmsg))
	)	
}

/**
 * Retrieves a class frame for the specified clas
 *
 * @param {string} cls is the URL / ID of a document class that exists in the database schema
 */
WOQLClient.prototype.getClassFrame = function (cls) {
	if(cls){
		opts = {class: cls}
		return this.dispatch(CONST.CLASS_FRAME, this.connectionConfig.classFrameURL(cls), opts)
	}
	let errmsg = `Get class frame parameter error - you must specify a valid class id (URI)`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_SCHEMA, errmsg))
	)	
}

/**
 * Executes a WOQL query on the specified database and returns the results
 *
 * @param {WOQLQuery} woql is a "woql query object" 
 * @param {string} commit_msg - if the query contains any updates, it should include a textual message describing the reason for the update
 */
WOQLClient.prototype.query = function (woql, commit_msg) {
	if(woql && woql.json && (!woql.contains_update || commit_msg )){
		let doql = (woql.contains_update ? this.generateCommitInfo(commit_msg) : {})
		doql.query = woql.json()
		return this.dispatch(CONST.WOQL_QUERY, this.connectionConfig.queryURL(), doql)
	}
	let errmsg = `WOQL query parameter error`
	if(woql && woql.json && woql.contains_update && !commit_msg){
		errmsg += " - you must include a textual commit message to perform this update"
		alert(JSON.stringify(woql))
	}
	else {
		errmsg += " - you must specify a valid WOQL Query"
	}
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.WOQL_QUERY, errmsg))
	)	
}

/**
 * Creates a branch starting from the current branch 
 * @param {string} new_branch_id - local identifier of the new branch
 * @param {string} commit_msg - if the query contains any updates, it should include a textual message describing the reason for the update
 * @returns {Promise}
 */
WOQLClient.prototype.branch = function (new_branch_id, commit_msg) {
	if(new_branch_id && commit_msg){
		let commit = this.generateCommitInfo(commit_msg)
		let current_branch = this.checkout() 
		this.checkout(new_branch_id)
		commit.resource = current_branch 
		return this.dispatch(CONST.BRANCH, this.connectionConfig.branchURL(new_branch_id), commit)
	}
	let errmsg = `Branch parameter error - you must specify a valid new branch id and commit message`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg))
	)	
}

/**
 * Fetches updates from a remote repository to the current db 
 * @param {string} [repoid] - optional remote repoid - default "origin" 
 */
WOQLClient.prototype.fetch = function (repoid) {
	return this.dispatch(CONST.FETCH, this.connectionConfig.fetchURL(repoid))
}

/**
 * Pushes changes to the current database / branch to a remote repo
 * @param {string} [target_repo] - target repoid - default "origin" 
 * @param {string} [target_branch] - target branch - default "master" 
 */
WOQLClient.prototype.push = function (target_repo, target_branch) {
	return this.dispatch(CONST.PUSH, this.connectionConfig.pushURL(target_repo, target_branch))
}

/**
 * Rebases this branch from the remote one (note: the "remote" repo lives in the local db)
 * 
 */
WOQLClient.prototype.rebase = function (remote_repo_id, remote_branch_id) {
	return this.dispatch(CONST.REBASE, this.connectionConfig.rebaseURL(remote_repo_id, remote_branch_id))
}

/**
 * Clones a remote repo and creates a local copy 
 * @param {object} clone_source - json object with terminus:resource entry pointing at thing to be cloned (terminus-db)
 * @param {string} newid - id of the new repo to create
 */
WOQLClient.prototype.clonedb = function (clone_source, newid) {
	return this.dispatch(CONST.CLONE, this.connectionConfig.cloneURL(newid), clone_source)
}


/**
 * Common request dispatch function
 */
WOQLClient.prototype.dispatch = function (action, api_url, payload) {
	if(!api_url){
		return Promise.reject(
			new Error(ErrorMessage.getInvalidParameterMessage(action, this.connectionConfig.connection_error))
		)
	}
	return DispatchRequest(api_url, action, payload, this.key(), this.jwt())
}

/**
 * Generates the json structure for commit messages
 * @param {string} msg - textual string describing reason for the change
 * @param {string} [author] - optional author id string - if absent current user id will be used
 */
WOQLClient.prototype.generateCommitInfo = function(msg, author){
	author = author || this.uid()
	let ci = {"commit_info": {author: author, message: msg}}
	return ci
}


module.exports = WOQLClient
