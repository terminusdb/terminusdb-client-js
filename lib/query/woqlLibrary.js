const WOQLQuery = require('./woqlCore');

function WOQLLibrary(g){
	this.default_schema = g || "schema/main"
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
        new WOQLQuery().not().quad("v:Class", "terminus:tag", "terminus:abstract", g),
        new WOQLQuery().limit(1).opt().quad("v:Class", "label", "v:Label", g),
		new WOQLQuery().limit(1).opt().quad("v:Class", "comment", "v:Comment", g)
	)
}

WOQLLibrary.prototype.propertyMetadata = function(g){
	g = g || this.default_schema
	return new WOQLQuery().and(
        new WOQLQuery().quad("v:Property", "type", "v:PropertyType", g),
		new WOQLQuery().or(
			new WOQLQuery().eq("v:PropertyType", "owl:DatatypeProperty"),
			new WOQLQuery().eq("v:PropertyType", "owl:ObjectProperty")
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
	return new WOQLQuery().select("v:Element", "v:Label", "v:Comment", "v:Parents", "v:Domain", "v:Range").and(
		new WOQLQuery().quad("v:Element", "type", "v:Type", g),
		new WOQLQuery().opt().quad("v:Element", "terminus:tag", "v:Abstract", g),
		new WOQLQuery().opt().quad("v:Element", "label", "v:Label", g),
		new WOQLQuery().opt().quad("v:Element", "comment", "v:Comment", g),
        new WOQLQuery().opt().group_by("v:Element", "v:Parent", "v:Parents").and(
            new WOQLQuery().quad("v:Element", "subClassOf", "v:Parent", g)
        ),
		new WOQLQuery().opt().quad("v:Element", "domain", "v:Domain", g),
		new WOQLQuery().opt().quad("v:Element", "range", "v:Range", g)
	);
}

WOQLLibrary.prototype.classList = function(g){
	g = g || this.default_schema
	return new WOQLQuery().select("v:Class", "v:Name", "v:Parents", "v:Children", "v:Description", "v:Abstract").and(
		new WOQLQuery().quad("v:Class", "type", "owl:Class", g),
		new WOQLQuery().limit(1).opt().quad("v:Class", "label", "v:Name", g),
		new WOQLQuery().limit(1).opt().quad("v:Class", "comment", "v:Description", g),
		new WOQLQuery().opt().quad("v:Class", "terminus:tag", "v:Abstract", g),
		new WOQLQuery().opt().group_by("v:Class", "v:Parent", "v:Parents").and(
            new WOQLQuery().quad("v:Class", "subClassOf", "v:Parent", g),
            new WOQLQuery().or(
                new WOQLQuery().eq("v:Parent", "terminus:Document"),
                new WOQLQuery().quad("v:Parent", "type", "owl:Class", g),
            )
        ),
		new WOQLQuery().opt().group_by("v:Class", "v:Child", "v:Children").and(
            new WOQLQuery().quad("v:Child", "subClassOf", "v:Class", g),
            new WOQLQuery().quad("v:Child", "type", "owl:Class", g)
        )
	)
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
	    new WOQLQuery().sub("terminus:Document", "v:Source_Class"),
	    new WOQLQuery().isa("v:Target", "v:Target_Class"),
	    new WOQLQuery().sub("terminus:Document", "v:Target_Class"),
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

/**
 * These are for the master database
 */

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

/**
 * These query the built in commits graph
 * they take a graph identifier string (account/db/repo/_commits) as an optional last argument
 * If passed, they will wrap the query in a using resource identifier
 */


/**
 * Loads the branch name and head commit id of branch (defaults to all branches) 
 */
WOQLLibrary.prototype.getBranchDetails = function(branch_name, head, cresource){
    head = head || "v:Head"
    branch_name = branch_name || "v:Branch"
    let woql = new WOQLQuery().and(
		new WOQLQuery().triple("v:BranchIRI", "ref:branch_name", branch_name),
		new WOQLQuery().opt().and(
            new WOQLQuery().triple("v:BranchIRI", "ref:ref_commit", "v:HeadIRI"), 
            new WOQLQuery().triple("v:HeadIRI", "ref:commit_id", head),
            new WOQLQuery().triple("v:HeadIRI", "ref:commit_timestamp", "v:Time"),
        ) 
    )
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadBranchDetails = function(client, branch_name, head){
	return this.getBranchDetails(branch_name, head, client.resource("commits"))
}

WOQLLibrary.prototype.getBranchNames = function(cresource){
    let woql = new WOQLQuery().select("v:BranchName").triple("v:Branch", "ref:branch_name", "v:BranchName")
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadBranchNames = function(client){
    return this.getBranchNames(client.resource("commits"))
}

WOQLLibrary.prototype.getBranchGraphNames = function(branch_name, cresource){
	let woql = new WOQLQuery().and(
        this.getBranchDetails(branch_name, "v:Head"),
        this.getGraphsAtRef("v:Head")
    )
    return this.pointQueryAtResource(woql, cresource)
}

/**
 * pass the client and uses looks for current branch in current commits graph
 */
WOQLLibrary.prototype.loadBranchGraphNames = function(client){
	return this.getBranchGraphNames(client.checkout(), client.resource("commits"))
}

/**
 * Loads meta-data about the types of graphs that existed in a DB at the time of a particular commit
 */
WOQLLibrary.prototype.getGraphsAtRef = function(commitID, cresource){
    let woql = new WOQLQuery().and(
        new WOQLQuery().triple("v:CommitIRI", "ref:commit_id", commitID), 
        new WOQLQuery().or(
            new WOQLQuery().triple("v:CommitIRI", "ref:instance", "v:GraphIRI").eq("v:GraphType", "instance"),
            new WOQLQuery().triple("v:CommitIRI", "ref:schema", "v:GraphIRI").eq("v:GraphType", "schema"),
            new WOQLQuery().triple("v:CommitIRI", "ref:inference", "v:GraphIRI").eq("v:GraphType", "inference")
        ),
        new WOQLQuery().triple("v:GraphIRI", "ref:graph_name", "v:GraphID")
    )
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadGraphsAtRef = function(client){
    return this.getGraphsAtRef(client.ref(), client.resource("commits"))
}

WOQLLibrary.prototype.loadGraphStructure = function(client){
    return this.getGraphStructure(client.checkout(), client.ref(), client.resource("commits"))

}


/**
 * Loads the branches, graphs in those branches and their sizes for any given ref / branch
 */
WOQLLibrary.prototype.getGraphStructure = function(branch, ref, cresource){
    if(ref){
        var start = this.getGraphsAtRef(ref)
    }
    else {
        var start = this.getBranchGraphNames(branch)
    } 

    let commitquery = new WOQLQuery().and(
        start, 
        new WOQLQuery().opt(this.getFirstCommit())
    )
    return this.pointQueryAtResource(commitquery, cresource)

    let full = new WOQLQuery().and(
        new WOQLQuery().using(cresource, commitquery),
        new WOQLQuery().and(
            new WOQLQuery().concat("v:GraphType/v:GraphID", "v:GraphFilter"),
            new WOQLQuery().size("v:GraphFilter", "v:Size"),
            new WOQLQuery().triple_count("v:GraphFilter", "v:Triples")
        )
    )
    return full
}


WOQLLibrary.prototype.rewind = function(ref, ts, cresource){
	let woql = new WOQLQuery().select("v:CommitID").limit(1).and(
		new WOQLQuery().triple("v:HeadIRI",  "ref:commit_id", ref),
        new WOQLQuery().path("v:HeadIRI", "ref:commit_parent+", "v:CommitIRI", "v:Path"),
        new WOQLQuery().triple("v:CommitIRI",  "ref:commit_id", "v:CommitID"),
        new WOQLQuery().triple("v:CommitIRI",  "ref:commit_timestamp", "v:Time"),
        new WOQLQuery().not().greater(ts, "v:Time")
    )
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.getCommitAtTime = function(branch, ts, cresource){
	let woql = new WOQLQuery().limit(1).and(
		new WOQLQuery().eq(ts, "v:LastCommitBefore"),
		new WOQLQuery().triple("v:Branch", "ref:branch_name", branch),
		new WOQLQuery().triple("v:Branch", "ref:ref_commit", "v:Head"),
		new WOQLQuery().triple("v:Head",  "ref:commit_id", "v:HeadID"),
		new WOQLQuery().triple("v:Head",  "ref:commit_timestamp", "v:HeadTime"),
		new WOQLQuery().or(
			new WOQLQuery().and(
				new WOQLQuery().not().greater("v:LastCommitBefore", "v:HeadTime"),
				new WOQLQuery().eq("v:CommitID",  "v:HeadID"),
			),
			new WOQLQuery().limit(1).and(
				new WOQLQuery().path("v:Head", "ref:commit_parent+", "v:Tail", "v:Path"),
				new WOQLQuery().triple("v:Tail",  "ref:commit_id", "v:TailID"),
				new WOQLQuery().triple("v:Tail",  "ref:commit_timestamp", "v:TailTime"),
				new WOQLQuery().not().greater("v:LastCommitBefore", "v:TailTime"),
				new WOQLQuery().eq("v:CommitID",  "v:TailID")
			)
        ),
    )
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadCommitAtTime = function(client, ts, branch){
    branch = branch || client.checkout()
 	return this.getCommitBefore(branch, ts, client.resource("commits"))
}


WOQLLibrary.prototype.getCommitBefore = function(branch, ts, cresource){
    let woql = this.getCommitAtTime(branch, ts).and().getCommitDetails("v:CommitID")
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadCommitBefore = function(client, branch, ts){
    branch = branch || client.checkout()
 	return this.getCommitBefore(branch, ts, client.resource("commits"))
}

WOQLLibrary.prototype.getCommitDetails = function(commit_name, commitvar, cresource){
	commitvar = commitvar || "v:Commit"
	let woql = new WOQLQuery().and(
		new WOQLQuery().triple(commitvar, "ref:commit_id", commit_name),
		new WOQLQuery().triple(commitvar, "ref:commit_timestamp", "v:Time"),
		new WOQLQuery().opt().and(
			new WOQLQuery().triple(commitvar, "ref:commit_parent", "v:ParentID"),
			new WOQLQuery().triple("v:ParentID", "ref:commit_id", "v:Parent")
		),
		new WOQLQuery().opt().and(
			new WOQLQuery().triple("v:ChildID", "ref:commit_parent", commitvar),
			new WOQLQuery().triple("v:ChildID", "ref:commit_id", "v:Child")
		),
		new WOQLQuery().opt().and(
			new WOQLQuery().triple("v:Branch", "ref:branch_name", "v:BranchName"),
			new WOQLQuery().triple("v:Branch", "ref:ref_commit", commitvar), 
		),
		new WOQLQuery().opt().triple(commitvar, "ref:commit_author", "v:Author"),
		new WOQLQuery().opt().triple(commitvar, "ref:commit_message", "v:Message")
	)
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadCommitDetails = function(client, commit_name, commitvar){
    return this.getCommitDetails(commit_name, commitvar, client.resource("commits"))
}	

WOQLLibrary.prototype.loadCommitBranchDetails = function(client, commit_name, branch, commitvar){
    return this.getCommitBranchDetails(commit_name, branch, commitvar, client.resource("commits"))
}	

WOQLLibrary.prototype.getCommitBranchDetails = function(commit_name, branch, commitvar, cresource){
	commitvar = commitvar || "v:Commit"
	let woql = new WOQLQuery().and(
		new WOQLQuery().eq(commit_name, "v:CommitID"),
		new WOQLQuery().triple(commitvar, "ref:commit_id", commit_name),
		new WOQLQuery().triple(commitvar, "ref:commit_timestamp", "v:Time"),
		new WOQLQuery().opt().and(
			new WOQLQuery().triple(commitvar, "ref:commit_parent", "v:ParentID"),
			new WOQLQuery().triple("v:ParentID", "ref:commit_id", "v:Parent")
		),
		new WOQLQuery().and(
			new WOQLQuery().triple("v:Branch", "ref:branch_name", branch),
			new WOQLQuery().triple("v:Branch", "ref:ref_commit", "v:BHead"), 
		),
		new WOQLQuery().opt().and(
			new WOQLQuery().triple("v:ChildID", "ref:commit_parent", commitvar),
            new WOQLQuery().triple("v:ChildID", "ref:commit_id", "v:Child"),
            new WOQLQuery().path("v:BHead", "ref:commit_parent+", "v:ChildID", "v:Path"),
		),
		new WOQLQuery().opt().triple(commitvar, "ref:commit_author", "v:Author"),
		new WOQLQuery().opt().triple(commitvar, "ref:commit_message", "v:Message")
	)
    return this.pointQueryAtResource(woql, cresource)
}


WOQLLibrary.prototype.getCommitBefore = function(branch, ts, cresource){
	let woql = new WOQLQuery().limit(1).and(
		new WOQLQuery().eq(ts, "v:LastCommitBefore"),//blows out the clause and makes it embeddable
		new WOQLQuery().triple("v:Branch", "ref:branch_name", branch),
		new WOQLQuery().triple("v:Branch", "ref:ref_commit", "v:Head"),
		new WOQLQuery().triple("v:Head",  "ref:commit_id", "v:HeadID"),
		new WOQLQuery().triple("v:Head",  "ref:commit_timestamp", "v:HeadTime"),
		new WOQLQuery().or(
			new WOQLQuery().and(
				new WOQLQuery().less("v:HeadTime",  ts),
				new WOQLQuery().eq("v:CommitID",  "v:HeadID"),
			),
			new WOQLQuery().limit(1).and(
				new WOQLQuery().path("v:Head", "ref:commit_parent+", "v:Tail", "v:Path"),
				new WOQLQuery().triple("v:Tail",  "ref:commit_id", "v:TailID"),
				new WOQLQuery().triple("v:Tail",  "ref:commit_timestamp", "v:TailTime"),
				new WOQLQuery().less("v:TailTime",  ts),
				new WOQLQuery().eq("v:CommitID",  "v:TailID")
			)
		),
		this.getCommitDetails("v:CommitID")
    )
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadCommitBefore = function(client, ts){
 	return this.getCommitBefore(client.checkout(), ts, client.resource("commits"))
}

WOQLLibrary.prototype.getBranchLimits = function(branch, cresource){
	let woql = new WOQLQuery().and(
		new WOQLQuery().triple("v:Branch", "ref:branch_name", branch),
		new WOQLQuery().opt().triple("v:Branch", "ref:ref_commit", "v:Head"),
		new WOQLQuery().opt().triple("v:Head",  "ref:commit_id", "v:HeadID"),
		new WOQLQuery().opt().triple("v:Head",  "ref:commit_timestamp", "v:Last"),
		new WOQLQuery().opt().and(
			new WOQLQuery().path("v:Head", "ref:commit_parent+", "v:Tail", "v:Path"),
			new WOQLQuery().not().triple("v:Tail",  "ref:commit_parent", "v:Any"),
			new WOQLQuery().triple("v:Tail",  "ref:commit_id", "v:TailID"),
			new WOQLQuery().triple("v:Tail",  "ref:commit_timestamp", "v:First"),
		)
    )
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadBranchLimits = function(client){
	return this.getBranchLimits(client.checkout(), client.resource("commits"))
}


WOQLLibrary.prototype.getFirstCommit = function(comvar, cresource){
    comvar = comvar || "v:FirstCommit"
    let woql = new WOQLQuery().and(
        new WOQLQuery().triple("v:Tail",  "ref:commit_id", comvar),
        new WOQLQuery().not().triple("v:Tail",  "ref:commit_parent", "v:Any"),
        this.getCommitDetails(comvar)
    )
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.loadFirstCommit = function(client, comvar){
    return this.getFirstCommit(comvar, client.resource("commits"))
}

WOQLLibrary.prototype.timestampToActiveCommit = function(branch, ts, cresource){
    let woql = new WOQLQuery().select("v:CommitID", this.getCommitBefore(branch, ts))
    return this.pointQueryAtResource(woql, cresource)
}

WOQLLibrary.prototype.runQueryAtTime = function(branch, ts, commitbase, cresource, query){
    let woql = new WOQLQuery().and(
        new WOQLQuery().eq(ts, "v:AtTime"),
        this.timestampToActiveCommit(branch, ts, cresource), // => gives us active commit at ts via "v:commitID"
        new WOQLQuery().concat([commitbase, "v:CommitID"], "v:CommitResource"),
        new WOQLQuery().using("v:CommitResource", query) 
    )
    return woql
}

WOQLLibrary.prototype.runQueryAtTimes = function(branch, times, commitbase, cresource, query){
    let woql = new WOQLQuery()
    for(var i = 0; i<times.length; i++){
        woql.and(
            this.runQueryAtTime(branch, times[i], cresource, commitbase, query)
        )
    }
    return woql
}

WOQLLibrary.prototype.graphDiffBetweenRefs = function(graphfilter, refa, refb, commitbase, cresource){
    let woql = new WOQLQuery().and(
        new WOQLQuery().and(
            new WOQLQuery().eq("v:FirstCommitID", refa).and().quad("v:SubjectA", "v:PredicateA", "v:ObjectA", graphfilter),
            new WOQLQuery().eq("v:SecondCommitID", refb).and().quad("v:SubjectB", "v:PredicateB", "v:ObjectB", graphfilter)
        )
    )
    //in a, not in b
    //WOQL.not().
}

WOQLLibrary.prototype.dumpGraphToFile = function(graphid, file){
    let woql = new WOQLQuery().and(
        new WOQLQuery().quad("v:Subject", "v:Predicate", "v:Object", graphid)
    )
    let put = new WOQLQuery().put(
        new WOQLQuery().as("Subject", "v:Subject")
            .as("Predicate", "v:Predicate")
            .as("Object", "v:Object")
            .as(graphid, "v:Graph")
        , woql).file(file)
    return put
}

WOQLLibrary.prototype.eatDump = function(file){
    let get = new WOQLQuery().get(
        new WOQLQuery().as("Subject", "v:Subject")
            .as("Predicate", "v:Predicate")
            .as("Object", "v:Object")
            .as(graphid, "v:Graph"), 
            new WOQLQuery().add_quad("v:Subject", "v:Predicate", "v:Object", "v:Graph")
        ).file(file)
    return put
}

WOQLLibrary.prototype.history = function(dates, branchresource, query){
    //calculate other resources from branchresource...
    let parts = branchresource.split("/")
    let branch = parts[parts.length-1]
    let repobase = parts.slice(0, parts.length-2).join("/")
    let cresource = repobase + "/" + "_commits"
    let commitbase = repobase + "/commit/"
    if(Array.isArray(dates)){
        let timestamps = dates.map((item) => this.dateToTimestamp(item))
        return this.runQueryAtTimes(branch, timestamps, commitbase, cresource, query)
    }
    else {
        return this.runQueryAtTime(branch, this.dateToTimestamp(item), commitbase, cresource, query)
    }
}

WOQLLibrary.prototype.pointQueryAtResource = function(query, res){
    if(res) return new WOQLQuery().using(res, query)
    return query
}




module.exports = WOQLLibrary;
