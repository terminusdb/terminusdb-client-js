
const CONST = require('./const');
const DispatchRequest = require('./dispatchRequest');
const ErrorMessage = require('./errorMessage');
const ConnectionCapabilities = require('./connectionCapabilities');
const ConnectionConfig = require('./connectionConfig');
/**
 * @file Javascript WOQL client object
 * @license Apache Version 2
 * @summary Simple Javascript Client for accessing the Terminus DB API
 */

/**
  * @param {Object} params
  */
function WOQLClient(params) {
	// current connection context variables
	const key = params ? params.key : undefined;
	this.connectionConfig = new ConnectionConfig(params);
	this.connection = new ConnectionCapabilities(this.connectionConfig, key);
}

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
 * @param  {string} API  key
 * @return {Promise}
 * @public
 */
WOQLClient.prototype.connect = function (curl, key) {
	if (curl && !this.connectionConfig.setServer(curl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(curl, CONST.CONNECT))
		);
	}
	const serverURL = this.connectionConfig.serverURL();

	if (key) {
		this.connection.setClientKey(serverURL, key);
	}
	const self = this;
	return this.dispatch(serverURL, CONST.CONNECT).then((response) => {
		self.connection.addConnection(serverURL, response);
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
	} if (
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
 * @param {string} dburl it is a terminusDB Url or a terminusDB Id
 * @param {object} opts no options are currently supported for this function
 * @return {Promise}
 *
 * if dburl is omitted, the current server and database will be used
 */
WOQLClient.prototype.deleteDatabase = function (dburl, opts) {
	if (dburl && !this.connectionConfig.setDB(dburl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(dburl, 'Delete Database'))
		);
	}
	const self = this;
	return this.dispatch(`${this.connectionConfig.dbURL()}/`, CONST.DELETE_DATABASE, opts).then(
		(response) => {
			self.connection.removeDB();
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
	if (schurl && this.connectionConfig.setSchemaURL(schurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(schurl, 'Get Schema'))
		);
	}
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
	if (schurl && this.connectionConfig.setSchemaURL(schurl)) {
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
		this.makeDocumentConsistentWithURL(docurl, doc),
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
	} if (doc
    && doc['@id']
    && !this.connectionConfig.setDocument(doc['@id'], doc['@context'])
	) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(doc['@id'], 'Update Document'))
		);
	}
	doc = this.addOptionsToDocument(
		this.makeDocumentConsistentWithURL(docurl, doc),
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
 * The first (qurl) argument can be
 * 1) a valid URL of a terminus database or
 * 2) omitted - the current database will be used
 * the second argument (woql) is a woql select statement encoded as a string
 * the third argument (opts) is an options json - opts.key is an API key
 */
WOQLClient.prototype.select = function (qurl, woql, opts) {
	if (qurl && this.connectionConfig.setQueryURL(qurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(qurl, 'Select'))
		);
	}
	let q = { query: woql };
	q = this.addOptionsToWOQL(q, opts);
	return this.dispatch(this.connectionConfig.queryURL(), 'woql_select', q);
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
	if (qurl && this.connectionConfig.setQueryURL(qurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(qurl, 'Update'))
		);
	}
	woql = this.addOptionsToWOQL(woql, opts);
	return this.dispatch(this.connectionConfig.queryURL(), 'woql_update', woql);
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
	if (cfurl && this.connectionConfig.setClassFrameURL(cfurl)) {
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(cfurl, 'Get Class Frame'))
		);
	}
	if (!opts) opts = {};
	opts.class = cls;
	return this.dispatch(this.connectionConfig.frameURL(), 'class_frame', opts);
};

/*
 * Utility functions for adding standard fields to API arguments
 */
WOQLClient.prototype.addOptionsToWOQL = function (woql, opts) {
	if (opts && opts.key) {
		woql.key = opts.key;
	}
	return woql;
};

WOQLClient.prototype.addOptionsToDocument = function (doc, opts) {
	const pdoc = { 'terminus:document': doc };
	pdoc['@context'] = doc['@context'];
	delete pdoc['terminus:document']['@context'];
	pdoc['@type'] = 'terminus:APIUpdate';
	if (opts && opts.key) {
		pdoc.key = opts.key;
	}
	return pdoc;
};

WOQLClient.prototype.addKeyToPayload = function (payload) {
	if (payload && payload.key) {
		payload['terminus:user_key'] = payload.key;
		delete payload.key;
	} else if (this.connection[this.server] && this.connection[this.server].key) {
		if (!payload) payload = {};
		payload['terminus:user_key'] = this.connection[this.server].key;
	}
	return payload;
};

WOQLClient.prototype.makeDocumentConsistentWithURL = function (doc, dburl) {
	doc['@id'] = dburl;
	return doc;
};

WOQLClient.prototype.dispatch = function (url, action, payload) {
	if (action !== CONST.CONNECT
         && this.connectionConfig.connectionMode()
         && !this.connection.serverConnected(this.server)) {
		console.log('CONNECT CALL AGAIN');
		const key = payload && payload.key ? payload.key : false;
		const self = this;

		return this.connect(this.server, key).then((response) => {
			if (key) delete payload.key;
			self.dispatch(url, action, payload);
			return response;
		});
	}
	if (!this.connection.capabilitiesPermit(action)) {
		return Promise.reject(
			new Error(ErrorMessage.getAccessDeniedMessage(url, action, this.connection.error))
		);
	}
	if (this.connectionConfig.includeKey()) {
		payload = this.addKeyToPayload(payload);
	}

	return new DispatchRequest(url, action, payload);
};

module.exports = WOQLClient;
