
## WOQLClient
#### WOQLClient
**License**: Apache Version 2  

#### new WOQLClient(serverUrl, [params])
The core functionality of the TerminusDB javascript client is defined in the WOQLClient class - in the woqlClient.js file.
This class provides methods which allow you to directly get and set all of the configuration and API endpoints of the client.
The other parts of the WOQL core - connectionConfig.js and connectionCapabilities.js - are used by the client to store internal state - they should never have to be accessed directly.
For situations where you want to communicate with a TerminusDB server API, the WOQLClient class is all you will need.


| Param | Type | Description |
| --- | --- | --- |
| serverUrl | <code>string</code> | the terminusdb server url |
| [params] | <code>typedef.ParamsObj</code> | an object with the connection parameters |

**Example**  
```js
const client = new TerminusClient.Client(SERVER_URL)
await client.connect(params)
client.db("test")
client.checkout("dev")
const turtle = await client.getTriples("schema", "main")
//The client has an internal state which defines what 
//organization / database / repository / branch / ref it is currently attached to
```

### TerminusDB Client API

### Connect
#### woqlClient.connect([params]) ⇒ <code>Promise</code>
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
```js
client.connect({key="mykey",user="admin"})
```

### Create Database
#### woqlClient.createDatabase(dbId, dbDetails, [orgId]) ⇒ <code>Promise</code>
Creates a new database in TerminusDB server

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| dbId | <code>string</code> | The id of the new database to be created |
| dbDetails | <code>typedef.DbDetails</code> | object containing details about the database to be created: |
| [orgId] | <code>string</code> | optional organization id - if absent default local organization id is used |

**Example**  
```js
//remember set schema:true if you need to add a schema graph
client.createDatabase("mydb", {label: "My Database", comment: "Testing", schema: true})
```

### Delete Database
#### woqlClient.deleteDatabase(dbId, [orgId], [force]) ⇒ <code>Promise</code>
Deletes a database from a TerminusDB server

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| dbId | <code>string</code> | The id of the database to be deleted |
| [orgId] | <code>string</code> | the id of the organization to which the database belongs (in desktop use, this will always be “admin”) |
| [force] | <code>boolean</code> |  |

**Example**  
```js
client.deleteDatabase("mydb")
```

### Create Graph
#### woqlClient.createGraph(graphType, graphId, commitMsg) ⇒ <code>Promise</code>
Creates a new named graph within a TerminusDB database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| graphType | <code>typedef.GraphType</code> | type of graph |
| graphId | <code>string</code> | id of the graph to be created |
| commitMsg | <code>string</code> | a message describing the reason for the change that will be written into the commit log |

**Example**  
```js
client.createGraph("schema", "alt", "Adding new schema graph")
```

### Delete Graph
#### woqlClient.deleteGraph(graphType, graphId, commitMsg) ⇒ <code>Promise</code>
Deletes a graph from a TerminusDB database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| graphType | <code>typedef.GraphType</code> | type of graph |
| graphId | <code>string</code> | local id of graph |
| commitMsg | <code>string</code> | a message describing the reason for the change that will be written into the commit log |

**Example**  
```js
client.deleteGraph("schema", "alt", "Deleting alt schema graph")
```

### Get Triples
#### woqlClient.getTriples(graphType, graphId) ⇒ <code>Promise</code>
Retrieve the contents of a graph within a TerminusDB as triples, encoded in the turtle (ttl) format

**Returns**: <code>Promise</code> - A promise that returns the call response object (with the contents being a string representing a set of triples in turtle (ttl) format), or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| graphType | <code>typedef.GraphType</code> | type of graph to get triples from, either “instance”, “schema” or “inference” |
| graphId | <code>string</code> | TerminusDB Graph name |

**Example**  
```js
const turtle = await client.getTriples("schema", "alt")
```

