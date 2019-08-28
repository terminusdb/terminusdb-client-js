'use strict';
var axios = require("axios");
var expect = require('chai').expect;

describe('delete a db', function () {
   var dbUrl  = 'first_database';

   it('check database document id',function(){
      expect(global.client.connection.dbCapabilityID(dbUrl)).to.equal('doc:first_database');
   })

   it('delete a db by id', function(done){

   		global.sandbox.stub(axios, "delete").returns(Promise.resolve({status:200, data: {"terminus:status":"terminus:success"}}));
   			
   		global.client.deleteDatabase(dbUrl).then(function(response){
   			/*
   			*check that the db is deleted
   			*/
        const dbName=global.client.connection.dbCapabilityID(dbUrl);

   			expect(global.client.connection.connection[global.url][dbName]).to.equal(undefined);

   			expect(response["terminus:status"]).to.equal("terminus:success");
  		}).then(done, done);
		
  	})
})