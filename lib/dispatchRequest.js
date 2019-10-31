const axios = require('axios');
const UTILS = require('./utils.js');
const CONST = require('./const.js');
const ErrorMessage = require('./errorMessage');
/*
Access-Control-Allow-Credentials   true
Access-Control-Allow-Headers  X-PINGOTHER, Content-Type
Access-Control-Allow-Methods GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
Access-Control-Allow-Origin: http://localhost:3000 // WILD CARD WILL NOT WORK WHEN POSTING
*/

function btoaImplementation(str) {
	try {
		return btoa(str);
	} catch (err) {
		// console.log('in buffer')
		return Buffer.from(str).toString('base64');
	}
}

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
	case CONST.CREATE_DOCUMENT:
	case CONST.UPDATE_DOCUMENT:
	case CONST.WOQL_UPDATE:
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
	case CONST.CLASS_FRAME:
	case CONST.WOQL_SELECT:
	case CONST.GET_DOCUMENT:
	default:
		if (payload) {
			const ext = UTILS.URIEncodePayload(payload);
			if (ext) url += `?${ext}`;
		}
		return axios.get(url, options)
			.then((response => response.data))
			.catch((err) => {
				throw new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
			});
	}
}

module.exports = DispatchRequest;
