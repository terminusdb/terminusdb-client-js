//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQLClient, WOQL, Doc } from '../index.js';
import WOQLQuery from '../lib/query/woqlQuery.js';

/**
 * Integration test for update_document with a list of subdocuments.
 *
 * This test verifies that the WOQL builder correctly handles nested Doc()
 * objects when updating documents containing lists of subdocuments.
 *
 * Related issue: Nested Doc() in update_document was producing incorrect
 * WOQL JSON structure due to double-conversion.
 */

let client: WOQLClient;
const testDbName = `update_list_test_${Date.now()}`;

// Schema with a subdocument list
const schema = [
  {
    '@base': 'terminusdb:///data/',
    '@schema': 'terminusdb:///schema#',
    '@type': '@context',
  },
  {
    '@type': 'Class',
    '@id': 'UpdateList',
    '@key': { '@type': 'Random' },
    list: { '@class': 'Structure', '@type': 'List' },
  },
  {
    '@type': 'Class',
    '@id': 'Structure',
    '@key': { '@type': 'Random' },
    '@subdocument': [],
    string: 'xsd:string',
  },
];

beforeAll(async () => {
  client = new WOQLClient('http://127.0.0.1:6363', {
    user: 'admin',
    organization: 'admin',
    key: process.env.TDB_ADMIN_PASS ?? 'root',
  });

  // Create test database
  await client.createDatabase(testDbName, {
    label: 'Update List Test',
    comment: 'Test database for update_document with subdocument lists',
    schema: true,
  });
  client.db(testDbName);

  // Add schema
  await client.addDocument(schema, { graph_type: 'schema', full_replace: true });
});

afterAll(async () => {
  try {
    await client.deleteDatabase(testDbName);
  } catch (e) {
    // Database might not exist
  }
});

describe('update_document with list of subdocuments', () => {
  const docId = 'UpdateList/test-doc';

  test('should insert initial document with subdocument list', async () => {
    const initialDoc = {
      '@type': 'UpdateList',
      '@id': docId,
      list: [
        { '@type': 'Structure', string: 'initial-1' },
        { '@type': 'Structure', string: 'initial-2' },
      ],
    };

    const result = await client.addDocument(initialDoc);
    // Result contains full IRI with prefix
    expect(result[0]).toContain('UpdateList/test-doc');
  });

  test('should update document list using WOQL.update_document with nested Doc()', async () => {
    // This is the pattern that was failing before the fix
    const query = WOQL.update_document(
      new (Doc as any)({
        '@type': 'UpdateList',
        '@id': docId,
        list: [
          new (Doc as any)({ '@type': 'Structure', string: 'updated-1' }),
          new (Doc as any)({ '@type': 'Structure', string: 'updated-2' }),
          new (Doc as any)({ '@type': 'Structure', string: 'updated-3' }),
        ],
      }),
    ) as WOQLQuery;

    const result = await client.query(query);
    expect(result).toBeDefined();
    expect(result?.inserts).toBeGreaterThan(0);
    expect(result?.deletes).toBeGreaterThan(0);

    // Verify the document was updated correctly
    const doc = await client.getDocument({ id: docId });
    expect(doc['@type']).toEqual('UpdateList');
    expect(doc.list).toHaveLength(3);
    expect(doc.list[0].string).toEqual('updated-1');
    expect(doc.list[1].string).toEqual('updated-2');
    expect(doc.list[2].string).toEqual('updated-3');
  });

  test('should update document list using plain objects (alternative syntax)', async () => {
    // Alternative approach without nested Doc() - should also work
    const query = WOQL.update_document(
      new (Doc as any)({
        '@type': 'UpdateList',
        '@id': docId,
        list: [
          { '@type': 'Structure', string: 'plain-1' },
          { '@type': 'Structure', string: 'plain-2' },
        ],
      }),
    ) as WOQLQuery;

    const result = await client.query(query);
    expect(result).toBeDefined();

    // Verify the document was updated correctly
    const doc = await client.getDocument({ id: docId });
    expect(doc.list).toHaveLength(2);
    expect(doc.list[0].string).toEqual('plain-1');
    expect(doc.list[1].string).toEqual('plain-2');
  });

  test('should update to empty list', async () => {
    const query = WOQL.update_document(
      new (Doc as any)({
        '@type': 'UpdateList',
        '@id': docId,
        list: [],
      }),
    ) as WOQLQuery;

    const result = await client.query(query);
    expect(result).toBeDefined();

    // Verify the list is now empty
    const doc = await client.getDocument({ id: docId });
    expect(doc.list).toEqual([]);
  });
});
