////@ts-check
const typedef = require('./typedef')
const CONST = require('./const')
const DispatchRequest = require('./dispatchRequest')
const ErrorMessage = require('./errorMessage')
const ConnectionConfig = require('./connectionConfig')
const WOQL = require('./woql')
const WOQLQuery = require('./query/woqlBuilder')
const { default: axios } = require('axios')
const FormData = require('form-data');
const fs = require('fs');

/**
 * @license Apache Version 2
 * @module WOQLClient
 * @description The core functionality of the TerminusDB javascript client is
 * defined in the WOQLClient class - in the woqlClient.js file. This class provides
 * methods which allow you to directly get and set all of the configuration and API
 * endpoints of the client. The other parts of the WOQL core - connectionConfig.js
 * and connectionCapabilities.js - are used by the client to store internal state - they
 * should never have to be accessed directly. For situations where you want to communicate
 * with a TerminusDB server API, the WOQLClient class is all you will need.
 * @constructor
 * @param {string} serverUrl - the terminusdb server url
 * @param {typedef.ParamsObj} [params] - an object with the connection parameters
 * @example
 * //to connect with your local terminusDB
 * const client = new TerminusClient.WOQLClient(SERVER_URL,{user:"admin",key:"myKey"})
 * async function getSchema() {
 *      client.db("test")
 *      client.checkout("dev")
 *      const schema = await client.getSchema()
 * }
 * //The client has an internal state which defines what
 * //organization / database / repository / branch / ref it is currently attached to
 *
 * //to connect with your TerminusDB Cloud Instance
 * const client = new TerminusClient.WOQLClient('SERVER_CLOUD_URL/mycloudTeam',
 *                      {user:"myemail@something.com", organization:'mycloudTeam'})
 *
 * client.setApiKey(MY_ACCESS_TOKEN)
 *
 * //to get the list of all organization's databases
 * async function callGetDatabases(){
 *      const dbList = await client.getDatabases()
 *      console.log(dbList)
 * }
 *
 * async function getSchema() {
 *      client.db("test")
 *      client.checkout("dev")
 *      const schema = await client.getSchema()
 * }
 */

function WOQLClient(serverUrl, params) {
  // current connection context variables
  this.connectionConfig = new ConnectionConfig(serverUrl, params);
  this.databaseList = [];
  this.organizationList = [];
}

/**
 * set the api key to access the cloud resources
 * @param {string} accessToken
 */
WOQLClient.prototype.setApiKey = function (accessToken) {
  const currentAuth = this.connectionConfig.localAuth() || {};
  currentAuth.key = accessToken;
  currentAuth.type = 'apikey';
  this.connectionConfig.setLocalAuth(currentAuth);
};

/**
 * add extra headers to your request
 * @param {object} customHeaders
 * @returns {object}
 */

// eslint-disable-next-line consistent-return
WOQLClient.prototype.customHeaders = function (customHeaders) {
  if (customHeaders) this._customHeaders = customHeaders;
  else return this._customHeaders;
};

WOQLClient.CONST = CONST;

/**
 * creates a copy of the client with identical internal state and context
 * useful if we want to change context for a particular API call without changing
 * the current client context
 * @returns {WOQLClient}  new client object with identical state to original but
 * which can be manipulated independently
 * @example
 * let newClient = client.copy()
 */
WOQLClient.prototype.copy = function () {
  const other = new WOQLClient(this.server());
  // other.connection = this.connection //keep same connection meta data - shared by copy
  other.connectionConfig = this.connectionConfig.copy(); // new copy of current connection data
  other.databaseList = this.databaseList;
  return other;
};

/**
 * Gets the current connected server url
 * it can only be set creating a new WOQLCLient instance
 * @returns {string}
 */
WOQLClient.prototype.server = function () {
  return this.connectionConfig.serverURL();
};

/**
 * Retrieve the URL of the server’s API base that we are currently connected to
 * @returns {string} the URL of the TerminusDB server api endpoint we are connected
 * to (typically server() + “api/”)
 * @example
 * let api_url = client.api()
 */
WOQLClient.prototype.api = function () {
  return this.connectionConfig.apiURL();
};

/**
 * Gets/Sets the client’s internal organization context value, if you change the organization
 * name the databases list will be set to empty
 * @param {string | boolean} [orgId] the organization id to set the context to
 * @returns {string | boolean}
 * @example
 * client.organization("admin")
 */
WOQLClient.prototype.organization = function (orgId) {
  if (typeof orgId !== 'undefined') {
    this.connectionConfig.setOrganization(orgId);
    // we have to reset the databases list
    this.databases([]);
  }
  return this.connectionConfig.organization();
};

/**
 * Gets the organization's databases list.
 *
 * If no organization has been set up, the function throws an exception
 * @returns {string | boolean}
 * @example
 * async function callGetDatabases(){
 *      const dbList = await client.getDatabases()
 *      console.log(dbList)
 * }
 */
WOQLClient.prototype.getDatabases = async function () {
  // return response
  if (!this.connectionConfig.organization()) {
    throw new Error('You need to set the organization name');
  }
  // when we will have the end point to get the databases only for the current organization
  // we'll change this call
  await this.getUserOrganizations();
  const dbs = this.userOrganizations().find(
    (element) => element.name === this.connectionConfig.organization(),
  );
  const dbList = dbs && dbs.databases ? dbs.databases : [];
  this.databases(dbList);
  return dbList;
};

