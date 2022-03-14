/* eslint-disable no-use-before-define */

// This file is used only for development, so we disable the following check.
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */

// https://auth0.com/docs/api/management/v2#!/Clients/post_clients
// https://terminusdb.eu.auth0.com/api/v2/

const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const path = require('path');
const eol = require('eol');

const { woqlClientMenu } = require('./navigationModel');

/* input and output paths */
const inputFile = ['./lib/woqlClient.js', './lib/woql.js', './lib/query/woqlLibrary.js', './lib/accessControl.js', './lib/typedef.js'];
const outputDir = './docs/api';

/* create a documentation file for each class */
let navigationArr = [];

const optionsDefault = {
  helper: './docs/helper/format.js',
  partial: [
    './docs/partial/scope.hbs',
    './docs/partial/member-index.hbs',
    './docs/partial/header.hbs',
  ],
  // data: templateData,
  // template: template,
};
const template = '{{>navigation}}';

inputFile.forEach((filePath) => {
  const options = JSON.parse(JSON.stringify(optionsDefault));
  options.files = filePath;
  /* get template data */
  const fileName = getFileName(filePath);
  // eslint-disable-next-line no-console
  console.log(fileName);
  let templateData = jsdoc2md.getTemplateDataSync({ files: filePath });
  if (fileName === 'woqlClient.js') {
    templateData = formatDataOrder(templateData, woqlClientMenu);
    options.data = templateData;
  }
  const tmpNav = navigationArr.concat(templateData);
  navigationArr = tmpNav;
  fs.writeFileSync(
    path.resolve(outputDir, `${fileName}.json`),
    JSON.stringify(templateData, null, 2),
  );
  createFile(filePath, options, outputDir);
});
// create the navigationbar
createFile(
  '_sidebar.js',
  {
    data: navigationArr,
    template,
    helper: './docs/helper/format.js',
    partial: [
      './docs/partial/navigation.hbs',
      './docs/partial/nav-item.hbs',
      './docs/partial/getting-started.hbs',
    ],
  },
  './docs',
);

// eslint-disable-next-line no-shadow
function createFile(filePath, options, outputDir) {
  const fileName = getFileName(filePath);
  // const template = `{{#class name="${className}"}}{{>docs}}{{/class}}`
  // eslint-disable-next-line no-console
  console.log(`rendering ${filePath}`);
  // Use `eol.lf` to guarantee the string always has Unix (LF) line endings,
  // `jsdoc-to-markdown` may use different line endings depending on the OS, and
  // this can cause problems with rendering the Markdown.
  const output = eol.lf(jsdoc2md.renderSync(options));
  fs.writeFileSync(path.resolve(outputDir, `${fileName}.md`), setHeadings(fileName, output));
}
/// /([\w-]+)(.js)/
function getFileName(filePath) {
  if (filePath === '_sidebar.js') {
    return '_sidebar';
  }
  const regEx = /[\w-]+\.js/;
  return filePath.match(regEx)[0];
}

function formatDataOrder(dataProvider, orderMenu) {
  const newData = [];
  // add the class object

  newData.push(dataProvider[0]);
  dataProvider.splice(0, 1);

  newData.push(dataProvider[0]);
  dataProvider.splice(0, 1);

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
  });

  orderMenu.subMenu.forEach((item) => {
    const index = dataProvider.findIndex((element) => element.name === item.id);

    if (index !== -1) {
      /**
             * @type {array}
             */
      const found = dataProvider.splice(index, 1);
      // console.log('found', found.length)
      if (found.length > 0) {
        found[0].label = item.label;
        newData.push(found[0]);
      }
    }
  });
  // console.log(newData)
  // console.log
  const tt = newData.concat(dataProvider);
  // console.log(tt)
  return tt;
}

function setHeadings(sFileNm, sMD) {
/**
 * Adjust MD heading levels to create a clean
 * table of contents in GitBook. This method
 * replaces the docsify _sidebar.md file.
 *
 * @param {string} sFileNm - File name.
 * @param {string} sMD - File contents in MD format.
 *
 * Notes:
 *
 * 1. This is a quick-fix for basic compliance with the GitBook framework.
 * 2. Expression "~~" renders text as strikethrough for highlighting deprecations.
 * 3. Inconsistent use of constants requires a fix.
 */

  const cHdrLv = '##### ';
  const cWOQL = 'WOQL.';
  const cWOQLClient = 'woqlClient.';
  const cWOQLLib = 'woqlLibrary.';
  const cAccessCtrl = 'accessControl.';

  // No action for sidebar (code to create sidebar can be deprecated.)

  if (sFileNm.match('sidebar')) { return sMD; }

  // Specify syntax ("js" not recognized by GitBook.)

  // eslint-disable-next-line no-param-reassign
  sMD = sMD.replace(/```js/g, '```javascript');

  // Simplified pattern for type definitions.

  if (sFileNm.match('typedef.js')) {
    return sMD
      .replace(/## /g, '# ')
      .replace(/### /g, cHdrLv);
  }

  // All other patterns.

  return sMD
    .replace(/##/g, '#')
    .replace(/## ~~WOQL\./g, `${cHdrLv}~~${cWOQL}`)
    .replace(/## ~~woqlClient\./g, `${cHdrLv}~~${cWOQLClient}`)
    .replace(/## ~~woqlLibrary\./g, `${cHdrLv}~~${cWOQLLib}`)
    .replace(/## ~~accessControl\./g, `${cHdrLv}~~${cAccessCtrl}`)
    .replace(/## WOQL\./g, `${cHdrLv}${cWOQL}`)
    .replace(/## woqlClient\./g, `${cHdrLv}${cWOQLClient}`)
    .replace(/## woqlLibrary\./g, `${cHdrLv}${cWOQLLib}`)
    .replace(/## accessControl\./g, `${cHdrLv}${cAccessCtrl}`);
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
  }, */

//
// - [Create Database](api/woqlClient.js?id=createdatabase)
