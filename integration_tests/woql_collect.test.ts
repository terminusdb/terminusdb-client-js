//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_collect';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);

  // Add schema first
  await client.addDocument([
    { "@base": "terminusdb:///data/", "@schema": "terminusdb:///schema#", "@type": "@context" },
    {
      "@id": "NamedThing", "@type": "Class",
      "@key": { "@type": "Lexical", "@fields": ["name"] },
      "name": "xsd:string"
    }
  ], { graph_type: "schema", full_replace: true });

  // Insert test documents (let Lexical key generate @id from name)
  await client.addDocument([
    { "@type": "NamedThing", "name": "Alice" },
    { "@type": "NamedThing", "name": "Bob" },
    { "@type": "NamedThing", "name": "Carol" }
  ]);
}, 60000);

afterAll(async () => {
  await teardownTestBranch(client, branchName);
});

describe('Collect predicate integration tests', () => {
  test('collects triple objects into a list', async () => {
    let v = Vars("name", "names");
    const query = WOQL.collect(
      v.name,
      v.names,
      WOQL.triple("v:doc", "name", v.name)
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    const names = result?.bindings[0].names.map((item: any) => item['@value']);
    expect(names.sort()).toEqual(["Alice", "Bob", "Carol"]);
  });

  test('collects with simple variable template', async () => {
    let v = Vars("doc", "docs");
    const query = WOQL.collect(
      v.doc,
      v.docs,
      WOQL.triple(v.doc, "rdf:type", "@schema:NamedThing")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].docs.length).toBe(3);
  });

  test('produces empty list when sub-query has no solutions', async () => {
    let v = Vars("x", "collected");
    const query = WOQL.collect(
      v.x,
      v.collected,
      WOQL.triple("v:doc", "nonexistent_property", v.x)
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].collected).toEqual([]);
  });

  test('collects with list template containing multiple variables', async () => {
    let v = Vars("doc", "name", "pairs", "pair");
    const query = WOQL.collect(
      [v.doc, v.name],
      v.pairs,
      WOQL.triple(v.doc, "name", v.name)
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    // Each element should be a pair [doc, name]
    expect(result?.bindings[0].pairs.length).toBe(3);
    for (const pair of result?.bindings[0].pairs) {
      expect(Array.isArray(pair)).toBe(true);
      expect(pair.length).toBe(2);
    }
  });

  test('composes with list operations like length', async () => {
    let v = Vars("name", "names", "count");
    const query = WOQL.and(
      WOQL.collect(
        v.name,
        v.names,
        WOQL.triple("v:doc", "name", v.name)
      ),
      WOQL.length("v:names", "v:count")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].count['@value']).toBe(3);
  });

  test('works with limit inside sub-query', async () => {
    let v = Vars("name", "names");
    const query = WOQL.collect(
      v.name,
      v.names,
      WOQL.limit(2, WOQL.triple("v:doc", "name", v.name))
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].names.length).toBe(2);
  });

  test('fluent style with chained sub-query', async () => {
    let v = Vars("name", "names");
    const query = WOQL.collect(v.name, v.names)
      .triple("v:doc", "name", v.name);

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    const names = result?.bindings[0].names.map((item: any) => item['@value']);
    expect(names.sort()).toEqual(["Alice", "Bob", "Carol"]);
  });
});
