//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_day_adjacency';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

function dat(v: string) {
  return { '@type': 'xsd:date', '@value': v } as any;
}

afterAll(async () => {
  await teardownTestBranch(client, branchName);
}, 30000);

describe('Interval — construct (start+end -> interval)', () => {
  test('constructs Q1 interval from two dates', async () => {
    let v = Vars("i");
    const query = WOQL.interval(dat('2025-01-01'), dat('2025-03-31'), v.i);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].i['@type']).toBe('xdd:dateTimeInterval');
    // xsd:date endpoints denote whole days, both inclusive; the interval is
    // rendered with instants, where the end is the first moment not covered
    expect(result?.bindings[0].i['@value']).toBe('2025-01-01T00:00:00Z/2025-04-01T00:00:00Z');
  });

  test('constructs full-year interval', async () => {
    let v = Vars("i");
    const query = WOQL.interval(dat('2024-01-01'), dat('2024-12-31'), v.i);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].i['@value']).toBe('2024-01-01T00:00:00Z/2025-01-01T00:00:00Z');
  });
});

describe('Interval — deconstruct (interval -> start+end)', () => {
  test('extracts start and end from interval', async () => {
    let v = Vars("s", "e");
    const intVal = { '@type': 'xdd:dateTimeInterval', '@value': '2025-01-01/2025-03-31' } as any;
    const query = WOQL.interval(v.s, v.e, intVal);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2025-01-01T00:00:00Z');
    expect(result?.bindings[0].e['@value']).toBe('2025-04-01T00:00:00Z');
  });
});

describe('Interval — validation (all args ground)', () => {
  test('succeeds when all three match', async () => {
    const intVal = { '@type': 'xdd:dateTimeInterval', '@value': '2025-01-01/2025-03-31' } as any;
    const query = WOQL.interval(dat('2025-01-01'), dat('2025-03-31'), intVal);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('fails when interval does not match dates', async () => {
    const intVal = { '@type': 'xdd:dateTimeInterval', '@value': '2025-01-01/2025-03-31' } as any;
    const query = WOQL.interval(dat('2025-01-01'), dat('2025-04-30'), intVal);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

describe('DayAfter — forward (date -> next)', () => {
  test.each([
    { name: 'mid-month: Jan 15 -> Jan 16', date: '2025-01-15', next: '2025-01-16' },
    { name: 'end-of-month: Jan 31 -> Feb 1', date: '2025-01-31', next: '2025-02-01' },
    { name: 'end-of-year: Dec 31 -> Jan 1 next year', date: '2025-12-31', next: '2026-01-01' },
    { name: 'leap Feb 28 -> Feb 29', date: '2024-02-28', next: '2024-02-29' },
    { name: 'leap Feb 29 -> Mar 1', date: '2024-02-29', next: '2024-03-01' },
    { name: 'non-leap Feb 28 -> Mar 1', date: '2023-02-28', next: '2023-03-01' },
  ])('$name', async ({ date, next }) => {
    let v = Vars("n");
    const query = WOQL.day_after(dat(date), v.n);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].n['@value']).toBe(next);
  });
});

describe('DayAfter — bidirectional (next -> date)', () => {
  test.each([
    { name: 'given next=Apr 1, deduces date=Mar 31', next: '2025-04-01', date: '2025-03-31' },
    { name: 'given next=Jan 1, deduces date=Dec 31 prev year', next: '2025-01-01', date: '2024-12-31' },
    { name: 'given next=Mar 1 in leap year, deduces date=Feb 29', next: '2024-03-01', date: '2024-02-29' },
  ])('$name', async ({ next, date }) => {
    let v = Vars("d");
    const query = WOQL.day_after(v.d, dat(next));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(date);
  });
});

describe('DayBefore — forward (date -> previous)', () => {
  test.each([
    { name: 'mid-month: Jan 15 -> Jan 14', date: '2025-01-15', prev: '2025-01-14' },
    { name: 'start-of-month: Mar 1 -> Feb 28 (non-leap)', date: '2025-03-01', prev: '2025-02-28' },
    { name: 'start-of-year: Jan 1 -> Dec 31 prev year', date: '2025-01-01', prev: '2024-12-31' },
    { name: 'leap Mar 1 -> Feb 29', date: '2024-03-01', prev: '2024-02-29' },
    { name: 'end of 30-day month: May 1 -> Apr 30', date: '2025-05-01', prev: '2025-04-30' },
  ])('$name', async ({ date, prev }) => {
    let v = Vars("p");
    const query = WOQL.day_before(dat(date), v.p);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].p['@value']).toBe(prev);
  });
});

describe('DayBefore — bidirectional (previous -> date)', () => {
  test.each([
    { name: 'given previous=Mar 31, deduces date=Apr 1', prev: '2025-03-31', date: '2025-04-01' },
    { name: 'given previous=Dec 31, deduces date=Jan 1 next year', prev: '2024-12-31', date: '2025-01-01' },
    { name: 'given previous=Feb 29, deduces date=Mar 1 in leap year', prev: '2024-02-29', date: '2024-03-01' },
  ])('$name', async ({ prev, date }) => {
    let v = Vars("d");
    const query = WOQL.day_before(v.d, dat(prev));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(date);
  });
});

describe('DayAfter/DayBefore — validation (both args ground)', () => {
  test('day_after succeeds when both args are correct', async () => {
    const query = WOQL.day_after(dat('2025-01-15'), dat('2025-01-16'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('day_after fails when next is wrong', async () => {
    const query = WOQL.day_after(dat('2025-01-15'), dat('2025-01-17'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('day_before succeeds when both args are correct', async () => {
    const query = WOQL.day_before(dat('2025-01-15'), dat('2025-01-14'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('day_before fails when previous is wrong', async () => {
    const query = WOQL.day_before(dat('2025-01-15'), dat('2025-01-13'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});
