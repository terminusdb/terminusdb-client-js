const CONST = require('./const')
const DispatchRequest = require('./dispatchRequest')
const ErrorMessage = require('./errorMessage')
const ConnectionCapabilities = require('./connectionCapabilities')
const ConnectionConfig = require('./connectionConfig')
const WOQL = require('./woql')

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
 * 	organization: set organization to this id
 * 	db: set cursor to this db
 *  repo: set cursor to this repo
 *  branch: set branch to this id
 */
function WOQLClient(serverUrl, params) {
    // current connection context variables
    this.connectionConfig = new ConnectionConfig(serverUrl, params)
    // db metadata and capabilities for currently connected server
    this.connection = new ConnectionCapabilities()
}

WOQLClient.CONST = CONST

/**
 * Creates a copy of the current client with a new connection Config
 */
WOQLClient.prototype.copy = function() {
    let other = new WOQLClient(this.server())
    other.connection = this.connection //keep same connection meta data - shared by copy
    other.connectionConfig = this.connectionConfig.copy() //new copy of current connection data
    return other
}

/**
 * @returns {string} the current connected server - can only be set by connect or creating a new terminusDB instance
 */
WOQLClient.prototype.server = function() {
    return this.connectionConfig.serverURL()
}

/**
 * @returns {string} the current connected server - can only be set by connect or creating a new terminusDB instance
 */
WOQLClient.prototype.api = function() {
    return this.connectionConfig.apiURL()
}

/**
 * Gets the current organization id
 */
WOQLClient.prototype.organization = function(accid) {
    if (typeof accid != 'undefined') {
        return this.connectionConfig.setOrganization(accid)
    }
    return this.connectionConfig.organization()
}

/**
 * Gets the current user object (id, name, author, notes)
 */
WOQLClient.prototype.user = function() {
    return this.connection.get_user()
}

WOQLClient.prototype.uid = function() {
    let u = this.user()
    return u.id
}

WOQLClient.prototype.user_organization = function() {
    return this.uid()
}

/**
 * Gets the list of databases that the user has access to (has roles for)
 */
WOQLClient.prototype.databases = function(dbs) {
    if (dbs) this.connection.set_databases(dbs)
    return this.connection.get_databases()
}

/**
 * Gets the list of databases that the user has access to (has roles for)
 */
WOQLClient.prototype.get_database = function(dbid, orgid) {
    dbid = dbid || this.db()
    orgid = orgid || this.organization()
    return this.connection.get_database(dbid, orgid)
}


/**
 * Sets / gets the current database
 * @param {string} dbid
 */
WOQLClient.prototype.db = function(dbid) {
    if (typeof dbid != 'undefined') {
        this.connectionConfig.setDB(dbid)
    }
    return this.connectionConfig.db()
}

WOQLClient.prototype.set_system_db = function() {
    this.db(this.connectionConfig.system_db)
}


/**
 * Sets / gets the current repository id
 * @param {string} repoid default value is local
 */
WOQLClient.prototype.repo = function(repoid) {
    if (typeof repoid != 'undefined') {
        this.connectionConfig.setRepo(repoid)
    }
    return this.connectionConfig.repo()
}

/**
 * Sets / gets the current branch id
 * @param {string} branchid default value is main
 */
WOQLClient.prototype.checkout = function(branchid) {
    if (typeof branchid != 'undefined') {
        this.connectionConfig.setBranch(branchid)
    }
    return this.connectionConfig.branch()
}

/**
 * Sets / gets the current ref pointer (pointer to a commit within a branch)
 * @param {string} refid
 */
WOQLClient.prototype.ref = function(refid) {
    if (typeof refid != 'undefined') {
        this.connectionConfig.setRef(refid)
    }
    return this.connectionConfig.ref()
}

/**
 * Sets / gets the basic auth user:password for authentication
 * @param {string} key  required
 * @param {string} user optional default value is admin
 */
WOQLClient.prototype.local_auth = function(key, type, user) {
    if (typeof key != 'undefined') {
        this.connectionConfig.setLocalAuth(key, type, user)
    }
    return this.connectionConfig.localAuth()
}

