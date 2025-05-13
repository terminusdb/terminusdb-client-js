const { expect } = require('chai');
const AccessControl = require('../lib/accessControl');

describe('AccessControl tests', () => {
    const startServerUrl = 'http://127.0.0.1:6363/';
    const organization = 'admin';
    const user = 'admin';
    const key ='mykey'

    const accessContol = new AccessControl(startServerUrl,{user,organization,key})

    it('check set headers in accessControl', () => {
        const customHeaders = { "Custom-header-01":"test-headers", "Custom-header-02": "test"}
        accessContol.customHeaders(customHeaders)
        expect(accessContol.customHeaders()).to.eql(customHeaders);  
    })

})