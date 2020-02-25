const DocumentGenerator = require('./documentGenerator');

/**
 * @file Javascript user management library
 * @license Apache Version 2
 * Helper class for adding / updating / removing users from TerminusDB
 */
function UserGenerator(client) {
    this.client = client;
    this.docgen = new DocumentGenerator();
}

UserGenerator.prototype.createUser = function(id, title, key, email, description){
    this.client.db("terminus");
    let docurl = this.client.server() + "terminus/" + id;
    let doc = this.docgen.user(id, title, key, email, description);
    return this.client.createDocument(doc);
}

UserGenerator.prototype.updateUser = function(id, parts){
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

UserGenerator.prototype.deleteUser = function(id, name, description, email, key){
    this.client.db("terminus");
    let docurl = this.client.server() + "terminus/" + id;
    return this.client.deleteDocument(docurl);
}

UserGenerator.prototype.createCapability = function(permissions, dbid){
    
}


UserGenerator.prototype.addUserCapability = function(userid, capability_id){
    
}

UserGenerator.prototype.removeUserCapability = function(userid, capability_id){
    
}
