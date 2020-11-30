/**
 * @file Terminus DB connection configuration
 * @license Apache Version 2
 * @description Object representing the state of a connection to a terminus db - these are:
 * 1. server url (set on connect)
 * 2. current organization id
 * 2. dbid, organization, api key, remote auth
 * along with some configuration information (key, connected mode, client_side_access_control)
 * provides methods for getting and setting connection parameters
 */
function ConnectionConfig(serverUrl, params) {
    this.server = false
    this.remote_auth = false //remote auth for authenticating to remote servers for push / fetch / clone
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
        this.setError(`Invalid Server URL: ${serverUrl}`)
    }
    //this.setServer(serverUrl);
}

/**
 * Creates a new connection config object and copies all the state information from this one into it
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
 * updates connection config with new values set in json params object
 */
ConnectionConfig.prototype.update = function(params) {
    const newParams = params || {}
    //if (typeof newParams.server != "undefined") this.setServer(newParams.server);
    if (typeof newParams.organization != 'undefined') this.setOrganization(newParams.organization)
    else if(newParams.user) this.setOrganization(newParams.user)
    if (typeof newParams.db != 'undefined') this.setDB(newParams.db)
    if (typeof newParams.remote_auth != 'undefined') this.setRemoteAuth(newParams.remote_auth)
    if (typeof newParams.local_auth != 'undefined') this.setLocalAuth(newParams.local_auth)
    if (typeof newParams.key != 'undefined') this.setLocalBasicAuth(newParams.key, newParams.user)
    if (typeof newParams.branch != 'undefined') this.setBranch(newParams.branch)
    if (typeof newParams.ref != 'undefined') this.setRef(newParams.ref)
    if (typeof newParams.repo != 'undefined') this.setRepo(newParams.repo)
}

/**
 * Simple gets to retrieve current connection status
 */
ConnectionConfig.prototype.serverURL = function() {
    return this.server
}

/**
 * Simple gets to retrieve current connection status
 */
ConnectionConfig.prototype.apiURL = function() {
    return this.server + this.api_extension
}


ConnectionConfig.prototype.db = function() {
    return this.dbid
}

ConnectionConfig.prototype.branch = function() {
    return this.branchid
}

ConnectionConfig.prototype.ref = function() {
    return this.refid
}

ConnectionConfig.prototype.organization = function() {
    return this.organizationid
}

ConnectionConfig.prototype.repo = function() {
    return this.repoid
}

ConnectionConfig.prototype.localAuth = function() {
    return this.local_auth
}

ConnectionConfig.prototype.local_user = function() {
    if (this.local_auth) return this.local_auth.user
}

ConnectionConfig.prototype.remoteAuth = function() {
    return this.remote_auth
}

ConnectionConfig.prototype.user = function(ignore_jwt) {
    if (!ignore_jwt && this.remote_auth && this.remote_auth.type == 'jwt')
        return this.remote_auth.user
    if (this.local_auth) {
        return this.local_auth.user
    }
}

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
 * @param {String} inputStr - organization to which the connected db belongs (not the users organization - set in capabilities)
 */
ConnectionConfig.prototype.setOrganization = function(inputStr) {
    this.organizationid = inputStr || false
    return this.organizationid
}

/**
 * @param {String} inputStr - local identifier of db
 */
ConnectionConfig.prototype.setDB = function(inputStr) {
    this.dbid = inputStr
    return this.dbid
}

/**
 * @param {String} inputStr - local identifier of repo
 */
ConnectionConfig.prototype.setRepo = function(inputStr) {
    this.repoid = inputStr
    return this.repoid
}

/**
 * @param {String} inputStr - id of branch
 */
ConnectionConfig.prototype.setBranch = function(inputStr) {
    this.branchid = inputStr
    if(!this.branchid) this.branchid = this.default_branch_id
    return this.branchid
}

/**
 * @param {String} inputStr - id of ref
 */
ConnectionConfig.prototype.setRef = function(inputStr) {
    this.refid = inputStr
    return this.refid
}

/**
 * @param {String} userKey - api key
 * @param {String} userId - basic auth user id key
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

ConnectionConfig.prototype.setLocalAuth = function(details) {
    this.local_auth = details
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

/**
 * Generate base branch url consisting of server/action/organization/dbid/branchid
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
 * Generate url portion consisting of organization/dbid (unless dbid = terminus in which case there is no organization)
 */
ConnectionConfig.prototype.dbURLFragment = function() {
    if (this.db() == this.system_db) return this.db()
    return this.organization() + '/' + this.db()
}

module.exports = ConnectionConfig
