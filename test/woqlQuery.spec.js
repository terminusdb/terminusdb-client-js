'use strict'
const axiosInstance = require('../lib/axiosInstance')
const expect = require('chai').expect
var WOQL = require('../lib/woql')


describe('woql query', function() {
  it('check database document id', function(done) {
    global.sandbox.stub(axiosInstance, 'post').returns(Promise.resolve({status: 200, data: {}}))

    const woqlObject = WOQL.limit(2).start(0)

    woqlObject.execute(global.client)

    done()
  })
})