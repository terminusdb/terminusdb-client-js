'use strict'
const axios = require("axios");
const expect = require('chai').expect;
const sinon = require('sinon');
const WOQLClient = require('../lib/woqlClient'); 
const CONNECT_RESPONSE = require('./serverResponse/connectResponse');

before(function(done) {
	console.log('before all test');
	global.url  = 'http://localhost:6363/';
	var key='root';
	global.sandbox = sinon.createSandbox();
	global.sandbox.stub(axios, "get").returns(Promise.resolve({status:200, data: CONNECT_RESPONSE}));
	
	global.client=new WOQLClient();			
  	global.client.connect(global.url, key).then(function(response){
	/*
	*check that the connection object is filled well
	*/
	
	expect(global.client.connection.connection[url].key).to.equal(key);
	global.sandbox.restore();

	}).then(done, done);
})

beforeEach(function() {
   global.sandbox = sinon.createSandbox();

});

afterEach(function(){
	//server.restore();
    global.sandbox.restore();
});

//module.exports={client:client,sandbox:sandbox}