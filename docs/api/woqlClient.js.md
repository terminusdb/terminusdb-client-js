
# WOQLClient
## WOQLClient
**License**: Apache Version 2  

## new WOQLClient(serverUrl, [params])
The core functionality of the TerminusDB javascript client is
defined in the WOQLClient class - in the woqlClient.js file. This class provides
methods which allow you to directly get and set all of the configuration and API
endpoints of the client. The other parts of the WOQL core - connectionConfig.js
and connectionCapabilities.js - are used by the client to store internal state - they
should never have to be accessed directly. For situations where you want to communicate
with a TerminusDB server API, the WOQLClient class is all you will need.


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | <code>string</code> | the terminusdb server url |
| [params] | <code>typedef.ParamsObj</code> | an object with the connection parameters |

**Example**  
```javascript
//to connect with your local terminusDB
const client = new TerminusClient.WOQLClient(SERVER_URL,{user:"admin",key:"myKey"})
async function getSchema() {
     client.db("test")
     client.checkout("dev")
     const schema = await client.getSchema()
}
//The client has an internal state which defines what
//organization / database / repository / branch / ref it is currently attached to

//to connect with your TerminusDB Cloud Instance
const client = new TerminusClient.WOQLClient('SERVER_CLOUD_URL/mycloudTeam',
                     {user:"myemail@something.com", organization:'mycloudTeam'})

client.setApiKey(MY_ACCESS_TOKEN)

//to get the list of all organization's databases
async function callGetDatabases(){
     const dbList = await client.getDatabases()
     console.log(dbList)
}

async function getSchema() {
     client.db("test")
     client.checkout("dev")
     const schema = await client.getSchema()
}
```

## TerminusDB Client API

## Connect
##### ~~woqlClient.connect([params]) ⇒ <code>Promise</code>~~
***Deprecated***

Connect to a Terminus server at the given URI with an API key
Stores the system:ServerCapability document returned
in the connection register which stores, the url, key, capabilities,
and database meta-data for the connected server
this.connectionConfig.server will be used if present,
or the promise will be rejected.

**Returns**: <code>Promise</code> - the connection capabilities response object or an error object  

| Param | Type | Description |
| --- | --- | --- |
| [params] | <code>typedef.ParamsObj</code> | TerminusDB Server connection parameters |

**Example**  
```javascript
client.connect()
```

## Create Database
##### woqlClient.createDatabase(dbId, dbDetails, [orgId]) ⇒ <code>Promise</code>
Creates a new database in TerminusDB server

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| dbId | <code>string</code> | The id of the new database to be created |
| dbDetails | <code>typedef.DbDetails</code> | object containing details about the database to be created |
| [orgId] | <code>string</code> | optional organization id - if absent default local organization id is used |

**Example**  
```javascript
//remember set schema:true if you need to add a schema graph
client.createDatabase("mydb", {label: "My Database", comment: "Testing", schema: true})
```

## Delete Database
##### woqlClient.deleteDatabase(dbId, [orgId], [force]) ⇒ <code>Promise</code>
Deletes a database from a TerminusDB server

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| dbId | <code>string</code> | The id of the database to be deleted |
| [orgId] | <code>string</code> | the id of the organization to which the database belongs (in desktop use, this will always be “admin”) |
| [force] | <code>boolean</code> |  |

**Example**  
```javascript
client.deleteDatabase("mydb")
```

## Get Triples
##### woqlClient.getTriples(graphType) ⇒ <code>Promise</code>
Retrieve the contents of a graph within a TerminusDB as triples, encoded in
the turtle (ttl) format

**Returns**: <code>Promise</code> - A promise that returns the call response object (with
the contents being a string representing a set of triples in turtle (ttl) format),
or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| graphType | <code>typedef.GraphType</code> | type of graph to get triples from, either “instance” or  “schema” |

**Example**  
```javascript
const turtle = await client.getTriples("schema", "alt")
```

## Update Triples
##### woqlClient.updateTriples(graphType, turtle, commitMsg) ⇒ <code>Promise</code>
Replace the contents of the specified graph with the passed triples encoded
in the turtle (ttl) format

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| graphType | <code>string</code> | type of graph  |instance|schema|inference| |
| turtle | <code>string</code> | string encoding triples in turtle (ttl) format |
| commitMsg | <code>string</code> | Textual message describing the reason for the update |

**Example**  
```javascript
client.updateTriples("schema", "alt", turtle_string, "dumping triples to graph alt")
```

