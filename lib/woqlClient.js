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
 * @param {serverUrl} string 
 * @param {object} params - a json object with the following connection parameters:
 * 	key: api key for basic auth
 * 	user: basic auth user id 
 * 	jwt: jwt token 
 * 	jwt_user: jwt user id 
 * 	account: set account to this id
 * 	db: set cursor to this db
 *  repo: set cursor to this repo
 *  branch: set branch to this id
 */
function WOQLClient(serverUrl,params) {
	// current connection context variables
	this.connectionConfig = new ConnectionConfig(serverUrl,params)
	// db metadata and capabilities for currently connected server
	this.connection = new ConnectionCapabilities()	
}

WOQLClient.CONST = CONST

/**
 * Creates a copy of the current client with a new connection Config
 */
WOQLClient.prototype.copy = function () {
	let other = new WOQLClient(this.server)
	other.connection = this.connection //keep same connection meta data - shared by copy
	other.connectionConfig = this.connectionConfig.copy() //new copy of current connection data
	return other
}

/**
 * @returns {string} the current connected server - can only be set by connect or creating a new terminusDB instance
 */
WOQLClient.prototype.server = function () {
	return this.connectionConfig.serverURL()
}

/**
 * Sets / gets the current account 
 * @param {string} accountid 
 */
WOQLClient.prototype.account = function (accountid) {
	if(typeof accountid != "undefined"){
		this.connectionConfig.setAccount(accountid)
	}
	return this.connectionConfig.account()
}


/**
 * Sets / gets the current database 
 * @param {string} dbid 
 */
WOQLClient.prototype.db = function (dbid) {
	if(typeof dbid != "undefined"){
		this.connectionConfig.setDB(dbid)
	}
	return this.connectionConfig.db()
}

/**
 * Sets / gets the current repository id  
 * @param {string} repoid default value is local
 */
WOQLClient.prototype.repo = function (repoid) {
	if(typeof repoid != "undefined"){
		this.connectionConfig.setRepo(repoid)
	}
	return this.connectionConfig.repo()
}


/**
 * Sets / gets the current branch id 
 * @param {string} branchid default value is master
 */
WOQLClient.prototype.checkout = function (branchid) {
	if(typeof branchid != "undefined"){
		this.connectionConfig.setBranch(branchid)
	}
	return this.connectionConfig.branch()
}

/**
 * Sets / gets the current ref pointer (pointer to a commit within a branch)
 * @param {string} refid 
 */
WOQLClient.prototype.ref = function (refid) {
	if(typeof refid != "undefined"){
		this.connectionConfig.setRef(refid)
	}
	return this.connectionConfig.ref()
}


/**
 * Sets / gets the basic auth user:password for authentication
 * @param {string} key  required
 * @param {string} user optional default value is admin
 */
WOQLClient.prototype.basic_auth = function (key, user) {
	if(typeof key != "undefined"){
		this.connectionConfig.setBasicAuth(key, user)
	}
	return this.connectionConfig.basicAuth()
}

/**
 * Sets / gets the jwt token for authentication
 * @param {string} jwt
 * @param {string} user 
 */
