TerminusDB Client Javascript
==========================

[![Discord online](https://img.shields.io/discord/689805612053168129?color=7289da&logo=Discord&label=Discord%20chat)](https://discord.gg/yTJKAma)
[![Discourse topics](https://img.shields.io/discourse/topics?color=yellow&logo=Discourse&server=https%3A%2F%2Fdiscuss.terminusdb.com%2F)](https://discuss.terminusdb.com/)
[![Follow on Twitter](https://img.shields.io/twitter/follow/terminusdb?color=skyblue&label=Follow%20on%20Twitter&logo=twitter&style=flat)](https://twitter.com/TerminusDB)

**Development status ⚙️**

[![build status](https://api.travis-ci.com/terminusdb/terminusdb-client.svg?branch=main)](https://travis-ci.com/terminusdb/terminusdb-client)
[![Coverage Status](https://coveralls.io/repos/github/terminusdb/terminusdb-client/badge.svg?branch=master)](https://coveralls.io/repos/github/terminusdb/terminusdb-client/badge.svg?branch=master)

**NPM Package status 📦**

[![npm version shields.io](https://img.shields.io/npm/v/@terminusdb/terminusdb-client?logo=npm)](https://www.npmjs.com/package/@terminusdb/terminusdb-client)
[![GitHub license](https://img.shields.io/github/license/terminusdb/terminusdb-client-js?color=white&logo=apache)](https://github.com/terminusdb/terminusdb-client-js/blob/main/LICENSE)
[![PyPI download month](https://img.shields.io/npm/dw/@terminusdb/terminusdb-client?color=red&label=npm%20package&logo=npm&style=flat)](https://www.npmjs.com/package/@terminusdb/terminusdb-client)

Promise based terminus client for the browser and node.js

## Requirements

- [NodeJS 10+](https://nodejs.org/en/)

## Installation

TerminusDB Client can be used as either a Node.js module available through the npm registry, or directly included in web-sites by including the script tag below.

### NPM Module

Before installing, download and install Node.js.<br> 
NodeJS version 10.X or higher is required. NodeJS version 14.X is recommended.

Installation is done using the npm install command:

Using npm:

```bash
$ npm install --save @terminusdb/terminusdb-client
```

### Minified Script

Using cdn:

```html
<script src="https://unpkg.com/@terminusdb/terminusdb-client/dist/terminusdb-client.min.js"></script>
```

Downloading:

Download the terminusdb-client.min.js file from the /dist directory and save it to your location of choice, then:

```html
<script src="http://my.saved.location/terminusdb-client.min.js"></script>
```

## Usage

This example creates a simple dataProduct, starting to create a database model the schema
and insert a simple document

For the [full Documentation](https://terminusdb.github.io/terminusdb-client-js/)

```javascript
const TerminusClient = require("@terminusdb/terminusdb-client");

// Connect and configure the TerminusClient
const client = new TerminusClient.WOQLClient('SERVER_CLOUD_URL/mycloudTeam',
                       {user:"myemail@something.com", organization:'mycloudTeam'})
                                            
client.setApiKey(MY_ACCESS_TOKEN)

const bankerSchema = [
   {
      "@type":"Class",
      "@id":"BankAccount",
      "@key":{
         "@type":"Hash",
         "@fields":[
            "account_id"
         ]
      },
      "account_id":"xsd:string",
      "owner":"Person",
      "balance":"xsd:decimal"
   },
   {
      "@type":"Class",
      "@id":"Person",
      "@key":{
         "@type":"Hash",
         "@fields":[
            "name"
         ]
      },
      "name":"xsd:string"
   }
]
 
async function createDataProduct(){
    try{
        await client.connect()
        await client.createDatabase("banker", {label: "Banker Account", 
                                              comment: "Testing", schema: true})
        //add the schema documents
        await client.addDocument(bankerSchema,{"graph_type":"schema"},null,"add new schema") 
    
        const accountObj = {"@type":"BankAccount",
                            "account_id":"DBZDFGET23456",
                            "owner":{
                                "@type":"Person",
                                "name":"Tom"
                            },
                            "balance":1000
                          }

        //add a document instance
        await client.addDocument(accountObj)

        client.getDocument({"as_list":true,id:'Person/Tom'})

    }catch(err){
        console.error(err.message)
    }
  }

```

## Options

connections options.

To initialize `TerminusDB client` with custom options use

```js
const TerminusClient = require("@terminusdb/terminusdb-client");

const client = new TerminusClient.WOQLClient("http://127.0.0.1:6363/", {
  db: "test_db",
  user: "admin",
  key: "my_secret_key",
});
```

## API

The API of the most recent release is documented at: <https://docs.terminusdb.com/v4.2/#/reference/API>

## Report Issues

If you have encounter any issues, please report it with your os and environment setup, version that you are using and a simple reproducible case.

If you encounter other questions, you can ask in our [Discord Server](https://discord.gg/hTU3XWSzuZ).

## Contribute

It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

Please check [Contributing.md](Contributing.md) for more information.

## Licence

The APACHE 2.0 License

Copyright (c) 2019