## Query
##### woqlClient.query(woql, [commitMsg], [allWitnesses], [lastDataVersion], [getDataVersion]) ⇒ <code>Promise</code>
Executes a WOQL query on the specified database and returns the results

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| woql | <code>WOQLQuery</code> | an instance of the WOQLQuery class |
| [commitMsg] | <code>string</code> | a message describing the reason for the change that will be written into the commit log (only relevant if the query contains an update) |
| [allWitnesses] | <code>boolean</code> |  |
| [lastDataVersion] | <code>string</code> | If passed it will be used for data version tracking |
| [getDataVersion] | <code>string</code> | If true it the function will return object having result and dataVersion |

**Example**  
```javascript
const result = await client.query(WOQL.star())
```

## Clonedb
##### woqlClient.clonedb(cloneSource, newDbId, [orgId]) ⇒ <code>Promise</code>
Clones a remote repo and creates a local copy

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| cloneSource | <code>typedef.CloneSourceDetails</code> | object describing the source branch to be used as a base |
| newDbId | <code>string</code> | id of the new cloned database on the local server |
| [orgId] | <code>string</code> | id of the local organization that the new cloned database will be created in (in desktop mode this is always “admin”) |

**Example**  
```javascript
client.clonedb({remote_url: "https://my.terminusdb.com/myorg/mydb", label "Cloned DB", comment: "Cloned from mydb"}, newid: "mydb")
```

## Branch
##### woqlClient.branch(newBranchId, [isEmpty]) ⇒ <code>Promise</code>
Creates a new branch with a TerminusDB database, starting from the current context of
the client (branch / ref)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| newBranchId | <code>string</code> | local identifier of the new branch the ID of the new branch to be created |
| [isEmpty] | <code>boolean</code> | if isEmpty is true it will create a empty branch. |

**Example**  
```javascript
client.branch("dev")
```

## Rebase
##### woqlClient.rebase(rebaseSource) ⇒ <code>Promise</code>
Merges the passed branch into the current one using the rebase operation

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| rebaseSource | <code>object</code> | json describing the source branch to be used as a base |

**Example**  
```javascript
//from the branch head
client.rebase({rebase_from: "admin/db_name/local/branch/branch_name", message:
"Merging from dev")
//or from a commit id
client.rebase({rebase_from: "admin/db_name/local/commit/9w8hk3y6rb8tjdy961de3i536ntkqd8",
message: "Merging from dev")
```

## Pull
##### woqlClient.pull(remoteSourceRepo) ⇒ <code>Promise</code>
Pull changes from a branch on a remote database to a branch on a local database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| remoteSourceRepo | <code>typedef.RemoteRepoDetails</code> | an object describing the source of the pull |

**Example**  
```javascript
client.pull({remote: "origin", remote_branch: "main", message: "Pulling from remote"})
```

