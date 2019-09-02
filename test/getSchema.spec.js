'use strict';
const turtleSchemaR= require("./extraFile/getSchemaTurtleResponse");
const axios = require("axios");
const expect = require('chai').expect;

describe('get a terminusDB schema', function () {

	const dbID="second_database";

	it('set terminus db',function(){
	    global.client.connectionConfig.setDB(dbID);
	    expect(global.client.connectionConfig.dbid).to.equal(dbID);
	    expect(global.client.connectionConfig.server).to.equal(global.url);
	})

	const dbURL="http://localhost:6363/test_database";

	it('set current database by database URL',function(){
		global.client.connectionConfig.setSchemaURL(dbURL);
		expect(global.client.connectionConfig.dbid).to.equal('test_database');
	    expect(global.client.connectionConfig.server).to.equal(global.url);

	    expect(global.client.connectionConfig.schemaURL()).to.equal(`${dbURL}/schema`);
	})

	it('get a schema of the current database', function(done){
		var opts={"terminus:encoding": "terminus:turtle"};

		global.sandbox.stub(axios, "get").returns(Promise.resolve({status:200, data: turtleSchemaR}));
   		global.client.getSchema(null,opts).then((response)=>{
   			
   			expect(response).to.be.an('string');
   			
   		}).then(done, done)
	})

	it('update the schema of the current database',function(done){


	})
})