/**
 * Set/Get the organization's databases list (id, label, comment) that the current
 * user has access to on the server.
 * @param {array} [dbList] a list of databases the user has access to on the server, each having:
 * @returns {array} the organization's databases list
 * @example
 * //to get the list of all organization's databases
 * async function callGetDatabases(){
 *      await client.getDatabases()
 *      console.log(client.databases())
 * }
 *
 */
WOQLClient.prototype.databases = function (dbList) {
  if (dbList) this.databaseList = dbList;
  return this.databaseList || [];
};

/**
 * Gets the current user object as returned by the connect capabilities response
 * user has fields: [id, name, notes, author]
 * @returns {Object}
 */
WOQLClient.prototype.user = function () {
  // this is the locacal
  return this.connectionConfig.user();
};

/**
 * @desription Gets the user's organization id
 * @returns {string} the user organization name
 */
// this is something that need review
WOQLClient.prototype.userOrganization = function () {
  return this.user();
};

/**
 * Gets the database's details
 * @param {string} [dbId] - the datbase id
 * @returns {object} the database description object //getDatabaseInfo
 */
WOQLClient.prototype.databaseInfo = function (dbId) {
  // const dbIdVal = dbId || this.db();
  // const orgIdVal = orgId || this.organization()
  const database = this.databases().find((element) => element.name === dbId);
  return database || {};
};

/**
 * Sets / Gets the current database
 * @param {string} [dbId] - the database id to set the context to
 * @returns {string|boolean} - the current database or false
 * @example
 * client.db("mydb")
 */
WOQLClient.prototype.db = function (dbId) {
  if (typeof dbId !== 'undefined') {
    this.connectionConfig.setDB(dbId);
  }
  return this.connectionConfig.dbid;
};

/**
 *Sets the internal client context to allow it to talk to the server’s internal system database
 *
 */
WOQLClient.prototype.setSystemDb = function () {
  this.db(this.connectionConfig.system_db);
};

/**
 * Gets / Sets the client’s internal repository context value (defaults to ‘local’)
 * @param {typedef.RepoType | string} [repoId] - default value is local
 * @returns {string} the current repository id within the client context
 * @example
 * client.repo("origin")
 */
WOQLClient.prototype.repo = function (repoId) {
  if (typeof repoId !== 'undefined') {
    this.connectionConfig.setRepo(repoId);
  }
  return this.connectionConfig.repo();
};

/**
 * Gets/Sets the client’s internal branch context value (defaults to ‘main’)
 * @param {string} [branchId] - the branch id to set the context to
 * @returns {string} the current branch id within the client context
 */
WOQLClient.prototype.checkout = function (branchId) {
  if (typeof branchId !== 'undefined') {
    this.connectionConfig.setBranch(branchId);
  }
  return this.connectionConfig.branch();
};

/**
 *  Sets / gets the current ref pointer (pointer to a commit within a branch)
 * Reference ID or Commit ID are unique hashes that are created whenever a new commit is recorded
 * @param {string} [commitId] - the reference ID or commit ID
 * @returns {string|boolean}  the current commit id within the client context
 * @example
 * client.ref("mkz98k2h3j8cqjwi3wxxzuyn7cr6cw7")
 */
WOQLClient.prototype.ref = function (commitId) {
  if (typeof commitId !== 'undefined') {
    this.connectionConfig.setRef(commitId);
  }
  return this.connectionConfig.ref();
};

/**
 * Sets/Gets set the database basic connection credential
 * @param {typedef.CredentialObj} [newCredential]
 * @returns {typedef.CredentialObj | boolean}
 * @example
 * client.localAuth({user:"admin","key":"mykey","type":"basic"})
 */
WOQLClient.prototype.localAuth = function (newCredential) {
  if (typeof newCredential !== 'undefined') {
    this.connectionConfig.setLocalAuth(newCredential);
  }
  return this.connectionConfig.localAuth();
};
/**
 * Use {@link #localAuth} instead.
 * @deprecated
 */

WOQLClient.prototype.local_auth = WOQLClient.prototype.localAuth;

/**
 * Sets/Gets the jwt token for authentication
 * we need this to connect 2 terminusdb server to each other for push, pull, clone actions
 * @param {typedef.CredentialObj} [newCredential]
 * @returns {typedef.CredentialObj | boolean}
 * @example
 * client.remoteAuth({"key":"dhfmnmjglkrelgkptohkn","type":"jwt"})
 */
WOQLClient.prototype.remoteAuth = function (newCredential) {
  if (typeof newCredential !== 'undefined') {
    this.connectionConfig.setRemoteAuth(newCredential);
  }
  return this.connectionConfig.remoteAuth();
};

/**
 * Use {@link #remoteAuth} instead.
 * @deprecated
 */

WOQLClient.prototype.remote_auth = WOQLClient.prototype.remoteAuth;

/**
 * Gets the string that will be written into the commit log for the current user
 * @returns {string} the current user
 * @example
 * client.author()
 */
