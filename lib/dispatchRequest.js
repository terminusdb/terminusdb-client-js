const UTILS = require('./utils.js');
const axios = require('axios');
const CONST = require('./const.js');
const ErrorMessage = require('./errorMessage');

function DispatchRequest(url, action, payload) {
	// /axios[method](url, data, config)
	const options = {
		mode: 'cors', // no-cors, cors, *same-origin
		redirect: 'follow', // manual, *follow, error
		referrer: 'client',
		// url:url,
		// no-referrer, *client
	};
	//const method = getOptionsByAction(options, action, payload) || 'get';

	/* if (this.connectionConfig.platformEndpoint()) {
		options.credentials = 'include'; // include, *same-origin, omit
	} */
	console.log("BEFORE axios",url,options,action)

	switch (action) {
	case CONST.CONNECT:
	case CONST.GET_SCHEMA:
	case CONST.CLASS_FRAME:
	case CONST.WOQL_SELECT:
	case CONST.GET_DOCUMENT:
		
		if (payload) url += "?" + UTILS.URIEncodePayload(payload);//options.params = payload;
		return axios.get(url, options)
			.then(response => response.data)
			.catch((err) => {
			 console.log("DispatchRequest", err);
				throw new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
		});		
		break;
	case CONST.DELETE_DATABASE:
	case CONST.DELETE_DOCUMENT:
		return axios.delete(url, options)
			.then(response => response.data)
			.catch((err) => {
			 console.log("DispatchRequest", err);
				throw new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
			});
		break;
	case CONST.CREATE_DATABASE:
	case CONST.UPDATE_SCHEMA:
	case CONST.CREATE_DOCUMENT:
	case CONST.UPDATE_DOCUMENT:
	case CONST.WOQL_UPDATE:
		options.headers = { 'Content-Type': 'application/json' };
		return axios.post(url, JSON.stringify(payload), options)
				.then(response => response.data)
				.catch((err) => {
				 console.log("DispatchRequest", err);
					throw new Error(ErrorMessage.getAPIErrorMessage(url, options, err));
				});
		break;
	}
}

module.exports = DispatchRequest;
