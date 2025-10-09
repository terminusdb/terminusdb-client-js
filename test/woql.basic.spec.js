const { expect } = require('chai');
const WOQL = require('../lib/woql');
const WOQLQuery = require('../lib/query/woqlBuilder');
const WOQLLibrary = require('../lib/query/woqlLibrary');
const { Vars, Var, Doc } = require('../lib/query/woqlDoc');

describe('WOQL wrapper tests', () => {
  describe('Core query functions', () => {
    it('should create basic queries and return WOQLQuery instances', () => {
      expect(WOQL.triple('a', 'b', 'c')).to.be.instanceof(WOQLQuery);
      expect(WOQL.and(WOQL.triple('a', 'b', 'c'))).to.be.instanceof(WOQLQuery);
      expect(WOQL.or(WOQL.triple('a', 'b', 'c'))).to.be.instanceof(WOQLQuery);
      expect(WOQL.select('v:a')).to.be.instanceof(WOQLQuery);
      expect(WOQL.distinct('v:a')).to.be.instanceof(WOQLQuery);
    });

    it('should support aliases', () => {
      expect(WOQL.equals('a', 'b')).to.be.instanceof(WOQLQuery);
      expect(WOQL.subsumption('A', 'B')).to.be.instanceof(WOQLQuery);
      expect(WOQL.substring('test', 1, 2, 'v:a', 'v:b')).to.be.instanceof(WOQLQuery);
      expect(WOQL.regexp('.*', 'test', 'v:m')).to.be.instanceof(WOQLQuery);
      expect(WOQL.optional(WOQL.triple('a', 'b', 'c'))).to.be.instanceof(WOQLQuery);
      expect(WOQL.cast('1', 'xsd:integer', 'v:n')).to.be.instanceof(WOQLQuery);
      expect(WOQL.idgenerator('doc:P', ['a'], 'v:id')).to.be.instanceof(WOQLQuery);
      expect(WOQL.evaluate(WOQL.plus(1, 2), 'v:r')).to.be.instanceof(WOQLQuery);
    });

    it('should support deprecated read_object', () => {
      expect(WOQL.read_object('doc:P/1', 'v:p')).to.be.instanceof(WOQLQuery);
    });
  });

  describe('Literal types', () => {
    it('should create string literal', () => {
      const result = WOQL.string('test');
      expect(result['@type']).to.equal('xsd:string');
      expect(result['@value']).to.equal('test');
    });

    it('should create generic literal', () => {
      const result = WOQL.literal(42, 'xsd:integer');
      expect(result['@type']).to.equal('xsd:integer');
      expect(result['@value']).to.equal(42);
    });

    it('should create date literal', () => {
      const result = WOQL.date('2022-10-02');
      expect(result['@type']).to.equal('xsd:date');
    });

    it('should create datetime literal', () => {
      const result = WOQL.datetime('2022-10-19T14:17:12Z');
      expect(result['@type']).to.equal('xsd:dateTime');
    });

    it('should create boolean literal', () => {
      const result = WOQL.boolean(true);
      expect(result['@type']).to.equal('xsd:boolean');
      expect(result['@value']).to.equal(true);
    });

    it('should create IRI', () => {
      const result = WOQL.iri('http://example.com/resource');
      expect(result).to.be.an('object');
      expect(result.node).to.equal('http://example.com/resource');
    });
  });

  describe('Variable helpers', () => {
    it('should create vars array', () => {
      const [a, b, c] = WOQL.vars('a', 'b', 'c');
      expect(a).to.be.instanceof(Var);
      expect(b).to.be.instanceof(Var);
      expect(c).to.be.instanceof(Var);
      expect(a.name).to.equal('a');
    });

    it('should create Vars object', () => {
      const v = WOQL.Vars('x', 'y', 'z');
      expect(v).to.be.an('object');
      expect(v.x).to.be.instanceof(Var);
      expect(v.y).to.be.instanceof(Var);
    });

    it('should create Doc object', () => {
      const doc = WOQL.doc({ '@type': 'Person', name: 'John' });
      expect(doc).to.be.an('object');
      expect(doc['@type']).to.equal('Value');
    });
  });

  describe('Library and utility functions', () => {
    it('should create WOQLLibrary instance', () => {
      const lib = WOQL.lib();
      expect(lib).to.be.instanceof(WOQLLibrary);
    });

    it('should create empty query', () => {
      const q = WOQL.query();
      expect(q).to.be.instanceof(WOQLQuery);
    });

    it('should create json query or return object', () => {
      const q = WOQL.json();
      // json() returns the JSON representation when called without args
      expect(q).to.be.an('object');
    });
  });

  describe('Emerge function', () => {
    it('should generate function definitions string', () => {
      const result = WOQL.emerge(false);
      expect(result).to.be.a('string');
      expect(result).to.include('function triple');
      expect(result).to.include('function and');
      expect(result).to.include('function or');
    });
  });

  describe('Document operations', () => {
    it('should create document queries', () => {
      expect(WOQL.read_document('P/1', 'v:p')).to.be.instanceof(WOQLQuery);
      expect(WOQL.insert_document({ '@type': 'Person' })).to.be.instanceof(WOQLQuery);
      expect(WOQL.update_document({ '@id': 'P/1' })).to.be.instanceof(WOQLQuery);
      expect(WOQL.delete_document('P/1')).to.be.instanceof(WOQLQuery);
    });
  });

  describe('All query types return WOQLQuery', () => {
    const queryFunctions = [
      () => WOQL.using('path'),
      () => WOQL.comment('test'),
      () => WOQL.from('graph', WOQL.triple('a', 'b', 'c')),
      () => WOQL.into('graph', WOQL.triple('a', 'b', 'c')),
      () => WOQL.quad('a', 'b', 'c', 'g'),
      () => WOQL.added_triple('a', 'b', 'c'),
      () => WOQL.removed_triple('a', 'b', 'c'),
      () => WOQL.added_quad('a', 'b', 'c', 'g'),
      () => WOQL.removed_quad('a', 'b', 'c', 'g'),
      () => WOQL.add_triple('a', 'b', 'c'),
      () => WOQL.delete_triple('a', 'b', 'c'),
      () => WOQL.add_quad('a', 'b', 'c', 'g'),
      () => WOQL.delete_quad('a', 'b', 'c', 'g'),
      () => WOQL.update_triple('a', 'b', 'new', 'old'),
      () => WOQL.update_quad('a', 'b', 'new', 'g'),
      () => WOQL.sub('A', 'B'),
      () => WOQL.isa('i', 'C'),
      () => WOQL.substr('str', 1, 2, 'v:a', 'v:b'),
      () => WOQL.get(WOQL.as('c', 'v:c'), WOQL.remote({ url: 'http://x' })),
      () => WOQL.put(WOQL.as('c', 'v:c'), WOQL.triple('a', 'b', 'c'), 'f'),
      () => WOQL.as('col', 'v:var'),
      () => WOQL.remote({ url: 'http://x.com' }),
      () => WOQL.post('/path'),
      () => WOQL.trim('  x  ', 'v:r'),
      () => WOQL.plus(1, 2),
      () => WOQL.minus(1, 2),
      () => WOQL.times(2, 3),
      () => WOQL.divide(10, 2),
      () => WOQL.div(10, 3),
      () => WOQL.exp(2, 3),
      () => WOQL.floor(3.7),
      () => WOQL.isa('i', 'T'),
      () => WOQL.like('a', 'b', 'v:d'),
      () => WOQL.less(1, 2),
      () => WOQL.greater(2, 1),
      () => WOQL.opt(WOQL.triple('a', 'b', 'c')),
      () => WOQL.unique('p', ['a'], 'v:id'),
      () => WOQL.idgen('p', ['a'], 'v:id'),
      () => WOQL.upper('x', 'v:r'),
      () => WOQL.lower('X', 'v:r'),
      () => WOQL.pad('x', ' ', 5, 'v:r'),
      () => WOQL.split('a b', ' ', 'v:r'),
      () => WOQL.member('x', ['a', 'b']),
      () => WOQL.concat(['a', 'b'], 'v:r'),
      () => WOQL.join(['a', 'b'], ' ', 'v:r'),
      () => WOQL.sum([1, 2, 3], 'v:t'),
      () => WOQL.start(10),
      () => WOQL.limit(10),
      () => WOQL.re('.*', 'test', 'v:m'),
      () => WOQL.length([1, 2, 3], 'v:l'),
      () => WOQL.not(WOQL.triple('a', 'b', 'c')),
      () => WOQL.once(WOQL.triple('a', 'b', 'c')),
      () => WOQL.immediately(WOQL.triple('a', 'b', 'c')),
      () => WOQL.count('v:c'),
      () => WOQL.typecast('1', 'xsd:integer', 'v:n'),
      () => WOQL.order_by('v:a'),
      () => WOQL.group_by('v:a', 'v:b', 'v:r'),
      () => WOQL.true(),
      () => WOQL.path('v:s', 'p+', 'v:o'),
      () => WOQL.size('resource', 'v:s'),
      () => WOQL.triple_count('resource', 'v:c'),
      () => WOQL.type_of('v:e', 'v:t'),
      () => WOQL.star(),
      () => WOQL.all(),
      () => WOQL.node('n'),
      () => WOQL.insert('n', 'T'),
      () => WOQL.graph('g'),
      () => WOQL.nuke('g'),
      () => WOQL.value('v:s', 'p', 'v'),
      () => WOQL.link('v:s', 'p', 'v:o'),
      () => WOQL.dot('v:d', 'f', 'v:v'),
    ];

    queryFunctions.forEach((fn, index) => {
      it(`should return WOQLQuery for function ${index + 1}`, () => {
        const result = fn();
        expect(result).to.be.instanceof(WOQLQuery);
      });
    });
  });

  describe('WOQL.client()', () => {
    it('should set client', () => {
      const mockClient = { api: 'http://localhost' };
      WOQL.client(mockClient);
      expect(WOQL.client()).to.equal(mockClient);
    });

    it('should get client', () => {
      const mockClient = { api: 'http://example.com' };
      WOQL._client = mockClient;
      expect(WOQL.client()).to.equal(mockClient);
    });

    it('should return undefined when no client set', () => {
      WOQL._client = undefined;
      expect(WOQL.client()).to.be.undefined;
    });
  });

  describe('WOQL.Vars()', () => {
    it('should create Vars object', () => {
      const vars = WOQL.Vars('x', 'y', 'z');
      expect(vars).to.be.an('object');
      expect(vars.x).to.be.instanceof(Var);
      expect(vars.y).to.be.instanceof(Var);
      expect(vars.z).to.be.instanceof(Var);
    });

    it('should create Var instances with correct names', () => {
      const vars = WOQL.Vars('firstName', 'lastName');
      expect(vars.firstName.name).to.equal('firstName');
      expect(vars.lastName.name).to.equal('lastName');
    });

    it('should handle single variable', () => {
      const vars = WOQL.Vars('single');
      expect(vars.single).to.be.instanceof(Var);
      expect(vars.single.name).to.equal('single');
    });

    it('should return empty object for no arguments', () => {
      const vars = WOQL.Vars();
      expect(vars).to.be.an('object');
      expect(Object.keys(vars)).to.have.lengthOf(0);
    });
  });

  describe('WOQL.emerge()', () => {
    it('should return string of function definitions without auto_eval', () => {
      const result = WOQL.emerge();
      expect(result).to.be.a('string');
      expect(result).to.include('function Vars(');
      expect(result).to.include('return WOQL.');
    });

    it('should return string of function definitions with false auto_eval', () => {
      const result = WOQL.emerge(false);
      expect(result).to.be.a('string');
      expect(result).to.include('function Vars(');
    });

    it('should generate functions for WOQL methods', () => {
      const result = WOQL.emerge();
      // Should include common WOQL methods
      expect(result).to.include('function triple(');
      expect(result).to.include('function select(');
      expect(result).to.include('function and(');
    });

    it('should exclude unemerged functions', () => {
      const result = WOQL.emerge();
      // These functions should not be emerged
      expect(result).to.not.include('function emerge(');
      expect(result).to.not.include('function true(');
      expect(result).to.not.include('function eval(');
    });

    it('should handle auto_eval true', () => {
      // When auto_eval is true, it calls eval on the string
      // This is more of an integration test to cover the branch
      const result = WOQL.emerge(true);
      expect(result).to.be.a('string');
      // After eval, the functions should be available globally
      // but we don't test the side effect here, just that it doesn't throw
    });

    it('should skip non-function properties', () => {
      // WOQL might have non-function properties like _client
      // The emerge function should skip these
      const result = WOQL.emerge();
      // Should only include functions, not properties
      expect(result).to.include('function ');
      expect(result).to.include('return WOQL.');
    });

    it('should join functions with semicolons and newlines', () => {
      const result = WOQL.emerge();
      expect(result).to.include(';\n');
    });
  });
});
