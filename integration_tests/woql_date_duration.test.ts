//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_date_duration';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

afterAll(async () => {
  await teardownTestBranch(client, branchName);
}, 30000);

function dat(v: string) {
  return { '@type': 'xsd:date', '@value': v } as any;
}

function dtm(v: string) {
  return { '@type': 'xsd:dateTime', '@value': v } as any;
}

function dur(v: string) {
  return { '@type': 'xsd:duration', '@value': v } as any;
}

describe('DateDuration — Start + End → Duration', () => {
  test('leap year: 2024-01-01 to 2024-04-01 = P91D', async () => {
    let v = Vars("d");
    const query = WOQL.date_duration(dat('2024-01-01'), dat('2024-04-01'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('P91D');
  });

  test('non-leap year: 2025-01-01 to 2025-04-01 = P90D', async () => {
    let v = Vars("d");
    const query = WOQL.date_duration(dat('2025-01-01'), dat('2025-04-01'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('P90D');
  });

  test('zero duration: same date = P0D', async () => {
    let v = Vars("d");
    const query = WOQL.date_duration(dat('2024-01-01'), dat('2024-01-01'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('P0D');
  });

  test('dateTime with time difference: PT9H30M', async () => {
    let v = Vars("d");
    const query = WOQL.date_duration(dtm('2024-01-01T08:00:00Z'), dtm('2024-01-01T17:30:00Z'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('PT9H30M');
  });

  test('dateTime midnight-to-midnight: P3D (time-insignificant)', async () => {
    let v = Vars("d");
    const query = WOQL.date_duration(dtm('2024-01-01T00:00:00Z'), dtm('2024-01-04T00:00:00Z'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('P3D');
  });
});

describe('DateDuration — Start + Duration → End (EOM-aware addition)', () => {
  test('Jan 31 + P1M = Feb 29 (leap year)', async () => {
    let v = Vars("e");
    const query = WOQL.date_duration(dat('2020-01-31'), v.e, dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2020-02-29');
  });

  test('Jan 31 + P1M = Feb 28 (non-leap year)', async () => {
    let v = Vars("e");
    const query = WOQL.date_duration(dat('2021-01-31'), v.e, dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2021-02-28');
  });

  test('Jan 30 + P1M = Feb 29 (clamped, leap)', async () => {
    let v = Vars("e");
    const query = WOQL.date_duration(dat('2020-01-30'), v.e, dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2020-02-29');
  });

  test('Jan 28 + P1M = Feb 28 (no clamping needed)', async () => {
    let v = Vars("e");
    const query = WOQL.date_duration(dat('2020-01-28'), v.e, dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2020-02-28');
  });

  test('Feb 29 + P1M = Mar 31 (EOM preservation)', async () => {
    let v = Vars("e");
    const query = WOQL.date_duration(dat('2020-02-29'), v.e, dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2020-03-31');
  });

  test('Apr 30 + P1M = May 31 (EOM preservation)', async () => {
    let v = Vars("e");
    const query = WOQL.date_duration(dat('2020-04-30'), v.e, dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2020-05-31');
  });

  test('Dec 31 + P1M = Jan 31 next year', async () => {
    let v = Vars("e");
    const query = WOQL.date_duration(dat('2020-12-31'), v.e, dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2021-01-31');
  });

  test('dateTime: Jan 31T10:00:00Z + P1M = Feb 29T10:00:00Z (leap)', async () => {
    let v = Vars("e");
    const query = WOQL.date_duration(dtm('2020-01-31T10:00:00Z'), v.e, dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2020-02-29T10:00:00Z');
  });
});

describe('DateDuration — Duration + End → Start (EOM-aware subtraction)', () => {
  test('Mar 31 - P1M = Feb 29 (leap year)', async () => {
    let v = Vars("s");
    const query = WOQL.date_duration(v.s, dat('2020-03-31'), dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2020-02-29');
  });

  test('Mar 31 - P1M = Feb 28 (non-leap year)', async () => {
    let v = Vars("s");
    const query = WOQL.date_duration(v.s, dat('2021-03-31'), dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2021-02-28');
  });

  test('Jan 31 - P1M = Dec 31 previous year', async () => {
    let v = Vars("s");
    const query = WOQL.date_duration(v.s, dat('2021-01-31'), dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2020-12-31');
  });
});

describe('DateDuration — EOM reversibility', () => {
  test('Feb 29 - P1M = Jan 31 (reverse of Jan 31 + P1M = Feb 29)', async () => {
    let v = Vars("s");
    const query = WOQL.date_duration(v.s, dat('2020-02-29'), dur('P1M'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2020-01-31');
  });
});

describe('DateDuration — Validation (all three ground)', () => {
  test('consistent: 2024-01-01 + P91D = 2024-04-01', async () => {
    const query = WOQL.date_duration(dat('2024-01-01'), dat('2024-04-01'), dur('P91D'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('inconsistent: 2024-01-01 + P90D does not equal 2024-04-01', async () => {
    const query = WOQL.date_duration(dat('2024-01-01'), dat('2024-04-01'), dur('P90D'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});
