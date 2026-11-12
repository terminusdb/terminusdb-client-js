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
  test.each([
    { name: 'meets: Q1 meets Q2', rel: 'meets', i1: '2024-01-01/2024-03-31', i2: '2024-04-01/2024-06-30', expected: 1 },
    { name: 'rejects meets when gap exists', rel: 'meets', i1: '2024-01-01/2024-04-01', i2: '2024-05-01/2024-07-01', expected: 0 },
    { name: 'before: Q1 before Q3', rel: 'before', i1: '2024-01-01/2024-03-01', i2: '2024-06-01/2024-09-01', expected: 1 },
    { name: 'during: sub-interval within year', rel: 'during', i1: '2024-03-01/2024-06-01', i2: '2024-01-01/2024-12-01', expected: 1 },
    { name: 'equals: same interval', rel: 'equals', i1: '2024-01-01/2024-06-01', i2: '2024-01-01/2024-06-01', expected: 1 },
    { name: 'overlaps: X overlaps Y', rel: 'overlaps', i1: '2024-01-01/2024-06-01', i2: '2024-04-01/2024-09-01', expected: 1 },
    { name: 'contains: FY contains Q2', rel: 'contains', i1: '2024-01-01/2025-01-01', i2: '2024-04-01/2024-07-01', expected: 1 },
    { name: 'after: Q3 after Q1', rel: 'after', i1: '2024-06-01/2024-09-01', i2: '2024-01-01/2024-03-01', expected: 1 },
    { name: 'met_by: Q2 met_by Q1', rel: 'met_by', i1: '2024-04-01/2024-06-30', i2: '2024-01-01/2024-03-31', expected: 1 },
    { name: 'overlapped_by: Y overlapped_by X', rel: 'overlapped_by', i1: '2024-04-01/2024-09-01', i2: '2024-01-01/2024-06-01', expected: 1 },
    { name: 'starts: sub-interval starts outer', rel: 'starts', i1: '2024-01-01/2024-04-01', i2: '2024-01-01/2024-12-01', expected: 1 },
    { name: 'started_by: outer started_by sub-interval', rel: 'started_by', i1: '2024-01-01/2024-12-01', i2: '2024-01-01/2024-04-01', expected: 1 },
    { name: 'finishes: sub-interval finishes outer', rel: 'finishes', i1: '2024-09-01/2024-12-01', i2: '2024-01-01/2024-12-01', expected: 1 },
    { name: 'finished_by: outer finished_by sub-interval', rel: 'finished_by', i1: '2024-01-01/2024-12-01', i2: '2024-09-01/2024-12-01', expected: 1 },
  ])('$name', async ({ rel, i1, i2, expected }) => {
    const query = WOQL.interval_relation_typed(str(rel), iv(i1), iv(i2));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(expected);
  });
});

describe('IntervalRelationTyped — classification mode', () => {
  test.each([
    { name: 'classifies as meets', expected: 'meets', i1: '2024-01-01/2024-03-31', i2: '2024-04-01/2024-06-30' },
    { name: 'classifies as before', expected: 'before', i1: '2024-01-01/2024-03-01', i2: '2024-06-01/2024-09-01' },
    { name: 'classifies as during', expected: 'during', i1: '2024-03-01/2024-06-01', i2: '2024-01-01/2024-12-01' },
    { name: 'classifies as equals', expected: 'equals', i1: '2024-01-01/2024-06-01', i2: '2024-01-01/2024-06-01' },
    { name: 'classifies as overlaps', expected: 'overlaps', i1: '2024-01-01/2024-06-01', i2: '2024-04-01/2024-09-01' },
    { name: 'classifies as overlapped_by', expected: 'overlapped_by', i1: '2024-04-01/2024-09-01', i2: '2024-01-01/2024-06-01' },
    { name: 'classifies as contains', expected: 'contains', i1: '2024-01-01/2025-01-01', i2: '2024-04-01/2024-07-01' },
    { name: 'classifies as after', expected: 'after', i1: '2024-06-01/2024-09-01', i2: '2024-01-01/2024-03-01' },
    { name: 'classifies as met_by', expected: 'met_by', i1: '2024-04-01/2024-06-30', i2: '2024-01-01/2024-03-31' },
    { name: 'classifies as starts', expected: 'starts', i1: '2024-01-01/2024-04-01', i2: '2024-01-01/2024-12-01' },
    { name: 'classifies as started_by', expected: 'started_by', i1: '2024-01-01/2024-12-01', i2: '2024-01-01/2024-04-01' },
    { name: 'classifies as finishes', expected: 'finishes', i1: '2024-09-01/2024-12-01', i2: '2024-01-01/2024-12-01' },
    { name: 'classifies as finished_by', expected: 'finished_by', i1: '2024-01-01/2024-12-01', i2: '2024-09-01/2024-12-01' },
    { name: 'classifies dateTime intervals as meets', expected: 'meets', i1: '2024-01-01T08:00:00Z/2024-01-01T12:00:00Z', i2: '2024-01-01T12:00:00Z/2024-01-01T17:00:00Z' },
  ])('$name', async ({ expected, i1, i2 }) => {
    let v = Vars("rel");
    const query = WOQL.interval_relation_typed(v.rel, iv(i1), iv(i2));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].rel['@value']).toBe(expected);
  });
});