/**
 * Sets / gets the jwt token for authentication
 * @param {string} jwt
 * @param {string} user
 */
WOQLClient.prototype.remote_auth = function(authInfo) {
    if (typeof authInfo != 'undefined') {
        this.connectionConfig.setRemoteAuth(authInfo)
    }
    return this.connectionConfig.remoteAuth()
}

/**
 * Gets the current user object as returned by the connect response
 * user has fields: [id, name, notes, author]
 */
WOQLClient.prototype.user = function() {
    return this.connection.get_user()
}

/**
 * Getter / setter of commit log author id
 */
WOQLClient.prototype.author = function(aname) {
    if (aname) {
        this.connection.user.author = aname
    }
    return this.connection.author() || this.connection.user.id || this.connectionConfig.local_user()
}

/**
 * You can update multiple connection values
 * @param {object} params - a json object with connection params
 */
WOQLClient.prototype.set = function(params) {
    this.connectionConfig.update(params)
}

/**
 * Returns a resource identifier string (for passing to WOQL.using) of the current context for "commits" "meta" "branch" and "ref" special resources
 * type is either [commits, meta, branch, ref, repo, db]
 */
WOQLClient.prototype.resource = function(type, val) {
    let base = `${this.organization()}/${this.db()}/`
    if (type == 'db') return base
    if (type == 'meta') return `${base}_meta`
    base += `${this.repo()}`
    if (type == 'repo') return base
    if (type == 'commits') return `${base}/_commits`
    val = val || (type == 'ref' ? this.ref() : this.checkout())
    if (type == 'branch') return `${base}/branch/${val}`
    if (type == 'ref') return `${base}/commit/${val}`
}

/**
 * Connect to a Terminus server at the given URI with an API key
 * Stores the system:ServerCapability document returned
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
WOQLClient.prototype.connect = function(config) {
    if (config) this.connectionConfig.update(config)
    if (!this.server()) {
        let curl = config && config.server ? config.server : 'Missing URL'
        return Promise.reject(new URIError(ErrorMessage.getInvalidURIMessage(curl, CONST.CONNECT)))
    }
    // unset the current server setting until successful connect
    return this.dispatch(CONST.CONNECT, this.api()).then(response => {
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
 * doc.prefixes: {scm: "http://url.to.use/for/scm", doc: "http://url.to.use/for/doc"}
 * doc.schema: [optional] - if set to true, a schema graph will be created
 * @param {string} [orgid] - optional organization id - if absent default local organization id is used
 * @return {Promise}
 * @public
 */
WOQLClient.prototype.createDatabase = function(dbid, doc, orgid) {
    orgid = orgid || this.user_organization()
    this.organization(orgid)
    if (dbid && this.db(dbid)) {
        return this.dispatch(CONST.CREATE_DATABASE, this.connectionConfig.dbURL(), doc)
    }
    let errmsg = `Create database parameter error - you must specify a valid database id  - ${dbid} is invalid`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_DATABASE, errmsg)),
    )
}

/**
 * Delete a Database (must first be connected to db)
 * @param {string} dbid - the local id to give the db
 * @param {string} orgid - optional organization id - if absent current organization id is used
 * @return {Promise}
 */
WOQLClient.prototype.deleteDatabase = function(dbid, orgid, force) {
    orgid = orgid || this.organization()
    this.organization(orgid)
    let payload = force ? {force: true} : null
    if (dbid && this.db(dbid)) {
        return this.dispatch(CONST.DELETE_DATABASE, this.connectionConfig.dbURL(), payload)
    }
    let errmsg = `Delete database parameter error - you must specify a valid database id  - ${dbid} is invalid`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_DATABASE, errmsg)),
    )
}

/**
 * Creates a new graph in the current database context
 * @param {string} type 		  - type of graph     | inference | schema | instance |
 * @param {string} gid  		  - local id of graph | main | mygraphName | * |
 * @param {string} commit_msg  - Textual message describing the reason for the update
 */
