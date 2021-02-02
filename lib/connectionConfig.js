//@ts-check

/**
 * @typedef {Object} CredentialObj
 * @property {'basic'|'jwt'} type -  the authorization type of an TerminusDB connection
 * @property {string | boolean} user - the user id | I don't need the user with the jwt token
 * @property {string} key -  the connection key
 */

/**
 * @typedef {'graph'|'db'|'clone'|'triples'|'woql'|'frame'|'fetch'|'pull'|'rebase'|'csv'|'branch'|'reset'|'push'} ActionType
 */

/**
 * @typedef {Object} ParamsObj
 * @property {string} key - api key for basic auth
 * @property {string} user - basic auth user id
 * @property {string} [organization] - set organization to this id
 * @property {string} [db] - set cursor to this db
 * @property {RepoType | string} [repo] - set cursor to this repo
 * @property {string} [branch] - set branch to this id
 * @property {string} [ref]    - set commit ref
 * @property {string} [jwt] - jwt token
 * @property {string} [jwt_user] - jwt user id
 * @property {string} [default_branch_id] - set the default branch id
 */

/**
 * @file Terminus DB connection configuration
 * @license Apache Version 2
 * @description Object representing the state of a connection to a terminus db - these are:
 * provides methods for getting and setting connection parameters
 * @constructor
 * @param {string} serverUrl - the terminusdb server url
 * @param {ParamsObj} [params] - an object with the following connection parameters:
 */

//KEVIN

function ConnectionConfig(serverUrl, params) {
    /*
     * KEVIN
     * we do not need to initialize this variable with false
     * check private
     *this.server = false
     * this.remote_auth=false
     * this.local_auth=false
     */
    /**
     * @type {string}
     */
    this.server

    /** @type {CredentialObj} */
    this.remote_auth //remote auth for authenticating to remote servers for push / fetch / clone

    /** @type {CredentialObj } */
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

    let surl = this.parseServerURL(serverUrl)
    if (surl) {
        //I can set serverURL only in constructor
        this.server = surl
        if (params) this.update(params)
    } else {
        //better throw an error
        //fail fast designer
        this.setError(`Invalid Server URL: ${serverUrl}`)
    }
}

/**
 * @description Creates a new connection config object and copies all the state information from this one into it
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
 * @description updates connection config with new parameters
 * @param {ParamsObj}  params - an object with the following connection parameters:
 */
//KEVIN
ConnectionConfig.prototype.update = function(params) {
    if (!params) return
    if (typeof params.organization !== 'undefined') this.setOrganization(params.organization)
    else if (params.user) this.setOrganization(params.user)
    if (typeof params.db !== 'undefined') this.setDB(params.db)
    //if (params.remote_auth !== undefined) this.setRemoteAuth(newParams.remote_auth)
    //if (params.local_auth !== undefined) this.setLocalAuth(newParams.local_auth)

    if (typeof params.jwt !== 'undefined') this.setRemoteBasicAuth(params.jwt, params.jwt_user)
    if (typeof params.key !== 'undefined') this.setLocalBasicAuth(params.key, params.user)
    if (typeof params.branch !== 'undefined') this.setBranch(params.branch)
    if (typeof params.ref !== 'undefined') this.setRef(params.ref)
    if (typeof params.repo !== 'undefined') this.setRepo(params.repo)
}

/**
 * Simple gets to retrieve current connection status
 * Gets the current server url
 * @returns {string}
 */
ConnectionConfig.prototype.serverURL = function() {
    return this.server
}

/**
 * @description Gets the server connection url
 * @returns {string}
 */
ConnectionConfig.prototype.apiURL = function() {
    return this.server + this.api_extension
}

/**
 * @description Gets the current database id
 * @returns {string | boolean}
 */
ConnectionConfig.prototype.db = function() {
    return this.dbid
}

/**
 * @description Gets the current branch id
 * @returns {string}
 */
ConnectionConfig.prototype.branch = function() {
    return this.branchid
}

/**
 * @description Gets the current commit ref id
 * @returns {string | boolean}
 */
