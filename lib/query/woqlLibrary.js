////@ts-check
const WOQLQuery = require('./woqlCore')
//const WOQLJSON = require('./woqlQuery')
const WOQL = require('../woql')
//too60758@zwoho.com
//const WOQLQuery = new WOQLQuery()
//lyp72911@zwoho.com
/**
 *  Library Functions all work in the same way, with the same signature
 *
 *  LIBRARY_ARGUMENTS = VALUES, VARIABLES, RESOURCE
 *
 *  Each Query instantiates a list of variables (default_variables)
 *
 *  The variable names in operation can be accessed via a meta call to lib:
 *
 *  variable_info = WOQL.lib("meta").functionName(VALUES, VARIABLES, RESOURCE)
 *
 *  To generate and execute the WOQL query itself, the same call without the "meta" argument:
 *
 *  WOQL.lib().functionName(VALUES, VARIABLES, RESOURCE).execute(woqlClient)
 *
 *  LIBRARY_ARGUMENTS: VARIABLES
 *
 *  The variable names can be overridden dynamically by passing a new array of variable names as the second VARIABLES argument to the library function.
 *
 *  This is important in two contexts:
 *      1 when we want to combine the query with another query that uses different variable names for the same entities
 *      2 when we want to reuse the same library function multiple times in the same query - this requires us to use different variable names or risk unintended namespace clashes.
 *      it allows us, for example, to generate these variable names in a loop with some index string identifier appended to each variable name
 *
 *  example: WOQL.lib().documents(null, ["My Custom Document Type Variable Name", "My Custom Document ID Variable Name"])
 *
 *  the results of the query will be reported using the variable names supplied so the type of the ith document can be accessed via:
 *
 *  bindings[i]["My Custom Document Type Variable Name"] => "whatever the document type is called"
 *
 *  Note: this effectively enables some sort of lexical scoping of variables, albeit in a poor-man client-side way, we intend to move the API for parameterised queries and lexical scoping back into the server API in the not-too-distant future. For the moment, this provides a relatively easy workaround.
 *
 *  LIBRARY_ARGUMENTS: RESOURCE
 *
 *  The resource argument is passed when a query must use a resource that is not the default context (e.g. a schema graph query or a commit graph query)
 *
 *  if ommitted, it defaults to the default current context ("_commits", "schema/main", etc...)
 *
 *  Only needs to be specified if you are doing something exotic across multiple graphs, defaults should cover all normal use cases
 *
 *  LIBRARY_ARGUMENTS: VALUES
 *
 *  Specify values that constrain the underlying query in some way.
 *
 *  Because of the nature of unification as used by WOQL, we generally only need to write a single general purpose query for every pattern of data access that we are interested.
 *  If we provide no VALUES constraints we get everything.
 *
 *  so for example:
 *  WOQL.lib().properties() => returns list of all properties in schema and all their metadata
 *  WOQL.lib().classes() => returns list of all classes in schema and all their metadata
 *  WOQL.lib().fullObjectProperties() => returns every object in the database in full json-ld form.
 *
 *  VALUES effectively allow us to add whatever filters we want to these general purpose query
 *
 *  WOQL.lib().classes("scm:ClassOfInterest") => returns metadata only for the passed class
 *  WOQL.lib().classes({"Class Name": "The Class Label I Want"}) => returns list of all classes that have the exact name passed
 *
 *  And, of course, we can also pass in a WOQL query to add arbitrarily expressive constraints to the query ....
 *
 *  WOQL.lib().classes(WOQL.sub("scm:myClass", "v:Class Name")) => returns list of all classes that are sub classes of scm:myClass
 *  WOQL.lib().classes(WOQL.length("v:Children", "v:ChildCount").greater("v:ChildCount", 2)) => returns list of all classes that have more than 2 subclasses
 *
 *  The advantage of doing it like this is that each library function always returns exactly the same data structure, no matter what constraints you add to it (if you set constraint parameters, they will be also reliably appear in the results)
 *
 *  It is also the case that, when one has this facility, you need to write very few actual queries, because almost all queries are small variations in constraints on underlying queries.
 *
 *  In the first version of TerminusDB client and console, there were dozens of different queries, all with their own variable naming
 *
 *  In version 2.0, we brought out a massively more complex console, with time travelling, branching and so on and a litany of new and complex data structures.
 *
 *  We had to write exactly 11 queries, (of 10 - 20 lines each) and about 15 single line constraints.
 *
 *  The terminusdb console uses no queries that are not defined in this library and it currently only uses a subset of the below.
 *
 *  This incredible concision and reusability strongly validates the unification based approach to query
 *
 *  The ease with which one can add constraints without affecting the structure or naming of result records is unbelievable
 *
 *  Almost any thing that you might want to know about the state of the system can be readily accessed through one of these queries, with awesomely expressive constraints built in.
 *
 */

