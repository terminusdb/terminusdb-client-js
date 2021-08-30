////@ts-check
//connectionConfig
const typedef = require('./typedef')

/**
 * @file Terminus DB connection configuration
 * @license Apache Version 2
 * @description Object representing the state of a connection to a terminus db - these are:
 * provides methods for getting and setting connection parameters
 * @constructor
 * @param {string} serverUrl - the terminusdb server url
 * @param {typedef.ParamsObj} [params] - an object with the following connection parameters:
 */

function ConnectionConfig(serverUrl, params) {
    /**
     * @type {string}
     */
    this.server

    /** @type {typedef.CredentialObj} */
    this.remote_auth //remote auth for authenticating to remote servers for push / fetch / clone

    /** @type {typedef.CredentialObj } */
    this.local_auth // basic auth string for authenticating to local server

    //these operate as cursors - where within the connected server context, we currently are
    /** @type {string | boolean} */
    this.organizationid = false
    /** @type {string | boolean} */
    this.dbid = false

    this.default_branch_id = params && params.default_branch_id ? params.default_branch_id : 'main'
    this.default_repo_id = 'local'
    this.system_db = '_system'
    this.api_extension = 'api/'
    //default repository and branch ids
    this.branchid = this.default_branch_id
    this.repoid = this.default_repo_id
    //set if pointing at a commit within a branch
    /** @type {string | boolean} */
    this.refid = false
    /** @type {string | boolean} */
    this.connection_error = false
    //I can set serverURL only in constructor
    let surl = this.parseServerURL(serverUrl)
   
    this.server = surl
    if (params) this.update(params)
   
}

/**
 * Creates a new connection config object and copies all the state information from this one into it
 * @returns {ConnectionConfig}
 */
ConnectionConfig.prototype.copy = function() {
    let other = new ConnectionConfig(this.server)
    other.remote_auth = this.remote_auth
    other.local_auth = this.local_auth
    other.organizationid = this.organizationid
    other.dbid = this.dbid
    other.branchid = this.branchid
    other.repoid = this.repoid
    other.refid = this.refid
    return other
}

/**
 * updates connection config with new parameters
 * @param {typedef.ParamsObj}  params - an object with the following connection parameters:
 */
ConnectionConfig.prototype.update = function(params) {
    if (!params) return
    const orgID = params.organization || params.user 
    //console.log("orgID",orgID,params)
    this.setOrganization(orgID)
    //if (typeof params.credential !== 'undefined')this.setTokenParameter(params.credential)
    if (typeof params.db !== 'undefined') this.setDB(params.db)
    if (typeof params.jwt !== 'undefined') this.setLocalBasicAuth(params.jwt, params.user, 'jwt')
    else if (typeof params.key !== 'undefined') this.setLocalBasicAuth(params.key, params.user)
    if (typeof params.branch !== 'undefined') this.setBranch(params.branch)
    if (typeof params.ref !== 'undefined') this.setRef(params.ref)
    if (typeof params.repo !== 'undefined') this.setRepo(params.repo)
}

/*ConnectionConfig.prototype.setTokenParameter = function(param){
    this.tokenParameter = param
}*/

/**
 * Simple gets to retrieve current connection status
 * Gets the current server url
 * @returns {string}
 */
ConnectionConfig.prototype.serverURL = function() {
    return this.server
}

/**
 * Simple gets to retrieve current connection status
 * Gets the current server url
 * @returns {string}
 */
 ConnectionConfig.prototype.author = function() {
    return this.author
}

/**
 * Gets the server connection url
 * @returns {string}
 */
ConnectionConfig.prototype.apiURL = function() {
    return this.server + this.api_extension
}

/**
 * Gets the current database id
 * @returns {string | boolean}
 */
ConnectionConfig.prototype.db = function() {
    if(!this.dbid) throw new Error('Invalid database name'); 
    return this.dbid
}

/**
 * Gets the current branch id
 * @returns {string}
 */
ConnectionConfig.prototype.branch = function() {
    return this.branchid
}

/**
 * Gets the current commit ref id
 * @returns {string | boolean}
 */
ConnectionConfig.prototype.ref = function() {
    return this.refid
}

/**
 * Gets the current organization id
 * @returns {string | boolean}
 */
ConnectionConfig.prototype.organization = function() {
    return this.organizationid
}

/**
 * Gets the current organization id
 * @returns {string}
 */
