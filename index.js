/* eslint-disable global-require */
const { Var, Vars, Doc } = require('./lib/query/woqlDoc');
const WOQLClient = require('./lib/woqlClient');
const UTILS = require('./lib/utils');
const WOQL = require('./lib/woql');
const axiosInstance = require('./lib/axiosInstance');
const AccessControl = require('./lib/accessControl');
const WOQLQuery = require('./lib/query/woqlBuilder');
const typedef = require('./lib/typedef');
// Deprecated: data rendering is outside this package's scope. These viewer
// exports will be removed in a future major release.
const View = require('./lib/viewer/woqlView');
const WOQLResult = require('./lib/viewer/woqlResult');
const WOQLTable = require('./lib/viewer/woqlTable');
const WOQLGraph = require('./lib/viewer/woqlGraph');

module.exports = {
  Var,
  Doc,
  Vars,
  WOQLClient,
  UTILS,
  View,
  WOQL,
  WOQLResult,
  WOQLTable,
  WOQLGraph,
  axiosInstance,
  AccessControl,
  WOQLQuery,
  typedef,
};
