## Typedefs
## DocParamsGet
#### DocParamsGet : <code>Object</code>
the GET document interface query parameters

**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [graph_type] | <code>string</code> | <code>&quot;instance&quot;</code> | instance|schema default value is instance. Used to switch between getting documents from the instance or the schema graph. |
| [type] | <code>string</code> |  | only documents of the given type are returned. |
| [id] | <code>string</code> |  | only the document with the given ID is returned. |
| [prefixed] | <code>boolean</code> | <code>true</code> | return IRIs using a prefixed notation wherever possible. If false, full IRIs are used. |
| [minimized] | <code>boolean</code> | <code>false</code> | return the documents with very little whitespace. Each json document will be on its own line. |
| [unfold] | <code>boolean</code> | <code>true</code> | any subdocuments contained in the returned document are returned too. If false, these are referred to by their ID instead. |
| [skip] | <code>number</code> | <code>0</code> | How many results to skip |
| [count] | <code>number</code> |  | count	 - How many results to return. If this option is absent, all results are returned. |
| [as_list] | <code>boolean</code> | <code>false</code> | If true, don't return a stream of json objects, but a json list. |
| [graph_type] | <code>string</code> |  | instance|schema default value is instance |


## DocParamsPost
#### DocParamsPost : <code>Object</code>
the POST document interface query parameters

**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [graph_type] | <code>string</code> | <code>&quot;instance&quot;</code> | instance|schema Used to switch between getting documents from the instance or the schema graph. |
| [full_replace] | <code>boolean</code> | <code>false</code> | If true, all existing documents are deleted before inserting the posted documents. This allows the full replacement of the contents of a database. This is especially useful for replacing the schema. |


## DocParamsPut
#### DocParamsPut : <code>Object</code>
the PUT document interface query parameters

**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [graph_type] | <code>string</code> | <code>&quot;instance&quot;</code> | instance|schema Used to switch between getting documents from the instance or the schema graph. |


## DocParamsDelete
#### DocParamsDelete : <code>Object</code>
the DELETE document interface query parameters

**Properties**

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| [graph_type] | <code>string</code> | <code>&quot;instance&quot;</code> | instance|schema Used to switch between getting documents from the instance or the schema graph. |
| id | <code>string</code> \| <code>array</code> |  | a single id or a list of ids to delete. |
| [nuke] | <code>booleam</code> | <code>false</code> | If true, delete everything at this resource location (dangerous!). |


## GraphRef
#### GraphRef : <code>&quot;schema/main&quot;</code> \| <code>&quot;instance/main&quot;</code> \| <code>string</code>

## DataFormatObj
#### DataFormatObj : <code>Object</code>
(export/import)

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [type] | <code>&quot;csv&quot;</code> \| <code>&quot;turtle&quot;</code> | the format type |
| [format_header] | <code>string</code> | header format type |


## FuntionType
#### FuntionType : <code>&quot;add\_quad&quot;</code> \| <code>&quot;delete\_quad&quot;</code> \| <code>&quot;add\_triple&quot;</code> \| <code>&quot;delete\_triple&quot;</code> \| <code>&quot;quad&quot;</code> \| <code>&quot;triple&quot;</code>

## ResourceType
#### ResourceType : <code>&quot;commits&quot;</code> \| <code>&quot;meta&quot;</code> \| <code>&quot;branch&quot;</code> \| <code>&quot;ref&quot;</code> \| <code>&quot;repo&quot;</code> \| <code>&quot;db&quot;</code>

## GraphType
#### GraphType : <code>&quot;instance&quot;</code> \| <code>&quot;schema&quot;</code>

## CredentialObj
#### CredentialObj : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>&#x27;basic&#x27;</code> \| <code>&#x27;jwt&#x27;</code> | the authorization type of an TerminusDB connection |
| [user] | <code>string</code> \| <code>boolean</code> | the user id | I don't need the user with the jwt token |
| key | <code>string</code> | the connection key |


## ActionType
#### ActionType : <code>&#x27;graph&#x27;</code> \| <code>&#x27;db&#x27;</code> \| <code>&#x27;clone&#x27;</code> \| <code>&#x27;triples&#x27;</code> \| <code>&#x27;woql&#x27;</code> \| <code>&#x27;fetch&#x27;</code> \| <code>&#x27;pull&#x27;</code> \| <code>&#x27;rebase&#x27;</code> \| <code>&#x27;branch&#x27;</code> \| <code>&#x27;reset&#x27;</code> \| <code>&#x27;push&#x27;</code> \| <code>&#x27;squash&#x27;</code>

## ParamsObj
#### ParamsObj : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [key] | <code>string</code> | api key for basic auth |
| [jwt] | <code>string</code> | jwt token to connect with terminusX server |
| [user] | <code>string</code> | the user id, we use this for basic authentication and for identify the commits author |
| [organization] | <code>string</code> | set organization to this id |
| [db] | <code>string</code> | set cursor to this db |
| [repo] | [<code>RepoType</code>](#RepoType) \| <code>string</code> | set cursor to this repo |
| [branch] | <code>string</code> | set branch to this id |
| [ref] | <code>string</code> | set commit ref |
| [default_branch_id] | <code>string</code> | set the default branch id |


## RolesObj
#### RolesObj : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| agent_name | <code>string</code> | the Authorization connection's type |
| [database_name] | <code>string</code> | the user id | I don't need the user with the jwt token |
| [organization_name] | <code>string</code> | the connection key |
| [actions] | <code>array</code> | list of roles |
| [invitation] | <code>string</code> | - |


## RepoType
#### RepoType : <code>&quot;local&quot;</code> \| <code>&quot;remote&quot;</code>

## DbDetails
#### DbDetails : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [organization] | <code>string</code> | the db organization id |
| id | <code>string</code> | The database identification name |
| label | <code>string</code> | "Textual DB Name" |
| [comment] | <code>string</code> | "Text description of DB" |
| [public] | <code>boolean</code> |  |
| [icon] | <code>string</code> | The database's icon |
| [prefixes] | <code>object</code> | {scm: "http://url.to.use/for/scm", doc: "http://url.to.use/for/doc"} |
| [schema] | <code>boolean</code> | if set to true, a schema graph will be created |


## RemoteRepoDetails
#### RemoteRepoDetails : <code>Object</code>
{remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"}

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [remote] | <code>string</code> | remote server url |
| remote_branch | <code>string</code> | remote branch name |
| [author] | <code>string</code> | if it is undefined it get the current author |
| [message] | <code>string</code> | the update commit message |


## CloneSourceDetails
#### CloneSourceDetails : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| remote_url | <code>string</code> | the remote db source url |
| [label] | <code>string</code> |  |
| [comment] | <code>string</code> |  |

