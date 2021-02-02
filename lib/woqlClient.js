const CONST = require('./const')
const DispatchRequest = require('./dispatchRequest')
const ErrorMessage = require('./errorMessage')
const ConnectionCapabilities = require('./connectionCapabilities')
const ConnectionConfig = require('./connectionConfig')
const WOQL = require('./woql')

/**
 * @file Javascript WOQL client object
 * @license Apache Version 2
 * @description Client for accessing the Terminus DB API
 * @constructor
 * @param {string} serverUrl - the terminusdb server url
 * @param {ParamsObj} [params] - an object with the connection parameters
 */

function WOQLClient(serverUrl, params) {
    // current connection context variables
    this.connectionConfig = new ConnectionConfig(serverUrl, params)
    // db metadata and capabilities for currently connected server
    this.connection = new ConnectionCapabilities()
}

WOQLClient.CONST = CONST

/**
 * @description Creates a copy of the current client with a new connection Config
 * @returns {WOQLClient}
 */
WOQLClient.prototype.copy = function() {
    let other = new WOQLClient(this.server())
    other.connection = this.connection //keep same connection meta data - shared by copy
    other.connectionConfig = this.connectionConfig.copy() //new copy of current connection data
    return other
}

/**
 * @description Gets the current connected server url
 * it can only be set creating a new WOQLCLient instance
 * @returns {string}
 */
WOQLClient.prototype.server = function() {
    return this.connectionConfig.serverURL()
}

/**
 * @description Gets the server api url
 * @returns {string}
 */
WOQLClient.prototype.api = function() {
    return this.connectionConfig.apiURL()
}

/**
 * @description Sets/Gets the current organization id
 * @param {string | boolean} orgId
 * @returns {string | boolean}
 */
WOQLClient.prototype.organization = function(orgId) {
    if (typeof orgId !== 'undefined') {
        return this.connectionConfig.setOrganization(orgId)
    }
    return this.connectionConfig.organization()
}

/**
 * @description Gets the current user object as returned by the connect capabilities response
 * user has fields: [id, name, notes, author]
 * @returns {Object}
 */
WOQLClient.prototype.user = function() {
    return this.connection.getUserObj()
}

/**
 * @description Gets the current user object as returned by the connect capabilities response
 * user has fields: [id, name, notes, author]
 * @returns {Object}
 */
//KEVIN maybe
WOQLClient.prototype.userInfo = function() {
    return this.connection.getUserObj()
}

/**
 * @description Gets the current user id from the connection capabilities obj
 * @returns {string}
 */
WOQLClient.prototype.userId = function() {
    let userObj = this.user()
    return userObj.id
}
//KEVIN old function
WOQLClient.prototype.uid = function() {
    let u = this.user()
    return u.id
}

/**
 * @desription Gets the user's organization id
 * @returns {string}
 */

WOQLClient.prototype.userOrganization = function() {
    return this.uid()
}

//old function
WOQLClient.prototype.user_organization = function() {
    return this.uid()
}

/**
 * @description Gets/Sets the list of databases that the user has access to (has roles for)
 * @param {array} dbList
 * @returns {array}
 */
WOQLClient.prototype.databases = function(dbList) {
    if (dbList) this.connection.setDatabaseList(dbList)
    return this.connection.getDatabaseList()
}

/**
 * @description Gets the database's details
 * @param {string} [dbId] - the datbase id
 * @param {string} [orgId] - the database organization
 * @returns {object} - the database description object //getDatabaseInfo
 */
WOQLClient.prototype.databaseInfo = function(dbId, orgId) {
    dbId = dbId || this.db()
    orgId = orgId || this.organization()
    return this.connection.getDatabaseObj(dbId, orgId)
}

/**
 * @description Gets the database's details
 * @param {string} [dbId]
 * @param {string} [orgId]
 * @returns {object}
 */
//OLD function
WOQLClient.prototype.get_database = function(dbId, orgId) {
    dbId = dbId || this.db()
    orgId = orgId || this.organization()
    return this.connection.getDatabaseObj(dbId, orgId)
}

/**
 * @description Sets / Gets the current database
 * @param {string} [dbId]
 * @returns {string|boolean} - the current database or false
 */
WOQLClient.prototype.db = function(dbId) {
    if (typeof dbId !== 'undefined') {
        this.connectionConfig.setDB(dbId)
    }
    return this.connectionConfig.db()
}

/**
 * @description Sets the _system database as current database
 */
