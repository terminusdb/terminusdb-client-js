//typedef
/**
 *@typedef {Object} DocParamsGet - the GET document interface query parameters 
 *@property {GraphType} [graph_type] - instance|schema, default value is instance. Used to switch between getting documents from the instance or the schema graph.
 *@property {string} [type]	- only documents of the given type are returned.
 *@property {string} [id] -	only the document with the given ID is returned.
 *@property {boolean} [prefixed] - default is true, return IRIs using a prefixed notation wherever possible. If false, full IRIs are used.
 *@property {boolean} [minimized] -  default is false, return the documents with very little whitespace. Each json document will be on its own line.
 *@property {boolean} [unfold] -  default is false, any subdocuments contained in the returned document are returned too. If false, these are referred to by their ID instead.
 *@property {number} [skip] -  default is 0, How many results to skip
 *@property {number} [count] count	 - How many results to return. If this option is absent, all results are returned.
 *@property {boolean} [as_list]  default is false, If true, don't return a stream of json objects, but a json list.
 *@property {string} [graph_type] - instance|schema default value is instance
 */

 /**
 *@typedef {Object} DocParamsPost - the POST document interface query parameters
 *@property {GraphType} [graph_type] - default is instance  instance|schema Used to switch between getting documents from the instance or the schema graph.
 *@property {boolean} [full_replace] - default is false, If true, all existing documents are deleted before inserting the posted documents. This allows the full replacement of the contents of a database. This is especially useful for replacing the schema.
 */

 /**
 *@typedef {Object} DocParamsPut - the PUT document interface query parameters
 *@property {GraphType} [graph_type] - default is instance, instance|schema Used to switch between getting documents from the instance or the schema graph.
 */

 /**
 *@typedef {Object} DocParamsDelete - the DELETE document interface query parameters
 *@property {GraphType} [graph_type] - default is instance, instance|schema Used to switch between getting documents from the instance or the schema graph.
 *@property {string|array} id	- a single id or a list of ids to delete.
 *@property {booleam} [nuke]	- default is false, If true, delete everything at this resource location (dangerous!).
 */

 
/**
 * @typedef {"schema/main" | "instance/main" | string} GraphRef
 */
/**
 * @typedef {Object} DataFormatObj (export/import)
 * @property {"csv"|"turtle"} [type] the format type
 * @property {string} [format_header] header format type
 */

/**
 * @typedef {"add_quad" | "delete_quad" | "add_triple" | "delete_triple" | "quad" | "triple"} FuntionType
 */

/**
 * @typedef {"commits"|"meta"|"branch"|"ref"|"repo"|"db"} ResourceType
 */

/**
 *@typedef {"instance" | "schema" } GraphType
 */

 
/**
 * @typedef {Object} CredentialObj
 * @property {'basic'|'jwt'} type -  the authorization type of an TerminusDB connection
 * @property {string | boolean} [user] - the user id | I don't need the user with the jwt token
 * @property {string} key -  the connection key
 */

/**
 * @typedef {'graph'|'db'|'clone'|'triples'|'woql'|'fetch'|'pull'|'rebase'|'branch'|'reset'|'push'|'squash'} ActionType
 */

/**
 * @typedef {Object} ParamsObj
 * @property {string} [key] - api key for basic auth
 * @property {string} [user] - basic auth user id
 * @property {string} [organization] - set organization to this id
 * @property {string} [db] - set cursor to this db
 * @property {RepoType | string} [repo] - set cursor to this repo
 * @property {string} [branch] - set branch to this id
 * @property {string} [ref]    - set commit ref
 * @property {string} [default_branch_id] - set the default branch id
 */

/**
 * @typedef {Object} RolesObj
 * @property {string} agent_name -  the Authorization connection's type
 * @property {string} [database_name] - the user id | I don't need the user with the jwt token
 * @property {string} [organization_name] -  the connection key
 * @property {array} [actions] - list of roles
 * @property {string} [invitation] -
 */

/**
 * @typedef {"local"|"remote"} RepoType
 */
//sharing is a boolean
/**
 * @typedef {Object} DbDetails
 * @property {string} [organization] - the db organization id
 * @property {string} id - The database identification name
 * @property {string} label - "Textual DB Name"
 * @property {string} [comment] - "Text description of DB"
 * @property {boolean} [public]
 * @property {string} [icon] - The database's icon
 * @property {object} [prefixes] - {scm: "http://url.to.use/for/scm", doc: "http://url.to.use/for/doc"}
 * @property {boolean} [schema] - if set to true, a schema graph will be created
 */

/**
 *@typedef {Object} RemoteRepoDetails - {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"}
 *@property {string} [remote] - remote server url
 *@property {string} remote_branch - remote branch name
 *@property {string} [author]   - if it is undefined it get the current author
 *@property  {string} [message] - the update commit message
 *
 */

/**
 * @typedef {Object} CloneSourceDetails
 * @property {string} remote_url - the remote db source url
 * @property {string} [label]
 * @property {string} [comment]
 */

module.exports = {}
