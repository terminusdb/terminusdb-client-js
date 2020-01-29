terminus-client
===============

[![build status](https://api.travis-ci.org/terminusdb/terminus-client.svg?branch=master)](https://travis-ci.org/terminusdb/terminus-client)
[![Coverage Status](https://coveralls.io/repos/github/terminusdb/terminus-client/badge.svg?branch=master)](https://coveralls.io/repos/github/terminusdb/terminus-client/badge.svg?branch=master)
[![code helpers]

Promise based terminus client for the browser and node.js

## Requirements
- [TerminusDB](https://github.com/terminusdb/terminus-server)
- [NodeJS 8.1.4+](https://nodejs.org/en/)

## Installation

Terminus Client can be used as either a Node.js module available through the npm registry, or directly included in web-sites by including the script tag below.

### NPM Module
Before installing, download and install Node.js. Node.js 0.10 or higher is required.

Installation is done using the npm install command:

Using npm:

```bash
$ npm install --save @terminusdb/terminus-client
```

### Minified Script

Using cdn:

```html
<script src="https://unpkg.com/@terminusdb/terminus-client/dist/terminus-client.min.js"></script>
```

Downloading:

Download the terminus-client.min.js file from the /dist directory and save it to your location of choice, then:

```html
<script src="http://my.saved.location/terminus-client.min.js"></script>
```

## Usage
For the [full Documentation](https://terminusdb.com/docs/client_api)

```javascript
//
const TerminusClient = require('@terminusdb/terminus-client');

//Create a new instance of terminusDB client
const client = new TerminusClient.WOQLClient();

//Connect to a TerminusDB server at the given URI with an API key
client.connect("http://localhost:6363/", 'myKey').
 .then(function (response) {
    // handle success
    console.log(response);
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .finally(function () {
    // always executed
  });


//use async/await.
async function getCapabilities() {
  try {
    const response = await client.connect("http://localhost:6363/", 'myKey');
    console.log(response);
  } catch (err) {
    console.error(err);
  }
}

```



## Options
connections options.

To initialize `TerminusDB client` with custom options use

```js
const TerminusClient = require('@terminusdb/terminus-client')

const client = new TerminusClient.WOQLClient({
    server:"http://localhost/",
    dbid:"test_db",
    include_key:true
});

```

## API

##### `createDatabase(dburl:String, details:Object, key:String):Promise`
Create a new terminusDB database

```js

var details={
  "@context": {
    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
    "terminus": "http://terminusdb.com/schema/terminus#"
  },
  "@type": "terminus:Database",
  "rdfs:label": {
    "@language": "en",
    "@value": "my first test"
  },
  "rdfs:comment": {
    "@language": "en",
    "@value": "document test"
  },
  "terminus:allow_origin": {
    "@type": "xsd:string",
    "@value": "*"
  }
}

//Create a new Database in the current terminusDB server using the terminusDB server Api key
//dburl is the new Database Id

var currentTerminusDBServerUrl=client.connectionConfig.dbURL();

client.createDatabase("myFirstTerminusDB",details);

or

//dburl is a full new TerminusDB url

client.createDatabase("http://localhost:6363/myFirstTerminusDB",details,'mykey');

...

```

##### `deleteDatabase(dbUrl:String,key:String):Promise`
For delete a terminusDB

```js
//if authorized you can delete a terminusDB in the a terminusDB server by full URL and Api key
client.deleteDatabase("http://localhost:6363/myFirstTerminusDB",'mykey');

or

//you can delete a terminusDB in the current terminusDB server
client.deleteDatabase("myFirstTerminusDB");
...

```

##### `getSchema(schurl:String, opts:Object):Promise`
For get a terminusDB schema

```js

//opts.terminus:encoding defines which format is requested (*terminus:jsonld / terminus:turtle)
//opts.terminus:user_key is the server API key

const opts={terminus:encoding: "terminus:turtle",
            terminus:user_key: "mykey"}

//Retrieves the schema of the specified TerminusDB database by full Url
client.getSchema("http://localhost:6363/myFirstTerminusDB/schema",opts);

or

const opts={terminus:encoding: "terminus:turtle"}


//Retrieves the schema of the specified database by Id in the current server
client.getSchema("myFirstTerminusDB",opts).then((response)=>{
  console.log("response")
}).catch((err)=>{
  console.log(err);
});
...

```


##### `updateSchema(schurl:String, doc:String, opts:Object):Promise`
For Update a terminusDB schema

1) schurl TerminusDB full URL or a valid TerminusDB Id or omitted
2) doc is OWL schema String

For stating with an OWL schema go to [https://terminusdb.com/docs/](https://terminusdb.com/docs/)

In the documentation pages you'll find an example of an OWL schema
Go to Quick Start > My First Knowledge Graph

```js

//OWL Schema
const doc="@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.........."

//update a schema from the current server
const opts={terminus:encoding: "terminus:turtle"}

client.updateSchema('myFirstTerminusDB',doc,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});


or

//update a schema from a full TerminusDB Url
const opts={terminus:encoding: "terminus:turtle",
            terminus:key:"mykey"}

client.updateSchema('myFirstTerminusDB',doc,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});

...

```

##### `createDocument(docurl:String, doc:Object, opts:Object):Promise`
Creates a new document in the specified TerminusDB database

docurl TerminusDB document full URL or a valid TerminusDB document Id

doc is a document Object

```js

//Object
const doc={
   "rdfs:label":[
      {
         "@value":"Chess Group",
         "@type":"xsd:string"
      }
   ],
   "rdfs:comment":[
      {
         "@value":"this is a group for chess players",
         "@type":"xsd:string"
      }
   ],
   "tcs:identity":[
      {
         "tcs:website":[
            {
               "@value":"www.chessPlayer.com",
               "@type":"xdd:url"
            }
         ],
         "@type":"tcs:Identifier",
         "@id":"_:f89plh1570198207869"
      }
   ],
   "@type":"http://terminusdb.com/schema/tcs#Group",
   "@context":{
      "s":"http://localhost:6363/myFirstTerminusDB/schema#",
      "dg":"http://localhost:6363/myFirstTerminusDB/schema",
      "doc":"http://localhost:6363/myFirstTerminusDB/document/",
      "db":"http://localhost:6363/myFirstTerminusDB/",
      "g":"http://localhost:6363/",
      "rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
      "xsd":"http://www.w3.org/2001/XMLSchema#",
      "owl":"http://www.w3.org/2002/07/owl#",
      "tcs":"http://terminusdb.com/schema/tcs#",
      "tbs":"http://terminusdb.com/schema/tbs#",
      "xdd":"http://terminusdb.com/schema/xdd#",
      "terminus":"http://terminusdb.com/schema/terminus#",
      "vio":"http://terminusdb.com/schema/vio#",
      "docs":"http://terminusdb.com/schema/documentation#",
      "scm":"http://localhost:6363/myFirstTerminusDB/schema#",
      "_":"http://localhost:6363/myFirstTerminusDB/document/chess/"
   }
}
/
// opts.terminus:encoding defines which format is requested (jsonld/frame)
const opts={terminus:encoding: "jsonld"}

client.createDocument("chess",doc,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});


or

//opts.key is an API key

const opts={terminus:encoding: "jsonld",
            terminus:user_key: "mykey"}

client.createDocument("http://localhost:6363/myFirstTerminusDB/document/chess",doc,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});


...

```

##### `getDocument(docurl:String, opts:Object):Promise`
Retrieves a document from the specified TerminusDb

docurl TerminusDB document full URL or a valid TerminusDB document Id

```js

//opts.terminus:encoding defines which format is requested
//opts.key is an optional API key

const opts={terminus:encoding: "terminus:frame",
            terminus:user_key: "mykey"}

client.getDocument("http://localhost:6363/myFirstTerminusDB/document/chess",opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});

or

//get the document chess from current server and current terminusDB
const opts={terminus:encoding: "terminus:frame"}

client.getDocument("chess",opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});


...

```


##### `updateDocument(docurl:String, doc:Object, opts:Object):Promise`
Update the document data in the specified TerminusDB database

docurl TerminusDB document full URL or a valid TerminusDB document Id

doc is a document Object

```js

//Object
const doc={
   "rdfs:label":[
      {
         "@value":"Chess Group",
         "@type":"xsd:string"
      }
   ],
   "rdfs:comment":[
      {
         "@value":"this is a group for chess players",
         "@type":"xsd:string"
      }
   ],
   "tcs:identity":[
      {
         "tcs:website":[
            {
               "@value":"www.chessPlayer.com",
               "@type":"xdd:url"
            }
         ],
         "@type":"tcs:Identifier",
         "@id":"_:f89plh1570198207869"
      }
   ],
   "@type":"http://terminusdb.com/schema/tcs#Group",
   "@context":{
      "s":"http://localhost:6363/myFirstTerminusDB/schema#",
      "dg":"http://localhost:6363/myFirstTerminusDB/schema",
      "doc":"http://localhost:6363/myFirstTerminusDB/document/",
      "db":"http://localhost:6363/myFirstTerminusDB/",
      "g":"http://localhost:6363/",
      "rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
      "xsd":"http://www.w3.org/2001/XMLSchema#",
      "owl":"http://www.w3.org/2002/07/owl#",
      "tcs":"http://terminusdb.com/schema/tcs#",
      "tbs":"http://terminusdb.com/schema/tbs#",
      "xdd":"http://terminusdb.com/schema/xdd#",
      "terminus":"http://terminusdb.com/schema/terminus#",
      "vio":"http://terminusdb.com/schema/vio#",
      "docs":"http://terminusdb.com/schema/documentation#",
      "scm":"http://localhost:6363/myFirstTerminusDB/schema#",
      "_":"http://localhost:6363/myFirstTerminusDB/document/chess/"
   }
}
/
// opts.terminus:encoding defines which format is requested (jsonld/frame)
const opts={terminus:encoding: "jsonld"}

client.updateDocument("chess",doc,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});


or

//opts.key is an API key

const opts={terminus:encoding: "jsonld",
            terminus:user_key: "mykey"}

client.updateDocument("http://localhost:6363/myFirstTerminusDB/document/chess",doc,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});


...

```

##### `deleteDocument(docurl:String, opts:Object):Promise`
Delete a document from the specified TerminusDb

docurl TerminusDB document full URL or a valid TerminusDB document Id

```js
client.deleteDocument("chess",opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});

//(opts) opts.key is an optional API key
const opts={terminus:user_key: "mykey"}

client.deleteDocument("http://localhost:6363/myFirstTerminusDB/document/chess",opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});

...

```

## Testing
* Clone this repository

* Install all development dependencies
```sh
$ npm install
```

* Then run test
```sh
$ npm run test
```

## Contribute
It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

Please check [Contributing.md](Contributing.md) for more information.

## Licence

The APACHE 2.0 License

Copyright (c) 2019
