//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
// Type-only import through the generated declarations — the same surface the
// package "types" field exposes to consumers of 'terminusdb'.
import type { WOQLQueryResult, WithDataVersion } from '../dist/typescript';
import { createTestClient, cleanupDatabase, setupTestDatabase } from './test_utils';

interface PersonRow {
  name: { "@type": string; "@value": string } | string;
}

interface Person {
  "@id": string;
  "@type": string;
  name: string;
}

const db01 = 'db__test_woql_client_generics';
const client = createTestClient();

beforeAll(async () => {
  client.db(db01);
  await setupTestDatabase(client, db01, { comment: 'add db' });
  await client.addDocument(
    {
      "@id": "Person",
      "@type": "Class",
      "@key": { "@type": "Random" },
      name: "xsd:string",
    },
    { graph_type: "schema" },
  );
  await client.addDocument({ "@type": "Person", name: "Ada" });
}, 30000);

afterAll(async () => {
  await cleanupDatabase(client, db01);
}, 30000);

describe('WOQLClient generic typing (#382)', () => {
  test('query<T> resolves to WOQLResult<T> with typed bindings', async () => {
    const v = WOQL.Vars('name');
    const result = await client.query<PersonRow>(
      WOQL.triple('v:p', 'name', v.name),
    );

    expect(result.bindings).toHaveLength(1);
    const row: PersonRow = result.bindings[0];
    expect(row.name).toBeDefined();
  });

  test('query<T,R> with getDataVersion resolves to WithDataVersion<WOQLQueryResult<T>>', async () => {
    const v = WOQL.Vars('name');
    const wrapped = await client.query<
      PersonRow,
      WithDataVersion<WOQLQueryResult<PersonRow>>
    >(
      WOQL.triple('v:p', 'name', v.name),
      undefined, undefined, undefined, true,
    );

    expect(wrapped.dataVersion).toBeTruthy();
    expect(wrapped.result.bindings).toHaveLength(1);
  });

  test('getDocument<T> resolves to T for a single document', async () => {
    const docs = await client.addDocument<string[]>({ "@type": "Person", name: "Bob" });
    const doc = await client.getDocument<Person>({ id: docs[0] });

    expect(doc["@type"]).toBe('Person');
    expect(doc.name).toBe('Bob');
  });

  test('getDocument<T[]> with as_list resolves to an array', async () => {
    const docs = await client.getDocument<Person[]>({ as_list: true, type: 'Person' });
    expect(Array.isArray(docs)).toBe(true);
    expect(docs.length).toBeGreaterThanOrEqual(2);
  });

  test('getSchema<T> resolves to T[] of schema documents', async () => {
    const schema = await client.getSchema<{ "@id": string }>();
    const ids = schema.map((d) => d['@id']);
    expect(ids).toContain('Person');
  });
});

describe('Missing document errors are catchable 404s (#238)', () => {
  test('getDocument for a missing id rejects with status 404 and api:DocumentNotFound', async () => {
    const missing = 'Person/this-document-does-not-exist';
    await expect(client.getDocument({ id: missing })).rejects.toMatchObject({
      status: 404,
      data: {
        'api:error': { '@type': 'api:DocumentNotFound' },
      },
    });
  });

  test('getDocument for a missing id with as_list resolves to an empty array', async () => {
    const result = await client.getDocument({
      id: 'Person/this-document-does-not-exist',
      as_list: true,
    });
    expect(result).toStrictEqual([]);
  });
});
