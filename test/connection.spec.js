'use strict';
var axios = require("axios");
var expect = require('chai').expect;
var sinon = require('sinon');
var WOQLClient = require('../lib/woqlClient'); 
var CONNECT_RESPONSE = require('./serverResponse/connectResponse');

describe('connection tests', function () {

	  let sandbox;
  	let server;
  	beforeEach(() => {
    	sandbox = sinon.createSandbox();
    	//server = sandbox.useFakeServer();
  	});
  	
  	afterEach(() => {
    	//server.restore();
    	sandbox.restore();
  	});


   it('connect by Terminus Server Url', function(done){

   		var url  = 'http://localhost:6363/';
   		var key  = 'root'; 

   		sandbox.stub(axios, "get").returns(Promise.resolve({status:200, data: CONNECT_RESPONSE}));
   		
   		const client = new WOQLClient();
   		client.connect(url, key).then(function(response){
   			/*
   			*check that the connection object is filled well
   			*/
        //console.log(client.connection.connection);
   			expect(client.connection.connection[url].key).to.equal(key);
   		}).then(done, done);

  	})
})