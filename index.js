/* eslint-disable global-require */
const { Var, Vars, Doc } = require('./lib/query/woqlDoc');
const WOQLClient = require('./lib/woqlClient');
const UTILS = require('./lib/utils');
const View = require('./lib/viewer/woqlView');
const WOQL = require('./lib/woql');
const WOQLResult = require('./lib/viewer/woqlResult');
const WOQLTable = require('./lib/viewer/woqlTable');
const WOQLGraph = require('./lib/viewer/woqlGraph');
const axiosInstance = require('./lib/axiosInstance');
const AccessControl = require('./lib/accessControl');
const WOQLQuery = require('./lib/query/woqlBuilder');

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
};
