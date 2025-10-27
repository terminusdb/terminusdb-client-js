/* eslint-disable camelcase */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/// /@ts-check
const FormData = require('form-data');
const fs = require('fs');
const { Buffer } = require('buffer');
const typedef = require('./typedef');
const CONST = require('./const');
const DispatchRequest = require('./dispatchRequest');
const ErrorMessage = require('./errorMessage');
const ConnectionConfig = require('./connectionConfig');
const WOQL = require('./woql');
const WOQLQuery = require('./query/woqlCore');

/**
 * @typedef {import('./typedef').NamedResourceData} NamedResourceData
 */

/**
 * @license Apache Version 2
 * @class
 * @classdesc The core functionality of the TerminusDB javascript client is
 * defined in the WOQLClient class - in the woqlClient.js file. This class provides
 * methods which allow you to directly get and set all of the configuration and API
 * endpoints of the client. The other parts of the WOQL core - connectionConfig.js
 * and connectionCapabilities.js - are used by the client to store internal state - they
 * should never have to be accessed directly. For situations where you want to communicate
 * with a TerminusDB server API, the WOQLClient class is all you will need.
 */
class WOQLClient {
  connectionConfig = null;

  databaseList = [];

  organizationList = [];

  /**
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
  constructor(serverUrl, params) {
    this.connectionConfig = new ConnectionConfig(serverUrl, params);
  }
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

WOQLClient.prototype.CONST = CONST;

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
 * Checks if a database exists
 *
 * Returns true if a DB exists and false if it doesn't. Other results
 * throw an exception.
 * @param {string} [orgName] the organization id to set the context to
 * @param {string} [dbName] the db name to set the context to
 * @returns {Promise}
 * @example
 * async function executeIfDatabaseExists(f){
 *      const hasDB = await client.hasDatabase("admin", "testdb")
 *      if (hasDB) {
 *          f()
 *      }
 * }
 */
WOQLClient.prototype.hasDatabase = async function (orgName, dbName) {
  const dbCheckUrl = `${this.connectionConfig.apiURL()}db/${orgName}/${dbName}`;
  return new Promise((resolve, reject) => {
    this.dispatch(CONST.HEAD, dbCheckUrl).then((req) => {
      resolve(true);
    }).catch((err) => {
      if (err.status === 404) {
        resolve(false);
      } else {
        reject(err);
      }
    });
  });
};

/**
 * Gets the organization's databases list.
 *
 * If no organization has been set up, the function throws an exception
 * @returns {Promise}
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
 * @param {string} [dbName] - the datbase name
 * @returns {object} the database description object
 */
WOQLClient.prototype.databaseInfo = function (dbName) {
  // const dbIdVal = dbId || this.db();
  // const orgIdVal = orgId || this.organization()
  const database = this.databases().find((element) => element.name === dbName);
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
// eslint-disable-next-line consistent-return
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
 * You can call this to get the server info or override the start params
 * configuration, this.connectionConfig.server will be used if present,
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
 * Update a database in TerminusDB server
 * @param {typedef.DbDoc} dbDoc - object containing details about the database to be updated
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.updateDatabase({id: "mydb", label: "My Database", comment: "Testing"})
 */
WOQLClient.prototype.updateDatabase = function (dbDoc) {
  const dbid = dbDoc.id || this.db();
  this.organization(dbDoc.organization || this.organization());
  if (dbid) {
    this.db(dbid);
    return this.dispatch(CONST.PUT, this.connectionConfig.dbURL(), dbDoc);
  }
  const errmsg = `Update database error - you must specify a valid database id - ${dbid} is invalid`;
  return Promise.reject(
    new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_DATABASE, errmsg)),
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

// Get Resource objects from WOQL query
function getResourceObjects(queryObject, result_array) {
  if (queryObject instanceof Array) {
    for (let i = 0; i < queryObject.length; i += 1) {
      getResourceObjects(queryObject[i], result_array);
    }
  } else {
    const keys = Object.keys(queryObject);

    for (let i = 0; i < keys.length; i += 1) {
      if (keys[i] === 'resource') {
        if (queryObject[keys[i]]['@type'] && queryObject[keys[i]]['@type'] === 'QueryResource') {
          result_array.push(queryObject[keys[i]]);
        }
      }
      if (queryObject[keys[i]] instanceof Object || queryObject[keys[i]] instanceof Array) {
        getResourceObjects(queryObject[keys[i]], result_array);
      }
    }
  }
}

/**
 * Executes a WOQL query on the specified database and returns the results
 * @param {WOQLQuery} woql - an instance of the WOQLQuery class
 * @param {string} [commitMsg] - a message describing the reason for the change that will
 * be written into the commit log (only relevant if the query contains an update)
 * @param {boolean} [allWitnesses]
 * @param {string} [lastDataVersion] the last data version tracking id.
 * @param {boolean} [getDataVersion] If true the function will return object having result
 * and dataVersion.
 * @param {Array<NamedResourceData>} [resources] csv resources supplied as strings
 * @returns {Promise}  A promise that returns the call response object or object having *result*
 * and *dataVersion* object if ***getDataVersion*** parameter is true, or an Error if rejected.
 * @example
 * const result = await client.query(WOQL.star())
 */
WOQLClient.prototype.query = function (woql, commitMsg, allWitnesses, lastDataVersion = '', getDataVersion = false, resources = []) {
  allWitnesses = allWitnesses || false;
  commitMsg = commitMsg || 'Commit generated with javascript client without message';

  const providedResourcesLookupMap = (resources ?? [])
    .reduce((map, res) => ({ ...map, [(res.filename).split('/').pop()]: res.data }), {});

  if (woql?.json && (!woql.containsUpdate() || commitMsg)) {
    const doql = woql.containsUpdate() ? this.generateCommitInfo(commitMsg) : {};
    doql.query = woql.json();

    let postBody;
    const resourceObjects = [];
    getResourceObjects(doql.query, resourceObjects);

    if (resourceObjects.length > 0) {
      const formData = new FormData();

      resourceObjects.forEach((resourceObject) => {
        const providedResourceInsteadOfFile = typeof resourceObject.source.post === 'string'
          ? providedResourcesLookupMap?.[resourceObject.source.post.split('/').pop()]
          : undefined;

        const fileName = resourceObject.source.post.split('/').pop();

        if (providedResourceInsteadOfFile) {
          formData.append('file', Buffer.from(providedResourceInsteadOfFile), { filename: fileName, contentType: 'application/csv' });
        } else {
          formData.append('file', fs.createReadStream(resourceObject.source.post));
        }
        resourceObject.source.post = fileName;
      });

      formData.append('payload', Buffer.from(JSON.stringify(doql)), { filename: 'body.json', contentType: 'application/json' });
      if (formData.getHeaders) {
        this.customHeaders(formData.getHeaders());
      } else {
        this.customHeaders({ 'Content-Type': 'multipart/form-data' });
      }

      postBody = formData;
    } else {
      postBody = doql;
    }

    if (allWitnesses) doql.all_witnesses = true;

    if (typeof lastDataVersion === 'string' && lastDataVersion !== '') {
      this.customHeaders({ 'TerminusDB-Data-Version': lastDataVersion });
    }

    // eslint-disable-next-line max-len
    return this.dispatch(CONST.WOQL_QUERY, this.connectionConfig.queryURL(), postBody, getDataVersion);
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
    return this.dispatch(
      CONST.RESET_BRANCH,
      this.connectionConfig.resetBranchUrl(branchId),
      { commit_descriptor: commitId },
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
 * Creates a new remote connection for the database
 * @param {string} remoteName - The name of the remote to create
 * @param {string} remoteLocation - The URL of the remote repository
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.createRemote("origin", "http://remote.server.com/org/db")
 */
WOQLClient.prototype.createRemote = function (remoteName, remoteLocation) {
  if (!remoteName || typeof remoteName !== 'string') {
    const errmsg = 'Create remote parameter error - you must specify a valid remote name';
    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_REMOTE, errmsg)),
    );
  }
  if (!remoteLocation || typeof remoteLocation !== 'string') {
    const errmsg = 'Create remote parameter error - you must specify a valid remote location URL';
    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_REMOTE, errmsg)),
    );
  }
  return this.dispatch(
    CONST.POST,
    this.connectionConfig.remoteURL(),
    { remote_name: remoteName, remote_location: remoteLocation },
  );
};