## Push
##### woqlClient.push(remoteTargetRepo) ⇒ <code>Promise</code>
Push changes from a branch on a local database to a branch on a remote database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| remoteTargetRepo | <code>typedef.RemoteRepoDetails</code> | an object describing the target of the push {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"} |

**Example**  
```javascript
client.push({remote: "origin", remote_branch: "main", message: "Pulling from remote"})
```

## Fetch
##### woqlClient.fetch(remoteId) ⇒ <code>Promise</code>
Fetch updates to a remote database to a remote repository with the local database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| remoteId | <code>string</code> | if of the remote to fetch (eg: 'origin') |


## local_auth
##### ~~woqlClient.local\_auth~~
***Deprecated***

Use [#localAuth](#localAuth) instead.


## remote_auth
##### ~~woqlClient.remote\_auth~~
***Deprecated***

Use [#remoteAuth](#remoteAuth) instead.


## setApiKey
##### woqlClient.setApiKey(accessToken)
set the api key to access the cloud resources


| Param | Type |
| --- | --- |
| accessToken | <code>string</code> | 


## customHeaders
##### woqlClient.customHeaders(customHeaders) ⇒ <code>object</code>
add extra headers to your request


| Param | Type |
| --- | --- |
| customHeaders | <code>object</code> | 


## copy
##### woqlClient.copy() ⇒ [<code>WOQLClient</code>](#WOQLClient)
creates a copy of the client with identical internal state and context
useful if we want to change context for a particular API call without changing
the current client context

**Returns**: [<code>WOQLClient</code>](#WOQLClient) - new client object with identical state to original but
which can be manipulated independently  
**Example**  
```javascript
let newClient = client.copy()
```

## server
##### woqlClient.server() ⇒ <code>string</code>
Gets the current connected server url
it can only be set creating a new WOQLCLient instance


## api
##### woqlClient.api() ⇒ <code>string</code>
Retrieve the URL of the server’s API base that we are currently connected to

**Returns**: <code>string</code> - the URL of the TerminusDB server api endpoint we are connected
to (typically server() + “api/”)  
**Example**  
```javascript
let api_url = client.api()
```

## organization
##### woqlClient.organization([orgId]) ⇒ <code>string</code> \| <code>boolean</code>
Gets/Sets the client’s internal organization context value, if you change the organization
name the databases list will be set to empty


| Param | Type | Description |
| --- | --- | --- |
| [orgId] | <code>string</code> \| <code>boolean</code> | the organization id to set the context to |

**Example**  
```javascript
client.organization("admin")
```

## getDatabases
##### woqlClient.getDatabases() ⇒ <code>string</code> \| <code>boolean</code>
Gets the organization's databases list.

If no organization has been set up, the function throws an exception

**Example**  
```javascript
async function callGetDatabases(){
     const dbList = await client.getDatabases()
     console.log(dbList)
}
```

## databases
##### woqlClient.databases([dbList]) ⇒ <code>array</code>
Set/Get the organization's databases list (id, label, comment) that the current
user has access to on the server.

**Returns**: <code>array</code> - the organization's databases list  

| Param | Type | Description |
| --- | --- | --- |
| [dbList] | <code>array</code> | a list of databases the user has access to on the server, each having: |

**Example**  
```javascript
//to get the list of all organization's databases
async function callGetDatabases(){
     await client.getDatabases()
     console.log(client.databases())
}
```

## user
##### woqlClient.user() ⇒ <code>Object</code>
Gets the current user object as returned by the connect capabilities response
user has fields: [id, name, notes, author]


## userOrganization
##### woqlClient.userOrganization() ⇒ <code>string</code>
**Returns**: <code>string</code> - the user organization name  
**Desription**: Gets the user's organization id  

## databaseInfo
##### woqlClient.databaseInfo([dbId]) ⇒ <code>object</code>
Gets the database's details

**Returns**: <code>object</code> - the database description object //getDatabaseInfo  

| Param | Type | Description |
| --- | --- | --- |
| [dbId] | <code>string</code> | the datbase id |


## db
##### woqlClient.db([dbId]) ⇒ <code>string</code> \| <code>boolean</code>
Sets / Gets the current database

**Returns**: <code>string</code> \| <code>boolean</code> - - the current database or false  

| Param | Type | Description |
| --- | --- | --- |
| [dbId] | <code>string</code> | the database id to set the context to |

**Example**  
```javascript
client.db("mydb")
```

## setSystemDb
##### woqlClient.setSystemDb()
Sets the internal client context to allow it to talk to the server’s internal system database


## repo
##### woqlClient.repo([repoId]) ⇒ <code>string</code>
Gets / Sets the client’s internal repository context value (defaults to ‘local’)

**Returns**: <code>string</code> - the current repository id within the client context  

| Param | Type | Description |
| --- | --- | --- |
| [repoId] | <code>typedef.RepoType</code> \| <code>string</code> | default value is local |

**Example**  
```javascript
client.repo("origin")
```

## checkout
##### woqlClient.checkout([branchId]) ⇒ <code>string</code>
Gets/Sets the client’s internal branch context value (defaults to ‘main’)

**Returns**: <code>string</code> - the current branch id within the client context  

| Param | Type | Description |
| --- | --- | --- |
| [branchId] | <code>string</code> | the branch id to set the context to |


## ref
##### woqlClient.ref([commitId]) ⇒ <code>string</code> \| <code>boolean</code>
Sets / gets the current ref pointer (pointer to a commit within a branch)
Reference ID or Commit ID are unique hashes that are created whenever a new commit is recorded

**Returns**: <code>string</code> \| <code>boolean</code> - the current commit id within the client context  

| Param | Type | Description |
| --- | --- | --- |
| [commitId] | <code>string</code> | the reference ID or commit ID |

**Example**  
```javascript
client.ref("mkz98k2h3j8cqjwi3wxxzuyn7cr6cw7")
```

## localAuth
##### woqlClient.localAuth([newCredential]) ⇒ <code>typedef.CredentialObj</code> \| <code>boolean</code>
Sets/Gets set the database basic connection credential


| Param | Type |
| --- | --- |
| [newCredential] | <code>typedef.CredentialObj</code> | 

**Example**  
```javascript
client.localAuth({user:"admin","key":"mykey","type":"basic"})
```

## remoteAuth
##### woqlClient.remoteAuth([newCredential]) ⇒ <code>typedef.CredentialObj</code> \| <code>boolean</code>
Sets/Gets the jwt token for authentication
we need this to connect 2 terminusdb server to each other for push, pull, clone actions


| Param | Type |
| --- | --- |
| [newCredential] | <code>typedef.CredentialObj</code> | 

**Example**  
```javascript
client.remoteAuth({"key":"dhfmnmjglkrelgkptohkn","type":"jwt"})
```

## author
##### woqlClient.author() ⇒ <code>string</code>
Gets the string that will be written into the commit log for the current user

**Returns**: <code>string</code> - the current user  
**Example**  
```javascript
client.author()
```

## set
##### woqlClient.set(params)

| Param | Type | Description |
| --- | --- | --- |
| params | <code>typedef.ParamsObj</code> | a object with connection params |

**Example**  
```javascript
sets several of the internal state values in a single call
(similar to connect, but only sets internal client state, does not communicate with server)
client.set({key: "mypass", branch: "dev", repo: "origin"})
```

## resource
##### woqlClient.resource(resourceType, [resourceId]) ⇒ <code>string</code>
Generates a resource string for the required context
of the current context for "commits" "meta" "branch" and "ref" special resources

**Returns**: <code>string</code> - a resource string for the desired context  

| Param | Type | Description |
| --- | --- | --- |
| resourceType | <code>typedef.ResourceType</code> | the type of resource string that is required - one of “db”, “meta”, “repo”, “commits”, “branch”, “ref” |
| [resourceId] | <code>string</code> | can be used to specify a specific branch / ref - if not supplied the current context will be used |

**Example**  
```javascript
const branch_resource = client.resource("branch")
```

## insertTriples
##### woqlClient.insertTriples(graphType, turtle, commitMsg) ⇒ <code>Promise</code>
Appends the passed turtle to the contents of a graph

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| graphType | <code>string</code> | type of graph  |instance|schema|inference| |
| turtle | <code>string</code> | is a valid set of triples in turtle format (OWL) |
| commitMsg | <code>string</code> | Textual message describing the reason for the update |


## message
##### woqlClient.message(message, [pathname]) ⇒ <code>Promise</code>
Sends a message to the server

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | textual string |
| [pathname] | <code>string</code> | a server path to send the message to |


## action
##### woqlClient.action(actionName, [payload]) ⇒ <code>Promise</code>
Sends an action to the server

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| actionName | <code>string</code> | structure of the action |
| [payload] | <code>object</code> | a request body call |


## info
##### woqlClient.info() ⇒ <code>Promise</code>
Gets TerminusDB Server Information

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  
**Example**  
```javascript
client.info()
```

## squashBranch
##### woqlClient.squashBranch(branchId, commitMsg) ⇒ <code>Promise</code>
Squash branch commits

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| branchId | <code>string</code> | local identifier of the new branch |
| commitMsg | <code>string</code> | Textual message describing the reason for the update |


## resetBranch
##### woqlClient.resetBranch(branchId, commitId) ⇒ <code>Promise</code>
Reset branch to a commit id, Reference ID or Commit ID are unique hashes that are
created whenever a new commit is recorded

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| branchId | <code>string</code> | local identifier of the new branch |
| commitId | <code>string</code> | Reference ID or Commit ID |


## optimizeBranch
##### woqlClient.optimizeBranch(branchId) ⇒ <code>Promise</code>
Optimize db branch

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| branchId | <code>string</code> | local identifier of the new branch |


## deleteBranch
##### woqlClient.deleteBranch(branchId) ⇒ <code>Promise</code>
Deletes a branch from database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| branchId | <code>string</code> | local identifier of the branch |


## reset
##### woqlClient.reset(commitPath) ⇒ <code>Promise</code>
Reset the current branch HEAD to the specified commit path

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| commitPath | <code>string</code> | The commit path to set the current branch to |


## dispatch
##### woqlClient.dispatch() ⇒ <code>Promise</code>
Common request dispatch function

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | the action name |
| apiUrl | <code>string</code> | the server call endpoint |
| [payload] | <code>object</code> | the post body |
| [getDataVersion] | <code>boolean</code> | If true return response with data version |


## generateCommitInfo
##### woqlClient.generateCommitInfo(msg, [author]) ⇒ <code>object</code>
Generates the json structure for commit messages


| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | textual string describing reason for the change |
| [author] | <code>string</code> | optional author id string - if absent current user id will be used |


## generateCommitDescriptor
##### woqlClient.generateCommitDescriptor(commitId)
Generates the json structure for commit descriptor


| Param | Type | Description |
| --- | --- | --- |
| commitId | <code>string</code> | a valid commit id o |


## prepareRevisionControlArgs
##### woqlClient.prepareRevisionControlArgs([rc_args]) ⇒ <code>object</code> \| <code>boolean</code>
Adds an author string (from the user object returned by connect) to the commit message.


| Param | Type |
| --- | --- |
| [rc_args] | <code>object</code> | 


## updateDatabase
##### woqlClient.updateDatabase(dbDoc) ⇒ <code>Promise</code>
update the database details

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| dbDoc | <code>object</code> | an object that describe the database details |


## addDocument
##### woqlClient.addDocument(json, [params], [dbId], [string], [lastDataVersion], [getDataVersion]) ⇒ <code>Promise</code>
to add a new document or a list of new documents into the instance or the schema graph.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| json | <code>object</code> |  |
| [params] | <code>typedef.DocParamsPost</code> | the post parameters |
| [dbId] | <code>string</code> | the dbid |
| [string] | <code>message</code> | the insert commit message |
| [lastDataVersion] | <code>string</code> | If passed it will be used for data version tracking. |
| [getDataVersion] | <code>string</code> | If true it the function will return object having result and dataVersion. |

**Example**  
```javascript
const json = [{ "@type" : "Class",
             "@id" : "Coordinate",
             "@key" : { '@type' : 'Hash',
             '@fields' : ['x','y'] },
             "x" : "xsd:decimal",
             "y" : "xsd:decimal" },
             { "@type" : "Class",
             "@id" : "Country",
             "@key" : { '@type' : 'Lexical',
                         '@fields' : [name] },
             "name" : "xsd:string",
             "perimeter" : { "@type" : "List",
                             "@class" : "Coordinate" } }]
client.addDocument(json,{"graph_type":"schema"},"mydb","add new schema")
```

## queryDocument
##### woqlClient.queryDocument(query, [params], [dbId], [branch], [lastDataVersion], [getDataVersion]) ⇒ <code>Promise</code>
Retrieves all documents that match a given document template

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| query | <code>object</code> | the query template |
| [params] | <code>typedef.DocParamsGet</code> | the get parameters |
| [dbId] | <code>string</code> | the database id |
| [branch] | <code>string</code> | the database branch |
| [lastDataVersion] | <code>string</code> | If passed it will be used for data version tracking. |
| [getDataVersion] | <code>string</code> | If true it the function will return object having result and dataVersion. |

**Example**  
```javascript
const query = {
  "type": "Person",
  "query": { "age": 42 },
 }
client.queryDocument(query,{"as_list":true})
```

## getDocument
##### woqlClient.getDocument([params], [dbId], [branch], [lastDataVersion], [getDataVersion]) ⇒ <code>Promise</code>
**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [params] | <code>typedef.DocParamsGet</code> | the get parameters |
| [dbId] | <code>string</code> | the database id |
| [branch] | <code>string</code> | the database branch |
| [lastDataVersion] | <code>string</code> | If passed it will be used for data version tracking. |
| [getDataVersion] | <code>string</code> | If true it the function will return object having result and dataVersion. |

**Example**  
```javascript
//return the schema graph as a json array
client.getDocument({"graph_type":"schema","as_list":true})

//retutn the Country class document from the schema graph
client.getDocument({"graph_type":"schema","as_list":true,"id":"Country"})
```

## updateDocument
##### woqlClient.updateDocument(json, [params], [dbId], [message], [lastDataVersion], [getDataVersion]) ⇒ <code>Promise</code>
**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| json | <code>object</code> |  |
| [params] | <code>typedef.DocParamsPut</code> | the Put parameters |
| [dbId] | <code>\*</code> | the database id |
| [message] | <code>\*</code> | the update commit message |
| [lastDataVersion] | <code>string</code> | If passed it will be used for data version tracking. |
| [getDataVersion] | <code>string</code> | If true it the function will return object having result and dataVersion. |


## deleteDocument
##### woqlClient.deleteDocument([params], [dbId], [message], [lastDataVersion], [getDataVersion]) ⇒ <code>Promise</code>
to delete the document

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [params] | <code>typedef.DocParamsDelete</code> |  |
| [dbId] | <code>string</code> | the database id |
| [message] | <code>string</code> | the delete message |
| [lastDataVersion] | <code>string</code> | If passed it will be used for data version tracking |
| [getDataVersion] | <code>string</code> | If true it the function will return object having result and dataVersion |

**Example**  
```javascript
client.deleteDocument({"graph_type":"schema",id:['Country','Coordinate'])
```

## getSchemaFrame
##### woqlClient.getSchemaFrame([type], [dbId]) ⇒ <code>Promise</code>
The purpose of this method is to quickly discover the supported fields of a particular type.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [type] | <code>string</code> | If given, the type to get information for. If omitted, information for all types is returned |
| [dbId] | <code>string</code> | the database id |

**Example**  
```javascript
client.getSchemaFrame("Country")
```

## getSchema
##### woqlClient.getSchema([dbId], [branch]) ⇒ <code>Promise</code>
get the database schema in json format

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [dbId] | <code>string</code> | the database id |
| [branch] | <code>string</code> | specific a branch/collection |

**Example**  
```javascript
client.getSchema()
```

## getClasses
##### woqlClient.getClasses([dbId]) ⇒ <code>Promise</code>
get all the schema classes (documents,subdocuments,abstracts)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [dbId] | <code>string</code> | the database id |

**Example**  
```javascript
client.getClasses()
```

## getEnums
##### woqlClient.getEnums([dbId]) ⇒ <code>Promise</code>
get all the Enum Objects

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type |
| --- | --- |
| [dbId] | <code>string</code> | 

**Example**  
```javascript
client.getEnums()
```

## getClassDocuments
##### woqlClient.getClassDocuments([dbId]) ⇒ <code>Promise</code>
get all the Document Classes (no abstract or subdocument)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type |
| --- | --- |
| [dbId] | <code>string</code> | 

**Example**  
```javascript
client.getClassDocuments()
```

## getBranches
##### woqlClient.getBranches([dbId]) ⇒ <code>Promise</code>
get the database collections list

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [dbId] | <code>string</code> | the database id |

**Example**  
```javascript
client.getBranches()
```

## getPrefixes
##### woqlClient.getPrefixes([dbId]) ⇒ <code>Promise</code>
get the database collections list

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [dbId] | <code>string</code> | the database id |

**Example**  
```javascript
client.getBranches()
```

## getUserOrganizations
##### woqlClient.getUserOrganizations() ⇒ <code>Promise</code>
Get the list of the user's organizations and the database related

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  
**Example**  
```javascript
async funtion callGetUserOrganizations(){
     await getUserOrganizations()
     console.log(client.userOrganizations())
}
```

## userOrganizations
##### woqlClient.userOrganizations([orgList]) ⇒ <code>array</code>
Get/Set the list of the user's organizations (id, organization, label, comment).

**Returns**: <code>array</code> - the user Organizations list  

| Param | Type | Description |
| --- | --- | --- |
| [orgList] | <code>array</code> | a list of user's Organization |

**Example**  
```javascript
async funtion callGetUserOrganizations(){
     await client.getUserOrganizations()
     console.log(client.userOrganizations())
}
```

## getDiff
##### woqlClient.getDiff(before, after) ⇒ <code>Promise</code>
Get the patch of difference between two documents.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| before | <code>object</code> | The current state of JSON document |
| after | <code>object</code> | The updated state of JSON document |

**Example**  
```javascript
const diff = await client.getDiff(
     { "@id": "Person/Jane", "@type": "Person", name: "Jane" },
     { "@id": "Person/Jane", "@type": "Person", name: "Janine" }
 );
```

## patch
##### woqlClient.patch(before, patch) ⇒ <code>Promise</code>
Patch the difference between two documents.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| before | <code>object</code> | The current state of JSON document |
| patch | <code>object</code> | The patch object |

**Example**  
```javascript
let diffPatch = await client.getDiff(
     { "@id": "Person/Jane", "@type": "Person", name: "Jane" },
     { "@id": "Person/Jane", "@type": "Person", name: "Janine" }
 );

let patch = await client.patch( { "@id": "Person/Jane", "@type": "Person", name: "Jane" },
diffPatch);
```
