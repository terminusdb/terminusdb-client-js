
const CONST = require('./const');
const DispatchRequest = require('./dispatchRequest');
const ErrorMessage = require('./errorMessage');
const ConnectionCapabilities = require('./connectionCapabilities');
const ConnectionConfig = require('./connectionConfig');
const UTILS = require('./utils.js');


/**
 * @file Javascript WOQL client object
 * @license Apache Version 2
 * Simple Javascript Client for accessing the Terminus DB API
 * Constructor - takes an option json list of connection parameters
 * @param {Object} params a json object containing connection parameters
 * which can be: 
 * params.server URL of server to connect to
 * params.dbid ID of database to connect to
 * params.docid = ID of document to load;
 */
function WOQLClient(params) {
	// current connection context variables
	const key = (params && params.key) ? params.key : undefined;
	this.use_fetch = false;
	this.return_full_response = false;
	this.connectionConfig = new ConnectionConfig(params);
	this.connection = new ConnectionCapabilities(this.connectionConfig, key);
}

WOQLClient.CONST = CONST;

/**
 * Connect to a Terminus server at the given URI with an API key
 * Stores the terminus:ServerCapability document returned
 * in the connection register which stores, the url, key, capabilities,
 * and database meta-data for the connected server
 *
 * If the curl argument is false or null,
 * this.connectionConfig.server will be used if present,
 * or the promise will be rejected.

 * @param  {string} curl Terminus server URI
 * @param  {string} [key] API  key
 * @param  {string} [dbid] Optional DB to connect to by default
 * @return {Promise}
 * @public
 */
WOQLClient.prototype.connect = function (curl, key, dbid) {
	if (curl && !this.connectionConfig.setServer(curl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(curl, CONST.CONNECT))
		);
	}
	const serverURL = this.connectionConfig.serverURL();
	if (key) {
		this.connection.setClientKey(serverURL, key);
	}
	// unset the current server setting until successful connect
	this.connectionConfig.server = false;
	return this.dispatch(serverURL, CONST.CONNECT)
	.then((response) => {
	    this.connectionConfig.server = serverURL;
	    if(dbid) this.connectionConfig.dbid = dbid;
	    this.connection.addConnection(serverURL, response);
	    return response;
	});
};

/**
 * Create a Terminus Database by posting
 * a terminus:Database document to the Terminus API
 *
 * The dburl argument can be
 *    1) a valid URL of a terminus database or
 *    2) a valid Terminus database id or
 *    3) can be omitted
 * 		in case 2) the current server will be used,
 * 		in case 3) the database id will be set from the @id field of the terminuse:Database document.
 *
 * The second (details) argument contains a terminus:Database document
 * with a mandatory rdfs:label field and an optional rdfs:comment field.
 * The third (key) argument contains an optional API key
 *
 * @param {string} dburl Terminus server URI or a TerminusID
 * @param {object} details
 * @param {string} key
 * @return {Promise}
 * @public
 */
WOQLClient.prototype.createDatabase = function (dburl, details, key) {
	if (dburl && !this.connectionConfig.setDB(dburl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(dburl, 'Create Database'))
		);
	}
	if (
		details
    && details['@id']
    && !this.connectionConfig.setDB(details['@id'], details['@context'])
	) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(details['@id'], 'Create Database'))
		);
	}
	details = this.makeDocumentConsistentWithURL(details, this.connectionConfig.dbURL());

	const opts = {};
	if (key) {
		opts.key = key;
	}
	const doc = this.addOptionsToDocument(details, opts);
	return this.dispatch(this.connectionConfig.dbURL('create'), CONST.CREATE_DATABASE, doc);
};

/**
 * Delete a Database
 * @param {String} dburl it is a terminusDB Url or a terminusDB Id
 * @param {String} key an optional API key
 * @return {Promise}
 *
 * if dburl is omitted, the current server and database will be used
 */