WOQLClient.prototype.author = function () {
  // we have to review this with is the author in local and remote
  // was a old functionality
  // if (ignoreJwt) {
  // this.connectionConfig.user(ignoreJwt)
  // }
  return this.connectionConfig.user();
};

/**
 * @param {typedef.ParamsObj} params - a object with connection params
 * @example sets several of the internal state values in a single call
 * (similar to connect, but only sets internal client state, does not communicate with server)
 * client.set({key: "mypass", branch: "dev", repo: "origin"})
 */
WOQLClient.prototype.set = function (params) {
  this.connectionConfig.update(params);
};

/**
 * Generates a resource string for the required context
 * of the current context for "commits" "meta" "branch" and "ref" special resources
 * @param {typedef.ResourceType} resourceType - the type of resource string that is required - one
 * of “db”, “meta”, “repo”, “commits”, “branch”, “ref”
 * @param {string} [resourceId] -  can be used to specify a specific branch / ref - if not supplied
 * the current context will be used
 * @returns {string} a resource string for the desired context
 * @example
 * const branch_resource = client.resource("branch")
 */
WOQLClient.prototype.resource = function (resourceType, resourceId) {
  let base = `${this.organization()}/${this.db()}/`;
  if (resourceType === 'db') return base;
  if (resourceType === 'meta') return `${base}_meta`;
  base += `${this.repo()}`;
  if (resourceType === 'repo') return base;
  if (resourceType === 'commits') return `${base}/_commits`;
  const resourceIdValue = resourceId || (resourceType === 'ref' ? this.ref() : this.checkout());
  if (resourceType === 'branch') return `${base}/branch/${resourceIdValue}`;
  if (resourceType === 'ref') return `${base}/commit/${resourceIdValue}`;
};

/**
 * Connect to a Terminus server at the given URI with an API key
 * Stores the system:ServerCapability document returned
 * in the connection register which stores, the url, key, capabilities,
 * and database meta-data for the connected server
 * this.connectionConfig.server will be used if present,
 * or the promise will be rejected.
 *
 * @deprecated
 *
 * @param {typedef.ParamsObj} [params] - TerminusDB Server connection parameters
 * @returns {Promise}  the connection capabilities response object or an error object
 * @example
 * client.connect()
 */
WOQLClient.prototype.connect = function (params) {
  if (params) this.connectionConfig.update(params);
  // unset the current server setting until successful connect
  return this.dispatch(CONST.GET, this.connectionConfig.apiURLInfo()).then((response) => response);
};

/**
 * Creates a new database in TerminusDB server
 * @param {string} dbId - The id of the new database to be created
 * @param {typedef.DbDetails} dbDetails - object containing details about the database to be created
 * @param {string} [orgId] - optional organization id - if absent default local organization
 * id is used
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * //remember set schema:true if you need to add a schema graph
 * client.createDatabase("mydb", {label: "My Database", comment: "Testing", schema: true})
 */
// maybe we can pass only the detailObj it is have inside the dbid and org
WOQLClient.prototype.createDatabase = function (dbId, dbDetails, orgId) {
  if (orgId) this.organization(orgId);
  // console.log("createDatabase", orgId)
  if (dbId) {
    this.db(dbId);
    // to be review
    // console.log('____remoteURL_BFF__', this.connectionConfig.dbURL())
    return this.dispatch(CONST.POST, this.connectionConfig.dbURL(), dbDetails);
  }
  const errmsg = `Create database parameter error - you must specify a valid database id  - ${dbId} is invalid`;
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_DATABASE, errmsg)),
  );
};

/**
 * Deletes a database from a TerminusDB server
 * @param {string} dbId The id of the database to be deleted
 * @param {string} [orgId] the id of the organization to which the database belongs
 * (in desktop use, this will always be “admin”)
 * @param {boolean} [force]
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.deleteDatabase("mydb")
 */
WOQLClient.prototype.deleteDatabase = function (dbId, orgId, force) {
  const orgIdValue = orgId || this.organization();
  this.organization(orgIdValue);
  const payload = force ? { force: true } : null;
  if (dbId && this.db(dbId)) {
    return this.dispatch(CONST.DELETE, this.connectionConfig.dbURL(), payload);
  }
  const errmsg = `Delete database parameter error - you must specify a valid database id  - ${dbId} is invalid`;
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE, errmsg)),
  );
};

/**
 * Retrieve the contents of a graph within a TerminusDB as triples, encoded in
 * the turtle (ttl) format
 * @param {typedef.GraphType} graphType -  type of graph to get triples from,
 * either “instance” or  “schema”
 * @returns {Promise}  A promise that returns the call response object (with
 * the contents being a string representing a set of triples in turtle (ttl) format),
 * or an Error if rejected.
 * @example
 * const turtle = await client.getTriples("schema", "alt")
 */
WOQLClient.prototype.getTriples = function (graphType) {
  if (graphType) {
    return this.dispatch(
      CONST.GET,
      this.connectionConfig.triplesURL(graphType),
    );
  }
  const errmsg = 'Get triples parameter error - you must specify a valid graph type (inference, instance, schema), and graph id';
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET, errmsg)),
  );
};