WOQLClient.prototype.setSystemDatabase = function() {
    this.db(this.connectionConfig.system_db)
}
/**
 *
 */
//OLD FUNCTION
WOQLClient.prototype.set_system_db = function() {
    this.db(this.connectionConfig.system_db)
}

/**
 * @description Sets / gets the current repository id
 * @param {RepoType | string} [repoId] - default value is local
 */
WOQLClient.prototype.repo = function(repoId) {
    if (typeof repoId != 'undefined') {
        this.connectionConfig.setRepo(repoId)
    }
    return this.connectionConfig.repo()
}

/**
 * @description Sets / gets the current branch id
 * @param {string} [branchId] default value is main
 */
WOQLClient.prototype.checkout = function(branchId) {
    if (typeof branchid != 'undefined') {
        this.connectionConfig.setBranch(branchId)
    }
    return this.connectionConfig.branch()
}

/**
 * @description Sets / gets the current ref pointer (pointer to a commit within a branch)
 * Reference ID or Commit ID are unique hashes that are created whenever a new commit is recorded
 * @param {string} [refId] - the reference ID or commit ID
 * @returns {string|boolean}
 */
WOQLClient.prototype.ref = function(refId) {
    if (typeof refId != 'undefined') {
        this.connectionConfig.setRef(refId)
    }
    return this.connectionConfig.ref()
}

/**
 * @description Sets/Gets set the database basic connection credential
 * @param {string} key  required
 * @param {string} user optional default value is admin
 */
//WOQLClient.prototype.local_auth = function(key, type, user) {
//old function
WOQLClient.prototype.local_auth = function(key, type, user) {
    if (typeof key !== 'undefined') {
        this.connectionConfig.setLocalAuth(key, type, user)
    }
    return this.connectionConfig.localAuth()
}

/**
 * @description Sets/Gets set the database basic connection credential
 * @param {CredentialObj} [newCredential]
 * @returns {CredentialObj | boolean}
 */
WOQLClient.prototype.localAuth = function(newCredential) {
    if (typeof key !== 'undefined') {
        this.connectionConfig.setLocalAuth(newCredential)
    }
    return this.connectionConfig.localAuth()
}

/**
 * @description Sets/Gets the jwt token for authentication
 * @param {string} jwt
 * @param {string} user
 */
//old function
WOQLClient.prototype.remote_auth = function(authInfo) {
    if (typeof authInfo != 'undefined') {
        this.connectionConfig.setRemoteAuth(authInfo)
    }
    return this.connectionConfig.remoteAuth()
}

/**
 * @description Sets/Gets the jwt token for authentication
 * @param {CredentialObj} [newCredential]
 * @returns {CredentialObj}
 */
WOQLClient.prototype.remoteAuth = function(newCredential) {
    if (typeof newCredential !== 'undefined') {
        this.connectionConfig.setRemoteAuth(newCredential)
    }
    return this.connectionConfig.remoteAuth()
}

/**
 * @description Gets/Sets the commit log author id
 * @param {string} [aName] - the author name
 * @returns {string}
 */
WOQLClient.prototype.author = function(aName) {
    if (aName) {
        this.connection.user.author = aName
    }
    return this.connection.author() || this.connection.user.id || this.connectionConfig.localUser()
}

/**
 * @description You can update multiple connection parameter
 * @param {ParamsObj} params - a object with connection params
 */
WOQLClient.prototype.changeConnectionParams = function(params) {
    this.connectionConfig.update(params)
}
//old Function
WOQLClient.prototype.set = function(params) {
    this.connectionConfig.update(params)
}

/**
 * @typedef {"commits"|"meta"|"branch"|"ref"|"repo"|"db"} ResourceType
 */

/**
 * @description Returns a resource identifier string (for passing to WOQL.using)
 * of the current context for "commits" "meta" "branch" and "ref" special resources
 * @param {ResourceType} resourceType - the type of resource
 * @param {string} [resourceId] - the resource id
 * @returns {string}
 */
WOQLClient.prototype.resource = function(resourceType, resourceId) {
    let base = `${this.organization()}/${this.db()}/`
    if (resourceType === 'db') return base
    if (resourceType === 'meta') return `${base}_meta`
    base += `${this.repo()}`
    if (resourceType === 'repo') return base
    if (resourceType === 'commits') return `${base}/_commits`
    resourceId = resourceId || (resourceType === 'ref' ? this.ref() : this.checkout())
    if (resourceType === 'branch') return `${base}/branch/${resourceId}`
    if (resourceType === 'ref') return `${base}/commit/${resourceId}`
}