/**
 * Gets information about a remote connection
 * @param {string} remoteName - The name of the remote to retrieve
 * @returns {Promise} A promise that returns the remote details, or an Error if rejected.
 * @example
 * const remote = await client.getRemote("origin")
 */
WOQLClient.prototype.getRemote = function (remoteName) {
  if (!remoteName || typeof remoteName !== 'string') {
    const errmsg = 'Get remote parameter error - you must specify a valid remote name';
    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET_REMOTE, errmsg)),
    );
  }
  const url = `${this.connectionConfig.remoteURL()}?remote_name=${encodeURIComponent(remoteName)}`;
  return this.dispatch(CONST.GET, url);
};

/**
 * Updates an existing remote connection
 * @param {string} remoteName - The name of the remote to update
 * @param {string} remoteLocation - The new URL for the remote repository
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.updateRemote("origin", "http://new.remote.server.com/org/db")
 */
WOQLClient.prototype.updateRemote = function (remoteName, remoteLocation) {
  if (!remoteName || typeof remoteName !== 'string') {
    const errmsg = 'Update remote parameter error - you must specify a valid remote name';
    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_REMOTE, errmsg)),
    );
  }
  if (!remoteLocation || typeof remoteLocation !== 'string') {
    const errmsg = 'Update remote parameter error - you must specify a valid remote location URL';
    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_REMOTE, errmsg)),
    );
  }
  return this.dispatch(
    CONST.PUT,
    this.connectionConfig.remoteURL(),
    { remote_name: remoteName, remote_location: remoteLocation },
  );
};