### Update Triples
#### woqlClient.updateTriples(graphType, graphId, turtle, commitMsg) ⇒ <code>Promise</code>
Replace the contents of the specified graph with the passed triples encoded in the turtle (ttl) format

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| graphType | <code>string</code> | type of graph  |instance|schema|inference| |
| graphId | <code>string</code> | TerminusDB Graph ID |
| turtle | <code>string</code> | string encoding triples in turtle (ttl) format |
| commitMsg | <code>string</code> | Textual message describing the reason for the update |

**Example**  
```js
client.updateTriples("schema", "alt", turtle_string, "dumping triples to graph alt")
```

### Query
#### woqlClient.query(woql, [commitMsg], [allWitnesses]) ⇒ <code>Promise</code>
Executes a WOQL query on the specified database and returns the results

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| woql | <code>WOQLQuery</code> | an instance of the WOQLQuery class |
| [commitMsg] | <code>string</code> | a message describing the reason for the change that will be written into the commit log (only relevant if the query contains an update) |
| [allWitnesses] | <code>boolean</code> |  |

**Example**  
```js
const result = await client.query(WOQL.star())
```

### Clonedb
#### woqlClient.clonedb(cloneSource, newDbId, [orgId]) ⇒ <code>Promise</code>
Clones a remote repo and creates a local copy

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| cloneSource | <code>typedef.CloneSourceDetails</code> | object describing the source branch to be used as a base |
| newDbId | <code>string</code> | id of the new cloned database on the local server |
| [orgId] | <code>string</code> | id of the local organization that the new cloned database will be created in (in desktop mode this is always “admin”) |

**Example**  
```js
client.clonedb({remote_url: "https://my.terminusdb.com/myorg/mydb", label "Cloned DB", comment: "Cloned from mydb"}, newid: "mydb")
```

### Branch
#### woqlClient.branch(newBranchId, [sourceFree]) ⇒ <code>Promise</code>
Creates a new branch with a TerminusDB database, starting from the current context of the client (branch / ref)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| newBranchId | <code>string</code> | local identifier of the new branch the ID of the new branch to be created |
| [sourceFree] | <code>boolean</code> | if the query contains any updates, it should include a textual message describing the reason for the update |

**Example**  
```js
client.branch("dev")
```

### Rebase
#### woqlClient.rebase(rebaseSource) ⇒ <code>Promise</code>
Merges the passed branch into the current one using the rebase operation

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| rebaseSource | <code>object</code> | json describing the source branch to be used as a base |

**Example**  
```js
//from the branch head
client.rebase({rebase_from: "admin/db_name/local/branch/branch_name", message: "Merging from dev")
//or from a commit id
client.rebase({rebase_from: "admin/db_name/local/commit/9w8hk3y6rb8tjdy961de3i536ntkqd8", message: "Merging from dev")
```

### Pull
#### woqlClient.pull(remoteSourceRepo) ⇒ <code>Promise</code>
Pull changes from a branch on a remote database to a branch on a local database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| remoteSourceRepo | <code>typedef.RemoteRepoDetails</code> | an object describing the source of the pull |

**Example**  
```js
client.pull({remote: "origin", remote_branch: "main", message: "Pulling from remote"})
```

### Push
#### woqlClient.push(remoteTargetRepo) ⇒ <code>Promise</code>
Push changes from a branch on a local database to a branch on a remote database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| remoteTargetRepo | <code>typedef.RemoteRepoDetails</code> | an object describing the target of the push {remote: "origin", "remote_branch": "main", "author": "admin", "message": "message"} |

**Example**  
```js
client.push({remote: "origin", remote_branch: "main", message: "Pulling from remote"})
```

### Fetch
#### woqlClient.fetch(remoteId) ⇒ <code>Promise</code>
Fetch updates to a remote database to a remote repository with the local database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| remoteId | <code>string</code> | if of the remote to fetch (eg: 'origin') |


### Insert CSV
#### woqlClient.insertCSV(csvPathList, commitMsg) ⇒ <code>Promise</code>
Inserts a csv from a specified path

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| csvPathList | <code>array</code> | is an array of csv file names with file path |
| commitMsg | <code>string</code> | Textual message describing the reason for the update |