/**
 * Replace the contents of the specified graph with the passed triples encoded
 * in the turtle (ttl) format
 * @param {string} graphType - type of graph  |instance|schema|inference|
 * @param {string} turtle - string encoding triples in turtle (ttl) format
 * @param {string} commitMsg - Textual message describing the reason for the update
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.updateTriples("schema", "alt", turtle_string, "dumping triples to graph alt")
 */
WOQLClient.prototype.updateTriples = function (graphType, turtle, commitMsg) {
  if (commitMsg && turtle && graphType) {
    const commit = this.generateCommitInfo(commitMsg);
    commit.turtle = turtle;
    return this.dispatch(
      CONST.UPDATE_TRIPLES,
      this.connectionConfig.triplesURL(graphType),
      commit,
    );
  }
  const errmsg = 'Update triples parameter error - you must specify a valid graph id, graph type, turtle contents and commit message';
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_TRIPLES, errmsg)),
  );
};

/**
 * Appends the passed turtle to the contents of a graph
 * @param {string} graphType type of graph  |instance|schema|inference|
 * @param {string} turtle is a valid set of triples in turtle format (OWL)
 * @param {string} commitMsg Textual message describing the reason for the update
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.insertTriples = function (graphType, turtle, commitMsg) {
  if (commitMsg && turtle && graphType) {
    const commit = this.generateCommitInfo(commitMsg);
    commit.turtle = turtle;
    return this.dispatch(
      CONST.INSERT_TRIPLES,
      this.connectionConfig.triplesURL(graphType),
      commit,
    );
  }
  const errmsg = 'Update triples parameter error - you must specify a valid graph id, graph type, turtle contents and commit message';
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.INSERT_TRIPLES, errmsg)),
  );
};

/**
 *  Sends a message to the server
 * @param {string} message - textual string
 * @param {string} [pathname] - a server path to send the message to
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.message = function (message, pathname) {
  let url = this.api();
  url += pathname ? this.api() + pathname : 'message';
  return this.dispatch(CONST.GET, url, message).then((response) => response);
};

/**
 * Sends an action to the server
 * @param {string} actionName - structure of the action
 * @param {object} [payload] - a request body call
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.action = function (actionName, payload) {
  const url = `${this.api()}action/${actionName}`;
  return this.dispatch(CONST.ACTION, url, payload).then((response) => response);
};

/**
 * Gets TerminusDB Server Information
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.info()
 */
WOQLClient.prototype.info = function () {
  const url = `${this.api()}info`;
  return this.dispatch(CONST.GET, url).then((response) => response);
};

/**
 * Executes a WOQL query on the specified database and returns the results
 * @param {WOQLQuery} woql - an instance of the WOQLQuery class
 * @param {string} [commitMsg] - a message describing the reason for the change that will
 * be written into the commit log (only relevant if the query contains an update)
 * @param {boolean} [allWitnesses]
 * @param {string} [lastDataVersion] - If passed it will be used for data version tracking
 * @param {string} [getDataVersion] - If true it the function will return object having result
 * and dataVersion
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * const result = await client.query(WOQL.star())
 */
WOQLClient.prototype.query = function(woql, commitMsg, allWitnesses, lastDataVersion='', getDataVersion=false) {
    allWitnesses = allWitnesses || false
    commitMsg = commitMsg || 'Commit generated with javascript client without message'
    if (woql && woql.json && (!woql.containsUpdate() || commitMsg)) {
        let doql = woql.containsUpdate() ? this.generateCommitInfo(commitMsg) : {}
        doql.query = woql.json()

        let postBody;

        if(doql.query.resource && doql.query.resource['@type'] === 'QueryResource' && doql.query.resource.source.post) {
          const fileName = doql.query.resource.source.post.split('/').pop();

          const formData = new FormData();
          formData.append('file', fs.createReadStream(doql.query.resource.source.post));
          doql.query.resource.source.post = fileName;
          formData.append('payload', Buffer.from(JSON.stringify(doql)), { filename: 'body.json', contentType: 'application/json' });
          this.customHeaders(formData.getHeaders());

          postBody = formData;
        } else {
          postBody = doql;
        }
       
        if (allWitnesses) doql.all_witnesses = true

        if(typeof lastDataVersion === 'string' && lastDataVersion !== '') {
            this.customHeaders({'TerminusDB-Data-Version': lastDataVersion})
        }

        return this.dispatch(CONST.WOQL_QUERY, this.connectionConfig.queryURL(), postBody, getDataVersion)
    }

  let errmsg = 'WOQL query parameter error';
  if (woql && woql.json && woql.containsUpdate() && !commitMsg) {
    errmsg += ' - you must include a textual commit message to perform this update';
  } else {
    errmsg += ' - you must specify a valid WOQL Query';
  }
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.WOQL_QUERY, errmsg)),
  );
};

/**
 * Creates a new branch with a TerminusDB database, starting from the current context of
 * the client (branch / ref)
 * @param {string} newBranchId - local identifier of the new branch the ID of the new branch
 * to be created
 * @param {boolean} [isEmpty] - if isEmpty is true it will create a empty branch.
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.branch("dev")
 */