function WOQLLibrary(mode) {
    this.mode = mode || 'query'
    this.user_variables = []
    this.user_values = []
    this.default_variables = []
    this.parameters = []
    this.default_schema_resource = 'schema/main'
    this.default_commit_resource = '_commits'
    this.default_meta_resource = '_meta'
    this.masterdb_resource = '_system'
    this.empty = ''
}//ValidCommit_o9b6gl5uy9n84waene2gt10keiyw77o

/**
 * General Pattern 4: Retrieves Branches, Their ID, Head Commit ID, Head Commit Time
 * (if present, new branches have no commits)
 */
WOQLLibrary.prototype.branches = function(){//values, variables, cresource) {
    //cresource = cresource || this.default_commit_resource
    //this.default_variables = ['Branch ID', 'Time', 'Commit ID', 'Branch IRI', 'Commit IRI']
    //if (variables) this._set_user_variables(variables)
    let woql = new WOQLQuery().triple("v:Branch","rdf:type","@schema:Branch").
                triple("v:Branch","@schema:name","v:Name").
                opt().triple("v:Branch","@schema:head","v:Head").
                triple("v:Head","@schema:identifier","v:commit_identifier").          
                triple("v:Head","@schema:timestamp","v:Timestamp")
    
    //to be review add constaints 
    //let compiled = this._add_constraints(woql, values)
    //there is a problem with using 
    return woql//new WOQLQuery().using('_commits', woql)
}



/**
 * General Pattern 9: Commits
 */
WOQLLibrary.prototype.commits = function(values, variables, cresource) {
    cresource = cresource || this.default_commit_resource
    this.default_variables = [
        'Commit ID',
        'Commit IRI',
        'Time',
        'Author',
        'Message',
        'Parent ID',
        'Parent IRI',
        'Children',
        'Child ID',
        'Child IRI',
        'Branch IRI',
        'Branch ID',
    ]
    if (variables) this._set_user_variables(variables)
    let qpattern = new WOQLQuery()
        .order_by(this._varn('Time'), 'desc')
        .triple(this._varn('Commit IRI'), '@schema:identifier', this._varn('Commit ID'))
        .triple(this._varn('Commit IRI'), '@schema:timestamp', this._varn('Time'))
        .limit(1)
        .or(
            new WOQLQuery().triple(
                this._varn('Commit IRI'),
                '@schema:author',
                this._varn('Author'),
            ),
            new WOQLQuery().eq(this._varn('Author'), this.empty),
        )
        .limit(1)
        .or(
            new WOQLQuery().triple(
                this._varn('Commit IRI'),
                '@schema:message',
                this._varn('Message'),
            ),
            new WOQLQuery().eq(this._varn('Message'), this.empty),
        )
        .limit(1)
        .or(
            new WOQLQuery()
                .triple(this._varn('Commit IRI'), '@schema:parent', this._varn('Parent IRI'))
                .triple(this._varn('Parent IRI'), '@schema:identifier', this._varn('Parent ID')),
            new WOQLQuery()
                .eq(this._varn('Parent IRI'), this.empty)
                .eq(this._varn('Parent ID'), this.empty),
        )
        .limit(1)
        .or(
            new WOQLQuery()
                .select(this._varn('Children'))
                .group_by(
                    [this._varn('Commit IRI'), this._varn('Child IRI')],
                    this._varn('Child ID'),
                    this._varn('Children'),
                )
                .triple(this._varn('Child IRI'), '@schema:parent', this._varn('Commit IRI'))
                .triple(this._varn('Child IRI'), '@schema:identifier', this._varn('Child ID')),
            new WOQLQuery().eq(this._varn('Children'), this.empty),
        )
        .limit(1)
        .or(
            new WOQLQuery()
                .triple(this._varn('Branch IRI'), '@schema:head', this._varn('Commit IRI'))
                .triple(this._varn('Branch IRI'), '@schema:name', this._varn('Branch ID')),
            new WOQLQuery()
                .eq(this._varn('Branch IRI'), this.empty)
                .eq(this._varn('Branch ID'), this.empty),
        )
    let compiled = this._add_constraints(qpattern, values)
    return new WOQLQuery().using(cresource, compiled)
}

/**
 * General Pattern 10: Commit Chain
 */