/**
 * @public
 * @description Connect to a Terminus server at the given URI with an API key
 * Stores the system:ServerCapability document returned
 * in the connection register which stores, the url, key, capabilities,
 * and database meta-data for the connected server
 * this.connectionConfig.server will be used if present,
 * or the promise will be rejected.
 * @param {ParamsObj} [params] - TerminusDB Server connection parameters
 * @returns {Promise} - the connection capabilities response object or an error object
 */
///KEVIN fail fast If we throw an error at the constructor we can not arrive here
WOQLClient.prototype.connect = function(params) {
    if (params) this.connectionConfig.update(params)
    if (!this.server()) {
        let message = 'we need a valid server URL'
        return Promise.reject(
            new URIError(ErrorMessage.getInvalidURIMessage(message, CONST.CONNECT)),
        )
    }
    // unset the current server setting until successful connect
    return this.dispatch(CONST.CONNECT, this.api()).then(response => {
        this.connection.setCapabilities(response)
        return response
    })
}

/**
 * @typedef {Object} DbDetails
 * @property {string} [organization] - the db organization id
 * @property {string} id - The database identification name
 * @property {string} label - "Textual DB Name"
 * @property {string} [comment] - "Text description of DB"
 * @property {string} sharing
 * @property {string} [icon] - The database's icon
 * @property {object} prefixes - {scm: "http://url.to.use/for/scm", doc: "http://url.to.use/for/doc"}
 * @property {boolean} [schema] - if set to true, a schema graph will be created
 */

/**
 * @description Create a TerminusDB Database in the connected server
 * @param {string} dbId - the local id to give the db
 * @param {DbDetails} dbDetails - JSON containing details about the database to be created:
 * @param {string} [orgId] - optional organization id - if absent default local organization id is used
 * @returns {Promise}
 * @public
 */
//maybe we can pass only the detailObj it is have inside the dbid and org
WOQLClient.prototype.createDatabase = function(dbId, dbDetails, orgId) {
    orgId = orgId || this.user_organization()
    this.organization(orgId)
    if (dbId) {
        this.db(dbId)
        console.log('____remoteURL_BFF__', this.connectionConfig.dbURL())
        return this.dispatch(CONST.CREATE_DATABASE, this.connectionConfig.dbURL(), dbDetails)
    }
    let errmsg = `Create database parameter error - you must specify a valid database id  - ${dbId} is invalid`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_DATABASE, errmsg)),
    )
}

/**
 * @description Delete a Database (must first be connected to db)
 * @param {string} dbId - the local id to give the db
 * @param {string} [orgId] - organization id - if absent current organization id is used
 * @param {boolean} [force]
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.deleteDatabase = function(dbId, orgId, force) {
    orgid = orgId || this.organization()
    this.organization(orgId)
    let payload = force ? {force: true} : null
    if (dbId && this.db(dbId)) {
        return this.dispatch(CONST.DELETE_DATABASE, this.connectionConfig.dbURL(), payload)
    }
    let errmsg = `Delete database parameter error - you must specify a valid database id  - ${dbId} is invalid`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_DATABASE, errmsg)),
    )
}

/**
 *@typedef {inference | schema | instance} GraphType
 */

/**
 * @description Creates a new graph in the current database context
 * @param {GraphType} graphType - type of graph
 * @param {string} graphId  - local id of graph | main | mygraphName | * |
 * @param {string} commitMsg  - Textual message describing the reason for the update
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.createGraph = function(graphType, graphId, commitMsg) {
    if (
        graphType &&
        ['inference', 'schema', 'instance'].indexOf(graphType) !== -1 &&
        graphId &&
        commitMsg
    ) {
        let commit = this.generateCommitInfo(commitMsg)
        return this.dispatch(
            CONST.CREATE_GRAPH,
            this.connectionConfig.graphURL(graphType, graphId),
            commit,
        )
    }
    let errmsg = `Create graph parameter error - you must specify a valid type (inference, instance, schema), graph id and commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_GRAPH, errmsg)),
    )
}

/**
 * @description Deletes a graph from the current database context
 * @param {GraphType} graphType - type of graph     | inference | schema | instance |
 * @param {string} graphId - local id of graph | main | mygraphName | * |
 * @param {string} commitMsg - Textual message describing the reason for the update
 */