/**
 * Deletes a remote connection
 * @param {string} remoteName - The name of the remote to delete
 * @returns {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.deleteRemote("origin")
 */
WOQLClient.prototype.deleteRemote = function (remoteName) {
  if (!remoteName || typeof remoteName !== 'string') {
    const errmsg = 'Delete remote parameter error - you must specify a valid remote name';
    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_REMOTE, errmsg)),
    );
  }
  const url = `${this.connectionConfig.remoteURL()}?remote_name=${encodeURIComponent(remoteName)}`;
  return this.dispatch(CONST.DELETE, url);
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
 * @property {boolean} [compress] - If true, compress the data if it is bigger than 1024 bytes
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 */
WOQLClient.prototype.dispatch = function (
  action,
  apiUrl,
  payload,
  getDataVersion,
  compress = false,
) {
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
    compress,
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
 * to add a new document or a list of new documents into the instance or the schema graph.
 * @param {object} json
 * @param {typedef.DocParamsPost} [params] - the post parameters {@link #typedef.DocParamsPost}
 * @param {string} [dbId] - the dbid
 * @param {message} [string] - the insert commit message
 * @param {string} [lastDataVersion] the last data version tracking id.
 * @param {boolean} [getDataVersion] If true the function will return object having result
 * and dataVersion.
 * @returns {Promise}  A promise that returns the call response object or object having *result*
 * and *dataVersion* object if ***getDataVersion*** parameter is true, or an Error if rejected.
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
 * client.addDocument(json,{"graph_type":"schema"},"mydb","add new schema documents")
 *
 * //if we would like to override the entire schema
 * const json = [
 * {"@base": "terminusdb:///data/",
 *       "@schema": "terminusdb:///schema#",
 *       "@type": "@context"
 *   },
 *   {
 *       "@id": "Person",
 *        "@key": {
 *           "@type": "Random"
 *       },
 *       "@type": "Class",
 *       "name": {
 *           "@class": "xsd:string",
 *           "@type": "Optional"
 *       }
 *   }]
 *
 * // client.addDocument(json,{"graph_type":"schema","full_replace:true"},
      "mydb","update the all schema");
 *
 * // Here we will pass true to show how to get dataVersion
 *
 * const response = await client.addDocument(json, {"graph_type": "schema"},
 *   "mydb",
 *   "add new schema", '',
 *   true
 * )
 * console.log(response);
 *
 *  // This will output:
 *  // {
 *  //   result: [ ...... ],
 *  //   dataVersion: 'branch:5fs681tlycnn6jh0ceiqcq4qs89pdfs'
 *  // }
 *
 *  // Now we can use the data version we recieved as a response in previous
 *  // function call and used it is next function call as lastDataVersion
 *
 * const response1 = await client.addDocument(json, {"graph_type": "schema"},
 *   "mydb",
 *   "add new schema", response.dataVersion,
 * )
 */
WOQLClient.prototype.addDocument = function (json, params, dbId, message = 'add a new document', lastDataVersion = '', getDataVersion = false, compress = false) {
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
    compress,
  );
};

