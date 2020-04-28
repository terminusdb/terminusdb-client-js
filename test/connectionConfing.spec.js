'use strict';
var expect = require('chai').expect;
var ConnectionConfig = require('../lib/connectionConfig'); 

describe('connectionConfig tests', function () {
   
   const startServerUrl="http://localhost:6363/";
   const startDBid="testDB";
   const account="admin"
   const params={server:startServerUrl,db:startDBid,account:account}
   const connectionConfig= new ConnectionConfig(params);

   const dbURL="http://localhost:6363/db/admin/testDB";

   it('check get server URL', function(){
      expect(connectionConfig.serverURL()).to.equal(startServerUrl);
      expect(connectionConfig.dbURL()).to.equal(dbURL); 		
   })

   it('change server', function(){
      connectionConfig.setBranch("myBranch");
      /*
      * the dbURL 
      */
      expect(connectionConfig.dbURL()).to.equal(dbURL);
      //console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
      
      //'http://localhost:6363/db/admin/testDB
      expect(connectionConfig.queryURL()).to.equal("http://localhost:6363/woql/admin/testDB/local/branch/myBranch");
   })

   it('change server', function(){
      connectionConfig.setRef("gfhfjkflfgorpyuiioo");

      //console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
      
      //'http://localhost:6363/db/admin/testDB
      expect(connectionConfig.queryURL()).to.equal("http://localhost:6363/woql/admin/testDB/local/commit/gfhfjkflfgorpyuiioo");
   })
})