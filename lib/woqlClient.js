
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
 * @param  {string} [branchid] Optional Branch to connect to by default
 * @return {Promise}
 * @public
 */
WOQLClient.prototype.connect = function (curl, key, dbid, branchid) {
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
	return this.dispatch(CONST.CONNECT)
	.then((response) => {
	    if(dbid) this.db(dbid, branchid);
	    this.connection.addConnection(serverURL, response);
	    return response;
	});
};

/**
 * Create a Terminus Database by posting
 * a terminus:Database document to the Terminus API
 * a mandatory rdfs:label field and an optional rdfs:comment field.
 * an optional terminus:default_branch_id
 * an optional set of terminus:
 * The key argument contains an optional API key (terminus:user_key)
 *
 * @param {object} details - a terminus:Database document
 * @param {string} key
 * @return {Promise}
 * @public
 */
WOQLClient.prototype.createDatabase = function (details, key) {
	if(details && details['@id']){
		dbid = details['@id'];
		details = this.setDatabaseDefaults(details);
		branchid = details['terminus:default_branch_id']["@value"];
		this.db(dbid, branchid);
		const opts = {};
		if (key) {
			opts.key = key;
		}
		const doc = this.wrapDocumentForAPI(details, opts);
		return this.dispatch(CONST.CREATE_DATABASE, doc);
	}
	else {
		let errmsg = "Create database parameter error - you should provide a terminus:Database document with an @id field";
		return Promise.reject(
			new Error(ErrorMessage.getInvalidParametersMessage(CONST.CREATE_DATABASE, errmsg))
		);
	}
};

/**
 * Delete a Database (must first be connected to db)
 * @param {String} key an optional API key
 * @return {Promise}
 *
 * if dburl is omitted, the current server and database will be used
 */
WOQLClient.prototype.deleteDatabase = function (key) {

	const dbid = this.connectionConfig.dbid
	const opts = {};

	if (key) {
		opts.key = key;
	}

	const self = this;
	return this.dispatch(CONST.DELETE_DATABASE, opts).then(
		(response) => {
			self.connection.removeDB(dbid);
			return response;
		}
	);
};

/**
 * Retrieves the schema of the specified database
 *
 * @param {object} opts is an options object
 * @param {string} [sgid] TerminusDB Graph ID or omitted
 * @return {Promise}
 *
 * opts.format is optional and defines which format is requested (*json / turtle)
 * opts.key is an optional API key
 */
WOQLClient.prototype.getSchema = function (opts, sgid) {
	return this.dispatch(CONST.GET_SCHEMA, opts, sgid);
};

/**
 * Updates the Schema of the specified database
 *
 * @param {object} doc is a valid owl ontology in json-ld or turtle format
 * @param {object} opts is an options object
 * @param {string} [sgid] TerminusDB Graph ID or omitted
 * @return {Promise}
 *
 * opts.format is used to specify which format is being used (*json / turtle)
 * opts.key is an optional API key
 */
WOQLClient.prototype.updateSchema = function (doc, opts, sgid) {
	doc = this.wrapDocumentForAPI(doc, opts);
	return this.dispatch(CONST.UPDATE_SCHEMA, doc, sgid);
};

/**
 * Creates a new document in the specified database
 *
 * The first argument (doc) is a valid document in json-ld
 * the second argument (opts) is an options json - opts.key is an optional API key
 *
 * @param {object}  doc - a valid document in json-ld conforming to db schema
 * @param {object} opts - an option document (opts.format, opts.key)
 */
WOQLClient.prototype.createDocument = function (doc, opts, igid) {
	doc = this.wrapDocumentForAPI(doc, opts);
	return this.dispatch(CONST.UPDATE_SCHEMA, doc, igid);
};

/**
 * Retrieves a document from the specified database
 *
 * The first (docurl) argument can be
 * 1) a valid URL of a terminus document or
 * 2) a valid ID of a terminus document in the current database
 * the second argument (opts) is an options json -
 * 		opts.key is an optional API key
 * 		opts.shape is frame | *documentd
 */
WOQLClient.prototype.getDocument = function (docurl, opts) {
	if (docurl && (!this.connectionConfig.setDocument(docurl) || !this.connectionConfig.docid)){
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(docurl, 'Get Document'))
		);
	}
	return this.dispatch(CONST.GET_DOCUMENT, opts);
};

/**
 * Updates a document in the specified database with a new version
 *
 * the first argument (doc) is a document in json-ld format
 * the second argument (opts) is an options json - opts.key is an optional API key
 */
WOQLClient.prototype.updateDocument = function (doc, opts) {
	if (doc && doc['@id'] && !this.connectionConfig.setDocument(doc['@id'], doc['@context'])){
		return Promise.reject(
			new URIError(ErrorMessage.getInvalidURIMessage(doc['@id'], 'Update Document'))
		);
	}
	if(doc && doc['@id']){
		doc = this.wrapDocumentForAPI(doc, opts);
		return this.dispatch(this.connectionConfig.docURL(), 'update_document', doc);
	}
	let errmsg = "Create database parameter error - you should provide a JSON LD document with an @id field";
	return Promise.reject(
		new Error(ErrorMessage.getInvalidParametersMessage(CONST.UPDATE_DOCUMENT, errmsg))
	);

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
	return this.dispatch(CONST.DELETE_DOCUMENT, opts);
};

/**
 * Executes a WOQL query on the specified database and returns the results
 *
 * @param {string} woql is a "woql query select statement"
 * @param {object} opts it can contents the API key (opts.key)
 *
 */