WOQLClient.prototype.branch = function (newBranchId, isEmpty) {
  if (newBranchId) {
    let source = this.ref()
      ? { origin: `${this.organization()}/${this.db()}/${this.repo()}/commit/${this.ref()}` }
      : {
        origin: `${this.organization()}/${this.db()}/${this.repo()}/branch/${this.checkout()}`,
      };

    if (isEmpty && isEmpty === true) {
      // @ts-ignore
      source = {};
    }
    return this.dispatch(CONST.BRANCH, this.connectionConfig.branchURL(newBranchId), source);
  }
  const errmsg = 'Branch parameter error - you must specify a valid new branch id';
  return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)));
};

/**
 * Squash branch commits
 * @param {string} branchId - local identifier of the new branch
 * @param {string} commitMsg - Textual message describing the reason for the update
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.squashBranch = function (branchId, commitMsg) {
  if (commitMsg && branchId) {
    const commit = this.generateCommitInfo(commitMsg);
    return this.dispatch(
      CONST.SQUASH_BRANCH,
      this.connectionConfig.squashBranchURL(branchId),
      commit,
    );
  }
  const errmsg = 'Branch parameter error - you must specify a valid new branch id and a commit message';
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.SQUASH_BRANCH, errmsg)),
  );
};

/**
 * Reset branch to a commit id, Reference ID or Commit ID are unique hashes that are
 * created whenever a new commit is recorded
 * @param {string} branchId - local identifier of the new branch
 * @param {string} commitId - Reference ID or Commit ID
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.resetBranch = function (branchId, commitId) {
  if (commitId && branchId) {
    // eslint-disable-next-line camelcase
    const commit_descriptor = this.generateCommitDescriptor(commitId);
    return this.dispatch(
      CONST.RESET_BRANCH,
      this.connectionConfig.resetBranchUrl(branchId),
      commit_descriptor,
    );
  }
  const errmsg = 'Branch parameter error - you must specify a valid new branch id and a commit message';
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.RESET_BRANCH, errmsg)),
  );
};

/**
 * Optimize db branch
 * @param {string} branchId - local identifier of the new branch
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.optimizeBranch = function (branchId) {
  if (branchId) {
    return this.dispatch(
      CONST.OPTIMIZE_SYSTEM,
      this.connectionConfig.optimizeBranchUrl(branchId),
      {},
    );
  }
  const errmsg = 'Branch parameter error - you must specify a valid branch id';
  return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)));
};

/**
 * Deletes a branch from database
 * @param {string} branchId - local identifier of the branch
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.deleteBranch = function (branchId) {
  if (branchId) {
    return this.dispatch(CONST.DELETE, this.connectionConfig.branchURL(branchId));
  }
  const errmsg = 'Branch parameter error - you must specify a valid new branch id';
  return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)));
};

/**
 * Pull changes from a branch on a remote database to a branch on a local database
 * @param {typedef.RemoteRepoDetails} remoteSourceRepo - an object describing the source of the pull
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.pull({remote: "origin", remote_branch: "main", message: "Pulling from remote"})
 */
WOQLClient.prototype.pull = function (remoteSourceRepo) {
  const rc_args = this.prepareRevisionControlArgs(remoteSourceRepo);
  if (rc_args && rc_args.remote && rc_args.remote_branch) {
    return this.dispatch(CONST.PULL, this.connectionConfig.pullURL(), rc_args);
  }
  const errmsg = 'Pull parameter error - you must specify a valid remote source and branch to pull from';
  return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.PULL, errmsg)));
};

/**
 * Fetch updates to a remote database to a remote repository with the local database
 * @param {string} remoteId - if of the remote to fetch (eg: 'origin')
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.fetch = function (remoteId) {
  return this.dispatch(CONST.FETCH, this.connectionConfig.fetchURL(remoteId));
};

/**
 * Push changes from a branch on a local database to a branch on a remote database
 * @param {typedef.RemoteRepoDetails} remoteTargetRepo - an object describing the target of the push
 * {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"}
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.push({remote: "origin", remote_branch: "main", message: "Pulling from remote"})
 */
WOQLClient.prototype.push = function (remoteTargetRepo) {
  const rc_args = this.prepareRevisionControlArgs(remoteTargetRepo);
  if (rc_args && rc_args.remote && rc_args.remote_branch) {
    return this.dispatch(CONST.PUSH, this.connectionConfig.pushURL(), rc_args);
  }
  const errmsg = 'Push parameter error - you must specify a valid remote target';
  return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.PUSH, errmsg)));
};

/**
 * Merges the passed branch into the current one using the rebase operation
 * @param {object} rebaseSource - json describing the source branch to be used as a base
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * //from the branch head
 * client.rebase({rebase_from: "admin/db_name/local/branch/branch_name", message:
 * "Merging from dev")
 * //or from a commit id
 * client.rebase({rebase_from: "admin/db_name/local/commit/9w8hk3y6rb8tjdy961de3i536ntkqd8",
 * message: "Merging from dev")
 */