ConnectionConfig.prototype.ref = function() {
    return this.refid
}

/**
 * @description Gets the current organization id
 * @returns {string | boolean}
 */
ConnectionConfig.prototype.organization = function() {
    return this.organizationid
}

/**
 * @description Gets the current organization id
 * @returns {string}
 */
ConnectionConfig.prototype.repo = function() {
    return this.repoid
}

/**
 *@description Gets the local Authorization credentials
 *return {CredentialObj | boolean}
 */
ConnectionConfig.prototype.localAuth = function() {
    if (this.local_auth) return this.local_auth
    return false
}

/**
 *@description Gets the local user name
 *return {string | boolean}
 */
ConnectionConfig.prototype.localUser = function() {
    if (this.local_auth) return this.local_auth.user
    return false
}

/**
 *@description Gets the current user name
 *@param {?boolean} ignoreJwt
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
 * @description Check the server URL
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
    return ''
}

/**
 * @description Clear cursor for connection
 */
ConnectionConfig.prototype.clearCursor = function() {
    this.branchid = this.default_branch_id
    this.repoid = this.default_repo_id
    this.organizationid = false
    this.dbid = false
    this.refid = false
}

/**
 * Setting all 5 cursor related state variables at once
 * //KEVIN WE DON'T USE THIS
 */
/*ConnectionConfig.prototype.setCursor = function(organization, db, repo, branch, ref) {
    if (organization && !this.setOrganization(organization)) return false
    if (db && !this.setDB(db)) return false
    if (repo && !this.setRepo(repo)) return false
    if (branch && !this.setBranch(branch)) return false
    if (ref && !this.setRef(ref)) return false
    return true
}*/

/**
 * @param {string | boolean} errorMessage
 */
ConnectionConfig.prototype.setError = function(errorMessage) {
    this.connection_error = errorMessage
}

/**
 * @description Set the organization to which the connected db belongs
 * (not the users organization - set in capabilities)
 * @param {string | boolean} orgId
 */
ConnectionConfig.prototype.setOrganization = function(orgId) {
    this.organizationid = orgId || false
    //return this.organizationid
}

/**
 * @description Set the local identifier of db
 * @param {string | boolean} dbId - database Id
 */

//return {string | boolean}

//KEVIN we need that return ???
// provably before you did a control but we don't need that return

ConnectionConfig.prototype.setDB = function(dbId) {
    this.dbid = dbId
    //return this.dbid
}

/**
 * @typedef {"local"|"remote"} RepoType
 */

/**
 * @description Set the repository type |local|remote|
 * @param {RepoType | string} repoId - for the local server - identifier of repo
 */
ConnectionConfig.prototype.setRepo = function(repoId) {
    this.repoid = repoId
}

/**
 * @param {?string} branchId - id of branch
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
 * @description set the local database connection credential
 * @param {?string} remoteKey - jwt auth api key
 * @param {?string} remoteUserID - remote user id
 * KEVIN ///////
 */
ConnectionConfig.prototype.setRemoteBasicAuth = function(remoteKey, remoteUserID) {
    if (!remoteKey) {
        this.remote_auth = undefined
        //return false
    } else {
        this.remote_auth = {type: 'jwt', user: remoteUserID, key: remoteKey}
    }
    // if (remoteKey) {
    //this.remote_auth = {type: 'jwt', user: remoteUserID, key: remoteKey }
    //return this.remote_auth
    //}
}

/**
 * @description set the local database connection credential
 * @param {?string} userKey - basic auth api key
 * @param {?string} userId -  user id
 * KEVIN ///////
 */
ConnectionConfig.prototype.setLocalBasicAuth = function(userKey, userId) {
    if (!userKey) {
        this.local_auth = undefined
        //return false
    } else {
        const uid = userId || 'admin'
        //if (userKey) {
        this.local_auth = {type: 'basic', user: uid, key: userKey}
        //return this.local_auth
    }
}

/**
 * @description Set the local server connection credential
 * @param {CredentialObj} newCredential
 */
ConnectionConfig.prototype.setLocalAuth = function(newCredential) {
    this.local_auth = newCredential
}

