/**
 * @module TypeDef
 * @description Type definitions
 * */
/* eslint-disable no-unused-vars */
const Utils = require('./utils');

const { ACTIONS } = Utils.ACTIONS;

/**
 *@typedef {Object} DocParamsGet - the GET document interface query parameters
 *@property {object} [query] - object that descrive the document query
 *@property {GraphType} [graph_type] - instance|schema, default value is instance.
 *Used to switch between getting documents from the instance or the schema graph.
 *@property {string} [type] - only documents of the given type are returned.
 *@property {string} [id] - only the document with the given ID is returned.
 *@property {boolean} [prefixed] - default is true, return IRIs using a prefixed notation wherever
 *possible. If false, full IRIs are used.
 *@property {boolean} [minimized] -  default is false, return the documents with very
 little whitespace. Each json document will be on its own line.
 *@property {boolean} [unfold] -  default is false, any subdocuments contained in the returned
 document are returned too. If false, these are referred to by their ID instead.
 *@property {number} [skip] -  default is 0, How many results to skip
 *@property {number} [count] count - How many results to return. If this option is absent, all
 results are returned.
 *@property {boolean} [as_list]  default is false, If true, don't return a stream of json objects,
 but a json list.
 *@property {string} [graph_type] - instance|schema default value is instance
 */

/**
 *@typedef {Object} DocParamsPost - the POST document interface query parameters
 *@property {boolean} [raw_json] - default is false, If true, the input documents
 are treated as raw JSON, inserted as type sys:JSONDocument and are not subject
 to schema restrictions.
 *@property {GraphType} [graph_type] - default is instance  instance|schema Used to switch between
 getting documents from the instance or the schema graph.
 *@property {boolean} [full_replace] - default is false, If true, all existing documents are deleted
 before inserting the posted documents. This allows the full replacement of the contents of a
 database. This is especially useful for replacing the schema.
 */

/**
 *@typedef {Object} DocParamsPut - the PUT document interface query parameters
 *@property {boolean} [raw_json] - default is false, If true, the input documents
 are treated as raw JSON, inserted as type sys:JSONDocument and are not subject
 to schema restrictions.
 *@property {boolean} [create] - If true, the function will create
 a new document if it doesn't exist.
 *@property {GraphType} [graph_type] - default is instance, instance|schema Used to switch between
 getting documents from the instance or the schema graph.
 */

/**
 *@typedef {Object} DocParamsDelete - the DELETE document interface query parameters
 *@property {GraphType} [graph_type] - default is instance, instance|schema Used to switch between
 getting documents from the instance or the schema graph.
 *@property {string|array} id - a single id or a list of ids to delete.
 *@property {boolean} [nuke] - default is false, If true, delete everything at this resource
 location (dangerous!).
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
 * @typedef {"add_quad" | "delete_quad" | "add_triple" | "delete_triple" | "quad" |
 * "triple"} FuntionType
 */

/**
 * @typedef {"commits"|"meta"|"branch"|"ref"|"repo"|"db"} ResourceType
 */

/**
 *@typedef {"instance" | "schema" } GraphType
 */

/**
 * @typedef {Object} CredentialObj
 * @property {'basic'|'jwt'|'apikey'} type -  the authorization type of an TerminusDB connection
 * @property {string | boolean} [user] - the user id | I don't need the user with the jwt token
 * @property {string} key -  the connection key
 */

/**
 * @typedef {'graph'|'db'|'clone'|'triples'|'woql'|'fetch'|'pull'|'rebase'|'branch'|'reset'|
 * 'push'|'squash'} ActionType
 */

/**
 * @typedef {Object} ParamsObj
 * @property {string} [key] - api key for basic auth
 * @property {string} [jwt] - jwt token to connect with terminusX server
 * @property {string} [user] - the user id, we use this for basic authentication and for
 * identify the commits author
 * @property {string} [organization] - set organization to this id
 * @property {string} [db] - set cursor to this db
 * @property {RepoType | string} [repo] - set cursor to this repo
 * @property {string} [branch] - set branch to this id
 * @property {string} [ref]    - set commit ref
 * @property {string} [default_branch_id] - set the default branch id
 * @property {string} [token] - Api token to connect with TerminusX
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
 * @typedef {"database"|"organization"} ScopeType
 */

/**
 * @typedef {"local"|"remote"} RepoType
 */
// sharing is a boolean
/**
 * @typedef {Object} DbDetails
 * @property {string} label - "Textual DB Name"
 * @property {string} [comment] - "Text description of DB"
 * @property {boolean} [public] -
 * @property {boolean} [schema] - if set to true, a schema graph will be created
 */

/**
 * @typedef {Object} DbDoc
 * @property {string} id - "Database ID"
 * @property {string} [label] - "Textual DB Name"
 * @property {string} [comment] - "Text description of DB"
 * @property {string} [organization] - "Organization to which the db belongs"
 * @property {boolean} [public] -
 * @property {boolean} [schema] - if set to true, a schema graph will be created
 */

/**
 *@typedef {Object} RemoteRepoDetails - {remote: "origin", "remote_branch": "main", "author":
 "admin","message": "message"}
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

/**
* @typedef {"grant" | "revoke"} CapabilityCommand - the manage capability command type
*/

/**
 * @typedef  {ACTIONS[]} RolesActions - [ACTIONS.CREATE_DATABASE | ACTIONS.DELETE_DATABASE]
 */

/**
 * @typedef  {Object} DocHistoryParams
 * @property {number} [start] - Index to start from, 0 is the default
 * @property {number} [count] - Amount of commits to show, 10 is the default
 * @property {boolean} [updated] - Last updated time (excludes history) false is the default
 * @property {boolean} [created] - Created date of object (excludes history) false is the default
 */

/**
 * @typedef  {Object} DiffObject
 * @property {Object} [keep] - Index to start from, 0 is the default
 * @property {number} [count] - Last updated time (excludes history) false is the default
 * @property {number} [start] - Amount of commits to show, 10 is the default
 */

/**
 * @typedef {Object} NamedResourceData - { filename: "data.csv", data: "col1;col2\nval1;val2" }
 * @property {string} filename - Filename referenced in the WOQL query
 * @property {string|Blob} data - Attached data, such as CSV contents
 */

/**
 * @typedef {Object} Frame - Represents a document frame, object frame, or property frame
 * in the viewer system. Frames are used to describe the structure and properties of data
 * being displayed or validated.
 * @property {string} [subject] - Subject identifier
 * @property {string} [property] - Property name
 * @property {string} [type] - Type information (e.g., xsd:string, schema:Person)
 * @property {*} [value] - Frame value
 * @property {number} [depth] - Depth in frame hierarchy
 * @property {string} [range] - Property range/type
 * @property {string} [label] - Display label
 * @property {Object} [parent] - Parent frame reference
 * @property {Array} [children] - Child frames
 * @property {string} [status] - Frame status: 'updated' | 'error' | 'new' | 'ok'
 * @property {boolean} [literal] - Whether this represents a literal value
 * @property {number} [index] - Index in parent collection
 * @property {Object} [frame] - Nested frame data
 * @property {string} [subjectClass] - Class of the subject
 */

module.exports = {};