WOQLClient.prototype.deleteDatabase = function (dburl, key) {
	if (dburl && !this.connectionConfig.setDB(dburl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(dburl, 'Delete Database'))
		);
	}
	const dbid = this.connectionConfig.dbid
	const opts = {};

	if (key) {
		opts.key = key;
	}

	const self = this;
	return this.dispatch(`${this.connectionConfig.dbURL()}`, CONST.DELETE_DATABASE, opts).then(
		(response) => {
			self.connection.removeDB(dbid);
			return response;
		}
	);
};

/**
 * Retrieves the schema of the specified database
 *
 * @param {string} schurl TerminusDB server URL or a valid TerminusDB Id or omitted
 * @param {object} opts is an options object
 * @return {Promise}
 *
 * opts.format is optional and defines which format is requested (*json / turtle)
 * opts.key is an optional API key
 */
WOQLClient.prototype.getSchema = function (schurl, opts) {
	if (schurl && !this.connectionConfig.setSchemaURL(schurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(schurl, 'Get Schema'))
		);
	}
	// consoleco.log('schemaURL', this.connectionConfig.schemaURL());
	return this.dispatch(this.connectionConfig.schemaURL(), CONST.GET_SCHEMA, opts);
};

/**
 * Updates the Schema of the specified database
 *
 * @param {string} schurl TerminusDB server URL or a valid TerminusDB Id or omitted
 * @param {object} doc is a valid owl ontology in json-ld or turtle format
 * @param {object} opts is an options object
 * @return {Promise}
 *
 * if omitted the current server and database will be used
 * opts.format is used to specify which format is being used (*json / turtle)
 * opts.key is an optional API key
 */
WOQLClient.prototype.updateSchema = function (schurl, doc, opts) {
	if (schurl && !this.connectionConfig.setSchemaURL(schurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(schurl, 'Update Schema'))
		);
	}
	doc = this.addOptionsToDocument(doc, opts);
	return this.dispatch(this.connectionConfig.schemaURL(), 'update_schema', doc);
};

/**
 * Creates a new document in the specified database
 *
 * The first (docurl) argument can be
 * 1) a valid URL of a terminus database (an id will be randomly assigned) or
 * 2) a valid URL or of a terminus document (the document will be given the passed URL) or
 * 3) a valid terminus document id (the current server and database will be used)
 * 4) can be omitted (the URL will be taken from the document if present)
 * The second argument (doc) is a valid document in json-ld
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.createDocument = function (docurl, doc, opts) {
	if (docurl && !this.connectionConfig.setDocument(docurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(docurl, 'Create Document'))
		);
	} if (
		doc
    && doc['@id']
    && !this.connectionConfig.setDocument(doc['@id'], doc['@context'])
	) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(doc['@id'], 'Create Document'))
		);
	}
	doc = this.addOptionsToDocument(
		this.makeDocumentConsistentWithURL(doc, this.connectionConfig.docURL()),
		opts
	);
	return this.dispatch(this.connectionConfig.docURL(), 'create_document', doc);
};

/**
 * Retrieves a document from the specified database
 *
 * The first (docurl) argument can be
 * 1) a valid URL of a terminus document or
 * 2) a valid ID of a terminus document in the current database
 * the second argument (opts) is an options json -
 * 		opts.key is an optional API key
 * 		opts.shape is frame | *document
 */
WOQLClient.prototype.getDocument = function (docurl, opts) {
	if (docurl && (!this.connectionConfig.setDocument(docurl) || !this.connectionConfig.docid)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(docurl, 'Get Document'))
		);
	}
	return this.dispatch(this.connectionConfig.docURL(), 'get_document', opts);
};