/**
 * Use {@link #getDocument} instead.
 * @deprecated
 *
 * Retrieves all documents that match a given document template
 * @param {object} query - the query template
 * @param {typedef.DocParamsGet} [params] - the get parameters
 * @param {string} [dbId] - the database id
 * @param {string} [branch] - the database branch
 * @param {string} [lastDataVersion] the last data version tracking id.
 * @param {boolean} [getDataVersion] If true the function will return object having result
 * and dataVersion.
 * @returns {Promise}  A promise that returns the call response object or object having *result*
 * and *dataVersion* object if ***getDataVersion*** parameter is true, or an Error if rejected.
 * @example
 * const query = {
 *   "type": "Person",
 *   "query": { "age": 42 },
 *  }
 * client.queryDocument(query, {"as_list":true})
 *
 *
 * // Here we will pass true to show how to get dataVersion
 * const query = {
 *   "type": "Person",
 *   "query": { "age": 42 },
 *  }
 *
 * const response = await client.queryDocument(query, {"as_list": true}, '', '','',true);
 * console.log(response);
 *
 *  // This will output:
 *  // {
 *  //   result: [
 *  //     {
 *  //       '@id': 'Person/052d60ffbd114bf5e7331b03f07fcb7',
 *  //       '@type': 'Person',
 *  //       age: 42,
 *  //       name: 'John',
 *  //     },
 *  //   ],
 *  //   dataVersion: 'branch:5fs681tlycnn6jh0ceiqcq4qs89pdfs'
 *  // }
 *
 *  // Now we can use the data version we recieved as a response in previous
 *  // query and used it is next query as lastDataVersion
 *  const query = {
 *   "type": "Person",
 *   "query": { "age": 18 },
 *  }
 *
 *  const response1 = await client.queryDocument(query, {"as_list": true}, '',
 *    '',
 *    response.dataVersion
 *  );
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
 * @param {typedef.DocParamsGet} [params] - the get parameters,
 * you can pass document query search template with the params
 * @param {string} [dbId] - the database id
 * @param {string} [branch] - the database branch
 * @param {string} [lastDataVersion] the last data version tracking id.
 * @param {boolean} [getDataVersion] If true the function will return object having result
 * and dataVersion.
 * @param {object} [query] document query search template
 * @returns {Promise}  A promise that returns the call response object or object having *result*
 * and *dataVersion* object if ***getDataVersion*** parameter is true, or an Error if rejected.
 * @example
 * //return the schema graph as a json array
 * client.getDocument({"graph_type":"schema","as_list":true}).then(result={
 *    console.log(result)
 * })
 *
 * //retutn the Country class document from the schema graph
 * client.getDocument({"graph_type":"schema","as_list":true,"id":"Country"}).then(result={
 *    console.log(result)
 * })
 *
 * //pass a document query template to query the document interface
 * const queryTemplate = { "name": "Ireland"}
 * client.getDocument({"as_list":true, "@type":"Country"
 *            query:queryTemplate}).then(result=>{
 *    console.log(result)
 * })
 *
 *
 * // Here we will pass true to show how to get dataVersion
 * const response = await client.getDocument({"graph_type":"schema","as_list":true},
 *   "",
 *   "",
 *   "",
 *   true
 * )
 * console.log(response);
 *
 *  // This will output:
 *  // {
 *  //   result: [ ...... ],
 *  //   dataVersion: 'branch:5fs681tlycnn6jh0ceiqcq4qs89pdfs'
 *  // }
 *
 *  // Now we can use the data version we recieved as a response in previous
 *  // function call and used it is next function call as lastDataVersion
 *
 * const response1 = await client.getDocument({"graph_type":"schema","as_list":true},
 *   "",
 *   "",
 *   response.dataVersion,
 * )
 */
