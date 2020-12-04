/* eslint-disable prettier/prettier */
const CONST = require('./const.js')
const ErrorMessage = require('./errorMessage')
const UTILS = require("./utils")

/**
 * @file Connection Capabilities
 * @license Apache Version 2
 * @description Object which helps manage the capabilities available for a given TerminusDB connection
 * Creates an entry in the connection registry for the server
 * and all the databases that the client has access to
 * maps the input authorties to a per-db array for internal storage and easy
 * access control checks
 * @param {String} key API key
 */
function ConnectionCapabilities() {
    this.clear()
    this.databases = false
    this.organizations = false
}

ConnectionCapabilities.prototype.clear = function() {
    this.user = {}
    this.dbdocs = {} //docid => metadata
    this.orgdocs = {} //docid => metadata
    this.jsonld_context = {}
    this.systemdb_context = {}
}


/**
 * @param {object} capabilities the JSON object returned by the connect API call
 * it is a system:User object with a system:role predicate which points at an array of roles
 */
ConnectionCapabilities.prototype.setCapabilities = function(connectjson) {
    this.clear()
    this.databases = false
    if(connectjson['@context']) this._load_connection_context(connectjson['@context'])
    this.user = this._extract_user_info(connectjson)
    this._extract_database_organizations() //find the organization which owns the db
    return this.user
}

ConnectionCapabilities.prototype.get_user = function() {
    return this.user
}

ConnectionCapabilities.prototype.author = function() {
    if (this.user && this.user.author) return this.user.author
    return false
}

ConnectionCapabilities.prototype.get_databases = function() {
    if(!this.databases) this.databases = this._databases_from_dbdocs()
    return this.databases
}

ConnectionCapabilities.prototype.set_databases = function(newdbs) {
    this.databases = newdbs
}

ConnectionCapabilities.prototype.get_database = function(dbid, orgid) {
    if(!this.databases) this.databases = this._databases_from_dbdocs()
    for(var i = 0; i<this.databases.length; i++){
        if(this.databases[i].id == dbid && this.databases[i].organization == orgid) return this.databases[i]
    }
}

ConnectionCapabilities.prototype._databases_from_dbdocs = function() {
    let dbs = []
    for(var docid in this.dbdocs){
        if(this.dbdocs[docid].system == false) {
            dbs.push(this._get_db_rec(this.dbdocs[docid]))
        }
    }
    return dbs
}

ConnectionCapabilities.prototype.set_roles = function(role_output) {
    let cntnt = role_output['bindings']
    if(!cntnt) return false   
    for(var i = 0; i<cntnt.length; i++){
        let onerec = {}
        onerec.dbdocid = cntnt[i]['Database_ID']
        onerec.organization = cntnt[i]['Organization']['@value']
        roles = this._multiple_rdf_objects(cntnt[i]['Owner_Role_Obj'], "system:Role")           
        this.dbdocs[onerec.dbdocid] = roles
    }
    this._extract_database_organizations() //find the organization which owns the db
    if(role_output.databases){
        this.set_databases(role_output.databases)
    }
    if(role_output.organizations){
        this.set_organizations(role_output.organizations)
    }
}


ConnectionCapabilities.prototype.get_organizations = function() {
    if(!this.organizations) this.organizations = this._organizations_from_orgdocs()
    return this.organizations
}

ConnectionCapabilities.prototype.set_organizations = function(orgs) {
    this.organizations = orgs
}

ConnectionCapabilities.prototype.get_organization = function(resname) {
    if(!this.organizations) this.organizations = this._organizations_from_orgdocs()
    for(var i = 0; i<this.organizations.length; i++){
        if(this.organizations[i].id == resname) return this.organizations[i]
    }
}


ConnectionCapabilities.prototype._organizations_from_orgdocs = function() {
    return Object.values(this.orgdocs)
    let orgs = []
    for(var docid in this.orgdocs){
        if(this.orgdocs[docid].system == false) {
            orgs.push(this._get_db_rec(this.orgdocs[docid]))
        }
    }
    return orgs
}


ConnectionCapabilities.prototype.actions_permitted = function(actions, resnames) {
    let actlist = (Array.isArray(actions) ? actions : [actions]) 
    let reslist = (Array.isArray(resnames) ? resnames : [resnames])
    for(var i = 0; i<actlist.length; i++){
        for(var j = 0; j<reslist.length; j++){
            if(!this._roles_cover_resource_action(actlist[i], reslist[j])) return false
        }
    }
    return true
}

