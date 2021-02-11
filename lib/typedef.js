//typedef
/**
 * @typedef {"schema/main" | "schema/*" | "instance/main" | "instance/*" | "inference/main" | "inference/*" | string} GraphRef
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
 * @typedef {Object} ClassObj - the class details object
 * @property {string} id - IRI or variable containing IRI of the class to be inserted
 * @property {string} [label]
 * @property {string} [description]
 * @property {boolean} [abstract]
 * @property {array|string} [parent] -if not parent the new class will be a class ObjectW
 * @property {any} [{k:string}] - properties
 */

/**
 * @typedef {Object} PropertyObj - an object that describe a property element
 * @property {string} id
 * @property {string} range - the type of property (class id or a native type xsd:number etc.. )
 * @property {string} [label]
 * @property {string} [description]
 * @property {string} domain - the ID of the class to which the property belongs
 * @property {string} [max] - the max property's cardinality
 * @property {string} [min] - the min property's cardinality
 * @property {string} [cardinality] - the property cardinality (max and min value)
 */

/**
 * @typedef {"commits"|"meta"|"branch"|"ref"|"repo"|"db"} ResourceType
 */

/**
 *@typedef {"inference" | "schema" | "instance"} GraphType
 */

/**
 * @typedef {Object} CredentialObj
 * @property {'basic'|'jwt'} type -  the authorization type of an TerminusDB connection
 * @property {string | boolean} [user] - the user id | I don't need the user with the jwt token
 * @property {string} key -  the connection key
 */

/**
 * @typedef {'graph'|'db'|'clone'|'triples'|'woql'|'frame'|'fetch'|'pull'|'rebase'|'csv'|'branch'|'reset'|'push'|'squash'} ActionType
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
 * @property {string} [jwt] - jwt token
 * @property {string} [jwt_user] - jwt user id
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