WOQLLibrary.prototype.commit_chain = function(values, variables, cresource) {
    cresource = cresource || this.default_commit_resource
    this.default_variables = ['Head IRI', 'Tail IRI', 'Path']
    if (variables) this._set_user_variables(variables)
    let woql = new WOQLQuery().path(
        this._varn('Head IRI'),
        '@schema:parent+',
        this._varn('Tail IRI'),
        this._varn('Path'),
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(cresource, compiled)
}

/**
 * General Pattern 12: dbs
 */
//we have to see if we need this
WOQLLibrary.prototype.dbs = function(values, variables) {
    this.default_variables = [
        'DB Name',
        'DB ID',
        'Organization',
        'Description',
        'DB IRI',
        'Organization IRI',
    ]
    if (variables) this._set_user_variables(variables)
    let woql = new WOQLQuery().and(
        new WOQLQuery()
            .triple(this._varn('DB IRI'), 'type', 'system:Database')
            .triple(this._varn('DB IRI'), 'system:resource_name', this._varn('DB ID'))
            .triple(
                this._varn('Organization IRI'),
                'system:organization_database',
                this._varn('DB IRI'),
            )
            .triple(
                this._varn('Organization IRI'),
                'system:organization_name',
                this._varn('Organization'),
            )
            .and(
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery().triple(
                            this._varn('DB IRI'),
                            'label',
                            this._varn('DB Name'),
                        ),
                        new WOQLQuery().eq(this._varn('DB Name'), this.empty),
                    ),
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery().triple(
                            this._varn('DB IRI'),
                            'comment',
                            this._varn('Description'),
                        ),
                        new WOQLQuery().eq(this._varn('Description'), this.empty),
                    ),
            ),
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(this.masterdb_resource, compiled)
}



