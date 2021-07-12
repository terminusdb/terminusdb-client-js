////@ts-check
const typedef = require('./typedef')
const CONST = require('./const')
const DispatchRequest = require('./dispatchRequest')
const ErrorMessage = require('./errorMessage')
//const ConnectionCapabilities = require('./connectionCapabilities')
const ConnectionConfig = require('./connectionConfig')
const WOQL = require('./woql')
const WOQLQuery = require('./query/woqlBuilder')
const { default: axios } = require('axios')

/**
 * @license Apache Version 2
 * @module WOQLClient
 * @description The core functionality of the TerminusDB javascript client is defined in the WOQLClient class - in the woqlClient.js file.
 * This class provides methods which allow you to directly get and set all of the configuration and API endpoints of the client.
 * The other parts of the WOQL core - connectionConfig.js and connectionCapabilities.js - are used by the client to store internal state - they should never have to be accessed directly.
 * For situations where you want to communicate with a TerminusDB server API, the WOQLClient class is all you will need.
 * @constructor
 * @param {string} serverUrl - the terminusdb server url
 * @param {typedef.ParamsObj} [params] - an object with the connection parameters
 * @example
 * const client = new TerminusClient.WOQLClient(SERVER_URL)
 * await client.connect(params)
 * client.db("test")
 * client.checkout("dev")
 * const turtle = await client.getTriples("schema", "main")
 * //The client has an internal state which defines what
 * //organization / database / repository / branch / ref it is currently attached to
 */

function WOQLClient(serverUrl, params) {
    // current connection context variables
    this.connectionConfig = new ConnectionConfig(serverUrl, params)
    // db metadata and capabilities for currently connected server
    //this.connection = new ConnectionCapabilities()
    this.databaseList = []
}

/**
 * 
 * @param {object} customHeaders 
 * @returns 
 */

WOQLClient.prototype.customHeaders = function(customHeaders) {
    if (customHeaders) this._customHeaders = customHeaders
    else return this._customHeaders
}

WOQLClient.CONST = CONST

/**
 * creates a copy of the client with identical internal state and context
 * useful if we want to change context for a particular API call without changing
 * the current client context
 * @returns {WOQLClient}  new client object with identical state to original but which can be manipulated independently
 * @example
 * let newClient = client.copy()
 */
WOQLClient.prototype.copy = function() {
    let other = new WOQLClient(this.server())
    //other.connection = this.connection //keep same connection meta data - shared by copy
    other.connectionConfig = this.connectionConfig.copy() //new copy of current connection data
    other.databaseList = this.databaseList
    return other
}

/**
 * Gets the current connected server url
 * it can only be set creating a new WOQLCLient instance
 * @returns {string}
 */
WOQLClient.prototype.server = function() {
    return this.connectionConfig.serverURL()
}

/**
 * Retrieve the URL of the server’s API base that we are currently connected to
 * @returns {string} the URL of the TerminusDB server api endpoint we are connected to (typically server() + “api/”)
 * @example
 * let api_url = client.api()
 */
WOQLClient.prototype.api = function() {
    return this.connectionConfig.apiURL()
}

/**
 * Gets/Sets the client’s internal organization context value
 * @param {string | boolean} [orgId] the organization id to set the context to
 * @returns {string | boolean}
 * @example
 * client.organization("admin")
 */
WOQLClient.prototype.organization = function(orgId) {
    if (typeof orgId !== 'undefined') {
        this.connectionConfig.setOrganization(orgId)
    }
    return this.connectionConfig.organization()
}

/**
 * Gets the current user object as returned by the connect capabilities response
 * user has fields: [id, name, notes, author]
 * @returns {Object}
 */
WOQLClient.prototype.user = function() {
    //console.log("user_obj",this.connection.getUserObj())
    //this is the locacal 
    return this.connectionConfig.user()
    //this.connection.getUserObj()
}

/**
 * Retrieve the id of the user that is logged in with the client
 * @returns {string} the id of the current user (always ‘admin’ for desktop client)
 */

/*WOQLClient.prototype.uid = function() {
    let u = this.user()
    return u.id
}*/

/**
 * @desription Gets the user's organization id
 * @returns {string} the user organization name
 */
//this is something that need review
WOQLClient.prototype.userOrganization = function() {
    return this.user()
}


/**
 * Retrieves a list of databases (id, organization, label, comment) that the current user has access to on the server. Note that this requires the client to call connect() first.
 * @param {array} [dbList] a list of databases the user has access to on the server, each having:
 * @returns {array} the user databases list
 * @example
 * const my_dbs = client.databases()
 */
