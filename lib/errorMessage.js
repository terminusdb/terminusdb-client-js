function getErrorAsMessage(url, api, err) {
	let str = '';
	if (err.response) {
		err = err.response;
		if (err.data) str += `${formatErrorMessage(err.data)}`;
	} else if (err.body) str += `${formatErrorMessage(err.body)}`;
	url = url.split("?")[0];

	if (err.status) str += `Code: ${err.status}`;
	if (err.action) str += ` Action: ${err.action}`;
	if (err.type) str += ` Type: ${err.type}`;
	if (url) str += ` url: ${url}`;
	if (api && api.method) str += ` method: ${api.method}`;
	if (err.stack) str = [str, err.stack].join("\n");
	return str;
}

function formatErrorMessage(msg) {
	if (typeof msg === 'object') {
		let nmsg = '';
		for (const key of Object.keys(msg)) {
			if(msg[key] && typeof msg[key] != "object")
			nmsg += `${key} ${msg[key]} `;
		}
		return nmsg;
	}
	return msg;
}

function accessDenied(action, db, server) {
	const err = {};
	err.status = 403;
	err.url = (server || '') + (db || '');
	err.type = 'client';
	err.action = action;
	err.body = `${err.action} not permitted for ${err.url}`;
	return err;
}

function getAPIErrorMessage(url, api, err) {
	return `API Error ${getErrorAsMessage(url, api, err)}`;
}

function getAccessDeniedMessage(url, api, err) {
	return `Access Denied ${getErrorAsMessage(url, api, err)}`;
}

function getInvalidURIMessage(url, call) {
	const str = `Invalid argument to
            ${call}. 
            ${url}
            is not a valid Terminus DB API endpoint`;
	return str;
}

function getInvalidParameterMessage(call, msg) {
	const str = `Invalid Parameter to
            ${call}. 
            ${msg}`;
	return str;
}


/**
 * Utility functions for generating and retrieving error messages
 * and storing error state
 */

function parseAPIError(response) {
	const err = {};
	err.status = response.status;
	err.type = response.type;
	if (response.data && typeof response.data === 'object') {
		let msg;
		try {
			msg = response.text();
		} catch (e) {
			try {
				msg = response.json();
			} catch (error) {
				msg = response.toString();
			}
		}
		err.body = msg;
	} else if (response.data) err.body = response.data;
	err.url = response.url;
	err.headers = response.headers;
	err.redirected = response.redirected;
	return err;
}


module.exports = {
	getErrorAsMessage,
	getAPIErrorMessage,
	getAccessDeniedMessage,
	accessDenied,
	getInvalidURIMessage,
	getInvalidParameterMessage,
	parseAPIError
};
