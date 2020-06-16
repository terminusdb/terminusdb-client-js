/**
 * @file Terminus DB connection configuration
 * @license Apache Version 2
 * @description Object representing the state of a connection to a terminus db - these are:
 * 1. server url (set on connect)
 * 2. current account id
 * 2. dbid, account, api key, remote auth
 * along with some configuration information (key, connected mode, client_side_access_control)
 * provides methods for getting and setting connection parameters
 */
function ConnectionConfig(serverUrl, params) {
    this.server = false
    this.remote_auth = false //remote auth for authenticating to remote servers for push / fetch / clone
    this.basic_auth = false // basic auth string for authenticating to local server
    //these operate as cursors - where within the connected server context, we currently are
    this.accountid = false
    this.dbid = false

    this.default_branch_id = 'master'
    this.default_repo_id = 'local'
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
    other.basic_auth = this.basic_auth
    other.accountid = this.accountid
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
    if (typeof newParams.account != 'undefined') this.setAccount(newParams.account)
    if (typeof newParams.db != 'undefined') this.setDB(newParams.db)
    if (typeof newParams.remote_auth != 'undefined') this.setRemoteAuth(newParams.remote_auth)
    if (typeof newParams.key != 'undefined') this.setBasicAuth(newParams.key, newParams.user)
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

ConnectionConfig.prototype.db = function() {
    return this.dbid
}

ConnectionConfig.prototype.branch = function() {
    return this.branchid
}

ConnectionConfig.prototype.ref = function() {
    return this.refid
}

ConnectionConfig.prototype.account = function() {
    return this.accountid
}

ConnectionConfig.prototype.repo = function() {
    return this.repoid
}

ConnectionConfig.prototype.basicAuth = function() {
    return this.basic_auth
}

ConnectionConfig.prototype.user = function(ignore_jwt) {
    if (!ignore_jwt && this.remote_auth && this.remote_auth.type == 'jwt')
        return this.remote_auth.user
    if (this.basic_auth) {
        return this.basic_auth.split(':')[0]
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
    this.accountid = false
    this.dbid = false
    this.refid = false
}

/**
 * Setting all 5 cursor related state variables at once
 */
ConnectionConfig.prototype.setCursor = function(account, db, repo, branch, ref) {
    if (account && !this.setAccount(account)) return false
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
 * @param {String} inputStr - account to which the connected db belongs (not the users account - set in capabilities)
 */
ConnectionConfig.prototype.setAccount = function(inputStr) {
    this.accountid = inputStr || false
    return this.accountid
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
ConnectionConfig.prototype.setBasicAuth = function(userKey, userId) {
    if (!userKey) {
        this.basic_auth = false
        return false
    }
    const uid = userId || 'admin'
    if (userKey) {
        this.basic_auth = `${uid}:${userKey}`
        return this.basic_auth
    }
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
 *
 * for create / delete db
 */
ConnectionConfig.prototype.dbURL = function() {
    return this.dbBase('db')
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
    if (this.db() == 'terminus') var s = this.dbBase('triples')
    else var s = this.branchBase('triples')
    const graphId = gid || 'main'
    s += `/${type}/${graphId}`
    return s
}

/**
 * Generate URL for woql query api endpoint
 */
ConnectionConfig.prototype.queryURL = function() {
    if (this.db() == 'terminus') return this.dbBase('woql')
    return this.branchBase('woql')
}

/**
 * Generate URL for class frame api endpoint
 */
ConnectionConfig.prototype.classFrameURL = function() {
    if (this.db() == 'terminus') return this.dbBase('frame')
    return this.branchBase('frame')
}

/**
 * Generate URL for clone db endpoint
 */
ConnectionConfig.prototype.cloneURL = function(new_repo_id) {
    let crl = `${this.serverURL()}clone/${this.account()}`
    if (new_repo_id) crl += `/${new_repo_id}`
    return crl
}

/**
 * URL at which a db can be cloned
 */
ConnectionConfig.prototype.cloneableURL = function() {
    return `${this.serverURL()}${this.account()}/${this.db()}`
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
ConnectionConfig.prototype.pullURL = function() {
    let purl = this.branchBase('fetch')
    return purl
}

/**
 * Generate URL for rebase endpoint
 */
ConnectionConfig.prototype.rebaseURL = function(nuid) {
    let purl = this.branchBase('rebase')
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
 * Generate base db url consisting of server/action/account/dbid
 */
ConnectionConfig.prototype.dbBase = function(action) {
    return `${this.serverURL()}${action}/${this.dbURLFragment()}`
}

/**
 * Generate base branch url consisting of server/action/account/dbid/branchid
 */
ConnectionConfig.prototype.repoBase = function(action) {
    let b = this.dbBase(action)
    if (this.repo()) b += `/${this.repo()}`
    else b += '/' + this.default_repo_id
    return b
}

/**
 * Generate base branch url consisting of server/action/account/dbid/branchid
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
 * Generate url portion consisting of account/dbid (unless dbid = terminus in which case there is no account)
 */
ConnectionConfig.prototype.dbURLFragment = function() {
    if (this.db() == 'terminus') return this.db()
    return this.account() + '/' + this.db()
}

module.exports = ConnectionConfig
