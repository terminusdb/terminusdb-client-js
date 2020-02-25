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
    if(title) dbdoc['rdfs:label'] = { "@language":  "en", "@value": title };
    if(description) dbdoc['rdfs:comment'] = { "@language":  "en", "@value": description};
    return repodoc;    
}

DocumentGenerator.prototype.user = function(id, title, description){
    let repodoc = {
        "@id": id,
        "@context" : this.context(),
        "@type": "terminus:Repository",
    };
    if(title) dbdoc['rdfs:label'] = { "@language":  "en", "@value": title };
    if(description) dbdoc['rdfs:comment'] = { "@language":  "en", "@value": description};
    return repodoc;    
}

