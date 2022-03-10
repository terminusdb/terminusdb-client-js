const { expect } = require('chai');
const axiosInstance = require('../lib/axiosInstance');
const WOQL = require('../lib/woql');

describe('woql query', () => {
  it('check database document id', (done) => {
    global.sandbox.stub(axiosInstance, 'post').returns(Promise.resolve({ status: 200, data: {} }));

    const woqlObject = WOQL.limit(2).start(0);

    woqlObject.execute(global.client);

    done();
  });
});