// document interface
WOQLClient.prototype.getDocument = function (params, dbId, branch, lastDataVersion = '', getDataVersion = false, query = undefined) {
  if (dbId) {
    this.db(dbId);
  }
  if (branch) {
    this.checkout(branch);
  }
  if (typeof lastDataVersion === 'string' && lastDataVersion !== '') {
    this.customHeaders({ 'TerminusDB-Data-Version': lastDataVersion });
  }
  let queryDoc;
  if (query) {
    queryDoc = query;
  } else if (params && typeof params === 'object' && params.query) {
    queryDoc = { query: params.query };
    delete params.query;
  }
  // if query we are send a get with a payload

  if (queryDoc) {
    return this.dispatch(
      CONST.QUERY_DOCUMENT,
      this.connectionConfig.documentURL(params),
      queryDoc,
      getDataVersion,
    );
  }

  return this.dispatch(CONST.GET, this.connectionConfig.documentURL(params), {}, getDataVersion);
};

/**
 *
 * @param {object} json
 * @param {typedef.DocParamsPut} [params] - the Put parameters {@link #typedef.DocParamsPut}
 * @param {*} [dbId] - the database id
 * @param {*} [message] - the update commit message
 * @param {string} [lastDataVersion] the last data version tracking id.
 * @param {boolean} [getDataVersion] If true the function will return object having result
 * and dataVersion.
 * @param {boolean} [compress] If true, the function will create a new document if it doesn't exist.
 * @param {boolean} [create] Perform an *upsert* which inserts if the document
 * is not present (also works on nested documents)
 * @returns {Promise}  A promise that returns the call response object or object having *result*
 * and *dataVersion* object if ***getDataVersion*** parameter is true, or an Error if rejected.
 * @example
 * client.updateDocument(
 * {
 *  "@id": "Person",
 *    "@key": {
 *      "@type": "Random",
 *    },
 *    "@type": "Class",
 *    label: "xsd:string",
 *  },
 * { graph_type: "schema" }
 * );
 *
 *
 * // Here we will pass true to show how to get dataVersion
 *
    const response = await client.updateDocument(
      {
        "@id": "Person",
        "@key": {
          "@type": "Random",
        },
        "@type": "Class",
        label: "xsd:string",
      },
      { graph_type: "schema" },
      "",
      "",
      "",
      true
    );
 * console.log(response);
 *
 *  // This will output:
 *  // {
 *  //   result: [ ...... ],
 *  //   dataVersion: 'branch:5fs681tlycnn6jh0ceiqcq4qs89pdfs'
 *  // }
 *
 *  // Now we can use the data version we recieved as a response in previous
 *  // function call and used it is next function call as lastDataVersion
 *
 * const response1 = await client.updateDocument(
      {
        "@id": "Person",
        "@key": {
          "@type": "Random",
        },
        "@type": "Class",
        label: "xsd:string",
      },
      { graph_type: "schema" },
      "",
      "",
      response.dataVersion
    );
 *
 *  // update a document and create the linked document together
 *  // we are update the document "Person/Person01"
 *  // and create a new document {"@type": "Person","name": "child01"} at the same time
 *  const response1 = await client.updateDocument(
     {
      "@id": "Person/Person01",
      "@type": "Person",
      "name": "Person01"
      "children":[{"@type": "Person","name": "child01"}]
    },{create:true})
 */
WOQLClient.prototype.updateDocument = function (json, params, dbId, message = 'update document', lastDataVersion = '', getDataVersion = false, compress = false, create = false) {
  const docParams = params || {};
  docParams.author = this.author();
  docParams.message = message;
  if (create) {
    docParams.create = create;
  }
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
    compress,
  );
};

