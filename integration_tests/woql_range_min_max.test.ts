//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_range';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

afterAll(async () => {
  await teardownTestBranch(client, branchName);
}, 30000);

function intv(v: number) {
  return { '@type': 'xsd:integer', '@value': v } as any;
}

function datv(v: string) {
  return { '@type': 'xsd:date', '@value': v } as any;
}

describe('RangeMin', () => {
  test('minimum of integers', async () => {
    let v = Vars("m");
    const query = WOQL.range_min([intv(7), intv(2), intv(9), intv(1), intv(5)], v.m);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].m['@value']).toBe(1);
  });

  test('single element', async () => {
    let v = Vars("m");
    const query = WOQL.range_min([intv(42)], v.m);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].m['@value']).toBe(42);
  });

  test('empty list yields no bindings', async () => {
    let v = Vars("m");
    const query = WOQL.range_min([], v.m);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('minimum of dates', async () => {
    let v = Vars("m");
    const query = WOQL.range_min([datv('2024-06-15'), datv('2024-01-01'), datv('2024-03-01')], v.m);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].m['@value']).toBe('2024-01-01');
  });

  test('equal elements', async () => {
    let v = Vars("m");
    const query = WOQL.range_min([intv(3), intv(3), intv(3)], v.m);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].m['@value']).toBe(3);
  });
});

describe('RangeMax', () => {
  test('maximum of integers', async () => {
    let v = Vars("m");
    const query = WOQL.range_max([intv(7), intv(2), intv(9), intv(1), intv(5)], v.m);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].m['@value']).toBe(9);
  });

  test('maximum of dates', async () => {
    let v = Vars("m");
    const query = WOQL.range_max([datv('2024-06-15'), datv('2024-01-01'), datv('2024-03-01')], v.m);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].m['@value']).toBe('2024-06-15');
  });
});
