'use strict';
require('./helper.spec');
const axiosInstance = require('../lib/axiosInstance');
const expect = require('chai').expect;

describe('create new db tests', function () {

   it('create new db by send details data', function(done){
   		const dbid  = 'test02';
      const doc={base_uri: `http://local.terminusdb.com/${dbid}/data`,
                comment: "test02 comment",
                label: "test02 label"}

      const accountid="account01"
   		global.sandbox.stub(axiosInstance, "post").returns(Promise.resolve({status:200, data: {"terminus:status":"terminus:success"}}));
   			
      expect(global.client.connectionConfig.serverURL()).to.equal('http://localhost:6363/');
   		global.client.createDatabase(dbid, doc, accountid).then(function(response){
 			/*
 			*check that the connection object is filled well
 			*/
   			
   		expect(response["terminus:status"]).to.equal("terminus:success");
  		
      }).then(done, done);
		
  	})
})