/**
 * to delete the document
 * @param {typedef.DocParamsDelete} [params]
 * @param {string} [dbId] - the database id
 * @param {string} [message] - the delete message
 * @param {string} [lastDataVersion] the last data version tracking id.
 * @param {boolean} [getDataVersion] If true the function will return object having result
 * and dataVersion.
 * @returns {Promise}  A promise that returns the call response object or object having *result*
 * and *dataVersion* object if ***getDataVersion*** parameter is true, or an Error if rejected.
 * @example
 * client.deleteDocument({"graph_type":"schema",id:['Country','Coordinate']})
 *
 *
 * // Here we will pass true to show how to get dataVersion
 *
 * const response = await client.deleteDocument({"graph_type":"schema",id:['Country','Coordinate']},
 *   "",
 *   "",
 *   "",
 *   true
 * )
 * console.log(response);
 *
 *  // This will output:
 *  // {
 *  //   result: [ ...... ],
 *  //   dataVersion: 'branch:5fs681tlycnn6jh0ceiqcq4qs89pdfs'
 *  // }
 *
 *  // Now we can use the data version we recieved as a response in previous
 *  // function call and used it is next function call as lastDataVersion
 *
 * const response1 = await client.deleteDocument({"graph_type":"schema",
 *   id:['Country','Coordinate']},
 *   "",
 *   "",
 *   response.dataVersion,
 * )
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
 * get the database collections list
 * @param {number} [start=0] - where to start printing the commit
 *    information in the log (starting from the head of the current branch)
 * @param {number} [count=1] - The number of total commit log records to return
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getCommitsLog(count=10)
 */
WOQLClient.prototype.getCommitsLog = function (start = 0, count = 1) {
  return this.dispatch(
    CONST.GET,
    `${this.connectionConfig.log()}?start=${start}&count=${count}`,
  );
};

/**
 * get the database prefixes object
 * @param {string} [dbId] - the database id
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getPrefixes()
 * //return object example
 * {
 * '@base': 'terminusdb:///data/',
 * '@schema': 'terminusdb:///schema#',
 * '@type': 'Context'}
 */
WOQLClient.prototype.getPrefixes = function (dbId) {
  if (dbId) this.db(dbId);
  return this.dispatch(
    CONST.GET,
    this.connectionConfig.prefixesURL(),
  );
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
 * Apply a patch object to another object
 * @param {object} before - The current state of JSON document
 * @param {object} patch - The patch object
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.patch(
 *      { "@id" : "Person/Jane", "@type" : "Person", "name" : "Jane"},
 *      { "name" : { "@op" : "ValueSwap", "@before" : "Jane", "@after": "Janine" }}
 *  ).then(patchResult=>{
 *  console.log(patchResult)
 * })
 * //result example
 * //{ "@id" : "Person/Jane", "@type" : "Person", "name" : "Jannet"}
 */
WOQLClient.prototype.patch = function (before, patch) {
  if (typeof before !== 'object' || typeof patch !== 'object') {
    const errmsg = '"before" or "after" parameter error - you must specify a valid before and after json document';

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

/**
 * Apply a patch object to the current resource
 * @param {array} patch - The patch object
 * @param {string} message - The commit message
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * const patch = [
 *   {
 *    "@id": "Obj/id1",
 *     "name": {
 *      "@op": "SwapValue",
 *       "@before": "foo",
 *       "@after": "bar"
 *     }
 *   },
 *  {
 *    "@id": "Obj/id2",
 *     "name": {
 *       "@op": "SwapValue",
 *       "@before": "foo",
 *      "@after": "bar"
 *     }
 *  }
 * ]
 * client.db("mydb")
 * client.checkout("mybranch")
 * client.patchResource(patch,"apply patch to mybranch").then(patchResult=>{
 *  console.log(patchResult)
 * })
 * // result example
 * // ["Obj/id1",
 * // "Obj/id2"]
 * // or conflict error 409
 * // {
 * // "@type": "api:PatchError",
 * // "api:status": "api:conflict",
 * // "api:witnesses": [
 * //  {
 * //   "@op": "InsertConflict",
 * //    "@id_already_exists": "Person/Jane"
 * //  }
 * //]
 * //}
 */
WOQLClient.prototype.patchResource = function (patch, message) {
  if (!Array.isArray(patch)) {
    const errmsg = '"patch" parameter error - you must specify a valid patch document';

    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.PATCH, errmsg)),
    );
  }
  const payload = { patch, author: this.author(), message };

  return this.dispatch(
    CONST.POST,
    this.connectionConfig.patchURL(),
    payload,
  ).then((response) => response);
};