WOQLLibrary.prototype.commit_chain_full = function(values, graph_resource) {
    cresource = graph_resource || this.default_commit_resource
    let woql = new WOQLQuery().or(
        new WOQLQuery().and(
            new WOQLQuery().lib().commit_chain(undefined, ['Commit IRI']),
            new WOQLQuery().lib().commits(),
        ),
        new WOQLQuery().and(
            new WOQLQuery().lib().commit_chain(undefined, ['Head IRI', 'Commit IRI']),
            new WOQLQuery().lib().commits(),
        ),
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(cresource, compiled)
}


/**
 * Finds the id of the very first commit in a database's history
 *
 * This is useful for finding information about when, by who and why the database was created
 * The first commit is the only commit in the database that does not have a parent commit
 * Therefore this query will not change performance markedly with the size of the database - it does not have to traverse any commit chain
 */
WOQLLibrary.prototype.first_commit = function() {
    let noparent = new WOQLQuery()
        //.using('_commits')
        .and(
            new WOQLQuery().triple(
                'v:Any Commit IRI',
                '@schema:identifier',
                'v:Commit ID'
            ),
            new WOQLQuery().triple(
                'v:Any Commit IRI',
                '@schema:author',
                'v:Author'
            ),
            new WOQLQuery().triple(
                'v:Any Commit IRI',
                '@schema:message',
                'v:Message'
            ),
            new WOQLQuery()
                .not()
                .triple(
                    'v:Any Commit IRI',
                    '@schema:parent',
                    'v:Parent IRI'
                ),
                
        )
    return noparent; //this._add_constraint(pattern, noparent)
}

WOQLLibrary.prototype.vars = function(...varray) {
    return varray.map(item => 'v:' + item)
}

WOQLLibrary.prototype.active_commit = function(branch, ts) {
    let q = new WOQLQuery()
        .limit(1)
        .and(new WOQLQuery().lib().active_commit_id(branch, ts), new WOQLQuery().lib().commits())
    return q
}

WOQLLibrary.prototype.commit_history = function(commit_id, count) {
    let q = new WOQLQuery().and(
        new WOQLQuery().lib().history_ids(commit_id, count),
        new WOQLQuery().lib().commits(),
    )
    return q
}

WOQLLibrary.prototype.previous_commits = function(commit_id, count) {
    let q = new WOQLQuery().and(
        new WOQLQuery().lib().previous_commit_ids(commit_id, count),
        new WOQLQuery().lib().commits(),
    )
    return q
}

/**
 * Retrieves the child commit(s) on a particular branch
 */
WOQLLibrary.prototype.commit_future = function(commit_id, branch, count) {
    let q = new WOQLQuery().and(
        new WOQLQuery().lib().future_ids(commit_id, branch, count),
        new WOQLQuery().lib().commits(),
    )
    return q
}

/**
 * Retrieves the child commit(s) on a particular branch
 */
WOQLLibrary.prototype.commit_timeline = function(commit_id, branch, history_count, future_count) {
    history_count = history_count || 10
    future_count = future_count || history_count
    let q = new WOQLQuery()
        .order_by('v:Time', 'desc')
        .or(
            this.commit_future(commit_id, branch, future_count + 1),
            this.previous_commits(commit_id, history_count),
        )
    return q
}

WOQLLibrary.prototype.next_commits = function(commit_id, branch, count) {
    let q = new WOQLQuery().and(
        new WOQLQuery().lib().next_commit_ids(commit_id, branch, count),
        new WOQLQuery().lib().commits(),
    )
    return q
}

/**
 * Retrieves the child commit(s) on a particular branch
 */

WOQLLibrary.prototype.active_commit_id = function(branch, ts, commit_var) {
    commit_var = commit_var || 'Commit ID'
    ts = ts || Date.now() / 1000
    let [biri, hiri, ciri, cpath, cts, tiri, tts, cid, hts] = this.vars(
        'My Branch IRI',
        'My Head IRI',
        'My Child IRI',
        'Commit Path',
        'My Child Timestamp',
        'My Tail IRI',
        'My Tail Timestamp',
        commit_var,
        'My Head TS',
    )
    let q = new WOQLQuery()
        //.using('_commits')
        .limit(1)
        .select(cid)
        .triple(biri, '@schema:name', {'@type': 'xsd:string', '@value': branch})
        .triple(biri, '@schema:head', hiri)
        .or(
            new WOQLQuery()
                .triple(hiri, '@schema:timestamp', hts)
                .triple(hiri, '@schema:identifier', cid)
                .not()
                .greater(hts, ts),
            new WOQLQuery()
                .or(
                    new WOQLQuery()
                        .path(hiri, '@schema:parent+', ciri, cpath)
                        .triple(ciri, '@schema:parent', tiri),
                    new WOQLQuery().triple(ciri, '@schema:parent', tiri),
                )
                .triple(ciri, '@schema:timestamp', cts)
                .triple(tiri, '@schema:timestamp', tts)
                .triple(tiri, '@schema:identifier', cid)
                .greater(cts, ts)
                .not()
                .greater(tts, ts),
        )
    return q
}

//includes passed commit id in list
WOQLLibrary.prototype.history_ids = function(commit_id, count, commit_var) {
    commit_var = commit_var || 'Commit ID'
    let [commit_iri, cpath, tail_iri, cid] = this.vars(
        'My Head IRI',
        'Commit Path',
        'My Tail IRI',
        commit_var,
    )//new WOQLQuery().using('_commits')
    let q = new WOQLQuery().select(cid)
    if (count) q.limit(count)
    q.triple(commit_iri, '@schema:identifier', {'@type': 'xsd:string', '@value': commit_id}).or(
        new WOQLQuery().eq(cid, commit_id),
        new WOQLQuery()
            .path(commit_iri, '@schema:parent+', tail_iri, cpath)
            .triple(tail_iri, '@schema:identifier', cid)
            .not()
            .eq(cid, commit_id),
    )
    return q
}

//includes passed commit id in list
WOQLLibrary.prototype.future_ids = function(commit_id, branch, count, commit_var) {
    //return new WOQLQuery()
    count = count || 10
    commit_var = commit_var || 'Commit ID'
    let [branch_iri, head_iri, commit_iri, branch_path, cpath, tail_iri, cid] = this.vars(
        'My Branch IRI',
        'My Head IRI',
        'My Child IRI',
        'Branch Path',
        'Commit Path',
        'My Tail IRI',
        commit_var,
    )
    let q = new WOQLQuery()
        //.using('_commits')
        .limit(count)
        .select(cid)
        .triple(tail_iri, '@schema:identifier',  {'@type': 'xsd:string', '@value': commit_id})
        .triple(branch_iri, '@schema:name', {'@type': 'xsd:string', '@value': branch})
        .triple(branch_iri, '@schema:head', head_iri)
        .triple(commit_iri, '@schema:identifier', cid)
        .or(
            new WOQLQuery().eq(cid, commit_id),
            new WOQLQuery()
                .path(commit_iri, '@schema:parent+', tail_iri, cpath)
                .or(
                    new WOQLQuery().path(head_iri, '@schema:parent+', commit_iri, branch_path),
                    new WOQLQuery().eq(head_iri, commit_iri),
                )
                .not()
                .eq(cid, commit_id),
        )
    return q
}

WOQLLibrary.prototype.next_commit_ids = function(commit_id, branch, count, commit_var) {
    count = count || 1
    commit_var = commit_var || 'Commit ID'
    let [branch_iri, head_iri, commit_iri, branch_path, cpath, tail_iri, cid] = this.vars(
        'My Branch IRI',
        'My Head IRI',
        'My Child IRI',
        'Branch Path',
        'Commit Path',
        'My Tail IRI',
        commit_var,
    )
    let q = new WOQLQuery()
        //.using('_commits')
        .limit(count)
        .select(cid)
        .triple(tail_iri, '@schema:identifier',  {'@type': 'xsd:string', '@value': commit_id})
        .triple(branch_iri, '@schema:name',  {'@type': 'xsd:string', '@value': branch})
        .triple(branch_iri, '@schema:head', head_iri)
        .triple(commit_iri, '@schema:identifier', cid)
        .path(commit_iri, '@schem:parent+', tail_iri, cpath)
        .or(
            new WOQLQuery().path(head_iri, '@schema:parent+', commit_iri, branch_path),
            new WOQLQuery().eq(head_iri, commit_iri),
        )
    return q
}

/*
let cid = "bi1qqga9sxlzgvv061b3zpe48mmjtbb"

lib().future_ids(cid, "main", 8)
*/

//does not include passed commit id in list
WOQLLibrary.prototype.previous_commit_ids = function(commit_id, count, commit_var) {
    commit_var = commit_var || 'Commit ID'
    count = count || 1
    let [commit_iri, cpath, tail_iri, cid] = this.vars(
        'My Head IRI',
        'Commit Path',
        'My Tail IRI',
        commit_var,
    )
    let q = new WOQLQuery()
       // .using('_commits')
        .select(cid)
        .limit(count)
        .triple(commit_iri, '@schema:identifier', {'@type': 'xsd:string', '@value': commit_id})
        .path(commit_iri, '@schema:parent+', tail_iri, cpath)
        .triple(tail_iri, '@schema:identifier', cid)
    return q
}


WOQLLibrary.prototype._set_user_variables = function(vars) {
    this.user_variables = vars
}

/* returns a variable v:.. string to represent the variable at position index in the list */
WOQLLibrary.prototype._var = function(index) {
    let vname = this.user_variables[index]
        ? this.user_variables[index]
        : this.default_variables[index]
    return 'v:' + vname
}

/** Refer to a variable by the name of the default variable name - returns actual variable name */
WOQLLibrary.prototype._varn = function(default_varname) {
    return this._var(this.default_variables.indexOf(default_varname))
}

WOQLLibrary.prototype._get_varlist = function() {
    let varlist = []
    for (var i = 0; i < this.default_variables.length; i++) {
        if (this.user_variables[i]) varlist.push(this.user_variables[i])
        else varlist.push(this.default_variables[i])
    }
    return varlist
}

WOQLLibrary.prototype._get_meta = function(q) {
    let meta = {
        variables: this._get_varlist(),
        default_variables: this.default_variables,
        query: q.json(),
    }
    if (this.user_variables) meta.user_variables = this.user_variables
    if (this.user_values) meta.user_values = this.user_value
    return meta
}

WOQLLibrary.prototype._docroot = function() {
    return 'system:Document'
}

WOQLLibrary.prototype._add_doctype_constraint = function(pattern, varname) {
    return this._add_constraint(
        pattern,
        new WOQLQuery()
            .sub(this._docroot(), varname)
            .comment('Only matches classes subsumed by system:Document class'),
    )
}

/**
 * Below are experimental unstable - use with care
 */

WOQLLibrary.prototype.add_multiple = function(client, parts, varlist, clause, extra, commit) {
    let p = new WOQLQuery()
    vars = parts.map((item, index) => {
        nvarlist = varlist.map(vitem => {
            return vitem + '_' + index
        })
        p.and(clause(item, nvarlist, extra))
    })
    //console.log("___GET_DB_INFO____",p.prettyPrint())
    return client.query(p, commit).then(results => {
        let res = []
        if (results && results.bindings && results.bindings.length) {
            for (var i = 0; i < results.bindings.length; i++) {
                for (var varname in results.bindings[i]) {
                    if (results.bindings[i][varname]) {
                        let vname = varname.substring(0, varname.lastIndexOf('_'))
                        let pos = varname.substring(varname.lastIndexOf('_') + 1)
                        if (!res[pos]) res[pos] = {}
                        res[pos][vname] = results.bindings[i][varname]
                    }
                }
            }
        }
        return res
    })
}

WOQLLibrary.prototype.asset_overview = function(using, vars, with_size) {
    let q = new WOQLQuery()
    let commits = using + '/local/_commits'
    let meta = using + '/_meta'
    const [
        RemoteIRI,
        remote_url,
        AnyCommit,
        schema,
        prefix,
        prefix_URI,
        PrefixPairIRI,
        prefixes,
        BranchIRI,
        branch,
        BranchHeadIRI,
        branch_head,
        branch_time,
        author,
        message,
        branches,
        FirstCommitIRI,
        NoParent,
        created,
        dbsize,
    ] = vars
    let cs = []
    cs.push(
        new WOQLQuery()
            .opt()
            .limit(1)
            .triple(AnyCommit, 'ref:schema', schema),
    )
    cs.push(
        new WOQLQuery()
            .opt()
            .group_by(prefix, [prefix, prefix_URI], prefixes)
            .triple('ref:default_prefixes', 'ref:prefix_pair', PrefixPairIRI)
            .triple(PrefixPairIRI, 'ref:prefix', prefix)
            .triple(PrefixPairIRI, 'ref:prefix_uri', prefix_URI),
    )
    cs.push(
        new WOQLQuery()
            .opt()
            .group_by(branch, [branch, branch_head, branch_time, author, message], branches)
            .triple(BranchIRI, 'ref:branch_name', branch)
            .triple(BranchIRI, 'ref:ref_commit', BranchHeadIRI)
            .triple(BranchHeadIRI, 'ref:commit_id', branch_head)
            .triple(BranchHeadIRI, 'ref:commit_timestamp', branch_time)
            .triple(BranchHeadIRI, 'ref:commit_author', author)
            .triple(BranchHeadIRI, 'ref:commit_message', message),
    )
    cs.push(
        new WOQLQuery()
            .opt()
            .limit(1)
            .triple(FirstCommitIRI, 'ref:commit_timestamp', created)
            .not()
            .triple(FirstCommitIRI, 'ref:commit_parent', NoParent),
    )
    q.and(
        new WOQLQuery()
            .using(meta)
            .opt()
            .limit(1)
            .triple(RemoteIRI, 'repo:remote_url', remote_url),
        new WOQLQuery().using(commits).and(...cs),
    )
    if (with_size) {
        q.and(new WOQLQuery().using(using).size(using, dbsize))
    }
    return q
}

WOQLLibrary.prototype.assets_overview = function(dbs, client, with_size) {
    let vars = [
        'v:RemoteIRI',
        'v:remote_url',
        'v:AnyCommit',
        'v:schema',
        'v:prefix',
        'v:prefix_URI',
        'v:PrefixPairIRI',
        'v:prefixes',
        'v:BranchIRI',
        'v:branch',
        'v:BranchHeadIRI',
        'v:branch_head',
        'v:branch_time',
        'v:author',
        'v:message',
        'v:branches',
        'v:FirstCommitIRI',
        'v:NoParent',
        'v:created',
        'v:size',
    ]
    return this.add_multiple(client, dbs, vars, this.asset_overview, with_size).then(res => {
        let dbmetas = []
        for (var i = 0; i < dbs.length; i++) {
            let dbmeta = {
                organization: dbs[i].substring(0, dbs[i].lastIndexOf('/')),
                id: dbs[i].substring(dbs[i].lastIndexOf('/') + 1),
            }
            if (dbmeta.organization[0] == '/')
                dbmeta.organization = dbmeta.organization.substring(1)
            let rec = res[i]
            if (rec) {
                formatDBInfo(dbmeta, rec)
            }
            dbmetas.push(dbmeta)
        }

        return dbmetas
    })
}
WOQLLibrary.prototype.assets_overview_result = function(using, dbInfo, client, with_size) {
    const vars = [
        'v:RemoteIRI',
        'v:remote_url',
        'v:AnyCommit',
        'v:schema',
        'v:prefix',
        'v:prefix_URI',
        'v:PrefixPairIRI',
        'v:prefixes',
        'v:BranchIRI',
        'v:branch',
        'v:BranchHeadIRI',
        'v:branch_head',
        'v:branch_time',
        'v:author',
        'v:message',
        'v:branches',
        'v:FirstCommitIRI',
        'v:NoParent',
        'v:created',
        'v:size',
    ]
    const wquery = this.asset_overview(using, vars, with_size)

    return client.query(wquery).then(result => {
        //format the result data
        if (result.bindings && result.bindings.length) {
            return formatDBInfo(dbInfo, result.bindings[0])
        }
    })
}

function formatDBInfo(dbmeta, queryResult) {
    if (queryResult['branches'] && queryResult['branches'] != 'system:unknown') {
        const mbranches = unWindBranches(queryResult['branches'])
        for (var k in mbranches) {
            dbmeta[k] = mbranches[k]
        }
    }
    if (queryResult['created'] && queryResult['created']['@value'])
        dbmeta.created = queryResult['created']['@value']
    if (queryResult['remote_url'] && queryResult['remote_url']['@value'])
        dbmeta.remote_url = queryResult['remote_url']['@value']
    if (queryResult['schema'] && queryResult['schema'] != 'system:unknown') dbmeta.schema = true
    if (queryResult['size'] && queryResult['size']['@value'])
        dbmeta.size = queryResult['size']['@value']
    if (queryResult['prefixes'] && queryResult['prefixes'] != 'system:unknown')
        dbmeta.prefixes = unWindPrefixes(queryResult['prefixes'])
    return dbmeta
}

function unWindPrefixes(prefixes) {
    let prefs = []
    for (var i = 0; i < prefixes.length; i++) {
        prefs.push({prefix: prefixes[i][0]['@value'], url: prefixes[i][1]['@value']})
    }
    return prefs
}

function unWindBranches(branches) {
    let bs = []
    let parts = {
        updated: 0,
    }
    for (var i = 0; i < branches.length; i++) {
        bs.push({
            branch: branches[i][0]['@value'],
            head: branches[i][1]['@value'],
            updated: branches[i][2]['@value'],
        })
        if (branches[i][2]['@value'] > parts.updated) {
            parts.updated = branches[i][2]['@value']
            parts.author = branches[i][3]['@value']
            parts.message = branches[i][4]['@value']
        }
    }
    parts.branches = bs
    return parts
}

WOQLLibrary.prototype.delete_remote = function(meta_resource, name) {
    name = name || 'origin'
    riri = 'terminusdb:///repository/data/Remote_' + name
    return new WOQLQuery()
        .using(meta_resource)
        .into('instance/main')
        .and(
            new WOQLQuery()
                .triple(riri, 'type', 'repo:Remote')
                .triple(riri, 'v:all_props', 'v:all_vals')
                .delete_triple(riri, 'v:all_props', 'v:all_vals'),
        )
}

WOQLLibrary.prototype.add_remote = function(meta_resource, remote_url, name) {
    name = name || 'origin'
    riri = 'terminusdb:///repository/data/Remote_' + name
    return new WOQLQuery()
        .using(meta_resource)
        .into('instance/main')
        .and(
            //new WOQLQuery().idgen("doc:repository/Remote", [name], "v:Remote"),
            new WOQLQuery()
                .add_triple(riri, 'type', 'repo:Remote')
                .add_triple(riri, 'repo:repository_name', name)
                .add_triple(riri, 'repo:remote_url', {'@type': 'xdd:url', '@value': remote_url}),
        )
}

WOQLLibrary.prototype.user_roles = function(values, variables) {
    let base = this.roles(false, variables) //load default variables
    this.default_variables.push('User IRI')
    this.default_variables.push('User ID')
    if (variables) this._set_user_variables(variables)
    let constraint = new WOQLQuery()
        .triple(this._varn('User IRI'), 'system:agent_name', this._varn('User ID'))
        .triple(this._varn('User IRI'), 'system:role', this._varn('Role IRI'))
    return new WOQLQuery().lib().roles(constraint, variables)
}

/**
 * General Pattern 13: users
 */
WOQLLibrary.prototype.users = function(values, variables) {
    this.default_variables = [
        'User ID',
        'Display Name',
        'Commit Log ID',
        'User Notes',
        'Roles',
        'User IRI',
        'Role IRI',
    ]
    if (variables) this._set_user_variables(variables)
    let select_vars = this._get_varlist().slice(0, 6)

    let woql = new WOQLQuery().select(...select_vars).and(
        new WOQLQuery()
            .triple(this._varn('User IRI'), 'type', 'system:User')
            .triple(this._varn('User IRI'), 'system:agent_name', this._varn('User ID'))
            .and(
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery().triple(
                            this._varn('User IRI'),
                            'label',
                            this._varn('Display Name'),
                        ),
                        new WOQLQuery().eq(this._varn('Display Name'), this.empty),
                    ),
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery().triple(
                            this._varn('User IRI'),
                            'system:user_identifier',
                            this._varn('Commit Log ID'),
                        ),
                        new WOQLQuery().eq(this._varn('Commit Log ID'), this.empty),
                    ),
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery().triple(
                            this._varn('User IRI'),
                            'comment',
                            this._varn('User Notes'),
                        ),
                        new WOQLQuery().eq(this._varn('User Notes'), this.empty),
                    ),
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery()
                            .group_by(
                                this._varn('User IRI'),
                                this._varn('Role IRI'),
                                this._varn('Roles'),
                            )
                            .triple(this._varn('User IRI'), 'system:role', this._varn('Role IRI')),
                        new WOQLQuery().eq(this._varn('Roles'), this.empty),
                    ),
            ),
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(this.masterdb_resource, compiled)
}