WOQLClient.prototype.databases = function(dbList) {
    if (dbList) this.databaseList = dbList
    return this.databaseList || []
}

/**
 * Gets the database's details
 * @param {string} [dbId] - the datbase id
 * @returns {object} the database description object //getDatabaseInfo
 */
WOQLClient.prototype.databaseInfo = function(dbId) {
    const dbIdVal = dbId || this.db()
    //const orgIdVal = orgId || this.organization()
    const database = this.databases().find(element => element.name === dbId)
    return database || {}
}

/**
 * Sets / Gets the current database
 * @param {string} [dbId] - the database id to set the context to
 * @returns {string|boolean} - the current database or false
 * @example
 * client.db("mydb")
 */
WOQLClient.prototype.db = function(dbId) {
    if (typeof dbId !== 'undefined') {
        this.connectionConfig.setDB(dbId)
        this.checkout("_commits")
    }
    return this.connectionConfig.db()
}

/**
 *Sets the internal client context to allow it to talk to the server’s internal system database
 *
 */
WOQLClient.prototype.setSystemDb = function() {
    this.db(this.connectionConfig.system_db)
}


/**
 * Gets / Sets the client’s internal repository context value (defaults to ‘local’)
 * @param {typedef.RepoType | string} [repoId] - default value is local
 * @returns {string} the current repository id within the client context
 * @example
 * client.repo("origin")
 */
WOQLClient.prototype.repo = function(repoId) {
    if (typeof repoId != 'undefined') {
        this.connectionConfig.setRepo(repoId)
    }
    return this.connectionConfig.repo()
}

/**
 * Gets/Sets the client’s internal branch context value (defaults to ‘main’)
 * @param {string} [branchId] - the branch id to set the context to
 * @returns {string} the current branch id within the client context
 */
WOQLClient.prototype.checkout = function(branchId) {
    if (typeof branchId != 'undefined') {
        this.connectionConfig.setBranch(branchId)
    }
    return this.connectionConfig.branch()
}

/**
 *  Sets / gets the current ref pointer (pointer to a commit within a branch)
 * Reference ID or Commit ID are unique hashes that are created whenever a new commit is recorded
 * @param {string} [commitId] - the reference ID or commit ID
 * @returns {string|boolean}  the current commit id within the client context
 * @example
 * client.ref("mkz98k2h3j8cqjwi3wxxzuyn7cr6cw7")
 */
WOQLClient.prototype.ref = function(commitId) {
    if (typeof commitId != 'undefined') {
        this.connectionConfig.setRef(commitId)
    }
    return this.connectionConfig.ref()
}

/**
 *  Sets/Gets set the database basic connection credential
 * @param {typedef.CredentialObj} [newCredential]
 * @returns {typedef.CredentialObj | boolean}
 * @example
 * client.localAuth({user:"admin","key":"mykey","type":"basic"})
 */
WOQLClient.prototype.localAuth = function(newCredential) {
    if (typeof newCredential !== 'undefined') {
        this.connectionConfig.setLocalAuth(newCredential)
    }
    return this.connectionConfig.localAuth()
}
/**
 * Use {@link #localAuth} instead.
 * @deprecated
 */

WOQLClient.prototype.local_auth = WOQLClient.prototype.localAuth

/**
 * Sets/Gets the jwt token for authentication
 * @param {typedef.CredentialObj} [newCredential]
 * @returns {typedef.CredentialObj | boolean}
 * @example
 * client.localAuth({"key":"dhfmnmjglkrelgkptohkn","type":"jwt"})
 */
WOQLClient.prototype.remoteAuth = function(newCredential) {
    if (typeof newCredential !== 'undefined') {
        this.connectionConfig.setRemoteAuth(newCredential)
    }
    return this.connectionConfig.remoteAuth()
}

/**
 * Use {@link #remoteAuth} instead.
 * @deprecated
 */

WOQLClient.prototype.remote_auth = WOQLClient.prototype.remoteAuth

/**
 * Gets/Sets the string that will be written into the commit log for the current user
 * @param {string} [aName] -  the id to write into commit logs as the author string (normally an email address)
 * @returns {string} the current author id in use for the current user
 * @example
 * client.author("my@myemail.com")
 */
WOQLClient.prototype.author = function(aName) {
    //we have to review this with is the author in local and remote
    
    //if (aName) {
        //this.connectionConfig.user.author = aName
    //}
    //return this.connectionConfig.author() ||
    return this.connectionConfig.user()
}

