/**
 * @file Javascript JSONLD document generator
 * @license Apache Version 2
 * Helper class for generating JSON-LD documents for submission to the API
 */
function DocumentGenerator() {
}

DocumentGenerator.prototype.context = function() {
    return {
        rdfs: "http://www.w3.org/2000/01/rdf-schema#",
        terminus: "http://terminusdb.com/schema/terminus#"
    }
}

DocumentGenerator.prototype.database = function(id, title, description){
    let dbdoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Database",
    };
    if(title) dbdoc['rdfs:label'] = { "@language":  "en", "@value": title };
    if(description) dbdoc['rdfs:comment'] = { "@language":  "en", "@value": description};
    return dbdoc;    
}

DocumentGenerator.prototype.repository = function(id, title, description){
    let repodoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Repository",
    };
    if(title) repodoc['rdfs:label'] = { "@language":  "en", "@value": title };
    if(description) repodoc['rdfs:comment'] = { "@language":  "en", "@value": description};
    return repodoc;    
}

DocumentGenerator.prototype.user = function(id, title, key, email, description){
    let userdoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:User",
    };
    if(title) userdoc['rdfs:label'] = { "@language":  "en", "@value": title };
    if(description) userdoc['rdfs:comment'] = { "@language":  "en", "@value": description};
    if(key) userdoc['terminus:user_key_hash'] = { "@type":  "xsd:string", "@value": key};
    if(email) userdoc['terminus:email'] = {"@type": "xdd:email", "@value": email};
    return userdoc;    
}

DocumentGenerator.prototype.branch = function(id, title, description){
    let userdoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Branch",
    };
    if(title){
         userdoc['rdfs:label'] = { "@language":  "en", "@value": title };
         userdoc['terminus:branch_name'] = { "@type":  "xsd:string", "@value": title };
    }
    if(description) userdoc['rdfs:comment'] = { "@language":  "en", "@value": description};
    return userdoc;    
}

DocumentGenerator.prototype.ref = function(id, title, description){
    let userdoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Ref",
        "terminus:ref_identifier": { "@type":  "xsd:string", "@value": id}
    };
    if(title) userdoc['rdfs:label'] = { "@language":  "en", "@value": title };
    if(description) userdoc['rdfs:comment'] = { "@language":  "en", "@value": description};
    return userdoc;    
}

DocumentGenerator.prototype.capability = function(id, title, description, permissions, dbid){
    let userdoc = {
        "@id": id,
        "@context" : this.context(),
    };
    userdoc["@type"] = (dbid ? "terminus:DatabaseCapability" : "terminus:ServerCapability");
    if(title) userdoc['rdfs:label'] = { "@language":  "en", "@value": title };
    if(description) userdoc['rdfs:comment'] = { "@language":  "en", "@value": description};
    if(permissions) userdoc['terminus:action'] = permissions;
    return userdoc;    
}

module.exports = DocumentGenerator;
