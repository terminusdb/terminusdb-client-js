
# TypeDef
##### TypeDef
Type definitions


## DocParamsGet
##### DocParamsGet:  `  Object`
the GET document interface query parameters

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [query] | <code>object</code> | object that descrive the document query |
| [graph_type] | <code>GraphType</code> | instance|schema, default value is instance. Used to switch between getting documents from the instance or the schema graph. |
| [type] | <code>string</code> | only documents of the given type are returned. |
| [id] | <code>string</code> | only the document with the given ID is returned. |
| [prefixed] | <code>boolean</code> | default is true, return IRIs using a prefixed notation wherever possible. If false, full IRIs are used. |
| [minimized] | <code>boolean</code> | default is false, return the documents with very  little whitespace. Each json document will be on its own line. |
| [unfold] | <code>boolean</code> | default is false, any subdocuments contained in the returned  document are returned too. If false, these are referred to by their ID instead. |
| [skip] | <code>number</code> | default is 0, How many results to skip |
| [count] | <code>number</code> | count - How many results to return. If this option is absent, all  results are returned. |
| [as_list] | <code>boolean</code> | default is false, If true, don't return a stream of json objects,  but a json list. |
| [graph_type] | <code>string</code> | instance|schema default value is instance |


## DocParamsPost
##### DocParamsPost:  `  Object`
the POST document interface query parameters

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [raw_json] | <code>boolean</code> | default is false, If true, the input documents  are treated as raw JSON, inserted as type sys:JSONDocument and are not subject  to schema restrictions. |
| [graph_type] | <code>GraphType</code> | default is instance  instance|schema Used to switch between  getting documents from the instance or the schema graph. |
| [full_replace] | <code>boolean</code> | default is false, If true, all existing documents are deleted  before inserting the posted documents. This allows the full replacement of the contents of a  database. This is especially useful for replacing the schema. |


## DocParamsPut
##### DocParamsPut:  `  Object`
the PUT document interface query parameters

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [raw_json] | <code>boolean</code> | default is false, If true, the input documents  are treated as raw JSON, inserted as type sys:JSONDocument and are not subject  to schema restrictions. |
| [graph_type] | <code>GraphType</code> | default is instance, instance|schema Used to switch between  getting documents from the instance or the schema graph. |


## DocParamsDelete
##### DocParamsDelete:  `  Object`
the DELETE document interface query parameters

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [graph_type] | <code>GraphType</code> | default is instance, instance|schema Used to switch between  getting documents from the instance or the schema graph. |
| id | <code>string</code> \| <code>array</code> | a single id or a list of ids to delete. |
| [nuke] | <code>booleam</code> | default is false, If true, delete everything at this resource  location (dangerous!). |


## GraphRef
##### GraphRef:  `  "schema/main"` |  `  "instance/main" `  |  `  string ` 

## DataFormatObj
##### DataFormatObj:  `  Object`
(export/import)

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [type] | <code>&quot;csv&quot;</code> \| <code>&quot;turtle&quot;</code> | the format type |
| [format_header] | <code>string</code> | header format type |


## FuntionType
##### FuntionType:  `  "add_quad"` |  `  "delete_quad" `  |  `  "add_triple" `  |  `  "delete_triple" `  |  `  "quad" `  |  `  "triple" ` 

## ResourceType
##### ResourceType:  `  "commits"` |  `  "meta" `  |  `  "branch" `  |  `  "ref" `  |  `  "repo" `  |  `  "db" ` 

## GraphType
##### GraphType:  `  "instance"` |  `  "schema" ` 

## CredentialObj
##### CredentialObj:  `  Object`
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>&#x27;basic&#x27;</code> \| <code>&#x27;jwt&#x27;</code> \| <code>&#x27;apikey&#x27;</code> | the authorization type of an TerminusDB connection |
| [user] | <code>string</code> \| <code>boolean</code> | the user id | I don't need the user with the jwt token |
| key | <code>string</code> | the connection key |


## ActionType
##### ActionType:  `  'graph'` |  `  'db' `  |  `  'clone' `  |  `  'triples' `  |  `  'woql' `  |  `  'fetch' `  |  `  'pull' `  |  `  'rebase' `  |  `  'branch' `  |  `  'reset' `  |  `  'push' `  |  `  'squash' ` 

## ParamsObj
##### ParamsObj:  `  Object`
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [key] | <code>string</code> | api key for basic auth |
| [jwt] | <code>string</code> | jwt token to connect with terminusX server |
| [user] | <code>string</code> | the user id, we use this for basic authentication and for identify the commits author |
| [organization] | <code>string</code> | set organization to this id |
| [db] | <code>string</code> | set cursor to this db |
| [repo] | <code>RepoType</code> \| <code>string</code> | set cursor to this repo |
| [branch] | <code>string</code> | set branch to this id |
| [ref] | <code>string</code> | set commit ref |
| [default_branch_id] | <code>string</code> | set the default branch id |
| [token] | <code>string</code> | Api token to connect with TerminusX |


## RolesObj
##### RolesObj:  `  Object`
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| agent_name | <code>string</code> | the Authorization connection's type |
| [database_name] | <code>string</code> | the user id | I don't need the user with the jwt token |
| [organization_name] | <code>string</code> | the connection key |
| [actions] | <code>array</code> | list of roles |
| [invitation] | <code>string</code> | - |


## ScopeType
##### ScopeType:  `  "database"` |  `  "organization" ` 

## RepoType
##### RepoType:  `  "local"` |  `  "remote" ` 

## DbDetails
##### DbDetails:  `  Object`
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| label | <code>string</code> | "Textual DB Name" |
| [comment] | <code>string</code> | "Text description of DB" |
| [public] | <code>boolean</code> | - |
| [schema] | <code>boolean</code> | if set to true, a schema graph will be created |


## DbDoc
##### DbDoc:  `  Object`
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | "Database ID" |
| [label] | <code>string</code> | "Textual DB Name" |
| [comment] | <code>string</code> | "Text description of DB" |
| [organization] | <code>string</code> | "Organization to which the db belongs" |
| [public] | <code>boolean</code> | - |
| [schema] | <code>boolean</code> | if set to true, a schema graph will be created |


## RemoteRepoDetails
##### RemoteRepoDetails:  `  Object`
{remote: "origin", "remote_branch": "main", "author":
 "admin","message": "message"}

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [remote] | <code>string</code> | remote server url |
| remote_branch | <code>string</code> | remote branch name |
| [author] | <code>string</code> | if it is undefined it get the current author |
| [message] | <code>string</code> | the update commit message |


## CloneSourceDetails
##### CloneSourceDetails:  `  Object`
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| remote_url | <code>string</code> | the remote db source url |
| [label] | <code>string</code> |  |
| [comment] | <code>string</code> |  |


## CapabilityCommand
##### CapabilityCommand:  `  "grant"` |  `  "revoke" ` 
the manage capability command type


## RolesActions
##### RolesActions:  `  Array.<ACTIONS>`
[ACTIONS.CREATE_DATABASE | ACTIONS.DELETE_DATABASE]

