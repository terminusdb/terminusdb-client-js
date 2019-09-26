var ConnectionCapabilities = require('../lib/connectionCapabilities'); 
var CONNECT_RESPONSE = require('./serverResponse/connectResponceForCapabilities');
var ConnectionConfig = require('../lib/connectionConfig');
var SnapCapabilitiesObj= require('./extraFile/connectionObj');
var expect = require('chai').expect;

describe('capabilities Actions', function () {

	const url='http://localhost:6363/';
    let connectionCapabilities;

	beforeEach(() => {
    	const connectionConfig = new ConnectionConfig({server:url})
		connectionCapabilities = new ConnectionCapabilities(connectionConfig,'root');

		connectionCapabilities.addConnection(url,CONNECT_RESPONSE);

  	});

	it('check connection capabilities Object', function(done){
		//console.log(JSON.stringify(connectionCapabilities.connection,null,2));

		expect(connectionCapabilities.connection[url].key).to
				.equal(SnapCapabilitiesObj[url].key)

		done();
	})

	it('check if server is connected', function(done){
		expect(connectionCapabilities.connectionConfig.server).to.equal(url);
		expect(connectionCapabilities.serverConnected()).to.equal(true);

		done();
	})
})