WOQLClient.prototype.createGraph = function(type, gid, commit_msg) {
    if (type && ['inference', 'schema', 'instance'].indexOf(type) != -1 && gid && commit_msg) {
        let commit = this.generateCommitInfo(commit_msg)
        return this.dispatch(CONST.CREATE_GRAPH, this.connectionConfig.graphURL(type, gid), commit)
    }
    let errmsg = `Create graph parameter error - you must specify a valid type (inference, instance, schema), graph id and commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_GRAPH, errmsg)),
    )
}

/**
 * Deletes a graph from the current database context
 * @param {string} type 		 - type of graph     | inference | schema | instance |
 * @param {string} gid 		 - local id of graph | main | mygraphName | * |
 * @param {string} commit_msg - Textual message describing the reason for the update
 */
WOQLClient.prototype.deleteGraph = function(type, gid, commit_msg) {
    if (type && ['inference', 'schema', 'instance'].indexOf(type) != -1 && gid) {
        let commit = this.generateCommitInfo(commit_msg)
        return this.dispatch(CONST.DELETE_GRAPH, this.connectionConfig.graphURL(type, gid), commit)
    }
    let errmsg = `Delete graph parameter error - you must specify a valid type (inference, instance, schema), graph id and commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_GRAPH, errmsg)),
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
WOQLClient.prototype.getTriples = function(gtype, gid) {
    if (gtype && gid) {
        return this.dispatch(CONST.GET_TRIPLES, this.connectionConfig.triplesURL(gtype, gid))
    }
    let errmsg = `Get triples parameter error - you must specify a valid graph type (inference, instance, schema), and graph id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET_TRIPLES, errmsg)),
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
 */
WOQLClient.prototype.updateTriples = function(gtype, gid, turtle, commit_msg) {
    if (commit_msg && turtle && gid && gtype) {
        let commit = this.generateCommitInfo(commit_msg)
        commit.turtle = turtle
        return this.dispatch(
            CONST.UPDATE_TRIPLES,
            this.connectionConfig.triplesURL(gtype, gid),
            commit,
        )
    }
    let errmsg = `Update triples parameter error - you must specify a valid graph id, graph type, turtle contents and commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_TRIPLES, errmsg)),
    )
}



/**
 * Appends the passed turtle to the contents of a graph
 *
 * @param {string} gtype type of graph  |instance|schema|inference|
 * @param {string} gid TerminusDB Graph ID to update, main is the default value
 * @param {string} turtle is a valid set of triples in turtle format (OWL)
 * @param {string} commit_msg Textual message describing the reason for the update
 * @return {Promise}
 */