WOQLClient.prototype.deleteGraph = function(graphType, graphId, commitMsg) {
    if (graphType && ['inference', 'schema', 'instance'].indexOf(type) != -1 && graphId) {
        let commit = this.generateCommitInfo(commitMsg)
        return this.dispatch(
            CONST.DELETE_GRAPH,
            this.connectionConfig.graphURL(graphType, graphType),
            commit,
        )
    }
    let errmsg = `Delete graph parameter error - you must specify a valid type (inference, instance, schema), graph id and commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_GRAPH, errmsg)),
    )
}

/**
 * @description Retrieves the contents of the specified graph as turtle
 * @param {GraphType} graphType - Type of graph (instance|schema|inference)
 * schema get the database schema in owl
 * instance get all the database documents data in owl format
 * inference get all the constraints schema in owl
 * @param {string} graphId - TerminusDB Graph name "main" is the default value
 * @returns {Promise} - with result contents being the schema in owl turtle encoding
 *
 */
WOQLClient.prototype.getTriples = function(graphType, graphId) {
    if (graphType && graphId) {
        return this.dispatch(
            CONST.GET_TRIPLES,
            this.connectionConfig.triplesURL(graphType, graphId),
        )
    }
    let errmsg = `Get triples parameter error - you must specify a valid graph type (inference, instance, schema), and graph id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET_TRIPLES, errmsg)),
    )
}

/**
 * @description Replaces the contents of a graph with the passed turtle
 * @param {string} graphType type of graph  |instance|schema|inference|
 * @param {string} graphId TerminusDB Graph ID to update, main is the default value
 * @param {string} turtle is a valid set of triples in turtle format (OWL)
 * @param {string} commitMsg Textual message describing the reason for the update
 * @returns {Promise}
 */
