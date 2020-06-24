const ConnectionCapabilities = require('../lib/connectionCapabilities')
const connect_response = require('./serverResponse/connectResponseForCapabilities')
const snapCapabilitiesObj = require('./extraFile/connectionObj')
const expect = require('chai').expect
const serverRecordsFromCap = require('./extraFile/serverRecordsFromCap')

describe('capabilities Actions', function() {
    const url = 'http://localhost:6363/'

    const connectionCapabilities = new ConnectionCapabilities()
    connectionCapabilities.setCapabilities(connect_response)

    it('check connection capabilities Object', function() {
        expect(connectionCapabilities.connection).to.eql(snapCapabilitiesObj)
    })

    it('check formResourceName method', function() {
        expect(connectionCapabilities.formResourceName('TEST', 'admin')).to.equal('admin|TEST')
    })

    it('check formResourceName method', function() {
        expect(connectionCapabilities.findResourceDocumentID('TEST', 'admin')).to.equal(
            'doc:Database%5fadmin%7CTEST',
        )
    })

    it('check getServerRecord method', function() {
        //console.log(JSON.stringify(connectionCapabilities.getServerRecord(), null, 4));
        expect(connectionCapabilities.getServerRecord()).to.eql(serverRecordsFromCap)
    })
})

WOQL.with("temp://graph", WOQL.remote('https://terminusdb.github.io/terminus-tutorials/seshat-tutorial/seshat-2018.ttl', {"type":"turtle"}), 
    WOQL.quad("v:Node", "v:Predicate", "v:Target", "temp://graph"))

WOQL.get(
    WOQL.as("v:Node")
        .as("v:Predicate")
        .as("v:Target")
    ).remote('https://terminusdb.github.io/terminus-tutorials/seshat-tutorial/seshat-2018.ttl',{"type":"turtle"})
