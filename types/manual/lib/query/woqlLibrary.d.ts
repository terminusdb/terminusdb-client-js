export = WOQLLibrary;
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
declare function WOQLLibrary(mode: any): void;
declare class WOQLLibrary {
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
    constructor(mode: any);
    mode: any;
    user_variables: any[];
    user_values: any[];
    default_variables: any[];
    parameters: any[];
    default_schema_resource: string;
    default_commit_resource: string;
    default_meta_resource: string;
    masterdb_resource: string;
    empty: string;
    classesAndChoices(values: any, variables: any, schema_resource: any): any;
    classes(values: any, variables: any, schema_resource: any): any;
    properties(values: any, variables: any, schema_resource: any): any;
    graphs(values: any, variables: any, cresource: any): any;
    branches(values: any, variables: any, cresource: any): any;
    objects(values: any, variables: any): any;
    property_values(values: any, variables: any): any;
    object_metadata(values: any, variables: any, schema_resource: any): any;
    property_metadata(values: any, variables: any, schema_resource: any): any;
    commits(values: any, variables: any, cresource: any): any;
    commit_chain(values: any, variables: any, cresource: any): any;
    repos(values: any, variables: any, cresource: any): any;
    dbs(values: any, variables: any): any;
    prefixes(values: any, variables: any, cresource: any): any;
    insert_prefix(values: any, variables: any, cresource: any): any;
    create_prefix(prefix: any, iri: any, cresource: any): any;
    delete_prefix(prefix: any, cresource: any): any;
    update_prefix(prefix: any, iri: any, cresource: any): any;
    document_classes(values: any, variables: any, graph_resource: any): any;
    commit_chain_full(values: any, graph_resource: any): any;
    concrete_document_classes(values: any, variables: any, graph_resource: any): any;
    document_metadata(values: any, variables: any, graph_resource: any): any;
    documents(values: any, variables: any): any;
    first_commit(): any;
    vars(...varray: any[]): string[];
    active_commit(branch: any, ts: any): any;
    commit_history(commit_id: any, count: any): any;
    previous_commits(commit_id: any, count: any): any;
    commit_future(commit_id: any, branch: any, count: any): any;
    commit_timeline(commit_id: any, branch: any, history_count: any, future_count: any): any;
    next_commits(commit_id: any, branch: any, count: any): any;
    active_commit_id(branch: any, ts: any, commit_var: any): any;
    history_ids(commit_id: any, count: any, commit_var: any): any;
    future_ids(commit_id: any, branch: any, count: any, commit_var: any): any;
    next_commit_ids(commit_id: any, branch: any, count: any, commit_var: any): any;
    previous_commit_ids(commit_id: any, count: any, commit_var: any): any;
    _add_constraints(pattern: any, vals: any): any;
    _add_constraint(qpattern: any, woql: any): any;
    _set_user_variables(vars: any): void;
    _var(index: any): string;
    _varn(default_varname: any): string;
    _get_varlist(): any[];
    _get_meta(q: any): {
        variables: any[];
        default_variables: any[];
        query: any;
    };
    _docroot(): string;
    _add_doctype_constraint(pattern: any, varname: any): any;
    add_multiple(client: any, parts: any, varlist: any, clause: any, extra: any, commit: any): any;
    asset_overview(using: any, v: any, with_size: any): WOQLQuery;
    assets_overview(dbs: any, client: any, with_size: any): any;
    delete_remote(meta_resource: any, name: any): any;
    add_remote(meta_resource: any, remote_url: any, name: any): any;
    user_roles(values: any, variables: any): any;
    users(values: any, variables: any): any;
    organizations(values: any, variables: any): any;
    roles(values: any, variables: any): any;
    add_role(id: any, label: any, description: any): any;
    add_capability(accid: any, permissions: any, resources: any, label: any, description: any): any;
    grant_capability(roleiri: any, capiri: any): any;
    grant_role(uiri: any, roleiri: any): any;
    revoke_role(uiri: any, roleiri: any): any;
}
import WOQLQuery = require("./woqlCore");
