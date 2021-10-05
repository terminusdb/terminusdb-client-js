//https://auth0.com/docs/api/management/v2#!/Clients/post_clients
//https://terminusdb.eu.auth0.com/api/v2/
'use strict'
const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs')
const path = require('path')
const {woqlClientMenu} = require('./navigationModel')

/* input and output paths */
const inputFile = ['./lib/woqlClient.js', './lib/woql.js', './lib/query/woqlLibrary.js','./lib/typedef.js']
const outputDir = './docs/api'

/* create a documentation file for each class */
let navigationArr = []

const optionsDefault = {
    helper: './docs/helper/format.js',
    partial: [
        './docs/partial/scope.hbs',
        './docs/partial/member-index.hbs',
        './docs/partial/header.hbs',
    ],
    //data: templateData,
    //template: template,
}
const template = `{{>navigation}}`

inputFile.forEach(filePath => {
    let options = JSON.parse(JSON.stringify(optionsDefault))
    options['files'] = filePath
    /* get template data */
    const fileName = getFileName(filePath)
    console.log(fileName)
    let templateData = jsdoc2md.getTemplateDataSync({files: filePath})
    if (fileName === 'woqlClient.js') {
        templateData = formatDataOrder(templateData, woqlClientMenu)
        options['data'] = templateData
    }
    const tmpNav = navigationArr.concat(templateData)
    navigationArr = tmpNav
    fs.writeFileSync(
        path.resolve(outputDir, `${fileName}.json`),
        JSON.stringify(templateData, null, 2),
    )
    createFile(filePath, options, outputDir)
})
// create the navigationbar
createFile(
    '_sidebar.js',
    {
        data: navigationArr,
        template: template,
        helper: './docs/helper/format.js',
        partial: [
            './docs/partial/navigation.hbs',
            './docs/partial/nav-item.hbs',
            './docs/partial/getting-started.hbs',
        ],
    },
    './docs',
)

function createFile(filePath, options, outputDir) {
    const fileName = getFileName(filePath)
    //const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`
    console.log(`rendering ${filePath}`)
    const output = jsdoc2md.renderSync(options)
    fs.writeFileSync(path.resolve(outputDir, `${fileName}.md`), output)
}
////([\w-]+)(.js)/
function getFileName(filePath) {
    const regEx = /[\w-]+\.js/;
    return filePath.match(regEx)[0]
}

function formatDataOrder(dataProvider, orderMenu) {
    let newData = []
    //add the class object

    newData.push(dataProvider[0])
    dataProvider.splice(0, 1)

    newData.push(dataProvider[0])
    dataProvider.splice(0, 1)

    newData.push({
        id: 'TerminusDB Client API',
        label: 'TerminusDB Client API',
        longname: 'TerminusDBClientAPI',
        description: '',
        name: 'terminusdbclientapi',
        kind: 'group',
        scope: 'global',
        memberof: 'WOQLClient',
        meta: {
            lineno: 38,
            filename: 'woqlClient.js',
            path: '/var/www/html/terminusdb-client/lib',
        },
        order: 3,
    })

    orderMenu.subMenu.forEach(item => {
        const index = dataProvider.findIndex(function(element) {
            return element.name === item.id
        })

        if (index !== -1) {
            /**
             * @type {array}
             */
            const found = dataProvider.splice(index, 1)
            //console.log('found', found.length)
            if (found.length > 0) {
                found[0]['label'] = item.label
                newData.push(found[0])
            }
        }
    })
    //console.log(newData)
    // console.log
    const tt = newData.concat(dataProvider)
    //console.log(tt)
    return tt
}

/*
 {
    "id": "WOQLClient",
    "longname": "WOQLClient",
    "name": "WOQLClient",
    "kind": "class",
    "scope": "global",
    "license": "Apache Version 2",
    "meta": {
      "lineno": 11,
      "filename": "woqlClient.js",
      "path": "/var/www/html/terminusdb-client/lib"
    },
    "order": 0
  },*/

//
//- [Create Database](api/woqlClient.js?id=createdatabase)