WOQLClient.prototype.rebase = function (rebaseSource) {
  const rc_args = this.prepareRevisionControlArgs(rebaseSource);
  if (rc_args && rc_args.rebase_from) {
    return this.dispatch(CONST.REBASE, this.connectionConfig.rebaseURL(), rc_args);
  }
  const errmsg = 'Rebase parameter error - you must specify a valid rebase source to rebase from';
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.REBASE, errmsg)),
  );
};

/**
 * Reset the current branch HEAD to the specified commit path
 * @param {string} commitPath - The commit path to set the current branch to
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.reset = function (commitPath) {
  return this.dispatch(CONST.RESET, this.connectionConfig.resetURL(), {
    commit_descriptor: commitPath,
  });
};

/**
 * Clones a remote repo and creates a local copy
 * @param {typedef.CloneSourceDetails} cloneSource - object describing the source branch
 * to be used as a base
 * @param {string} newDbId - id of the new cloned database on the local server
 * @param {string} [orgId] - id of the local organization that the new cloned database
 * will be created in (in desktop mode this is always “admin”)
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.clonedb({remote_url: "https://my.terminusdb.com/myorg/mydb", label "Cloned DB", comment: "Cloned from mydb"}, newid: "mydb")
 */
WOQLClient.prototype.clonedb = function (cloneSource, newDbId, orgId) {
  orgId = orgId || this.user_organization();
  this.organization(orgId);
  const rc_args = this.prepareRevisionControlArgs(cloneSource);
  if (newDbId && rc_args && rc_args.remote_url) {
    return this.dispatch(CONST.CLONE, this.connectionConfig.cloneURL(newDbId), rc_args);
  }
  const errmsg = 'Clone parameter error - you must specify a valid id for the cloned database';
  return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.BRANCH, errmsg)));
};

/**
 * Common request dispatch function
 * @property {string} action - the action name
 * @property {string} apiUrl - the server call endpoint
 * @property {object} [payload] - the post body
 * @property {boolean} [getDataVersion] - If true return response with data version
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.dispatch = function (action, apiUrl, payload, getDataVersion) {
  if (!apiUrl) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          action,
          this.connectionConfig.connection_error,
        ),
      ),
    );
  }
  // I have to review this I don't want a call everytime
  /* if(this.connectionConfig.tokenParameter){
        const param = this.connectionConfig.tokenParameter
        axios.post(param.url,param.options).then(result=>result.data).then(data=>{
            if(data.access_token){
                console.log("ACCESS_TOKEN",data.access_token)
                this.localAuth({"key":data.access_token,"type":"jwt"})
            }
            return DispatchRequest(
                apiUrl,
                action,
                payload,
                this.localAuth(),
                this.remoteAuth(),
                this.customHeaders(),
            )
        })
    }else{ */
  return DispatchRequest(
    apiUrl,
    action,
    payload,
    this.localAuth(),
    this.remoteAuth(),
    this.customHeaders(),
    getDataVersion,
  );
  // }
};

/**
 * Generates the json structure for commit messages
 * @param {string} msg - textual string describing reason for the change
 * @param {string} [author] - optional author id string - if absent current user id will be used
 * @returns {object}
 */
WOQLClient.prototype.generateCommitInfo = function (msg, author) {
  if (!author) {
    author = this.author();
  }
  const commitInfo = { commit_info: { author, message: msg } };
  return commitInfo;
};

/**
 * Generates the json structure for commit descriptor
 * @param {string} commitId - a valid commit id o
 */
WOQLClient.prototype.generateCommitDescriptor = function (commitId) {
  const cd = this.connectionConfig.commitDescriptorUrl(commitId);
  const ci = { commit_descriptor: cd };
  return ci;
};

/**
 * Adds an author string (from the user object returned by connect) to the commit message.
 * @param {object} [rc_args]
 * @returns {object | boolean}
 */
WOQLClient.prototype.prepareRevisionControlArgs = function (rc_args) {
  if (!rc_args || typeof rc_args !== 'object') return false;
  if (!rc_args.author) rc_args.author = this.author();
  return rc_args;
};

/**
 *  update the database details
 * @param {object} dbDoc - an object that describe the database details
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.updateDatabase = function (dbDoc) {
  const dbid = dbDoc.id || this.db();
  const org = dbDoc.organization || this.organization();
  return this.createDatabase(dbid, dbDoc, org);
};

/**
 * to add a new document or a list of new documents into the instance or the schema graph.
 * @param {object} json
 * @param {typedef.DocParamsPost} [params] - the post parameters
 * @param {string} [dbId] - the dbid
 * @param {message} [string] - the insert commit message
 * @param {string} [lastDataVersion] If passed it will be used for data version tracking.
 * @param {string} [getDataVersion] If true it the function will return object having result
 * and dataVersion.
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * const json = [{ "@type" : "Class",
 *              "@id" : "Coordinate",
 *              "@key" : { '@type' : 'Hash',
 *              '@fields' : ['x','y'] },
 *              "x" : "xsd:decimal",
 *              "y" : "xsd:decimal" },
 *              { "@type" : "Class",
 *              "@id" : "Country",
 *              "@key" : { '@type' : 'Lexical',
 *                          '@fields' : [name] },
 *              "name" : "xsd:string",
 *              "perimeter" : { "@type" : "List",
 *                              "@class" : "Coordinate" } }]
 * client.addDocument(json,{"graph_type":"schema"},"mydb","add new schema")
 */