/**
 * @param {typedef.ParamsObj} params - a object with connection params
 * @example sets several of the internal state values in a single call (similar to connect, but only sets internal client state, does not communicate with server)
 * client.set({key: "mypass", branch: "dev", repo: "origin"})
 */
WOQLClient.prototype.set = function(params) {
    this.connectionConfig.update(params)
}

/**
 * Generates a resource string for the required context
 * of the current context for "commits" "meta" "branch" and "ref" special resources
 * @param {typedef.ResourceType} resourceType - the type of resource string that is required - one of “db”, “meta”, “repo”, “commits”, “branch”, “ref”
 * @param {string} [resourceId] -  can be used to specify a specific branch / ref - if not supplied the current context will be used
 * @returns {string} a resource string for the desired context
 * @example
 * const branch_resource = client.resource("branch")
 */
WOQLClient.prototype.resource = function(resourceType, resourceId) {
    let base = `${this.organization()}/${this.db()}/`
    if (resourceType === 'db') return base
    if (resourceType === 'meta') return `${base}_meta`
    base += `${this.repo()}`
    if (resourceType === 'repo') return base
    if (resourceType === 'commits') return `${base}/_commits`
    let resourceIdValue = resourceId || (resourceType === 'ref' ? this.ref() : this.checkout())
    if (resourceType === 'branch') return `${base}/branch/${resourceIdValue}`
    if (resourceType === 'ref') return `${base}/commit/${resourceIdValue}`
}

/**
 * Connect to a Terminus server at the given URI with an API key
 * Stores the system:ServerCapability document returned
 * in the connection register which stores, the url, key, capabilities,
 * and database meta-data for the connected server
 * this.connectionConfig.server will be used if present,
 * or the promise will be rejected.
 * @param {typedef.ParamsObj} [params] - TerminusDB Server connection parameters
 * @returns {Promise}  the connection capabilities response object or an error object
 * @example
 * client.connect({key:"mykey",user:"admin"})
 */
WOQLClient.prototype.connect = function(params) {
    if (params) this.connectionConfig.update(params)
    // unset the current server setting until successful connect
    return this.dispatch(CONST.GET, this.api()).then(response => {
        this.databases(response)
        return response
    })
}

/**
 * Creates a new database in TerminusDB server
 * @param {string} dbId - The id of the new database to be created
 * @param {typedef.DbDetails} dbDetails - object containing details about the database to be created:
 * @param {string} [orgId] - optional organization id - if absent default local organization id is used
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * //remember set schema:true if you need to add a schema graph
 * client.createDatabase("mydb", {label: "My Database", comment: "Testing", schema: true})
 */
//maybe we can pass only the detailObj it is have inside the dbid and org
WOQLClient.prototype.createDatabase = function(dbId, dbDetails, orgId) {

    orgId = orgId || this.userOrganization()
    console.log("createDatabase", orgId)
    this.organization(orgId)
    if (dbId) {
        this.db(dbId)
        //to be review
        //console.log('____remoteURL_BFF__', this.connectionConfig.dbURL())
        return this.dispatch(CONST.POST, this.connectionConfig.dbURL(), dbDetails)
    }
    let errmsg = `Create database parameter error - you must specify a valid database id  - ${dbId} is invalid`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_DATABASE, errmsg)),
    )
}

/**
 * Deletes a database from a TerminusDB server
 * @param {string} dbId The id of the database to be deleted
 * @param {string} [orgId] the id of the organization to which the database belongs (in desktop use, this will always be “admin”)
 * @param {boolean} [force]
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.deleteDatabase("mydb")
 */
WOQLClient.prototype.deleteDatabase = function(dbId, orgId, force) {
    const orgIdValue = orgId || this.organization()
    this.organization(orgIdValue)
    let payload = force ? {force: true} : null
    if (dbId && this.db(dbId)) {
        return this.dispatch(CONST.DATABASE, this.connectionConfig.dbURL(), payload)
    }
    let errmsg = `Delete database parameter error - you must specify a valid database id  - ${dbId} is invalid`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.DATABASE, errmsg)),
    )
}

/**
 * Creates a new named graph within a TerminusDB database
 * @param {typedef.GraphType} graphType - type of graph
 * @param {string} graphId  - id of the graph to be created
 * @param {string} commitMsg  - a message describing the reason for the change that will be written into the commit log
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.createGraph("schema", "alt", "Adding new schema graph")
 */
//TO BE REMOVED
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
 * Deletes a graph from a TerminusDB database
 * @param {typedef.GraphType} graphType - type of graph
 * @param {string} graphId - local id of graph
 * @param {string} commitMsg - a message describing the reason for the change that will be written into the commit log
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.deleteGraph("schema", "alt", "Deleting alt schema graph")
 */
