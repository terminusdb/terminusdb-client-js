/* eslint-disable prettier/prettier */
const WOQLQuery = require('./woqlCore')
const WOQL = require('../woql')

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
    this.masterdb_resource = "_system"
    this.masterdb_doc = "terminus://terminus/data"
    this.empty = ""
}

/**
 * Patterns to help getting the most useful information from schema graphs
 *
 * General Patten 1: Classes
 */

WOQLLibrary.prototype.classes = function(values, variables, schema_resource) {
    let g = schema_resource || this.default_schema_resource
    this.default_variables = [
        'Class ID',
        'Class Name',
        'Description',
        'Parents',
        'Children',
        'Abstract',
        'Parent',
        'Child',
    ]
    if (variables) this._set_user_variables(variables)
    let select_vars = this._get_varlist().slice(0, 6)
    let qpattern = new WOQLQuery().select(...select_vars).and(
            new WOQLQuery().quad(this._varn('Class ID'), 'type', "owl:Class", g),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().quad(this._varn('Class ID'), 'comment', this._varn('Description'), g),
                new WOQLQuery().eq(this._varn('Description'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().quad(this._varn('Class ID'), 'label', this._varn('Class Name'), g),
                new WOQLQuery().eq(this._varn('Class Name'), "")
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().quad(this._varn('Class ID'), 'system:tag', "system:abstract", g).eq(this._varn("Abstract"), "Yes"),
                new WOQLQuery().eq(this._varn("Abstract"), "No")
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().group_by(this._varn('Class ID'), this._varn("Parent"), this._varn("Parents"))
                .and(
                    new WOQLQuery().quad(this._varn('Class ID'), 'subClassOf', this._varn("Parent"), g),
                    new WOQLQuery().or(
                        new WOQLQuery().eq(this._varn("Parent"), this._docroot()),
                        new WOQLQuery().quad(this._varn("Parent"), 'type', 'owl:Class', g),
                    )
                ),
                new WOQLQuery().eq(this._varn("Parents"), "")
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().group_by(this._varn('Class ID'), this._varn("Child"), this._varn("Children"))
                .and(
                    new WOQLQuery().quad(this._varn("Child"), 'subClassOf', this._varn('Class ID'), g),
                    new WOQLQuery().quad(this._varn("Child"), 'type', 'owl:Class', g)
                ),
                new WOQLQuery().eq(this._varn("Children"), "")
            ),
        )
    return this._add_constraints(qpattern, values)
}

/**
 * General Pattern 2: Properties
 */
WOQLLibrary.prototype.properties = function(values, variables, schema_resource) {
    let g = schema_resource || this.default_schema_resource
    this.default_variables = [
        'Property ID',
        'Property Name',
        'Property Domain',
        'Property Type',
        'Property Range',
        'Property Description',
        'OWL Type',
    ]
    if (variables) this._set_user_variables(variables)
    let select_vars = this._get_varlist().slice(0, 5)
    let qpattern = new WOQLQuery().select(...select_vars).and(
        new WOQLQuery().quad(this._varn('Property ID'), 'type', this._varn('OWL Type'), g)
            .quad(this._varn('Property ID'), 'domain', this._varn("Property Domain"), g)
            .quad(this._varn('Property ID'), 'range', this._varn("Property Range"), g),
        new WOQLQuery().limit(1).or(
            new WOQLQuery()
                .eq(this._varn('OWL Type'), 'owl:DatatypeProperty')
                .eq(this._varn('Property Type'), 'Data'),
            new WOQLQuery()
                .eq(this._varn('OWL Type'), 'owl:ObjectProperty')
                .eq(this._varn('Property Type'), 'Object'),
        ),
        new WOQLQuery().limit(1).or(
            new WOQLQuery().quad(this._varn('Property ID'), 'label', this._varn('Property Name'), g),
            new WOQLQuery().eq(this._varn("Property Name"), "")
        ),
        new WOQLQuery().limit(1).or(
            new WOQLQuery().quad(this._varn('Property ID'), 'comment', this._varn('Property Description'), g),
            new WOQLQuery().eq(this._varn("Property Description"), "")
        )
    )
    return this._add_constraints(qpattern, values)
}

/**
 * General Pattern 3: Graphs
 * Retrieves information about the graphs in existence at any commit (and whether the commit is the head of a branch)
 */
WOQLLibrary.prototype.graphs = function(values, variables, cresource) {
    cresource = cresource || this.default_commit_resource
    this.default_variables = [
        'Graph ID',
        'Graph Type',
        'Branch ID',
        'Commit ID',
        'Graph IRI',
        'Branch IRI',
        'Commit IRI'
    ]
    if (variables) this._set_user_variables(variables)
    let woql = new WOQLQuery().and(
        new WOQLQuery().triple(this._varn('Graph IRI'), 'ref:graph_name', this._varn('Graph ID')),
        new WOQLQuery().or(
            new WOQLQuery()
                .triple(this._varn('Commit IRI'), 'ref:instance', this._varn('Graph IRI'))
                .eq(this._varn('Graph Type'), 'instance'),
            new WOQLQuery()
                .triple(this._varn('Commit IRI'), 'ref:schema', this._varn('Graph IRI'))
                .eq(this._varn('Graph Type'), 'schema'),
            new WOQLQuery()
                .triple(this._varn('Commit IRI'), 'ref:inference', this._varn('Graph IRI'))
                .eq(this._varn('Graph Type'), 'inference'),
        ),
        new WOQLQuery().triple(this._varn('Commit IRI'), 'ref:commit_id', this._varn('Commit ID')),
        new WOQLQuery().limit(1).or(
            new WOQLQuery()
                .triple(this._varn('Branch IRI'), 'ref:ref_commit', this._varn("Commit IRI"))
                .triple(this._varn('Branch IRI'), 'ref:branch_name', this._varn("Branch ID")),
            new WOQLQuery().eq(this._varn('Branch IRI'), "").eq(this._varn('Branch ID'), "")
        ),
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(cresource, compiled)
}




/**
 * General Pattern 4: Retrieves Branches, Their ID, Head Commit ID, Head Commit Time
 * (if present, new branches have no commits)
 */
WOQLLibrary.prototype.branches = function(values, variables, cresource) {
    cresource = cresource || this.default_commit_resource
    this.default_variables = [
        'Branch ID',
        'Time',
        'Commit ID',
        'Branch IRI',
        'Commit IRI'
    ]
    if (variables) this._set_user_variables(variables)
    let woql = new WOQLQuery()
        .triple(this._varn('Branch IRI'), 'ref:branch_name', this._varn('Branch ID'))
        .opt().triple(this._varn("Branch IRI"), 'ref:ref_commit', this._varn('Commit IRI'))
              .triple(this._varn("Commit IRI"), 'ref:commit_id', this._varn("Commit ID"))
              .triple(this._varn("Commit IRI"), 'ref:commit_timestamp', this._varn("Time"))

    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(cresource, compiled)
}

/**
 * General Pattern 5: Objects - just a list of object ids and their types
 */
WOQLLibrary.prototype.objects = function(values, variables) {
    this.default_variables = ['Object Type', 'Object ID']
    if (variables) this._set_user_variables(variables)
    let qpattern = new WOQLQuery().triple(this._varn("Object ID"), 'type', this._varn("Object Type"))
    return this._add_constraints(qpattern, values)
}

/**
 * General Pattern 6: Full Object Properties
 */
WOQLLibrary.prototype.property_values = function(values, variables) {
    this.default_variables = [
        'Object ID',
        'Property ID',
        'Property Value',
        'Value ID',
        'Value Class',
        'Any Class',
    ]
    if (variables) this._set_user_variables(variables)
    let select_vars = this._get_varlist().slice(0, 5)
    let qpattern = new WOQLQuery().select(...select_vars)
        .or(
            new WOQLQuery()
                .triple(this._varn('Object ID'), this._varn('Property ID'), this._varn('Value ID'))
                .triple(this._varn('Value ID'), 'type', this._varn('Value Class'))
                .read_object(this._varn('Value ID'), this._varn('Property Value'))
                .comment(
                    'If the value of the property has a type, that means it is an object property and we retrieve the full object as the property value',
                ),
            new WOQLQuery()
                .triple(this._varn('Object ID'), this._varn('Property ID'), this._varn('Property Value'))
                .not().triple(this._varn('Property Value'), 'type', this._varn("Any Class"))
                .comment(
                    'If the value of the property has no type, that means it is a datatype property and we retrieve the datatype value as usual',
                )
        )

    return this._add_constraints(qpattern, values)
}

/**
 * General Pattern 7: Object Metadata
 */
WOQLLibrary.prototype.object_metadata = function(values, variables, schema_resource) {
    let g = schema_resource || this.default_schema_resource
    this.default_variables = [
        'Object ID',
        'Name',
        'Description',
        'Type ID',
        'Type Name',
        'Type Description',
    ]
    if (variables) this._set_user_variables(variables)
    let qpattern = new WOQLQuery()
        .triple(this._varn('Object ID'), 'type', this._varn('Type ID'))
        .and(
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('Object ID'), 'label', this._varn('Name')),
                new WOQLQuery().eq(this._varn('Name'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('Object ID'), 'comment', this._varn('Description')),
                new WOQLQuery().eq(this._varn('Description'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().quad(this._varn('Type ID'), 'label', this._varn('Type Name'), g),
                new WOQLQuery().eq(this._varn('Type Name'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().quad(this._varn('Type ID'), 'comment', this._varn('Type Description'), g),
                new WOQLQuery().eq(this._varn('Type Description'), this.empty)
            )
        )
       .comment(
            'Returns an object(s) with its id, name and descriptions, and the object type, type id and type description',
        )
    return this._add_constraints(qpattern, values)
}

/**
 * General Pattern 8: Value Metadata
 */
WOQLLibrary.prototype.property_metadata = function(values, variables, schema_resource) {
    let g = schema_resource || this.default_schema_resource
    this.default_variables = [
        'Object ID',
        'Property ID',
        'Property Name',
        'Property Value',
        'Property Description',
    ]
    if (variables) this._set_user_variables(variables)
    let qpattern = new WOQLQuery()
    .triple(this._varn('Object ID'), this._varn('Property ID'), this._varn('Property Value'))
    .limit(1).or(
        new WOQLQuery().quad(this._varn('Property ID'), 'label', this._varn('Property Name'), g),
        new WOQLQuery().eq(this._varn('Property Name'), this.empty)
    )
    .limit(1).or(
        new WOQLQuery().quad(this._varn('Property ID'), 'comment', this._varn('Property Description'), g),
        new WOQLQuery().eq(this._varn('Property Description'), this.empty)
    )
    .comment(
        'Returns a property and its value and the basic metadata associated with the property (name, id, description)',
    )
    return this._add_constraints(qpattern, values)
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
        .triple(this._varn('Commit IRI'), 'ref:commit_id', this._varn('Commit ID'))
        .triple(this._varn('Commit IRI'), 'ref:commit_timestamp', this._varn('Time'))
        .limit(1).or(
            new WOQLQuery().triple(this._varn('Commit IRI'), 'ref:commit_author', this._varn('Author')),
            new WOQLQuery().eq(this._varn('Author'), this.empty)
        )
        .limit(1).or(
            new WOQLQuery().triple(this._varn('Commit IRI'), 'ref:commit_message', this._varn('Message')),
            new WOQLQuery().eq(this._varn('Message'), this.empty)
        )
        .limit(1).or(
            new WOQLQuery().triple(this._varn('Commit IRI'), 'ref:commit_parent', this._varn('Parent IRI'))
            .triple(this._varn('Parent IRI'), 'ref:commit_id', this._varn('Parent ID')),
            new WOQLQuery().eq(this._varn('Parent IRI'), this.empty).eq(this._varn('Parent ID'), this.empty)
        )
        .limit(1).or(
            new WOQLQuery()
            .select(this._varn('Children'))
            .group_by([this._varn('Commit IRI'), this._varn('Child IRI')], this._varn('Child ID'), this._varn('Children'))
            .triple(this._varn('Child IRI'), 'ref:commit_parent', this._varn('Commit IRI'))
            .triple(this._varn('Child IRI'), 'ref:commit_id', this._varn('Child ID')),
            new WOQLQuery().eq(this._varn('Children'), this.empty)
        )
        .limit(1).or(
            new WOQLQuery()
            .triple(this._varn('Branch IRI'), 'ref:ref_commit', this._varn('Commit IRI'))
            .triple(this._varn('Branch IRI'), 'ref:branch_name', this._varn('Branch ID')),
            new WOQLQuery().eq(this._varn('Branch IRI'), this.empty).eq(this._varn('Branch ID'), this.empty)
        )
    let compiled = this._add_constraints(qpattern, values)
    return new WOQLQuery().using(cresource, compiled)
}

/**
 * General Pattern 10: Commit Chain
 */
WOQLLibrary.prototype.commit_chain = function(values, variables, cresource) {
    cresource = cresource || this.default_commit_resource
    this.default_variables = [
        'Head IRI',
        'Tail IRI',
        'Path'
    ]
    if (variables) this._set_user_variables(variables)
    let woql = new WOQLQuery()
        .path(this._varn('Head IRI'), 'ref:commit_parent+', this._varn('Tail IRI'), this._varn('Path'))
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(cresource, compiled)
}

/**
 * General Pattern 11: Repositories
 */
WOQLLibrary.prototype.repos = function(values, variables, cresource) {
    cresource = cresource || this.default_meta_resource
    this.default_variables = [
        'Repository IRI',
        'Repository Name',
        'Repository Type',
        'Remote URL',
        'Repository Head IRI',
    ]
    if (variables) this._set_user_variables(variables)
    let woql = new WOQLQuery().and(
        new WOQLQuery()
        .triple(this._varn('Repository IRI'), "repo:repository_name", this._varn('Repository Name'))
        .triple(this._varn('Repository IRI'), "type", this._varn('Repository Type')),
        new WOQLQuery().opt().triple(this._varn('Repository IRI'), "repo:repository_head", this._varn('Repository Head IRI')),
        new WOQLQuery().or(
            new WOQLQuery().eq(this._varn('Repository Type'), "repo:Local"),
            new WOQLQuery().eq(this._varn('Repository Type'), "repo:Remote")
            .triple(this._varn('Repository IRI'), "repo:remote_url", this._varn('Remote URL'))
        )
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(cresource, compiled)
}


/**
 * General Pattern 12: dbs
 */
WOQLLibrary.prototype.dbs = function(values, variables) {
     this.default_variables = [
        'DB Name',
        'DB ID',
        'Organization',
        'Resource Name',
        'Description',
        'Allow Origin',
        'DB IRI'
    ]
    if (variables) this._set_user_variables(variables)
    let woql = new WOQLQuery().and(
        new WOQLQuery()
        .triple(this._varn('DB IRI'), "type", "system:Database")
        .triple(this._varn('DB IRI'), "system:resource_name", this._varn('Resource Name'))
        .triple(this._varn('DB IRI'), "system:allow_origin", this._varn('Allow Origin'))
        //.split(this._varn('Resource Name'), "\\|", [this._varn('Account'), this._varn('DB ID')])
        .and(
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('DB IRI'), "label", this._varn('DB Name')),
                new WOQLQuery().eq(this._varn('DB Name'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('DB IRI'), "comment", this._varn('Description')),
                new WOQLQuery().eq(this._varn('Description'), this.empty)
            )
        )
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(this.masterdb_resource, compiled)
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
       .triple(this._varn('User IRI'), "type", "system:User")
       .triple(this._varn('User IRI'), "system:agent_name", this._varn('User ID'))
       .and(
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('User IRI'), "label", this._varn('Display Name')),
                new WOQLQuery().eq(this._varn('Display Name'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('User IRI'), "system:user_identifier", this._varn('Commit Log ID')),
                new WOQLQuery().eq(this._varn('Commit Log ID'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('User IRI'), "comment", this._varn('User Notes')),
                new WOQLQuery().eq(this._varn('User Notes'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery()
                .group_by(this._varn('User IRI'), this._varn('Role IRI'), this._varn('Roles'))
                .triple(this._varn('User IRI'), 'system:role', this._varn('Role IRI')),
                new WOQLQuery().eq(this._varn('Roles'), this.empty)
            )
       )
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
       .triple(this._varn('Organization IRI'), "type", "system:Organization")
       .triple(this._varn('Organization IRI'), "system:resource_name", this._varn('Organization ID'))
       .and(
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('Organization IRI'), "label", this._varn('Display Name')),
                new WOQLQuery().eq(this._varn('Display Name'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery().triple(this._varn('Organization IRI'), "comment", this._varn('Notes')),
                new WOQLQuery().eq(this._varn('Notes'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery()
                .group_by(this._varn('Organization IRI'), this._varn('Database IRI'), this._varn('Databases'))
                .triple(this._varn('Organization IRI'), 'system:organization_database', this._varn('Database IRI')),
                new WOQLQuery().eq(this._varn('Databases'), this.empty)
            ),
            new WOQLQuery().limit(1).or(
                new WOQLQuery()
                .group_by(this._varn('Organization IRI'), this._varn('Child IRI'), this._varn('Children'))
                .triple(this._varn('Organization IRI'), 'system:organization_child', this._varn('Child IRI')),
                new WOQLQuery().eq(this._varn('Children'), this.empty)
           )
       )
   )
   let compiled = this._add_constraints(woql, values)
   return new WOQLQuery().using(this.masterdb_resource, compiled)
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
       'Resource ID'
    ]

   if (variables) this._set_user_variables(variables)
   let select_vars = this._get_varlist().slice(0, 7)

   let woql = new WOQLQuery().and(
        new WOQLQuery()
        .triple(this._varn('Role IRI'), "type", "system:Role"),
        new WOQLQuery().limit(1).or(
            new WOQLQuery().triple(this._varn('Role IRI'), "label", this._varn('Role Name')),
            new WOQLQuery().eq(this._varn('Role Name'), this.empty)
        ),
        new WOQLQuery().limit(1).or(
            new WOQLQuery().triple(this._varn('Role IRI'), "comment", this._varn('Description')),
            new WOQLQuery().eq(this._varn('Description'), this.empty)
        ),
        new WOQLQuery().triple(this._varn('Role IRI'), "system:capability", this._varn('Capability IRI'))
            .group_by(this._varn('Capability IRI'), this._varn('Permission ID'), this._varn('Permissions'))
            .triple(this._varn('Capability IRI'), 'system:action', this._varn('Permission ID')),
        new WOQLQuery().triple(this._varn('Role IRI'), "system:capability", this._varn('Capability IRI'))
            .group_by(this._varn('Capability IRI'), this._varn('Resource ID'), this._varn('Resources'))
            .triple(this._varn('Capability IRI'), 'system:capability_scope', this._varn('Resource ID'))
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(this.masterdb_resource, compiled)
}

WOQLLibrary.prototype.add_role = function(id, label, description) {
    let q = new WOQLQuery().add_triple(id, 'type', "system:Role")
    if(label) q.add_triple(id, 'label', label)
    if(description) q.add_triple(id, 'comment', description)
    return new WOQLQuery().using(this.masterdb_resource, q)
}

WOQLLibrary.prototype.add_capability = function(accid, permissions, resources, label, description) {
    let q = new WOQLQuery()
    if(!accid){
        accid = "v:Capability IRI"
        q.when( new WOQLQuery().idgen("doc:Access", [permissions.concat(resources)], accid))
    }
    q.add_triple(accid, "type", "system:Capability")
    for(var i = 0; i<permissions.length; i++){
        q.add_triple(accid, "system:action", permissions[i])
    }
    for(var i = 0; i<resources.length; i++){
        q.add_triple(accid, "system:capability_scope", resources[i])
    }
    if(label) q.add_triple(accid, "label", label)
    if(description) q.add_triple(accid, "comment", description)
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

WOQLLibrary.prototype.prefixes = function(values, variables, cresource) {
    cresource = cresource || this.default_commit_resource
    this.default_variables = ['Prefix', 'URI', 'Prefix Pair IRI']
    if (variables) this._set_user_variables(variables)
    let q = new WOQLQuery()
        .triple('ref:default_prefixes', 'ref:prefix_pair', this._varn('Prefix Pair IRI'))
        .triple(this._varn('Prefix Pair IRI'), 'ref:prefix_uri', this._varn('URI'))
        .triple(this._varn('Prefix Pair IRI'), 'ref:prefix',  this._varn('Prefix'))
    let woql = this._add_constraints(q, values)
    return new WOQLQuery().using(cresource, woql)
}

WOQLLibrary.prototype.insert_prefix = function(values, variables, cresource) {
    cresource = cresource || this.default_commit_resource
    this.default_variables = ['Prefix Pair IRI']
    if (variables) this._set_user_variables(variables)
    let q = TerminusClient.WOQL.using(cresource)
        .idgen('doc:PrefixPair', values, this._varn('Prefix Pair IRI'))
        .add_triple('ref:default_prefixes', 'ref:prefix_pair', this._varn('Prefix Pair IRI'))
        .insert(this._varn('Prefix Pair IRI'), 'ref:PrefixPair')
        .property('ref:prefix', values[0])
        .property('ref:prefix_uri', values[1])
    return q
}



/**
 * Below are mostly just simple wrappers around the patterns above
 */

/**
 * Constrained Patterns
 */
WOQLLibrary.prototype.document_classes = function(values, variables, graph_resource) {
    let pattern = this.classes(values, variables, graph_resource)
    return this._add_doctype_constraint(pattern, this._varn('Class ID'))
}

WOQLLibrary.prototype.user_roles = function(values, variables) {
    let base = this.roles(false, variables)//load default variables
    this.default_variables.push('User IRI')
    this.default_variables.push('User ID')
    if (variables) this._set_user_variables(variables)
    let constraint = new WOQLQuery()
    .triple(this._varn('User IRI'), 'system:agent_name', this._varn('User ID'))
    .triple(this._varn('User IRI'), 'system:role', this._varn('Role IRI'))
    return new WOQLQuery().lib().roles(constraint, variables)
}


WOQLLibrary.prototype.commit_chain_full = function(values, graph_resource) {
    cresource = graph_resource || this.default_commit_resource
    let woql = new WOQLQuery().or(
        new WOQLQuery().and(
            new WOQLQuery().lib().commit_chain(undefined, ['Commit IRI']),
            new WOQLQuery().lib().commits()
        ),
        new WOQLQuery().and(
            new WOQLQuery().lib().commit_chain(undefined, ['Head IRI', 'Commit IRI']),
            new WOQLQuery().lib().commits()
        )
    )
    let compiled = this._add_constraints(woql, values)
    return new WOQLQuery().using(cresource, compiled)
}


WOQLLibrary.prototype.concrete_document_classes = function(values, variables, graph_resource) {
    let pattern = this.document_classes(values, variables, graph_resource)
    let g = graph_resource || this.default_schema_resource
    return this._add_constraint(
        pattern,
        new WOQLQuery().not()
            .quad(this._varn('Document IRI'), 'system:tag', 'system:abstract', g)
            .comment('Does not match document class(es) marked as abstract'),
    )
}

WOQLLibrary.prototype.document_metadata = function(values, variables, graph_resource) {
    if (!variables) variables = []
    variables[0] = 'Document ID'
    let pattern = this.object_metadata(values, variables, graph_resource)
    return this._add_doctype_constraint(pattern, this._varn('Type ID'))
}

/**
 * Patterns for applying to data / documents
 */

WOQLLibrary.prototype.documents = function(values, variables) {
    if (!variables) variables = ['Document Type', 'Document ID']
    let pattern = this.objects(values, variables)
    return this._add_constraints(pattern, values)
}

/**
 * Finds the id of the very first commit in a database's history
 *
 * This is useful for finding information about when, by who and why the database was created
 * The first commit is the only commit in the database that does not have a parent commit
 * Therefore this query will not change performance markedly with the size of the database - it does not have to traverse any commit chain
 */
WOQLLibrary.prototype.first_commit = function() {
    let pattern = this.commits()
    let noparent = new WOQLQuery().using("_commits").and(
        new WOQLQuery().triple(this._varn( 'Any Commit IRI' ), "ref:commit_id", this._varn( 'Commit ID' )),
        new WOQLQuery().not().triple(this._varn( 'Any Commit IRI' ), "ref:commit_parent", this._varn( 'Parent IRI' )),
    )
    return this._add_constraint(pattern, noparent)
}

WOQLLibrary.prototype.add_remote = function(meta_resource, remote_url, name){
    name = name || 'origin'
    riri = "terminusdb:///repository/data/Remote_" + name
    return new WOQLQuery().using(meta_resource).into("instance/main").and(
        //new WOQLQuery().idgen("doc:repository/Remote", [name], "v:Remote"),
        new WOQLQuery().add_triple(riri, "type", "repo:Remote")
            .add_triple(riri, "repo:repository_name", name)
            .add_triple(riri, "repo:remote_url", {"@type": "xdd:url", "@value": remote_url})
    )
}

/**
 * Internal Functions
 */


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

WOQLLibrary.prototype._add_constraint = function(qpattern, woql) {
    //let amalgamated = new WOQLQuery().and(qpattern, woql)
    let amalgamated = new WOQLQuery().and(woql, qpattern)

    return amalgamated
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
 * This needs to be tested and improved
 *
 * Assumes that classes have the first character capitaised:
 *  e.g. MyClass
 * generates a box around it called Scoped[ClassName]
 * e.g. ScopedMyClass
 * And a property that links them called className (i.e. with lowercase start)
 * e.g. myClass
 *
 * creating a structure ScopedMyClass -> myClass -> MyClass
 *
 * @param {string} prefix - the url prefix that will be used for the boxed types (default scm:)
 * @param {Array} classes - the classes to box - these classes and all their subclasses will have special boxed classes created around them
 * @param {Array} except - the exceptions - these classes and their subclasses will not be boxed, even if they are included in the above array
 * @param {string} graph - the identifier of the graph in which the classes to be boxed live
 *
 */
WOQLLibrary.prototype.boxClasses = function(prefix, classes, except, graph) {
    graph = graph || this.graph
    prefix = prefix || 'scm:'
    var subs = []
    for (var i = 0; i < classes.length; i++) {
        subs.push(new WOQLQuery().sub(classes[i], 'v:Cid'))
    }
    var nsubs = []
    for (var i = 0; i < except.length; i++) {
        nsubs.push(new WOQLQuery().not().sub(except[i], 'v:Cid'))
    }
    //property punning
    //generate a property id that is the same as the classname but starting with a lowercase letter
    let idgens = [
        new WOQLQuery().re('#(.)(.*)', 'v:Cid', ['v:AllB', 'v:FirstB', 'v:RestB']),
        new WOQLQuery().lower('v:FirstB', 'v:Lower'),
        new WOQLQuery().concat(['v:Lower', 'v:RestB'], 'v:Propname'),
        new WOQLQuery().concat(['Scoped', 'v:FirstB', 'v:RestB'], 'v:Cname'),
        new WOQLQuery().idgen(prefix, ['v:Cname'], 'v:ClassID'),
        new WOQLQuery().idgen(prefix, ['v:Propname'], 'v:PropID'),
    ]
    const filter = new WOQLQuery().and(
        new WOQLQuery().quad('v:Cid', 'rdf:type', 'owl:Class', graph),
        new WOQLQuery()
            .not()
            .node('v:Cid')
            .abstract(graph),
        new WOQLQuery().and(...idgens),
        new WOQLQuery().quad('v:Cid', 'label', 'v:Label', graph),
        new WOQLQuery().concat('Box Class generated for class v:Cid', 'v:CDesc', graph),
        new WOQLQuery().concat(
            'Box Property generated to link box v:ClassID to class v:Cid',
            'v:PDesc',
            graph,
        ),
    )
    if (subs.length) {
        if (subs.length == 1) filter.and(subs[0])
        else filter.and(new WOQLQuery().or(...subs))
    }
    if (nsubs.length) {
        filter.and(new WOQLQuery().and(...nsubs))
    }
    let cls = new WOQLSchema(graph)
        .add_class('v:ClassID')
        .label('v:Label')
        .description('v:CDesc')
    let prop = new WOQLSchema(graph)
        .add_property('v:PropID', 'v:Cid')
        .label('v:Label')
        .description('v:PDesc')
        .domain('v:ClassID')
    let nq = new WOQLQuery().when(filter).and(cls, prop)
    return nq.updated()
}

WOQLLibrary.prototype.add_multiple = function(client, parts, varlist, clause, commit){
    let p = new WOQLQuery()
    vars = parts.map((item, index) => {
        nvarlist = varlist.map((vitem) => {
            return vitem + "_" + index
        })
        p.and(clause(item, nvarlist))
    })
    return client.query(p, commit)
    .then((results) => {
        let res = []
        if(results && results.bindings && results.bindings.length){
            for(var i = 0; i<results.bindings.length; i++){
                for(var varname in results.bindings[i]){
                    if(results.bindings[i][varname]){
                        let vname = varname.substring(0, varname.lastIndexOf("_"))                        
                        let pos = varname.substring(varname.lastIndexOf("_") + 1)
                        if(!res[pos]) res[pos] = {}
                        res[pos][vname] = results.bindings[i][varname]
                    }
                } 
            }
        }
        return res
    })
}

WOQLLibrary.prototype.asset_overview = function(using, v){
    let q = new WOQLQuery()
    let commits = using + "/local/_commits"
    let meta = using + "/_meta"

    const [RemoteIRI, remote_url, AnyCommit, schema, prefix, prefix_URI, PrefixPairIRI, prefixes, BranchIRI, 
        branch, BranchHeadIRI, branch_head, branch_time, author, message, branches, FirstCommitIRI, NoParent, created] = v
    let cs = []
    cs.push(new WOQLQuery().opt().limit(1).triple(AnyCommit, 'ref:schema', schema))
    cs.push(new WOQLQuery().opt().group_by(prefix, [prefix, prefix_URI], prefixes)
        .triple('ref:default_prefixes', 'ref:prefix_pair', PrefixPairIRI)
        .triple(PrefixPairIRI, 'ref:prefix', prefix)
        .triple(PrefixPairIRI, 'ref:prefix_uri', prefix_URI)
    )
    cs.push(new WOQLQuery().opt().group_by(branch, [branch, branch_head, branch_time, author, message], branches)
        .triple(BranchIRI, 'ref:branch_name', branch)
        .triple(BranchIRI, 'ref:ref_commit', BranchHeadIRI)
        .triple(BranchHeadIRI, "ref:commit_id", branch_head)
        .triple(BranchHeadIRI, "ref:commit_timestamp", branch_time)
        .triple(BranchHeadIRI, "ref:commit_author", author)
        .triple(BranchHeadIRI, "ref:commit_message", message)
    )
    cs.push(new WOQLQuery().opt().limit(1).triple(FirstCommitIRI, "ref:commit_timestamp", created).not().triple(FirstCommitIRI, 'ref:commit_parent', NoParent))
    q.and(
        new WOQLQuery().using(meta).opt().limit(1).triple(RemoteIRI, "repo:remote_url", remote_url),
        new WOQLQuery().using(commits).and(...cs),
    )
    return q
}

WOQLLibrary.prototype.assets_overview = function(dbs, client){
    let vars = ['v:RemoteIRI', "v:remote_url", "v:AnyCommit", "v:schema", 'v:prefix', 'v:prefix_URI', 'v:PrefixPairIRI', "v:prefixes", 
     'v:BranchIRI', 'v:branch', 'v:BranchHeadIRI', 'v:branch_head', 'v:branch_time', 'v:author', 'v:message', 'v:branches',
      'v:FirstCommitIRI', 'v:NoParent', 'v:created']
    return this.add_multiple(client, dbs, vars, this.asset_overview)
    .then((res) => {
        let dbmetas = []
        for(var i = 0; i<dbs.length; i++){
            let dbmeta = {organization: dbs[i].substring(0, dbs[i].lastIndexOf("/")), id: dbs[i].substring(dbs[i].lastIndexOf("/") + 1)}
            if(dbmeta.organization[0] == "/") dbmeta.organization = dbmeta.organization.substring(1)
            let rec = res[i]
            if(rec){
                if(rec['branches'] && rec['branches'] != "system:unknown") {
                    mbranches = unWindBranches(rec['branches'])
                    for(var k in mbranches){
                        dbmeta[k] = mbranches[k]
                    }
                }
                if(rec['created']&& rec['created']['@value']) dbmeta.created = rec['created']['@value']
                if(rec['remote_url']&& rec['remote_url']['@value']) dbmeta.remote_url = rec['remote_url']['@value']
                if(rec['schema']&& rec['schema'] != "system:unknown") dbmeta.schema = true
                if(rec['size']&& rec['size']['@value']) dbmeta.size = rec['size']['@value']
                if(rec['prefixes']&& rec['prefixes'] != "system:unknown") dbmeta.prefixes = unWindPrefixes(rec['prefixes'])
            }
            dbmetas.push(dbmeta)
        }
        return dbmetas
    })
}

function unWindPrefixes(prefixes){
    let prefs = []
    for(var i = 0; i<prefixes.length; i++){
        prefs.push({prefix: prefixes[i][0]['@value'], url: prefixes[i][1]['@value']})
    }
    return prefs
}

function unWindBranches(branches){
    let bs = []
    let parts = {
        updated: 0
    }
    for(var i = 0; i<branches.length; i++){
        bs.push({branch: branches[i][0]['@value'], head: branches[i][1]['@value'], updated:  branches[i][2]['@value']})
        if(branches[i][2]['@value'] > parts.updated){
            parts.updated = branches[i][2]['@value']
            parts.author = branches[i][3]['@value']
            parts.message = branches[i][4]['@value']
        }
    }
    parts.branches = bs 
    return parts
}


WOQLLibrary.prototype.getNextCommitOnBranch = function(commit_id, branch) {
    let constraint = new WOQLQuery().eq('v:Branch ID', branch).eq('v:Parent ID', commit_id)
    return new WOQLQuery().lib().commits(constraint)
}

/**
 * Returns the ID of the commit that was active on a given branch at a particular unix timestamp
 */
WOQLLibrary.prototype.getActiveCommitAtTime = function(branch, ts) {
    let constraint = new WOQLQuery().eq('v:Branch ID', branch)
    let vars = ['A', 'Head IRI', 'Head Time', 'D', 'E', 'F', 'G', 'H', 'Branch ID']
    let head = new WOQLQuery().lib().commits(constraint, vars)
    let head_deets = new WOQLQuery().limit(1).and(head, new WOQLQuery().lib().commit_chain())
    let bottom = new WOQLQuery().less(ts, 'v:Bottom Time')
    let tail = new WOQLQuery().using('_commits')
        .limit(1)
        .and(
            new WOQLQuery().path('v:Head IRI', 'ref:commit_parent+', 'v:Bottom IRI', 'v:Paths'),
            new WOQLQuery().lib().commits(false, [
                'AA',
                'BB',
                'Bottom Time',
                'DD',
                'EE',
                'FF',
                'GG',
                'HH',
                'JJ',
            ]),
            bottom,
            new WOQLQuery().triple('v:BB', 'ref:commit_parent', 'v:Actual Tail'),
            new WOQLQuery().triple('v:Actual Tail', 'ref:commit_timestamp', 'v:Actual Tail Time'),
            new WOQLQuery().triple('v:Actual Tail', 'ref:commit_id', 'v:Commit ID'),
            new WOQLQuery().not().less(ts, 'v:Actual Tail Time'),
        )

    let top = new WOQLQuery().not().less(ts, 'v:Head Time')

    return new WOQLQuery().select('v:Commit ID').and(
        head_deets,
        new WOQLQuery().or(new WOQLQuery().and(top, new WOQLQuery().eq('v:Commit ID', 'v:Head ID')), tail),
    )
}

module.exports = WOQLLibrary
