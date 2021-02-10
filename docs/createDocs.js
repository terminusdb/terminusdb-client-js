'use strict'
const jsdoc2md = require('jsdoc-to-markdown')
const fs = require('fs')
const path = require('path')

/* input and output paths */
const inputFile = ['./lib/woqlClient.js', './lib/woql.js', './lib/typedef.js']
const outputDir = './docs/api'

/* create a documentation file for each class */
let navigationArr = []

const options = {
    helper: './docs/helper/format.js',
    partial: [
        './docs/partial/scope.hbs',
        './docs/partial/member-index.hbs',
        './docs/partial/header.hbs',
    ],
    //data: templateData,
    //template: template,
}
const template = `{{#each this}}{{>navigation}}{{/each}}`

inputFile.forEach(filePath => {
    options['files'] = filePath
    /* get template data */
    const fileName = getFileName(filePath)
    const templateData = jsdoc2md.getTemplateDataSync({files: filePath})
    const tmpNav = navigationArr.concat(templateData)
    navigationArr = tmpNav
    /*fs.writeFileSync(
        path.resolve(outputDir, `${fileName}.json`),
        JSON.stringify(templateData, null, 2),
    )*/
    createFile(filePath, options)
})
// create the navigationbar
createFile('./doc/api/navtest.js', {
    data: navigationArr,
    template: template,
    helper: './docs/helper/format.js',
    partial: ['./docs/partial/navigation.hbs', './docs/partial/nav-item.hbs'],
})

function createFile(filePath, options) {
    const fileName = getFileName(filePath)
    //const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`
    console.log(`rendering ${filePath}`)
    const output = jsdoc2md.renderSync(options)
    fs.writeFileSync(path.resolve(outputDir, `${fileName}.md`), output)
}

function getFileName(filePath) {
    const regEx = /[\w-]+\.js/
    return filePath.match(regEx)[0]
}

//
//- [Create Database](api/woqlClient.js?id=createdatabase)
