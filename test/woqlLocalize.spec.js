/* eslint-disable */
/**
 * Unit tests for WOQL localize() - verifying JSON structure only
 * These tests do NOT connect to a database - they only verify the generated WOQL JSON
 */
const WOQL = require('../lib/woql');
const { Var } = require('../index');
const { expect } = require('chai');

describe('WOQL localize() JSON structure (unit tests)', function() {
  it('should hide local variables from outer scope (basic test)', () => {
    const query = WOQL.and(
      WOQL.triple('v:x', 'v:y', 'v:z'),
      WOQL.localize({
        local_only: null,
      })[0](
        WOQL.triple('v:local_only', 'knows', 'v:someone'),
      ),
    );

    const result = query.json();
    
    // Check that query has proper structure
    expect(result['@type']).to.equal('And');
    expect(Array.isArray(result.and)).to.be.true;
    expect(result.and[1]['@type']).to.equal('Select');
    expect(Array.isArray(result.and[1].variables)).to.be.true;
    
    // CRITICAL: select("") creates variables:[""] to hide all local variables
    expect(result.and[1].variables).to.deep.equal(['']);
  });

  it('should bind outer parameters via eq() clauses', () => {
    const [localized, v] = WOQL.localize({
      param1: 'v:input1',
      param2: 'v:input2',
      local: null,
    });

    const query = localized(
      WOQL.triple(v.param1, 'knows', v.param2),
    );

    const result = query.json();
    
    // NEW STRUCTURE: eq(var,var) + eq(unique,var) + select("")
    // This ensures outer parameters are visible in results
    expect(result['@type']).to.equal('And');
    const andClauses = result.and;
    
    // First: eq('v:input1', 'v:input1') - registers variable
    expect(andClauses[0]['@type']).to.equal('Equals');
    // Second: eq(param1_unique, 'v:input1') - links to outer
    expect(andClauses[1]['@type']).to.equal('Equals');
    // Third: eq('v:input2', 'v:input2') - registers variable
    expect(andClauses[2]['@type']).to.equal('Equals');
    // Fourth: eq(param2_unique, 'v:input2') - links to outer
    expect(andClauses[3]['@type']).to.equal('Equals');
    
    // Fifth should be the select("") wrapper
    expect(andClauses[4]['@type']).to.equal('Select');
    expect(andClauses[4].variables).to.deep.equal(['']);
    
    // Inside select("") should be the actual query
    expect(andClauses[4].query['@type']).to.equal('Triple');
  });

  it('should work in functional mode', () => {
    const [localized, v] = WOQL.localize({
      x: 'v:external_x',
      temp: null,
    });

    const query = localized(
      WOQL.and(
        WOQL.eq(v.temp, WOQL.string('intermediate')),
        WOQL.triple(v.x, 'knows', v.temp),
      ),
    );

    const result = query.json();
    
    // NEW STRUCTURE: eq(var,var) + eq(unique,var) + Select
    expect(result['@type']).to.equal('And');
    const andClauses = result.and;
    
    // First: eq('v:external_x', 'v:external_x') - registers variable
    expect(andClauses[0]['@type']).to.equal('Equals');
    // Second: eq(x_unique, 'v:external_x') - links to outer
    expect(andClauses[1]['@type']).to.equal('Equals');
    
    // Third should be Select with variables:[""]
    expect(andClauses[2]['@type']).to.equal('Select');
    expect(andClauses[2].variables).to.deep.equal(['']);
  });

  it('should work in fluent mode', () => {
    const [localized, v] = WOQL.localize({
      person: 'v:p',
      age: 'v:a',
    });

    const query = localized().and(
      WOQL.triple(v.person, 'age', v.age),
    );

    const result = query.json();
    
    // NEW STRUCTURE: 2x(eq(var,var) + eq(unique,var)) + Select
    expect(result['@type']).to.equal('And');
    const andClauses = result.and;
    
    // 4 eq() bindings (2 vars * 2 bindings each)
    expect(andClauses[0]['@type']).to.equal('Equals');
    expect(andClauses[1]['@type']).to.equal('Equals');
    expect(andClauses[2]['@type']).to.equal('Equals');
    expect(andClauses[3]['@type']).to.equal('Equals');
    
    // Fifth should be Select with variables:[""]
    expect(andClauses[4]['@type']).to.equal('Select');
    expect(andClauses[4].variables).to.deep.equal(['']);
  });

  it('should generate unique variable names', () => {
    const [localized1, v1] = WOQL.localize({
      var1: null,
    });
    
    const [localized2, v2] = WOQL.localize({
      var1: null,
    });

    // Variable names should be different between calls
    expect(v1.var1).to.not.equal(v2.var1);
  });

  it('should handle only local variables (no outer bindings)', () => {
    const [localized, v] = WOQL.localize({
      local1: null,
      local2: null,
    });

    const query = localized(
      WOQL.triple(v.local1, 'knows', v.local2),
    );

    const result = query.json();
    expect(result['@type']).to.equal('Select');
    expect(result.variables).to.deep.equal(['']);
    
    // Query should be directly the triple (no eq bindings needed)
    expect(result.query['@type']).to.equal('Triple');
  });

  it('should handle only outer parameters (no local variables)', () => {
    const [localized, v] = WOQL.localize({
      param1: 'v:input1',
      param2: 'v:input2',
    });

    const query = localized(
      WOQL.triple(v.param1, 'knows', v.param2),
    );

    const result = query.json();
    expect(result['@type']).to.equal('And');
    expect(result.and).to.have.lengthOf(5); // 2x(eq(var,var) + eq(unique,var)) + Select
  });

  it('should preserve variable types (Var instances)', () => {
    const [localized, v] = WOQL.localize({
      input: 'v:x',
      local: null,
    });

    // v.input and v.local should be Var instances
    expect(v.input).to.be.instanceOf(Var);
    expect(v.local).to.be.instanceOf(Var);
  });

  it('should handle empty parameter specification', () => {
    const [localized, v] = WOQL.localize({});

    const query = localized(
      WOQL.triple('v:s', 'v:p', 'v:o'),
    );

    const result = query.json();
    expect(result['@type']).to.equal('Select');
    expect(result.variables).to.deep.equal(['']);
    
    // No eq bindings, just the query
    expect(result.query['@type']).to.equal('Triple');
  });
});
