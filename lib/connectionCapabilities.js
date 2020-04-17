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
 * @param {String} key API key
 */
function ConnectionCapabilities() {
	this.connection = {};
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

ConnectionCapabilities.prototype.findResourceDocumentID = function(dbid, account){
	let testrn = this.formResourceName(dbid, account)
	for (const pred of Object.keys(this.connection)) {
		let rec = this.connection[pred]
		if(rec['terminus:resource_name'] && rec['terminus:resource_name']['@value'] && rec['terminus:resource_name']['@value'] === testrn){
			return pred
		}		
	}
	return false
}

ConnectionCapabilities.prototype.formResourceName = function(dbid, account){
	if(dbid == "terminus") return "terminus"
	return `${account}|${dbid}`
}


ConnectionCapabilities.prototype.getJSONContext = function (dbid) {
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
ConnectionCapabilities.prototype.getDBRecord = function (dbid, account) {
	let docid = this.findResourceDocumentID(dbid, account)
	
	if(docid){
		return this.connection[docid];
	}
	return undefined;
};

ConnectionCapabilities.prototype.getDBMetadata = function (dbid, account) {
	let dbrec = this.getDBRecord(dbid, account)
	if(dbrec) return this.extractMetadata(dbrec)
	return false
}

/**
 * Transforms a raw server db record into a friendly json with db, account, title, description fields
 */
ConnectionCapabilities.prototype.extractMetadata = function(dbrec){
	let meta = {
		db: "",
		account: "",
		title: "",
		description: ""
	}
	if(dbrec['terminus:resource_name'] && dbrec['terminus:resource_name']['@value']){
		let rn = dbrec['terminus:resource_name']['@value']
		if(rn == "terminus") meta.db = rn
		else if(rn) {
			let bits = rn.split("|")
			if(bits.length == 1) meta.db = rn
			else {
				meta.account = bits[0]
				meta.db = bits[1]
			}
		}
	}
	if(dbrec['rdfs:label']){
		//take last label if there are many
		let l = Array.isArray(dbrec['rdfs:label']) ? dbrec['rdfs:label'][0] : dbrec['rdfs:label']
		if(l && l["@value"]) meta.title = l["@value"]
	}
	if(!meta.title) meta.title = meta.db
	if(dbrec['rdfs:comment']){
		//take last label if there are many
		let l = Array.isArray(dbrec['rdfs:comment']) ? dbrec['rdfs:comment'][0] : dbrec['rdfs:comment']
		if(l && l["@value"]) meta.description = l["@value"]
	}
	return meta
}

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

ConnectionCapabilities.prototype.getServerDBMetadata = function () {
	let dbrecs = this.getServerDBRecords()
	let metas = []
	for (const oid of Object.keys(dbrecs)) {
		let met = this.extractMetadata(dbrecs[oid])
		if(met) metas.push(met)
	}
	return metas
}

/**
 * removes a database record from the connection registry (after deletion, for example)
 * @param {String} [dbid] optional DB ID - if omitted current connection config db will be used
 * @param {String} [srvr] optional server URL - if omitted current connection config server will be used
 * @returns {[terminus:Database]} array of terminus:Database JSON documents as returned by WOQLClient.connect
 */
ConnectionCapabilities.prototype.removeDB = function (dbid, account) {
	let docid = this.findResourceDocumentID(dbid, account)
	if(docid){
		delete this.connection[docid];
	}
};

/**
 * @param {String} action - the action that will be carried out
 * @param {String} [dbid] optional DB ID - if omitted current connection config db will be used
 * @param {String} [srvr] optional server URL - if omitted current connection config server will be used
 * @returns {Boolean} true if the client's capabilities allow the action on the given server / db
 * supports client side access control checks (in addition to server side)
 */
ConnectionCapabilities.prototype.capabilitiesPermit = function (action, dbid, account) {
	let rec;
//return true
	if (action === CONST.CREATE_DATABASE) {
		rec = this.getServerRecord();
	} else if (dbid) rec = this.getDBRecord(dbid, account);
	else console.log('no dbid provided in capabilities check ', dbid, account);
	if (rec) {
		const auths = rec['terminus:authority'];
		if (auths && auths.indexOf(`terminus:${action}`) !== -1) return true;
	} else {
		console.log('No record found for connection: ', action, dbid, account, this.connection);
	}
	this.error = ErrorMessage.accessDenied(action, dbid, account);
	return false;
};


module.exports = ConnectionCapabilities;
