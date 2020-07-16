'use strict'
const axiosInstance = require('../lib/axiosInstance')
const getCapRecord = require('./extraFile/getRecordsFromCapBikeDb')
const expect = require('chai').expect

describe('delete a db', function() {
    const dbID = 'bike'
    const organization = 'admin'

    it('delete a db by id', function(done) {
        global.sandbox
            .stub(axiosInstance, 'delete')
            .returns(Promise.resolve({status: 200, data: {'system:status': 'system:success'}}))

        global.client
            .deleteDatabase(dbID, organization)
            .then(function(response) {
                /*
                 *check that the db is deleted
                 */
                expect(global.client.connection.get_database(dbID, organization)).to.eql(undefined)

                expect(response['system:status']).to.equal('system:success')
            })
            .then(done, done)
    })
})
