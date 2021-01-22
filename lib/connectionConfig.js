/**
 * @typedef {type:'basic'|'jwt', user:string, key:string } CredentialObj
 */

/**
 * @file Terminus DB connection configuration
 * @license Apache Version 2
 * @description Object representing the state of a connection to a terminus db - these are:
 * @constructor
 * @param {string} serverUrl - the terminusdb server url
 * @param {object | undefined} params - an object with the following connection parameters:
 * @param {string}  params.key - api key for basic auth
 * @param {string}  params.user - basic auth user id
 * @param {string}  params.organization - set organization to this id
 * @param {string}  params.db - set cursor to this db
 * @param {?string} params.repo - set cursor to this repo
 * @param {?string} params.branch - set branch to this id
 * @param {?ref}    params.ref    - set commit ref 
 * @param {?string} params.jwt - jwt token 
 * @param {?string} params.jwt_user - jwt user id
//KEVIN
 * @param {?string} params.default_branch_id - set the default branch id 
 * provides methods for getting and setting connection parameters
 */

function ConnectionConfig(serverUrl, params=null) {
    /** @type {string | boolean} */
    this.server = false
    
    /** @type {CredentialObj | boolean} */
    this.remote_auth = false //remote auth for authenticating to remote servers for push / fetch / clone
    
    /** @type {CredentialObj | boolean} */
    this.local_auth = false // basic auth string for authenticating to local server
    
    //these operate as cursors - where within the connected server context, we currently are
    this.organizationid = false
    this.dbid = false

    this.default_branch_id = (params && params.default_branch_id ? params.default_branch_id : 'main')
    this.default_repo_id = 'local'
    this.system_db = '_system'
    this.api_extension = "api/"
    //default repository and branch ids
    this.branchid = this.default_branch_id
    this.repoid = this.default_repo_id
    //set if pointing at a commit within a branch
    this.refid = false

    this.connection_error = false

    let surl = this.parseServerURL(serverUrl)
    if (surl) {
        this.server = surl
        if (params) this.update(params)
    } else {
        //better throw an error
        this.setError(`Invalid Server URL: ${serverUrl}`)
    }
    //this.setServer(serverUrl);
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
 * updates connection config with new parameters 
 * @param {object}  params - an object with the following connection parameters:
 * @param {string}  params.key - api key for basic auth
 * @param {string}  params.user - basic auth user id
 * @param {string}  params.organization - set organization to this id
 * @param {string}  params.db - set cursor to this db
 * @param {?string} params.repo - set cursor to this repo
 * @param {?string} params.branch - set branch to this id
 * @param {?ref}    params.ref    - set commit ref 
 * @param {?string} params.jwt - jwt token 
 * @param {?string} params.jwt_user - jwt user id
/ 
 */
ConnectionConfig.prototype.update = function(params) {
    if(!params)return
    if (typeof params.organization !== 'undefined') this.setOrganization(params.organization)
    else if(params.user) this.setOrganization(params.user)
    if (typeof params.db !== 'undefined') this.setDB(params.db)
    //if (params.remote_auth !== undefined) this.setRemoteAuth(newParams.remote_auth)
    //if (params.local_auth !== undefined) this.setLocalAuth(newParams.local_auth)
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
    return this.local_auth
}

/**
 *@description Gets the local user name
 *return {string | boolean}
 */
ConnectionConfig.prototype.local_user = function() {
    if (this.local_auth) return this.local_auth.user
    return false
}

/**
 *@description Gets the remote Authorization credentials
 *to connect the local db with a remote terminusdb database
 *return {CredentialObj | boolean}
 */
ConnectionConfig.prototype.remoteAuth = function() {
    return this.remote_auth
}

/**
 *@description Gets the current user name
 *@param {boolean} ignoreJwt
 *return {string}
 */
ConnectionConfig.prototype.user = function(ignoreJwt) {
    if (!ignore_jwt && this.remote_auth && this.remote_auth.type == 'jwt')
        return this.remote_auth.user
    if (this.local_auth) {
        return this.local_auth.user
    }
}

/**
* @param 
*/

ConnectionConfig.prototype.parseServerURL = function(str) {
    if (str && (str.substring(0, 7) === 'http://' || str.substring(0, 8) === 'https://')) {
        if (str.lastIndexOf('/') !== str.length - 1) {
            str += '/' //always append slash to ensure regularity
        }
        return str
    }
    return false
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
 * Setting all 5 cursor related state variables at once
 */
ConnectionConfig.prototype.setCursor = function(organization, db, repo, branch, ref) {
    if (organization && !this.setOrganization(organization)) return false
    if (db && !this.setDB(db)) return false
    if (repo && !this.setRepo(repo)) return false
    if (branch && !this.setBranch(branch)) return false
    if (ref && !this.setRef(ref)) return false
    return true
}

ConnectionConfig.prototype.setError = function(str) {
    this.connection_error = str
}

/**
 * @description Set the organization to which the connected db belongs 
 * (not the users organization - set in capabilities)
 * @param {String} organization
 * 
 */
ConnectionConfig.prototype.setOrganization = function(organization) {
    this.organizationid = organization || false
    return this.organizationid
}

/**
 * @description Set the local identifier of db
 * @param {string | boolean} db - database Id
 //KEVIN we need that return ???
 provably before you did a control but we don't need that return
 * return {string | boolean}
 */
ConnectionConfig.prototype.setDB = function(db) {
    this.dbid = db
    return this.dbid
}

/**
 * @typedef {"local"|"remote"} RepoType
 */

/**
 * @description Set the repository type |local|remote|
 * @param {RepoType} repo - for the local server - identifier of repo
 */
ConnectionConfig.prototype.setRepo = function(repo) {
    this.repoid = repo
    return this.repoid
}

/**
 * @param {String | boolean} branch - id of branch
 * @return {string}
 */
ConnectionConfig.prototype.setBranch = function(branch) {
    this.branchid = branch
    if(!this.branchid) this.branchid = this.default_branch_id
    return this.branchid
}

/**
 * Set an Reference ID or Commit ID. 
 * Commit IDs are unique hashes that are created whenever a new commit is recorded
 * @param {string | boolean} refId - commit reference id
 * @return {string | boolean}
 */
ConnectionConfig.prototype.setRef = function(refId) {
    this.refid = refId
    return this.refid
}

/**
 * @description set the local database connection credential 
 * @param {?string} userKey - basic auth api key
 * @param {?string} userId -  user id 
 */
ConnectionConfig.prototype.setLocalBasicAuth = function(userKey, userId) {
    if (!userKey) {
        this.local_auth = false
        return false
    }
    const uid = userId || 'admin'
    if (userKey) {
        this.local_auth = {type: 'basic', user: uid, key: userKey }
        return this.local_auth
    }
}


/**
 * @description set the local database connection credential 
 * @param {CredentialObj} newCredential 
 */
ConnectionConfig.prototype.setLocalAuth = function(newCredential) {
    this.local_auth = newCredential
}


ConnectionConfig.prototype.setRemoteAuth = function(details) {
    this.remote_auth = details
}

ConnectionConfig.prototype.remoteAuth = function() {
    return this.remote_auth
}

/**
 * Simple gets to retrieve current connection status
 */
ConnectionConfig.prototype.serverURL = function() {
    return this.server
}

/**
 * API endpoint url generation
 * for create / delete db
 */
ConnectionConfig.prototype.dbURL = function() {
    return this.dbBase('db')
}

ConnectionConfig.prototype.userURL = function(uid) {
    let base = `${this.apiURL()}user`
    if (uid) base += `/${encodeURIComponent(uid)}`
    return base
}

ConnectionConfig.prototype.organizationURL = function(oid) {
    let url = `${this.apiURL()}organization`
    if(oid) url += `/${encodeURIComponent(oid)}`
    return url
}

ConnectionConfig.prototype.rolesURL = function() {
    return `${this.apiURL()}role`
}

ConnectionConfig.prototype.updateRolesURL = function() {
    return `${this.apiURL()}update_role`
}


/**
 * Generate URL for create / delete graph api endpoint
 */
ConnectionConfig.prototype.graphURL = function(type, gid) {
    return this.branchBase('graph') + `/${type}/${gid}`
}


/**
 * Generate URL for get / set schema api endpoint
 */
ConnectionConfig.prototype.triplesURL = function(type, gid) {
    if (this.db() == this.system_db) var s = this.dbBase('triples')
    else var s = this.branchBase('triples')
    const graphId = gid || 'main'
    s += `/${type}/${graphId}`
    return s
}

/**
 * Generate URL for add / get csv api endpoint
*/
ConnectionConfig.prototype.csvURL = function(type, gid) {
    var s = this.branchBase('csv')
    const graphId = gid || 'main'
    const gType = type || 'instance'
    //s += `/${gType}/${graphId}`
    return s
}

/**
 * Generate URL for woql query api endpoint
 */
ConnectionConfig.prototype.queryURL = function() {
    if (this.db() == this.system_db) return this.dbBase('woql')
    return this.branchBase('woql')
}

/**
 * Generate URL for class frame api endpoint
 */
ConnectionConfig.prototype.classFrameURL = function() {
    if (this.db() == this.system_db) return this.dbBase('frame')
    return this.branchBase('frame')
}

/**
 * Generate URL for clone db endpoint
 */
ConnectionConfig.prototype.cloneURL = function(new_repo_id) {
    let crl = `${this.apiURL()}clone/${this.organization()}`
    if (new_repo_id) crl += `/${new_repo_id}`
    return crl
}

/**
 * URL at which a db can be cloned
 */
ConnectionConfig.prototype.cloneableURL = function() {
    return `${this.serverURL()}${this.organization()}/${this.db()}`
}

/**
 * Generate URL for pull endpoint
 */
ConnectionConfig.prototype.pullURL = function() {
    let purl = this.branchBase('pull')
    return purl
}

/**
 * Generate URL for fetch endpoint
 */
ConnectionConfig.prototype.fetchURL = function(remote_name) {
    let purl = this.dbBase('fetch')
    return purl + "/" + remote_name + "/_commits"
}

/**
 * Generate URL for rebase endpoint
 */
ConnectionConfig.prototype.rebaseURL = function() {
    let purl = this.branchBase('rebase')
    return purl
}

/**
 * Generate URL for reset endpoint
 */
ConnectionConfig.prototype.resetURL = function() {
    let purl = this.branchBase('reset')
    return purl
}

/**
 * Generate URL for push endpoint
 */
ConnectionConfig.prototype.pushURL = function() {
    let purl = this.branchBase('push')
    return purl
}

/**
 * Generate URL for branch endpoint
 */
ConnectionConfig.prototype.branchURL = function(nuid) {
    let b = this.repoBase('branch')
    return b + `/branch/${nuid}`
}

/**
 * Generate base db url consisting of server/action/organization/dbid
 */
ConnectionConfig.prototype.dbBase = function(action) {
    return `${this.apiURL()}${action}/${this.dbURLFragment()}`
}

/**
 * Generate base branch url consisting of server/action/organization/dbid/branchid
 */
ConnectionConfig.prototype.repoBase = function(action) {
    let b = this.dbBase(action)
    if (this.repo()) b += `/${this.repo()}`
    else b += '/' + this.default_repo_id
    return b
}


 // @typedef {"keyvalue" | "bar" | "timeseries" | "pie" | "table"} ActionString
 

/**
 * @description Get database branch Url
 * Generate base branch url consisting of server/action/organization/dbid/branchid
 * @param {string} action 
 */
ConnectionConfig.prototype.branchBase = function(action) {
    let b = this.repoBase(action)
    //_meta repo is magic - stores repository metadata
    if (this.repo() == '_meta') {
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
 * @return {string}
 */
ConnectionConfig.prototype.dbURLFragment = function() {
    if (this.db() === this.system_db) return this.db()
    return this.organization() + '/' + this.db()
}

module.exports = ConnectionConfig
