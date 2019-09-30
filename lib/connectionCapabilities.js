const UTILS = require('./utils.js');
const CONST = require('./const.js');
const ErrorMessage = require('./errorMessage');
/*
 * Creates an entry in the connection registry for the server
 * and all the databases that the client has access to
 * maps the input authorties to a per-db array for internal storage and easy
 * access control checks
 * {doc:dbid => {terminus:authority =>
 * [terminus:woql_select, terminus:create_document, auth3, ...]}}
 *
 */

function ConnectionCapabilities(connectionConfig, key) {
	this.connection = {};
	this.connectionConfig = connectionConfig;
	if (this.connectionConfig.server && key) {
		this.setClientKey(this.connectionConfig.server, key);
	}
}

ConnectionCapabilities.prototype.getClientKey = function (serverURL) {
	if (!serverURL) serverURL = this.connectionConfig.serverURL();
	if (serverURL && this.connection[serverURL]) return this.connection[serverURL].key;
	return false;
};


/*
 * Utility functions for changing the state of connections with Terminus servers
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
 * @params {string} curl a valid terminusDB server URL
 * @params {object} capabilities it is the connect call response
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
	        const actionsArr = UTILS.authorityActionsToArr(actions);

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

ConnectionCapabilities.prototype.serverConnected = function () {
	return typeof this.connection[this.connectionConfig.server] !== 'undefined';
};

ConnectionCapabilities.prototype.capabilitiesPermit = function (action, dbid, server) {
	if (!this.connectionConfig.connectionMode()
         || this.connectionConfig.client_checks_capabilities !== true
         || action === CONST.CONNECT) { return true; }

	server = server || this.connectionConfig.server;
	dbid = dbid || this.connectionConfig.dbid;

	let rec;

	if (action === CONST.CREATE_DATABASE) {
		rec = this.getServerRecord(server);
	} else {
		if(dbid) rec = this.getDBRecord(dbid);
		else console.log("no dbid", server, dbid);
	}
	if (rec) {
		const auths = rec['terminus:authority'];
		if (auths && auths.indexOf(`terminus:${action}`) !== -1) return true;
	} else {
		console.log('problem with ', this.connection, action, server, dbid);
	}
	this.error = ErrorMessage.accessDenied(action, dbid, server);
	return false;
};

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

/*
 * removes a database record from the connection registry (after deletion, for example)
 */
ConnectionCapabilities.prototype.removeDB = function (dbid, srvr) {
	dbid = dbid || this.connectionConfig.dbid;

	if (dbid && this.connectionConfig.dbid && this.connectionConfig.dbid === dbid) {
		this.connectionConfig.dbid = false;
	}

	const url = srvr || this.connectionConfig.server;
	const dbidCap = this.dbCapabilityID(dbid);
	if(dbidCap && this.connection[url] && this.connection[url][dbidCap]){
		delete this.connection[url][dbidCap];
	}
};


ConnectionCapabilities.prototype.dbCapabilityID = function (dbid) {
	return `doc:${dbid}`;
};

ConnectionCapabilities.prototype.getDBRecord = function (dbid, srvr) {
	const url = srvr || this.connectionConfig.server;
	dbid = dbid || this.connectionConfig.dbid;
	if (typeof this.connection[url] !== 'object') {
		return false;
	}
	if (typeof this.connection[url][dbid] !== 'undefined') { return this.connection[url][dbid]; }

	dbid = this.dbCapabilityID(dbid);

	if (typeof this.connection[url][dbid] !== 'undefined') { return this.connection[url][dbid]; }

	return undefined;
};

module.exports = ConnectionCapabilities;
