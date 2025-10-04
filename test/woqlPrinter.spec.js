const { expect } = require('chai');
const WOQLPrinter = require('../lib/query/woqlPrinter');

describe('WOQLPrinter tests', () => {
  let printer;

  beforeEach(() => {
    printer = new WOQLPrinter({}, 'javascript');
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(printer.vocab).to.deep.equal({});
      expect(printer.language).to.equal('javascript');
      expect(printer.indent_spaces).to.equal(4);
      expect(printer.show_context).to.equal(false);
    });

    it('should initialize with custom vocab and language', () => {
      const customPrinter = new WOQLPrinter({ label: 'rdfs:label' }, 'python');
      expect(customPrinter.vocab).to.deep.equal({ label: 'rdfs:label' });
      expect(customPrinter.language).to.equal('python');
    });
  });

  describe('printJSON', () => {
    it('should print a simple triple', () => {
      const json = {
        '@type': 'Triple',
        subject: { '@type': 'NodeValue', variable: 'Subject' },
        predicate: { '@type': 'NodeValue', node: 'rdf:type' },
        object: { '@type': 'Value', variable: 'Object' },
      };

      const result = printer.printJSON(json);
      expect(result).to.include('WOQL.triple');
      expect(result).to.include('v:Subject');
      expect(result).to.include('rdf:type');
      expect(result).to.include('v:Object');
    });

    it('should return empty string for JSON without @type', () => {
      const json = { foo: 'bar' };
      const result = printer.printJSON(json);
      expect(result).to.equal('');
    });

    it('should handle Value types', () => {
      const json = { '@type': 'Value', variable: 'myVar' };
      const result = printer.printJSON(json);
      expect(result).to.equal('"v:myVar"');
    });

    it('should handle NodeValue types', () => {
      const json = { '@type': 'NodeValue', node: 'doc:mydoc' };
      const result = printer.printJSON(json);
      expect(result).to.equal('"doc:mydoc"');
    });

    it('should handle DataValue types', () => {
      const json = {
        '@type': 'DataValue',
        data: { '@type': 'xsd:string', '@value': 'test' },
      };
      const result = printer.printJSON(json);
      expect(result).to.include('xsd:string');
    });

    it('should handle And operator', () => {
      const json = {
        '@type': 'And',
        and: [
          {
            '@type': 'Triple',
            subject: { '@type': 'NodeValue', variable: 'a' },
            predicate: { '@type': 'NodeValue', node: 'rdf:type' },
            object: { '@type': 'Value', node: 'Person' },
          },
          {
            '@type': 'Triple',
            subject: { '@type': 'NodeValue', variable: 'a' },
            predicate: { '@type': 'NodeValue', node: 'label' },
            object: { '@type': 'Value', variable: 'name' },
          },
        ],
      };

      const result = printer.printJSON(json);
      expect(result).to.include('WOQL.and');
      expect(result).to.include('WOQL.triple');
    });
  });

  describe('getQueryResourceStr', () => {
    it('should handle remote URL resources', () => {
      const json = {
        '@type': 'QueryResource',
        source: { url: 'https://example.com/data.csv' },
        format: 'csv',
      };

      const result = printer.getQueryResourceStr(json, 0, false, false);
      expect(result).to.include('WOQL.remote');
      expect(result).to.include('https://example.com/data.csv');
    });

    it('should handle file resources', () => {
      const json = {
        '@type': 'QueryResource',
        source: { file: '/path/to/file.csv' },
        format: 'csv',
      };

      const result = printer.getQueryResourceStr(json, 0, false, false);
      expect(result).to.include('WOQL.file');
      expect(result).to.include('/path/to/file.csv');
    });

    it('should omit format if csv', () => {
      const json = {
        '@type': 'QueryResource',
        source: { url: 'https://example.com/data.csv' },
        format: 'csv',
      };

      const result = printer.getQueryResourceStr(json, 0, false, false);
      expect(result).not.to.include(', csv');
    });

    it('should include format if not csv', () => {
      const json = {
        '@type': 'QueryResource',
        source: { url: 'https://example.com/data.json' },
        format: 'json',
      };

      const result = printer.getQueryResourceStr(json, 0, false, false);
      expect(result).to.include(', json');
    });

    it('should return empty string if no source', () => {
      const json = { '@type': 'QueryResource' };
      const result = printer.getQueryResourceStr(json, 0, false, false);
      expect(result).to.equal('');
    });
  });

  describe('getArgumentOrder', () => {
    it('should return keys without @type', () => {
      const json = {
        '@type': 'Triple',
        subject: 'a',
        predicate: 'b',
        object: 'c',
      };

      const result = printer.getArgumentOrder('Triple', json);
      expect(result).to.deep.equal(['subject', 'predicate', 'object']);
      expect(result).not.to.include('@type');
    });

    it('should handle empty object', () => {
      const json = { '@type': 'Triple' };
      const result = printer.getArgumentOrder('Triple', json);
      expect(result).to.deep.equal([]);
    });
  });

  describe('argumentTakesNewline', () => {
    it('should return true for And operator', () => {
      expect(printer.argumentTakesNewline('And')).to.be.true;
    });

    it('should return true for Or operator', () => {
      expect(printer.argumentTakesNewline('Or')).to.be.true;
    });

    it('should return false for Triple operator', () => {
      expect(printer.argumentTakesNewline('Triple')).to.be.false;
    });
  });

  describe('argumentRequiresArray', () => {
    it('should return true for group_by with multiple entries', () => {
      expect(printer.argumentRequiresArray('group_by', ['a', 'b'])).to.be.true;
    });

    it('should return false for group_by with single entry', () => {
      expect(printer.argumentRequiresArray('group_by', ['a'])).to.be.false;
    });

    it('should return true for list with multiple entries', () => {
      expect(printer.argumentRequiresArray('list', ['a', 'b'])).to.be.true;
    });

    it('should return false for other predicates', () => {
      expect(printer.argumentRequiresArray('subject', ['a', 'b'])).to.be.false;
    });
  });

  describe('pvar', () => {
    it('should handle variable with v: prefix', () => {
      const json = { variable: 'myVar' };
      const result = printer.pvar(json);
      expect(result).to.equal('"v:myVar"');
    });

    it('should handle variable already with v: prefix', () => {
      const json = { variable: 'v:myVar' };
      const result = printer.pvar(json);
      expect(result).to.equal('"v:myVar"');
    });

    it('should handle variable with order', () => {
      const json = { variable: 'myVar', order: 'desc' };
      const result = printer.pvar(json);
      expect(result).to.equal('["v:myVar","desc"]');
    });

    it('should handle variable with asc order (default)', () => {
      const json = { variable: 'myVar', order: 'asc' };
      const result = printer.pvar(json);
      expect(result).to.equal('"v:myVar"');
    });

    it('should handle node', () => {
      const json = { node: 'doc:mydoc' };
      const result = printer.pvar(json);
      expect(result).to.equal('"doc:mydoc"');
    });

    it('should handle data', () => {
      const json = { data: { '@type': 'xsd:string', '@value': 'test' } };
      const result = printer.pvar(json);
      expect(result).to.include('xsd:string');
      expect(result).to.include('test');
    });

    it('should handle list array', () => {
      const json = {
        list: [
          { variable: 'a' },
          { variable: 'b' },
          { node: 'doc:test' },
        ],
      };
      const result = printer.pvar(json);
      expect(result).to.equal('["v:a", "v:b", "doc:test"]');
    });

    it('should handle list object', () => {
      const json = { list: { variable: 'myVar' } };
      const result = printer.pvar(json);
      expect(result).to.equal('"v:myVar"');
    });

    it('should return false for unrecognized structure', () => {
      const json = { unknown: 'value' };
      const result = printer.pvar(json);
      expect(result).to.be.false;
    });
  });

  describe('getWOQLPrelude', () => {
    it('should return WOQL. prefix for non-fluent', () => {
      const result = printer.getWOQLPrelude('triple', false, 0);
      expect(result).to.equal('WOQL.triple');
    });

    it('should return .operator for fluent', () => {
      const result = printer.getWOQLPrelude('triple', true, 0);
      expect(result).to.equal('.triple');
    });

    it('should handle true operator in javascript', () => {
      const result = printer.getWOQLPrelude('true', false, 0);
      expect(result).to.equal('true');
    });

    it('should handle false operator in javascript', () => {
      const result = printer.getWOQLPrelude('false', false, 0);
      expect(result).to.equal('false');
    });

    it('should handle true operator in python', () => {
      const pythonPrinter = new WOQLPrinter({}, 'python');
      const result = pythonPrinter.getWOQLPrelude('true', false, 0);
      expect(result).to.equal('True');
    });

    it('should handle python syntax', () => {
      const pythonPrinter = new WOQLPrinter({}, 'python');
      const result = pythonPrinter.getWOQLPrelude('triple', false, 0);
      expect(result).to.equal('WOQLQuery().triple');
    });

    it('should handle python pythonic operators', () => {
      const pythonPrinter = new WOQLPrinter({}, 'python');
      const result = pythonPrinter.getWOQLPrelude('and', false, 0);
      expect(result).to.equal('WOQLQuery().woql_and');
    });

    it('should handle indentation', () => {
      const result = printer.getWOQLPrelude('triple', false, 4);
      expect(result).to.include('    ');
      expect(result).to.include('WOQL.triple');
    });
  });

  describe('uncleanArgument', () => {
    it('should return quoted string for simple argument', () => {
      const result = printer.uncleanArgument('myValue', 'Triple', 'subject');
      expect(result).to.equal('"myValue"');
    });

    it('should handle arguments with colons', () => {
      const result = printer.uncleanArgument('rdf:type', 'Triple', 'predicate');
      expect(result).to.equal('"rdf:type"');
    });

    it('should use vocab shortcuts if available', () => {
      const customPrinter = new WOQLPrinter({ label: 'rdfs:label' }, 'javascript');
      const result = customPrinter.uncleanArgument('rdfs:label', 'Triple', 'predicate');
      expect(result).to.equal('"label"');
    });
  });

  describe('isListOperator', () => {
    it('should return true for ValueList', () => {
      expect(printer.isListOperator('ValueList')).to.be.true;
    });

    it('should return true for Array', () => {
      expect(printer.isListOperator('Array')).to.be.true;
    });

    it('should return true for AsVar', () => {
      expect(printer.isListOperator('AsVar')).to.be.true;
    });

    it('should return false for Triple', () => {
      expect(printer.isListOperator('Triple')).to.be.false;
    });
  });

  describe('isQueryListOperator', () => {
    it('should return true for And', () => {
      expect(printer.isQueryListOperator('And')).to.be.true;
    });

    it('should return true for Or', () => {
      expect(printer.isQueryListOperator('Or')).to.be.true;
    });

    it('should return false for Triple', () => {
      expect(printer.isQueryListOperator('Triple')).to.be.false;
    });
  });

  describe('getFunctionForOperator', () => {
    it('should return mapped operator', () => {
      expect(printer.getFunctionForOperator('IDGenerator')).to.equal('idgen');
      expect(printer.getFunctionForOperator('IsA')).to.equal('isa');
      expect(printer.getFunctionForOperator('PostResource')).to.equal('post');
    });

    it('should return quad for Triple with graph', () => {
      const json = { '@type': 'Triple', graph: 'schema/main' };
      expect(printer.getFunctionForOperator('Triple', json)).to.equal('quad');
    });

    it('should convert camelCase to snake_case', () => {
      expect(printer.getFunctionForOperator('DeleteTriple')).to.equal('delete_triple');
      expect(printer.getFunctionForOperator('AddQuad')).to.equal('add_quad');
    });

    it('should use shortcuts if available', () => {
      expect(printer.getFunctionForOperator('Optional')).to.equal('opt');
      expect(printer.getFunctionForOperator('Substring')).to.equal('substr');
      expect(printer.getFunctionForOperator('Equals')).to.equal('eq');
    });
  });

  describe('getBoxedPredicate', () => {
    it('should return variable for boxed variable', () => {
      const json = { '@type': 'Value', variable: 'myVar' };
      expect(printer.getBoxedPredicate('Value', json)).to.equal('variable');
    });

    it('should return node for boxed node', () => {
      const json = { '@type': 'NodeValue', node: 'doc:mydoc' };
      expect(printer.getBoxedPredicate('NodeValue', json)).to.equal('node');
    });

    it('should return false if no boxed predicate', () => {
      const json = { '@type': 'Triple', subject: 'a' };
      expect(printer.getBoxedPredicate('Triple', json)).to.be.false;
    });

    it('should return woql:query for QueryListElement', () => {
      const json = { '@type': 'QueryListElement' };
      expect(printer.getBoxedPredicate('QueryListElement', json)).to.equal('woql:query');
    });
  });

  describe('unboxJSON', () => {
    it('should unbox variable', () => {
      const json = { variable: 'myVar' };
      const result = printer.unboxJSON('Value', json);
      expect(result).to.equal('myVar');
    });

    it('should unbox node', () => {
      const json = { node: 'doc:mydoc' };
      const result = printer.unboxJSON('NodeValue', json);
      expect(result).to.equal('doc:mydoc');
    });

    it('should return false if nothing to unbox', () => {
      const json = { subject: 'a' };
      const result = printer.unboxJSON('Triple', json);
      expect(result).to.be.false;
    });
  });

  describe('decompileVariables', () => {
    it('should decompile array of variables', () => {
      const result = printer.decompileVariables(['var1', 'var2', 'var3']);
      expect(result).to.equal('"v:var1", "v:var2", "v:var3"');
    });

    it('should decompile single variable', () => {
      const result = printer.decompileVariables(['var1']);
      expect(result).to.equal('"v:var1"');
    });

    it('should wrap in array if checkIsArray is true and multiple variables', () => {
      const result = printer.decompileVariables(['var1', 'var2'], true);
      expect(result).to.equal('["v:var1", "v:var2"]');
    });

    it('should not wrap in array if checkIsArray is true but single variable', () => {
      const result = printer.decompileVariables(['var1'], true);
      expect(result).to.equal('"v:var1"');
    });

    it('should return empty string for non-array', () => {
      const result = printer.decompileVariables('not-an-array');
      expect(result).to.equal('');
    });
  });

  describe('decompileDocument', () => {
    it('should decompile simple document', () => {
      const args = {
        dictionary: {
          data: [
            {
              field: 'name',
              value: { data: { '@type': 'xsd:string', '@value': 'John' } },
            },
            {
              field: 'age',
              value: { data: { '@type': 'xsd:integer', '@value': 30 } },
            },
          ],
        },
      };

      const result = printer.decompileDocument(args);
      expect(result).to.include('WOQL.doc(');
      expect(result).to.include('name');
      expect(result).to.include('John');
      expect(result).to.include('age');
      expect(result).to.include('30');
    });

    it('should handle nested documents', () => {
      const args = {
        dictionary: {
          data: [
            {
              field: 'person',
              value: {
                dictionary: {
                  data: [
                    {
                      field: 'name',
                      value: { data: { '@type': 'xsd:string', '@value': 'John' } },
                    },
                  ],
                },
              },
            },
          ],
        },
      };

      const result = printer.decompileDocument(args);
      expect(result).to.include('WOQL.doc(');
      expect(result).to.include('person');
      expect(result).to.include('name');
      expect(result).to.include('John');
    });
  });

  describe('decompileRegexPattern', () => {
    it('should handle DataValue pattern', () => {
      const json = {
        '@type': 'DataValue',
        data: { '@type': 'xsd:string', '@value': 'pattern' },
      };

      const result = printer.decompileRegexPattern(json);
      expect(result).to.include('xsd:string');
      expect(result).to.include('pattern');
    });

    it('should handle path pattern', () => {
      const json = {
        '@type': 'PathPredicate',
        predicate: 'father',
      };

      const result = printer.decompileRegexPattern(json);
      expect(result).to.equal('"father"');
    });
  });

  describe('decompilePathPattern', () => {
    it('should decompile PathPredicate', () => {
      const pstruct = {
        '@type': 'PathPredicate',
        predicate: 'father',
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.equal('father');
    });

    it('should decompile PathPredicate without predicate', () => {
      const pstruct = {
        '@type': 'PathPredicate',
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.equal('.');
    });

    it('should decompile InversePathPredicate', () => {
      const pstruct = {
        '@type': 'InversePathPredicate',
        predicate: 'child',
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.equal('<child');
    });

    it('should decompile PathPlus', () => {
      const pstruct = {
        '@type': 'PathPlus',
        plus: {
          '@type': 'PathPredicate',
          predicate: 'ancestor',
        },
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.equal('ancestor+');
    });

    it('should decompile PathStar', () => {
      const pstruct = {
        '@type': 'PathStar',
        star: {
          '@type': 'PathPredicate',
          predicate: 'knows',
        },
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.equal('knows*');
    });

    it('should decompile PathTimes', () => {
      const pstruct = {
        '@type': 'PathTimes',
        times: {
          '@type': 'PathPredicate',
          predicate: 'parent',
        },
        from: 2,
        to: 3,
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.equal('parent {2,3}');
    });

    it('should decompile PathSequence', () => {
      const pstruct = {
        '@type': 'PathSequence',
        sequence: [
          { '@type': 'PathPredicate', predicate: 'father' },
          { '@type': 'PathPredicate', predicate: 'brother' },
        ],
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.equal('father,brother');
    });

    it('should decompile PathOr', () => {
      const pstruct = {
        '@type': 'PathOr',
        or: [
          { '@type': 'PathPredicate', predicate: 'father' },
          { '@type': 'PathPredicate', predicate: 'mother' },
        ],
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.equal('father|mother');
    });

    it('should add parentheses when needed for PathPlus', () => {
      const pstruct = {
        '@type': 'PathPlus',
        plus: {
          '@type': 'PathOr',
          or: [
            { '@type': 'PathPredicate', predicate: 'father' },
            { '@type': 'PathPredicate', predicate: 'mother' },
          ],
        },
      };

      const result = printer.decompilePathPattern(pstruct);
      expect(result).to.include('(');
      expect(result).to.include(')');
      expect(result).to.include('+');
    });
  });

  describe('decompileAsVars', () => {
    it('should decompile as vars array', () => {
      const asvs = [
        {
          '@type': 'Column',
          indicator: { name: 'col1' },
          variable: 'v1',
        },
        {
          '@type': 'Column',
          indicator: { name: 'col2' },
          variable: 'v2',
        },
      ];

      const result = printer.decompileAsVars(asvs, 1);
      expect(result).to.include('WOQL.as');
      expect(result).to.include('col1');
      expect(result).to.include('v:v1');
      expect(result).to.include('col2');
      expect(result).to.include('v:v2');
    });

    it('should handle indicator with index', () => {
      const asvs = [
        {
          '@type': 'Column',
          indicator: { index: 0 },
          variable: 'v1',
        },
      ];

      const result = printer.decompileAsVars(asvs, 1);
      expect(result).to.include('WOQL.as');
      expect(result).to.include('0');
      expect(result).to.include('v:v1');
    });

    it('should include type if present', () => {
      const asvs = [
        {
          '@type': 'Column',
          indicator: { name: 'col1', type: 'xsd:string' },
          variable: 'v1',
        },
      ];

      const result = printer.decompileAsVars(asvs, 1);
      expect(result).to.include('xsd:string');
    });

    it('should return empty string for non-array', () => {
      const result = printer.decompileAsVars('not-an-array', 1);
      expect(result).to.equal('');
    });
  });
});
