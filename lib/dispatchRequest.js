
const axios = require('axios');
const CONST = require('./const.js');
const ErrorMessage = require('./errorMessage');

function getOptionsByAction(options, action, payload) {
	let method = 'get';
	switch (action) {
	case CONST.CONNECT:
	case CONST.GET_SCHEMA:
	case CONST.CLASS_FRAME:
	case CONST.WOQL_SELECT:
	case CONST.GET_DOCUMENT:
		if (payload)options.params = payload;
		break;
	case CONST.DELETE_DATABASE:
	case CONST.DELETE_DOCUMENT:
		method = 'delete';
		break;
	case CONST.CREATE_DATABASE:
	case CONST.UPDATE_SCHEMA:
	case CONST.CREATE_DOCUMENT:
	case CONST.UPDATE_DOCUMENT:
	case CONST.WOQL_UPDATE:
		method = 'post';
		options.headers = { 'Content-Type': 'application/json' };
		options.data = JSON.stringify(payload);
		break;
	default:
		return 'get';
	}
	return method;
}

function DispatchRequest(url, action, payload) {
	// /axios[method](url, data, config)
	const options = {
		mode: 'cors', // no-cors, cors, *same-origin
		redirect: 'follow', // manual, *follow, error
		referrer: 'client',
		// url:url,
		// no-referrer, *client
	};
	const method = getOptionsByAction(options, action, payload) || 'get';

	/* if (this.connectionConfig.platformEndpoint()) {
		options.credentials = 'include'; // include, *same-origin, omit
	} */

	return axios[method](url, options)
		.then(response => response.data)
		.catch((err) => {
		// console.log("DispatchRequest", err);
			throw new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
		});
}

module.exports = DispatchRequest;
