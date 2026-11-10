/* eslint-disable camelcase */
const UTILS = require('./utils');
const CONST = require('./const');
const ErrorMessage = require('./errorMessage');
const { version } = require('../package.json');
// eslint-disable-next-line no-unused-vars
const typedef = require('./typedef');
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
 * @param {object} response the fetch Response object
 * @param {object} data the parsed response body
 * @returns {object} Object having two properties result and dataVersion
 */
function getResultWithDataVersion(response, data) {
  return {
    result: data,
    dataVersion: response.headers.get('terminusdb-data-version') || '',
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

/**
 * Serialize a request payload for fetch. Streams (e.g. form-data) and buffers
 * pass through untouched; plain objects are JSON encoded as axios did, and
 * gzip compressed when compress is set and the payload exceeds 1024 bytes.
 */
async function serializeBody(payload, options, compress) {
  if (payload && typeof payload.pipe === 'function') {
    // undici fetch cannot consume node streams; buffer the form body
    const chunks = [];
    payload.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    return new Promise((resolve, reject) => {
      payload.on('end', () => resolve(Buffer.concat(chunks)));
      payload.on('error', reject);
      payload.resume(); // form-data streams stay paused until resumed or piped
    });
  }
  if (typeof FormData !== 'undefined' && payload instanceof FormData) {
    // fetch must generate the multipart boundary itself
    /* eslint-disable no-param-reassign */
    delete options.headers['Content-Type'];
    delete options.headers['content-type'];
    /* eslint-enable no-param-reassign */
    return payload;
  }
  if (payload instanceof Uint8Array || typeof payload === 'string') {
    return payload;
  }
  const jsonString = JSON.stringify(payload || {});
  if (jsonString.length > 1024 && compress) {
    // eslint-disable-next-line no-param-reassign
    options.headers['Content-Encoding'] = 'gzip';
    // CompressionStream is a global in Node 20+ and modern browsers
    return new Response(
      new Blob([jsonString]).stream().pipeThrough(new CompressionStream('gzip')),
    ).arrayBuffer();
  }
  return jsonString;
}

/**
 * Apply the authorization, remote authorization and custom headers
 * to the request options.
 */
/* eslint-disable no-param-reassign */
function applyHeaders(options, local_auth, remote_auth, customHeaders) {
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
    Object.keys(customHeaders).forEach((key) => {
      options.headers[key] = customHeaders[key];
    });
  }

  if (typeof window === 'undefined') {
    options.headers['User-Agent'] = `terminusdb-client-js/${version}`;
  }
}
/* eslint-enable no-param-reassign */

/**
 * @file Dispatch Request
 * @license Apache Version 2
 * @description Functions for dispatching API requests via fetch.
 * @param {string} url  API endpoint URL
 * @param {string} action API action
 * @param {object} payload data to be transmitted to endpoint
 * @param {typedef.CredentialObj} local_auth the local authorization object
 * @param {typedef.CredentialObj} remote_auth the remote authoriuzation object
 * @param {object} customHeaders all the custom header to add to your call
 * @param {boolean} [getDataVersion] If true the function will return object having result
 * and dataVersion.
 * @param {boolean} [compress] If true, compress the data with gzip if its size is bigger than 1024
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
    headers: {},
    // url:url,
    // no-referrer, *client
  };
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
  applyHeaders(options, local_auth, remote_auth, customHeaders);

  switch (action) {
    case CONST.DELETE: {
      options.method = 'DELETE';
      if (payload) {
        options.headers['Content-Type'] = 'application/json; charset=utf-8';
        options.body = typeof payload === 'string' ? payload : JSON.stringify(payload);
      }
      break;
    }
    case CONST.HEAD: {
      options.method = 'HEAD';
      break;
    }
    case CONST.GET: {
      options.method = 'GET';
      if (payload) {
        const ext = UTILS.URIEncodePayload(payload);
        // eslint-disable-next-line no-param-reassign
        if (ext) url += `?${ext}`;
      }
      break;
    }
    case CONST.ADD_CSV:
    case CONST.INSERT_TRIPLES: {
      options.method = 'PUT';
      options.headers['Content-Type'] = 'application/form-data; charset=utf-8';
      options.body = payload;
      break;
    }
    case CONST.PUT: {
      options.method = 'PUT';
      options.headers['Content-Type'] = 'application/json; charset=utf-8';
      options.body = serializeBody(payload, options, compress);
      break;
    }
    case CONST.QUERY_DOCUMENT: {
      options.headers['X-HTTP-Method-Override'] = 'GET';
    }
    // eslint-disable-next-line no-fallthrough
    default: {
      options.method = 'POST';
      if (!options.headers['content-type'] && !options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json; charset=utf-8';
      }
      options.body = serializeBody(payload, options, compress);
      break;
    }
  }

  return Promise.resolve(options.body)
    .then((body) => fetch(url, { ...options, body }))
    .then(async (response) => {
      const text = await response.text();
      let data = text;
      try {
        data = JSON.parse(text);
      } catch (e) { /* keep the raw text */ }
      if (!response.ok) {
        throw ErrorMessage.apiErrorFormatted(url, options, {
          response: { status: response.status, data },
        });
      }
      return getDataVersion ? getResultWithDataVersion(response, data) : data;
    })
    .catch((err) => {
      throw err?.status ? err : ErrorMessage.apiErrorFormatted(url, options, err);
    });
}

module.exports = DispatchRequest;