/**
 * Get the patch of difference between two documents.
 * @param {object} before - The current state of JSON document
 * @param {object} after - The updated state of JSON document
 * @param {object} [options] - {keep:{}} Options to send to the diff endpoint.
 * The diff api outputs the changes between the input,
 * in options you can list the properties that you would like to see in the diff result in any case.
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.getJSONDiff(
 *      { "@id": "Person/Jane", "@type": "Person", name: "Jane" },
 *      { "@id": "Person/Jane", "@type": "Person", name: "Janine" }
 *  ).then(diffResult=>{
 *  console.log(diffResult)
 * })
 * //result example
 * //{'@id': 'Person/Jane',
 * // name: { '@after': 'Janine', '@before': 'Jane', '@op': 'SwapValue' }}
 */
WOQLClient.prototype.getJSONDiff = function (before, after, options) {
  if (typeof before !== 'object' || typeof after !== 'object') {
    const errmsg = '"before" or "after" parameter error - you must specify a valid before or after json document';

    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET_DIFF, errmsg)),
    );
  }
  const opt = (typeof options === 'undefined') ? {} : options;
  const payload = { before, after, ...opt };

  return this.dispatch(
    CONST.POST,
    `${this.connectionConfig.apiURL()}diff`,
    payload,
  ).then((response) => response);
};

/**
 * Get the patch of difference between two documents.
 * @param {string} dataVersion - The version from which to compare the object
 * @param {object} jsonObject - The updated state of JSON document
 * @param {string} id - The document id to be diffed
 * @param {object} [options] - {keep:{}} Options to send to the diff endpoint
 * the diff api outputs the changes between the input,
 * but you can list the properties that you would like to see in the diff result in any case.
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * const jsonObj =  { "@id": "Person/Jane", "@type": "Person", name: "Janine" }
 * client.getVersionObjectDiff("main",jsonObj
 *      "Person/Jane").then(diffResp=>{
 *    console.log(diffResp)
 * })
 */
WOQLClient.prototype.getVersionObjectDiff = function (dataVersion, jsonObject, id, options) {
  if (typeof jsonObject !== 'object' || typeof dataVersion !== 'string' || typeof id !== 'string') {
    const errmsg = 'Parameters error - you must specify a valid jsonObject document, a valid branch or commit and a valid id';

    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET_DIFF, errmsg)),
    );
  }
  const opt = options || {};
  const payload = {
    after: jsonObject,
    before_data_version: dataVersion,
    id,
    ...opt,
  };
  return this.dispatch(
    CONST.POST,
    this.connectionConfig.diffURL(),
    payload,
  ).then((response) => response);
};

/**
 * Get the patch of difference between branches or commits.
 * @param {string} beforeVersion - Before branch/commit to compare
 * @param {string} afterVersion -  After branch/commit to compare
 * @param {string} [id] - The document id to be diffed,
 * if it is omitted all the documents will be compared
 * @param {typedef.DiffObject} [options] - {keep:{},count:10,start:0}
 * Options to send to the diff endpoint.
 * The diff api outputs the changes between the input (branches or commits),
 * in options you can list the properties that you would like to see in the diff result in any case.
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * //This is to view all the changes between two commits
 * const beforeCommit = "a73ssscfx0kke7z76083cgswszdxy6l"
 * const afterCommit = "73rqpooz65kbsheuno5dsayh71x7wf4"
 *
 * client.getVersionDiff( beforeCommit, afterCommit).then(diffResult=>{
 *  console.log(diffResult)
 * })
 *
 * //This is to view the changes between two commits but only for the given document
 * client.getVersionDiff( beforeCommit, afterCommit, "Person/Tom").then(diffResult=>{
 *  console.log(diffResult)
 * })
 *
 * //This is to view the changes between a branch (head) and a commit for the given document
 * client.getVersionDiff("main", afterCommit, "Person/Tom" ).then(diffResult=>{
 *    console.log(diffResult)
 * })
 *
 * //This is to view the changes between two branches with the keep options
 * const options = {"keep":{"@id":true, "name": true}, start:0, count:10}
 * client.getVersionDiff("main","mybranch",options).then(diffResult=>{
 *    console.log(diffResult)
 * })
 */