/**
 * Updates a document in the specified database with a new version
 *
 * The first (docurl) argument can be
 * 1) a valid URL of a terminus document or
 * 2) a valid ID of a terminus document in the current database or
 * 3) omitted in which case the id will be taken from the document @id field
 * the second argument (doc) is a document in json-ld format
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.updateDocument = function (docurl, doc, opts) {
	if (docurl && !this.connectionConfig.setDocument(docurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(docurl, 'Update Document'))
		);
	}
	if (doc && doc['@id']
    && !this.connectionConfig.setDocument(doc['@id'], doc['@context'])
	) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(doc['@id'], 'Update Document'))
		);
	}
	doc = this.addOptionsToDocument(
		this.makeDocumentConsistentWithURL(doc, this.connectionConfig.docURL()),
		opts
	);
	return this.dispatch(this.connectionConfig.docURL(), 'update_document', doc);
};

/**
 * Deletes a document from the specified database
 *
 * The first (docurl) argument can be
 * 1) a valid URL of a terminus document or
 * 2) a valid ID of a terminus document in the current database
 * 3) omitted - the current document will be used
 * the second argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.deleteDocument = function (docurl, opts) {
	if (docurl && (!this.connectionConfig.setDocument(docurl) || !this.connectionConfig.docid)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(docurl, 'Delete Document'))
		);
	}
	return this.dispatch(this.connectionConfig.docURL(), 'delete_document', opts);
};

/**
 * Executes a read-only WOQL query on the specified database and returns the results
 *
 * @param {string} qurl TerminusDB server URL or omitted (the current DB will be used)
 * @param {string} woql is a "woql query select statement"
 * @param {object} opts it can contents the API key (opts.key)
 *
 */
WOQLClient.prototype.select = function (qurl, woql, opts) {
	if (qurl && !this.connectionConfig.setQueryURL(qurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(qurl, 'Select'))
		);
	}
	const fileList = opts ? opts.fileList : {};
	let q = {'terminus:query' : JSON.stringify(woql), ...fileList};

	q = this.addOptionsToWOQL(q, opts);
	return this.dispatch(this.connectionConfig.queryURL(), CONST.WOQL_SELECT, q);
};

/**
 * Executes a WOQL query on the specified database which updates the state and returns the results
 *
 * The first (qurl) argument can be
 * 1) a valid URL of a terminus database or
 * 2) omitted - the current database will be used
 * the second argument (woql) is a woql select statement encoded as a string
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.update = function (qurl, woql, opts) {
	if (qurl && !this.connectionConfig.setQueryURL(qurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(qurl, 'Select'))
		);
	}
	const fileList = opts ? opts.fileList : {};

	//var formData = new FormData();
    //formData.set('file', file);
	
	let q = {'terminus:query' : JSON.stringify(woql), ...fileList};

	q = this.addOptionsToWOQL(q, opts);
	return this.dispatch(this.connectionConfig.queryURL(),  CONST.WOQL_SELECT, q);
};

/**
 * Retrieves a WOQL query on the specified database which updates the state and returns the results
 *
 * The first (cfurl) argument can be
 * 1) a valid URL of a terminus database or
 * 2) omitted - the current database will be used
 * the second argument (cls) is the URL / ID of a document class that exists in the database schema
 * the third argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.getClassFrame = function (cfurl, cls, opts) {
	if (cfurl && !this.connectionConfig.setClassFrameURL(cfurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(cfurl, 'Get Class Frame'))
		);
	}
	if (!opts) opts = {};
	opts['terminus:class'] = cls;
	return this.dispatch(this.connectionConfig.frameURL(), 'class_frame', opts);
};

/*
 * Utility functions for adding standard fields to API arguments
 */

 /**
  * Adds a key to the passed woql query if it is present in the opts json
  * 
  */
WOQLClient.prototype.addOptionsToWOQL = function (woql, opts) {
	if (opts && opts.key) {
		woql.key = opts.key;
	}
	return woql;
};


/**
 * Wrapws the passed json document in a valid TerminusDB update document API shell
 */
