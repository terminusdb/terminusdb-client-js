/* eslint-disable camelcase */
const pako = require('pako');
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
 * @param {object} response
 * @returns {object} Object having two properties result and dataVersion
 */
function getResultWithDataVersion(response) {
  return {
    result: response.data,
    dataVersion: response.headers['terminusdb-data-version']
      ? response.headers['terminusdb-data-version']
      : '',
  };
}
/**
 * Create the authorization header string
 * @param {object} auth_obj
 * @returns {object} Object with the Authorization header
 */

function formatAuthHeader(auth_obj) {
  if (!auth_obj) return '';
  const authType = { jwt: 'Bearer', basic: 'Basic', apikey: 'Token' };
  let auth_key = auth_obj.key;

  if (auth_obj.type === 'basic') {
    auth_key = btoaImplementation(`${auth_obj.user}:${auth_obj.key}`);
  }
  return `${authType[auth_obj.type]} ${auth_key}`;
}

function checkPayload(payload, options, compress) {
  if (!payload || typeof payload !== 'object') return false;
  const jsonStringPost = JSON.stringify(payload);
  if (jsonStringPost && jsonStringPost.length > 1024 && compress) {
    // eslint-disable-next-line no-param-reassign
    options.headers['Content-Encoding'] = 'gzip';
    return pako.gzip(jsonStringPost);
  }
  return false;
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
 * @param {boolean} compress If true, compress the data with gzip if its size is bigger than 1024
 */

// eslint-disable-next-line max-len
function DispatchRequest(url, action, payload, local_auth, remote_auth = null, customHeaders = null, getDataVersion = false, compress = false) {
  /*
     *CORS is only required when trying to fetch data from a browser,
     *as browsers by default will block requests to different origins
     */
  const options = {
    mode: 'cors', // no-cors, cors, *same-origin
    redirect: 'follow', // manual, *follow, error
    referrer: 'client',
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
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
  /* if (local_auth && local_auth.type === 'basic') {
    const encoded = btoaImplementation(`${local_auth.user}:${local_auth.key}`);
    options.headers = { Authorization: `Basic ${encoded}` };
  } else if (local_auth && local_auth.type === 'jwt') {
    options.headers = { Authorization: `Bearer ${local_auth.key}` };
  } else if (local_auth && local_auth.type === 'apikey') {
    options.headers = { Authorization: `Token ${local_auth.key}` };
  } */
  /*
     * I can call the local database or a custom installation using the local authorization key or
     * I Can call TerminusX using the jwt token or an apiToken
     */
  if (local_auth && typeof local_auth === 'object') {
    options.headers.Authorization = formatAuthHeader(local_auth);
  }

  /*
   * pass the Authorization information of another
   * terminusdb server to the local terminusdb
   * for authentication you can use jwt or the apiKey token in TerminusX or
   * the Basic autentication if is allowed in the custom server
   */
  if (remote_auth && typeof remote_auth === 'object') {
    options.headers['Authorization-Remote'] = formatAuthHeader(remote_auth);
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
    case CONST.DELETE: {
      if (payload) {
        options.headers = options.headers ? options.headers : {};
        options.headers['Content-Type'] = 'application/json; charset=utf-8';
        options.data = payload;
      }
      return axiosInstance
        .delete(url, options)
        .then((response) => (getDataVersion ? getResultWithDataVersion(response) : response.data))
        .catch((err) => {
          throw ErrorMessage.apiErrorFormatted(url, options, err);
        });
    }
    case CONST.HEAD: {
      return axiosInstance
        .head(url, options)
        .then((response) => (getDataVersion ? getResultWithDataVersion(response) : response.data))
        .catch((err) => {
          throw ErrorMessage.apiErrorFormatted(url, options, err);
        });
    }
    case CONST.GET: {
      if (payload) {
        const ext = UTILS.URIEncodePayload(payload);
        // eslint-disable-next-line no-param-reassign
        if (ext) url += `?${ext}`;
      }
      return axiosInstance
        .get(url, options)
        .then((response) => (getDataVersion ? getResultWithDataVersion(response) : response.data))
        .catch((err) => {
          throw ErrorMessage.apiErrorFormatted(url, options, err);
        });
    }
    case CONST.ADD_CSV:
    case CONST.INSERT_TRIPLES: {
      options.headers = options.headers ? options.headers : {};
      options.headers['Content-Type'] = 'application/form-data; charset=utf-8';
      return axiosInstance
        .put(url, payload, options)
        .then((response) => (getDataVersion ? getResultWithDataVersion(response) : response.data))
        .catch((err) => {
          throw ErrorMessage.apiErrorFormatted(url, options, err);
        });
    }
    case CONST.PUT: {
      options.headers = options.headers ? options.headers : {};
      options.headers['Content-Type'] = 'application/json; charset=utf-8';
      let compressedContent = null;
      const jsonString = JSON.stringify(payload);

      if (jsonString.length > 1024 && compress) {
        options.headers['Content-Encoding'] = 'gzip';
        compressedContent = pako.gzip(jsonString);
      }
      return axiosInstance
        .put(url, compressedContent || payload, options)
        .then((response) => (getDataVersion ? getResultWithDataVersion(response) : response.data))
        .catch((err) => {
          throw ErrorMessage.apiErrorFormatted(url, options, err);
        });
    }
    case CONST.QUERY_DOCUMENT: {
      options.headers = options.headers ? options.headers : {};
      options.headers['X-HTTP-Method-Override'] = 'GET';
      // eslint-disable-next-line no-fallthrough
    }
    default: {
      options.headers = options.headers ? options.headers : {};
      options.headers['Content-Type'] = 'application/json; charset=utf-8';
      const compressedContentPost = checkPayload(payload, options, compress);
      return axiosInstance
        .post(url, compressedContentPost || payload || {}, options)
        .then((response) => (getDataVersion ? getResultWithDataVersion(response) : response.data))
        .catch((err) => {
          throw ErrorMessage.apiErrorFormatted(url, options, err);
        });
    }
  }
}

module.exports = DispatchRequest;
