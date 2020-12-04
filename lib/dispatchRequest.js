const axiosInstance = require('./axiosInstance')
const UTILS = require('./utils.js')
const CONST = require('./const.js')
const ErrorMessage = require('./errorMessage')

/**
 * base 64 encodes a string using either the btoa implementation if available or the Buffer object.
 * @param {String} str string to be base 64 encoded
 */
function btoaImplementation(str) {
    try {
        return btoa(str)
    } catch (err) {
        return Buffer.from(str).toString('base64')
    }
}

/**
 * @file Dispatch Request
 * @license Apache Version 2
 * @description Functions for dispatching API requests via the axios library.
 * @param {String} url  API endpoint URL
 * @param {String} action API action
 * @param {Object} payload data to be transmitted to endpoint
 * @param {String} key optional basic auth string to be passed
 */
function DispatchRequest(url, action, payload, local_auth, remote_auth = null) {
    /*
     *CORS is only required when trying to fetch data from a browser,
     *as browsers by default will block requests to different origins
     */
    const options = {
        mode: 'cors', // no-cors, cors, *same-origin
        redirect: 'follow', // manual, *follow, error
        referrer: 'client',
        // url:url,
        // no-referrer, *client
    }
    // Only allow self signed certs on 127.0.0.1
    // and on node
    if (url.startsWith("https://127.0.0.1")
          && typeof window === 'undefined') {
      const https = require('https')
      const agent = new https.Agent({
          rejectUnauthorized: false
      })
      options.httpsAgent = agent
    }

    if (local_auth && local_auth.type == 'basic') {
        let encoded = btoaImplementation(local_auth.user + ':' + local_auth.key)
        options.headers = {Authorization: `Basic ${encoded}`}
    } else if (local_auth && local_auth.type == 'jwt') {
        options.headers = {Authorization: `Bearer ${local_auth.key}`}
    }
    if (remote_auth && remote_auth.type == 'jwt') {
        if (!options.headers) options.headers = {}
        options.headers['Authorization-Remote'] = `Bearer ${remote_auth.key}`
    } else if (remote_auth && remote_auth.type == 'basic') {
        let rencoded = btoaImplementation(remote_auth.user + ':' + remote_auth.key)
        if (!options.headers) options.headers = {}
        options.headers['Authorization-Remote'] = `Basic ${rencoded}`
    }
    switch (action) {
        case CONST.DELETE_DATABASE:
        case CONST.DELETE_CSV:
        case CONST.DELETE_GRAPH:
        case CONST.DELETE_USER:
        case CONST.DELETE_ORGANIZATION:
            if (payload) {
                options.headers = options.headers ? options.headers : {}
                options.headers['Content-Type'] = 'application/json'
                options.data = payload
            }
            return axiosInstance
                .delete(url, options)
                .then(response => response.data)
                .catch(err => {
                    const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err))
                    if (err.response && err.response.data) e.data = err.response.data
                    throw e
                })
        case CONST.GET_TRIPLES:
        case CONST.READ_USER:
        case CONST.READ_DATABASE:
        case CONST.READ_ORGANIZATION:
        case CONST.CONNECT:
        case CONST.GET_CSV:
        case CONST.INFO:
            if (payload) {
                const ext = UTILS.URIEncodePayload(payload)
                if (ext) url += `?${ext}`
            }
            return axiosInstance
                .get(url, options)
                .then(response => response.data)
                .catch(err => {
                    let e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err))
                    if (err.response && err.response.data) {
                        e.data = err.response.data
                    }
                    throw e
                })
        case CONST.MESSAGE:
            if (payload) {
                const ext = UTILS.URIEncodePayload(payload)
                if (ext) url += `?api:message=${ext}`
            }
            return axiosInstance
                .get(url, options)
                .then(response => response.data)
                .catch(err => {
                    let e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err))
                    if (err.response && err.response.data) {
                        e.data = err.response.data
                    }
                    throw e
                })
        case CONST.ADD_CSV:
            options.headers = options.headers ? options.headers : {}
            options.headers['Content-Type'] = 'application/form-data'
            return axiosInstance
                .put(url, payload, options)
                .then(response => response.data)
                .catch(err => {
                    const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err))
                    if (err.response && err.response.data) e.data = err.response.data
                    throw e
                })
        case CONST.INSERT_TRIPLES:
            options.headers = options.headers ? options.headers : {}
            options.headers['Content-Type'] = 'application/json'
            return axiosInstance
                .put(url, payload, options)
                .then(response => response.data)
                .catch(err => {
                    const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err))
                    if (err.response && err.response.data) e.data = err.response.data
                    throw e
                })
        default:
            options.headers = options.headers ? options.headers : {}
            options.headers['Content-Type'] = 'application/json'
            return axiosInstance
                .post(url, payload, options)
                .then(response => response.data)
                .catch(err => {
                    const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err))
                    if (err.response && err.response.data) e.data = err.response.data
                    throw e
                })
    }
}

module.exports = DispatchRequest
