'use strict';
require('./helper.spec');
const turtleSchemaR= require("./extraFile/getSchemaTurtleResponse");
const axiosInstance = require('../lib/axiosInstance');
const expect = require('chai').expect;

//http://localhost:6363/triples/terminus/schema/main
//http://localhost:6363/triples/admin/testDB/local/commit/gfhfjkflfgorpyuiioo

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

		global.sandbox.stub(axiosInstance, "get").returns(Promise.resolve({status:200, data: turtleSchemaR}));
   		global.client.getSchema(null,opts).then((response)=>{
   			
   			expect(response).to.be.an('string');
   			
   		}).then(done, done)
	})

	it('update the schema of the current database',function(done){

          done();
	})
})