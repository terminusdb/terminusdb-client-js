const { expect } = require('chai');
const WOQL = require('../lib/woql');

describe('woql query', () => {
  describe('Arithmetic operations', () => {
    it('should handle div with two arguments', () => {
      const query = WOQL.div(10, 2);
      const json = query.json();
      
      expect(json['@type']).to.equal('Div');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });

    it('should handle exp (exponent)', () => {
      const query = WOQL.exp(2, 8);
      const json = query.json();
      
      expect(json['@type']).to.equal('Exp');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });

    it('should handle floor', () => {
      const query = WOQL.floor(3.14);
      const json = query.json();
      
      expect(json['@type']).to.equal('Floor');
      expect(json.argument).to.exist;
    });
  });

  describe('String and comparison operations', () => {
    it('should handle like without distance parameter', () => {
      const query = WOQL.like('hello', 'helo');
      const json = query.json();
      
      expect(json['@type']).to.equal('Like');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
      expect(json.similarity).to.be.undefined;
    });

    it('should handle like with distance parameter', () => {
      const query = WOQL.like('hello', 'helo', 0.8);
      const json = query.json();
      
      expect(json['@type']).to.equal('Like');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
      expect(json.similarity).to.exist;
    });

    it('should handle less comparison', () => {
      const query = WOQL.less(5, 10);
      const json = query.json();
      
      expect(json['@type']).to.equal('Less');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });

    it('should handle greater comparison', () => {
      const query = WOQL.greater(10, 5);
      const json = query.json();
      
      expect(json['@type']).to.equal('Greater');
      expect(json.left).to.exist;
      expect(json.right).to.exist;
    });
  });

  describe('List and array operations', () => {
    it('should handle length type', () => {
      const query = WOQL.length(['a', 'b', 'c'], 'v:Length');
      const json = query.json();
      
      expect(json['@type']).to.equal('Length');
      expect(json.list).to.exist;
      // Note: length property has a bug in source code (checks 'vb' instead of 'resultVarName')
    });
  });

  describe('order_by variations', () => {
    it('should handle order_by with single variable (default asc)', () => {
      const query = WOQL.order_by('v:Name', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('OrderBy');
      expect(json.ordering).to.exist;
      expect(json.ordering).to.be.an('array');
    });

    it('should handle order_by with array [variable, "asc"]', () => {
      const query = WOQL.order_by(['v:Name', 'asc']).triple('v:A', 'v:B', 'v:C');
      const json = query.json();
      
      expect(json['@type']).to.equal('OrderBy');
      expect(json.ordering).to.exist;
      expect(json.ordering[0].order).to.equal('asc');
    });

    it('should handle order_by with array [variable, "desc"]', () => {
      const query = WOQL.order_by(['v:Name', 'desc']).triple('v:A', 'v:B', 'v:C');
      const json = query.json();
      
      expect(json['@type']).to.equal('OrderBy');
      expect(json.ordering).to.exist;
      expect(json.ordering[0].order).to.equal('desc');
    });

    it('should handle order_by with multiple variables', () => {
      const query = WOQL.order_by('v:Name', ['v:Age', 'desc']).triple('v:A', 'v:B', 'v:C');
      const json = query.json();
      
      expect(json['@type']).to.equal('OrderBy');
      expect(json.ordering).to.be.an('array');
      expect(json.ordering.length).to.equal(2);
    });
  });

  describe('Document operations', () => {
    it('should handle read_document', () => {
      const query = WOQL.read_document('Person/P1', 'v:Doc');
      const json = query.json();
      
      expect(json['@type']).to.equal('ReadDocument');
      expect(json.identifier).to.exist;
      expect(json.document).to.exist;
    });

    it('should handle insert_document without IRI', () => {
      const doc = { '@type': 'Person', name: 'Alice' };
      const query = WOQL.insert_document(doc);
      const json = query.json();
      
      expect(json['@type']).to.equal('InsertDocument');
      expect(json.document).to.exist;
    });

    it('should handle insert_document with IRI', () => {
      const doc = { '@type': 'Person', name: 'Alice' };
      const query = WOQL.insert_document(doc, 'Person/Alice');
      const json = query.json();
      
      expect(json['@type']).to.equal('InsertDocument');
      expect(json.identifier).to.exist;
      expect(json.document).to.exist;
    });

    it('should handle update_document without IRI', () => {
      const doc = { '@type': 'Person', name: 'Bob' };
      const query = WOQL.update_document(doc);
      const json = query.json();
      
      expect(json['@type']).to.equal('UpdateDocument');
      expect(json.document).to.exist;
    });

    it('should handle update_document with IRI', () => {
      const doc = { '@type': 'Person', name: 'Bob' };
      const query = WOQL.update_document(doc, 'Person/Bob');
      const json = query.json();
      
      expect(json['@type']).to.equal('UpdateDocument');
      expect(json.identifier).to.exist;
    });

    it('should handle delete_document', () => {
      const query = WOQL.delete_document('Person/P1');
      const json = query.json();
      
      expect(json['@type']).to.equal('DeleteDocument');
      expect(json.identifier).to.exist;
    });
  });

  describe('Query modifiers', () => {
    it('should handle using with valid path', () => {
      const query = WOQL.using('admin/db', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Using');
      expect(json.collection).to.exist;
    });

    it('should handle comment', () => {
      const query = WOQL.comment('test comment', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Comment');
      expect(json.comment).to.exist;
    });

    it('should handle select with variables and query', () => {
      const query = WOQL.select('v:A', 'v:B', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Select');
      expect(json.variables).to.exist;
    });

    it('should handle select chained', () => {
      const query = WOQL.select('v:A', 'v:B').triple('v:A', 'v:B', 'v:C');
      const json = query.json();
      
      expect(json['@type']).to.equal('Select');
      expect(json.variables).to.exist;
    });

    it('should handle distinct with variables and query', () => {
      const query = WOQL.distinct('v:A', 'v:B', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Distinct');
      expect(json.variables).to.exist;
    });

    it('should handle opt (optional)', () => {
      const subquery = WOQL.triple('v:A', 'v:B', 'v:C');
      const query = WOQL.opt(subquery);
      const json = query.json();
      
      expect(json['@type']).to.equal('Optional');
      expect(json.query).to.exist;
    });

    it('should handle optional alias', () => {
      const subquery = WOQL.triple('v:A', 'v:B', 'v:C');
      const query = WOQL.optional(subquery);
      const json = query.json();
      
      expect(json['@type']).to.equal('Optional');
    });
  });

  describe('Triple and quad operations', () => {
    it('should handle added_triple', () => {
      const query = WOQL.added_triple('v:S', 'v:P', 'v:O');
      const json = query.json();
      
      expect(json['@type']).to.equal('AddedTriple');
      expect(json.subject).to.exist;
      expect(json.predicate).to.exist;
      expect(json.object).to.exist;
    });

    it('should handle removed_triple', () => {
      const query = WOQL.removed_triple('v:S', 'v:P', 'v:O');
      const json = query.json();
      
      expect(json['@type']).to.equal('DeletedTriple');
    });

    it('should handle link', () => {
      const query = WOQL.link('Person/P1', 'knows', 'Person/P2');
      const json = query.json();
      
      expect(json['@type']).to.equal('Triple');
      expect(json.subject).to.exist;
      expect(json.predicate).to.exist;
      expect(json.object).to.exist;
    });

    it('should handle value', () => {
      const query = WOQL.value('Person/P1', 'name', 'Alice');
      const json = query.json();
      
      expect(json['@type']).to.equal('Triple');
    });

    it('should handle added_quad', () => {
      const query = WOQL.added_quad('v:S', 'v:P', 'v:O', 'schema/main');
      const json = query.json();
      
      expect(json['@type']).to.equal('AddedQuad');
      expect(json.graph).to.exist;
    });

    it('should handle removed_quad', () => {
      const query = WOQL.removed_quad('v:S', 'v:P', 'v:O', 'schema/main');
      const json = query.json();
      
      expect(json['@type']).to.equal('DeletedQuad');
    });
  });

  describe('Additional operations', () => {
    it('should handle sub (subsumption)', () => {
      const query = WOQL.sub('Dog', 'Animal');
      const json = query.json();
      
      expect(json['@type']).to.equal('Subsumption');
    });

    it('should handle subsumption alias', () => {
      const query = WOQL.subsumption('Cat', 'Animal');
      const json = query.json();
      
      expect(json['@type']).to.equal('Subsumption');
    });

    it('should handle eq (equals)', () => {
      const query = WOQL.eq('v:A', 'v:B');
      const json = query.json();
      
      expect(json['@type']).to.equal('Equals');
    });

    it('should handle equals alias', () => {
      const query = WOQL.equals('v:X', 'v:Y');
      const json = query.json();
      
      expect(json['@type']).to.equal('Equals');
    });

    it('should handle substr with all parameters', () => {
      const query = WOQL.substr('Hello World', 0, 5, 6, 'v:Result');
      const json = query.json();
      
      expect(json['@type']).to.equal('Substring');
      expect(json.string).to.exist;
      expect(json.before).to.exist;
      expect(json.length).to.exist;
      expect(json.after).to.exist;
      expect(json.substring).to.exist;
    });

    it('should handle substring alias', () => {
      const query = WOQL.substring('test', 0, 2, 2, 'v:Sub');
      const json = query.json();
      
      expect(json['@type']).to.equal('Substring');
    });

    it('should handle isa', () => {
      const query = WOQL.isa('Person/P1', 'Person');
      const json = query.json();
      
      expect(json['@type']).to.equal('IsA');
      expect(json.element).to.exist;
      expect(json.type).to.exist;
    });

    it('should handle unique (hash key)', () => {
      const query = WOQL.unique('doc:Person', ['v:Name', 'v:Age'], 'v:ID');
      const json = query.json();
      
      expect(json['@type']).to.equal('HashKey');
      expect(json.base).to.exist;
      expect(json.key_list).to.exist;
      expect(json.uri).to.exist;
    });
  });

  describe('Logical operations', () => {
    // Note: from() has a bug in source (checks typeof graph instead of typeof graphRef)
    // so it always returns an error

    it('should handle into', () => {
      const query = WOQL.into('instance/main', WOQL.triple('v:A', 'v:B', 'v:C'));
      const json = query.json();
      
      expect(json['@type']).to.equal('Into');
      expect(json.graph).to.exist;
    });
  });

  describe('Error handling', () => {
    it('should handle sub without parameters', () => {
      const query = WOQL.sub();
      expect(query.hasErrors()).to.be.true;
    });

    it('should handle eq without parameters', () => {
      const query = WOQL.eq();
      expect(query.hasErrors()).to.be.true;
    });

    it('should handle using with invalid path', () => {
      const query = WOQL.using(null);
      expect(query.hasErrors()).to.be.true;
    });
  });
});
