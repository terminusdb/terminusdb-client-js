//@ts-check
/**
 * Integration tests for adding prefixes to schema via WOQL
 * 
 * This test demonstrates how to add a custom prefix to a database's schema
 * using WOQL operations. The mechanism is the same as used internally by TerminusDB:
 * 
 * 1. Generate a deterministic prefix ID using HashKey (same as idgen_hash in Prolog)
 * 2. Add four triples to the schema graph:
 *    - terminusdb://context -> sys:prefix_pair -> PrefixID
 *    - PrefixID -> rdf:type -> sys:Prefix
 *    - PrefixID -> sys:prefix -> "prefix_name"^^xsd:string
 *    - PrefixID -> sys:url -> "http://example.org/"^^xsd:string
 */

import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQLClient, WOQL } from '../index.js';
import { createTestClient, setupTestDatabase, teardownTestDatabase } from './test_utils';

const TEST_DB = 'db__test_woql_prefix';
let client: WOQLClient;

beforeAll(async () => {
  client = createTestClient();
  await setupTestDatabase(client, TEST_DB, { schema: true });
});

afterAll(async () => {
  await teardownTestDatabase(client, TEST_DB);
});

describe('WOQL Prefix Operations', () => {
  
  test('Add a custom prefix to the schema using WOQL', async () => {
    const prefixName = 'myprefix';
    const prefixUrl = 'http://example.org/myprefix/';
    
    // Step 1: Generate the prefix ID using HashKey (same mechanism as TerminusDB's idgen_hash)
    // The ID is deterministically generated from: base + [name, url]
    // Base: 'terminusdb://Prefix_Pair/'
    // Key list: [prefixName, prefixUrl]
    
    const query = WOQL.and(
      // Generate the prefix ID using HashKey
      WOQL.unique(
        'terminusdb://Prefix_Pair/',
        [prefixName, prefixUrl],
        'v:PrefixID'
      ),
      // Add triple: terminusdb://context -> sys:prefix_pair -> PrefixID
      WOQL.add_quad(
        'terminusdb://context',
        'sys:prefix_pair',
        'v:PrefixID',
        'schema'
      ),
      // Add triple: PrefixID -> rdf:type -> sys:Prefix
      WOQL.add_quad(
        'v:PrefixID',
        'rdf:type',
        'sys:Prefix',
        'schema'
      ),
      // Add triple: PrefixID -> sys:prefix -> prefixName
      WOQL.add_quad(
        'v:PrefixID',
        'sys:prefix',
        WOQL.string(prefixName),
        'schema'
      ),
      // Add triple: PrefixID -> sys:url -> prefixUrl
      WOQL.add_quad(
        'v:PrefixID',
        'sys:url',
        WOQL.string(prefixUrl),
        'schema'
      )
    );

    // Execute the WOQL query
    const result = await client.query(query, `Add prefix ${prefixName}`);
    
    // Verify the query executed successfully
    expect(result.bindings).toBeDefined();
    expect(result.bindings.length).toBeGreaterThan(0);
    
    // The PrefixID should be a hash-based URI
    const prefixId = result.bindings[0].PrefixID;
    expect(prefixId).toMatch(/^terminusdb:\/\/Prefix_Pair\/[a-f0-9]{64}$/);
    
    console.log('Generated Prefix ID:', prefixId);
  }, 30000);

  test('Verify the prefix was added by querying the schema', async () => {
    const prefixName = 'myprefix';
    
    // Query to find the prefix we just added
    const query = WOQL.and(
      WOQL.quad(
        'terminusdb://context',
        'sys:prefix_pair',
        'v:PrefixID',
        'schema'
      ),
      WOQL.quad(
        'v:PrefixID',
        'sys:prefix',
        'v:Name',
        'schema'
      ),
      WOQL.quad(
        'v:PrefixID',
        'sys:url',
        'v:URL',
        'schema'
      ),
      WOQL.eq('v:Name', WOQL.string(prefixName))
    );

    const result = await client.query(query);
    
    expect(result.bindings).toBeDefined();
    expect(result.bindings.length).toBe(1);
    expect(result.bindings[0].Name['@value']).toBe('myprefix');
    expect(result.bindings[0].URL['@value']).toBe('http://example.org/myprefix/');
    
    console.log('Verified prefix:', result.bindings[0]);
  }, 30000);

  test('HashKey generates deterministic IDs (same input = same output)', async () => {
    // Run the same HashKey twice and verify we get the same ID
    const query1 = WOQL.unique(
      'terminusdb://Prefix_Pair/',
      ['test_prefix', 'http://test.org/'],
      'v:ID1'
    );
    
    const query2 = WOQL.unique(
      'terminusdb://Prefix_Pair/',
      ['test_prefix', 'http://test.org/'],
      'v:ID2'
    );

    const result1 = await client.query(query1);
    const result2 = await client.query(query2);

    expect(result1.bindings[0].ID1).toBe(result2.bindings[0].ID2);
    console.log('Deterministic ID:', result1.bindings[0].ID1);
  }, 30000);

  test('HashKey generates different IDs for different inputs', async () => {
    const query = WOQL.and(
      WOQL.unique(
        'terminusdb://Prefix_Pair/',
        ['prefix_a', 'http://a.org/'],
        'v:ID_A'
      ),
      WOQL.unique(
        'terminusdb://Prefix_Pair/',
        ['prefix_b', 'http://b.org/'],
        'v:ID_B'
      )
    );

    const result = await client.query(query);

    expect(result.bindings[0].ID_A).not.toBe(result.bindings[0].ID_B);
    console.log('ID_A:', result.bindings[0].ID_A);
    console.log('ID_B:', result.bindings[0].ID_B);
  }, 30000);

  test('Add another prefix and verify both exist', async () => {
    const prefixName = 'schema_org';
    const prefixUrl = 'http://schema.org/';
    
    const addQuery = WOQL.and(
      WOQL.unique(
        'terminusdb://Prefix_Pair/',
        [prefixName, prefixUrl],
        'v:PrefixID'
      ),
      WOQL.add_quad(
        'terminusdb://context',
        'sys:prefix_pair',
        'v:PrefixID',
        'schema'
      ),
      WOQL.add_quad(
        'v:PrefixID',
        'rdf:type',
        'sys:Prefix',
        'schema'
      ),
      WOQL.add_quad(
        'v:PrefixID',
        'sys:prefix',
        WOQL.string(prefixName),
        'schema'
      ),
      WOQL.add_quad(
        'v:PrefixID',
        'sys:url',
        WOQL.string(prefixUrl),
        'schema'
      )
    );

    await client.query(addQuery, `Add prefix ${prefixName}`);
    
    // Query all prefixes
    const listQuery = WOQL.and(
      WOQL.quad(
        'terminusdb://context',
        'sys:prefix_pair',
        'v:PrefixID',
        'schema'
      ),
      WOQL.quad(
        'v:PrefixID',
        'sys:prefix',
        'v:Name',
        'schema'
      ),
      WOQL.quad(
        'v:PrefixID',
        'sys:url',
        'v:URL',
        'schema'
      )
    );

    const result = await client.query(listQuery);
    
    // We should have at least 2 custom prefixes
    expect(result.bindings.length).toBeGreaterThanOrEqual(2);
    
    const prefixNames = result.bindings.map((b: any) => b.Name['@value']);
    expect(prefixNames).toContain('myprefix');
    expect(prefixNames).toContain('schema_org');
    
    console.log('All prefixes:', prefixNames);
  }, 30000);

});