WOQLClient.prototype.remote_auth = function (authInfo) {
	if(typeof authInfo != "undefined"){
		this.connectionConfig.setRemoteAuth(authInfo)
	}
	return this.connectionConfig.remoteAuth()
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
 * You can update multiple connection values
 * @param {object} params - a json object with connection params 
 */
WOQLClient.prototype.set = function (params) {
	this.connectionConfig.update(params)
}

/**
 * Returns a resource identifier string (for passing to WOQL.using) of the current context for "commits" "meta" "branch" and "ref" special resources
 * type is either [commits, meta, branch, ref, repo, db]
 */
WOQLClient.prototype.resource = function (type, val) {
    let base = `${this.account()}/${this.db()}/`
    if(type == "db") return base
    if(type == 'meta') return `${base}/_meta`
    base += `${this.repo()}`
    if(type == 'repo') return base
    if(type == 'commits') return `${base}/_commits`
    val = val || (type == "ref" ? this.ref() : this.checkout())
    if(type == 'branch') return `${base}/branch/${val}`
    if(type == 'ref') return `${base}/commit/${val}`
}



/**
 * Connect to a Terminus server at the given URI with an API key
 * Stores the terminus:ServerCapability document returned
 * in the connection register which stores, the url, key, capabilities,
 * and database meta-data for the connected server
 *
 * If the curl argument is false or  null,
 * this.connectionConfig.server will be used if present,
 * or the promise will be rejected.

 * @param {object} config - see constructor for structure
 * @return {Promise}
 * @public
 * 
 */
WOQLClient.prototype.connect = function (config) {
	if(config) this.connectionConfig.update(config)
	if(!this.server()){
		let curl = (config && config.server ? config.server : "Missing URL")
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
 * @param {string} accountid - optional account id - if absent current account id is used
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
* @param {string} type 		  - type of graph     | inference | schema | instance |
* @param {string} gid  		  - local id of graph | main | mygraphName | * |
* @param {string} commit_msg  - Textual message describing the reason for the update
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
* @param {string} type 		 - type of graph     | inference | schema | instance |
* @param {string} gid 		 - local id of graph | main | mygraphName | * |
* @param {string} commit_msg - Textual message describing the reason for the update
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
 * Retrieves the contents of the specified graph as turtle
 *
 * @param {string} gtype Type of graph (instance|schema|inference)
 * schema get the database schema in owl
 * instance get all the database documents data in owl format
 * inference get all the constraints schema in owl  
 *
 * @param {string} gid TerminusDB Graph name "main" is the default value
 * @return {Promise} with result contents being the schema in owl turtle encoding
 *
 */
WOQLClient.prototype.getTriples = function (gtype, gid) {
    if(gtype && gid){
        return this.dispatch(CONST.GET_TRIPLES, this.connectionConfig.triplesURL(gtype, gid))
    }
	let errmsg = `Get triples parameter error - you must specify a valid graph type (inference, instance, schema), and graph id`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET_TRIPLES, errmsg))
	)	
}

/**
 * Replaces the contents of a graph with the passed turtle
 *
 * @param {string} gtype type of graph  |instance|schema|inference|
 * @param {string} gid TerminusDB Graph ID to update, main is the default value
 * @param {string} turtle is a valid set of triples in turtle format (OWL)
 * @param {string} commit_msg Textual message describing the reason for the update
 * @return {Promise}
 *
 * opts.format is used to specify which format is being used (*json / turtle)
 * opts.key is an optional API key
 */

WOQLClient.prototype.updateTriples = function (gtype, gid, turtle, commit_msg) {
	if(commit_msg && turtle && gid && gtype){
		let commit = this.generateCommitInfo(commit_msg)
        commit.turtle = turtle
		return this.dispatch(CONST.UPDATE_TRIPLES, this.connectionConfig.triplesURL(gtype, gid), commit)
	}
	let errmsg = `Update triples parameter error - you must specify a valid graph id, graph type, turtle contents and commit message`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_TRIPLES, errmsg))
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
	commit_msg = commit_msg || "Automatically Added Commit"
	if(woql && woql.json && (!woql.containsUpdate() || commit_msg )){
        let doql = (woql.containsUpdate() ? this.generateCommitInfo(commit_msg) : {})
        doql.query = woql.json()
        if(!doql.query["@context"]){
            let ctxt = this.connection.getJSONContext()
            //add in the two default contextual name spaces if ther are somehow not present
            if(!ctxt["scm"]) ctxt["scm"] = "terminus://" + (this.account() || this.uid()) + "/" + this.db() + "/schema#" 
            if(!ctxt["doc"]) ctxt["doc"] = "terminus://" + (this.account() || this.uid()) + "/" + this.db() + "/data" 
            doql.query['@context'] = ctxt;
        }
		return this.dispatch(CONST.WOQL_QUERY, this.connectionConfig.queryURL(), doql)
	}
	let errmsg = `WOQL query parameter error`
	if(woql && woql.json && woql.containsUpdate() && !commit_msg){
		errmsg += " - you must include a textual commit message to perform this update"
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
WOQLClient.prototype.branch = function(new_branch_id) {
	if(new_branch_id){
		let source = (this.ref() ? 
			{ origin: `${this.account()}/${this.db()}/${this.repo()}/commit/${this.ref()}`}  : 
			{ origin: `${this.account()}/${this.db()}/${this.repo()}/branch/${this.checkout()}`}  )
		return this.dispatch(CONST.BRANCH, this.connectionConfig.branchURL(new_branch_id), source)
	}
	let errmsg = `Branch parameter error - you must specify a valid new branch id`
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
    if(newid){
        return this.dispatch(CONST.CLONE, this.connectionConfig.cloneURL(newid), clone_source)
    }
    let errmsg = `Clone parameter error - you must specify a valid new branch id`
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg))
	)	

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
	return DispatchRequest(api_url, action, payload, this.basic_auth(), this.remote_auth())
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