ConnectionConfig.prototype.repo = function() {
    return this.repoid
}

/**
 *Gets the local Authorization credentials
 *return {CredentialObj | boolean}
 */
ConnectionConfig.prototype.localAuth = function() {
    if (this.local_auth) return this.local_auth
    return false
}

/**
 *Gets the local user name
 *return {string | boolean}
 */
ConnectionConfig.prototype.localUser = function() {
    if (this.local_auth) return this.local_auth.user
    return false
}

/**
 *Gets the current user name
 *@param {boolean} [ignoreJwt]
 *return {string | boolean}
 */
ConnectionConfig.prototype.user = function(ignoreJwt) {
    if (!ignoreJwt && this.remote_auth && this.remote_auth.type == 'jwt')
        return this.remote_auth.user
    if (this.local_auth) {
        return this.local_auth.user
    }
    return false
}

/**
 * Check the server URL
 * @param {string} str - the server url string
 * @returns {string}
 */

ConnectionConfig.prototype.parseServerURL = function(str) {
    if (str && (str.substring(0, 7) === 'http://' || str.substring(0, 8) === 'https://')) {
        if (str.lastIndexOf('/') !== str.length - 1) {
            str += '/' //always append slash to ensure regularity
        }
        return str
    }
    //throw an error this is the
    //return false
    throw new Error(`Invalid Server URL: ${str}`);
}

/**
 * Clear cursor for connection
 */
ConnectionConfig.prototype.clearCursor = function() {
    this.branchid = this.default_branch_id
    this.repoid = this.default_repo_id
    this.organizationid = false
    this.dbid = false
    this.refid = false
}

/**
 * @param {string | boolean} errorMessage
 */
ConnectionConfig.prototype.setError = function(errorMessage) {
    this.connection_error = errorMessage
}

/**
 * Set the organization to which the connected db belongs
 * (not the users organization - set in capabilities)
 * @param {string | boolean} [orgId]
 */
ConnectionConfig.prototype.setOrganization = function(orgId = 'admin') {
    this.organizationid = orgId
}

/**
 * Set the local identifier of db
 * @param {string | boolean} dbId - database Id
 */

ConnectionConfig.prototype.setDB = function(dbId) {
    this.dbid = dbId
}

/**
 * Set the repository type |local|remote|
 * @param {typedef.RepoType | string} repoId - for the local server - identifier of repo
 */
ConnectionConfig.prototype.setRepo = function(repoId) {
    this.repoid = repoId
}

/**
 * @param {string} [branchId] - id of branch
 */
ConnectionConfig.prototype.setBranch = function(branchId) {
    this.branchid = branchId || this.default_branch_id
}

/**
 * Set an Reference ID or Commit ID.
 * Commit IDs are unique hashes that are created whenever a new commit is recorded
 * @param {string | boolean} refId - commit reference id
 */
ConnectionConfig.prototype.setRef = function(refId) {
    this.refid = refId
    //return this.refid
}

/**
 * set the local database connection credential
 * @param {string} [remoteKey] - jwt auth api key
 * @param {string} [remoteUserID] - remote user id
 */
ConnectionConfig.prototype.setRemoteBasicAuth = function(remoteKey, remoteUserID) {
    if (!remoteKey) {
        this.remote_auth = undefined
    } else {
        this.remote_auth = {type: 'jwt', user: remoteUserID, key: remoteKey}
    }
}

/**
 * set the local database connection credential
 * @param {string} [userKey] - basic auth api key
 * @param {string} [userId] -  user id
 * @param {string} [type] - basic|jwt 
 */
ConnectionConfig.prototype.setLocalBasicAuth = function(userKey, userId = 'admin', type= 'basic') {
    if (!userKey) {
        this.local_auth = undefined
    } else {
        this.local_auth = {type:type, user: userId, key: userKey}
    }
}

/**
 * Set the local server connection credential
 * @param {typedef.CredentialObj} newCredential
 */
ConnectionConfig.prototype.setLocalAuth = function(newCredential) {
    this.local_auth = newCredential
}

/**
 * Set the remote server connection credential
 * @param {typedef.CredentialObj} newCredential
 */
ConnectionConfig.prototype.setRemoteAuth = function(newCredential) {
    this.remote_auth = newCredential
}

