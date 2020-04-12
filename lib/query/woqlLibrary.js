const WOQLQuery = require('./woqlCore');

function WOQLLibrary(g){
	this.default_schema = g || "schema"
}

WOQLLibrary.prototype.getAllDocuments = function(){
	return new WOQLQuery().and(
		new WOQLQuery().triple("v:Subject", "type", "v:Type"),
		new WOQLQuery().sub("terminus:Document", "v:Type")
	);
}

WOQLLibrary.prototype.documentMetadata = function(g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().triple("v:ID", "rdf:type", "v:Class"),
		new WOQLQuery().sub("terminus:Document", "v:Class"),
		new WOQLQuery().opt().triple("v:ID", "label", "v:Label"),
		new WOQLQuery().opt().triple("v:ID", "comment", "v:Comment"),
		new WOQLQuery().opt().quad("v:Class", "label", "v:Type", g),
		new WOQLQuery().opt().quad("v:Class", "comment", "v:Type_Comment", g)
	)
}

WOQLLibrary.prototype.concreteDocumentClasses = function(g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().sub("terminus:Document", "v:Class"),
		new WOQLQuery().not().abstract("v:Class"),
		new WOQLQuery().opt().quad("v:Class", "label", "v:Label", g),
		new WOQLQuery().opt().quad("v:Class", "comment", "v:Comment", g)
	)
}

WOQLLibrary.prototype.propertyMetadata = function(g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().or(
			new WOQLQuery().quad("v:Property", "type", "owl:DatatypeProperty", g),
			new WOQLQuery().quad("v:Property", "type", "owl:ObjectProperty", g)
		),
		new WOQLQuery().opt().quad("v:Property", "range", "v:Range", g),
		new WOQLQuery().opt().quad("v:Property", "type", "v:Type", g),
		new WOQLQuery().opt().quad("v:Property", "label", "v:Label", g),
		new WOQLQuery().opt().quad("v:Property", "comment", "v:Comment", g),
		new WOQLQuery().opt().quad("v:Property", "domain", "v:Domain", g)
	);
}

WOQLLibrary.prototype.elementMetadata = function(g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().quad("v:Element", "type", "v:Type", g),
		new WOQLQuery().opt().quad("v:Element", "terminus:tag", "v:Abstract", g),
		new WOQLQuery().opt().quad("v:Element", "label", "v:Label", g),
		new WOQLQuery().opt().quad("v:Element", "comment", "v:Comment", g),
		new WOQLQuery().opt().quad("v:Element", "subClassOf", "v:Parent", g),
		new WOQLQuery().opt().quad("v:Element", "domain", "v:Domain", g),
		new WOQLQuery().opt().quad("v:Element", "range", "v:Range", g)
	);
}

WOQLLibrary.prototype.classMetadata = function(g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().quad("v:Class", "type", "owl:Class", g),
		new WOQLQuery().opt().quad("v:Class", "label", "v:Label", g),
		new WOQLQuery().opt().quad("v:Class", "comment", "v:Comment", g),
		new WOQLQuery().opt().quad("v:Class", "terminus:tag", "v:Abstract", g)
	);
}

WOQLLibrary.prototype.getDataOfClass = function(chosen){
	return new WOQLQuery().and(
		new WOQLQuery().triple("v:Subject", "type", chosen),
		new WOQLQuery().opt().triple("v:Subject", "v:Property", "v:Value")
	);
}

WOQLLibrary.prototype.getDataOfProperty = function(chosen){
	return new WOQLQuery().and(
		new WOQLQuery().triple("v:Subject", chosen, "v:Value"),
		new WOQLQuery().opt().triple("v:Subject", "label", "v:Label")
	);
}

WOQLLibrary.prototype.documentProperties = function(id, g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().triple(id, "v:Property", "v:Property_Value"),
		new WOQLQuery().opt().quad("v:Property", "label", "v:Property_Label", g),
		new WOQLQuery().opt().quad("v:Property", "type", "v:Property_Type", g)
	);
}

WOQLLibrary.prototype.getDocumentConnections = function(id, g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().eq("v:Docid", id),
		new WOQLQuery().or(
			new WOQLQuery().triple(id, "v:Outgoing", "v:Entid"),
			new WOQLQuery().triple("v:Entid", "v:Incoming", id)
		),
		new WOQLQuery().triple("v:Entid", "type", "v:Enttype"),
		new WOQLQuery().sub("terminus:Document", "v:Enttype"),
		new WOQLQuery().opt().triple("v:Entid", "label", "v:Label"),
		new WOQLQuery().opt().quad("v:Enttype", "label", "v:Class_Label", g)
	);
}

WOQLLibrary.prototype.getAllDocumentConnections = function(){
	return new WOQLQuery().and(
		new WOQLQuery().sub("terminus:Document", "v:Enttype"),
		new WOQLQuery().triple("v:doc1", "type", "v:Enttype"),
		new WOQLQuery().triple("v:doc1", "v:Predicate", "v:doc2"),
		new WOQLQuery().triple("v:doc2", "type", "v:Enttype2"),
		new WOQLQuery().sub("terminus:Document", "v:Enttype2"),
		new WOQLQuery().opt().triple("v:doc1", "label", "v:Label1"),
		new WOQLQuery().opt().triple("v:doc2", "label", "v:Label2"),
		new WOQLQuery().not().eq("v:doc1", "v:doc2")
	);
}

