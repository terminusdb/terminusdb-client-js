const { expect } = require('chai');
const WOQL = require('../lib/woql');

describe('woql prettyprint', () => {
  it('triple from json', () => {
    const query = WOQL.json({
      '@type': 'Triple',
      subject: { '@type': 'NodeValue', variable: 'Subject' },
      predicate: { '@type': 'NodeValue', variable: 'Predicate' },
      object: { '@type': 'Value', variable: 'Object' },
    });
    expect(query.prettyPrint()).to.eql('WOQL.triple("v:Subject", "v:Predicate", "v:Object")');
  });
  //

  it('woql.all() to prettyPrint', () => {
    const query = WOQL.all();
    expect(query.prettyPrint()).to.eql('WOQL.triple("v:Subject", "v:Predicate", "v:Object")');
  });
});