WOQLClient.prototype.deleteGraph = function(graphType, graphId, commitMsg) {
    if (graphType && ['inference', 'schema', 'instance'].indexOf(graphType) != -1 && graphId) {
        let commit = this.generateCommitInfo(commitMsg)
        return this.dispatch(
            CONST.GRAPH,
            this.connectionConfig.graphURL(graphType, graphType),
            commit,
        )
    }
    let errmsg = `Delete graph parameter error - you must specify a valid type (inference, instance, schema), graph id and commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.GRAPH, errmsg)),
    )
}

/**
 * Retrieve the contents of a graph within a TerminusDB as triples, encoded in the turtle (ttl) format
 * @param {typedef.GraphType} graphType -  type of graph to get triples from, either “instance”, “schema” or “inference”
 * @param {string} graphId - TerminusDB Graph name
 * @returns {Promise}  A promise that returns the call response object (with the contents being a string representing a set of triples in turtle (ttl) format), or an Error if rejected.
 * @example
 * const turtle = await client.getTriples("schema", "alt")
 */
WOQLClient.prototype.getTriples = function(graphType, graphId) {
    if (graphType && graphId) {
        return this.dispatch(
            CONST.GET,
            this.connectionConfig.triplesURL(graphType, graphId),
        )
    }
    let errmsg = `Get triples parameter error - you must specify a valid graph type (inference, instance, schema), and graph id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET, errmsg)),
    )
}

/**
 * Replace the contents of the specified graph with the passed triples encoded in the turtle (ttl) format
 * @param {string} graphType - type of graph  |instance|schema|inference|
 * @param {string} graphId - TerminusDB Graph ID
 * @param {string} turtle - string encoding triples in turtle (ttl) format
 * @param {string} commitMsg - Textual message describing the reason for the update
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.updateTriples("schema", "alt", turtle_string, "dumping triples to graph alt")
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
 * Appends the passed turtle to the contents of a graph
 * @param {string} graphType type of graph  |instance|schema|inference|
 * @param {string} graphId TerminusDB Graph ID to update, main is the default value
 * @param {string} turtle is a valid set of triples in turtle format (OWL)
 * @param {string} commitMsg Textual message describing the reason for the update
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
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
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * const filePath = ["C:/Users/User Name/Documents/example.csv"]
 * client.insertCSV(filePath, "inserting a CSV file", "instance", "main")
 */
WOQLClient.prototype.insertCSV = function(csvPathList, commitMsg) {
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
        return this.dispatch(CONST.ADD_CSV, this.connectionConfig.csvURL(), formData)
    }
}

/**
 * Updates the contents of the specified path with a csv, creating the appropriate
 * diff object as the commit.
 *
 * @param {array} csvPathList Array csvs to upload
 * @param {string} commitMsg Textual message describing the reason for the update
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * const filePath = [{fileToBeUpdated: "File.csv", updateWith: "C:/Users/User Name/Documents/example.csv"}]
 * client.updateCSV(filePath, "updating a CSV file", "instance", "main")
 * // Here fileToBeUpdated is the CSV in TerminusDB which we are going to update. updateWith includes the file path of the CSV whose contents is going to be updated to fileToBeUpdated. Note that during an Update CSV only
 * //the diffs are considered and are updated which makes update of big files more efficient.
 */
WOQLClient.prototype.updateCSV = function(csvPathList, commitMsg) {
    if (commitMsg && csvPathList) {
        let commit = this.generateCommitInfo(commitMsg)
        const formData = new FormData()
        csvPathList.map(item => {
            formData.append(item.fileToBeUpdated, item.updateWith)
        })
        formData.append('payload', JSON.stringify(commit))
        return this.dispatch(CONST.UPDATE_CSV, this.connectionConfig.csvURL(), formData)
    }
}

/**
 * Retrieves the contents of the specified graph as a CSV
 * @param {string} csvName Name of csv to dump from the specified database to extract
 * @returns {Promise} An API success message
 * @example
 * const name = ["example.csv"]
 * client.getCSV(name, true, "instance", "main")
 */
WOQLClient.prototype.getCSV = function(csvName) {
    let options = {},
        filePath
    options.name = csvName
    return this.dispatch(CONST.GET, this.connectionConfig.csvURL(), options)
}

/**
 * Deletes CSV from your database
 * @param {array} csvName is an array of csv file names
 * @param {string} commitMsg Textual message describing the reason for the delete
 * @returns {Promise} the rest api call results
 * @example
 * const name = ["example.csv"]
 * client.deleteCSV(name, "deleting CSV")
 */
