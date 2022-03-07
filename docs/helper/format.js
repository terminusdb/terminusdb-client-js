/* eslint-disable no-unused-vars */
const test = [
  {
    id: 'WOQLClient',
    longname: 'WOQLClient',
    name: 'WOQLClient',
    kind: 'class',
    scope: 'global',
    license: 'Apache Version 2',
    meta: {
      lineno: 11,
      filename: 'woqlClient.js',
      path: '/var/www/html/terminusdb-client/lib',
    },
    order: 0,
  },
  {
    id: 'WOQLClient#copy',
    longname: 'WOQLClient#copy',
    name: 'copy',
    kind: 'function',
    scope: 'instance',
    description: 'Creates a copy of the current client with a new connection Config',
    memberof: 'WOQLClient',
    returns: [
      {
        type: {
          names: ['WOQLClient'],
        },
      },
    ],
    meta: {
      lineno: 39,
      filename: 'woqlClient.js',
      path: '/var/www/html/terminusdb-client/lib',
    },
    order: 2,
  },
];

/* exports.orphans = function(options) {
    //const parentData=
   // options.data.root=options.data.root.slice(0,4)
    options.data.root= options.data.root.slice(0,4)
    return options.fn(options)
} */

exports.addAnchor = function (options) {
  if (this.kind === 'constructor') return false;
  return true;
};

exports.addSigName = function (options) {
  if (this.kind === 'group') return false;
  return true;
};

exports.getSigType = function () {
  let outputString = ` \`  ${this.type.names[0]}\``;
  if (this.type.names.length === 1) return outputString;

  // eslint-disable-next-line no-plusplus
  for (let index = 1; index < this.type.names.length; index++) {
    const element = this.type.names[index];
    outputString += ` |  \`  ${element} \` `;
  }
  return outputString;
};

exports.ifKindTypeDef = function () {
  if (this.kind === 'typedef') {
    return true;
  }
  return false;
};

exports.makeAnchor = function (anchorName) {
  if (typeof anchorName === 'string') {
    const arr = anchorName.split(/\+|\./);
    if (arr.length === 2) {
      return arr[1];
    }
  }
  // removing module_ from header
  if (this.kind === 'module' && anchorName.includes('module_')) {
    return anchorName.substr(7);
  } if (this.kind === 'typedef' && anchorName.includes('module_TypeDef..')) {
    return anchorName.substr(16);
  }

  return anchorName;
};

exports.docsFilter = function (data, options) {
  // const parentData=
  // options.data.root=options.data.root.slice(0,4)
  // data.root= data.root.slice(0,4)
  // return options.fn(options)
  return JSON.stringify(data);
};

exports.testData = function (options) {
  // if (this.testData) {
  // const tt=this.testData.slice(0,4)
  // options.context(tt)
  return options.fn({ name: 'hello', test: 'hhhhhhh' });
  // }
};
/**
 * add only the not deprecated in the menu
 */
exports.isDeprecated = function () {
  if (this.deprecated === undefined) return true;
  return false;
};

exports.navItemAnchor = function () {
  if (typeof this.label === 'string') {
    const anchorName = this.label.replace(/ /g, '-');
    return anchorName.toLowerCase();
  }
  return this.name;
};
let indentItemSub = false;

exports.indentItem = function (options) {
  if (this.kind === 'class' || this.kind === 'module') {
    indentItemSub = false;
    return '';
  }
  if (this.kind === 'group') {
    indentItemSub = true;
    return '  ';
  }
  if (indentItemSub) {
    return '    ';
  }
  return '  ';
};
