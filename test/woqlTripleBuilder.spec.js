const expect = require('chai').expect

var WOQL = require('../lib/woql')
const woqlJson = require('./woqlJson/woqlJson')

describe('triple builder chaining methods', function() {
    it('check the node method', function() {
        const woqlObject = WOQL.node('some_node')
        const jsonObj = {} //"@type": "woql:And"};
        expect(woqlObject.json()).to.eql(jsonObj)
        //console.log(JSON.stringify(woqlObject.json(), null, 4));
    })

    it('check the graph method', function() {
        const woqlObject = WOQL.node('a', 'AddQuad').graph('schema')
        const woqlObject2 = WOQL.node('x', 'add_quad')
            .graph('schema')
            .label('my label', 'en')

        const jsonObj = {}

        expect(woqlObject.json()).to.eql(jsonObj)
        expect(woqlObject2.json()).to.eql(woqlJson.graphMethodJson)
    })

    it('check the node and label method', function() {
        const woqlObject = WOQL.node('x', 'add_quad').label('my label', 'en')
        const woqlObject2 = WOQL.node('x', 'add_quad').label('v:label')
        expect(woqlObject.json()).to.eql(woqlJson.labelMethodJson)

        expect(woqlObject2.json()).to.eql(woqlJson.labelMethodJson2)
    })

    it('check the add class and description method', function() {
        const woqlObject = WOQL.add_class('NewClass').description('A new class object.')
        expect(woqlObject.json()).to.eql(woqlJson.addClassDescJson)
    })

    it('check node and property method', function() {
        const woqlObject = WOQL.node('x', 'add_triple').property('myprop', 'value')
        expect(woqlObject.json()).to.eql(woqlJson.addNodePropJson)
    })

    it('check node and  parent method', function() {
        const woqlObject = WOQL.node('x', 'add_quad').parent('classParentName')
        expect(woqlObject.json()).to.eql(woqlJson.nodeParentJson)
    })

    it('check the abstract method', function() {
        const woqlObject = WOQL.node('x', 'add_quad').abstract()
        expect(woqlObject.json()).to.eql(woqlJson.nodeAbstractJson)
    })

    it('check the max method', function() {
        const woqlObject = WOQL.add_property('P', 'string').domain("A").max(4)
        expect(woqlObject.json()).to.eql(woqlJson.propertyMaxJson)
    })

    it('check the min method', function() {
        const woqlObject = WOQL.add_property('P', 'string').domain("A").min(2)
        expect(woqlObject.json()).to.eql(woqlJson.propMinJson)
    })

    it('check the cardinality method', function() {
        const woqlObject = WOQL.add_property('P', 'string').domain("A").cardinality(3)
        expect(woqlObject.json()).to.eql(woqlJson.propCardinalityJson)
    })

    it('check the chained insert method', function() {
        const woqlObject = WOQL.insert('v:Node_ID', 'v:Type')
            .label('v:Label')
            .description('v:Description')
            .property('prop', 'v:Prop')
            .property('prop', 'v:Prop2')
            .parent('myParentClass')
        expect(woqlObject.json()).to.eql(woqlJson.chainInsertJson)
    })

    it('check the chained doctype method', function() {
        const woqlObject = WOQL.doctype('MyDoc')
            .label('abc')
            .description('abcd')
            .property('prop', 'dateTime')
            .label('aaa')
            .property('prop2', 'integer')
            .label('abe')
        expect(woqlObject.json()).to.eql(woqlJson.chainDoctypeJson)
        //console.log(JSON.stringify(woqlObject.json(), null, 4));
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
