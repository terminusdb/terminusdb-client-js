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

/**
 * Creates a new user by adding a terminus:User document to the master db
 */
UserManager.prototype.createUser = function(id, title, email, description, key){
    if(id.indexOf(":") == -1) id = "doc:" + id;
    let doc = this.docgen.user(id, title, email, description, key);
    doc["@context"]['doc'] = this.client.server() + "terminus/document/";
    return this.client.createDocument(doc);
}

UserManager.prototype.updateUser = function(id, parts){
    if(id.indexOf(":") !== -1) id = id.split(":")[1];   
    //let docurl = this.client.server() + "terminus/document/" + id;
    return this.client.getDocument(id).then((userdoc) => {
        if(parts.name) userdoc['rdfs:label']["@value"] = parts.name;
        if(parts.email) userdoc['terminus:email'] = parts.email;
        if(parts.key) userdoc['terminus:user_key'] = parts.key;
        if(parts.description) userdoc['rdfs:comment'] = parts.description;
        return this.client.updateDocument(userdoc);
    });
}

UserManager.prototype.deleteUser = function(id){
    if(id.indexOf(":") !== -1) id = id.split(":")[1];   
    //let docurl = this.client.server() + "terminus/document/" + id;
    return this.client.deleteDocument(id);
}

UserManager.prototype.createCapability = function(id, name, desc, permissions, dbid){
    if(id.indexOf(":") == -1) id = "doc:" + id;
    let doc = this.docgen.capability(id, name, desc, permissions, dbid);
    doc["@context"]['doc'] = this.client.server() + "terminus/document/";
    return this.client.createDocument(doc);
}

UserManager.prototype.addUserCapability = function(userid, capability_id){
    if(userid.indexOf(":") !== -1) userid = userid.split(":")[1];   
    //let docurl = this.client.server() + "terminus/document/" + userid;
    if(capability_id.indexOf(":") == -1) capability_id = "doc:" + capability_id;
    let newcap = {"@id": capability_id, "@type": "terminus:Capability"};
    return this.client.getDocument(userid).then((userdoc) => {
        let caps = userdoc['terminus:authority'];
        if(caps){
            if(Array.isArray(caps)) caps.push(newcap);
            else caps = [caps, newcap];
        }
        else {
            caps = [newcap];
        }
        userdoc['terminus:authority'] = caps;
        return this.client.updateDocument(userdoc);
    });    
}

UserManager.prototype.removeUserCapability = function(userid, capability_id){
    if(userid.indexOf(":") !== -1) userid = userid.split(":")[1];   
    //let docurl = this.client.server() + "terminus/document/" + userid;
    if(capability_id.indexOf(":") == -1) capability_id = "doc:" + capability_id;
        return this.client.getDocument(userid).then((userdoc) => {
        let caps = userdoc['terminus:authority'];
        let ncaps = [];
        if(!Array.isArray(caps)) caps = [caps];
        for(var i = 0 ; i<caps.length; i++){
            if(caps[i]["@id"] != capability_id) ncaps.push(caps[i]);
        }
        userdoc['terminus:authority'] = ncaps;
        return this.client.updateDocument(userdoc);
    });
}

module.exports = UserManager;