WOQLClient.prototype.insertTriples = function(gtype, gid, turtle, commit_msg) {
    if (commit_msg && turtle && gid && gtype) {
        let commit = this.generateCommitInfo(commit_msg)
        commit.turtle = turtle
        return this.dispatch(
            CONST.INSERT_TRIPLES,
            this.connectionConfig.triplesURL(gtype, gid),
            commit,
        )
    }
    let errmsg = `Update triples parameter error - you must specify a valid graph id, graph type, turtle contents and commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.INSERT_TRIPLES, errmsg)),
    )
}

/**
 * Inserts a csv from a specified path
 *
 * @param {array} csv_path is an array of csv file names with file path
 * @param {string} commit_msg Textual message describing the reason for the update
 * @param {string} gtype type of graph  |instance|schema|inference|
 * @param {string} gid TerminusDB Graph ID to update, main is the default value
 * @return {Promise} An API success message
 */
WOQLClient.prototype.insertCSV = function(csv_path, commit_msg, gtype, gid) {
    if (commit_msg && csv_path) {
        let commit = this.generateCommitInfo(commit_msg)
        const formData = new FormData();
        csv_path.map((item)=>{
            if(typeof(item.name)=="string"){
                formData.append(item.name, item)
            }
            else {
                let name = new String(item).substring(item.lastIndexOf('/') + 1);
                var fr = new File([name], item, {type: "csv/text"});
                formData.append(name, fr)
            }
        })
        formData.append('payload', JSON.stringify(commit))
        return this.dispatch(
            CONST.ADD_CSV,
            this.connectionConfig.csvURL(gtype, gid),
            formData,
        )
    }
}

/**
 * Updates the contents of the specified path with a csv, creating the appropriate
 * diff object as the commit.
 *
 * @param {array} csv_path Array csvs to upload
 * @param {string} commit_msg Textual message describing the reason for the update
 * @param {string} gtype type of graph  |instance|schema|inference|
 * @param {string} gid TerminusDB Graph ID to update, main is the default value
 * @return {Promise} An API success message
 */
WOQLClient.prototype.updateCSV = function(csv_path, commit_msg, gtype, gid) {
    if (commit_msg && csv_path) {
        let commit = this.generateCommitInfo(commit_msg)
        const formData = new FormData();
        csv_path.map((item)=>{
            formData.append(item.fileToBeUpdated, item.updateWith)
        })
        formData.append('payload', JSON.stringify(commit))
        return this.dispatch(
            CONST.UPDATE_CSV,
            this.connectionConfig.csvURL(gtype, gid),
            formData,
        )
    }
}

/**
 * Retrieves the contents of the specified graph as a CSV
 *
 * @param {string} csv_name Name of csv to dump from the specified database to extract
 * @param {string} download flag to download csv file
 * @param {string} gtype Type of graph (instance|schema|inference)
 * @param {string} gid identifier.
 * @return {Promise} An API success message
 *
 */
WOQLClient.prototype.getCSV = function(csv_name, download, gtype, gid) {
    let options = {}, filePath
    options.name=csv_name;
    return this.dispatch(CONST.GET_CSV, this.connectionConfig.csvURL(gtype, gid), options)
}

/**
 * Deletes a csv into the specified path
 *
 * @param {array} csv_name is an array of csv file names
 * @param {string} commit_msg Textual message describing the reason for the delete
 * @return {Promise} An API success message
 */
 WOQLClient.prototype.deleteCSV = function(csv_name, commit_msg) {
    if (commit_msg && csv_name) {
        let commit = this.generateCommitInfo(commit_msg)
        let options = {}, filePath
        options.name=csv_name;
        options.commit_info=commit.commit_info
        return this.dispatch(CONST.DELETE_CSV, this.connectionConfig.csvURL(), options).then(results => {
            return results;
         })
    }
 }

/**
 * sends a message  to the server
 * @param {string} msg - textual string
 */
WOQLClient.prototype.message = function(message) {
    const url = this.api() + 'message'
    return this.dispatch(CONST.MESSAGE, url, message).then(response => {
        return response
    })
}

/**
 * gets terminusdb server info
 * @param {string} msg - textual string
 */
WOQLClient.prototype.info = function() {
    const url = this.api() + 'info'
    return this.dispatch(CONST.INFO, url).then(response => {
        return response
    })
}


/**
 * Executes a WOQL query on the specified database and returns the results
 *
 * @param {WOQLQuery} woql is a "woql query object"
 * @param {string} commit_msg - if the query contains any updates, it should include a textual message describing the reason for the update
 */
WOQLClient.prototype.query = function(woql, commit_msg, all_witnesses) {
    all_witnesses = all_witnesses || false
    commit_msg = commit_msg || 'Commit generated with javascript client without message'
    if (woql && woql.json && (!woql.containsUpdate() || commit_msg)) {
        woql.context(this.connection.getContextForOutboundQuery(woql, this.db(), this.organization()))
        let doql = woql.containsUpdate() ? this.generateCommitInfo(commit_msg) : {}
        doql.query = woql.json()
        if(all_witnesses) doql.all_witnesses = true
        return this.dispatch(CONST.WOQL_QUERY, this.connectionConfig.queryURL(), doql)
    }
    let errmsg = `WOQL query parameter error`
    if (woql && woql.json && woql.containsUpdate() && !commit_msg) {
        errmsg += ' - you must include a textual commit message to perform this update'
    } else {
        errmsg += ' - you must specify a valid WOQL Query'
    }
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.WOQL_QUERY, errmsg)),
    )
}

/**
 * Creates a branch starting from the current branch
 * @param {string} new_branch_id - local identifier of the new branch
 * @param {string} source_free - if the query contains any updates, it should include a textual message describing the reason for the update
 * @returns {Promise}
 */
WOQLClient.prototype.branch = function(new_branch_id, source_free) {
    if (new_branch_id) {
        let source = this.ref()
            ? {origin: `${this.organization()}/${this.db()}/${this.repo()}/commit/${this.ref()}`}
            : {
                  origin: `${this.organization()}/${this.db()}/${this.repo()}/branch/${this.checkout()}`,
              }
        if(source_free && source_free === true){
            source = {}
        }
        return this.dispatch(CONST.BRANCH, this.connectionConfig.branchURL(new_branch_id), source)
    }
    let errmsg = `Branch parameter error - you must specify a valid new branch id`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)))
}

/**
 * Pull updates from a remote repository to the current db and merges them
 * @param {object} [remote_source_repo] - source repo - {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"}
 */
WOQLClient.prototype.pull = function(remote_source_repo) {
    let rc_args = this.prepareRevisionControlArgs(remote_source_repo)
    if (rc_args && rc_args.remote && rc_args.remote_branch) {
        return this.dispatch(CONST.PULL, this.connectionConfig.pullURL(), rc_args)
    }
    let errmsg = `Pull parameter error - you must specify a valid remote source and branch to pull from`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.PULL, errmsg)))
}

/**
 * Fetches updates from a remote repository to the current db
 * @param {string} [remote_id] - if of the remote to fetch (eg: 'origin')
 */
WOQLClient.prototype.fetch = function(remote_id) {
    return this.dispatch(CONST.FETCH, this.connectionConfig.fetchURL(remote_id))
}

/**
 * Pushes changes to the current database / branch to a remote repo
 * @param {object} [remote_target_repo] - target repo - {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"}
 */
WOQLClient.prototype.push = function(remote_target_repo) {
    let rc_args = this.prepareRevisionControlArgs(remote_target_repo)
    if (rc_args && rc_args.remote && rc_args.remote_branch) {
        return this.dispatch(CONST.PUSH, this.connectionConfig.pushURL(), rc_args)
    }
    let errmsg = `Push parameter error - you must specify a valid remote target`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.PUSH, errmsg)))
}

/**
 * Rebases this branch from the remote one (note: the "remote" repo lives in the local db)
 */
WOQLClient.prototype.rebase = function(rebase_source) {
    let rc_args = this.prepareRevisionControlArgs(rebase_source)
    if (rc_args && rc_args.rebase_from) {
        return this.dispatch(
            CONST.REBASE,
            this.connectionConfig.rebaseURL(this.checkout()),
            rc_args,
        )
    } else {
        let errmsg = `Rebase parameter error - you must specify a valid rebase source to rebase from`
        return Promise.reject(
            new Error(ErrorMessage.getInvalidParameterMessage(CONST.REBASE, errmsg)),
        )
    }
}

/**
 * Reset the current branch HEAD to the specified commit path
 * @param {string} The commit path to set the current branch to
 */
WOQLClient.prototype.reset = function(commit_path) {
    return this.dispatch(
        CONST.RESET,
        this.connectionConfig.resetURL(this.checkout()),
        {"commit_descriptor": commit_path},
    )
}

/**
 * Clones a remote repo and creates a local copy
 * @param {object} clone_source - json object with remote_url, label, comment, (URL of thing) to be cloned (terminus-db)
 * @param {string} newid - id of the new repo to create
 */
WOQLClient.prototype.clonedb = function(clone_source, newid, orgid) {
    orgid = orgid || this.user_organization()
    this.organization(orgid)
    let rc_args = this.prepareRevisionControlArgs(clone_source)
    if (newid && rc_args && rc_args.remote_url) {
        return this.dispatch(CONST.CLONE, this.connectionConfig.cloneURL(newid), rc_args)
    }
    let errmsg = `Clone parameter error - you must specify a valid id for the cloned database`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)))
}

/**
 * Common request dispatch function
 */
WOQLClient.prototype.dispatch = function(action, api_url, payload) {
    if (!api_url) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    action,
                    this.connectionConfig.connection_error,
                ),
            ),
        )
    }
    return DispatchRequest(api_url, action, payload, this.local_auth(), this.remote_auth())
}

/**
 * Generates the json structure for commit messages
 * @param {string} msg - textual string describing reason for the change
 * @param {string} [author] - optional author id string - if absent current user id will be used
 */
WOQLClient.prototype.generateCommitInfo = function(msg, author) {
    if (!author) {
        author = this.author()
    }
    let ci = {commit_info: {author: author, message: msg}}
    return ci
}

/**
 * Adds an author string (from the user object returned by connect) to the commit message.
 * @param {object} rc_args
 */
WOQLClient.prototype.prepareRevisionControlArgs = function(rc_args) {
    if (!rc_args) return false
    if (!rc_args.author) rc_args.author = this.author()
    return rc_args
}

/**
 * Loads prefixes for each database connected to.
 * @param {result} connection result
 */
WOQLClient.prototype._load_db_prefixes = function(dbs) {
    dbs = dbs || this.databases()
    let parts = []
    for(var i = 0; i<dbs.length; i++){
        let using = `${dbs[i].organization}/${dbs[i].id}/local/_commits`
        let wvars = ['Prefix_'+i, 'IRI_'+i, 'Prefix Pair IRI_'+i]
        parts.push(WOQL.lib().prefixes(false, wvars, using))
    }
    let temp = this.copy()
    temp.set_system_db()
    let q = WOQL.or(...parts)
    return temp.query(q).then((results) => {
        if(results && results.bindings && results.bindings.length){
            for(var i = 0 ; i< results.bindings.length; i++){
                let row = results.bindings[i]
                for(var j = 0; j< dbs.length; j++){
                    let ndb = dbs[j]
                    if(!ndb.prefix_pairs){
                        ndb.prefix_pairs = {}
                    }
                    if(row['Prefix_'+j] && row['Prefix_'+j]['@value'] && row['IRI_'+j]["@value"]){
                        ndb.prefix_pairs[row['Prefix_'+j]["@value"]] = row['IRI_'+j]["@value"]
                    }
                }
            }
            this.connection.buildContextsFromPrefixes()
        }
    })
}

/**
 * Not yet released - subject to change in parameters
 * The class frame API endpoint is not yet sufficiently stable for release
 * It should be considered unreliable and subject to change in parameters until
 * it has been released
 */

/**
 * Retrieves a class frame for the specified clas
 *
 * @param {string} cls is the URL / ID of a document class that exists in the database schema
 */
WOQLClient.prototype.getClassFrame = function(cls) {
    if (cls) {
        opts = {class: cls}
        return this.dispatch(CONST.CLASS_FRAME, this.connectionConfig.classFrameURL(cls), opts)
    }
    let errmsg = `Get class frame parameter error - you must specify a valid class id (URI)`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_SCHEMA, errmsg)),
    )
}



/***
 * Server Version API
 * Note: the below endpoints are not part of the terminusdb desktop package
 * they belong to the server package version of the DB which is under construction.
 * Until that package is released all of the below endpoints should be considered
 * as unreliable and subject to change - they are provided complete with the desktop
 * version to show users what is coming and to allow people to use them at their own risk
 * Any use of them should be considered unsupported and at your own risk
 */

WOQLClient.prototype.getDatabase = function() {
    return this.dispatch(CONST.READ_DATABASE, this.connectionConfig.dbURL())
}

WOQLClient.prototype.updateDatabase = function(doc) {
    let dbid = doc.id || this.db()
    let org = doc.organization || this.organization()
    return this.createDatabase(dbid, doc, org)
}

/**
 * Gets the list of organizations that the user belongs to (has roles for)
 */
WOQLClient.prototype.user_organizations = function() {
    return this.connection.get_organizations()
}

WOQLClient.prototype.get_organization = function(resname) {
    return this.connection.get_organization(resname)
}

WOQLClient.prototype.organizations = function(res) {
    if (res) {
        this.connection.set_organizations(res)
    }
    return this.connection.get_organization()
}


/**
 * Gets the current user's organization id
 */
WOQLClient.prototype.action_permitted = function(action, resource) {
    return this.connection.actions_permitted(action, resource)
}

WOQLClient.prototype.createUser = function(uid, doc) {
    if (uid) {
        return this.dispatch(CONST.CREATE_USER, this.connectionConfig.userURL(), doc)
    }
    let errmsg = `Create user parameter error - you must specify a valid user id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_USER, errmsg)),
    )
}

