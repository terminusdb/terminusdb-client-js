const { expect } = require('chai');

const WOQL = require('../lib/woql');
const woqlJson = require('./woqlJson/woqlJson');
const woqlDeleteJson = require('./woqlJson/woqlDeleteJson');

describe('triple builder', () => {
  it('check the triple method', () => {
    const woqlObject = WOQL.triple('a', 'b', 'c');
    expect(woqlObject.json()).to.eql(woqlJson.trypleJson);
  });

  it('check the quad method', () => {
    const woqlObject = WOQL.quad('a', 'b', 'c', 'd');
    expect(woqlObject.json()).to.eql(woqlJson.quadJson);
    // console.log(JSON.stringify(woqlObject.json(), null, 4));
  });

  it('check the sub method', () => {
    const woqlObject = WOQL.sub('ClassA', 'ClassB');
    expect(woqlObject.json()).to.eql(woqlJson.subsumptionJson);
  });

  it('check the isa method', () => {
    const woqlObject = WOQL.isa('instance', 'Class');

    const jsonObj = { isa: ['instance', 'Class'] };

    expect(woqlObject.json()).to.eql(woqlJson.isAJson);
  });

  it('check the delete_triple method', () => {
    const woqlObject = WOQL.delete_triple('a', 'b', 'c');
    expect(woqlObject.json()).to.eql(woqlJson.deleteTripleJson);
  });

  it('check the delete_quad method', () => {
    const woqlObject = WOQL.delete_quad('a', 'b', 'c', 'd');

    expect(woqlObject.json()).to.eql(woqlJson.deleteQuadJson);
  });

  it('check the add_triple method', () => {
    const woqlObject = WOQL.add_triple('a', 'b', 'c');
    expect(woqlObject.json()).to.eql(woqlJson.addTripleJson);
  });

  it('check the add_quad method', () => {
    const woqlObject = WOQL.add_quad('a', 'b', 'c', 'd');
    expect(woqlObject.json()).to.eql(woqlJson.addQuadJson);
  });
});
