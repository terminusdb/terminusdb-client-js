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
   "@context":{
      "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
      "terminus":"http://terminusdb.com/schema/terminus#",
      "_":"http://localhost:6363/myFirstTerminusDB/"
   },
   "terminus:document":{
      "@type":"terminus:Database",
      "rdfs:label":{
         "@language":"en",
         "@value":"new db tests"
      },
      "rdfs:comment":{
         "@language":"en",
         "@value":"new db description"
      },
      "terminus:allow_origin":{
         "@type":"xsd:string",
         "@value":"*"
      },
      "@id":"http://localhost:6363/myFirstTerminusDB"
   },
   "@type":"terminus:APIUpdate"
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

##### `deleteDatabase(dbUrl:String):Promise`
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

//opts.terminus:encoding defines which format is requested 
//(*terminus:jsonld / terminus:turtle)
//opts.terminus:user_key is an optional API key

const opts={terminus:encoding: "terminus:turtle",
            terminus:user_key: "root"}

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
schurl TerminusDB full URL or a valid TerminusDB Id or omitted 
doc is OWL schema String 

For stating with an OWL schema go to [https://terminusdb.com/docs/](https://terminusdb.com/docs/)

In the documentation pages you'll find an example of an OWL schema
Go to Quick Start > My First Knowledge Graph

```js

//OWL Schema
const doc="@prefix xsd: <http://www.w3.org/2001/XMLSchema#>.........."

const opts={terminus:encoding: "terminus:turtle"}

client.updateSchema('myFirstTerminusDB',doc,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});

...

```

##### `createDocument(docurl:String, doc:Object, opts:Object):Promise`
Creates a new document in the specified TerminusDB database

docurl TerminusDB document full URL or a valid TerminusDB document Id or omitted 

doc is a document Object 

```js

//Object
const doc={  
   "@context":{  
      "doc":"http://localhost:6363/myFirstTerminusDB/document/",
      "owl":"http://www.w3.org/2002/07/owl#",
      "rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
      "scm":"http://localhost:6363/myFirstTerminusDB/schema#",
      "tbs":"http://terminusdb.com/schema/tbs#",
      "tcs":"http://terminusdb.com/schema/tcs#",
      "terminus":"http://terminusdb.com/schema/terminus#",
      "vio":"http://terminusdb.com/schema/vio#",
      "xdd":"http://terminusdb.com/schema/xdd#",
      "xsd":"http://www.w3.org/2001/XMLSchema#",
      "_":"http://localhost:6363/myFirstTerminusDB/document/Rose/"
   },
   "terminus:document":{  
      "tcs:member_of":[  
         {  
            "@id":"doc:yoga"
         }
      ],
      "tcs:friend":[  
         {  
            "@id":"doc:Jane"
         }
      ],
      "tcs:date_of_birth":[  
         {  
            "@value":"1976-05-12",
            "@type":"xsd:date"
         }
      ],
      "rdfs:label":[  
         {  
            "@value":"Rose",
            "@type":"xsd:string"
         }
      ],
      "rdfs:comment":[  
         {  
            "@value":"Steve is a person who is a member of Yoga group and are friends with Jane\n",
            "@type":"xsd:string"
         }
      ],
      "tcs:identity":[  
         {  
            "tcs:website":[  
               {  
                  "@value":"www.myWEBSite.com",
                  "@type":"xdd:url"
               }
            ],
            "tcs:twitter_handle":[  
               {  
                  "@value":"https://twitter.com/Rose",
                  "@type":"xsd:string"
               }
            ],
            "tcs:email_address":[  
               {  
                  "@value":"rose@gmail.com",
                  "@type":"xdd:email"
               }
            ],
            "@type":"tcs:Identifier",
            "@id":"_:x0ciuq1570113866176"
         }
      ],
      "@type":"http://terminusdb.com/schema/tcs#Person",
      "@id":"http://localhost:6363/myFirstTerminusDB/document/Rose"
   },
   "@type":"terminus:APIUpdate"
}

//opts.key is an optional API key

const opts={terminus:user_key: "root"}

client.updateSchema("myFirstTerminusDB",doc,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});

...

```

##### `getDocument(docurl:String, opts:Object):Promise`
Retrieves a document from the specified TerminusDb 

docurl TerminusDB document full URL or a valid TerminusDB document Id or omitted 

```js

//opts.terminus:encoding defines which format is requested
//opts.key is an optional API key

const opts={terminus:encoding: "terminus:frame",
            terminus:user_key: "mykey"}

client.getDocument(http://localhost:6363/myFirstTerminusDB/document/Rose,opts).then((response)=>{
  console.log(response)
}).catch((err)=>{
  console.log(err)
});

...

```

##### `deleteDocument(docurl:String, opts:Object):Promise`
Delete a document from the specified TerminusDb 

docurl TerminusDB document full URL or a valid TerminusDB document Id or omitted 

```js

//(opts) opts.key is an optional API key 
const opts={terminus:user_key: "root"}

client.deleteDocument(http://localhost:6363/myFirstTerminusDB/document/Rose,opts).then((response)=>{
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

## Licence

The APACHE 2.0 License 

Copyright (c) 2019 
 