WOQLLibrary.prototype.getInstanceMeta = function(url, g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().triple(url, "type", "v:InstanceType"),
		new WOQLQuery().opt().triple(url, "label", "v:InstanceLabel"),
		new WOQLQuery().opt().triple(url, "comment", "v:InstanceComment"),
		new WOQLQuery().opt().quad("v:InstanceType", "label", "v:ClassLabel", g)
	);
}

WOQLLibrary.prototype.simpleGraphQuery = function(g){
	g = g || this.default_schema
	return new WOQLQuery().and(
	    new WOQLQuery().triple("v:Source", "v:Edge", "v:Target"),
	    new WOQLQuery().isa("v:Source", "v:Source_Class"),
	    new WOQLQuery().sub("v:Source_Class", "terminus:Document"),
	    new WOQLQuery().isa("v:Target", "v:Target_Class"),
	    new WOQLQuery().sub("v:Target_Class", "terminus:Document"),
	    new WOQLQuery().opt().triple("v:Source", "label", "v:Source_Label"),
	    new WOQLQuery().opt().triple("v:Source", "comment", "v:Source_Comment"),
	    new WOQLQuery().opt().quad("v:Source_Class", "label", "v:Source_Type", g),
	    new WOQLQuery().opt().quad("v:Source_Class", "comment", "v:Source_Type_Comment", g),
	    new WOQLQuery().opt().triple("v:Target", "label", "v:Target_Label"),
	    new WOQLQuery().opt().triple("v:Target", "comment", "v:Target_Comment"),
	    new WOQLQuery().opt().quad("v:Target_Class", "label", "v:Target_Type", g),
	    new WOQLQuery().opt().quad("v:Target_Class", "comment", "v:Target_Type_Comment", g),
	    new WOQLQuery().opt().quad("v:Edge", "label", "v:Edge_Type", g),
	    new WOQLQuery().opt().quad("v:Edge", "comment", "v:Edge_Type_Comment", g)
	);
}

WOQLLibrary.prototype.concreteDocumentClasses = function(g){
	g = g || this.default_schema
	return new WOQLQuery().and(
		new WOQLQuery().sub("terminus:Document", "v:Class"),
		new WOQLQuery().not().abstract("v:Class"),
		new WOQLQuery().opt().quad("v:Class", "label", "v:Label", g),
		new WOQLQuery().opt().quad("v:Class", "comment", "v:Comment", g)
	);
}

WOQLLibrary.prototype.getCapabilities = function(uid, dbid){
    let pattern = []
    if(uid){
        pattern.push(
            new WOQLQuery().idgen("doc:User", [uid], "v:UID"),
        )
    }
    if(dbid){
        pattern.push(
            new WOQLQuery().idgen("doc:", [dbid], "v:DBID"),
        )
    }
    pattern = pattern.concat([
        new WOQLQuery().triple("v:UID", "terminus:authority", "v:CapID"),
        new WOQLQuery().triple("v:CapID", "terminus:authority_scope", "v:DBID"),
        new WOQLQuery().triple("v:CapID", "terminus:action", "v:Action")
    ])
    return new WOQLQuery().and( ...pattern )   
}

WOQLLibrary.prototype.createDatabase = function(dbid, label, description){
    let gen = new WOQLQuery().idgen("doc:", [dbid], "v:DBID")
    let writes = [
        new WOQLQuery().add_triple("v:DBID", "type", "terminus:Database"),
        new WOQLQuery().add_triple("v:DBID", "label", label)
	]
	if(description){
        writes.push( new WOQLQuery().add_triple("v:DBID", "comment", description) )
	}
	return new WOQLQuery().when(gen).and(...writes)
}


WOQLLibrary.prototype.createCapability = function(target, capabilities, prefix, vcap) {
	prefix = prefix || "doc:"
	vcap = vcap || "v:Capability" 
	let vdb = "v:DB"+ (target.indexOf(":") == -1 ? target : target.split(":")[1])
    
	let capids = [target].concat(capabilities.sort());
    //make variable names have global scope;
    let gens = [
		new WOQLQuery().unique(prefix+"Capability", capids, vcap),
		new WOQLQuery().idgen(prefix, [target], vdb),
		new WOQLQuery().not().triple(vcap, "type", "terminus:DatabaseCapability")
	]
	let writecap = [
		new WOQLQuery().add_triple(vcap, "type", "terminus:DatabaseCapability"),
		new WOQLQuery().add_triple(vcap, "terminus:authority_scope", vdb),
	]
	for(var j = 0; j<capabilities.length; j++){
		writecap.push(new WOQLQuery().add_triple(vcap, "terminus:action", capabilities[j]))
	}
	return new WOQLQuery().when(new WOQLQuery().and(...gens)).and(...writecap)
}



module.exports = WOQLLibrary;