**Example**  
```js
const filePath = ["C:/Users/User Name/Documents/example.csv"]
client.insertCSV(filePath, "inserting a CSV file", "instance", "main")
```

### Get CSV
#### woqlClient.getCSV(csvName) ⇒ <code>Promise</code>
Retrieves the contents of the specified graph as a CSV

**Returns**: <code>Promise</code> - An API success message  

| Param | Type | Description |
| --- | --- | --- |
| csvName | <code>string</code> | Name of csv to dump from the specified database to extract |

**Example**  
```js
const name = ["example.csv"]
client.getCSV(name, true, "instance", "main")
```

### Update CSV
#### woqlClient.updateCSV(csvPathList, commitMsg) ⇒ <code>Promise</code>
Updates the contents of the specified path with a csv, creating the appropriate
diff object as the commit.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| csvPathList | <code>array</code> | Array csvs to upload |
| commitMsg | <code>string</code> | Textual message describing the reason for the update |

**Example**  
```js
const filePath = [{fileToBeUpdated: "File.csv", updateWith: "C:/Users/User Name/Documents/example.csv"}]
client.updateCSV(filePath, "updating a CSV file", "instance", "main")
// Here fileToBeUpdated is the CSV in TerminusDB which we are going to update. updateWith includes the file path of the CSV whose contents is going to be updated to fileToBeUpdated. Note that during an Update CSV only
//the diffs are considered and are updated which makes update of big files more efficient.
```

### Delete CSV
#### woqlClient.deleteCSV(csvName, commitMsg) ⇒ <code>Promise</code>
Deletes CSV from your database

**Returns**: <code>Promise</code> - the rest api call results  

| Param | Type | Description |
| --- | --- | --- |
| csvName | <code>array</code> | is an array of csv file names |
| commitMsg | <code>string</code> | Textual message describing the reason for the delete |

**Example**  
```js
const name = ["example.csv"]
client.deleteCSV(name, "deleting CSV")
```

### get_database
#### ~~woqlClient.get\_database~~
***Deprecated***