WOQLClient.prototype.deleteCSV = function(csvName, commitMsg) {
    if (commitMsg && csvName) {
        let commit = this.generateCommitInfo(commitMsg)
        let options = {},
            filePath
        options.name = csvName
        options.commit_info = commit.commit_info
        return this.dispatch(CONST.DELETE, this.connectionConfig.csvURL(), options).then(
            results => {
                return results
            },
        )
    }
}

/**
 *  Sends a message to the server
 * @param {string} message - textual string
 * @param {string} [pathname] - a server path to send the message to
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.message = function(message, pathname) {
    let url = this.api()
    url += pathname ? this.api() + pathname : 'message'
    return this.dispatch(CONST.GET, url, message).then(response => {
        return response
    })
}

/**
 * Sends an action to the server
 * @param {string} actionName - structure of the action
 * @param {object} [payload] - a request body call
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.action = function(actionName, payload) {
    const url = this.api() + 'action/' + actionName
    return this.dispatch(CONST.ACTION, url, payload).then(response => {
        return response
    })
}

/**
 * Gets TerminusDB Server Information
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.info()
 */
WOQLClient.prototype.info = function() {
    const url = this.api() + 'info'
    return this.dispatch(CONST.GET, url).then(response => {
        return response
    })
}

/**
 * Executes a WOQL query on the specified database and returns the results
 * @param {WOQLQuery} woql - an instance of the WOQLQuery class
 * @param {string} [commitMsg] - a message describing the reason for the change that will be written into the commit log (only relevant if the query contains an update)
 * @param {boolean} [allWitnesses]
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * const result = await client.query(WOQL.star())
 */
WOQLClient.prototype.query = function(woql, commitMsg, allWitnesses) {
    allWitnesses = allWitnesses || false
    commitMsg = commitMsg || 'Commit generated with javascript client without message'
    if (woql && woql.json && (!woql.containsUpdate() || commitMsg)) {
        /*woql.context(
            this.connection.getContextForOutboundQuery(woql, this.db(), this.organization()),
        )*/
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

/**
 * Creates a new branch with a TerminusDB database, starting from the current context of the client (branch / ref)
 * @param {string} newBranchId - local identifier of the new branch the ID of the new branch to be created
 * @param {boolean} [sourceFree] - if the query contains any updates, it should include a textual message describing the reason for the update
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.branch("dev")
 */
WOQLClient.prototype.branch = function(newBranchId, sourceFree) {  
    if (newBranchId) {
        let source = this.ref()
            ? {origin: `${this.organization()}/${this.db()}/${this.repo()}/commit/${this.ref()}`}
            : {
                  origin: `${this.organization()}/${this.db()}/${this.repo()}/branch/${this.checkout()}`,
              }

        if (sourceFree && sourceFree === true) {
            // @ts-ignore
            source = {}
        }
        return this.dispatch(CONST.BRANCH, this.connectionConfig.branchURL(newBranchId), source)
    }
    let errmsg = `Branch parameter error - you must specify a valid new branch id`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)))
}

/**
 * Squash branch commits
 * @param {string} branchId - local identifier of the new branch
 * @param {string} commitMsg - Textual message describing the reason for the update
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.squashBranch = function(branchId, commitMsg) {
    if (commitMsg && branchId) {
        let commit = this.generateCommitInfo(commitMsg)
        return this.dispatch(
            CONST.SQUASH_BRANCH,
            this.connectionConfig.squashBranchURL(branchId),
            commit,
        )
    }
    let errmsg = `Branch parameter error - you must specify a valid new branch id and a commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.SQUASH_BRANCH, errmsg)),
    )
}

/**
 * Reset branch to a commit id, Reference ID or Commit ID are unique hashes that are created whenever a new commit is recorded
 * @param {string} branchId - local identifier of the new branch
 * @param {string} commitId - Reference ID or Commit ID
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.resetBranch = function(branchId, commitId) {
    if (commitId && branchId) {
        let commit_descriptor = this.generateCommitDescriptor(commitId)
        return this.dispatch(
            CONST.RESET_BRANCH,
            this.connectionConfig.resetBranchUrl(branchId),
            commit_descriptor,
        )
    }
    let errmsg = `Branch parameter error - you must specify a valid new branch id and a commit message`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.RESET_BRANCH, errmsg)),
    )
}

/**
 * Optimize db branch
 * @param {string} branchId - local identifier of the new branch
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.optimizeBranch = function(branchId) {
    return this.dispatch(CONST.OPTIMIZE_SYSTEM, this.connectionConfig.optimizeBranchUrl(branchId))
}

/**
 * Deletes a branch from database
 * @param {string} branchId - local identifier of the branch
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.deleteBranch = function(branchId) {
    if (branchId) {
        return this.dispatch(CONST.DELETE, this.connectionConfig.branchURL(branchId))
    }
    let errmsg = `Branch parameter error - you must specify a valid new branch id`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)))
}

/**
 * Pull changes from a branch on a remote database to a branch on a local database
 * @param {typedef.RemoteRepoDetails} remoteSourceRepo - an object describing the source of the pull
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.pull({remote: "origin", remote_branch: "main", message: "Pulling from remote"})
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
 * Fetch updates to a remote database to a remote repository with the local database
 * @param {string} remoteId - if of the remote to fetch (eg: 'origin')
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.fetch = function(remoteId) {
    return this.dispatch(CONST.FETCH, this.connectionConfig.fetchURL(remoteId))
}

/**
 * Push changes from a branch on a local database to a branch on a remote database
 * @param {typedef.RemoteRepoDetails} remoteTargetRepo - an object describing the target of the push
 * {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"}
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.push({remote: "origin", remote_branch: "main", message: "Pulling from remote"})
 */