/**
 * General Pattern 14: organizations
 */
WOQLLibrary.prototype.organizations = function(values, variables) {
    this.default_variables = [
        'Organization ID',
        'Display Name',
        'Notes',
        'Databases',
        'Children',
        'Organization IRI',
        'Database IRI',
        'Child IRI',
    ]
    if (variables) this._set_user_variables(variables)
    let select_vars = this._get_varlist().slice(0, 6)
    let woql = new WOQLQuery().select(...select_vars).and(
        new WOQLQuery()
            .triple(this._varn('Organization IRI'), 'type', 'system:Organization')
            .triple(
                this._varn('Organization IRI'),
                'system:resource_name',
                this._varn('Organization ID'),
            )
            .and(
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery().triple(
                            this._varn('Organization IRI'),
                            'label',
                            this._varn('Display Name'),
                        ),
                        new WOQLQuery().eq(this._varn('Display Name'), this.empty),
                    ),
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery().triple(
                            this._varn('Organization IRI'),
                            'comment',
                            this._varn('Notes'),
                        ),
                        new WOQLQuery().eq(this._varn('Notes'), this.empty),
                    ),
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery()
                            .group_by(
                                this._varn('Organization IRI'),
                                this._varn('Database IRI'),
                                this._varn('Databases'),
                            )
                            .triple(
                                this._varn('Organization IRI'),
                                'system:organization_database',
                                this._varn('Database IRI'),
                            ),
                        new WOQLQuery().eq(this._varn('Databases'), this.empty),
                    ),
                new WOQLQuery()
                    .limit(1)
                    .or(
                        new WOQLQuery()
                            .group_by(
                                this._varn('Organization IRI'),
                                this._varn('Child IRI'),
                                this._varn('Children'),
                            )
                            .triple(
                                this._varn('Organization IRI'),
                                'system:organization_child',
                                this._varn('Child IRI'),
                            ),
                        new WOQLQuery().eq(this._varn('Children'), this.empty),
                    ),
            ),
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(this.masterdb_resource, compiled)
}