WOQLClient.prototype.updateTriples = function(graphType, graphId, turtle, commitMsg) {
    if (commitMsg && turtle && graphId && graphType) {
        let commit = this.generateCommitInfo(commitMsg)
        commit.turtle = turtle
        return this.dispatch(
            CONST.UPDATE_TRIPLES,
            this.connectionConfig.triplesURL(graphType, graphId),
            commit,
        )
    }
    let errmsg = `Update triples parameter error - you must specify a valid graph id, graph type, turtle contents and commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_TRIPLES, errmsg)),
    )
}

/**
 * @description Appends the passed turtle to the contents of a graph
 * @param {string} graphType type of graph  |instance|schema|inference|
 * @param {string} graphId TerminusDB Graph ID to update, main is the default value
 * @param {string} turtle is a valid set of triples in turtle format (OWL)
 * @param {string} commitMsg Textual message describing the reason for the update
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.insertTriples = function(graphType, graphId, turtle, commitMsg) {
    if (commitMsg && turtle && graphId && graphType) {
        let commit = this.generateCommitInfo(commitMsg)
        commit.turtle = turtle
        return this.dispatch(
            CONST.INSERT_TRIPLES,
            this.connectionConfig.triplesURL(graphType, graphId),
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
 * @param {array} csvPathList - is an array of csv file names with file path
 * @param {string} commitMsg - Textual message describing the reason for the update
 * @param {string} graphType - type of graph  |instance|schema|inference|
 * @param {string} graphId - TerminusDB Graph ID to update, main is the default value
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.insertCSV = function(csvPathList, commitMsg, graphType, graphId) {
    if (commitMsg && csvPathList) {
        let commit = this.generateCommitInfo(commitMsg)
        const formData = new FormData()
        csvPathList.map(item => {
            if (typeof item.name === 'string') {
                formData.append(item.name, item)
            } else {
                let name = new String(item).substring(item.lastIndexOf('/') + 1)
                var fr = new File([name], item, {type: 'csv/text'})
                formData.append(name, fr)
            }
        })
        formData.append('payload', JSON.stringify(commit))
        return this.dispatch(
            CONST.ADD_CSV,
            this.connectionConfig.csvURL(graphType, graphId),
            formData,
        )
    }
}

/**
 * Updates the contents of the specified path with a csv, creating the appropriate
 * diff object as the commit.
 *
 * @param {array} csvPathList Array csvs to upload
 * @param {string} commitMsg Textual message describing the reason for the update
 * @param {string} graphType type of graph  |instance|schema|inference|
 * @param {string} graphId TerminusDB Graph ID to update, main is the default value
 * @returns {Promise}
 */
WOQLClient.prototype.updateCSV = function(csvPathList, commitMsg, graphType, graphId) {
    if (commit_msg && csv_path) {
        let commit = this.generateCommitInfo(commit_msg)
        const formData = new FormData()
        csv_path.map(item => {
            formData.append(item.fileToBeUpdated, item.updateWith)
        })
        formData.append('payload', JSON.stringify(commit))
        return this.dispatch(
            CONST.UPDATE_CSV,
            this.connectionConfig.csvURL(graphType, graphId),
            formData,
        )
    }
}

/**
 * @description Retrieves the contents of the specified graph as a CSV
 * @param {string} csvName Name of csv to dump from the specified database to extract
 * @param {string} download flag to download csv file
 * @param {string} [graphType] Type of graph (instance|schema|inference)
 * @param {string} [graphId] identifier.
 * @returns {Promise} An API success message
 *
 */
//KEVIN DO WE NEED THE VARIABLES? we don't use download at all and we don't use graphType, graphId
//in the sub function
WOQLClient.prototype.getCSV = function(csvName, download, graphType, graphId) {
    let options = {},
        filePath
    options.name = csvName
    return this.dispatch(CONST.GET_CSV, this.connectionConfig.csvURL(graphType, graphId), options)
}

/**
 * Deletes a csv into the specified path
 *
 * @param {array} csvName is an array of csv file names
 * @param {string} commitMsg Textual message describing the reason for the delete
 * @returns {Promise} the rest api call results
 */
WOQLClient.prototype.deleteCSV = function(csvName, commitMsg) {
    if (commitMsg && csvName) {
        let commit = this.generateCommitInfo(commitMsg)
        let options = {},
            filePath
        options.name = csvName
        options.commit_info = commit.commit_info
        return this.dispatch(CONST.DELETE_CSV, this.connectionConfig.csvURL(), options).then(
            results => {
                return results
            },
        )
    }
}

/**
 * @description Sends a message to the server
 * @param {string} message - textual string
 * @param {string} [pathname] - a server path to send the message to
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.message = function(message, pathname) {
    const url = this.api()
    url += pathname ? this.api() + pathname : 'message'
    return this.dispatch(CONST.MESSAGE, url, message).then(response => {
        return response
    })
}

/**
 * @description sends an action to the server
 * @param {string} actionName - structure of the action
 * @param {object} [payload] - a request body call
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
//KEVIN we need this???? what it really does
WOQLClient.prototype.action = function(actionName, payload) {
    const url = this.api() + 'action/' + actionName
    return this.dispatch(CONST.ACTION, url, payload).then(response => {
        return response
    })
}

/**
 * @description Gets terminusdb server info
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
//KEVIN
WOQLClient.prototype.info = function() {
    const url = this.api() + 'info'
    return this.dispatch(CONST.INFO, url).then(response => {
        return response
    })
}

/**
 * KEVIN
 * @description Executes a WOQL query on the specified database and returns the results
 * @param {WOQLQuery} woql is a "woql query object"
 * @param {string} [commitMsg] - if the query contains any updates, it should include a textual message describing the reason for the update
 * @param {boolean} [allWitnesses] - //KEVIN
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.query = function(woql, commitMsg, allWitnesses) {
    allWitnesses = allWitnesses || false
    commitMsg = commitMsg || 'Commit generated with javascript client without message'
    if (woql && woql.json && (!woql.containsUpdate() || commitMsg)) {
        woql.context(
            this.connection.getContextForOutboundQuery(woql, this.db(), this.organization()),
        )
        let doql = woql.containsUpdate() ? this.generateCommitInfo(commitMsg) : {}
        doql.query = woql.json()
        if (allWitnesses) doql.all_witnesses = true
        return this.dispatch(CONST.WOQL_QUERY, this.connectionConfig.queryURL(), doql)
    }
    let errmsg = `WOQL query parameter error`
    if (woql && woql.json && woql.containsUpdate() && !commitMsg) {
        errmsg += ' - you must include a textual commit message to perform this update'
    } else {
        errmsg += ' - you must specify a valid WOQL Query'
    }
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.WOQL_QUERY, errmsg)),
    )
}

//KEVIN sourceFree it is a string or a boolean
/**
 * @description Creates a branch starting from the current branch
 * @param {string} newBranchId - local identifier of the new branch
 * @param {boolean} sourceFree - if the query contains any updates, it should include a textual message describing the reason for the update
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.branch = function(newBranchId, sourceFree) {
    if (newBranchId) {
        let source = this.ref()
            ? {origin: `${this.organization()}/${this.db()}/${this.repo()}/commit/${this.ref()}`}
            : {
                  origin: `${this.organization()}/${this.db()}/${this.repo()}/branch/${this.checkout()}`,
              }

        if (sourceFree && sourceFree === true) {
            source = {}
        }
        return this.dispatch(CONST.BRANCH, this.connectionConfig.branchURL(newBranchId), source)
    }
    let errmsg = `Branch parameter error - you must specify a valid new branch id`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)))
}

/**
 *@typedef {Object} RemoteRepoDetails - {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"}
 *@property {string} [remote] - remote server url
 *@property {string} remote_branch - remote branch name
 *@property {string} [author]   - if it is undefined it get the current author
 *@property  {string} [message] - the update commit message
 *
 */

/**
 * @description Pull updates from a remote repository to the current db and merges them
 * @param {RemoteRepoDetails} [remoteSourceRepo] - database source repo -
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.pull = function(remoteSourceRepo) {
    let rc_args = this.prepareRevisionControlArgs(remoteSourceRepo)
    if (rc_args && rc_args.remote && rc_args.remote_branch) {
        return this.dispatch(CONST.PULL, this.connectionConfig.pullURL(), rc_args)
    }
    let errmsg = `Pull parameter error - you must specify a valid remote source and branch to pull from`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.PULL, errmsg)))
}

/**
 * @description Fetches updates from a remote repository to the current db
 * @param {string} remoteId - if of the remote to fetch (eg: 'origin')
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.fetch = function(remoteId) {
    return this.dispatch(CONST.FETCH, this.connectionConfig.fetchURL(remoteId))
}

/**
 * @description Pushes changes to the current database / branch to a remote repo
 * @param {RemoteRepoDetails} remoteTargetRepo - target repo details
 * {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"}
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.push = function(remoteTargetRepo) {
    console.log('__PUSH_ACTION____', remoteTargetRepo)
    let rc_args = this.prepareRevisionControlArgs(remoteTargetRepo)
    if (rc_args && rc_args.remote && rc_args.remote_branch) {
        return this.dispatch(CONST.PUSH, this.connectionConfig.pushURL(), rc_args)
    }
    let errmsg = `Push parameter error - you must specify a valid remote target`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.PUSH, errmsg)))
}

/**
 * @description Rebases this branch from the remote one (note: the "remote" repo lives in the local db)
 * @param {object} rebaseSource
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.rebase = function(rebaseSource) {
    console.log('__REBASE_ACTION____', rebase_source)
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
 * @description Reset the current branch HEAD to the specified commit path
 * @param {string} commitPath - The commit path to set the current branch to
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.reset = function(commitPath) {
    return this.dispatch(CONST.RESET, this.connectionConfig.resetURL(this.checkout()), {
        commit_descriptor: commitPath,
    })
}

/**
 * @typedef {Object} CloneSourceDetails
 * @param {string} remote_url - the remote db source url
 * @param {string} [label]
 * @param {string} [comment]
 */

/**
 * @description Clones a remote repo and creates a local copy
 * @param {CloneSourceDetails} cloneSource - json object with remote_url, label, comment, (URL of thing) to be cloned (terminus-db)
 * @param {string} newDbId - id of the new repo to create
 * @param {string} [orgId]
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.clonedb = function(cloneSource, newDbId, orgId) {
    orgId = orgId || this.user_organization()
    this.organization(orgId)
    let rc_args = this.prepareRevisionControlArgs(cloneSource)
    if (newDbId && rc_args && rc_args.remote_url) {
        return this.dispatch(CONST.CLONE, this.connectionConfig.cloneURL(newDbId), rc_args)
    }
    let errmsg = `Clone parameter error - you must specify a valid id for the cloned database`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)))
}

/**
 * Common request dispatch function
 * @property {string} action - the action name
 * @property {string} apiUrl - the server call endpoint
 * @property {object} [payload] - the post body
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.dispatch = function(action, apiUrl, payload) {
    if (!apiUrl) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    action,
                    this.connectionConfig.connection_error,
                ),
            ),
        )
    }
    return DispatchRequest(apiUrl, action, payload, this.local_auth(), this.remote_auth())
}

/**
 * @description Generates the json structure for commit messages
 * @param {string} msg - textual string describing reason for the change
 * @param {string} [author] - optional author id string - if absent current user id will be used
 * @returns {object}
 */
WOQLClient.prototype.generateCommitInfo = function(msg, author) {
    if (!author) {
        author = this.author()
    }
    let ci = {commit_info: {author: author, message: msg}}
    return ci
}

/**
 * @description Adds an author string (from the user object returned by connect) to the commit message.
 * @param {object} [rc_args]
 * @returns {object | boolean}
 */
//KEVIN we use only internal maybe we can rename like _revision_controll...
WOQLClient.prototype.prepareRevisionControlArgs = function(rc_args) {
    if (!rc_args || typeof rc_args !== 'object') return false
    if (!rc_args.author) rc_args.author = this.author()
    return rc_args
}

/**
 * @description Loads prefixes for each database connected to.
 * add the prefix at the connection database list
 * @param {array} dbs - the user database list
 * @returns {array} - the list of the databases
 */
WOQLClient.prototype._load_db_prefixes = function(dbs) {
    dbs = dbs || this.databases()
    let parts = []
    for (var i = 0; i < dbs.length; i++) {
        let using = `${dbs[i].organization}/${dbs[i].id}/local/_commits`
        let wvars = ['Prefix_' + i, 'IRI_' + i, 'Prefix Pair IRI_' + i]
        parts.push(WOQL.lib().prefixes(false, wvars, using))
    }
    let temp = this.copy()
    temp.set_system_db()
    let q = WOQL.or(...parts)
    return temp.query(q).then(results => {
        if (results && results.bindings && results.bindings.length) {
            for (var i = 0; i < results.bindings.length; i++) {
                let row = results.bindings[i]
                for (var j = 0; j < dbs.length; j++) {
                    let ndb = dbs[j]
                    if (!ndb.prefix_pairs) {
                        ndb.prefix_pairs = {}
                    }
                    if (
                        row['Prefix_' + j] &&
                        row['Prefix_' + j]['@value'] &&
                        row['IRI_' + j]['@value']
                    ) {
                        ndb.prefix_pairs[row['Prefix_' + j]['@value']] = row['IRI_' + j]['@value']
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

//KEVIN we can remove it Class Frame URL don't get a parameters
/**
 * Retrieves a class frame for the specified class
 *
 * @param {string} docType is the URL / ID of a document class that exists in the database schema
 * @returns {Promise}
 */
WOQLClient.prototype.getClassFrame = function(docType) {
    if (docType) {
        opts = {class: docType}
        return this.dispatch(CONST.CLASS_FRAME, this.connectionConfig.classFrameURL(docType), opts)
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
 * @description get all the database information from the remote server
 * @returns {Promise} - server response / error
 */

//KEVIN it is similar at the other as name
WOQLClient.prototype.getDatabase = function() {
    //console.log('___DB__URL__', this.connectionConfig.dbURL())
    return this.dispatch(CONST.READ_DATABASE, this.connectionConfig.dbURL())
}

/**
 * @description update the database details
 * @param {object} dbDoc - an object that describe the database details
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.updateDatabase = function(dbDoc) {
    let dbid = dbDoc.id || this.db()
    let org = dbDoc.organization || this.organization()
    return this.createDatabase(dbid, dbDoc, org)
}

/**
 * Gets the list of organizations that the user belongs to (has roles for)
 */
//maybe we not need this two
WOQLClient.prototype.user_organizations = function() {
    return this.connection.get_organizations()
}

WOQLClient.prototype.get_organization = function(resname) {
    return this.connection.get_organization(resname)
}

/**
 * @description Gets/Sets the list of organizations that the user belongs to (has roles for)
 * @param {array} orgList - list of organization name
 * @returns {array}
 */
WOQLClient.prototype.organizations = function(res) {
    if (res) {
        this.connection.set_organizations(res)
    }
    return this.connection.get_organization()
}

/**
 * @description Check from the capabilities object if the action is permitted
 * @param {string} action - the action name
 * @param {string} resource - the name of the resource (databaseName or organizationName)
 * @returns {boolean}
 */
//KEVIN
WOQLClient.prototype.action_permitted = function(action, resource) {
    return this.connection.actions_permitted(action, resource)
}
/*let doc = {
    "agent_name" : deets.uid,
    "password" : deets.password,
    "user_identifier" : deets.commitlog,
    "comment" : deets.notes 
 }*/

/**
 * @description For creating an user
 * @param {string} userId - the userId
 * @param {object} userDoc - the user's object description
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */

//KEVIN it  is for create an user??
WOQLClient.prototype.createUser = function(userId, userDoc) {
    if (userId) {
        return this.dispatch(CONST.CREATE_USER, this.connectionConfig.userURL(), userDoc)
    }
    let errmsg = `Create user parameter error - you must specify a valid user id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_USER, errmsg)),
    )
}

