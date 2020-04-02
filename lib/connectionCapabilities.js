const CONST = require('./const.js');
const ErrorMessage = require('./errorMessage');

/**
 * @file Connection Capabilities 
 * @license Apache Version 2
 * @description Object which helps manage the capabilities available for a given TerminusDB connection 
 * Creates an entry in the connection registry for the server
 * and all the databases that the client has access to
 * maps the input authorties to a per-db array for internal storage and easy
 * access control checks
 * @param {connectionConfig} connectionConfig connectionConfig object containing the connection parameters 
 * @param {String} key API key
 */
function ConnectionCapabilities(connectionConfig, key) {
	this.connection = {};
	this.connectionConfig = connectionConfig;
	if (this.connectionConfig.server && key) {
		this.setClientKey(this.connectionConfig.server, key);
	}
}

/**
 * Retrieves the API key for the given TerminusDB Server
 * @param {String} serverURL optional - URL of TerminusDB - if ommited the current server URL is used
 */
ConnectionCapabilities.prototype.getClientKey = function (serverURL) {
	if (!serverURL) serverURL = this.connectionConfig.serverURL();
	if (serverURL && this.connection[serverURL]) return this.connection[serverURL].key;
	return false;
};


/*
 * Utility functions for changing the state of connections with Terminus servers
 */

/**
 * sets the api key for the given url
 * @param {String} curl a valid terminusDB server URL
 * @param {String} key an optional API key
 */
ConnectionCapabilities.prototype.setClientKey = function (curl, key) {
	if (typeof key === 'string' && key.trim()) {
		if (typeof this.connection[curl] === 'undefined') {
			this.connection[curl] = {};
		}
		this.connection[curl].key = key.trim();
	}
};


/**
 * @param {string} curl a valid terminusDB server URL
 * @param {object} capabilities the JSON object returned by the connect API call 
 */
ConnectionCapabilities.prototype.addConnection = function (curl, capabilities) {
	if (typeof this.connection[curl] === 'undefined') {
		this.connection[curl] = {};
	}
	const capabilitiesKeys = capabilities ? Object.keys(capabilities) : [];

	for (const pred of capabilitiesKeys) {
	    if (pred === 'terminus:authority' && capabilities[pred]) {
	      const auths = Array.isArray(capabilities[pred]) === true
	        ? capabilities[pred]
	        : [capabilities[pred]];

	      for (let i = 0; i < auths.length; i += 1) {
	        let scope = auths[i]['terminus:authority_scope'];
	        const actions = auths[i]['terminus:action'];

			if (Array.isArray(scope) === false) scope = [scope];
			const actionsArr = ((Array.isArray(actions)) ? actions.map(item => item['@id']) : [] );
	        for (let j = 0; j < scope.length; j += 1) {
	          const nrec = scope[j];
	          if (typeof this.connection[curl][nrec['@id']] === 'undefined') {
	            this.connection[curl][nrec['@id']] = nrec;
	          }
			  this.connection[curl][nrec['@id']]['terminus:authority'] = actionsArr;
	        }
	      }
	    } else {
	      this.connection[curl][pred] = capabilities[pred];
	    }
	}
};

ConnectionCapabilities.prototype.getJSONContext = function (serverURL, dbid) {
	if (!serverURL) serverURL = this.connectionConfig.serverURL();
	if (!dbid) dbid = this.connectionConfig.dbid;
	if (serverURL && this.connection[serverURL] && this.connection[serverURL]["@context"]){
		let con = this.connection[serverURL]["@context"];
		var ncon = {};
		let db = con.doc.substring(0, (con.doc.length - "terminus/document/".length)) + dbid + "/";
		var ncon = { doc : db + "document/", scm: db + "schema#", db: db};
		for(var k in con){
			if(typeof ncon[k] == "undefined") ncon[k] = con[k];
		}
		return ncon;
	}
	let def = {
		rdf: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		rdfs: "http://www.w3.org/2000/01/rdf-schema#", 
		xsd: "http://www.w3.org/2001/XMLSchema#",
		owl: "http://www.w3.org/2002/07/owl#",
		xdd: "http://terminusdb.com/schema/xdd#",
		terminus: "http://terminusdb.com/schema/terminus#",
		woql: "http://terminusdb.com/schema/woql#",
		doc: "http://terminusdb.com/data/" + dbid + "/",
		scm: "http://terminusdb.com/schema/" + dbid + "#"
	}
	return def;
	//return false;
};


/**
 * returns true if the client is currently connected to a server
 * @returns {Boolean}
 */
