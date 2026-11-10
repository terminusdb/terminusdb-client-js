/* eslint-disable global-require */
const { Var, Vars, Doc } = require('./lib/query/woqlDoc');
const WOQLClient = require('./lib/woqlClient');
const UTILS = require('./lib/utils');
const WOQL = require('./lib/woql');
const axiosInstance = require('./lib/axiosInstance');
const AccessControl = require('./lib/accessControl');
const WOQLQuery = require('./lib/query/woqlBuilder');
const typedef = require('./lib/typedef');

module.exports = {
  Var,
  Doc,
  Vars,
  WOQLClient,
  UTILS,
  WOQL,
  axiosInstance,
  AccessControl,
  WOQLQuery,
  typedef,
};
