// const axios = require("axios");
const { expect } = require('chai');
const sinon = require('sinon');
const axiosInstance = require('../lib/axiosInstance');
const WOQLClient = require('../lib/woqlClient');
const CONNECT_RESPONSE = require('./serverResponse/connectResponseForCapabilities');

before((done) => {
  console.log('before all test');
  global.url = 'http://127.0.0.1:6363/';
  const key = 'root';
  global.sandbox = sinon.createSandbox();
  global.sandbox
    .stub(axiosInstance, 'get')
    .returns(Promise.resolve({ status: 200, data: CONNECT_RESPONSE }));

  global.client = new WOQLClient(global.url);
  global.client
    .connect({ key, user: 'admin', organization: 'admin' })
    .then((response) => {
      /*
             *check that the connection object is filled well
             */

      global.sandbox.restore();
    })
    .then(done, done);
});

beforeEach(() => {
  global.sandbox = sinon.createSandbox();
});

afterEach(() => {
  // server.restore();
  global.sandbox.restore();
});

// module.exports={client:client,sandbox:sandbox}