WOQLLibrary.prototype._add_constraint = function(qpattern, woql) {
    //let amalgamated = new WOQLQuery().and(qpattern, woql)
    let amalgamated = new WOQLQuery().and(woql, qpattern)

    return amalgamated
}

WOQLLibrary.prototype._add_constraints = function(pattern, vals) {
    if (!vals) return pattern
    if (Array.isArray(vals)) {
        let nq = new WOQLQuery()
        for (var i = 0; i < vals.length; i++) {
            if (typeof vals[i] != 'undefined') {
                nq.and(new WOQLQuery().eq(vals[i], this._var(i)))
            }
        }
        return this._add_constraint(pattern, nq)
    } else if (typeof vals == 'object') {
        if (vals.json) return this._add_constraint(pattern, vals)
        let myvars = this._get_varlist()
        let nq = new WOQLQuery()
        for (var k in vals) {
            let ind = myvars.indexOf(k)
            if (ind != -1) {
                nq.and(new WOQLQuery().eq(vals[k], this._var(ind)))
            }
        }
        return this._add_constraint(pattern, nq)
    } else {
        return this._add_constraint(pattern, new WOQLQuery().eq(this._var(0), vals))
    }
}

/**
 * General Pattern 15: roles
 */
WOQLLibrary.prototype.roles = function(values, variables) {
    this.default_variables = [
        'Role Name',
        'Description',
        'Role IRI',
        'Capability IRI',
        'Permissions',
        'Resources',
        'Permission ID',
        'Resource ID',
    ]

    if (variables) this._set_user_variables(variables)
    let select_vars = this._get_varlist().slice(0, 7)

    let woql = new WOQLQuery().and(
        new WOQLQuery().triple(this._varn('Role IRI'), 'type', 'system:Role'),
        new WOQLQuery()
            .limit(1)
            .or(
                new WOQLQuery().triple(this._varn('Role IRI'), 'label', this._varn('Role Name')),
                new WOQLQuery().eq(this._varn('Role Name'), this.empty),
            ),
        new WOQLQuery()
            .limit(1)
            .or(
                new WOQLQuery().triple(
                    this._varn('Role IRI'),
                    'comment',
                    this._varn('Description'),
                ),
                new WOQLQuery().eq(this._varn('Description'), this.empty),
            ),
        new WOQLQuery()
            .triple(this._varn('Role IRI'), 'system:capability', this._varn('Capability IRI'))
            .group_by(
                this._varn('Capability IRI'),
                this._varn('Permission ID'),
                this._varn('Permissions'),
            )
            .triple(this._varn('Capability IRI'), 'system:action', this._varn('Permission ID')),
        new WOQLQuery()
            .triple(this._varn('Role IRI'), 'system:capability', this._varn('Capability IRI'))
            .group_by(
                this._varn('Capability IRI'),
                this._varn('Resource ID'),
                this._varn('Resources'),
            )
            .triple(
                this._varn('Capability IRI'),
                'system:capability_scope',
                this._varn('Resource ID'),
            ),
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(this.masterdb_resource, compiled)
}

WOQLLibrary.prototype.add_role = function(id, label, description) {
    let q = new WOQLQuery().add_triple(id, 'type', 'system:Role')
    if (label) q.add_triple(id, 'label', label)
    if (description) q.add_triple(id, 'comment', description)
    return new WOQLQuery().using(this.masterdb_resource, q)
}

WOQLLibrary.prototype.add_capability = function(accid, permissions, resources, label, description) {
    let q = new WOQLQuery()
    if (!accid) {
        accid = 'v:Capability IRI'
        q.when(new WOQLQuery().idgen('doc:Access', [permissions.concat(resources)], accid))
    }
    q.add_triple(accid, 'type', 'system:Capability')
    for (var i = 0; i < permissions.length; i++) {
        q.add_triple(accid, 'system:action', permissions[i])
    }
    for (var i = 0; i < resources.length; i++) {
        q.add_triple(accid, 'system:capability_scope', resources[i])
    }
    if (label) q.add_triple(accid, 'label', label)
    if (description) q.add_triple(accid, 'comment', description)
    return new WOQLQuery().using(this.masterdb_resource, q)
}

WOQLLibrary.prototype.grant_capability = function(roleiri, capiri) {
    let q = new WOQLQuery().add_triple(roleiri, 'system:capability', capiri)
    return new WOQLQuery().using(this.masterdb_resource, q)
}

WOQLLibrary.prototype.grant_role = function(uiri, roleiri) {
    let q = new WOQLQuery().add_triple(uiri, 'system:role', roleiri)
    return new WOQLQuery().using(this.masterdb_resource, q)
}

WOQLLibrary.prototype.revoke_role = function(uiri, roleiri) {
    let q = new WOQLQuery().delete_triple(uiri, 'system:role', roleiri)
    return new WOQLQuery().using(this.masterdb_resource, q)
}

module.exports = WOQLLibrary
