
function WOQLLibrary(){
	this.qlib = 
	getEverything: function(GraphIRI){
	if(GraphIRI){
		GraphIRI = this.cleanGraph(GraphIRI);
		return this.quad("v:Subject", "v:Predicate", "v:Object", GraphIRI);
	}
	else {
		return this.triple("v:Subject", "v:Predicate", "v:Object");
	}
}

WOQLQuery.prototype.getAllDocuments = function(){
	return this.and(
		WOQL.triple("v:Subject", "rdf:type", "v:Type"),
		WOQL.sub("v:Type", "tcs:Document")
	);
}

WOQLQuery.prototype.documentMetadata = function(){
	return this.and(
		WOQL.triple("v:ID", "rdf:type", "v:Class"),
		WOQL.sub("v:Class", "tcs:Document"),
		WOQL.opt().triple("v:ID", "rdfs:label", "v:Label"),
		WOQL.opt().triple("v:ID", "rdfs:comment", "v:Comment"),
		WOQL.opt().quad("v:Class", "rdfs:label", "v:Type", "db:schema"),
		WOQL.opt().quad("v:Class", "rdfs:comment", "v:Type_Comment", "db:schema")
	);
}

WOQLQuery.prototype.concreteDocumentClasses = function(){
	return this.and(
		WOQL.sub("v:Class", "tcs:Document"),
		WOQL.not().abstract("v:Class"),
		WOQL.opt().quad("v:Class", "rdfs:label", "v:Label", "db:schema"),
		WOQL.opt().quad("v:Class", "rdfs:comment", "v:Comment", "db:schema")
	);
}

WOQLQuery.prototype.propertyMetadata = function(){
	return this.and(
		WOQL.or(
			WOQL.quad("v:Property", "rdf:type", "owl:DatatypeProperty", "db:schema"),
			WOQL.quad("v:Property", "rdf:type", "owl:ObjectProperty", "db:schema")
		),
		WOQL.opt().quad("v:Property", "rdfs:range", "v:Range", "db:schema"),
		WOQL.opt().quad("v:Property", "rdf:type", "v:Type", "db:schema"),
		WOQL.opt().quad("v:Property", "rdfs:label", "v:Label", "db:schema"),
		WOQL.opt().quad("v:Property", "rdfs:comment", "v:Comment", "db:schema"),
		WOQL.opt().quad("v:Property", "rdfs:domain", "v:Domain", "db:schema")
	);
}

WOQLQuery.prototype.elementMetadata = function(){
	return this.and(
		WOQL.quad("v:Element", "rdf:type", "v:Type", "db:schema"),
		WOQL.opt().quad("v:Element", "tcs:tag", "v:Abstract", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:label", "v:Label", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:comment", "v:Comment", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:subClassOf", "v:Parent", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:domain", "v:Domain", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:range", "v:Range", "db:schema")
	);
}

WOQLQuery.prototype.classMetadata = function(){
	return this.and(
		WOQL.quad("v:Element", "rdf:type", "owl:Class", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:label", "v:Label", "db:schema"),
		WOQL.opt().quad("v:Element", "rdfs:comment", "v:Comment", "db:schema"),
		WOQL.opt().quad("v:Element", "tcs:tag", "v:Abstract", "db:schema")
	);
}

WOQLQuery.prototype.getDataOfClass = function(chosen){
	return this.and(
		WOQL.triple("v:Subject", "rdf:type", chosen),
		WOQL.opt().triple("v:Subject", "v:Property", "v:Value")
	);
}

WOQLQuery.prototype.getDataOfProperty = function(chosen){
	return this.and(
		WOQL.triple("v:Subject", chosen, "v:Value"),
		WOQL.opt().triple("v:Subject", "rdfs:label", "v:Label")
	);
}

WOQLQuery.prototype.documentProperties = function(id){
	return this.and(
		WOQL.triple(id, "v:Property", "v:Property_Value"),
		WOQL.opt().quad("v:Property", "rdfs:label", "v:Property_Label", "db:schema"),
		WOQL.opt().quad("v:Property", "rdf:type", "v:Property_Type", "db:schema")
	);
}

WOQLQuery.prototype.getDocumentConnections = function(id){
	return this.and(
		WOQL.eq("v:Docid", id),
		WOQL.or(
			WOQL.triple(id, "v:Outgoing", "v:Entid"),
			WOQL.triple("v:Entid", "v:Incoming", id)
		),
		WOQL.triple("v:Entid", "type", "v:Enttype"),
		WOQL.sub("v:Enttype", "tcs:Document"),
		WOQL.opt().triple("v:Entid", "rdfs:label", "v:Label"),
		WOQL.opt().quad("v:Enttype", "rdfs:label", "v:Class_Label", "db:schema")
	);
}

WOQLQuery.prototype.getAllDocumentConnections = function(){
	return this.and(
		WOQL.sub("v:Enttype", "tcs:Document"),
		WOQL.triple("v:doc1", "type", "v:Enttype"),
		WOQL.triple("v:doc1", "v:Predicate", "v:doc2"),
		WOQL.triple("v:doc2", "type", "v:Enttype2"),
		WOQL.sub("v:Enttype2", "tcs:Document"),
		WOQL.opt().triple("v:doc1", "rdfs:label", "v:Label1"),
		WOQL.opt().triple("v:doc2", "rdfs:label", "v:Label2"),
		WOQL.not().eq("v:doc1", "v:doc2")
	);
}

WOQLQuery.prototype.getInstanceMeta = function(url){
	return this.and(
		WOQL.triple(url, "rdf:type", "v:InstanceType"),
		WOQL.opt().triple(url, "rdfs:label", "v:InstanceLabel"),
		WOQL.opt().triple(url, "rdfs:comment", "v:InstanceComment"),
		WOQL.opt().quad("v:InstanceType", "rdfs:label", "v:ClassLabel", "db:schema")
	);
}

WOQLQuery.prototype.simpleGraphQuery = function(){
	return this.and(
	    WOQL.triple("v:Source", "v:Edge", "v:Target"),
	    WOQL.isa("v:Source", "v:Source_Class"),
	    WOQL.sub("v:Source_Class", "tcs:Document"),
	    WOQL.isa("v:Target", "v:Target_Class"),
	    WOQL.sub("v:Target_Class", "tcs:Document"),
	    WOQL.opt().triple("v:Source", "rdfs:label", "v:Source_Label"),
	    WOQL.opt().triple("v:Source", "rdfs:comment", "v:Source_Comment"),
	    WOQL.opt().quad("v:Source_Class", "rdfs:label", "v:Source_Type", "db:schema"),
	    WOQL.opt().quad("v:Source_Class", "rdfs:comment", "v:Source_Type_Comment", "db:schema"),
	    WOQL.opt().triple("v:Target", "rdfs:label", "v:Target_Label"),
	    WOQL.opt().triple("v:Target", "rdfs:comment", "v:Target_Comment"),
	    WOQL.opt().quad("v:Target_Class", "rdfs:label", "v:Target_Type", "db:schema"),
	    WOQL.opt().quad("v:Target_Class", "rdfs:comment", "v:Target_Type_Comment", "db:schema"),
	    WOQL.opt().quad("v:Edge", "rdfs:label", "v:Edge_Type", "db:schema"),
	    WOQL.opt().quad("v:Edge", "rdfs:comment", "v:Edge_Type_Comment", "db:schema")
	);
}
