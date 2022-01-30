/* eslint-disable camelcase */
const axiosInstance = require('./axiosInstance');
const UTILS = require('./utils');
const CONST = require('./const');
const ErrorMessage = require('./errorMessage');
const { version } = require('../package.json');
/**
 * base 64 encodes a string using either the btoa implementation if available or the Buffer object.
 * @param {String} str string to be base 64 encoded
 */
function btoaImplementation(str) {
  try {
    return btoa(str);
  } catch (err) {
    return Buffer.from(str).toString('base64');
  }
}

/**
 * @file Dispatch Request
 * @license Apache Version 2
 * @description Functions for dispatching API requests via the axios library.
 * @param {string} url  API endpoint URL
 * @param {string} action API action
 * @param {object} payload data to be transmitted to endpoint
 * @param {string} key optional basic auth string to be passed
 * @param {object} customHeaders the unique reqID
 */
// eslint-disable-next-line max-len
function DispatchRequest(url, action, payload, local_auth, remote_auth = null, customHeaders = null) {
  /*
     *CORS is only required when trying to fetch data from a browser,
     *as browsers by default will block requests to different origins
     */
  const options = {
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'client',
    headers: {},
    // url:url,
    // no-referrer, *client
  };
  // Only allow self signed certs on 127.0.0.1
  // and on node
  if (url.startsWith('https://127.0.0.1') && typeof window === 'undefined') {
    // eslint-disable-next-line global-require
    const https = require('https');
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });
    options.httpsAgent = agent;
  }

  /*
     * I can call the local database using the local authorization key or
     * a jwt token
     */
  if (local_auth && local_auth.type === 'basic') {
    const encoded = btoaImplementation(`${local_auth.user}:${local_auth.key}`);
    options.headers = { Authorization: `Basic ${encoded}` };
  } else if (local_auth && local_auth.type === 'jwt') {
    options.headers = { Authorization: `Bearer ${local_auth.key}` };
  } else if (local_auth && local_auth.type === 'apikey') {
    options.headers = { API_TOKEN: local_auth.key };
  }

  /*
     * pass the Authorization information of another
     * terminusdb server to the local terminusdb
     */
  if (remote_auth && remote_auth.type === 'jwt') {
    options.headers['Authorization-Remote'] = `Bearer ${remote_auth.key}`;
  } else if (remote_auth && remote_auth.type === 'basic') {
    const rencoded = btoaImplementation(`${remote_auth.user}:${remote_auth.key}`);
    options.headers['Authorization-Remote'] = `Basic ${rencoded}`;
  }

  if (customHeaders && typeof customHeaders === 'object') {
    // eslint-disable-next-line array-callback-return
    Object.keys(customHeaders).map((key) => {
      options.headers[key] = customHeaders[key];
    });
  }

  if (typeof window === 'undefined') {
    options.headers['User-Agent'] = `terminusdb-client-js/${version}`;
  }

  switch (action) {
    case CONST.DELETE:
      if (payload) {
        options.headers = options.headers ? options.headers : {};
        options.headers['Content-Type'] = 'application/json; charset=utf-8';
        options.data = payload;
      }
      return axiosInstance
        .delete(url, options)
        .then((response) => response.data)
        .catch((err) => {
          const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
          if (err.response && err.response.data) e.data = err.response.data;
          throw e;
        });
    case CONST.HEAD:
      return axiosInstance
        .head(url, options)
        .then((response) => response.data)
        .catch((err) => {
          const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
          if (err.response && err.response.data) {
            e.data = err.response.data;
          }
          throw e;
        });
    case CONST.GET:
      if (payload) {
        const ext = UTILS.URIEncodePayload(payload);
        // eslint-disable-next-line no-param-reassign
        if (ext) url += `?${ext}`;
      }
      return axiosInstance
        .get(url, options)
        .then((response) => response.data)
        .catch((err) => {
          const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
          if (err.response && err.response.data) {
            e.data = err.response.data;
          }
          throw e;
        });
    case CONST.ADD_CSV:
    case CONST.INSERT_TRIPLES:
      options.headers = options.headers ? options.headers : {};
      options.headers['Content-Type'] = 'application/form-data; charset=utf-8';
      return axiosInstance
        .put(url, payload, options)
        .then((response) => response.data)
        .catch((err) => {
          const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
          if (err.response && err.response.data) e.data = err.response.data;
          throw e;
        });
    case CONST.PUT:
      options.headers = options.headers ? options.headers : {};
      options.headers['Content-Type'] = 'application/json; charset=utf-8';
      return axiosInstance
        .put(url, payload, options)
        .then((response) => response.data)
        .catch((err) => {
          const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
          if (err.response && err.response.data) e.data = err.response.data;
          throw e;
        });
    case CONST.QUERY_DOCUMENT:
      options.headers = options.headers ? options.headers : {};
      options.headers['X-HTTP-Method-Override'] = 'GET';
    // eslint-disable-next-line no-fallthrough
    default:
      options.headers = options.headers ? options.headers : {};
      options.headers['Content-Type'] = 'application/json; charset=utf-8';
      return axiosInstance
        .post(url, payload, options)
        .then((response) => response.data)
        .catch((err) => {
          const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
          if (err.response && err.response.data) e.data = err.response.data;
          throw e;
        });
  }
}

module.exports = DispatchRequest;
