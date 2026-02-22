//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_irt';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

afterAll(async () => {
  await teardownTestBranch(client, branchName);
}, 30000);

function iv(v: string) {
  return { '@type': 'xdd:dateTimeInterval', '@value': v } as any;
}

function str(v: string) {
  return { '@type': 'xsd:string', '@value': v } as any;
}

describe('IntervalRelationTyped — validation mode', () => {
  test('meets: Q1 meets Q2', async () => {
    const query = WOQL.interval_relation_typed(
      str('meets'), iv('2024-01-01/2024-04-01'), iv('2024-04-01/2024-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('rejects meets when gap exists', async () => {
    const query = WOQL.interval_relation_typed(
      str('meets'), iv('2024-01-01/2024-04-01'), iv('2024-05-01/2024-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('before: Q1 before Q3', async () => {
    const query = WOQL.interval_relation_typed(
      str('before'), iv('2024-01-01/2024-03-01'), iv('2024-06-01/2024-09-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('during: sub-interval within year', async () => {
    const query = WOQL.interval_relation_typed(
      str('during'), iv('2024-03-01/2024-06-01'), iv('2024-01-01/2024-12-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('equals: same interval', async () => {
    const query = WOQL.interval_relation_typed(
      str('equals'), iv('2024-01-01/2024-06-01'), iv('2024-01-01/2024-06-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('overlaps: X overlaps Y', async () => {
    const query = WOQL.interval_relation_typed(
      str('overlaps'), iv('2024-01-01/2024-06-01'), iv('2024-04-01/2024-09-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('contains: FY contains Q2', async () => {
    const query = WOQL.interval_relation_typed(
      str('contains'), iv('2024-01-01/2025-01-01'), iv('2024-04-01/2024-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });
});

describe('IntervalRelationTyped — classification mode', () => {
  test('classifies as meets', async () => {
    let v = Vars("rel");
    const query = WOQL.interval_relation_typed(
      v.rel, iv('2024-01-01/2024-04-01'), iv('2024-04-01/2024-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].rel['@value']).toBe('meets');
  });

  test('classifies as before', async () => {
    let v = Vars("rel");
    const query = WOQL.interval_relation_typed(
      v.rel, iv('2024-01-01/2024-03-01'), iv('2024-06-01/2024-09-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].rel['@value']).toBe('before');
  });

  test('classifies as during', async () => {
    let v = Vars("rel");
    const query = WOQL.interval_relation_typed(
      v.rel, iv('2024-03-01/2024-06-01'), iv('2024-01-01/2024-12-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].rel['@value']).toBe('during');
  });

  test('classifies as equals', async () => {
    let v = Vars("rel");
    const query = WOQL.interval_relation_typed(
      v.rel, iv('2024-01-01/2024-06-01'), iv('2024-01-01/2024-06-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].rel['@value']).toBe('equals');
  });

  test('classifies dateTime intervals as meets', async () => {
    let v = Vars("rel");
    const query = WOQL.interval_relation_typed(
      v.rel,
      iv('2024-01-01T08:00:00Z/2024-01-01T12:00:00Z'),
      iv('2024-01-01T12:00:00Z/2024-01-01T17:00:00Z'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].rel['@value']).toBe('meets');
  });
});
