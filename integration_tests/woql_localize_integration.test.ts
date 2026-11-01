/**
 * Integration tests for WOQL localize() - testing actual server execution
 * These tests connect to a real TerminusDB instance and verify query results
 */
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { createTestClient, setupTestDatabase } from './test_utils';

const WOQL = require('../lib/woql');

describe('WOQL localize() integration tests (server execution)', () => {
  const dbName = 'db__test_woql_localize';
  const client = createTestClient();

  beforeAll(async () => {
    client.db(dbName);

    // Create test database - no schema or documents needed
    await setupTestDatabase(client, dbName, {
      comment: 'Database for testing localize() functionality',
    });
  });

  afterAll(async () => {
    try {
      await client.deleteDatabase(dbName);
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  test('should expose outer parameter variables when used in query', async () => {
    // Test that outer parameters (variables) are visible in results
    // This requires eq(param, param) bindings OUTSIDE localize wrapper
    const [localized, v] = WOQL.localize({
      person: 'v:person',  // Outer parameter - should be visible
      local_temp: null,    // Local variable - should NOT be visible
    });

    const query = WOQL.and(
      // unbound "v:person" is bound via localized
      localized().and(
        // Use the parameter inside localize
        WOQL.eq(v.local_temp, v.person),
        WOQL.eq(v.local_temp, WOQL.string("Alice")),
      ),
    );

    const result = await client.query(query);
    
    expect(result?.bindings).toBeDefined();
    expect(result.bindings.length).toBe(1);
    
    const binding = result.bindings[0];
    
    // v:person should be visible (it's an outer parameter AND bound outside)
    const person = binding['person'] || binding['v:person'];
    expect(person).toBeDefined();
    expect(person['@value']).toBe('Alice');
    
    // local_temp should NOT be visible (it's a local variable)
    expect(binding['local_temp']).toBeUndefined();
    expect(binding['v:local_temp']).toBeUndefined();
  });

  test('should bind outer variables via eq() clauses (simple test)', async () => {
    // Simple test: bind outer variable with eq(), use it inside localize
    const [localized, v] = WOQL.localize({
      mystring: 'v:mystring',
      myinnerstring: 'v:innerstring',
      local_temp: null,
    });

    const query = WOQL.and(
      WOQL.eq('v:outer', WOQL.string('test_value')),
      localized().and(
        WOQL.eq(v.mystring, 'v:outer'),
        WOQL.eq(v.myinnerstring, 'v:outer'),
        WOQL.eq(v.local_temp, WOQL.string('hidden_value')),
      ),
    );

    const result = await client.query(query);
    
    expect(result?.bindings).toBeDefined();
    expect(result.bindings.length).toBe(1);
    
    const binding = result.bindings[0];
    
    // ACTUAL BEHAVIOR: Unification flows through eq() bindings
    
    // v:mystring is linked to v:innerstring (both params), which is unified with v:outer inside
    // Through unification: mystring_unique = v:mystring AND myinnerstring_unique = v:innerstring
    // Inside: myinnerstring_unique = v:outer, so v:innerstring = v:outer = "test_value"
    // Both are visible because eq() bindings are outside select("")
    const mystring = binding['mystring'] || binding['v:mystring'];
    expect(mystring).toBeDefined();
    expect(mystring['@value']).toBe('test_value');  // Gets value through unification
    
    const innerstring = binding['innerstring'] || binding['v:innerstring'];
    expect(innerstring).toBeDefined();
    expect(innerstring['@value']).toBe('test_value');  // Unified with v:outer inside
    
    // v:outer is set OUTSIDE localize with eq(), so it IS visible
    const outer = binding['outer'] || binding['v:outer'];
    expect(outer).toBeDefined();
    expect(outer['@value']).toBe('test_value');
    
    // local_temp is a local variable (null in spec), so NOT visible
    expect(binding['local_temp']).toBeUndefined();
    expect(binding['v:local_temp']).toBeUndefined();
    
    // SUMMARY: localize() with select("") hides ALL variables bound inside it.
    // are visible in query results.
  });

});
