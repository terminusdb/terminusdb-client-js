const { expect } = require('chai');
const WOQLQuery = require('../lib/query/woqlCore');
const { Var, Doc } = require('../lib/query/woqlDoc');

describe('woqlCore tests', () => {
  let query;

  beforeEach(() => {
    query = new WOQLQuery();
  });

  describe('Constructor', () => {
    it('should create empty WOQLQuery', () => {
      expect(query.query).to.deep.equal({});
      expect(query.errors).to.be.an('array');
      expect(query.errors).to.have.lengthOf(0);
    });

    it('should create WOQLQuery with initial query', () => {
      const initialQuery = { '@type': 'Triple', subject: 'a', predicate: 'b', object: 'c' };
      const q = new WOQLQuery(initialQuery);
      expect(q.query).to.deep.equal(initialQuery);
    });

    it('should initialize cursor to query', () => {
      expect(query.cursor).to.equal(query.query);
    });

    it('should have default properties', () => {
      expect(query.chain_ended).to.be.false;
      expect(query.contains_update).to.be.false;
      expect(query.counter).to.equal(1);
    });
  });

  describe('Error handling', () => {
    it('should add parameter error', () => {
      query.cursor['@type'] = 'TestType';
      query.parameterError('Test error message');
      
      expect(query.errors).to.have.lengthOf(1);
      expect(query.errors[0].type).to.equal('TestType');
      expect(query.errors[0].message).to.equal('Test error message');
    });

    it('should check if has errors', () => {
      expect(query.hasErrors()).to.be.false;
      
      query.parameterError('Error 1');
      expect(query.hasErrors()).to.be.true;
      
      query.parameterError('Error 2');
      expect(query.errors).to.have.lengthOf(2);
      expect(query.hasErrors()).to.be.true;
    });
  });

  describe('addSubQuery()', () => {
    it('should add subquery from WOQLQuery object', () => {
      const subQuery = new WOQLQuery({ '@type': 'Triple' });
      query.addSubQuery(subQuery);
      
      expect(query.cursor.query).to.exist;
      expect(query.cursor.query['@type']).to.equal('Triple');
    });

    it('should add empty subquery and update cursor', () => {
      const originalCursor = query.cursor;
      query.addSubQuery();
      
      // When no argument is passed, it creates a new empty object
      // and sets cursor to that new object
      expect(originalCursor.query).to.exist;
      expect(originalCursor.query).to.deep.equal({});
    });
  });

  describe('containsUpdate()', () => {
    it('should detect AddTriple update', () => {
      const updateQuery = { '@type': 'AddTriple' };
      expect(query.containsUpdate(updateQuery)).to.be.true;
    });

    it('should detect DeleteTriple update', () => {
      const updateQuery = { '@type': 'DeleteTriple' };
      expect(query.containsUpdate(updateQuery)).to.be.true;
    });

    it('should detect InsertDocument update', () => {
      const updateQuery = { '@type': 'InsertDocument' };
      expect(query.containsUpdate(updateQuery)).to.be.true;
    });

    it('should not detect non-update query', () => {
      const readQuery = { '@type': 'Triple' };
      expect(query.containsUpdate(readQuery)).to.be.false;
    });

    it('should detect update in consequent', () => {
      const conditionalUpdate = {
        '@type': 'When',
        consequent: { '@type': 'AddTriple' },
      };
      expect(query.containsUpdate(conditionalUpdate)).to.be.true;
    });

    it('should detect update in nested query', () => {
      const nestedUpdate = {
        '@type': 'Select',
        query: { '@type': 'DeleteDocument' },
      };
      expect(query.containsUpdate(nestedUpdate)).to.be.true;
    });

    it('should detect update in and clause', () => {
      const andUpdate = {
        '@type': 'And',
        and: [
          { '@type': 'Triple' },
          { '@type': 'UpdateDocument' },
        ],
      };
      expect(query.containsUpdate(andUpdate)).to.be.true;
    });

    it('should detect update in or clause', () => {
      const orUpdate = {
        '@type': 'Or',
        or: [
          { '@type': 'Triple' },
          { '@type': 'AddQuad' },
        ],
      };
      expect(query.containsUpdate(orUpdate)).to.be.true;
    });
  });

  describe('updated()', () => {
    it('should mark query as containing update', () => {
      expect(query.contains_update).to.be.false;
      query.updated();
      expect(query.contains_update).to.be.true;
    });
  });

  describe('jlt() - JSON-LD literal', () => {
    it('should create xsd:string literal by default', () => {
      const result = query.jlt('test');
      expect(result).to.deep.equal({
        '@type': 'xsd:string',
        '@value': 'test',
      });
    });

    it('should create typed literal', () => {
      const result = query.jlt(42, 'integer');
      expect(result).to.deep.equal({
        '@type': 'xsd:integer',
        '@value': 42,
      });
    });

    it('should handle prefixed types', () => {
      const result = query.jlt('test@example.com', 'xdd:email');
      expect(result).to.deep.equal({
        '@type': 'xdd:email',
        '@value': 'test@example.com',
      });
    });
  });

  describe('varj() - variable to JSON', () => {
    it('should convert string variable', () => {
      const result = query.varj('myVar');
      expect(result).to.deep.equal({
        '@type': 'Value',
        variable: 'myVar',
      });
    });

    it('should convert v: prefixed variable', () => {
      const result = query.varj('v:x');
      expect(result).to.deep.equal({
        '@type': 'Value',
        variable: 'x',
      });
    });

    it('should convert Var instance', () => {
      const v = new Var('testVar');
      const result = query.varj(v);
      expect(result).to.deep.equal({
        '@type': 'Value',
        variable: 'testVar',
      });
    });
  });

  describe('rawVar()', () => {
    it('should extract raw variable name from string', () => {
      expect(query.rawVar('myVar')).to.equal('myVar');
    });

    it('should strip v: prefix', () => {
      expect(query.rawVar('v:x')).to.equal('x');
    });

    it('should extract from Var instance', () => {
      const v = new Var('name');
      expect(query.rawVar(v)).to.equal('name');
    });
  });

  describe('rawVarList()', () => {
    it('should convert list of variables', () => {
      const result = query.rawVarList(['v:a', 'v:b', 'v:c']);
      expect(result).to.deep.equal(['a', 'b', 'c']);
    });

    it('should handle mixed formats', () => {
      const v = new Var('d');
      const result = query.rawVarList(['v:a', 'b', v]);
      expect(result).to.deep.equal(['a', 'b', 'd']);
    });
  });

  describe('jobj() - query object to JSON', () => {
    it('should call json() if available', () => {
      const obj = { json: () => ({ '@type': 'Test' }) };
      const result = query.jobj(obj);
      expect(result).to.deep.equal({ '@type': 'Test' });
    });

    it('should convert true to True type', () => {
      const result = query.jobj(true);
      expect(result).to.deep.equal({ '@type': 'True' });
    });

    it('should return object as-is', () => {
      const obj = { '@type': 'Triple' };
      const result = query.jobj(obj);
      expect(result).to.deep.equal(obj);
    });
  });

  describe('asv() - AS variable', () => {
    it('should create column with name indicator', () => {
      const result = query.asv('myColumn', 'v:x');
      expect(result).to.deep.equal({
        '@type': 'Column',
        indicator: { '@type': 'Indicator', name: 'myColumn' },
        variable: 'x',
      });
    });

    it('should create column with index indicator', () => {
      const result = query.asv(0, 'v:x');
      expect(result).to.deep.equal({
        '@type': 'Column',
        indicator: { '@type': 'Indicator', index: 0 },
        variable: 'x',
      });
    });

    it('should handle Var instance', () => {
      const v = new Var('myVar');
      const result = query.asv('col', v);
      expect(result.variable).to.equal('myVar');
    });

    it('should include type if provided', () => {
      const result = query.asv('col', 'v:x', 'xsd:string');
      expect(result.type).to.equal('xsd:string');
    });
  });

  describe('cleanSubject()', () => {
    it('should handle string subject', () => {
      const result = query.cleanSubject('Person/john');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.node).to.equal('Person/john');
    });

    it('should handle variable string', () => {
      const result = query.cleanSubject('v:Subject');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.variable).to.equal('Subject');
    });

    it('should handle Var instance', () => {
      const v = new Var('s');
      const result = query.cleanSubject(v);
      expect(result['@type']).to.equal('NodeValue');
      expect(result.variable).to.equal('s');
    });

    it('should return object as-is', () => {
      const obj = { '@type': 'NodeValue', node: 'test' };
      const result = query.cleanSubject(obj);
      expect(result).to.equal(obj);
    });
  });

  describe('cleanPredicate()', () => {
    it('should handle simple predicate', () => {
      const result = query.cleanPredicate('name');
      expect(result['@type']).to.equal('NodeValue');
    });

    it('should handle prefixed predicate', () => {
      const result = query.cleanPredicate('rdfs:label');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.node).to.equal('rdfs:label');
    });

    it('should handle variable', () => {
      const result = query.cleanPredicate('v:p');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.variable).to.equal('p');
    });
  });

  describe('cleanObject()', () => {
    it('should handle string as node', () => {
      const result = query.cleanObject('Person/alice');
      expect(result['@type']).to.equal('Value');
      expect(result.node).to.equal('Person/alice');
    });

    it('should handle number as decimal', () => {
      const result = query.cleanObject(42);
      expect(result['@type']).to.equal('Value');
      expect(result.data['@type']).to.equal('xsd:decimal');
      expect(result.data['@value']).to.equal(42);
    });

    it('should handle boolean', () => {
      const result = query.cleanObject(true);
      expect(result['@type']).to.equal('Value');
      expect(result.data['@type']).to.equal('xsd:boolean');
      expect(result.data['@value']).to.be.true;
    });

    it('should handle variable string', () => {
      const result = query.cleanObject('v:x');
      expect(result['@type']).to.equal('Value');
      expect(result.variable).to.equal('x');
    });

    it('should handle Var instance', () => {
      const v = new Var('obj');
      const result = query.cleanObject(v);
      expect(result['@type']).to.equal('Value');
      expect(result.variable).to.equal('obj');
    });

    it('should handle Doc instance', () => {
      const doc = new Doc({ name: 'test' });
      const result = query.cleanObject(doc);
      expect(result).to.equal(doc);
    });

    it('should handle literal object', () => {
      const literal = { '@value': 'test', '@type': 'xsd:string' };
      const result = query.cleanObject({ '@value': 'test', '@type': 'xsd:string' });
      expect(result['@type']).to.equal('Value');
      expect(result.data).to.deep.equal(literal);
    });
  });

  describe('cleanDataValue()', () => {
    it('should handle string data', () => {
      const result = query.cleanDataValue('hello');
      expect(result['@type']).to.equal('DataValue');
      expect(result.data['@type']).to.equal('xsd:string');
      expect(result.data['@value']).to.equal('hello');
    });

    it('should handle number data', () => {
      const result = query.cleanDataValue(3.14);
      expect(result['@type']).to.equal('DataValue');
      expect(result.data['@type']).to.equal('xsd:decimal');
      expect(result.data['@value']).to.equal(3.14);
    });

    it('should handle boolean data', () => {
      const result = query.cleanDataValue(false);
      expect(result['@type']).to.equal('DataValue');
      expect(result.data['@type']).to.equal('xsd:boolean');
      expect(result.data['@value']).to.be.false;
    });

    it('should handle array data', () => {
      const result = query.cleanDataValue([1, 2, 3]);
      expect(result['@type']).to.equal('DataValue');
      expect(result.list).to.be.an('array');
      expect(result.list).to.have.lengthOf(3);
    });

    it('should handle variable', () => {
      const result = query.cleanDataValue('v:data');
      expect(result['@type']).to.equal('DataValue');
      expect(result.variable).to.equal('data');
    });
  });

  describe('cleanArithmeticValue()', () => {
    it('should handle number', () => {
      const result = query.cleanArithmeticValue(100);
      expect(result['@type']).to.equal('ArithmeticValue');
      expect(result.data['@type']).to.equal('xsd:decimal');
      expect(result.data['@value']).to.equal(100);
    });

    it('should handle variable', () => {
      const result = query.cleanArithmeticValue('v:num');
      expect(result['@type']).to.equal('ArithmeticValue');
      expect(result.variable).to.equal('num');
    });

    it('should handle Var instance', () => {
      const v = new Var('count');
      const result = query.cleanArithmeticValue(v);
      expect(result['@type']).to.equal('ArithmeticValue');
      expect(result.variable).to.equal('count');
    });
  });

  describe('cleanNodeValue()', () => {
    it('should handle string node', () => {
      const result = query.cleanNodeValue('doc:abc123');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.node).to.equal('doc:abc123');
    });

    it('should handle variable', () => {
      const result = query.cleanNodeValue('v:node');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.variable).to.equal('node');
    });

    it('should return object as-is', () => {
      const obj = { '@type': 'NodeValue', node: 'test' };
      const result = query.cleanNodeValue(obj);
      expect(result).to.equal(obj);
    });
  });

  describe('expandVariable()', () => {
    it('should expand v: prefix to variable', () => {
      const result = query.expandVariable('v:x', 'Value');
      expect(result).to.deep.equal({
        '@type': 'Value',
        variable: 'x',
      });
    });

    it('should expand Var instance', () => {
      const v = new Var('y');
      const result = query.expandVariable(v, 'Value');
      expect(result).to.deep.equal({
        '@type': 'Value',
        variable: 'y',
      });
    });

    it('should treat non-prefixed as node', () => {
      const result = query.expandVariable('test', 'NodeValue');
      expect(result).to.deep.equal({
        '@type': 'NodeValue',
        node: 'test',
      });
    });

    it('should force variable with always flag', () => {
      const result = query.expandVariable('test', 'Value', true);
      expect(result).to.deep.equal({
        '@type': 'Value',
        variable: 'test',
      });
    });
  });

  describe('expandValueVariable()', () => {
    it('should create Value type', () => {
      const result = query.expandValueVariable('v:x');
      expect(result['@type']).to.equal('Value');
      expect(result.variable).to.equal('x');
    });
  });

  describe('expandNodeVariable()', () => {
    it('should create NodeValue type', () => {
      const result = query.expandNodeVariable('v:node');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.variable).to.equal('node');
    });
  });

  describe('expandDataVariable()', () => {
    it('should create DataValue type', () => {
      const result = query.expandDataVariable('v:data');
      expect(result['@type']).to.equal('DataValue');
      expect(result.variable).to.equal('data');
    });
  });

  describe('expandArithmeticVariable()', () => {
    it('should create ArithmeticValue type', () => {
      const result = query.expandArithmeticVariable('v:num');
      expect(result['@type']).to.equal('ArithmeticValue');
      expect(result.variable).to.equal('num');
    });
  });

  describe('Vocabulary', () => {
    it('should load default vocabulary', () => {
      const vocab = query.loadDefaultVocabulary();
      expect(vocab).to.be.an('object');
      expect(vocab.Class).to.equal('owl:Class');
      expect(vocab.Document).to.equal('system:Document');
      expect(vocab.string).to.equal('xsd:string');
      expect(vocab.integer).to.equal('xsd:integer');
      expect(vocab.email).to.equal('xdd:email');
    });

    it('should set vocabulary', () => {
      const customVocab = { custom: 'ns:custom' };
      query.setVocabulary(customVocab);
      expect(query.vocab).to.equal(customVocab);
    });

    it('should get vocabulary', () => {
      const vocab = query.getVocabulary();
      expect(vocab).to.exist;
      expect(vocab.Class).to.equal('owl:Class');
    });

    it('should check well known predicates', () => {
      expect(query.wellKnownPredicate('Class')).to.be.true;
      expect(query.wellKnownPredicate('Document')).to.be.true;
      expect(query.wellKnownPredicate('unknown')).to.be.false;
    });

    it('should exclude xsd and xdd from well known', () => {
      expect(query.wellKnownPredicate('string')).to.be.false;
      expect(query.wellKnownPredicate('email')).to.be.false;
    });
  });

  describe('context()', () => {
    it('should set context', () => {
      const ctx = { '@base': 'http://example.com/' };
      query.context(ctx);
      expect(query.query['@context']).to.equal(ctx);
    });

    it('should get context from query', () => {
      const ctx = { '@base': 'http://example.com/' };
      query.query['@context'] = ctx;
      const result = query.getContext();
      expect(result).to.equal(ctx);
    });
  });

  describe('json()', () => {
    it('should return JSON copy of query', () => {
      query.query = { '@type': 'Triple', subject: 'a', predicate: 'b', object: 'c' };
      const result = query.json();
      expect(result).to.deep.equal(query.query);
      expect(result).to.not.equal(query.query); // should be a copy
    });

    it('should set query from JSON', () => {
      const newQuery = { '@type': 'And', and: [] };
      query.json(newQuery);
      expect(query.query).to.deep.equal(newQuery);
    });
  });

  describe('findLastSubject()', () => {
    it('should find subject in simple query', () => {
      const q = {
        '@type': 'Triple',
        subject: { '@type': 'NodeValue', node: 'a' },
        predicate: { '@type': 'NodeValue', node: 'b' },
        object: { '@type': 'Value', node: 'c' },
      };
      const result = query.findLastSubject(q);
      expect(result).to.equal(q);
    });

    it('should find subject in and clause', () => {
      const triple = {
        '@type': 'Triple',
        subject: { '@type': 'NodeValue', node: 'a' },
      };
      const q = {
        '@type': 'And',
        and: [
          { '@type': 'Other' },
          triple,
        ],
      };
      const result = query.findLastSubject(q);
      expect(result).to.equal(triple);
    });

    it('should find subject in nested query', () => {
      const triple = {
        '@type': 'Triple',
        subject: { '@type': 'NodeValue', node: 'a' },
      };
      const q = {
        '@type': 'Select',
        query: triple,
      };
      const result = query.findLastSubject(q);
      expect(result).to.equal(triple);
    });

    it('should return false if no subject found', () => {
      const q = { '@type': 'Other' };
      const result = query.findLastSubject(q);
      expect(result).to.be.false;
    });
  });

  describe('dataList()', () => {
    it('should handle string as variable', () => {
      const result = query.dataList('v:list');
      expect(result['@type']).to.equal('DataValue');
      expect(result.variable).to.equal('list');
    });

    it('should handle array of values', () => {
      const result = query.dataList([1, 'test', true]);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(3);
      expect(result[0]['@type']).to.equal('DataValue');
    });
  });

  describe('valueList()', () => {
    it('should handle string as variable', () => {
      const result = query.valueList('v:values');
      expect(result['@type']).to.equal('Value');
      expect(result.variable).to.equal('values');
    });

    it('should handle array of values', () => {
      const result = query.valueList(['a', 'b', 'c']);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(3);
    });
  });

  describe('vlist()', () => {
    it('should create variable name list', () => {
      const result = query.vlist(['v:a', 'v:b', 'v:c']);
      expect(result).to.deep.equal(['a', 'b', 'c']);
    });
  });

  describe('prettyPrint()', () => {
    it('should print query in JavaScript format', () => {
      query.query = { '@type': 'Triple', subject: 'a', predicate: 'b', object: 'c' };
      const result = query.prettyPrint('js');
      expect(result).to.be.a('string');
    });

    it('should print query in Python format', () => {
      query.query = { '@type': 'Triple', subject: 'a', predicate: 'b', object: 'c' };
      const result = query.prettyPrint('python');
      expect(result).to.be.a('string');
    });
  });

  describe('Integration tests', () => {
    it('should build query with cleaned values', () => {
      query.query = {
        '@type': 'Triple',
        subject: query.cleanSubject('v:s'),
        predicate: query.cleanPredicate('rdfs:label'),
        object: query.cleanObject('Test Label'),
      };

      expect(query.query.subject['@type']).to.equal('NodeValue');
      expect(query.query.subject.variable).to.equal('s');
      expect(query.query.object['@type']).to.equal('Value');
      expect(query.query.object.node).to.equal('Test Label');
    });

    it('should handle mixed variable formats', () => {
      const v = new Var('x');
      const cleanedVar = query.cleanSubject(v);
      const cleanedString = query.cleanSubject('v:y');

      expect(cleanedVar.variable).to.equal('x');
      expect(cleanedString.variable).to.equal('y');
    });
  });

  describe('wform() - format descriptor', () => {
    it('should create format with type', () => {
      query.cursor = {};
      query.wform({ type: 'csv' });
      expect(query.cursor.format).to.exist;
      expect(query.cursor.format['@type']).to.equal('Format');
      expect(query.cursor.format.format_type['@value']).to.equal('csv');
    });

    it('should handle format_header option', () => {
      query.cursor = {};
      query.wform({ type: 'csv', format_header: true });
      expect(query.cursor.format.format_header).to.exist;
      expect(query.cursor.format.format_header['@value']).to.be.true;
    });

    it('should handle format_header false', () => {
      query.cursor = {};
      query.wform({ type: 'csv', format_header: false });
      expect(query.cursor.format.format_header).to.exist;
      expect(query.cursor.format.format_header['@value']).to.be.false;
    });

    it('should not add format without type', () => {
      query.cursor = {};
      query.wform({});
      expect(query.cursor.format).to.be.undefined;
    });
  });

  describe('arop() - arithmetic operator', () => {
    it('should handle object argument', () => {
      const result = query.arop({ '@type': 'ArithmeticValue', data: { '@value': 42 } });
      expect(result).to.exist;
    });

    it('should handle number argument', () => {
      const result = query.arop(100);
      expect(result['@type']).to.equal('ArithmeticValue');
      expect(result.data['@value']).to.equal(100);
    });

    it('should handle variable string', () => {
      const result = query.arop('v:num');
      expect(result['@type']).to.equal('ArithmeticValue');
      expect(result.variable).to.equal('num');
    });
  });

  describe('dataValueList()', () => {
    it('should create list of data values', () => {
      const result = query.dataValueList([1, 'test', true]);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(3);
      expect(result[0]['@type']).to.equal('DataValue');
      expect(result[1]['@type']).to.equal('DataValue');
      expect(result[2]['@type']).to.equal('DataValue');
    });

    it('should handle empty list', () => {
      const result = query.dataValueList([]);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('cleanPathPredicate()', () => {
    it('should handle prefixed predicate', () => {
      const result = query.cleanPathPredicate('rdfs:label');
      expect(result).to.equal('rdfs:label');
    });

    it('should handle well-known predicate', () => {
      const result = query.cleanPathPredicate('Class');
      expect(result).to.equal('owl:Class');
    });

    it('should handle unknown predicate', () => {
      const result = query.cleanPathPredicate('customProp');
      expect(result).to.equal('customProp');
    });
  });

  describe('Error cases', () => {
    it('should handle invalid subject type', () => {
      const result = query.cleanSubject(123);
      expect(query.hasErrors()).to.be.true;
      expect(query.errors[0].message).to.include('Subject');
    });

    it('should handle invalid predicate type', () => {
      const result = query.cleanPredicate(456);
      expect(query.hasErrors()).to.be.true;
      // Find the predicate error
      const predicateError = query.errors.find(e => e.message.includes('Predicate'));
      expect(predicateError).to.exist;
    });
  });

  describe('cleanObject() edge cases', () => {
    it('should handle literal with @value', () => {
      const result = query.cleanObject({ '@value': 'test', '@type': 'xsd:string' });
      expect(result['@type']).to.equal('Value');
      expect(result.data).to.exist;
    });

    it('should handle Doc instance', () => {
      const doc = new Doc({ name: 'test', '@type': 'Person' });
      const result = query.cleanObject(doc);
      expect(result).to.exist;
    });
  });

  describe('containsUpdate() edge cases', () => {
    it('should handle empty and clause', () => {
      const q = { '@type': 'And', and: [] };
      expect(query.containsUpdate(q)).to.be.false;
    });

    it('should handle empty or clause', () => {
      const q = { '@type': 'Or', or: [] };
      expect(query.containsUpdate(q)).to.be.false;
    });

    it('should detect DeleteQuad', () => {
      const q = { '@type': 'DeleteQuad' };
      expect(query.containsUpdate(q)).to.be.true;
    });

    it('should use default query when no parameter', () => {
      query.query = { '@type': 'AddTriple' };
      expect(query.containsUpdate()).to.be.true;
    });
  });

  describe('expandVariable() edge cases', () => {
    it('should handle node when not always variable', () => {
      const result = query.expandVariable('mynode', 'NodeValue', false);
      expect(result['@type']).to.equal('NodeValue');
      expect(result.node).to.equal('mynode');
    });
  });

  describe('asv() edge cases', () => {
    it('should handle variable without v: prefix', () => {
      const result = query.asv('col', 'myvar');
      expect(result.variable).to.equal('myvar');
    });
  });

  describe('cleanPredicate() edge cases', () => {
    it('should handle predicate with colon', () => {
      const result = query.cleanPredicate('ns:property');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.node).to.equal('ns:property');
    });

    it('should handle well-known predicate', () => {
      const result = query.cleanPredicate('Class');
      expect(result['@type']).to.equal('NodeValue');
    });
  });

  describe('valueList() edge cases', () => {
    it('should clean string objects in array', () => {
      const result = query.valueList(['item1', 'item2']);
      expect(result).to.be.an('array');
      expect(result).to.have.lengthOf(2);
    });
  });

  describe('cleanArithmeticValue() edge cases', () => {
    it('should handle string with type', () => {
      const result = query.cleanArithmeticValue('test', 'xsd:string');
      expect(result['@type']).to.equal('ArithmeticValue');
      expect(result.data['@type']).to.equal('xsd:string');
    });

    it('should handle object with @value', () => {
      const result = query.cleanArithmeticValue({ '@value': 42, '@type': 'xsd:integer' });
      expect(result['@type']).to.equal('ArithmeticValue');
      expect(result.data['@value']).to.equal(42);
    });

    it('should return object without @value', () => {
      const obj = { '@type': 'Custom', data: 'test' };
      const result = query.cleanArithmeticValue(obj);
      expect(result).to.equal(obj);
    });
  });

  describe('cleanNodeValue() edge cases', () => {
    it('should handle object input', () => {
      const obj = { '@type': 'NodeValue', node: 'test' };
      const result = query.cleanNodeValue(obj);
      expect(result).to.equal(obj);
    });

    it('should handle plain string', () => {
      const result = query.cleanNodeValue('mynode');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.node).to.equal('mynode');
    });
  });

  describe('cleanGraph()', () => {
    it('should return graph as-is', () => {
      const graph = 'schema/main';
      const result = query.cleanGraph(graph);
      expect(result).to.equal(graph);
    });
  });

  describe('defaultContext()', () => {
    it('should create default context with DB IRI', () => {
      const context = query.defaultContext('http://example.com/db');
      expect(context).to.be.an('object');
      expect(context.scm).to.equal('http://example.com/db/schema#');
      expect(context.doc).to.equal('http://example.com/db/data/');
      expect(context.rdf).to.exist;
      expect(context.xsd).to.exist;
    });
  });

  describe('getContext() advanced', () => {
    it('should get context from nested paging property', () => {
      const ctx = { '@base': 'http://example.com/' };
      query.query = {
        '@type': 'Select',
        select: [null, {
          '@context': ctx,
          '@type': 'Triple',
        }],
      };
      const result = query.getContext();
      expect(result).to.equal(ctx);
    });

    it('should return undefined when no context found', () => {
      query.query = { '@type': 'Triple' };
      const result = query.getContext();
      expect(result).to.be.undefined;
    });
  });

  describe('cleanDataValue() with Doc instance', () => {
    it('should handle Doc instance', () => {
      const doc = new Doc({ name: 'test', '@type': 'Person' });
      const result = query.cleanDataValue(doc);
      expect(result).to.exist;
    });

    it('should handle object with @value in data', () => {
      const result = query.cleanDataValue({ '@value': 'data', '@type': 'xsd:string' });
      expect(result['@type']).to.equal('DataValue');
      expect(result.data).to.exist;
    });

    it('should return object without @value', () => {
      const obj = { '@type': 'Custom', prop: 'value' };
      const result = query.cleanDataValue(obj);
      expect(result).to.equal(obj);
    });
  });

  describe('cleanObject() more edge cases', () => {
    it('should handle object without @value', () => {
      const obj = { '@type': 'Custom', node: 'test' };
      const result = query.cleanObject(obj);
      expect(result).to.equal(obj);
    });
  });

  describe('findLastSubject() more cases', () => {
    it('should handle or clause', () => {
      const triple = {
        '@type': 'Triple',
        subject: { '@type': 'NodeValue', node: 'a' },
      };
      const q = {
        '@type': 'Or',
        or: [triple],
      };
      const result = query.findLastSubject(q);
      expect(result).to.equal(triple);
    });
  });

  describe('Path pattern functionality', () => {
    it('should handle path patterns in compilePathPattern', () => {
      // Test basic path compilation
      const result = query.compilePathPattern('prop');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathPredicate');
    });

    it('should handle inverse path with <', () => {
      const result = query.compilePathPattern('<prop');
      expect(result).to.exist;
      expect(result['@type']).to.equal('InversePathPredicate');
    });

    it('should handle forward path with >', () => {
      const result = query.compilePathPattern('prop>');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathPredicate');
    });

    it('should handle path sequence with comma', () => {
      const result = query.compilePathPattern('prop1,prop2');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathSequence');
    });

    it('should handle path or with pipe', () => {
      const result = query.compilePathPattern('prop1|prop2');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathOr');
    });

    it('should handle path plus', () => {
      const result = query.compilePathPattern('prop+');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathPlus');
    });

    it('should handle path star', () => {
      const result = query.compilePathPattern('prop*');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathStar');
    });

    it('should handle path times with range', () => {
      const result = query.compilePathPattern('prop{2,5}');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathTimes');
    });

    it('should handle bidirectional path with <>', () => {
      const result = query.compilePathPattern('<prop>');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathOr');
    });

    it('should handle dot predicate', () => {
      const result = query.compilePathPattern('.');
      expect(result).to.exist;
    });

    it('should handle path pattern with parentheses', () => {
      const result = query.compilePathPattern('(prop1|prop2)+');
      expect(result).to.exist;
      expect(result['@type']).to.equal('PathPlus');
    });

    it('should handle pattern starting with +', () => {
      const result = query.compilePathPattern('+prop');
      expect(result).to.exist;
    });

    it('should handle pattern starting with *', () => {
      const result = query.compilePathPattern('*prop');
      expect(result).to.exist;
    });

    it('should handle nested parentheses', () => {
      const result = query.compilePathPattern('((prop))' );
      expect(result).to.exist;
    });

    it('should handle ObjectProperty and DatatypeProperty with _is_property_triple', () => {
      expect(query._is_property_triple('rdf:type', 'owl:ObjectProperty')).to.be.true;
      expect(query._is_property_triple('rdf:type', 'owl:DatatypeProperty')).to.be.true;
    });

    it('should handle rdfs:domain and rdfs:range with _is_property_triple', () => {
      expect(query._is_property_triple('rdfs:domain', 'anything')).to.be.true;
      expect(query._is_property_triple('rdfs:range', 'anything')).to.be.true;
    });

    it('should handle regular predicates with _is_property_triple', () => {
      expect(query._is_property_triple('name', 'value')).to.be.false;
    });

    it('should handle objects with node property in _is_property_triple', () => {
      expect(query._is_property_triple({ node: 'rdfs:domain' }, { node: 'any' })).to.be.true;
    });
  });
});

