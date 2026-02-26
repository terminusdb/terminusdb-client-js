//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_weekday';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

function dat(v: string) {
  return { '@type': 'xsd:date', '@value': v } as any;
}

function dtm(v: string) {
  return { '@type': 'xsd:dateTime', '@value': v } as any;
}

afterAll(async () => {
  await teardownTestBranch(client, branchName);
}, 30000);

describe('Weekday — ISO (Monday=1, Sunday=7)', () => {
  test('Monday: 2024-01-01 -> 1', async () => {
    let v = Vars("d");
    const query = WOQL.weekday(dat('2024-01-01'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(1);
  });

  test('Sunday: 2024-01-07 -> 7', async () => {
    let v = Vars("d");
    const query = WOQL.weekday(dat('2024-01-07'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(7);
  });

  test('Saturday: 2024-01-06 -> 6', async () => {
    let v = Vars("d");
    const query = WOQL.weekday(dat('2024-01-06'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(6);
  });

  test('Leap day 2024-02-29 -> Thursday (4)', async () => {
    let v = Vars("d");
    const query = WOQL.weekday(dat('2024-02-29'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(4);
  });

  test('Validation succeeds: 2024-01-01 is Monday (1)', async () => {
    const query = WOQL.weekday(dat('2024-01-01'), 1);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('Validation fails: 2024-01-01 is not Tuesday (2)', async () => {
    const query = WOQL.weekday(dat('2024-01-01'), 2);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('dateTime: 2024-01-01T12:00:00Z -> Monday (1)', async () => {
    let v = Vars("d");
    const query = WOQL.weekday(dtm('2024-01-01T12:00:00Z'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(1);
  });

  test('dateTime Sunday: 2024-01-07T23:59:59Z -> 7', async () => {
    let v = Vars("d");
    const query = WOQL.weekday(dtm('2024-01-07T23:59:59Z'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(7);
  });
});

describe('WeekdaySundayStart — US (Sunday=1, Saturday=7)', () => {
  test('Sunday: 2024-01-07 -> 1', async () => {
    let v = Vars("d");
    const query = WOQL.weekday_sunday_start(dat('2024-01-07'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(1);
  });

  test('Saturday: 2024-01-06 -> 7', async () => {
    let v = Vars("d");
    const query = WOQL.weekday_sunday_start(dat('2024-01-06'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(7);
  });

  test('Monday: 2024-01-01 -> 2', async () => {
    let v = Vars("d");
    const query = WOQL.weekday_sunday_start(dat('2024-01-01'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(2);
  });

  test('dateTime Sunday: 2024-01-07T10:00:00Z -> 1', async () => {
    let v = Vars("d");
    const query = WOQL.weekday_sunday_start(dtm('2024-01-07T10:00:00Z'), v.d);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe(1);
  });
});

describe('IsoWeek — ISO 8601 week-date', () => {
  test('2024-01-01 -> week 1 of 2024', async () => {
    let v = Vars("y", "w");
    const query = WOQL.iso_week(dat('2024-01-01'), v.y, v.w);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].y['@value']).toBe(2024);
    expect(result?.bindings[0].w['@value']).toBe(1);
  });

  test('2024-12-30 -> week 1 of 2025 (year boundary)', async () => {
    let v = Vars("y", "w");
    const query = WOQL.iso_week(dat('2024-12-30'), v.y, v.w);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].y['@value']).toBe(2025);
    expect(result?.bindings[0].w['@value']).toBe(1);
  });

  test('2023-01-01 -> week 52 of 2022 (Jan 1 in prev year ISO week)', async () => {
    let v = Vars("y", "w");
    const query = WOQL.iso_week(dat('2023-01-01'), v.y, v.w);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].y['@value']).toBe(2022);
    expect(result?.bindings[0].w['@value']).toBe(52);
  });

  test('2020-12-31 -> week 53 of 2020 (53-week year)', async () => {
    let v = Vars("y", "w");
    const query = WOQL.iso_week(dat('2020-12-31'), v.y, v.w);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].y['@value']).toBe(2020);
    expect(result?.bindings[0].w['@value']).toBe(53);
  });

  test('2024-06-15 -> week 24 of 2024', async () => {
    let v = Vars("y", "w");
    const query = WOQL.iso_week(dat('2024-06-15'), v.y, v.w);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].y['@value']).toBe(2024);
    expect(result?.bindings[0].w['@value']).toBe(24);
  });

  test('dateTime: 2024-06-15T09:30:00Z -> week 24 of 2024', async () => {
    let v = Vars("y", "w");
    const query = WOQL.iso_week(dtm('2024-06-15T09:30:00Z'), v.y, v.w);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].y['@value']).toBe(2024);
    expect(result?.bindings[0].w['@value']).toBe(24);
  });

  test('Validation succeeds: 2024-01-01 is week 1 of 2024', async () => {
    const query = WOQL.iso_week(dat('2024-01-01'), 2024, 1);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('Validation fails: 2024-01-01 is not week 2 of 2024', async () => {
    const query = WOQL.iso_week(dat('2024-01-01'), 2024, 2);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});
