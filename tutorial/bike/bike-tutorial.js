/**
 * This is a tutorial script for TerminusDB which demonstrates
 * the creation of a database from CSV files representing information about bicycle trips
 * on an urban program in Washington DC
 */
const TerminusClient = TerminusDBClient

/**
 * The list of CSV files that we want to import
 */
const csvs = [
    'https://terminusdb.com/t/data/bikeshare/2011-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2012Q1-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2010-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2012Q2-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2012Q3-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2012Q4-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2013Q1-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2013Q2-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2013Q3-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2013Q4-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2014Q1-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2014Q2-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2014Q3-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2014Q4-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2015Q1-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2015Q2-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2015Q3-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2015Q4-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2016Q1-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2016Q2-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2016Q3-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2016Q4-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2017Q1-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2017Q2-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2017Q3-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/2017Q4-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201801_capitalbikeshare_tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201802-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201803-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201804-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201805-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201806-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201807-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201808-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201809-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201810-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201811-capitalbikeshare-tripdata.csv',
    'https://terminusdb.com/t/data/bikeshare/201812-capitalbikeshare-tripdata.csv',
]

/**
 *
 * @param {WOQLClient} client
 * @param {String} id
 * @param {String} [title]
 * @param {String} [description]
 */
function createDatabase(client, id, title, description) {
    title = title || 'Bike Data'
    description = description || 'A Database for the Terminus Bikes Tutorial'
    const dbdetails = {id: id, label: title, comment: description, schema: true}
    return client.createDatabase(id, dbdetails)
}

//shorthand so we don't have to type TerminusClient every time
var WOQL = TerminusClient.WOQL

/**
 * The query which creates the schema
 * @param {WOQLClient} client
 */
function createSchema(client) {
    var schema = WOQL.and(
        WOQL.doctype('Station')
            .label('Bike Station')
            .description('A station where municipal bicycles are deposited'),
        WOQL.doctype('Bicycle').label('Bicycle'),
        WOQL.doctype('Journey')
            .label('Journey')
            .property('start_station', 'Station')
            .label('Start Station')
            .property('end_station', 'Station')
            .label('End Station')
            .property('duration', 'integer')
            .label('Journey Duration')
            .property('start_time', 'dateTime')
            .label('Time Started')
            .property('end_time', 'dateTime')
            .label('Time Ended')
            .property('journey_bicycle', 'Bicycle')
            .label('Bicycle Used'),
    )
    console.log('CREATE SCHEMA GRAPH')
    return client.query(schema)
}

function appendData(text, id, addChild) {
    const el_id = `el_${id}`
    if (addChild) {
        var node = document.createElement('li')
        node.id = el_id
        node.className = 'list-group-item'
        node.append(text)
        document.getElementById('loadfile').prepend(node)
    } else {
        document.getElementById(el_id).innerHTML = text
    }
}

/**
 * @param {WOQLClient} client
 * @param {array} arr - array of URLs to load CSVs from
 */
function loadCSVs(client, arr) {
    //If you call pop() on an empty array, it returns undefined.
    let next = arr.pop()
    if (next) {
        const csv = getCSVVariables(next)
        const inputQuery = WOQL.and(csv, ...wrangles)
        var answer = WOQL.and(inputQuery, insertQuery)
        appendData(`........loading csv ${next} ${arr.length} remaining`, arr.length, true)
        // console.log("PRETTY_PRINTER",answer.prettyPrinter())
        client
            .query(answer)
            .then(() => {
                appendData(`Imported ${next} `, arr.length)
            })
            .catch(() => {
                appendData(`Failed to import csv ${next} `, arr.length)
            })
            .finally(() => loadCSVs(client, arr))
    }
}

/**
 * Extracting the data from a CSV and binding it to variables
 * @param {WOQLClient} client
 * @param {String} url - the URL of the CSV
 */
function getCSVVariables(url) {
    const csv = WOQL.get(
        WOQL.as('Start station', 'v:Start_Station')
            .as('End station', 'v:End_Station')
            .as('Start date', 'v:Start_Time')
            .as('End date', 'v:End_Time')
            .as('Duration', 'v:Duration')
            .as('Start station number', 'v:Start_ID')
            .as('End station number', 'v:End_ID')
            .as('Bike number', 'v:Bike')
            .as('Member type', 'v:Member_Type'),
    ).remote(url)
    return csv
}

/**
 * Wrangling the imported data to make it line up nicely
 */
