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
        terminus: "http://terminusdb.com/schema/terminus#",
        xsd: "http://www.w3.org/2001/XMLSchema#",
        xdd: "http://terminusdb.com/schema/xdd#"
    }
}

DocumentGenerator.prototype.database = function(id, title, description, lang){
    lang = lang || "en"
    let dbdoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Database",
    };
    if(title) dbdoc['rdfs:label'] = { "@language": lang, "@value": title, "@type": "xsd:string" };
    if(description) dbdoc['rdfs:comment'] = { "@language": lang, "@value": description, "@type": "xsd:string"};
    return dbdoc;
}

DocumentGenerator.prototype.repository = function(id, title, description){
    let repodoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Repository",
    };
    if(title) repodoc['rdfs:label'] = { "@language": "en", "@value": title };
    if(description) repodoc['rdfs:comment'] = { "@language": "en", "@value": description};
    return repodoc;    
}

DocumentGenerator.prototype.user = function(id, title, email, description, key){
    let userdoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:User",
    };
    if(title) userdoc['rdfs:label'] = { "@language": "en", "@value": title };
    if(description) userdoc['rdfs:comment'] = { "@language": "en", "@value": description};
    if(email) userdoc['terminus:email'] = {"@type": "xdd:email", "@value": email};
    if(key) userdoc['terminus:user_key'] = { "@type": "xsd:string", "@value": key};
    return userdoc;    
}

DocumentGenerator.prototype.branch = function(id, title, description){
    let userdoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Branch",
    };
    if(title){
         userdoc['rdfs:label'] = { "@language": "en", "@value": title };
         userdoc['terminus:branch_name'] = { "@type": "xsd:string", "@value": title };
    }
    if(description) userdoc['rdfs:comment'] = { "@language": "en", "@value": description};
    return userdoc;    
}

DocumentGenerator.prototype.ref = function(id, title, description){
    let userdoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Ref",
        "terminus:ref_identifier": { "@type":  "xsd:string", "@value": id}
    };
    if(title) userdoc['rdfs:label'] = { "@language": "en", "@value": title };
    if(description) userdoc['rdfs:comment'] = { "@language": "en", "@value": description};
    return userdoc;    
}

DocumentGenerator.prototype.capability = function(id, title, description, permissions, dbid){
    let userdoc = {
        "@id": id,
        "@context" : this.context(),
    };
    userdoc["@type"] = (dbid ? "terminus:DatabaseCapability" : "terminus:ServerCapability");
    if(title) userdoc['rdfs:label'] = { "@language": "en", "@value": title };
    if(description) userdoc['rdfs:comment'] = { "@language": "en", "@value": description};
    if(permissions) {
        let permdoc = [];
        for(var i = 0; i<permissions.length; i++){
            permdoc.push({ "@id": permissions[i], "@type": "terminus:DBAction"});
        }
        userdoc['terminus:action'] = permdoc;
    }
    userdoc['terminus:authority_scope'] = (dbid  
        ? {"@id": "doc:" + dbid, "@type": "terminus:Database"} 
        : {"@id": "doc:server", "@type": "terminus:Server"});
    return userdoc;    
}

module.exports = DocumentGenerator;
