var TerminusClient = require('./index.js')

var dbClient = new TerminusClient.WOQLClient()

var connection = dbClient.connect('http://localhost:6363/', 'root')

connection
    .then(response => {
        console.log("I'm connect", response)
        dbClient
            .getSchema(getSchema, {'terminus:encoding': 'terminus:turtle'})
            .then(response => console.log('getSchema RESPONSE OK'))
            .catch(err => {
                console.log('PROMISE reject', 'GETSCHEMA')
            })
    })
    .catch(err => {
        console.log('PROMISE reject', 'CONNECTION')
    })