/**
 * @description Get the logged user details.
 * @param {string} userId
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.getUser = function(userId) {
    return this.dispatch(CONST.READ_USER, this.connectionConfig.userURL(uid))
}

/**
 * @description Update an user from the database.
 * @param {string} userId
 * @param {object} userDoc - User Object details
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.updateUser = function(userId, userDoc) {
    if (userId) {
        return this.dispatch(CONST.UPDATE_USER, this.connectionConfig.userURL(userId), userDoc)
    }
    let errmsg = `Update user parameter error - you must specify a valid user id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_USER, errmsg)),
    )
}

/**
 * @description Delete an user from the database Only a user with DBA authority can delete a user.
 * @param {string} userId
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.deleteUser = function(userId) {
    if (userId) {
        return this.dispatch(CONST.DELETE_USER, this.connectionConfig.userURL(userId))
    }
    let errmsg = `Delete user parameter error - you must specify a valid user id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_USER, errmsg)),
    )
}

/**
 * @description Create a new organization for the registered user
 * @param {string} orgId - the organization id
 * @param {object} orgDoc - An object that describe the organization's details
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.createOrganization = function(orgId, orgDoc) {
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

/**
 * @description Gets all the information about the given organization
 * @param {string} orgId - the organization id
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */

//KEVIN description get all users belonging to an organization???
WOQLClient.prototype.getOrganization = function(orgId) {
    return this.dispatch(CONST.READ_ORGANIZATION, this.connectionConfig.organizationURL(orgId))
}

