const axios = require('axios');
const UTILS = require('./utils.js');
const CONST = require('./const.js');
const ErrorMessage = require('./errorMessage');



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
 * @param {String} url  API endpoint URL
 * @param {String} action API action
 * @param {Object} payload data to be transmitted to endpoint
 * @param {String} extra optional url argument (graph id)
 */
function DispatchRequest(url, action, payload) {
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
	};
	if (payload && payload['terminus:user_key']) {
		options.headers = { Authorization: `Basic ${btoaImplementation(`:${payload['terminus:user_key']}`)}` };
		delete (payload['terminus:user_key']);
	}

	

	switch (action) {
	case CONST.DELETE_DATABASE:
	case CONST.DELETE_GRAPH:
	case CONST.DELETE_DOCUMENT:
		if (payload) {
			const ext = UTILS.URIEncodePayload(payload);
			if (ext) url += `?${ext}`;
		}
		return axios.delete(url, options)
			.then(response => response.data)
			.catch((err) => {
				throw new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
			});
	case CONST.CREATE_DATABASE:
	case CONST.UPDATE_SCHEMA:
	case CONST.CREATE_GRAPH:
	case CONST.CREATE_DOCUMENT:
	case CONST.UPDATE_DOCUMENT:
	case CONST.FETCH:
	case CONST.PUSH:
	case CONST.REBASE:
	case CONST.BRANCH:
	case CONST.CLONE:
		options.headers = options.headers ? options.headers : {};
		options.headers['Content-Type'] = 'application/json';
		return axios.post(url, JSON.stringify(payload), options)
			.then(response => response.data)
			.catch((err) => {
				const e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
				if (err.response && err.response.data) e.data = err.response.data;
				throw e;
			});
	case CONST.GET_SCHEMA:
	case CONST.CONNECT:
	case CONST.WOQL_QUERY:
	case CONST.CLASS_FRAME:
	case CONST.GET_DOCUMENT:
	default:
		if (payload) {
			const ext = UTILS.URIEncodePayload(payload);
			if (ext) url += `?${ext}`;
		}
		return axios.get(url, options)
			.then((response => response.data))
			.catch((err) => {
				let e = new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
				if(err.response && err.response.data){
					e.data = err.response.data;
				}
				throw e;
			});
	}
}

module.exports = DispatchRequest;
