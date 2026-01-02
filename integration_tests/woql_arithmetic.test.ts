//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { vars, vars_unique, Vars, VarsUnique } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_arithmetic';
let client = createTestClient();

beforeAll(async () => {
  WOQL.vars_unique_reset_start(20);
  await setupTestBranch(client, branchName);
}, 30000);

describe('Tests for woql arithmetic', () => {
  test('Test simple arithmetic with Vars variables handling', async () => {
    let v = Vars("result1", "result2");
    const query = WOQL.limit(100).eval(WOQL.times(2, 3), v.result1);

    const expectedJson = [{"result1": {"@type": "xsd:decimal", "@value": 6}}];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  test('Test simple arithmetic with VarsUnique variables handling', async () => {
    let v = VarsUnique("result1", "result2");
    const query = WOQL.limit(100).eval(WOQL.times(2, 3), v.result1);

    // suffix is 21 because we reset it to 20 above
    const expectedJson = [{"result1_21": {"@type": "xsd:decimal", "@value": 6}}];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  test('Test simple arithmetic with vars variables handling', async () => {
    let [result1] = vars("result1");
    const query = WOQL.limit(100).eval(WOQL.times(2, 3), result1);

    const expectedJson = [{"result1": {"@type": "xsd:decimal", "@value": 6}}];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  test('Test simple arithmetic with vars_unique variables handling', async () => {
    let [result3] = vars_unique("result3");
    const query = WOQL.limit(100).eval(WOQL.times(2, 3), result3);

    // suffix is 23 because we already used vars_unique from WOQL 2 times since we reset it to 20 above
    const expectedJson = [{"result3_23": {"@type": "xsd:decimal", "@value": 6}}];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  test('Test simple arithmetic with string variable handling', async () => {
    const query = WOQL.limit(100).eval(WOQL.times(2, 3), "v:result");

    const expectedJson = [{"result": {"@type": "xsd:decimal", "@value": 6}}];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

});

afterAll(async () => {
  await teardownTestBranch(client, branchName);
});
