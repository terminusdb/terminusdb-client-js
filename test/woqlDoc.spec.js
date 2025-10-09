const { expect } = require('chai');
const { Vars, Var, Doc } = require('../lib/query/woqlDoc');

describe('woqlDoc tests', () => {
  describe('Var', () => {
    it('should create a Var instance with name', () => {
      const variable = new Var('myVar');
      expect(variable.name).to.equal('myVar');
    });

    it('should generate JSON representation', () => {
      const variable = new Var('testVar');
      const json = variable.json();
      
      expect(json).to.deep.equal({
        '@type': 'Value',
        variable: 'testVar',
      });
    });

    it('should handle different variable names', () => {
      const var1 = new Var('x');
      const var2 = new Var('SomeVariable');
      const var3 = new Var('var_with_underscore');
      
      expect(var1.name).to.equal('x');
      expect(var2.name).to.equal('SomeVariable');
      expect(var3.name).to.equal('var_with_underscore');
    });
  });

  describe('Vars', () => {
    it('should create multiple variables from arguments', () => {
      const vars = Vars('x', 'y', 'z');
      
      expect(vars.x).to.be.instanceOf(Var);
      expect(vars.y).to.be.instanceOf(Var);
      expect(vars.z).to.be.instanceOf(Var);
      expect(vars.x.name).to.equal('x');
      expect(vars.y.name).to.equal('y');
      expect(vars.z.name).to.equal('z');
    });

    it('should create single variable', () => {
      const vars = Vars('singleVar');
      
      expect(vars.singleVar).to.be.instanceOf(Var);
      expect(vars.singleVar.name).to.equal('singleVar');
    });

    it('should return empty object for no arguments', () => {
      const vars = Vars();
      
      expect(vars).to.be.an('object');
      expect(Object.keys(vars)).to.have.lengthOf(0);
    });

    it('should handle many variables', () => {
      const vars = Vars('a', 'b', 'c', 'd', 'e', 'f');
      
      expect(Object.keys(vars)).to.have.lengthOf(6);
      expect(vars.a.name).to.equal('a');
      expect(vars.f.name).to.equal('f');
    });

    it('should create variables with descriptive names', () => {
      const vars = Vars('firstName', 'lastName', 'age');
      
      expect(vars.firstName.name).to.equal('firstName');
      expect(vars.lastName.name).to.equal('lastName');
      expect(vars.age.name).to.equal('age');
    });
  });

  describe('Doc', () => {
    describe('null and undefined', () => {
      it('should encode null as null', () => {
        const docInstance = new Doc(null);
        // Doc constructor returns the encoded value
        // When using 'new', it creates instance but encoded property is null
        expect(docInstance.encoded).to.be.null;
        expect(docInstance.doc).to.be.null;
      });

      it('should encode undefined as null', () => {
        const docInstance = new Doc(undefined);
        expect(docInstance.encoded).to.be.null;
        expect(docInstance.doc).to.be.undefined;
      });
    });

    describe('number conversion', () => {
      it('should convert integer to xsd:decimal', () => {
        const doc = new Doc(42);
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:decimal',
            '@value': 42,
          },
        });
      });

      it('should convert float to xsd:decimal', () => {
        const doc = new Doc(3.14);
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:decimal',
            '@value': 3.14,
          },
        });
      });

      it('should convert negative number', () => {
        const doc = new Doc(-100);
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:decimal',
            '@value': -100,
          },
        });
      });

      it('should convert zero', () => {
        const doc = new Doc(0);
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:decimal',
            '@value': 0,
          },
        });
      });
    });

    describe('boolean conversion', () => {
      it('should convert true to xsd:boolean', () => {
        const doc = new Doc(true);
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:boolean',
            '@value': true,
          },
        });
      });

      it('should convert false to xsd:boolean', () => {
        const doc = new Doc(false);
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:boolean',
            '@value': false,
          },
        });
      });
    });

    describe('string conversion', () => {
      it('should convert regular string to xsd:string', () => {
        const doc = new Doc('hello world');
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:string',
            '@value': 'hello world',
          },
        });
      });

      it('should convert empty string to xsd:string', () => {
        const doc = new Doc('');
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:string',
            '@value': '',
          },
        });
      });

      it('should convert variable string v:name to variable', () => {
        const doc = new Doc('v:myVar');
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          variable: 'myVar',
        });
      });

      it('should convert variable string v:x to variable', () => {
        const doc = new Doc('v:x');
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          variable: 'x',
        });
      });

      it('should treat string with v: in middle as variable', () => {
        // The current implementation checks if 'v:' exists anywhere in the string
        // and treats it as a variable by splitting on ':'
        const doc = new Doc('some v: text');
        
        // The string is split on ':' so 'some v: text' becomes variable ' text'
        expect(doc).to.deep.equal({
          '@type': 'Value',
          variable: ' text',
        });
      });
    });

    describe('Var instance conversion', () => {
      it('should convert Var instance to variable', () => {
        const variable = new Var('testVar');
        const doc = new Doc(variable);
        
        expect(doc).to.deep.equal({
          '@type': 'Value',
          variable: 'testVar',
        });
      });

      it('should handle multiple Var instances separately', () => {
        const var1 = new Var('x');
        const var2 = new Var('y');
        
        const doc1 = new Doc(var1);
        const doc2 = new Doc(var2);
        
        expect(doc1.variable).to.equal('x');
        expect(doc2.variable).to.equal('y');
      });
    });

    describe('object conversion', () => {
      it('should convert simple object to dictionary', () => {
        const doc = new Doc({ name: 'John', age: 30 });
        
        expect(doc).to.have.property('@type', 'Value');
        expect(doc).to.have.property('dictionary');
        expect(doc.dictionary['@type']).to.equal('DictionaryTemplate');
        expect(doc.dictionary.data).to.be.an('array');
        expect(doc.dictionary.data).to.have.lengthOf(2);
      });

      it('should convert nested object values', () => {
        const doc = new Doc({ name: 'Alice', active: true });
        
        expect(doc.dictionary.data[0].field).to.equal('name');
        expect(doc.dictionary.data[0].value).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:string',
            '@value': 'Alice',
          },
        });
        
        expect(doc.dictionary.data[1].field).to.equal('active');
        expect(doc.dictionary.data[1].value).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:boolean',
            '@value': true,
          },
        });
      });

      it('should convert object with variable', () => {
        const doc = new Doc({ id: 'v:userId', name: 'John' });
        
        const idPair = doc.dictionary.data.find(p => p.field === 'id');
        expect(idPair.value).to.deep.equal({
          '@type': 'Value',
          variable: 'userId',
        });
      });

      it('should handle empty object', () => {
        const doc = new Doc({});
        
        expect(doc.dictionary.data).to.be.an('array');
        expect(doc.dictionary.data).to.have.lengthOf(0);
      });

      it('should convert object with Var instance', () => {
        const variable = new Var('myVar');
        const doc = new Doc({ key: variable });
        
        const pair = doc.dictionary.data[0];
        expect(pair.field).to.equal('key');
        expect(pair.value).to.deep.equal({
          '@type': 'Value',
          variable: 'myVar',
        });
      });
    });

    describe('array conversion', () => {
      it('should convert array of primitives', () => {
        const doc = new Doc([1, 2, 3]);
        
        expect(doc).to.have.property('@type', 'Value');
        expect(doc).to.have.property('list');
        expect(doc.list).to.be.an('array');
        expect(doc.list).to.have.lengthOf(3);
      });

      it('should convert array of strings', () => {
        const doc = new Doc(['a', 'b', 'c']);
        
        expect(doc.list[0]).to.deep.equal({
          '@type': 'Value',
          data: {
            '@type': 'xsd:string',
            '@value': 'a',
          },
        });
      });

      it('should convert array of mixed types', () => {
        const doc = new Doc([1, 'text', true]);
        
        expect(doc.list[0].data['@type']).to.equal('xsd:decimal');
        expect(doc.list[1].data['@type']).to.equal('xsd:string');
        expect(doc.list[2].data['@type']).to.equal('xsd:boolean');
      });

      it('should convert empty array', () => {
        const doc = new Doc([]);
        
        expect(doc.list).to.be.an('array');
        expect(doc.list).to.have.lengthOf(0);
      });

      it('should convert array with variables', () => {
        const doc = new Doc(['v:x', 'v:y']);
        
        expect(doc.list[0]).to.deep.equal({
          '@type': 'Value',
          variable: 'x',
        });
        expect(doc.list[1]).to.deep.equal({
          '@type': 'Value',
          variable: 'y',
        });
      });

      it('should convert array with Var instances', () => {
        const var1 = new Var('a');
        const var2 = new Var('b');
        const doc = new Doc([var1, var2]);
        
        expect(doc.list[0].variable).to.equal('a');
        expect(doc.list[1].variable).to.equal('b');
      });

      it('should convert nested arrays', () => {
        const doc = new Doc([[1, 2], [3, 4]]);
        
        expect(doc.list).to.have.lengthOf(2);
        expect(doc.list[0]).to.have.property('list');
        expect(doc.list[0].list).to.have.lengthOf(2);
      });
    });

    describe('complex nested structures', () => {
      it('should convert object with nested object', () => {
        const doc = new Doc({
          person: {
            name: 'John',
            age: 30,
          },
        });
        
        const personPair = doc.dictionary.data.find(p => p.field === 'person');
        expect(personPair.value['@type']).to.equal('Value');
        expect(personPair.value.dictionary).to.exist;
        expect(personPair.value.dictionary.data).to.have.lengthOf(2);
      });

      it('should convert object with array value', () => {
        const doc = new Doc({
          tags: ['red', 'blue', 'green'],
        });
        
        const tagsPair = doc.dictionary.data.find(p => p.field === 'tags');
        expect(tagsPair.value['@type']).to.equal('Value');
        expect(tagsPair.value.list).to.be.an('array');
        expect(tagsPair.value.list).to.have.lengthOf(3);
      });

      it('should convert array of objects', () => {
        const doc = new Doc([
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ]);
        
        expect(doc.list).to.have.lengthOf(2);
        expect(doc.list[0].dictionary).to.exist;
        expect(doc.list[1].dictionary).to.exist;
      });

      it('should convert deeply nested structure', () => {
        const doc = new Doc({
          level1: {
            level2: {
              level3: 'deep value',
            },
          },
        });
        
        const level1 = doc.dictionary.data[0];
        expect(level1.field).to.equal('level1');
        expect(level1.value.dictionary).to.exist;
        
        const level2 = level1.value.dictionary.data[0];
        expect(level2.field).to.equal('level2');
        expect(level2.value.dictionary).to.exist;
      });
    });

    describe('real-world examples', () => {
      it('should convert person document', () => {
        const doc = new Doc({
          '@type': 'Person',
          name: 'John Doe',
          age: 30,
          active: true,
        });
        
        expect(doc.dictionary.data).to.have.lengthOf(4);
        const typePair = doc.dictionary.data.find(p => p.field === '@type');
        const namePair = doc.dictionary.data.find(p => p.field === 'name');
        const agePair = doc.dictionary.data.find(p => p.field === 'age');
        const activePair = doc.dictionary.data.find(p => p.field === 'active');
        
        expect(typePair.value.data['@value']).to.equal('Person');
        expect(namePair.value.data['@value']).to.equal('John Doe');
        expect(agePair.value.data['@value']).to.equal(30);
        expect(activePair.value.data['@value']).to.be.true;
      });

      it('should convert document with variable bindings', () => {
        const vars = Vars('name', 'email');
        const doc = new Doc({
          '@type': 'User',
          name: vars.name,
          email: vars.email,
        });
        
        const namePair = doc.dictionary.data.find(p => p.field === 'name');
        const emailPair = doc.dictionary.data.find(p => p.field === 'email');
        
        expect(namePair.value.variable).to.equal('name');
        expect(emailPair.value.variable).to.equal('email');
      });

      it('should convert query result with variables', () => {
        const doc = new Doc({
          subject: 'v:Subject',
          predicate: 'v:Predicate',
          object: 'v:Object',
        });
        
        doc.dictionary.data.forEach(pair => {
          expect(pair.value['@type']).to.equal('Value');
          expect(pair.value.variable).to.exist;
        });
      });
    });
  });

  describe('Integration tests', () => {
    it('should work with Vars and Doc together', () => {
      const vars = Vars('x', 'y', 'z');
      const doc = new Doc({
        a: vars.x,
        b: vars.y,
        c: vars.z,
      });
      
      expect(doc.dictionary.data).to.have.lengthOf(3);
      expect(doc.dictionary.data[0].value.variable).to.equal('x');
      expect(doc.dictionary.data[1].value.variable).to.equal('y');
      expect(doc.dictionary.data[2].value.variable).to.equal('z');
    });

    it('should handle mixed variable types', () => {
      const varInstance = new Var('instanceVar');
      const doc = new Doc({
        var1: 'v:stringVar',
        var2: varInstance,
        literal: 'not a variable',
      });
      
      const var1Pair = doc.dictionary.data.find(p => p.field === 'var1');
      const var2Pair = doc.dictionary.data.find(p => p.field === 'var2');
      const literalPair = doc.dictionary.data.find(p => p.field === 'literal');
      
      expect(var1Pair.value.variable).to.equal('stringVar');
      expect(var2Pair.value.variable).to.equal('instanceVar');
      expect(literalPair.value.data['@value']).to.equal('not a variable');
    });
  });
});
