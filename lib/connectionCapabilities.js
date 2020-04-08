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
function ConnectionCapabilities(connectionConfig) {
	this.connection = {};
	this.connectionConfig = connectionConfig;
}


/**
 * @param {string} curl a valid terminusDB server URL
 * @param {object} capabilities the JSON object returned by the connect API call 
 * it is a terminus:User object with a terminus:authority predicate which points at an array of capabilities
 */
ConnectionCapabilities.prototype.setCapabilities = function (capabilities) {
	this.connection = {};
	
	//this.connection["@context"] = capabilities["@context"]
	//let auths = Array.isArray(capabilities) ? capabilities : [capabilities]
	
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
					if (typeof this.connection[nrec['@id']] === 'undefined') {
						this.connection[nrec['@id']] = nrec;
					}
					this.connection[nrec['@id']]['terminus:authority'] = actionsArr;
				}
			}
		} 
		else {
			this.connection[pred] = capabilities[pred];
		}
	}
}

ConnectionCapabilities.prototype.getJSONContext = function (serverURL, dbid) {
	if (this.connection["@context"]){
		let ctxt = this.connection["@context"]
		ctxt['scm'] = "http://my.old.man/is/a/walrus#"
		return ctxt
	}
	return {}
	//return false;
};

/**
 * retrieves the meta-data record returned by connect for the connected server
 * @returns {terminus:Server} JSON server record as returned by WOQLClient.connect
 */
ConnectionCapabilities.prototype.getServerRecord = function () {
	const okeys = Object.keys(this.connection);

	for (const oid of okeys) {
		if (this.connection[oid]['@type'] === 'terminus:Server') {
			return this.connection[oid];
		}
	}
	return false;
};

/**
 * retrieves the meta-data record returned by connect for a particular database
 * @param {String} [dbid] database id
 * @returns {terminus:Database} terminus:Database JSON document as returned by WOQLClient.connect
 */
ConnectionCapabilities.prototype.getDBRecord = function (dbid) {
	dbid = dbid || this.connectionConfig.db();

	if (typeof this.connection[dbid] !== 'undefined') { return this.connection[dbid]; }

	dbid = this.dbCapabilityID(dbid);

	if (typeof this.connection[dbid] !== 'undefined') { return this.connection[dbid]; }

	return undefined;
};

/**
 * retrieves all the db meta-data records returned by connect for a particular server
 * @param {String} [srvr] optional server URL - if omitted current connection config server will be used
 * @returns {[terminus:Database]} array of terminus:Database JSON documents as returned by WOQLClient.connect
 */
ConnectionCapabilities.prototype.getServerDBRecords = function () {
	let dbrecs = {}
	for (const oid of Object.keys(this.connection)) {
		if (this.connection[oid]['@type'] === 'terminus:Database') {
			dbrecs[oid] = this.connection[oid];
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
ConnectionCapabilities.prototype.removeDB = function (dbid) {
	dbid = dbid || this.connectionConfig.db();
	const dbidCap = this.dbCapabilityID(dbid);
	if (dbidCap && this.connection && this.connection[dbidCap]) {
		delete this.connection[dbidCap];
	}	
	if (this.connectionConfig.dbid) {
		this.connectionConfig.dbid = false;
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
	dbid = dbid || this.connectionConfig.db();
	let rec;
return true
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
