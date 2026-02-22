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
    const query = WOQL.interval(dat('2025-01-01'), dat('2025-04-01'), v.i);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].i['@type']).toBe('xdd:dateTimeInterval');
    expect(result?.bindings[0].i['@value']).toBe('[2025-01-01,2025-04-01)');
  });

  test('constructs full-year interval', async () => {
    let v = Vars("i");
    const query = WOQL.interval(dat('2024-01-01'), dat('2025-01-01'), v.i);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].i['@value']).toBe('[2024-01-01,2025-01-01)');
  });
});

describe('Interval — deconstruct (interval -> start+end)', () => {
  test('extracts start and end from interval', async () => {
    let v = Vars("s", "e");
    const intVal = { '@type': 'xdd:dateTimeInterval', '@value': '[2025-01-01,2025-04-01)' } as any;
    const query = WOQL.interval(v.s, v.e, intVal);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2025-01-01');
    expect(result?.bindings[0].e['@value']).toBe('2025-04-01');
  });
});

describe('Interval — validation (all args ground)', () => {
  test('succeeds when all three match', async () => {
    const intVal = { '@type': 'xdd:dateTimeInterval', '@value': '[2025-01-01,2025-04-01)' } as any;
    const query = WOQL.interval(dat('2025-01-01'), dat('2025-04-01'), intVal);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('fails when interval does not match dates', async () => {
    const intVal = { '@type': 'xdd:dateTimeInterval', '@value': '[2025-01-01,2025-04-01)' } as any;
    const query = WOQL.interval(dat('2025-01-01'), dat('2025-06-01'), intVal);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

describe('DayAfter — forward (date -> next)', () => {
  test('mid-month: Jan 15 -> Jan 16', async () => {
    let v = Vars("n");
    const query = WOQL.day_after(dat('2025-01-15'), v.n);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].n['@value']).toBe('2025-01-16');
  });

  test('end-of-month: Jan 31 -> Feb 1', async () => {
    let v = Vars("n");
    const query = WOQL.day_after(dat('2025-01-31'), v.n);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].n['@value']).toBe('2025-02-01');
  });

  test('end-of-year: Dec 31 -> Jan 1 next year', async () => {
    let v = Vars("n");
    const query = WOQL.day_after(dat('2025-12-31'), v.n);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].n['@value']).toBe('2026-01-01');
  });

  test('leap Feb 28 -> Feb 29', async () => {
    let v = Vars("n");
    const query = WOQL.day_after(dat('2024-02-28'), v.n);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].n['@value']).toBe('2024-02-29');
  });

  test('leap Feb 29 -> Mar 1', async () => {
    let v = Vars("n");
    const query = WOQL.day_after(dat('2024-02-29'), v.n);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].n['@value']).toBe('2024-03-01');
  });

  test('non-leap Feb 28 -> Mar 1', async () => {
    let v = Vars("n");
    const query = WOQL.day_after(dat('2023-02-28'), v.n);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].n['@value']).toBe('2023-03-01');
  });
});

describe('DayAfter — bidirectional (next -> date)', () => {
  test('given next=Apr 1, deduces date=Mar 31', async () => {
    let v = Vars("d");
    const query = WOQL.day_after(v.d, dat('2025-04-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2025-03-31');
  });

  test('given next=Jan 1, deduces date=Dec 31 prev year', async () => {
    let v = Vars("d");
    const query = WOQL.day_after(v.d, dat('2025-01-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2024-12-31');
  });

  test('given next=Mar 1 in leap year, deduces date=Feb 29', async () => {
    let v = Vars("d");
    const query = WOQL.day_after(v.d, dat('2024-03-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2024-02-29');
  });
});

describe('DayBefore — forward (date -> previous)', () => {
  test('mid-month: Jan 15 -> Jan 14', async () => {
    let v = Vars("p");
    const query = WOQL.day_before(dat('2025-01-15'), v.p);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].p['@value']).toBe('2025-01-14');
  });

  test('start-of-month: Mar 1 -> Feb 28 (non-leap)', async () => {
    let v = Vars("p");
    const query = WOQL.day_before(dat('2025-03-01'), v.p);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].p['@value']).toBe('2025-02-28');
  });

  test('start-of-year: Jan 1 -> Dec 31 prev year', async () => {
    let v = Vars("p");
    const query = WOQL.day_before(dat('2025-01-01'), v.p);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].p['@value']).toBe('2024-12-31');
  });

  test('leap Mar 1 -> Feb 29', async () => {
    let v = Vars("p");
    const query = WOQL.day_before(dat('2024-03-01'), v.p);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].p['@value']).toBe('2024-02-29');
  });

  test('end of 30-day month: May 1 -> Apr 30', async () => {
    let v = Vars("p");
    const query = WOQL.day_before(dat('2025-05-01'), v.p);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].p['@value']).toBe('2025-04-30');
  });
});

describe('DayBefore — bidirectional (previous -> date)', () => {
  test('given previous=Mar 31, deduces date=Apr 1', async () => {
    let v = Vars("d");
    const query = WOQL.day_before(v.d, dat('2025-03-31'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2025-04-01');
  });

  test('given previous=Dec 31, deduces date=Jan 1 next year', async () => {
    let v = Vars("d");
    const query = WOQL.day_before(v.d, dat('2024-12-31'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2025-01-01');
  });

  test('given previous=Feb 29, deduces date=Mar 1 in leap year', async () => {
    let v = Vars("d");
    const query = WOQL.day_before(v.d, dat('2024-02-29'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2024-03-01');
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
