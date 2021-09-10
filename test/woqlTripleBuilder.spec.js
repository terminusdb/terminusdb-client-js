const expect = require('chai').expect

var WOQL = require('../lib/woql')
const woqlJson = require('./woqlJson/woqlJson')

describe('triple builder chaining methods', function() {
    it('check the node method', function() {
        const woqlObject = WOQL.node('some_node')
        const jsonObj = {} //"@type": "woql:And"};
        expect(woqlObject.json()).to.eql(jsonObj)
       // console.log('HELLO HELLO',JSON.stringify(woqlObject.json(), null, 4));
    })

    it('check the graph method', function() {
        const woqlObject = WOQL.node('a', 'AddQuad').graph('schema')
       
        const jsonObj = {}
        expect(woqlObject.json()).to.eql(jsonObj)
    })


    it('check the dot chaining ', function() {
        const woqlObject = WOQL.triple('A', 'B', 'C').triple('D', 'E', 'F')
        const v2 = WOQL.and(
            WOQL.triple('A', 'B', 'C'),
            WOQL.triple('D', 'E', 'F')
        )
        const v3 = WOQL.triple('A', 'B', 'C').and().triple('D', 'E', 'F')
        
        expect(woqlObject.json()).to.eql(v2.json())
        expect(woqlObject.json()).to.eql(v3.json())
        //console.log(JSON.stringify(woqlObject.json(), null, 4));
    })

})
