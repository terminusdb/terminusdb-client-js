const expect = require('chai').expect;

var WOQLResult = require('../lib/woqlResult');


describe('woql results', function () { 
    it('check the WOQL Rule',function(){
        const res=new WOQLResult();
        expect(res.hasBindings()).to.equal(false);
	})
})
