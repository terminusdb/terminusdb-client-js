//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_month_boundary';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

describe('MonthStartDate', () => {
  test('computes first day of January 2024', async () => {
    let v = Vars("d");
    const query = WOQL.month_start_date(
      { '@type': 'xsd:gYearMonth', '@value': '2024-01' } as any,
      v.d,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2024-01-01');
  });

  test('computes first day of December 2023', async () => {
    let v = Vars("d");
    const query = WOQL.month_start_date(
      { '@type': 'xsd:gYearMonth', '@value': '2023-12' } as any,
      v.d,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2023-12-01');
  });
});

describe('MonthEndDate', () => {
  test('computes last day of January (31 days)', async () => {
    let v = Vars("d");
    const query = WOQL.month_end_date(
      { '@type': 'xsd:gYearMonth', '@value': '2024-01' } as any,
      v.d,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2024-01-31');
  });

  test('handles leap year February: 2024-02-29', async () => {
    let v = Vars("d");
    const query = WOQL.month_end_date(
      { '@type': 'xsd:gYearMonth', '@value': '2024-02' } as any,
      v.d,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2024-02-29');
  });

  test('handles non-leap year February: 2023-02-28', async () => {
    let v = Vars("d");
    const query = WOQL.month_end_date(
      { '@type': 'xsd:gYearMonth', '@value': '2023-02' } as any,
      v.d,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2023-02-28');
  });

  test('century leap year: 2000-02-29', async () => {
    let v = Vars("d");
    const query = WOQL.month_end_date(
      { '@type': 'xsd:gYearMonth', '@value': '2000-02' } as any,
      v.d,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2000-02-29');
  });

  test('century non-leap year: 1900-02-28', async () => {
    let v = Vars("d");
    const query = WOQL.month_end_date(
      { '@type': 'xsd:gYearMonth', '@value': '1900-02' } as any,
      v.d,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('1900-02-28');
  });
});

describe('MonthStartDates (generator)', () => {
  test('generates 12 first-of-month dates in FY2024', async () => {
    let v = Vars("d");
    const query = WOQL.month_start_dates(
      v.d,
      { '@type': 'xsd:date', '@value': '2024-01-01' } as any,
      { '@type': 'xsd:date', '@value': '2025-01-01' } as any,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(12);
    expect(result?.bindings[0].d['@value']).toBe('2024-01-01');
    expect(result?.bindings[11].d['@value']).toBe('2024-12-01');
  });

  test('generates 3 first-of-month dates in Q2', async () => {
    let v = Vars("d");
    const query = WOQL.month_start_dates(
      v.d,
      { '@type': 'xsd:date', '@value': '2024-04-01' } as any,
      { '@type': 'xsd:date', '@value': '2024-07-01' } as any,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(3);
    const values = result?.bindings.map((b: any) => b.d['@value']);
    expect(values).toEqual(['2024-04-01', '2024-05-01', '2024-06-01']);
  });
});

describe('MonthEndDates (generator)', () => {
  test('generates 12 last-of-month dates in FY2024', async () => {
    let v = Vars("d");
    const query = WOQL.month_end_dates(
      v.d,
      { '@type': 'xsd:date', '@value': '2024-01-01' } as any,
      { '@type': 'xsd:date', '@value': '2025-01-01' } as any,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(12);
    expect(result?.bindings[0].d['@value']).toBe('2024-01-31');
    expect(result?.bindings[1].d['@value']).toBe('2024-02-29');
    expect(result?.bindings[11].d['@value']).toBe('2024-12-31');
  });

  test('generates correct Feb end dates across leap/non-leap boundary', async () => {
    let v = Vars("d");
    const query = WOQL.month_end_dates(
      v.d,
      { '@type': 'xsd:date', '@value': '2023-01-01' } as any,
      { '@type': 'xsd:date', '@value': '2025-01-01' } as any,
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(24);
    expect(result?.bindings[1].d['@value']).toBe('2023-02-28');
    expect(result?.bindings[13].d['@value']).toBe('2024-02-29');
  });
});

afterAll(async () => {
  await teardownTestBranch(client, branchName);
});