WOQLClient.prototype.getUser = function(uid) {
    return this.dispatch(CONST.READ_USER, this.connectionConfig.userURL(uid))
}

WOQLClient.prototype.updateUser = function(uid, doc) {
    if (uid) {
        return this.dispatch(CONST.UPDATE_USER, this.connectionConfig.userURL(uid), doc)
    }
    let errmsg = `Update user parameter error - you must specify a valid user id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_USER, errmsg)),
    )
}

WOQLClient.prototype.deleteUser = function(uid) {
    if (uid) {
        return this.dispatch(CONST.DELETE_USER, this.connectionConfig.userURL(uid))
    }
    let errmsg = `Delete user parameter error - you must specify a valid user id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_USER, errmsg)),
    )
}

WOQLClient.prototype.createOrganization = function(oid, doc) {
    if (oid) {
        return this.dispatch(
            CONST.CREATE_ORGANIZATION,
            this.connectionConfig.organizationURL(),
            doc,
        )
    }
    let errmsg = `Create organization parameter error - you must specify a valid organization id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_ORGANIZATION, errmsg)),
    )
}

WOQLClient.prototype.getOrganization = function(oid) {
    return this.dispatch(CONST.READ_ORGANIZATION, this.connectionConfig.organizationURL(oid))
}

WOQLClient.prototype.updateOrganization = function(oid, doc) {
    if (oid) {
        return this.dispatch(
            CONST.CREATE_ORGANIZATION,
            this.connectionConfig.organizationURL(oid),
            doc,
        )
    }
    let errmsg = `Update organization parameter error - you must specify a valid organization id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_ORGANIZATION, errmsg)),
    )
}


