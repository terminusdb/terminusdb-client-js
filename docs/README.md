# TerminusDB-Client

[![build status](https://api.travis-ci.com/terminusdb/terminusdb-client.svg?branch=master)](https://travis-ci.com/terminusdb/terminusdb-client)
[![Coverage Status](https://coveralls.io/repos/github/terminusdb/terminusdb-client/badge.svg?branch=master)](https://coveralls.io/repos/github/terminusdb/terminusdb-client/badge.svg?branch=master)

Promise based terminus client for the browser and node.js

## Requirements

- [TerminusDB](https://github.com/terminusdb/terminusdb-server)
- [NodeJS 10+](https://nodejs.org/en/)

## Installation

TerminusDB Client can be used as either a Node.js module available through the npm registry, or directly included in web-sites by including the script tag below.

### NPM Module

Before installing, download and install Node.js. Node.js 0.10 or higher is required.

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

This example creates a simple Express.js server that will post an account to
a database with the id "banker" and the default "admin" user with password "root"
For the [full Documentation](https://terminusdb.com/docs/reference/js-client)

```javascript
const express = require("express");
const app = express();
const port = 3000;

const TerminusClient = require("@terminusdb/terminusdb-client");

// Connect and configure the TerminusClient

// Connect and configure the TerminusClient
const client = new TerminusClient.WOQLClient("http://127.0.0.1:6363/", {
  user: "admin",
  key: "root",
  db:"mydb",
});

//change database, set the banker database
client.db("banker");

//we are insert the data in the banker db
app.post("/account", async(req, res) => {
  try{
    const owner = req.body.owner
    const balance = req.body.balance
    const accountObj = {'@type':'BankAccount',
                         'owner':owner,
                         'balance':balance}


    await client.connect()
    const response = await client.addDocument(accountObj)
    res.json({message:'account added'})

    }catch(err){
        console.error(err.message)
        const status=err.status || 500
        res.status(status).send({message: 'Failed to add a new account','err':err.message});
    }
  })

app.listen(port, () => {
  console.log(`Backend Server listening at http://localhost:${port}`);
});
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

The API is documented at: https://terminusdb.com/docs/reference/js-client/core/#terminusdb-client-api

## Report Issues

If you have encounter any issues, please report it with your os and environment setup, version that you are using and a simple reproducible case.

If you encounter other questions, you can ask in our community [forum](https://community.terminusdb.com/) or [Slack channel](http://bit.ly/terminusdb-slack).

## Contribute

It will be nice, if you open an issue first so that we can know what is going on, then, fork this repo and push in your ideas. Do not forget to add a bit of test(s) of what value you adding.

Please check [Contributing.md](Contributing.md) for more information.

## Licence

The APACHE 2.0 License

Copyright (c) 2019