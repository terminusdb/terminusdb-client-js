//@ts-check
const WOQLClient = require('./lib/woqlClient')
const WOQL = require('./lib/woql')
const WOQLChartConfig = require('./lib/viewer/chartConfig')

const test = new WOQLChartConfig()
test.title('hell0')
test.xAxis("nnn","nnnn")

const client = new WOQLClient('https://127.0.0.1:6363', {
    key: 'root',
    db: 'bootstrap_001',
})

console.log('__AUTHO____KKKKKKK', client.localAuth())

const myquery = WOQL
    .and
    //WOQL.idgen('doc:Foo', ['fromCode0000dfff0000yyyy'], 'v:Key'),
    //WOQL.add_triple('v:Key', 'type', 'scm:Foo'),
    //WOQL.add_triple('v:Key', 'scm:fooName', 'fromCode000'),
    ()

client.query(myquery).then(result => {
    console.log(result)
})
