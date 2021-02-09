//@ts-check
const WOQLClient = require('./woqlClient')
const WOQL = require('./woql')
const WOQLChartConfig = require('./viewer/chartConfig')

const test = new WOQLChartConfig()
test.title('hell0')
test.xAxis('nnn', 'nnnn')

const client = new WOQLClient('https://127.0.0.1:6363', {
    key: 'root',
    db: 'bootstrap_001',
})

console.log('__AUTHO____KKKKKKK', client.localAuth())
let data = {
    id: 'num001',
    label: 'Person',
    test: 'hello',
    blabla: 'hhhh',
    age: {
        label: 'Age',
        range: 'xsd:integer',
        max: 1,
    },
}
const myquery = WOQL.triple('v:a', 'v:b', 'v:c')
const query03 = WOQL.insert_doctype_data(data)
console.log(myquery.prettyPrint())

//WOQL.idgen('doc:Foo', ['fromCode0000dfff0000yyyy'], 'v:Key'),
//WOQL.add_triple('v:Key', 'type', 'scm:Foo'),
//WOQL.add_triple('v:Key', 'scm:fooName', 'fromCode000')
//)

client.query(myquery).then(result => {
    console.log(result)
})
