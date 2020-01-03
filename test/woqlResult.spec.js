const expect = require('chai').expect;

var WOQL = require('../lib/woql');
var WOQLRule = require('../lib/woqlRule');
var FrameRule = require('../lib/frameRule');
var WOQLResult = require('../lib/woqlResult');


describe('woql results', function () { 
    it('check the WOQL Rule',function(){
        const woqlRule=WOQL.rule();
        woqlRule.literal(true).type("xdd:coordinatePolygon").scope("cell")
        const jsonObj= {pattern: {literal : true, type: ["xdd:coordinatePolygon"], scope: "cell"}}
        expect(woqlRule.json()).to.eql(jsonObj);
	})
    it('check the frame rule',function(){
        const woqlRule=WOQL.rule("frame");
        woqlRule.literal(true).type("xdd:coordinatePolygon").scope("data")
        const jsonObj= {pattern: {literal : true, type: ["xdd:coordinatePolygon"], scope: "data"}}
        expect(woqlRule.json()).to.eql(jsonObj);
	})
})