Use [#databaseInfo](#databaseInfo) instead


### set_system_db
#### ~~woqlClient.set\_system\_db~~
***Deprecated***

Use [#setSystemDb](#setSystemDb) instead.


### local_auth
#### ~~woqlClient.local\_auth~~
***Deprecated***

Use [#localAuth](#localAuth) instead.


### remote_auth
#### ~~woqlClient.remote\_auth~~
***Deprecated***

Use [#remoteAuth](#remoteAuth) instead.


### copy
#### woqlClient.copy() ⇒ [<code>WOQLClient</code>](#WOQLClient)
creates a copy of the client with identical internal state and context
useful if we want to change context for a particular API call without changing
the current client context

**Returns**: [<code>WOQLClient</code>](#WOQLClient) - new client object with identical state to original but which can be manipulated independently  
**Example**  
```js
let newClient = client.copy()
```

### server
#### woqlClient.server() ⇒ <code>string</code>
Gets the current connected server url
it can only be set creating a new WOQLCLient instance


### api
#### woqlClient.api() ⇒ <code>string</code>
Retrieve the URL of the server’s API base that we are currently connected to

**Returns**: <code>string</code> - the URL of the TerminusDB server api endpoint we are connected to (typically server() + “api/”)  
**Example**  
```js
let api_url = client.api()
```

### organization
#### woqlClient.organization([orgId]) ⇒ <code>string</code> \| <code>boolean</code>
Gets/Sets the client’s internal organization context value


| Param | Type | Description |
| --- | --- | --- |
| [orgId] | <code>string</code> \| <code>boolean</code> | the organization id to set the context to |

**Example**  
```js
client.organization("admin")
```

### user
#### woqlClient.user() ⇒ <code>Object</code>
Gets the current user object as returned by the connect capabilities response
user has fields: [id, name, notes, author]


### uid
#### woqlClient.uid() ⇒ <code>string</code>
Retrieve the id of the user that is logged in with the client

**Returns**: <code>string</code> - the id of the current user (always ‘admin’ for desktop client)  

### userOrganization
#### woqlClient.userOrganization() ⇒ <code>string</code>
**Returns**: <code>string</code> - the user organization name  
**Desription**: Gets the user's organization id  

### databases
#### woqlClient.databases([dbList]) ⇒ <code>array</code>
Retrieves a list of databases (id, organization, label, comment) that the current user has access to on the server. Note that this requires the client to call connect() first.

**Returns**: <code>array</code> - the user databases list  

| Param | Type | Description |
| --- | --- | --- |
| [dbList] | <code>array</code> | a list of databases the user has access to on the server, each having: |

**Example**  
```js
const my_dbs = client.databases()
```

### databaseInfo
#### woqlClient.databaseInfo([dbId], [orgId]) ⇒ <code>object</code>
Gets the database's details

**Returns**: <code>object</code> - the database description object //getDatabaseInfo  

| Param | Type | Description |
| --- | --- | --- |
| [dbId] | <code>string</code> | the datbase id |
| [orgId] | <code>string</code> | the database organization |


### db
#### woqlClient.db([dbId]) ⇒ <code>string</code> \| <code>boolean</code>
Sets / Gets the current database

**Returns**: <code>string</code> \| <code>boolean</code> - - the current database or false  

| Param | Type | Description |
| --- | --- | --- |
| [dbId] | <code>string</code> | the database id to set the context to |

**Example**  
```js
client.db("mydb")
```

### setSystemDb
#### woqlClient.setSystemDb()
Sets the internal client context to allow it to talk to the server’s internal system database


### repo
#### woqlClient.repo([repoId]) ⇒ <code>string</code>
Gets / Sets the client’s internal repository context value (defaults to ‘local’)

**Returns**: <code>string</code> - the current repository id within the client context  

| Param | Type | Description |
| --- | --- | --- |
| [repoId] | <code>typedef.RepoType</code> \| <code>string</code> | default value is local |

**Example**  
```js
client.repo("origin")
```

### checkout
#### woqlClient.checkout([branchId]) ⇒ <code>string</code>
Gets/Sets the client’s internal branch context value (defaults to ‘main’)

**Returns**: <code>string</code> - the current branch id within the client context  

| Param | Type | Description |
| --- | --- | --- |
| [branchId] | <code>string</code> | the branch id to set the context to |


### ref
#### woqlClient.ref([commitId]) ⇒ <code>string</code> \| <code>boolean</code>
Sets / gets the current ref pointer (pointer to a commit within a branch)
Reference ID or Commit ID are unique hashes that are created whenever a new commit is recorded

**Returns**: <code>string</code> \| <code>boolean</code> - the current commit id within the client context  

| Param | Type | Description |
| --- | --- | --- |
| [commitId] | <code>string</code> | the reference ID or commit ID |

**Example**  
```js
client.ref("mkz98k2h3j8cqjwi3wxxzuyn7cr6cw7")
```

### localAuth
#### woqlClient.localAuth([newCredential]) ⇒ <code>typedef.CredentialObj</code> \| <code>boolean</code>
Sets/Gets set the database basic connection credential


| Param | Type |
| --- | --- |
| [newCredential] | <code>typedef.CredentialObj</code> | 

**Example**  
```js
client.localAuth({user:"admin","key":"mykey","type":"basic"})
```

### remoteAuth
#### woqlClient.remoteAuth([newCredential]) ⇒ <code>typedef.CredentialObj</code> \| <code>boolean</code>
Sets/Gets the jwt token for authentication


| Param | Type |
| --- | --- |
| [newCredential] | <code>typedef.CredentialObj</code> | 

**Example**  
```js
client.localAuth({"key":"dhfmnmjglkrelgkptohkn","type":"jwt"})
```

### author
#### woqlClient.author([aName]) ⇒ <code>string</code>
Gets/Sets the string that will be written into the commit log for the current user

**Returns**: <code>string</code> - the current author id in use for the current user  

| Param | Type | Description |
| --- | --- | --- |
| [aName] | <code>string</code> | the id to write into commit logs as the author string (normally an email address) |

**Example**  
```js
client.author("my@myemail.com")
```

### set
#### woqlClient.set(params)

| Param | Type | Description |
| --- | --- | --- |
| params | <code>typedef.ParamsObj</code> | a object with connection params |

**Example**  
```js
sets several of the internal state values in a single call (similar to connect, but only sets internal client state, does not communicate with server)
client.set({key: "mypass", branch: "dev", repo: "origin"})
```

### resource
#### woqlClient.resource(resourceType, [resourceId]) ⇒ <code>string</code>
Generates a resource string for the required context
of the current context for "commits" "meta" "branch" and "ref" special resources

**Returns**: <code>string</code> - a resource string for the desired context  

| Param | Type | Description |
| --- | --- | --- |
| resourceType | <code>typedef.ResourceType</code> | the type of resource string that is required - one of “db”, “meta”, “repo”, “commits”, “branch”, “ref” |
| [resourceId] | <code>string</code> | can be used to specify a specific branch / ref - if not supplied the current context will be used |

**Example**  
```js
const branch_resource = client.resource("branch")
```

### insertTriples
#### woqlClient.insertTriples(graphType, graphId, turtle, commitMsg) ⇒ <code>Promise</code>
Appends the passed turtle to the contents of a graph

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| graphType | <code>string</code> | type of graph  |instance|schema|inference| |
| graphId | <code>string</code> | TerminusDB Graph ID to update, main is the default value |
| turtle | <code>string</code> | is a valid set of triples in turtle format (OWL) |
| commitMsg | <code>string</code> | Textual message describing the reason for the update |


### message
#### woqlClient.message(message, [pathname]) ⇒ <code>Promise</code>
Sends a message to the server

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | textual string |
| [pathname] | <code>string</code> | a server path to send the message to |


### action
#### woqlClient.action(actionName, [payload]) ⇒ <code>Promise</code>
Sends an action to the server

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| actionName | <code>string</code> | structure of the action |
| [payload] | <code>object</code> | a request body call |


### info
#### woqlClient.info() ⇒ <code>Promise</code>
Gets TerminusDB Server Information

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  
**Example**  
```js
client.info()
```

### squashBranch
#### woqlClient.squashBranch(branchId, commitMsg) ⇒ <code>Promise</code>
Squash branch commits

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| branchId | <code>string</code> | local identifier of the new branch |
| commitMsg | <code>string</code> | Textual message describing the reason for the update |


### resetBranch
#### woqlClient.resetBranch(branchId, commitId) ⇒ <code>Promise</code>
Reset branch to a commit id, Reference ID or Commit ID are unique hashes that are created whenever a new commit is recorded

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| branchId | <code>string</code> | local identifier of the new branch |
| commitId | <code>string</code> | Reference ID or Commit ID |


### optimizeBranch
#### woqlClient.optimizeBranch(branchId) ⇒ <code>Promise</code>
Optimize db branch

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| branchId | <code>string</code> | local identifier of the new branch |


### deleteBranch
#### woqlClient.deleteBranch(branchId) ⇒ <code>Promise</code>
Deletes a branch from database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| branchId | <code>string</code> | local identifier of the branch |


### reset
#### woqlClient.reset(commitPath) ⇒ <code>Promise</code>
Reset the current branch HEAD to the specified commit path

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| commitPath | <code>string</code> | The commit path to set the current branch to |


### dispatch
#### woqlClient.dispatch() ⇒ <code>Promise</code>
Common request dispatch function

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | the action name |
| apiUrl | <code>string</code> | the server call endpoint |
| [payload] | <code>object</code> | the post body |


### generateCommitInfo
#### woqlClient.generateCommitInfo(msg, [author]) ⇒ <code>object</code>
Generates the json structure for commit messages


| Param | Type | Description |
| --- | --- | --- |
| msg | <code>string</code> | textual string describing reason for the change |
| [author] | <code>string</code> | optional author id string - if absent current user id will be used |


### generateCommitDescriptor
#### woqlClient.generateCommitDescriptor(commitId)
Generates the json structure for commit descriptor


| Param | Type | Description |
| --- | --- | --- |
| commitId | <code>string</code> | a valid commit id o |


### prepareRevisionControlArgs
#### woqlClient.prepareRevisionControlArgs([rc_args]) ⇒ <code>object</code> \| <code>boolean</code>
Adds an author string (from the user object returned by connect) to the commit message.


| Param | Type |
| --- | --- |
| [rc_args] | <code>object</code> | 


### _load_db_prefixes
#### woqlClient.\_load\_db\_prefixes(dbs) ⇒ <code>array</code>
Loads prefixes for each database connected to.
add the prefix at the connection database list

**Returns**: <code>array</code> - - the list of the databases  

| Param | Type | Description |
| --- | --- | --- |
| dbs | <code>array</code> | the user database list |


### getClassFrame
#### woqlClient.getClassFrame(docType) ⇒ <code>Promise</code>
Retrieves a class frame for the specified class

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| docType | <code>string</code> | is the URL / ID of a document class that exists in the database schema |


### updateDatabase
#### woqlClient.updateDatabase(dbDoc) ⇒ <code>Promise</code>
update the database details

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| dbDoc | <code>object</code> | an object that describe the database details |


### organizations
#### woqlClient.organizations(orgList) ⇒ <code>array</code>
Gets/Sets the list of organizations that the user belongs to (has roles for)


| Param | Type | Description |
| --- | --- | --- |
| orgList | <code>array</code> | list of organization name |


### action_permitted
#### woqlClient.action\_permitted(action, resource) ⇒ <code>boolean</code>
Check from the capabilities object if the action is permitted


| Param | Type | Description |
| --- | --- | --- |
| action | <code>string</code> | the action name |
| resource | <code>string</code> | the name of the resource (databaseName or organizationName) |


### createUser
#### woqlClient.createUser(userId, userDoc) ⇒ <code>Promise</code>
For creating an user

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | the userId |
| userDoc | <code>object</code> | the user's object description |


### getUser
#### woqlClient.getUser(userId) ⇒ <code>Promise</code>
Get the logged user details.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type |
| --- | --- |
| userId | <code>string</code> | 


### updateUser
#### woqlClient.updateUser(userId, userDoc) ⇒ <code>Promise</code>
Update an user from the database.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> |  |
| userDoc | <code>object</code> | User Object details |


### deleteUser
#### woqlClient.deleteUser(userId) ⇒ <code>Promise</code>
Delete an user from the database Only a user with DBA authority can delete a user.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type |
| --- | --- |
| userId | <code>string</code> | 


### createOrganization
#### woqlClient.createOrganization(orgId, orgDoc) ⇒ <code>Promise</code>
Create a new organization for the registered user

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgId | <code>string</code> | the organization id |
| orgDoc | <code>object</code> | An object that describe the organization's details |


### getOrganization
#### woqlClient.getOrganization(orgId) ⇒ <code>Promise</code>
Gets all the information about the given organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgId | <code>string</code> | the organization id |


### updateOrganization
#### woqlClient.updateOrganization(orgId, orgDoc) ⇒ <code>Promise</code>
only if you have the permission you can delete an organization
 Before you can delete the organization, you must first remove all accounts and databases
 from the organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgId | <code>string</code> | the organization id |
| orgDoc | <code>object</code> | the organization details description |


### deleteOrganization
#### woqlClient.deleteOrganization(orgId) ⇒ <code>Promise</code>
only if you have the permission you can delete an organization
 Before you can delete the organization, you must first remove all accounts and databases
 from the organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgId | <code>string</code> | the organization id |


### getRoles
#### woqlClient.getRoles(userId, [orgId], [dbId]) ⇒ <code>Promise</code>
**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | the user id |
| [orgId] | <code>string</code> | the organization id |
| [dbId] | <code>string</code> | the dbId |


### updateRoles
#### woqlClient.updateRoles(newRolesObj) ⇒ <code>Promise</code>
Change the user role for existing users in your organisation, including your own

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type |
| --- | --- |
| newRolesObj | <code>typedef.RolesObj</code> | 