WOQLClient.prototype.query = function (woql, opts, refid) {
	let q = { 'terminus:query': JSON.stringify(woql) };
	q = this.addOptionsToWOQL(q, opts);
	return this.dispatch(CONST.WOQL_QUERY, q, refid);
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
WOQLClient.prototype.getClassFrame = function (cls, opts) {
	if (!opts) opts = {};
	opts['terminus:class'] = cls;
	return this.dispatch(CONST.CLASS_FRAME, opts);
};

WOQLClient.prototype.clone = function (doc, opts) {
	doc = this.wrapDocumentForAPI(doc, opts);
	return this.dispatch(CONST.CLONE, doc);
};

WOQLClient.prototype.fetch = function (doc, opts) {
	doc = this.wrapDocumentForAPI(doc, opts);
	return this.dispatch(CONST.FETCH, doc);
};

WOQLClient.prototype.rebase = function (doc, opts) {
	doc = this.wrapDocumentForAPI(doc, opts);
	return this.dispatch(CONST.REBASE, doc);
};

WOQLClient.prototype.push = function (doc, opts) {
	doc = this.wrapDocumentForAPI(doc, opts);
	return this.dispatch(CONST.PUSH, doc);
};

WOQLClient.prototype.branch = function (doc, opts) {
	doc = this.wrapDocumentForAPI(doc, opts);
	return this.dispatch(CONST.PUSH, doc);
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


WOQLClient.prototype.setDatabaseDefaults = function(dbdoc){
	if(!dbdoc['terminus:default_branch_id']){
		dbdoc['terminus:default_branch_id'] = {"@value": "main", "@type": "xsd:string"}
	}
	return dbdoc;
}

/**
 * Wrapws the passed json document in a valid TerminusDB update document API shell
 */
WOQLClient.prototype.wrapDocumentForAPI = function (doc, opts) {
	const pdoc = {};
	pdoc['@context'] = doc['@context'];
	// add blank node prefix as document base url
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
WOQLClient.prototype.server = function (serverURL, dbid, branchid) {
	if(serverURL){
		this.connectionConfig.setServer(serverURL)
		if(dbid) this.connectionConfig.setDB(dbid)
		if(branchid) this.connectionConfig.setBranch(branchid)
	}
	return this.connectionConfig.serverURL()
};

WOQLClient.prototype.db = function (dbid, branchid) {
	if(dbid){
		this.connectionConfig.setDB(dbid)
		if(branchid) this.connectionConfig.setBranch(branchid)
	}
	return this.connectionConfig.db()
};

WOQLClient.prototype.checkout = function (branchid) {
	if(branchid){
		this.connectionConfig.setBranch(branchid)
	}
	return this.connectionConfig.branch()
};


WOQLClient.prototype.getActionURL = function(action, extra) {
	if(action == CONST.CREATE_DATABASE || action == CONST.CONNECT){
		return this.server();
	}
	if(action == CONST.DELETE_DATABASE){
		return this.server() + encodeURIComponent(this.db());
	}
	if(action == CONST.GET_SCHEMA || action == CONST.UPDATE_SCHEMA){
		return this.server() + encodeURIComponent(this.db()) + "/schema";
		//return this.server() + "schema/" + encodeURIComponent(this.db()) + "/" + encodeURIComponent(this.checkout()) + (extra ? "/" + encodeURIComponent(extra) : "");
	}
	if(action == CONST.CREATE_DOCUMENT || action == CONST.UPDATE_DOCUMENT ||
		action == CONST.GET_DOCUMENT || action == CONST.DELETE_DOCUMENT) {
		let durl = this.server() + encodeURIComponent(this.db()) + "/document";
		if(action == CONST.GET_DOCUMENT || action == CONST.DELETE_DOCUMENT){
			durl += "/" + encodeURIComponent(this.connectionConfig.docid)
		}
		return durl;
		//return this.server() + "document/" + encodeURIComponent(this.db()) + "/" + encodeURIComponent(this.checkout()) + (extra ? "/" + encodeURIComponent(extra) : "");
	}
	if(action == CONST.CLASS_FRAME){
		//return this.server() + "frame/" + encodeURIComponent(this.db()) + "/" + encodeURIComponent(this.checkout())
		return this.server() + encodeURIComponent(this.db()) + "/class_frame"
	}
	if(action == CONST.CLONE){
		return this.server() + "clone" + (extra ? "/" + encodeURIComponent(extra) : "");
	}
	if(action == CONST.PUSH){
		return this.server() + "push/" + encodeURIComponent(this.db());
	}
	if(action == CONST.WOQL_QUERY){
		return this.server() + encodeURIComponent(this.db()) + "/woql"
		//return this.server() + "query/" + encodeURIComponent(this.db())  + "/" + encodeURIComponent(this.checkout());
	}
	if(action == CONST.FETCH){
		return this.server() + "fetch/" + encodeURIComponent(this.db());
	}
	if(action == CONST.REBASE){
		return this.server() + "rebase/" + encodeURIComponent(this.db()) + "/" + encodeURIComponent(this.checkout())		;
	}
	if(action == CONST.BRANCH){
		return this.server() + "branch/" + encodeURIComponent(this.db()) + "/" + encodeURIComponent(this.checkout())		;
	}
}

/**
 * Common request dispatch function
 */
WOQLClient.prototype.dispatch = function (action, payload, extra) {
	server_url = this.server();
	if (this.connectionConfig.includeKey()) {
		payload = this.addKeyToPayload(payload, server_url);
	}
	api_url = this.getActionURL(action, extra);
	return DispatchRequest(api_url, action, payload);
};



module.exports = WOQLClient;