WOQLClient.prototype.deleteOrganization = function(oid) {
    if (uid) {
        return this.dispatch(CONST.DELETE_ORGANIZATION, this.connectionConfig.organizationURL(oid))
    }
    let errmsg = `Delete organization parameter error - you must specify a valid organization id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_ORGANIZATION, errmsg)),
    )
}

WOQLClient.prototype.getRoles = function(uid, orgid, dbid) {
    let doc = {}
    if(typeof uids == 'object' && !Array.isArray(uids)){
        doc = uids
    }
    if (uid) {
        doc['agent_name'] = uid
    }
    if (dbid) {
        doc['database_name'] = dbid
    }
    if (orgid) {
        doc['organization_name'] = orgid
    }
    return this.dispatch(CONST.GET_ROLES, this.connectionConfig.rolesURL(), doc)
}

WOQLClient.prototype.updateRoles = function(uids, orgid, dbid, actions) {
    let doc = {}
    if(typeof uids == 'object' && !Array.isArray(uids)){
        doc = uids
    }
    else {
        if (uids) {
            doc['agent_names'] = uids
        }
        if (dbid) {
            doc['database_name'] = dbid
        }
        if (orgid) {
            doc['organization_name'] = orgid
        }
        doc['actions'] = actions || []
    }
    return this.dispatch(CONST.UPDATE_ROLES, this.connectionConfig.updateRolesURL(), doc)
}



module.exports = WOQLClient
