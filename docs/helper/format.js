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
]

/*exports.orphans = function(options) {
    //const parentData=
   // options.data.root=options.data.root.slice(0,4)
    options.data.root= options.data.root.slice(0,4)
    return options.fn(options)
}*/

exports.checkType = function(options) {
    if (this.kind === 'constructor') return false
    return true
}

exports.makeAnchor = function(options) {
    if (typeof options === 'string') {
        const arr = options.split(/\+|\./)
        if (arr.length === 2) {
            return arr[1]
        }
    }
    return options
}

exports.docsFilter = function(data, options) {
    //const parentData=
    // options.data.root=options.data.root.slice(0,4)
    //data.root= data.root.slice(0,4)
    //return options.fn(options)
    return JSON.stringify(data)
}

exports.testData = function(options) {
    //if (this.testData) {
    //const tt=this.testData.slice(0,4)
    //options.context(tt)
    return options.fn({name: 'hello', test: 'hhhhhhh'})
    //}
}
/**
 * add only the not deprecated in the menu
 */
exports.isDeprecated = function() {
    if (this.deprecated === undefined) return true
    return false
}
exports.indentItem = function() {
    if (this.kind === 'class') {
        return ''
    }
    return '  '
}