ConnectionCapabilities.prototype.buildContextsFromPrefixes = function(){
    let dbs = this.get_databases()
    for(var i = 0; i<dbs.length; i++){
        dbs[i].jsonld_context = _jsonld_context_from_prefixes(dbs[i].prefix_pairs)
    }    
}

ConnectionCapabilities.prototype.updateDatabasePrefixes = function(dbrec, newps){
    dbrec.prefix_pairs = newps
    dbrec.jsonld_context = _jsonld_context_from_prefixes(newps)
}

function _jsonld_context_from_prefixes(pps){
    let basic = {}
    for(var key in UTILS.standard_urls){
        basic[key] = UTILS.standard_urls[key]
    }
    if(pps){
        for(var kk in pps){
            basic[kk] = pps[kk]
        }            
    }
    return basic
}

ConnectionCapabilities.prototype.getContextForOutboundQuery = function(woql, dbid, orgid) {
    let ob = {}
    if (woql && woql.getContext()) {
        ob = woql.getContext()
    }
    else {
        if(this._is_system_db(dbid)) ob = this.getSystemContext()
        else {
            let dbrec = this.get_database(dbid, orgid)
            let jcon = (dbrec && dbrec.jsonld_context ? dbrec.jsonld_context : this.jsonld_context)   
            for (var k in jcon) {
                //if (k != 'doc') ob[k] = jcon[k]
                ob[k] = jcon[k]
            }
        }
        if(Object.keys(ob).length == 0){
            for(var k in UTILS.standard_urls){
                ob[k] = UTILS.standard_urls[k]
            }
        }
        //ugly hack to make blank nodes work with json ld by making _ a valid prefix in json-ld context
        //needed to make owl oneOfs work in schema, otherwise blank nodes are not used in terminusdb
        //they were a bad design decision and aside from them being embedded in OWL via rdf:list,
        //there is never a good reason to use them over an actual IRI
        ob['_'] = '_:'
    }
    return ob
}

ConnectionCapabilities.prototype._is_system_db = function(dbid) {
    return dbid == '_system'
}


ConnectionCapabilities.prototype.getJSONContext = function() {
    return this.jsonld_context
}

ConnectionCapabilities.prototype.setJSONContext = function(ctxt) {
    this.jsonld_context = ctxt
}

ConnectionCapabilities.prototype.getSystemContext = function() {
    return this.systemdb_context
}

ConnectionCapabilities.prototype._roles_cover_resource_action = function(action, resname) {
    for(var docid in this.user.roles){
        if(this._role_covers_resource_action(this.user.roles[docid], action, resname)) return true
    }
    return false
}

ConnectionCapabilities.prototype._role_covers_resource_action = function(role, action, resname) {
    for(var docid in role.capabilities){
        if(this._capability_covers_resource_action(role.capabilities[docid], action, resname)) return true
    }
    return false
}

ConnectionCapabilities.prototype._capability_covers_resource_action = function(cap, action, resname) {
    let actfind = (action.substring(0, 7) == "system:") ? action : "system:" + action
    if(cap.actions.indexOf(actfind) == -1) return false
    if(cap.resources.indexOf(resname) == -1) return false
    return true
}


ConnectionCapabilities.prototype._extract_user_info = function(connectjson) {
    let info = this._extract_rdf_basics(connectjson)
    info.id = this._single_rdf_value('system:agent_name', connectjson)
    info.author = this._single_rdf_value('system:user_identifier', connectjson)
    info.roles = this._multiple_rdf_objects(connectjson['system:role'], "system:Role")
    return info
}

ConnectionCapabilities.prototype._extract_user_role = function(jrole) {
    let nrole = this._extract_rdf_basics(jrole)
    nrole.capabilities = this._multiple_rdf_objects(jrole['system:capability'], "system:Capability")
    return nrole
} 

ConnectionCapabilities.prototype._extract_role_capability = function(jcap) {
    let ncap = this._extract_rdf_basics(jcap)
    ncap.actions = this._extract_multiple_ids(jcap['system:action'])
    ncap.resources = this._extract_capability_resources(jcap['system:capability_scope'])
    return ncap
}

