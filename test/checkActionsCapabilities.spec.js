const ConnectionCapabilities = require('../lib/connectionCapabilities'); 
const connect_response = require('./serverResponse/connectResponseForCapabilities');
const snapCapabilitiesObj= require('./extraFile/connectionObj');
const expect = require('chai').expect;
const serverRecordsFromCap = require('./extraFile/serverRecordsFromCap');

describe('capabilities Actions', function () {
	const url='http://localhost:6363/';
    
	const connectionCapabilities = new ConnectionCapabilities();
	connectionCapabilities.setCapabilities(connect_response)
  	
	it('check connection capabilities Object', function(){
		expect(connectionCapabilities.connection).to.eql(snapCapabilitiesObj);
	})

	it('check formResourceName method', function(){
		expect(connectionCapabilities.formResourceName('TEST','admin')).to.equal("admin|TEST");
	})

	it('check formResourceName method', function(){
		expect(connectionCapabilities.findResourceDocumentID('TEST','admin')).to.equal("doc:Database%5fadmin%7CTEST");	
	})

	it('check getServerRecord method', function(){
		//console.log(JSON.stringify(connectionCapabilities.getServerRecord(), null, 4));
		expect(connectionCapabilities.getServerRecord()).to.eql(serverRecordsFromCap);	
	})

	it('check getJSONContext method', function(){
		const jsonContext={"doc": "terminus:///terminus/document/",
						    "layer": "http://terminusdb.com/schema/layer#",
						    "owl": "http://www.w3.org/2002/07/owl#",
						    "rdf": "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
						    "rdfs": "http://www.w3.org/2000/01/rdf-schema#",
						    "ref": "http://terminusdb.com/schema/ref#",
						    "repo": "http://terminusdb.com/schema/repository#",
						    "terminus": "http://terminusdb.com/schema/terminus#",
						    "vio": "http://terminusdb.com/schema/vio#",
						    "woql": "http://terminusdb.com/schema/woql#",
						    "xdd": "http://terminusdb.com/schema/xdd#",
						    "xsd": "http://www.w3.org/2001/XMLSchema#",
						    "scm": "http://my.old.man/is/a/walrus#"
						};
		expect(connectionCapabilities.getJSONContext()).to.eql(jsonContext);
		//console.log(JSON.stringify(connectionCapabilities.getJSONContext('TEST'), null, 4));	
	})
})