WOQLClient.prototype.addDocument = function (json, params, dbId, message = 'add a new document', lastDataVersion = '', getDataVersion = false) {
  if (dbId) {
    this.db(dbId);
  }

  if (typeof lastDataVersion === 'string' && lastDataVersion !== '') {
    this.customHeaders({ 'TerminusDB-Data-Version': lastDataVersion });
  }

  const docParams = params || {};
  docParams.author = this.author();
  docParams.message = message;
  return this.dispatch(
    CONST.POST,
    this.connectionConfig.documentURL(docParams),
    json,
    getDataVersion,
  );
};

/**
 * Retrieves all documents that match a given document template
 * @param {object} query - the query template
 * @param {typedef.DocParamsGet} [params] - the get parameters
 * @param {string} [dbId] - the database id
 * @param {string} [branch] - the database branch
 * @param {string} [lastDataVersion] If passed it will be used for data version tracking.
 * @param {string} [getDataVersion] If true it the function will return object having result
 * and dataVersion.
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * const query = {
 *   "type": "Person",
 *   "query": { "age": 42 },
 *  }
 * client.queryDocument(query,{"as_list":true})
 */

WOQLClient.prototype.queryDocument = function (query, params, dbId, branch, lastDataVersion = '', getDataVersion = false) {
  if (dbId) {
    this.db(dbId);
  }
  if (branch) {
    this.checkout(branch);
  }
  if (typeof lastDataVersion === 'string' && lastDataVersion !== '') {
    this.customHeaders({ 'TerminusDB-Data-Version': lastDataVersion });
  }

  return this.dispatch(
    CONST.QUERY_DOCUMENT,
    this.connectionConfig.documentURL(params),
    query,
    getDataVersion,
  );
};

/**
 *
 * @param {typedef.DocParamsGet} [params] - the get parameters
 * @param {string} [dbId] - the database id
 * @param {string} [branch] - the database branch
 * @param {string} [lastDataVersion] If passed it will be used for data version tracking.
 * @param {string} [getDataVersion] If true it the function will return object having
 * result and dataVersion.
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * //return the schema graph as a json array
 * client.getDocument({"graph_type":"schema","as_list":true})
 *
 * //retutn the Country class document from the schema graph
 * client.getDocument({"graph_type":"schema","as_list":true,"id":"Country"})
 *
 *
 */
// document interface
WOQLClient.prototype.getDocument = function (params, dbId, branch, lastDataVersion = '', getDataVersion = false) {
  if (dbId) {
    this.db(dbId);
  }
  if (branch) {
    this.checkout(branch);
  }
  if (typeof lastDataVersion === 'string' && lastDataVersion !== '') {
    this.customHeaders({ 'TerminusDB-Data-Version': lastDataVersion });
  }
  return this.dispatch(CONST.GET, this.connectionConfig.documentURL(params), {}, getDataVersion);
};

/**
 *
 * @param {object} json
 * @param {typedef.DocParamsPut} [params] - the Put parameters
 * @param {*} [dbId] - the database id
 * @param {*} [message] - the update commit message
 * @param {string} [lastDataVersion] If passed it will be used for data version tracking.
 * @param {string} [getDataVersion] If true it the function will return object having
 * result and dataVersion.
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */

WOQLClient.prototype.updateDocument = function (json, params, dbId, message = 'update document', lastDataVersion = '', getDataVersion = false) {
  const docParams = params || {};
  docParams.author = this.author();
  docParams.message = message;
  if (dbId) {
    this.db(dbId);
  }
  if (typeof lastDataVersion === 'string' && lastDataVersion !== '') {
    this.customHeaders({ 'TerminusDB-Data-Version': lastDataVersion });
  }
  return this.dispatch(
    CONST.PUT,
    this.connectionConfig.documentURL(docParams),
    json,
    getDataVersion,
  );
};

/**
 * to delete the document
 * @param {typedef.DocParamsDelete} [params]
 * @param {string} [dbId] - the database id
 * @param {string} [message] - the delete message
 * @param {string} [lastDataVersion] If passed it will be used for data version tracking
 * @param {string} [getDataVersion] If true it the function will return object having
 * result and dataVersion
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.deleteDocument({"graph_type":"schema",id:['Country','Coordinate'])
 */

WOQLClient.prototype.deleteDocument = function (params, dbId, message = 'delete document', lastDataVersion = '', getDataVersion = false) {
  const docParams = params || {};
  let payload = null;
  if (Array.isArray(params.id)) {
    payload = params.id;
    delete docParams.id;
  }
  docParams.author = this.author();
  docParams.message = message;
  if (dbId) {
    this.db(dbId);
  }
  if (typeof lastDataVersion === 'string' && lastDataVersion !== '') {
    this.customHeaders({ 'TerminusDB-Data-Version': lastDataVersion });
  }
  return this.dispatch(
    CONST.DELETE,
    this.connectionConfig.documentURL(docParams),
    payload,
    getDataVersion,
  );
};
/**
 * The purpose of this method is to quickly discover the supported fields of a particular type.
 * @param {string} [type] - If given, the type to get information for. If omitted, information
 * for all types is returned
 * @param {string} [dbId] - the database id
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getSchemaFrame("Country")
 */