const wrangles = [
    WOQL.idgen('doc:Journey', ['v:Start_ID', 'v:Start_Time', 'v:Bike'], 'v:Journey_ID'),
    WOQL.idgen('doc:Station', ['v:Start_ID'], 'v:Start_Station_URL'),
    WOQL.cast('v:Duration', 'xsd:integer', 'v:Duration_Cast'),
    WOQL.cast('v:Bike', 'xsd:string', 'v:Bike_Label'),
    WOQL.cast('v:Start_Time', 'xsd:dateTime', 'v:Start_Time_Cast'),
    WOQL.cast('v:End_Time', 'xsd:dateTime', 'v:End_Time_Cast'),
    WOQL.cast('v:Start_Station', 'xsd:string', 'v:Start_Station_Label'),
    WOQL.cast('v:End_Station', 'xsd:string', 'v:End_Station_Label'),
    WOQL.idgen('doc:Station', ['v:End_ID'], 'v:End_Station_URL'),
    WOQL.idgen('doc:Bicycle', ['v:Bike_Label'], 'v:Bike_URL'),
    WOQL.concat('v:Start_ID to v:End_ID at v:Start_Time', 'v:Journey_Label'),
    WOQL.concat(
        'Bike v:Bike from v:Start_Station to v:End_Station at v:Start_Time until v:End_Time',
        'v:Journey_Description',
    ),
]

const insertQuery = WOQL.and(
    WOQL.insert('v:Journey_ID', 'Journey')
        .label('v:Journey_Label')
        .description('v:Journey_Description')
        .property('start_time', 'v:Start_Time_Cast')
        .property('end_time', 'v:End_Time_Cast')
        .property('duration', 'v:Duration_Cast')
        .property('start_station', 'v:Start_Station_URL')
        .property('end_station', 'v:End_Station_URL')
        .property('journey_bicycle', 'v:Bike_URL'),
    WOQL.insert('v:Start_Station_URL', 'Station').label('v:Start_Station_Label'),
    WOQL.insert('v:End_Station_URL', 'Station').label('v:End_Station_Label'),
    WOQL.insert('v:Bike_URL', 'Bicycle').label('v:Bike_Label'),
)

function getView(url, key, dbid) {
    appendData('.....loading data for visualization', 'view', true)
    var client = new TerminusClient.WOQLClient(url)
    client.connect({key: key, db: dbid}).then(() => {
        showView(client)
    })
}

function showView(client) {
    const WOQL = TerminusClient.WOQL
    const View = TerminusClient.View
    var woql = WOQL.select('v:Start', 'v:Start_Label', 'v:End', 'v:End_Label').and(
        WOQL.triple('v:Journey', 'type', 'scm:Journey'),
        WOQL.triple('v:Journey', 'start_station', 'v:Start'),
        WOQL.opt().triple('v:Start', 'label', 'v:Start_Label'),
        WOQL.triple('v:Journey', 'end_station', 'v:End'),
        WOQL.opt().triple('v:End', 'label', 'v:End_Label'),
        WOQL.triple('v:Journey', 'journey_bicycle', 'v:Bike'),
    )
    const woqlGraphConfig = View.graph()
    woqlGraphConfig.height(500).width(1200)
    woqlGraphConfig.node('Start_Label', 'End_Label').hidden(true)
    woqlGraphConfig
        .node('End')
        .icon({color: [255, 255, 255], unicode: '\uf84a'})
        .text('v:End_Label')
        .size(25)
        .charge(-10)
    woqlGraphConfig
        .node('Start')
        .icon({color: [255, 255, 255], unicode: '\uf84a'})
        .text('v:Start_Label')
        .size(25)
        .collisionRadius(10)
    woqlGraphConfig.edge('Start', 'End').weight(100)

    client
        .query(woql)
        .then(result => {
            const resultData = new TerminusClient.WOQLResult(result)

            let viewer = woqlGraphConfig.create(null)

            viewer.setResult(resultData)
            console.log(viewer.config)

            const graphResult = new TerminusDBComponents.GraphResultsViewer(viewer.config, viewer)
            graphResult.load(document.getElementById('target'), true)
            appendData('the Data has been loaded', 'view')
        })
        .catch(err => {
            console.log(err)
            appendData(`ERROR in loadind data ${err.message}`, 'view')
        })
}

/**
 * Runs the tutorial from start to finish
 * @param {String} terminus_server_url - url of the TerminusDB server
 * @param {String} terminus_server_key - key for access to the server
 * @param {String} terminus_db_id - id of the DB to be created in the tutorial
 */
async function runTutorial(terminus_server_url, terminus_server_key, terminus_db_id) {
    var client = new TerminusClient.WOQLClient(terminus_server_url)
    try {
        await client.connect({key: terminus_server_key})
        appendData('......creating database', '001', true)
        await createDatabase(client, terminus_db_id)
        appendData('The database as been created!!!!', '001')
        appendData('......creating schema', '002', true)
        await createSchema(client)
        appendData('The schema as been created!!!!', '002')
        loadCSVs(client, csvs)
    } catch (err) {
        appendData(`ERROR ${err.message}`, '003', true)
    }
}
