//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL, Vars } from '../index.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_regression';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

afterAll(async () => {
  await teardownTestBranch(client, branchName);
});

describe('Tests for woql graph addressing', () => {
  it('should construct correct query for: from instance', async () => {
    const query = WOQL.from('instance').limit(10).eval(WOQL.plus(1, 1), 'v:result');

    const expectedJson = [{ "result": { "@type": "xsd:decimal", "@value": 2 } }];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  it('should construct correct query for: from schema', async () => {
    // This tests corresponds to issue #2077, with incorrect AST, now fixed
    // https://github.com/terminusdb/terminusdb/issues/2077
    let v = Vars("cls");
    const query = WOQL.from("schema")
      .triple(v.cls, "rdf:type", "sys:Class")
    const expectedJson = [];
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  test('should construct correct query for: info', async () => {
    const result = await client.info();
    expect(result["@type"]).toStrictEqual("api:InfoResponse");
  });
});
