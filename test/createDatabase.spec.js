'use strict';
var axios = require("axios");
var expect = require('chai').expect;

var createDBdetails=require('./extraFile/createDBdetails');

describe('create new db tests', function () {

   it('create new db by send details data', function(done){
   		var dbName  = 'test02';
   		var key  = 'root'; 
   		
   		global.sandbox.stub(axios, "post").returns(Promise.resolve({status:200, data: {"terminus:status":"terminus:success"}}));
   		
   		expect(global.client.connectionConfig.server).to.equal('http://localhost:6363/');

   		global.client.createDatabase(dbName, createDBdetails, key).then(function(response){
   			/*
   			*check that the connection object is filled well
   			*/
   			
   			expect(response["terminus:status"]).to.equal("terminus:success");
  		}).then(done, done);
		
  	})
})