WOQLClient.prototype.push = function(remoteTargetRepo) {
    let rc_args = this.prepareRevisionControlArgs(remoteTargetRepo)
    if (rc_args && rc_args.remote && rc_args.remote_branch) {
        return this.dispatch(CONST.PUSH, this.connectionConfig.pushURL(), rc_args)
    }
    let errmsg = `Push parameter error - you must specify a valid remote target`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.PUSH, errmsg)))
}

/**
 * Merges the passed branch into the current one using the rebase operation
 * @param {object} rebaseSource - json describing the source branch to be used as a base
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * //from the branch head
 * client.rebase({rebase_from: "admin/db_name/local/branch/branch_name", message: "Merging from dev")
 * //or from a commit id
 * client.rebase({rebase_from: "admin/db_name/local/commit/9w8hk3y6rb8tjdy961de3i536ntkqd8", message: "Merging from dev")
 */
WOQLClient.prototype.rebase = function(rebaseSource) {
    let rc_args = this.prepareRevisionControlArgs(rebaseSource)
    if (rc_args && rc_args.rebase_from) {
        return this.dispatch(CONST.REBASE, this.connectionConfig.rebaseURL(), rc_args)
    } else {
        let errmsg = `Rebase parameter error - you must specify a valid rebase source to rebase from`
        return Promise.reject(
            new Error(ErrorMessage.getInvalidParameterMessage(CONST.REBASE, errmsg)),
        )
    }
}

/**
 * Reset the current branch HEAD to the specified commit path
 * @param {string} commitPath - The commit path to set the current branch to
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.reset = function(commitPath) {
    return this.dispatch(CONST.RESET, this.connectionConfig.resetURL(), {
        commit_descriptor: commitPath,
    })
}

/**
 * Clones a remote repo and creates a local copy
 * @param {typedef.CloneSourceDetails} cloneSource - object describing the source branch to be used as a base
 * @param {string} newDbId - id of the new cloned database on the local server
 * @param {string} [orgId] - id of the local organization that the new cloned database will be created in (in desktop mode this is always “admin”)
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.clonedb({remote_url: "https://my.terminusdb.com/myorg/mydb", label "Cloned DB", comment: "Cloned from mydb"}, newid: "mydb")
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
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.dispatch = async function(action, apiUrl, payload) {
    if (!apiUrl) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    action,
                    this.connectionConfig.connection_error,
                ),
            ),
        )
    }//I have to do a call to get the jwt token
    if(this.connectionConfig.tokenParameter){
        const param = this.connectionConfig.tokenParameter
        await axios.post(param.url,param.options).then(result=>result.data).then(data=>{
            if(data.access_token){
                this.localAuth({"key":data.access_token,"type":"jwt"})
            }
        })          
    }
    return DispatchRequest(
            apiUrl,
            action,
            payload,
            this.localAuth(),
            this.remoteAuth(),
            this.customHeaders(),
        )
    
}

/**
 * Generates the json structure for commit messages
 * @param {string} msg - textual string describing reason for the change
 * @param {string} [author] - optional author id string - if absent current user id will be used
 * @returns {object}
 */
