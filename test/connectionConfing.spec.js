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

   it('check set branch', function(){
      connectionConfig.setBranch("myBranch");
      const queryURLBranch="http://localhost:6363/woql/admin/testDB/local/branch/myBranch";
      /*
      * the dbURL dosen't change
      */
      expect(connectionConfig.dbURL()).to.equal(dbURL);
      expect(connectionConfig.queryURL()).to.equal(queryURLBranch);
   })

   it('check set refId', function(){
      connectionConfig.setRef("gfhfjkflfgorpyuiioo");

      const queryURL="http://localhost:6363/woql/admin/testDB/local/commit/gfhfjkflfgorpyuiioo"

      expect(connectionConfig.queryURL()).to.equal(queryURL);
   })

   it('check set class frameUrl', function(){
      const classFrameURL="http://localhost:6363/frame/admin/testDB/local/commit/gfhfjkflfgorpyuiioo"

      //console.log(JSON.stringify(connectionConfig.triplesURL(), null, 4));
      
      expect(connectionConfig.classFrameURL()).to.equal(classFrameURL);
   })


   it('check set class tripleUrl', function(){
      const classTripleURL="http://localhost:6363/triples/admin/testDB/local/commit/gfhfjkflfgorpyuiioo"

     // console.log(JSON.stringify(connectionConfig.triplesURL(), null, 4));
      
      expect(connectionConfig.triplesURL()).to.equal(classTripleURL);
   })

   it('check remove the refCommit', function(){
      const queryUrlBranch01="http://localhost:6363/woql/admin/testDB/local/branch/myBranch";
      const queryFrameBranch01="http://localhost:6363/frame/admin/testDB/local/branch/myBranch";
      const queryTriplesBranch01="http://localhost:6363/triples/admin/testDB/local/branch/myBranch"; 
      /*
      *remove the ref commit it come to the 
      */
      connectionConfig.setRef(false);
      expect(connectionConfig.queryURL()).to.equal(queryUrlBranch01);
      expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01);
      expect(connectionConfig.triplesURL()).to.equal(queryTriplesBranch01);

      //console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
   })

   it('check remove the branch', function(){
      const queryUrlBranch01="http://localhost:6363/woql/admin/testDB/local/branch/master";
      const queryFrameBranch01="http://localhost:6363/frame/admin/testDB/local/branch/master";
      const queryTriplesBranch01="http://localhost:6363/triples/admin/testDB/local/branch/master"; 
      /*
      *remove the ref commit it come to the 
      */
      connectionConfig.setBranch(false);
      expect(connectionConfig.queryURL()).to.equal(queryUrlBranch01);
      expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01);
      expect(connectionConfig.triplesURL()).to.equal(queryTriplesBranch01);

      //console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
   })
})