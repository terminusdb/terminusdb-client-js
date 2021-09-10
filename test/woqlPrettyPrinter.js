'use strict'
const expect = require('chai').expect
var WOQL = require('../lib/woql')


describe('woql prettyprint', function() {
  it('triple from json', function() {
    const query = WOQL.json({
            '@type': 'Triple',
            subject: { '@type': 'NodeValue', variable: 'Subject' },
            predicate: { '@type': 'NodeValue', variable: 'Predicate' },
            object: { '@type': 'Value', variable: 'Object' }})
    expect(query.prettyPrint()).to.eql('WOQL.triple("v:Subject", "v:Predicate", "v:Object")')  
  })
//

it('woql.all() to prettyPrint', function() {
    const query = WOQL.all()
    expect(query.prettyPrint()).to.eql('WOQL.triple("v:Subject", "v:Predicate", "v:Object")')  
  })
})