/**
 *Gets the remote Authorization credentials
 *to connect the local db with a remote terminusdb database for push-pull-clone actions
 *return {CredentialObj| boolean}
 */
ConnectionConfig.prototype.remoteAuth = function() {
    if (this.remote_auth) return this.remote_auth
    return false
}

/**
 * Generate the db endpoit url for create / delete db
 * @returns {string}
 */
ConnectionConfig.prototype.dbURL = function() {
    return this.dbBase('db')
}

/**
 * Generate URL for the user's api endpoint
 * @param {string} [user] - the user id
 * @returns {string}
 */

ConnectionConfig.prototype.userURL = function(user) {
    let url = `${this.apiURL()}user`
    if (user) url += `/${encodeURIComponent(user)}`
    return url
}

/**
 * Generate URL for the user's organization api endpoint
 * @param {string} orgId - the organization id
 * @param {string} [action] - the organization id
 * @returns {string}
 */

ConnectionConfig.prototype.organizationURL = function(orgId, action) {
    let url = `${this.apiURL()}organization`
    if (orgId) url += `/${encodeURIComponent(orgId)}`
    if (action) url += `/${encodeURIComponent(action)}`
    return url
}

/**
 * Generate URL for the user's roles api endpoint
 * @returns {string}
 */
ConnectionConfig.prototype.rolesURL = function() {
    return `${this.apiURL()}role`
}

/**
 * Generate URL to update the user's role api endpoint
 * @returns {string}
 */

//REVIEW maybe it can be the same of roleURL but we can change the rest action in put.

ConnectionConfig.prototype.updateRolesURL = function() {
    return `${this.apiURL()}update_role`
}

/**
 * Generate URL for create / delete graph api endpoint
 * @param {string} graphType
 * @returns {string}
 */
ConnectionConfig.prototype.graphURL = function(graphType) {
    return this.branchBase('graph') + `/${graphType}/main`
}

/**
 * Generate URL for get / set schema api endpoint
 * @param {string} graphType
 * @returns {string}
 */
ConnectionConfig.prototype.triplesURL = function(graphType) {
    if (this.db() === this.system_db) var s = this.dbBase('triples')
    else var url = this.branchBase('triples') 
    url += `/${graphType}/main`
    return url
}

/**
 * Generate URL for add / get csv api endpoint
 * @returns {string}
 */

ConnectionConfig.prototype.csvURL = function() {
    var s = this.branchBase('csv')
    return s
}

/**
 * Generate URL for woql query api endpoint
 * @returns {string}
 */
ConnectionConfig.prototype.queryURL = function() {
    if (this.db() == this.system_db) return this.dbBase('woql')
    return this.branchBase('woql')
}


/**
 * get the url to update the organization role in the system database
 * don't change the end point (this is a terminus db server end point)
 * @returns {string}
 */
 ConnectionConfig.prototype.updateOrganizationRoleURL = function() {
    return `${this.apiURL()}update_role`
}

/**
 * Generate URL for clone db endpoint
 * @param  {string} [newRepoId] the repository id
 * @returns {string}
 */
ConnectionConfig.prototype.cloneURL = function(newRepoId) {
    let crl = `${this.apiURL()}clone/${this.organization()}`
    if (newRepoId) crl += `/${newRepoId}`
    return crl
}

/**
 * URL at which a db can be cloned
 * @returns {string}
 */
ConnectionConfig.prototype.cloneableURL = function() {
    return `${this.serverURL()}${this.organization()}/${this.db()}`
}

/**
 * Generate URL for pull endpoint
 * @returns {string}
 */
ConnectionConfig.prototype.pullURL = function() {
    let purl = this.branchBase('pull')
    return purl
}

/**
 * Generate URL for fetch endpoint
 * @param {string} remoteName
 * @returns {string}
 */
ConnectionConfig.prototype.fetchURL = function(remoteName) {
    let purl = this.dbBase('fetch')
    return purl + '/' + remoteName + '/_commits'
}

/**
 * Generate URL for rebase endpoint
 * @returns {string}
 */
ConnectionConfig.prototype.rebaseURL = function() {
    let purl = this.branchBase('rebase')
    return purl
}

/**
 * Generate URL for reset endpoint
 * @returns {string}
 */
ConnectionConfig.prototype.resetURL = function() {
    let purl = this.branchBase('reset')
    return purl
}

/**
 * Generate URL for push endpoint
 * @returns {string}
 */