ConnectionCapabilities.prototype.serverConnected = function () {
	return typeof this.connection[this.connectionConfig.server] !== 'undefined';
};


/**
 * retrieves the meta-data record returned by connect for a particular server
 * @param {String} [srvr] optional server URL - if omitted current connection config will be used
 * @returns {terminus:Server} JSON server record as returned by WOQLClient.connect
 */
ConnectionCapabilities.prototype.getServerRecord = function (srvr) {
	const url = (srvr || this.connectionConfig.server);
	const connectionObj = this.connection[url] || {};
	const okeys = Object.keys(connectionObj);

	for (const oid of okeys) {
		if (this.connection[url][oid]['@type'] === 'terminus:Server') {
			return this.connection[url][oid];
		}
	}
	return false;
};

/**
 * retrieves the meta-data record returned by connect for a particular database
 * @param {String} [dbid] optional database id - if omitted current connection config db will be used
 * @param {String} [srvr] optional server URL - if omitted current connection config server will be used
 * @returns {terminus:Database} terminus:Database JSON document as returned by WOQLClient.connect
 */
ConnectionCapabilities.prototype.getDBRecord = function (dbid, srvr) {
	const url = (srvr || this.connectionConfig.server);
	dbid = (dbid || this.connectionConfig.dbid);
	if (typeof this.connection[url] !== 'object') {
		return false;
	}
	if (typeof this.connection[url][dbid] !== 'undefined') { return this.connection[url][dbid]; }

	dbid = this.dbCapabilityID(dbid);

	if (typeof this.connection[url][dbid] !== 'undefined') { return this.connection[url][dbid]; }

	return undefined;
};

/**
 * retrieves all the db meta-data records returned by connect for a particular server
 * @param {String} [srvr] optional server URL - if omitted current connection config server will be used
 * @returns {[terminus:Database]} array of terminus:Database JSON documents as returned by WOQLClient.connect
 */
ConnectionCapabilities.prototype.getServerDBRecords = function (srvr) {
	const url = (srvr || this.connectionConfig.server);
	const dbrecs = {};
	const connectionObj = this.connection[url] || {};

	for (const oid of Object.keys(connectionObj)) {
		if (this.connection[url][oid]['@type'] === 'terminus:Database') {
			dbrecs[oid] = this.connection[url][oid];
		}
	}
	return dbrecs;
};

/**
 * removes a database record from the connection registry (after deletion, for example)
 * @param {String} [dbid] optional DB ID - if omitted current connection config db will be used
 * @param {String} [srvr] optional server URL - if omitted current connection config server will be used
 * @returns {[terminus:Database]} array of terminus:Database JSON documents as returned by WOQLClient.connect
 */
ConnectionCapabilities.prototype.removeDB = function (dbid, srvr) {
	dbid = dbid || this.connectionConfig.dbid;

	if (dbid && this.connectionConfig.dbid && this.connectionConfig.dbid === dbid) {
		this.connectionConfig.dbid = false;
	}

	const url = srvr || this.connectionConfig.server;
	const dbidCap = this.dbCapabilityID(dbid);
	if (dbidCap && this.connection[url] && this.connection[url][dbidCap]) {
		delete this.connection[url][dbidCap];
	}	
};

/**
 * @param {String} dbid local id of database
 * @returns {String} the id of the terminus:Document describing the DB
 * Generates the ID of the terminus:Database document from the database ID
 */
ConnectionCapabilities.prototype.dbCapabilityID = function (dbid) {
	return `doc:${dbid}`;
};

/**
 * @param {String} action - the action that will be carried out
 * @param {String} [dbid] optional DB ID - if omitted current connection config db will be used
 * @param {String} [srvr] optional server URL - if omitted current connection config server will be used
 * @returns {Boolean} true if the client's capabilities allow the action on the given server / db
 * supports client side access control checks (in addition to server side)
 */
ConnectionCapabilities.prototype.capabilitiesPermit = function (action, dbid, server) {
	server = server || this.connectionConfig.server;
	dbid = dbid || this.connectionConfig.dbid;

	let rec;

	if (action === CONST.CREATE_DATABASE) {
		rec = this.getServerRecord(server);
	} else if (dbid) rec = this.getDBRecord(dbid);
	else console.log('no dbid provided in capabilities check ', server, dbid);
	if (rec) {
		const auths = rec['terminus:authority'];
		if (auths && auths.indexOf(`terminus:${action}`) !== -1) return true;
	} else {
		console.log('No record found for connection: ', this.connection, action, server, dbid);
	}
	this.error = ErrorMessage.accessDenied(action, dbid, server);
	return false;
};


module.exports = ConnectionCapabilities;