WOQLClient.prototype.addOptionsToDocument = function (doc, opts) {
	const pdoc = {};
	pdoc['@context'] = doc['@context'];
	// add blank node prefix as document base url
	if (pdoc['@context'] && doc['@id']) { 
		pdoc['@context']._ = `${doc['@id']}/`;
	}
	if (opts && opts['terminus:encoding'] && opts['terminus:encoding'] === 'terminus:turtle') {
		pdoc['terminus:turtle'] = doc;
		pdoc['terminus:schema'] = this.connectionConfig.schemaURL();
		delete pdoc['terminus:turtle']['@context'];
	} else {
		pdoc['terminus:document'] = doc;
		delete pdoc['terminus:document']['@context'];
	}
	pdoc['@type'] = 'terminus:APIUpdate';
	if (opts && opts['terminus:user_key']) {
		pdoc['terminus:user_key'] = opts['terminus:user_key'];
	}
	if (opts && opts.key) {
		pdoc['terminus:user_key'] = opts.key;
	}
	return pdoc;
};

/**
 * Adds an api key to the payload
 */
WOQLClient.prototype.addKeyToPayload = function (payload, url) {
	if (typeof payload !== 'object')payload = {};
	if (payload.key) {
		payload['terminus:user_key'] = payload.key;
		delete payload.key;
	} else if (this.connection.getClientKey()) {
		payload['terminus:user_key'] = this.connection.getClientKey();
	} else if (this.connection.getClientKey(url)) {
		payload['terminus:user_key'] = this.connection.getClientKey(url);
	}
	return payload;
};

/**
 * Document updates include the URL in both the endpoint and the document itself
 * This ensures that they are the same by using the endpoint URL as the authoritative version 
 * and copying it into the embedded document ID
 */
WOQLClient.prototype.makeDocumentConsistentWithURL = function (doc, dburl) {
	doc['@id'] = dburl;
	return doc;
};

/**
 * Common request dispatch function
 */
WOQLClient.prototype.dispatch = function (url, action, payload) {
	if (this.connectionConfig.includeKey()) {
		payload = this.addKeyToPayload(payload, url);
	}
	if (this.use_fetch) {
		return this.dispatchFetch(url, action, payload);
	}
	return DispatchRequest(url, action, payload);
};

/**
 * If the use_fetch switch is set, the browser's built in fetch will be used rather than the npm axios module 
 */
WOQLClient.prototype.dispatchFetch = function (url, action, payload) {
	const api = {
		//mode: 'cors',  no-cors, cors, *same-origin
		redirect: 'follow', // manual, *follow, error
		referrer: 'client', // no-referrer, *client
	};
	let hdrs = {};
	if (payload && payload['terminus:user_key']) {
		hdrs = { Authorization: `Basic ${btoa(`:${payload['terminus:user_key']}`)}` };
		delete (payload['terminus:user_key']);
	}
	// read only API calls - use GET
	switch (action) {
	case CONST.DELETE_DATABASE:
	case CONST.DELETE_DOCUMENT:
		if (Object.keys(payload).length > 0) url += `?${UTILS.URIEncodePayload(payload)}`;
		api.method = 'DELETE';
		api.cache = 'no-cache';
		break;
	case CONST.CREATE_DATABASE:
	case CONST.UPDATE_SCHEMA:
	case CONST.CREATE_DOCUMENT:
	case CONST.UPDATE_DOCUMENT:
	case CONST.WOQL_UPDATE:
		api.method = 'POST';
		api.cache = 'no-cache';
		hdrs['Content-Type'] = 'application/json';
		api.body = JSON.stringify(payload);
		break;
	case CONST.GET_SCHEMA:
	case CONST.CONNECT:
	case CONST.CLASS_FRAME:
	case CONST.WOQL_SELECT:
	case CONST.GET_DOCUMENT:
	default:
		api.method = 'GET';
		if (Object.keys(payload).length > 0) url += `?${UTILS.URIEncodePayload(payload)}`;
	}
	const self = this;
	if (Object.keys(hdrs).length > 0) {
		api.headers = new Headers(hdrs);
	}
	return fetch(url, api).then((response) => {
		if (self.return_full_response) return response;
		if (response.ok) {
			return response.json();
		}
		self.error = self.parseAPIError(response);
		return Promise.reject(new Error(self.getAPIErrorMessage(url, api, self.error)));
	});
};

module.exports = WOQLClient;