/**
 * @description only if you have the permission you can delete an organization
 *  Before you can delete the organization, you must first remove all accounts and databases
 *  from the organization
 * @param {string} orgId - the organization id
 * @param {object} orgDoc - the organization details description
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.updateOrganization = function(orgId, orgDoc) {
    if (oid) {
        return this.dispatch(
            CONST.CREATE_ORGANIZATION,
            this.connectionConfig.organizationURL(orgId),
            orgDoc,
        )
    }
    let errmsg = `Update organization parameter error - you must specify a valid organization id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_ORGANIZATION, errmsg)),
    )
}

//KEVIN CHECK THE DESCRIPTION
/**
 * @description only if you have the permission you can delete an organization
 *  Before you can delete the organization, you must first remove all accounts and databases
 *  from the organization
 * @param {string} orgId - the organization id
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.deleteOrganization = function(orgId) {
    if (orgId) {
        return this.dispatch(
            CONST.DELETE_ORGANIZATION,
            this.connectionConfig.organizationURL(orgId),
        )
    }
    let errmsg = `Delete organization parameter error - you must specify a valid organization id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_ORGANIZATION, errmsg)),
    )
}

//KEVIN getrole it is not a get in the backend
//no double behavior Can we remove one?
/**
 * @param {string} userId - the user id
 * @param {string} [orgId] - the organization id
 * @param {string} [dbId] - the dbId
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.getRoles = function(userId, orgId, dbId) {
    let payload = {}
    /*if (typeof uids == 'object' && !Array.isArray(uids)) {
        doc = uids
    }*/

    if (userId) {
        payload['agent_name'] = userId
    }
    if (dbId) {
        payload['database_name'] = dbId
    }
    if (orgId) {
        payload['organization_name'] = orgId
    }
    return this.dispatch(CONST.GET_ROLES, this.connectionConfig.rolesURL(), payload)
}

/**
 * @typedef {Object} RolesObj
 * @property {string} agent_name -  the Authorization connection's type
 * @property {string} [database_name] - the user id | I don't need the user with the jwt token
 * @property {string} [organization_name] -  the connection key
 * @property {array} [actions] - list of roles
 * @property {string} [invitation] -
 *
 * @description Change the user role for existing users in your organisation, including your own
 * @param {RolesObj} newRolesObj
 * @returns {Promise} - A promise that returns the call response object, or an Error if rejected.
 */
//KEVIN this function
//we need the invitation
WOQLClient.prototype.updateRoles = function(newRolesObj) {
    return this.dispatch(CONST.UPDATE_ROLES, this.connectionConfig.updateRolesURL(), newRolesObj)
}

/*WOQLClient.prototype.updateRoles = function(uids, orgid, dbid, actions) {
    let doc = {}
    if (typeof uids == 'object' && !Array.isArray(uids)) {
        doc = uids
    } else {
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
}*/

module.exports = WOQLClient