WOQLClient.prototype.generateCommitInfo = function(msg, author) {
    if (!author) {
        author = this.author()
    }
    let commitInfo = {commit_info: {author: author, message: msg}}
    return commitInfo
}

/**
 * Generates the json structure for commit descriptor
 * @param {string} commitId - a valid commit id o
 */
WOQLClient.prototype.generateCommitDescriptor = function(commitId) {
    let cd = this.connectionConfig.commitDescriptorUrl(commitId)
    let ci = {commit_descriptor: cd}
    return ci
}

/**
 * Adds an author string (from the user object returned by connect) to the commit message.
 * @param {object} [rc_args]
 * @returns {object | boolean}
 */
WOQLClient.prototype.prepareRevisionControlArgs = function(rc_args) {
    if (!rc_args || typeof rc_args !== 'object') return false
    if (!rc_args.author) rc_args.author = this.author()
    return rc_args
}

/**
 * Loads prefixes for each database connected to.
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
    // @ts-ignore
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


/***
 * Server Version API
 * Note: the below endpoints are not part of the terminusdb desktop package
 * they belong to the server package version of the DB which is under construction.
 * Until that package is released all of the below endpoints should be considered
 * as unreliable and subject to change - they are provided complete with the desktop
 * version to show users what is coming and to allow people to use them at their own risk
 * Any use of them should be considered unsupported and at your own risk
 *  get all the database information from the remote server
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.getDatabase = function() {
    return this.dispatch(CONST.GET, this.connectionConfig.dbURL())
}

/**
 *  update the database details
 * @param {object} dbDoc - an object that describe the database details
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.updateDatabase = function(dbDoc) {
    let dbid = dbDoc.id || this.db()
    let org = dbDoc.organization || this.organization()
    return this.createDatabase(dbid, dbDoc, org)
}


/**
 * Gets/Sets the list of organizations that the user belongs to (has roles for)
 * @param {array} orgList - list of organization name
 * @returns {array}
 */
WOQLClient.prototype.organizations = function(orgList) {
    if (orgList) {
        this.connection.set_organizations(orgList)
    }
    return this.connection.get_organization()
}
/**
 * Check from the capabilities object if the action is permitted
 * @param {string} action - the action name
 * @param {string} resource - the name of the resource (databaseName or organizationName)
 * @returns {boolean}
 */
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
 *  For creating an user
 * @param {string} userId - the userId
 * @param {object} userDoc - the user's object description
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.createUser = function(userId, userDoc) {
    if (userId) {
        return this.dispatch(CONST.POST, this.connectionConfig.userURL(), userDoc)
    }
    let errmsg = `Create user parameter error - you must specify a valid user id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_USER, errmsg)),
    )
}

/**
 *  Get the logged user details.
 * @param {string} userId
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.getUser = function(userId) {
    return this.dispatch(CONST.GET, this.connectionConfig.userURL(userId))
}

/**
 *  Update an user from the database.
 * @param {string} userId
 * @param {object} userDoc - User Object details
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
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
 *  Delete an user from the database Only a user with DBA authority can delete a user.
 * @param {string} userId
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.deleteUser = function(userId) {
    if (userId) {
        return this.dispatch(CONST.DELETE, this.connectionConfig.userURL(userId))
    }
    let errmsg = `Delete user parameter error - you must specify a valid user id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.USER, errmsg)),
    )
}

/**
 *  Create a new organization for the registered user
 * @param {string} orgId - the organization id
 * @param {object} orgDoc - An object that describe the organization's details
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.createOrganization = function(orgId, orgDoc) {
    if (orgId) {
        return this.dispatch(
            CONST.CREATE_ORGANIZATION,
            this.connectionConfig.organizationURL(),
            orgDoc,
        )
    }
    let errmsg = `Create organization parameter error - you must specify a valid organization id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_ORGANIZATION, errmsg)),
    )
}


/**
 *  Create a new organization for the registered user
 * @param {string} orgId - the organization id
 * @param {object} orgDoc - An object that describe the organization's details
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

 WOQLClient.prototype.setOrganizationRoles = function(payload, orgDoc) {
    //if (orgId) {
        return this.dispatch(
            CONST.CREATE_ORGANIZATION,
            this.connectionConfig.updateOrganizationRoleURL(),
            payload,
        )
    //}
    //let errmsg = `Create organization parameter error - you must specify a valid organization id`
   /* return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_ORGANIZATION, errmsg)),
    )*/
}

