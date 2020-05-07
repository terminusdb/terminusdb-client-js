'use strict'
//const axios = require("axios");
const axiosInstance = require('../lib/axiosInstance');
const expect = require('chai').expect;
const sinon = require('sinon');
const WOQLClient = require('../lib/woqlClient'); 
const CONNECT_RESPONSE = require('./serverResponse/connectResponseForCapabilities');

before(function(done) {
	console.log('before all test');
	global.url  = 'http://localhost:6363/';
	const key='root';
	global.sandbox = sinon.createSandbox();
	global.sandbox.stub(axiosInstance, "get").returns(Promise.resolve({status:200, data: CONNECT_RESPONSE}));
	
	global.client=new WOQLClient();			
  	global.client.connect({server:global.url,key:key}).then(function(response){
	/*
	*check that the connection object is filled well
	*/

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