ConnectionCapabilities.prototype._extract_capability_resources = function(scope) {
    //want to return an array of resource_names
    let rnames = []
    if(scope){
        let resources = (Array.isArray(scope) ? scope : [scope]) 
        for(var i = 0; i<resources.length; i++){
            rnames.push(this._extract_resource_name(resources[i]))
            if(resources[i]['@id'] && resources[i]['@type']){
                if(resources[i]['@type'] == "system:SystemDatabase" || (resources[i]['@type'] == "system:Database" && !this.dbdocs[resources[i]['@id']])){
                    this.dbdocs[resources[i]['@id']] = this._extract_database(resources[i])
                }
                if(resources[i]['@type'] == "system:Organization" && !this.orgdocs[resources[i]['@id']]){
                    this.orgdocs[resources[i]['@id']] = this._extract_organization(resources[i])
                }
            }
        }
    }
    return rnames
}

ConnectionCapabilities.prototype._extract_resource_name = function(jres) {
    let id = this._single_rdf_value('system:resource_name', jres)
    if(!id) id = this._single_rdf_value('system:organization_name', jres)
    if(!id) id = this._single_rdf_value('system:database_name', jres)
    return id
}

ConnectionCapabilities.prototype._extract_database = function(jres) {
    let db = this._extract_rdf_basics(jres)
    db.id = this._extract_resource_name(jres)
    db.system = (jres['@type'] == "system:SystemDatabase")
    return db
}

ConnectionCapabilities.prototype._get_db_rec = function(rec) {
    let urec = {}
    for(var k in rec){
        if(k != "system") urec[k] = rec[k]
    }
    return urec
}

ConnectionCapabilities.prototype._extract_database_organizations = function(){
    for(var docid in this.dbdocs){
        for(var odocid in this.orgdocs){
            if(this.orgdocs[odocid].databases.indexOf(docid) != -1){
                this.dbdocs[docid].organization = this.orgdocs[odocid].id 
            }
        }
    }
}

ConnectionCapabilities.prototype._extract_organization = function(jres) {
    let org = this._extract_rdf_basics(jres)
    org.id = this._extract_resource_name(jres)
    org.databases = this._extract_multiple_ids(jres["system:organization_database"])
    org.children = this._extract_multiple_ids(jres["system:organization_child"])
    org.includes = this._extract_multiple_ids(jres["system:resource_includes"])
    return org
}

ConnectionCapabilities.prototype._extract_multiple_ids = function(jres) {
    let ids = []
    if(jres){
        let jids = jres
        if(!Array.isArray(jids)) jids = [jids] 
        ids = jids.map((item) => item['@id'])
    }
    return ids
}

ConnectionCapabilities.prototype._multiple_rdf_objects = function(rdf, type) {
    let vals = {}
    if(!rdf) return vals
    let rdflist = (rdf && Array.isArray(rdf) ? rdf : [rdf])
    for(var i = 0; i<rdflist.length; i++){
        let nid = rdflist[i]['@id']
        if(nid) vals[nid] = this._extract_rdf_object(type, rdflist[i]) 
    }
    return vals
}

ConnectionCapabilities.prototype._extract_rdf_object = function(type, rdf) {
    if(type == "system:Role"){
        return this._extract_user_role(rdf)
    }
    else if(type == "system:Capability"){
        return this._extract_role_capability(rdf)
    }
}

ConnectionCapabilities.prototype._extract_rdf_basics = function(rdf_json){
    let info = {}
    info.label = this._single_rdf_value('rdfs:label', rdf_json)
    info.comment = this._single_rdf_value('rdfs:comment', rdf_json)
    return info
}    

ConnectionCapabilities.prototype._single_rdf_value = function(pred, rdf) {
    if(rdf[pred]){
        if(Array.isArray(rdf[pred])){
            return rdf[pred][rdf[pred].length-1]['@value']
        } 
        return rdf[pred]['@value']
    }
    return ""
}

ConnectionCapabilities.prototype._multiple_rdf_values = function(pred, rdf) {
    let vals = []
    if(!rdf[pred]) return vals
    let rdflist = (rdf[pred] && Array.isArray(rdf[pred]) ? rdf[pred] : [rdf[pred]])
    for(var i = 0; i<rdflist.length; i++){
        vals.push(rdflist[i]['@value'])
    }
    return vals
}


/**
 * JSON-LD context returned by connect uses doc prefix as set for system DB
 * This saves the state of the system db prefixes separately from the general one (which has no doc)
 */
ConnectionCapabilities.prototype._load_connection_context = function(ctxt) {
    this.systemdb_context = ctxt
    for (var k in ctxt) {
        if (k != 'doc') this.jsonld_context[k] = ctxt[k]
    }
}


module.exports = ConnectionCapabilities