/**
 * Gets all the information about the given organization
 * @param {string} orgId - the organization id
 * @param {string} [action] - set an action like recommendations | invitations | collaborators
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.getOrganization = function(orgId, action) {
    return this.dispatch(
        CONST.GET,
        this.connectionConfig.organizationURL(orgId, action),
    )
}

/**
 *  only if you have the permission you can delete an organization
 *  Before you can delete the organization, you must first remove all accounts and databases
 *  from the organization
 * @param {string} orgId - the organization id
 * @param {object} orgDoc - the organization details description
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.updateOrganization = function(orgId, orgDoc) {
    if (orgId) {
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

/**
 *  only if you have the permission you can delete an organization
 *  Before you can delete the organization, you must first remove all accounts and databases
 *  from the organization
 * @param {string} orgId - the organization id
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.deleteOrganization = function(orgId) {
    if (orgId) {
        return this.dispatch(
            CONST.ORGANIZATION,
            this.connectionConfig.organizationURL(orgId),
        )
    }
    let errmsg = `Delete organization parameter error - you must specify a valid organization id`
    return Promise.reject(
        new Error(ErrorMessage.getInvalidParameterMessage(CONST.ORGANIZATION, errmsg)),
    )
}

/**
 * get all the user roles (for the current logged user)
 * or the user roles for a specific database and user
 * (the logged used need to have the permission to see the roles info for another user)
 * @param {string} [userId] - the user id
 * @param {string} [orgId] - the organization id
 * @param {string} [dbId] - the dbId
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.getRoles = function(userId, orgId, dbId) {
    let roleURL = this.connectionConfig.rolesURL()
    if (userId && orgId && dbId) {
        roleURL = `${roleURL}/${userId}/${orgId}/${dbId}`
    }
    return this.dispatch(CONST.GET, roleURL)
}

/**
 * Change the user role for existing users in your organization, including your own
 * @param {typedef.RolesObj} newRolesObj
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.updateRoles = function(newRolesObj) {
    return this.dispatch(CONST.UPDATE_ROLES, this.connectionConfig.updateRolesURL(), newRolesObj)
}
/**
 * to insert a new document
 * @param {object} json 
 * @param {typedef.DocParamsPost} [params] 
 * @param {string} [dbId]
 * @param {message} [string]
 */

//document interface
WOQLClient.prototype.addDocument = function(json, params, dbId, message="add a new document"){
    if (dbId) {
        this.db(dbId)
    }
    const docParams = params || {}
    docParams['author'] = this.author()
    docParams['message'] = message
    return this.dispatch(CONST.POST, this.connectionConfig.documentURL(docParams), json)
}

//https://127.0.0.1:6363/api/document/admin/test_profile/local/branch/main?graph_type=schema

//document interface
WOQLClient.prototype.getDocument = function(params,dbId,branch){
    if (dbId) {
        this.db(dbId)
    }
    if(branch){  
        this.checkout(branch)
    }
    return this.dispatch(CONST.GET, this.connectionConfig.documentURL(params))
}

/**
 * 
 * @param {*} json 
 * @param {*} [params] 
 * @param {*} [dbId]
 * @param {*} [message]
 * @returns 
 */

WOQLClient.prototype.updateDocument = function(json,params,dbId, message="update document"){
    const docParams = params || {}
    docParams['author']=this.author()
    docParams['message'] = message
    if (dbId) {
        this.db(dbId)
    }
    return this.dispatch(CONST.PUT, this.connectionConfig.documentURL(docParams),json)
}


WOQLClient.prototype.deleteDocument = function(params,dbId,message="delete document"){
    const docParams = params || {}
    let payload = null
    if(typeof params.id === 'object'){
        payload=params.id
        delete docParams.id
    }
    docParams['author']=this.author()
    docParams['message'] = message
    if (dbId) {
        this.db(dbId)
    }
    return this.dispatch(CONST.DELETE, this.connectionConfig.documentURL(docParams),payload)
}
/**
 * 
 * @param {string} [type] - for get the info only for a specific document type 
 * @param {string} [dbId] - the database id 
 * @returns 
 */

WOQLClient.prototype.schema = function(type,dbId){
    let params
    if(type) params = {type:type}
    if (dbId) {
        this.db(dbId)
    }
    return this.dispatch(CONST.GET, this.connectionConfig.jsonSchemaURL(params))
}

WOQLClient.prototype.branches = async function(dbId){
    const params={type:'Branch','as_list':true}
    const branch = this.checkout()
    const result = await this.getDocument(params,dbId,"_commits")
    //reset branch
    const branchesObj = {}
    if(result){
        result.forEach(item=>{
            branchesObj[item.name]=item
        })
    }
    this.checkout(branch)
    return branchesObj
}

module.exports = WOQLClient
