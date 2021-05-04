//import TerminusDB Library
import TerminusDB from '@terminusdb/terminusdb-client'

//Connect with terminusdb Server
const client = new TerminusDB.woqlClient('https:127.0.0.1:6363', {user: 'admin', key: 'root'})

//Create a new database
function createDatabase(client) {
    const uniqueId = 'myperson'
    const title = 'My Person'
    description = description || 'A Database for the Terminus Bikes Tutorial'
    const dbdetails = {id: id, label: title, comment: description, schema: true}
    return client.createDatabase(id, dbdetails)
}

//Create schema
//we create the Person Document class. This element has 3 properties, with three different types. The data type range in knows property (ObjectProperty) is the Person document class.
function createSchema(client) {
    const WOQL = TerminusDB.WOQL
    const addDocument = WOQL.doctype('Person')
        .label('Person Name')
        .description('A Person Document')
        .property('name', 'string')
        .label('Name')
        .cardinality(1)
        //The cardinality in a property is a measure of the "number of values" for this property in a Document instance.
        //Cardinality 1 for date_of_birth means that for every Document Person you have insert one date_of_birth value (mandatory property)
        .property('date_of_birth', 'dateTime')
        .label('Date Of Birth')
        .cardinality(1)
        .property('knows', 'Person')
        .label('Knows')
    client.query(addDocument)
}

//Insert Data
function insertData() {
    const WOQL = TerminusDB.WOQL
    const insertDocument = WOQL.and(
        WOQL.idgen('doc:Person', ['Maria', '1978-12-03'], 'v:Maria'),
        WOQL.idgen('doc:Person', ['Anna', '1974-02-10'], 'v:Anna'),
        WOQL.idgen('doc:Person', ['Tom', '1975-06-23'], 'v:Tom'),
        WOQL.idgen('doc:Person', ['Jim', '1974-07-20'], 'v:Jim'),

        WOQL.insert('v:Maria', 'Person')
            .label('Maria')
            .property('date_of_birth', literal('1978-12-03', 'date'))
            .property('name', 'Maria')
            .property('knows', 'v:Anna'),

        WOQL.insert('v:Anna', 'Person')
            .label('Anna')
            .property('date_of_birth', literal('1974-02-10', 'date'))
            .property('name', 'Anna')
            .property('knows', 'v:Tom'),

        WOQL.insert('v:Tom', 'Person')
            .label('Tom')
            .property('date_of_birth', literal('1975-06-23', 'date'))
            .property('name', 'Tom')
            .property('knows', 'v:Maria'),

        WOQL.insert('v:Jim', 'Person')
            .label('Jim')
            .property('date_of_birth', literal('1974-07-20', 'date'))
            .property('name', 'Jim')
            .property('knows', 'v:Tom'),
    )
    return client.query(insertDocument)
}

//Query for get back all the relationship between the person
function runQuery() {
    const WOQL = TerminusDB.WOQL

    const query = WOQL.or(
        WOQL.triple('v:Person', 'knows', 'v:OtherPerson'),
        WOQL.triple('v:OtherPerson', 'knows', 'v:Person'),
    )

    return client.query(query)
}
