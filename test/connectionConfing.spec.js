'use strict';
var expect = require('chai').expect;
var ConnectionConfig = require('../lib/connectionConfig'); 

describe('connectionConfig tests', function () {
   
   const startServerUrl="https://localhost:6363/";
   const startDBid="testDB";
   
   const params={server:startServerUrl,db:startDBid}
   const connectionConfig= new ConnectionConfig(params);

   const newServerUrl="https://myTest.net/";
   
   it('check get server URL', function(){
      expect(connectionConfig.serverURL()).to.equal(startServerUrl);
      expect(connectionConfig.platformEndpoint()).to.equal(false);
      expect(connectionConfig.dbURL()).to.equal(`${startServerUrl}${startDBid}`); 		
   })

   it('change server', function(){
      connectionConfig.setServer(newServerUrl);
      expect(connectionConfig.serverURL()).to.not.equal(startServerUrl);
      expect(connectionConfig.serverURL()).to.equal(newServerUrl);
   })
})