const DocumentGenerator = require('./documentGenerator');

/**
 * @file Javascript user management library
 * @license Apache Version 2
 * Helper class for adding / updating / removing users from TerminusDB
 */
function UserManager(client) {
    this.client = client;
    this.docgen = new DocumentGenerator();
}

UserManager.prototype.createUser = function(id, title, key, email, description){
    this.client.db("terminus");
    let docurl = this.client.server() + "terminus/" + id;
    let doc = this.docgen.user(id, title, key, email, description);
    return this.client.createDocument(doc);
}

UserManager.prototype.updateUser = function(id, parts){
    this.client.db("terminus");
    let docurl = this.client.server() + "terminus/" + id;
    return this.client.getDocument(docurl).then((userdoc) => {
        if(parts.name) userdoc['rdfs:label']["@value"] = parts.name;
        if(parts.email) userdoc['terminus:email'] = parts.email;
        if(parts.key) userdoc['terminus:user_key_hash'] = parts.key;
        if(parts.description) userdoc['rdfs:comment'] = parts.description;
        return this.client.updateDocument(userdoc);
    });
}

UserManager.prototype.deleteUser = function(id, name, description, email, key){
    this.client.db("terminus");
    let docurl = this.client.server() + "terminus/" + id;
    return this.client.deleteDocument(docurl);
}

UserManager.prototype.createCapability = function(id, name, desc, permissions, dbid){
    let doc = this.docgen.capability(id, name, desc, permissions, dbid);
    return this.client.createDocument(doc);
}


UserManager.prototype.addUserCapability = function(userid, capability_id){
    this.client.db("terminus");
    let docurl = this.client.server() + "terminus/" + id;
    return this.client.getDocument(docurl).then((userdoc) => {
        let caps = userdoc['terminus:authority_scope'];
        if(Array.isArray(caps)) caps.push(capability_id);
        else caps = [caps, capability_id];
        userdoc['terminus:authority_scope'] = caps;
        return this.client.updateDocument(userdoc);
    });    
}

UserManager.prototype.removeUserCapability = function(userid, capability_id){
    this.client.db("terminus");
    let docurl = this.client.server() + "terminus/" + id;
    return this.client.getDocument(docurl).then((userdoc) => {
        let caps = userdoc['terminus:authority_scope'];
        let ncaps = [];
        if(!Array.isArray(caps)) caps = [caps];
        for(var i = 0 ; i<caps.length; i++){
            if(caps[i] != capability_id) ncaps.push(caps[i]);
        }
        userdoc['terminus:authority_scope'] = ncaps;
        return this.client.updateDocument(userdoc);
    });

}

module.exports = UserManager;
