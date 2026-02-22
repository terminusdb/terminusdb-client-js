//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_in_range_sequence';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

describe('InRange as matcher', () => {
  test('integer within range succeeds: 5 in [1, 10)', async () => {
    const query = WOQL.in_range(5, 1, 10);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('start boundary is inclusive: 1 in [1, 10)', async () => {
    const query = WOQL.in_range(1, 1, 10);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('end boundary is exclusive: 10 in [1, 10) fails', async () => {
    const query = WOQL.in_range(10, 1, 10);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('value below range fails: 0 in [1, 10)', async () => {
    const query = WOQL.in_range(0, 1, 10);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('value above range fails: 11 in [1, 10)', async () => {
    const query = WOQL.in_range(11, 1, 10);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('decimal within range succeeds: 5.5 in [1, 10)', async () => {
    const query = WOQL.in_range(5.5, 1, 10);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('date within range succeeds', async () => {
    const query = WOQL.in_range(
      { '@type': 'xsd:date', '@value': '2024-06-15' } as any,
      { '@type': 'xsd:date', '@value': '2024-01-01' } as any,
      { '@type': 'xsd:date', '@value': '2025-01-01' } as any,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('date at exclusive end fails', async () => {
    const query = WOQL.in_range(
      { '@type': 'xsd:date', '@value': '2025-01-01' } as any,
      { '@type': 'xsd:date', '@value': '2024-01-01' } as any,
      { '@type': 'xsd:date', '@value': '2025-01-01' } as any,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

describe('InRange as filter on generated values', () => {
  test('filters sequence output: generate 1..9, keep only [3, 7)', async () => {
    const query = WOQL.and(
      WOQL.sequence("v:i", 1, 10),
      WOQL.in_range("v:i", 3, 7),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(4);
    const values = result?.bindings.map((b: any) => b.i['@value']);
    expect(values).toEqual([3, 4, 5, 6]);
  });

  test('filters stepped sequence: generate 0,5,10,...,45, keep [20, 35)', async () => {
    const query = WOQL.and(
      WOQL.sequence("v:n", 0, 50, 5),
      WOQL.in_range("v:n", 20, 35),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(3);
    const values = result?.bindings.map((b: any) => b.n['@value']);
    expect(values).toEqual([20, 25, 30]);
  });
});

describe('Sequence as generator', () => {
  test('generates correct values 1,2,3,4,5 for [1, 6)', async () => {
    let v = Vars("i");
    const query = WOQL.sequence(v.i, 1, 6);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(5);
    const values = result?.bindings.map((b: any) => b.i['@value']);
    expect(values).toEqual([1, 2, 3, 4, 5]);
  });

  test('generates correct values 0,2,4,6,8 with step=2 for [0, 10)', async () => {
    let v = Vars("i");
    const query = WOQL.sequence(v.i, 0, 10, 2);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(5);
    const values = result?.bindings.map((b: any) => b.i['@value']);
    expect(values).toEqual([0, 2, 4, 6, 8]);
  });

  test('generates empty result for equal start and end', async () => {
    let v = Vars("i");
    const query = WOQL.sequence(v.i, 5, 5);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('generates single value for [7, 8)', async () => {
    let v = Vars("i");
    const query = WOQL.sequence(v.i, 7, 8);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].i['@value']).toBe(7);
  });

  test('generates correct values 0,3,6 with step=3 for [0, 9)', async () => {
    let v = Vars("i");
    const query = WOQL.sequence(v.i, 0, 9, 3);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(3);
    const values = result?.bindings.map((b: any) => b.i['@value']);
    expect(values).toEqual([0, 3, 6]);
  });

  test('generated values can be used in arithmetic via Eval', async () => {
    let v = Vars("i", "doubled");
    const query = WOQL.and(
      WOQL.sequence("v:i", 1, 4),
      WOQL.eval(WOQL.times("v:i", 2), v.doubled),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(3);
    const values = result?.bindings.map((b: any) => b.doubled['@value']);
    expect(values).toEqual([2, 4, 6]);
  });
});

describe('Sequence as matcher (ground value)', () => {
  test('succeeds when value is in the sequence: 3 in [1, 6)', async () => {
    const query = WOQL.sequence(3, 1, 6);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('fails when value is outside the sequence: 10 in [1, 6)', async () => {
    const query = WOQL.sequence(10, 1, 6);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('succeeds at start boundary: 0 in [0, 5)', async () => {
    const query = WOQL.sequence(0, 0, 5);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('fails at end boundary (exclusive): 5 in [0, 5)', async () => {
    const query = WOQL.sequence(5, 0, 5);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('succeeds when value matches a step: 6 in [0, 10) step 3', async () => {
    const query = WOQL.sequence(6, 0, 10, 3);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('fails when value falls between steps: 4 in [0, 10) step 3', async () => {
    const query = WOQL.sequence(4, 0, 10, 3);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

afterAll(async () => {
  await teardownTestBranch(client, branchName);
});
