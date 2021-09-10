## Typedefs

## GraphRef
#### GraphRef : <code>&quot;schema/main&quot;</code> \| <code>&quot;schema/\*&quot;</code> \| <code>&quot;instance/main&quot;</code> \| <code>&quot;instance/\*&quot;</code> \| <code>&quot;inference/main&quot;</code> \| <code>&quot;inference/\*&quot;</code> \| <code>string</code>

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

## ClassObj
#### ClassObj : <code>Object</code>
the class details object

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> | IRI or variable containing IRI of the class to be inserted |
| [label] | <code>string</code> |  |
| [description] | <code>string</code> |  |
| [abstract] | <code>boolean</code> |  |
| [parent] | <code>array</code> \| <code>string</code> | if not parent the new class will be a class ObjectW |
| [{k:string}] | <code>any</code> | properties |


## PropertyObj
#### PropertyObj : <code>Object</code>
an object that describe a property element

**Properties**

| Name | Type | Description |
| --- | --- | --- |
| id | <code>string</code> |  |
| range | <code>string</code> | the type of property (class id or a native type xsd:number etc.. ) |
| [label] | <code>string</code> |  |
| [description] | <code>string</code> |  |
| domain | <code>string</code> | the ID of the class to which the property belongs |
| [max] | <code>string</code> | the max property's cardinality |
| [min] | <code>string</code> | the min property's cardinality |
| [cardinality] | <code>string</code> | the property cardinality (max and min value) |


## ResourceType
#### ResourceType : <code>&quot;commits&quot;</code> \| <code>&quot;meta&quot;</code> \| <code>&quot;branch&quot;</code> \| <code>&quot;ref&quot;</code> \| <code>&quot;repo&quot;</code> \| <code>&quot;db&quot;</code>

## GraphType
#### GraphType : <code>&quot;inference&quot;</code> \| <code>&quot;schema&quot;</code> \| <code>&quot;instance&quot;</code>

## CredentialObj
#### CredentialObj : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| type | <code>&#x27;basic&#x27;</code> \| <code>&#x27;jwt&#x27;</code> | the authorization type of an TerminusDB connection |
| [user] | <code>string</code> \| <code>boolean</code> | the user id | I don't need the user with the jwt token |
| key | <code>string</code> | the connection key |


## ActionType
#### ActionType : <code>&#x27;graph&#x27;</code> \| <code>&#x27;db&#x27;</code> \| <code>&#x27;clone&#x27;</code> \| <code>&#x27;triples&#x27;</code> \| <code>&#x27;woql&#x27;</code> \| <code>&#x27;frame&#x27;</code> \| <code>&#x27;fetch&#x27;</code> \| <code>&#x27;pull&#x27;</code> \| <code>&#x27;rebase&#x27;</code> \| <code>&#x27;csv&#x27;</code> \| <code>&#x27;branch&#x27;</code> \| <code>&#x27;reset&#x27;</code> \| <code>&#x27;push&#x27;</code> \| <code>&#x27;squash&#x27;</code>

## ParamsObj
#### ParamsObj : <code>Object</code>
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| [key] | <code>string</code> | api key for basic auth |
| [user] | <code>string</code> | basic auth user id |
| [organization] | <code>string</code> | set organization to this id |
| [db] | <code>string</code> | set cursor to this db |
| [repo] | [<code>RepoType</code>](#RepoType) \| <code>string</code> | set cursor to this repo |
| [branch] | <code>string</code> | set branch to this id |
| [ref] | <code>string</code> | set commit ref |
| [jwt] | <code>string</code> | jwt token |
| [jwt_user] | <code>string</code> | jwt user id |
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

