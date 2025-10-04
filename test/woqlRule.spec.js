const { expect } = require('chai');
const { WOQLRule } = require('../lib/viewer/woqlRule');

describe('woqlRule tests', () => {
  let rule;

  beforeEach(() => {
    rule = new WOQLRule();
  });

  describe('constructor', () => {
    it('should create WOQLRule with pattern', () => {
      expect(rule.pattern).to.exist;
      expect(rule.pattern).to.be.an('object');
    });
  });

  describe('setVariables()', () => {
    it('should set variables array', () => {
      rule.setVariables(['v:x', 'v:y', 'v:z']);
      expect(rule.pattern.variables).to.deep.equal(['x', 'y', 'z']);
    });

    it('should remove v: prefix from variables', () => {
      rule.setVariables(['v:firstName', 'v:lastName']);
      expect(rule.pattern.variables).to.deep.equal(['firstName', 'lastName']);
    });

    it('should set current_variable to last variable', () => {
      rule.setVariables(['v:a', 'v:b', 'v:c']);
      expect(rule.current_variable).to.equal('c');
    });

    it('should return instance for chaining', () => {
      const result = rule.setVariables(['v:x']);
      expect(result).to.equal(rule);
    });

    it('should handle empty array', () => {
      rule.setVariables([]);
      expect(rule.pattern.variables).to.be.undefined;
    });

    it('should handle null/undefined', () => {
      rule.setVariables(null);
      expect(rule.pattern.variables).to.be.undefined;
    });
  });

  describe('vars()', () => {
    it('should set variables using spread operator', () => {
      rule.vars('v:x', 'v:y', 'v:z');
      expect(rule.pattern.variables).to.deep.equal(['x', 'y', 'z']);
    });

    it('should work with single variable', () => {
      rule.vars('v:single');
      expect(rule.pattern.variables).to.deep.equal(['single']);
    });

    it('should return instance for chaining', () => {
      const result = rule.vars('v:a', 'v:b');
      expect(result).to.equal(rule);
    });
  });

  describe('v()', () => {
    it('should set current variable', () => {
      rule.v('v:myVar');
      expect(rule.current_variable).to.equal('myVar');
    });

    it('should remove v: prefix', () => {
      rule.v('v:test');
      expect(rule.current_variable).to.equal('test');
    });

    it('should return instance for chaining when setting', () => {
      const result = rule.v('v:x');
      expect(result).to.equal(rule);
    });

    it('should get current variable when called without argument', () => {
      rule.current_variable = 'myVar';
      expect(rule.v()).to.equal('myVar');
    });

    it('should return undefined when no variable set', () => {
      expect(rule.v()).to.be.undefined;
    });
  });

  describe('edge()', () => {
    it('should set source and target', () => {
      rule.edge('v:source', 'v:target');
      expect(rule.pattern.source).to.equal('source');
      expect(rule.pattern.target).to.equal('target');
    });

    it('should remove v: prefix from source and target', () => {
      rule.edge('v:s', 'v:t');
      expect(rule.pattern.source).to.equal('s');
      expect(rule.pattern.target).to.equal('t');
    });

    it('should set only source if target not provided', () => {
      rule.edge('v:source');
      expect(rule.pattern.source).to.equal('source');
      expect(rule.pattern.target).to.be.undefined;
    });

    it('should set only target if source not provided', () => {
      rule.edge(null, 'v:target');
      expect(rule.pattern.source).to.be.undefined;
      expect(rule.pattern.target).to.equal('target');
    });

    it('should set variables to source when source provided', () => {
      rule.edge('v:s', 'v:t');
      expect(rule.pattern.variables).to.deep.equal(['s']);
    });

    it('should set variables to target when only target provided', () => {
      rule.edge(null, 'v:t');
      expect(rule.pattern.variables).to.deep.equal(['t']);
    });

    it('should return instance for chaining', () => {
      const result = rule.edge('v:s', 'v:t');
      expect(result).to.equal(rule);
    });
  });

  describe('rownum()', () => {
    it('should set rownum', () => {
      rule.rownum(5);
      expect(rule.pattern.rownum).to.equal(5);
    });

    it('should get rownum when called without argument', () => {
      rule.pattern.rownum = 10;
      expect(rule.rownum()).to.equal(10);
    });

    it('should return instance for chaining when setting', () => {
      const result = rule.rownum(3);
      expect(result).to.equal(rule);
    });

    it('should return undefined when not set', () => {
      expect(rule.rownum()).to.be.undefined;
    });

    it('should handle zero', () => {
      rule.rownum(0);
      expect(rule.pattern.rownum).to.equal(0);
    });
  });

  describe('in()', () => {
    it('should add constraint for current variable', () => {
      rule.v('v:x');
      rule.in('value1', 'value2', 'value3');
      
      expect(rule.pattern.constraints).to.exist;
      expect(rule.pattern.constraints.x).to.be.an('array');
      expect(rule.pattern.constraints.x).to.have.lengthOf(1);
      expect(rule.pattern.constraints.x[0]).to.deep.equal(['value1', 'value2', 'value3']);
    });

    it('should handle single value', () => {
      rule.v('v:status');
      rule.in('active');
      
      expect(rule.pattern.constraints.status[0]).to.deep.equal(['active']);
    });

    it('should handle multiple in() calls on same variable', () => {
      rule.v('v:x');
      rule.in('a', 'b');
      rule.in('c', 'd');
      
      expect(rule.pattern.constraints.x).to.have.lengthOf(2);
      expect(rule.pattern.constraints.x[0]).to.deep.equal(['a', 'b']);
      expect(rule.pattern.constraints.x[1]).to.deep.equal(['c', 'd']);
    });

    it('should handle numeric values', () => {
      rule.v('v:age');
      rule.in(18, 21, 25);
      
      expect(rule.pattern.constraints.age[0]).to.deep.equal([18, 21, 25]);
    });

    it('should return instance for chaining', () => {
      rule.v('v:x');
      const result = rule.in('a', 'b');
      expect(result).to.equal(rule);
    });

    it('should not add constraint if no current_variable', () => {
      rule.in('value1', 'value2');
      expect(rule.pattern.constraints).to.be.undefined;
    });
  });

  describe('filter()', () => {
    it('should add filter function to constraints for current variable', () => {
      const filterFn = (val) => val > 10;
      rule.v('v:age');
      rule.filter(filterFn);
      
      expect(rule.pattern.constraints).to.exist;
      expect(rule.pattern.constraints.age).to.be.an('array');
      expect(rule.pattern.constraints.age[0]).to.equal(filterFn);
    });

    it('should return instance for chaining', () => {
      rule.v('v:x');
      const result = rule.filter(() => true);
      expect(result).to.equal(rule);
    });

    it('should not set filter if no current_variable', () => {
      rule.filter(() => true);
      expect(rule.pattern.constraints).to.be.undefined;
    });

    it('should add multiple filters for same variable', () => {
      rule.v('v:x');
      const filter1 = (val) => val > 0;
      const filter2 = (val) => val < 100;
      rule.filter(filter1);
      rule.filter(filter2);
      
      expect(rule.pattern.constraints.x).to.have.lengthOf(2);
      expect(rule.pattern.constraints.x[0]).to.equal(filter1);
      expect(rule.pattern.constraints.x[1]).to.equal(filter2);
    });
  });

  describe('chain operations', () => {
    it('should allow chaining multiple operations', () => {
      const result = rule
        .vars('v:x', 'v:y', 'v:z')
        .v('v:x')
        .in('a', 'b', 'c')
        .v('v:y')
        .filter((val) => val > 5)
        .rownum(10);

      expect(result).to.equal(rule);
      expect(rule.pattern.variables).to.deep.equal(['x', 'y', 'z']);
      expect(rule.pattern.constraints.x).to.exist;
      expect(rule.pattern.constraints.y).to.exist;
      expect(rule.pattern.rownum).to.equal(10);
    });

    it('should allow edge and additional configuration', () => {
      const result = rule
        .edge('v:source', 'v:target')
        .rownum(5)
        .v('v:source')
        .in('node1', 'node2');

      expect(result).to.equal(rule);
      expect(rule.pattern.source).to.equal('source');
      expect(rule.pattern.target).to.equal('target');
      expect(rule.pattern.rownum).to.equal(5);
    });
  });

  describe('Integration tests', () => {
    it('should configure rule for filtering specific values', () => {
      const ageFilter = (age) => age >= 18;
      rule
        .setVariables(['v:name', 'v:age', 'v:status'])
        .v('v:status')
        .in('active', 'pending')
        .v('v:age')
        .filter(ageFilter);

      expect(rule.pattern.variables).to.deep.equal(['name', 'age', 'status']);
      expect(rule.pattern.constraints.status).to.exist;
      expect(rule.pattern.constraints.age).to.be.an('array');
      expect(rule.pattern.constraints.age[0]).to.be.a('function');
      expect(rule.pattern.constraints.age[0](20)).to.be.true;
      expect(rule.pattern.constraints.age[0](15)).to.be.false;
    });

    it('should configure edge-based rule', () => {
      rule
        .edge('v:person', 'v:company')
        .v('v:person')
        .in('Alice', 'Bob')
        .rownum(0);

      expect(rule.pattern.source).to.equal('person');
      expect(rule.pattern.target).to.equal('company');
      expect(rule.pattern.variables).to.include('person');
      expect(rule.pattern.rownum).to.equal(0);
    });
  });
});