/**
 * @description Set the remote server connection credential
 * @param {CredentialObj} newCredential
 */
ConnectionConfig.prototype.setRemoteAuth = function(newCredential) {
    this.remote_auth = newCredential
}

/**
 *@description Gets the remote Authorization credentials
 *to connect the local db with a remote terminusdb database
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
 * @param {string} user - the user id
 * @returns {string}
 */

ConnectionConfig.prototype.userURL = function(user) {
    let url = `${this.apiURL()}user`
    if (user) url += `/${encodeURIComponent(user)}`
    return url
}

/**
 * Generate URL for the user's organization api endpoint
 * @param {string} organization - the organization id
 * @returns {string}
 */

ConnectionConfig.prototype.organizationURL = function(organization) {
    let url = `${this.apiURL()}organization`
    if (organization) url += `/${encodeURIComponent(organization)}`
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
 * @param {string} graphId
 * @returns {string}
 */
ConnectionConfig.prototype.graphURL = function(graphType, graphId) {
    return this.branchBase('graph') + `/${graphType}/${graphId}`
}

/**
 * Generate URL for get / set schema api endpoint
 * @param {string} graphType
 * @param {?string} graphId
 * @returns {string}
 */
ConnectionConfig.prototype.triplesURL = function(graphType, graphId) {
    if (this.db() === this.system_db) var s = this.dbBase('triples')
    else var url = this.branchBase('triples')
    const gId = graphId || 'main'
    url += `/${graphType}/${gId}`
    return url
}

/**
 * Generate URL for add / get csv api endpoint
 * @param {string} [graphType]
 * @param {string} [graphId]
 * @returns {string}
 */

//KEVIN DO WE NEED THE VARIABLES?
ConnectionConfig.prototype.csvURL = function(graphType, graphId) {
    var s = this.branchBase('csv')
    const gId = graphId || 'main'
    const gType = graphType || 'instance'
    //s += `/${gType}/${gId}`
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
 * Generate URL for class frame api endpoint
 * @returns {string}
 */
ConnectionConfig.prototype.classFrameURL = function() {
    if (this.db() == this.system_db) return this.dbBase('frame')
    return this.branchBase('frame')
}

/**
 * Generate URL for clone db endpoint
 * @param  {?string} newRepoId the repository id
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

//KEVIN remote_name  is like newRepoId
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
 * Generate base db url consisting of server/action/organization/dbid
 * @param {ActionType} action
 * @returns {string}
 */
ConnectionConfig.prototype.dbBase = function(action) {
    return `${this.apiURL()}${action}/${this.dbURLFragment()}`
}

/**
 * Generate base branch url consisting of server/action/organization/dbid/branchid
 * @param {ActionType} action
 * @returns {string}
 */
ConnectionConfig.prototype.repoBase = function(action) {
    let b = this.dbBase(action)
    if (this.repo()) b += `/${this.repo()}`
    else b += '/' + this.default_repo_id
    return b
}

/**
 * @description Get database branch Url
 * Generate base branch url consisting of server/action/organization/dbid/branchid
 * @param {ActionType} action
 * @returns {string}
 */
ConnectionConfig.prototype.branchBase = function(action) {
    let b = this.repoBase(action)
    //_meta repo is magic - stores repository metadata
    if (this.repo() === '_meta') {
        return b
    }
    //_commits branch is magic - stores all commits for repo
    if (this.branch() == '_commits') {
        return b + `/${this.branch()}`
    } else if (this.ref()) {
        return b + `/commit/${this.ref()}`
    } else if (this.branch()) {
        return b + `/branch/${this.branch()}`
    } else b += '/branch/' + this.default_branch_id
    return b
}

/**
 * @description Generate url portion consisting of organization/dbid
 * (unless dbid = system dbname in which case there is no organization)
 * @returns {string|boolean}
 */
ConnectionConfig.prototype.dbURLFragment = function() {
    if (this.db() === this.system_db) return this.db()
    return this.organization() + '/' + this.db()
}

module.exports = ConnectionConfig
