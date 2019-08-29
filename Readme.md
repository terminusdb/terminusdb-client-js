woql-clients
===============


  [![NPM Version][npm-image]][npm-url]
  [![NPM Downloads][downloads-image]][downloads-url]
  [![Linux Build][travis-image]][travis-url]
  [![Windows Build][appveyor-image]][appveyor-url]
  [![Test Coverage][coveralls-image]][coveralls-url]

Promise based woql client for the browser and node.js

## Requirements
- [DQS]()
- [NodeJS 8.1.4+](https://nodejs.org/en/)

## Installation

This is a Node.js module available through the npm registry.

Before installing, download and install Node.js. Node.js 0.10 or higher is required.

Installation is done using the npm install command:

Using npm:

```bash
$ npm install --save @terminusdb/woql-client
```

Using cdn:

```html
<script src="https://unpkg.com/@terminusdb/woql-client/dist/woql-client.min.js"></script>
```

## Docs & Community

## Usage

```javascript
//
const woqlClient = require('woql-client');

//Create a new instance of woql client
const client = new woqlClient();

//Connect to a Terminus server at the given URI with an API key
client.connect("http://localhost:6363/", 'root').
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
    const response = await client.connect("http://localhost:6363/", 'root');
    console.log(response);
  } catch (err) {
    console.error(err);
  }
}

```



## Options
connections options.

To initialize `woql-client` with custom options use

```js
const woqlClient = require('woql-client')

const client = new woqlClient({
    server:"http://localhost:6363/",
    dbid:"test_db",
    include_key:true
});

```

## API

### `createDatabase([dburl:String, details:Object, key:String]):Object`
Create a new terminusDB database in the current terminusDB server

```js
var currentTerminusServerUrl=client.connectionConfig.dbURL();

var details={  
   "@context":{  
      "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
      "terminus":"https://datachemist.net/ontology/terminus#"
   },
   "@type":"terminus:Database",
   "rdfs:label":{  
      "@language":"en",
      "@value":"test 01"
   },
   "rdfs:comment":{  
      "@language":"en",
      "@value":"description"
   },
   "terminus:allow_origin":{  
      "@type":"xsd:string",
      "@value":"*"
   }
}


client.createDatabase("newD",details,'root');

...

```

### `deleteDatabase():{[dbUrl:string]}`
For delete a terminusDB 

```js
//if authorized you can delete a terminusDB in the server myTerminusServer
client.deleteDatabase("http://myTerminusServer/dbID");

or

//you can delete a database in the current seleted server
client.deleteDatabase("dbID");
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

Copyright (c) 2019 ........
 