WOQLClient.prototype.getVersionDiff = function (beforeVersion, afterVersion, id, options) {
  if (typeof beforeVersion !== 'string' || typeof afterVersion !== 'string') {
    const errmsg = 'Error, you have to provide a beforeVersion and afterVersion input';

    return Promise.reject(
      new Error(ErrorMessage.getInvalidParameterMessage(CONST.GET_DIFF, errmsg)),
    );
  }
  const opt = options || {};
  const payload = {
    before_data_version: beforeVersion,
    after_data_version: afterVersion,
    ...opt,
  };
  if (id) {
    payload.document_id = id;
  }
  // console.log(this.connectionConfig.diffURL())
  return this.dispatch(
    CONST.POST,
    this.connectionConfig.diffURL(),
    payload,
  ).then((response) => response);
};

/**
 * Diff two different commits and apply changes on the current branch/commit.
 * If you would like to change branch or commit before apply use client.checkout("branchName")
 * @param {string} beforeVersion - Before branch/commit to compare
 * @param {string} afterVersion - After branch/commit to compare
 * @param {string} message - apply commit message
 * @param {boolean} [matchFinalState] - the default value is false
 * @param {object} [options] - {keep:{}} Options to send to the apply endpoint
 * @example
 * client.checkout("mybranch")
 * client.apply("mybranch","mybranch_new","merge main").then(result=>{
 *    console.log(result)
 * })
 */
// eslint-disable-next-line max-len
WOQLClient.prototype.apply = function (beforeVersion, afterVersion, message, matchFinalState, options) {
  const opt = options || {};
  const commitMsg = this.generateCommitInfo(message);
  const payload = {
    before_commit: beforeVersion,
    after_commit: afterVersion,
    ...commitMsg,
    ...opt,
  };
  if (matchFinalState) {
    payload.match_final_state = matchFinalState;
  }
  return this.dispatch(
    CONST.POST,
    this.connectionConfig.applyURL(),
    payload,
  ).then((response) => response);
};

/**
 * Get the document's history for a specific database or branch
 * @param {string} id - id of document to report history of
 * @param {typedef.DocHistoryParams} [historyParams]
 * @example
 * //this will return the last 5 commits for the Person/Anna document
 * client.checkout("mybranch")
 * client.docHistory("Person/Anna",{start:0,count:5}).then(result=>{
 *    console.log(result)
 * })
 * //this will return the last and the first commit for the Person/Anna document
 * client.docHistory("Person/Anna",{updated:true,created:true}).then(result=>{
 *    console.log(result)
 * })
 */
// eslint-disable-next-line max-len
WOQLClient.prototype.getDocumentHistory = function (id, historyParams) {
  const params = historyParams || {};
  params.id = id;
  return this.dispatch(
    CONST.GET,
    this.connectionConfig.docHistoryURL(params),
  ).then((response) => response);
};

/**
 * Call a custom Api endpoit
 * @param {string} requestType - The current state of JSON document
 * @param {string} customRequestURL - The patch object
 * @param {object} [payload] - the request payload
 * @returns {Promise}  A promise that returns the call response object, or an Error if rejected.
 * @example
 * client.sendCustomRequest("GET", "http://localhost:3030/changes/").then(result=>{
 *    console.log(result)
 * })
 */
WOQLClient.prototype.sendCustomRequest = function (requestType, customRequestURL, payload) {
  return this.dispatch(
    requestType,
    customRequestURL,
    payload,
  ).then((response) => response);
};

module.exports = WOQLClient;
