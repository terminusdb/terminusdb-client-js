/**
 * Unit tests for WOQL slice operator
 *
 * Tests the JavaScript client binding for slice(list, result, start, end?)
 */

const { expect } = require('chai');
const WOQL = require('../lib/woql');
const WOQL_SLICE_JSON = require('./woqlJson/woqlSliceJson');

describe('WOQL slice operator', () => {
  describe('AC-1: Basic slicing', () => {
    it('generates correct JSON for slice with start and end', () => {
      const woqlObject = WOQL.slice(['a', 'b', 'c', 'd'], 'v:Result', 1, 3);
      expect(woqlObject.json()).to.eql(WOQL_SLICE_JSON.basicSlice);
    });
  });

  describe('AC-3: Negative indices', () => {
    it('generates correct JSON for slice with negative indices', () => {
      const woqlObject = WOQL.slice(['a', 'b', 'c', 'd'], 'v:Result', -2, -1);
      expect(woqlObject.json()).to.eql(WOQL_SLICE_JSON.negativeIndices);
    });
  });

  describe('Optional end parameter', () => {
    it('generates correct JSON when end is omitted', () => {
      const woqlObject = WOQL.slice(['a', 'b', 'c', 'd'], 'v:Result', 1);
      expect(woqlObject.json()).to.eql(WOQL_SLICE_JSON.withoutEnd);
    });
  });

  describe('Variable inputs', () => {
    it('generates correct JSON with variable as list input', () => {
      const woqlObject = WOQL.slice('v:MyList', 'v:Result', 0, 2);
      expect(woqlObject.json()).to.eql(WOQL_SLICE_JSON.variableList);
    });

    it('generates correct JSON with variable indices', () => {
      const woqlObject = WOQL.slice(['x', 'y', 'z'], 'v:Result', 'v:Start', 'v:End');
      expect(woqlObject.json()).to.eql(WOQL_SLICE_JSON.variableIndices);
    });
  });

  describe('AC-7: Full range', () => {
    it('generates correct JSON for slice from start', () => {
      const woqlObject = WOQL.slice(['a', 'b', 'c'], 'v:Result', 0, 2);
      expect(woqlObject.json()).to.eql(WOQL_SLICE_JSON.fromStart);
    });
  });

  describe('Method chaining', () => {
    it('works with method chaining via WOQLQuery instance', () => {
      const woqlObject = WOQL.slice(['a', 'b', 'c'], 'v:Result', 0, 2);
      expect(woqlObject.json()['@type']).to.equal('Slice');
    });

    it('chains with and() correctly', () => {
      const woqlObject = WOQL.eq('v:MyList', ['x', 'y', 'z'])
        .and()
        .slice('v:MyList', 'v:Result', 1, 3);
      
      const json = woqlObject.json();
      expect(json['@type']).to.equal('And');
      expect(json.and).to.be.an('array').that.has.lengthOf(2);
      expect(json.and[1]['@type']).to.equal('Slice');
    });
  });

  describe('Edge cases', () => {
    it('handles empty list', () => {
      const woqlObject = WOQL.slice([], 'v:Result', 0, 1);
      const json = woqlObject.json();
      expect(json['@type']).to.equal('Slice');
      expect(json.list.list).to.be.an('array').that.has.lengthOf(0);
    });

    it('handles single element slice', () => {
      const woqlObject = WOQL.slice(['only'], 'v:Result', 0, 1);
      const json = woqlObject.json();
      expect(json['@type']).to.equal('Slice');
      expect(json.list.list).to.be.an('array').that.has.lengthOf(1);
    });
  });
});
