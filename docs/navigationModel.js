module.exports.woqlClientMenu = {
  label: 'TerminusDB Client API',
  id: 'terminusdbclientapi',
  name: 'WOQLClient',
  subMenu: [
    { label: 'Connect', id: 'connect' },
    { label: 'Create Database', id: 'createDatabase' },
    { label: 'Delete Database', id: 'deleteDatabase' },
    { label: 'Create Graph', id: 'createGraph' },
    { label: 'Delete Graph', id: 'deleteGraph' },
    { label: 'Get Triples', id: 'getTriples' },
    { label: 'Update Triples', id: 'updateTriples' },
    { label: 'Query', id: 'query' },
    { label: 'Clonedb', id: 'clonedb' },
    { label: 'Branch', id: 'branch' },
    { label: 'Rebase', id: 'rebase' },
    { label: 'Pull', id: 'pull' },
    { label: 'Push', id: 'push' },
    { label: 'Fetch', id: 'fetch' },
    { label: 'Insert CSV', id: 'insertCSV' },
    { label: 'Get CSV', id: 'getCSV' },
    { label: 'Update CSV', id: 'updateCSV' },
    { label: 'Delete CSV', id: 'deleteCSV' },
  ],
};

module.exports.woqlMenu = {
  label: 'WOQL API',
  id: 'WOQLPrimitives',
  name: 'triple',
  description: 'WOQL primitives are WOQL.js functions which directly map onto words in the underlying JSON-LD language. All other WOQL.js functions are compound functions which translate into multiple WOQL primitives, or are helper functions which reduce the need to write verbose JSON-LD directly.',
  subMenu: [
    { label: 'Triple', id: 'triple' },
    { label: 'Quad', id: 'quad' },
    { label: 'Comment', id: 'comment' },
    { label: 'Select', id: 'select' },
    { label: 'And', id: 'and' },
    { label: 'Or', id: 'or' },
    { label: 'Opt', id: 'opt' },
    { label: 'Not', id: 'not' },
    { label: 'Sub', id: 'sub' },
    { label: 'Unique', id: 'unique' },
    { label: 'Idgen', id: 'idgen' },
    { label: 'Opt', id: 'opt' },
    { label: 'Not', id: 'not' },
  ],
};

// Accessing and Changing Client Context