ConnectionConfig.prototype.pushURL = function() {
    let purl = this.branchBase('push')
    return purl
}

/**
 * Generate URL for branch endpoint
 * @param {string} branchId - the branch id
 * @returns {string}
 */
ConnectionConfig.prototype.branchURL = function(branchId) {
    let url = this.repoBase('branch')
    return url + `/branch/${branchId}`
}

/**
 * Generate URL for branch squash endpoint
 */
ConnectionConfig.prototype.squashBranchURL = function(nuid) {
    let b = this.repoBase('squash')
    return b + `/branch/${nuid}`
}

/**
 * Generate URL for branch reset endpoint
 */
ConnectionConfig.prototype.resetBranchUrl = function(nuid) {
    let b = this.repoBase('reset')
    return b + `/branch/${nuid}`
}

/**
 * Generate URL for commit descriptor
 * @param {string} commitId
 * @returns {string} a commit pathname
 */
ConnectionConfig.prototype.commitDescriptorUrl = function(commitId) {
    return `${this.user()}/${this.db()}/${this.repoid}/commit/${commitId}`
}

/**
 * Generate URL for optimizing db branch
 */

ConnectionConfig.prototype.optimizeBranchUrl = function(nuid) {
    let o = this.optimizeBase()
    return o + `${this.user()}/${this.db()}/${this.repoid}/branch/${nuid}`
}

/**
 * Generate base db url consisting of server/action/organization/dbid
 * @param {typedef.ActionType} action
 * @returns {string}
 */
ConnectionConfig.prototype.dbBase = function(action) {
    return `${this.apiURL()}${action}/${this.dbURLFragment()}`
}

//https://127.0.0.1:6363/api/document/admin/cloud-profiles/local/branch/main?graph_type=instance
//instance


/**
 * Generate base branch url consisting of server/action/organization/dbid/branchid
 * @param {typedef.ActionType} action
 * @returns {string}
 */
ConnectionConfig.prototype.repoBase = function(action) {
    let b = this.dbBase(action)
    if (this.repo()) b += `/${this.repo()}`
    else b += '/' + this.default_repo_id
    return b
}

/**
 * Generate base optimize url consisting of server
 */
ConnectionConfig.prototype.optimizeBase = function() {
    return `${this.apiURL()}optimize/`
}

/**
 * Get database branch Url
 * Generate base branch url consisting of server/action/organization/dbid/branchid
 * @param {typedef.ActionType} action
 * @returns {string}
 */
ConnectionConfig.prototype.branchBase = function(action) {
    let b = this.repoBase(action)
    //_meta repo is magic - stores repository metadata
    if (this.repo() === '_meta') {
        return b
    }
    //_commits branch is magic - stores all commits for repo

    /*
    *https://127.0.0.1:6363/api/db/admin/profiles01/local/_commits
    */
    if (this.branch() === '_commits') {
        return b + `/${this.branch()}`
    } else if (this.ref()) {
        return b + `/commit/${this.ref()}`
    } else if (this.branch()) {
        return b + `/branch/${this.branch()}`
    } else b += '/branch/' + this.default_branch_id
    return b
}

/**
 * Generate url portion consisting of organization/dbid
 * (unless dbid = system dbname in which case there is no organization)
 * @returns {string|boolean}
 */
ConnectionConfig.prototype.dbURLFragment = function() {
    if (this.db() === this.system_db) return this.db()
    return this.organization() + '/' + this.db()
}

/**
 * Generate url portion consisting of organization/dbid
 * (unless dbid = system dbname in which case there is no organization)
 * @property {typedef.DocParamsPost|Object} params
 */

ConnectionConfig.prototype.documentURL = function(params){
    const paramsStr=this.queryParameter(params)
    if (this.db() === this.system_db){
       return this.dbBase('document')+paramsStr
    }
    return this.branchBase('document')+paramsStr
}

ConnectionConfig.prototype.queryParameter = function(params){
    if(params && typeof params!=='object')return ''
    let queryString = Object.keys(params).map((key) => {
        return key + '=' + encodeURIComponent(params[key])
    }).join('&');

    return `?${queryString}`;
}

ConnectionConfig.prototype.jsonSchemaURL = function(params){
    const paramsStr=this.queryParameter(params)
    return this.branchBase('schema')+paramsStr
}

module.exports = ConnectionConfig
