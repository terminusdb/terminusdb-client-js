[![TerminusDB JavaScript Client](https://assets.terminusdb.com/readmes/terminusdb-client-js/header.gif)][terminusdb-client-js-docs]

[terminusdb-client-js-docs]: https://terminusdb.github.io/terminusdb-client-js/

---

[![Discord](https://img.shields.io/discord/689805612053168129?label=Discord&logo=Discord&style=plastic)](https://discord.gg/yTJKAma)
[![Reddit](https://img.shields.io/reddit/subreddit-subscribers/TerminusDB?style=social)](https://www.reddit.com/r/TerminusDB/)
[![Twitter](https://img.shields.io/twitter/follow/terminusdb?color=skyblue&label=Follow%20on%20Twitter&logo=twitter&style=flat)](https://twitter.com/TerminusDB)

[![npm version](https://img.shields.io/npm/v/@terminusdb/terminusdb-client?logo=npm)](https://www.npmjs.com/package/@terminusdb/terminusdb-client)
[![npm downloads](https://img.shields.io/npm/dw/@terminusdb/terminusdb-client?color=red&label=npm%20package&logo=npm&style=flat)](https://www.npmjs.com/package/@terminusdb/terminusdb-client)

> This repository is for the JavaScript client library for TerminusDB and
> TerminusX.

[**TerminusDB**][terminusdb] is an [open-source][terminusdb-repo] graph database
and document store. It allows you to link JSON documents in a powerful knowledge
graph all through a simple document API.

[terminusdb]: https://terminusdb.com/
[terminusdb-docs]: https://terminusdb.com/docs/
[terminusdb-repo]: https://github.com/terminusdb/terminusdb

**TerminusCMS** is a [headless content management system](https://terminusdb.com/terminuscms/) for complex enviroments. Try it out for yourself, it's free to get started with generous limits. Clone a demo project to play around. [Sign up][dashboard].

[dashboard]: https://dashboard.terminusdb.com/

## Requirements

- Node.js version 10+ if using the TerminusDB client library as a Node.js package

## Installation

The TerminusDB JavaScript client library can be used either as a Node.js package
or as a script that runs in the browser.

### NPM Package

> :memo: If you don't already have Node.js installed, [install it][node-install] first.

[node-install]: https://docs.npmjs.com/downloading-and-installing-node-js-and-npm

To install the `terminusdb-client` package as a dependency in an existing
package, run:

```sh
$ npm install --save @terminusdb/terminusdb-client
```

This command update your `package.json`.

### Script

To use the `terminusdb-client` script on a webpage sourced from a CDN, add this
to your HTML:

```html
<script src="https://unpkg.com/@terminusdb/terminusdb-client/dist/terminusdb-client.min.js"></script>
```

Alternatively, you can download the latest [`terminusdb-client.min.js`][js], add
it to your sources, and use that in the `<script>` instead.

[js]: https://unpkg.com/@terminusdb/terminusdb-client/dist/terminusdb-client.min.js

## Usage

This example creates a simple dataProduct, starting to create a database model the schema
and insert a simple document

For the [full Documentation](https://terminusdb.com/docs/guides/reference-guides/javascript-client-reference)

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
         "@type":"Lexical",
         "@fields":[
            "name"
         ]
      },
      "name":"xsd:string"
   }
]
 
async function createDataProduct(){
    try{

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

The TerminusDB API can be found at the [TerminusDB Documentation][terminusdb-docs].

## Report Issues

If you have encounter any issues, please report it with your os and environment setup, version that you are using and a simple reproducible case.

If you encounter other questions, you can ask in our [Discord Server](https://discord.gg/hTU3XWSzuZ).

## Contribute

> :memo: This project uses [Husky](https://www.npmjs.com/package/husky) which automatically runs lint, tests, and other scripts when you try to commit any changes to the repository. This helps us to improve each commit done to the repo and is automatically installed and configured when you do `npm install`

It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

Please check [Contributing.md](Contributing.md) for more information.

## Licence

The APACHE 2.0 License

Copyright (c) 2019
