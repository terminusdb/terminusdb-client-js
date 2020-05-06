'use strict';
require('./helper.spec');
const axiosInstance = require('../lib/axiosInstance');
const getCapRecord = require('./extraFile/getRecordsFromCapBikeDb')
const expect = require('chai').expect;

describe('delete a db', function () {
   const dbID  = 'bike';
   const account = 'admin'

   it('check database document record',function(){
      
      expect(global.client.connection.getDBRecord(dbID,account)).to.eql(getCapRecord);
   })

   it('delete a db by id', function(done){

   		global.sandbox.stub(axiosInstance, "delete").returns(Promise.resolve({status:200, data: {"terminus:status":"terminus:success"}}));
   			
   		global.client.deleteDatabase(dbID, account).then(function(response){
   			/*
   			*check that the db is deleted
   			*/
        expect(global.client.connection.getDBRecord(dbID,account)).to.eql(undefined);

        expect(response["terminus:status"]).to.equal("terminus:success");
  		}).then(done, done);
		
  	})
})