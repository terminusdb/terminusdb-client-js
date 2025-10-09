const { expect } = require('chai');

const WOQL = require('../lib/woql');
const woqlJson = require('./woqlJson/woqlJson');

describe('triple builder chaining methods', () => {
  it('check the node method', () => {
    const woqlObject = WOQL.node('some_node');
    const jsonObj = {}; // "@type": "woql:And"};
    expect(woqlObject.json()).to.eql(jsonObj);
    // console.log('HELLO HELLO',JSON.stringify(woqlObject.json(), null, 4));
  });

  it('check the graph method', () => {
    const woqlObject = WOQL.node('a', 'AddQuad').graph('schema');

    const jsonObj = {};
    expect(woqlObject.json()).to.eql(jsonObj);
  });

  it('check the dot chaining ', () => {
    const woqlObject = WOQL.triple('A', 'B', 'C').triple('D', 'E', 'F');
    const v2 = WOQL.and(
      WOQL.triple('A', 'B', 'C'),
      WOQL.triple('D', 'E', 'F'),
    );
    const v3 = WOQL.triple('A', 'B', 'C').and().triple('D', 'E', 'F');

    expect(woqlObject.json()).to.eql(v2.json());
    expect(woqlObject.json()).to.eql(v3.json());
    // console.log(JSON.stringify(woqlObject.json(), null, 4));
  });
});

describe('woqlBuilder methods for branch coverage', () => {
  describe('star() and all()', () => {
    it('should create star query', () => {
      const query = WOQL.star();
      expect(query).to.exist;
      expect(query.json()).to.have.property('@type');
    });

    it('should create all query', () => {
      const query = WOQL.all();
      expect(query).to.exist;
      expect(query.json()).to.have.property('@type');
    });
  });

  describe('string(), boolean(), literal(), iri()', () => {
    it('should create string literal', () => {
      const result = WOQL.string('test');
      expect(result['@type']).to.equal('xsd:string');
      expect(result['@value']).to.equal('test');
    });

    it('should create boolean with default false', () => {
      const result = WOQL.boolean();
      expect(result['@type']).to.equal('xsd:boolean');
      expect(result['@value']).to.equal(false);
    });

    it('should create boolean with true', () => {
      const result = WOQL.boolean(true);
      expect(result['@type']).to.equal('xsd:boolean');
      expect(result['@value']).to.equal(true);
    });

    it('should create literal without colon in type', () => {
      const result = WOQL.literal('value', 'string');
      expect(result['@type']).to.equal('xsd:string');
      expect(result['@value']).to.equal('value');
    });

    it('should create literal with colon in type', () => {
      const result = WOQL.literal('value', 'xsd:integer');
      expect(result['@type']).to.equal('xsd:integer');
      expect(result['@value']).to.equal('value');
    });

    it('should create IRI node', () => {
      const result = WOQL.iri('Person/john');
      expect(result['@type']).to.equal('NodeValue');
      expect(result.node).to.equal('Person/john');
    });
  });

  describe('update_triple() and update_quad()', () => {
    it('should update triple without oldObjValue', () => {
      const query = WOQL.update_triple('subject', 'predicate', 'newValue');
      const json = query.json();
      expect(json['@type']).to.equal('And');
    });

    it('should update triple with oldObjValue', () => {
      const query = WOQL.update_triple('subject', 'predicate', 'newValue', 'oldValue');
      const json = query.json();
      expect(json['@type']).to.equal('And');
    });

    it('should update quad', () => {
      const query = WOQL.update_quad('subject', 'predicate', 'newValue', 'schema/main');
      const json = query.json();
      expect(json['@type']).to.equal('And');
    });
  });

  describe('nuke()', () => {
    it('should nuke with graphRef', () => {
      const query = WOQL.nuke('schema/main');
      const json = query.json();
      expect(json['@type']).to.equal('And');
    });

    it('should nuke without graphRef', () => {
      const query = WOQL.nuke();
      const json = query.json();
      expect(json['@type']).to.equal('And');
    });
  });

  describe('node() with different types', () => {
    it('should create node with add_quad type', () => {
      const query = WOQL.node('n', 'add_quad');
      expect(query.triple_builder_context).to.exist;
      expect(query.triple_builder_context.action).to.equal('AddTriple');
    });

    it('should create node with delete_quad type', () => {
      const query = WOQL.node('n', 'delete_quad');
      expect(query.triple_builder_context.action).to.equal('DeleteTriple');
    });

    it('should create node with add_triple type', () => {
      const query = WOQL.node('n', 'add_triple');
      expect(query.triple_builder_context.action).to.equal('AddTriple');
    });

    it('should create node with delete_triple type', () => {
      const query = WOQL.node('n', 'delete_triple');
      expect(query.triple_builder_context.action).to.equal('DeleteTriple');
    });

    it('should create node with quad type', () => {
      const query = WOQL.node('n', 'quad');
      expect(query.triple_builder_context.action).to.equal('Triple');
    });

    it('should create node with triple type', () => {
      const query = WOQL.node('n', 'triple');
      expect(query.triple_builder_context.action).to.equal('Triple');
    });

    it('should create node without type', () => {
      const query = WOQL.node('n');
      expect(query.triple_builder_context.subject).to.equal('n');
      expect(query.triple_builder_context.action).to.be.undefined;
    });
  });

  describe('insert()', () => {
    it('should insert and return query', () => {
      const query = WOQL.insert('id', 'Person');
      expect(query).to.exist;
      expect(query.json()).to.have.property('@type');
    });

    it('should insert with graph context', () => {
      const query = WOQL.graph('schema/main');
      expect(query).to.exist;
      expect(query.triple_builder_context).to.exist;
    });
  });
});