WOQLClient.prototype.getSchemaFrame = function (type, dbId) {
  let params;
  if (type) params = { type };
  if (dbId) {
    this.db(dbId);
  }
  return this.dispatch(CONST.GET, this.connectionConfig.jsonSchemaURL(params));
};

/**
 * get the database schema in json format
 * @param {string} [dbId] - the database id
 * @param {string} [branch] -  specific a branch/collection
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getSchema()
 */

WOQLClient.prototype.getSchema = function (dbId, branch) {
  const params = { graph_type: 'schema', as_list: true };
  return this.getDocument(params, dbId, branch);
};

/**
 * get all the schema classes (documents,subdocuments,abstracts)
 * @param {string} [dbId] - the database id
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getClasses()
 */

WOQLClient.prototype.getClasses = function (dbId) {
  const params = { graph_type: 'schema', as_list: true, type: 'sys:Class' };
  return this.getDocument(params, dbId);
};

/**
 * get all the Enum Objects
 * @param {string} [dbId]
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getEnums()
 */
WOQLClient.prototype.getEnums = function (dbId) {
  const params = { graph_type: 'schema', as_list: true, type: 'sys:Enum' };
  return this.getDocument(params, dbId);
};

/**
 * get all the Document Classes (no abstract or subdocument)
 * @param {string} [dbId]
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getClassDocuments()
 */
WOQLClient.prototype.getClassDocuments = function (dbId) {
  const params = { graph_type: 'schema', as_list: true, type: 'sys:Class' };
  return this.getDocument(params, dbId).then((result) => {
    let documents = [];
    if (result) {
      documents = result.filter((item) => !item['@subdocument'] && !item['@abstract']);
    }
    return documents;
  });
};

/**
 * get the database collections list
 * @param {string} [dbId] - the database id
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getBranches()
 */
WOQLClient.prototype.getBranches = function (dbId) {
  const params = { type: 'Branch', as_list: true };
  const branch = this.checkout();
  return this.getDocument(params, dbId, '_commits').then((result) => {
    const branchesObj = {};
    if (result) {
      result.forEach((item) => {
        branchesObj[item.name] = item;
      });
    }
    this.checkout(branch);
    return branchesObj;
  });
  // reset branch
};

/**
 * Get the list of the user's organizations and the database related
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * async funtion callGetUserOrganizations(){
 *      await getUserOrganizations()
 *      console.log(client.userOrganizations())
 * }
 */
WOQLClient.prototype.getUserOrganizations = function () {
  // this will be change to give back only the organizations list
  return this.dispatch(
    CONST.GET,
    this.connectionConfig.userOrganizationsURL(),
  ).then((response) => {
    const orgList = Array.isArray(response) ? response : [];
    this.userOrganizations(orgList);
    return orgList;
  });
};

/**
 * Get/Set the list of the user's organizations (id, organization, label, comment).
 * @param {array} [orgList] a list of user's Organization
 * @returns {array} the user Organizations list
 * @example
 * async funtion callGetUserOrganizations(){
 *      await client.getUserOrganizations()
 *      console.log(client.userOrganizations())
 * }
 */
WOQLClient.prototype.userOrganizations = function (orgList) {
  if (orgList) this.organizationList = orgList;
  return this.organizationList || [];
};

/**
 * Get the patch of difference between two documents.
 * @param {object} before - The current state of JSON document
 * @param {object} after - The updated state of JSON document
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 *  const diff = await client.getDiff(
 *      { "@id": "Person/Jane", "@type": "Person", name: "Jane" },
 *      { "@id": "Person/Jane", "@type": "Person", name: "Janine" }
 *  );
 */
WOQLClient.prototype.getDiff = function (before, after) {
  if (typeof before !== 'object' || typeof after !== 'object') {
    const errmsg = '"before" or "after" parameter error - you must specify a valid before or after json document';

    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET_DIFF, errmsg)),
    );
  }

  const payload = { before, after };
  return this.dispatch(
    CONST.POST,
    `${this.connectionConfig.apiURL()}diff`,
    payload,
  ).then((response) => response);
};

/**
 * Patch the difference between two documents.
 * @param {object} before - The current state of JSON document
 * @param {object} patch - The patch object
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 *  let diffPatch = await client.getDiff(
 *      { "@id": "Person/Jane", "@type": "Person", name: "Jane" },
 *      { "@id": "Person/Jane", "@type": "Person", name: "Janine" }
 *  );
 *
 * let patch = await client.patch( { "@id": "Person/Jane", "@type": "Person", name: "Jane" },
 * diffPatch);
 */
WOQLClient.prototype.patch = function (before, patch) {
  if (typeof before !== 'object' || typeof patch !== 'object') {
    const errmsg = '"before" or "patch" parameter error - you must specify a valid before or patch json document';

    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.PATCH, errmsg)),
    );
  }
  const payload = { before, patch };

  return this.dispatch(
    CONST.POST,
    `${this.connectionConfig.apiURL()}patch`,
    payload,
  ).then((response) => response);
};

module.exports = WOQLClient;
