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

// ---------------------------------------------------------------------------
// Typed-literal helpers
// ---------------------------------------------------------------------------
function dat(v: string) {
  return { '@type': 'xsd:date', '@value': v } as any;
}
function ym(v: string) {
  return { '@type': 'xsd:gYearMonth', '@value': v } as any;
}
function dt(v: string) {
  return { '@type': 'xsd:dateTime', '@value': v } as any;
}
function yr(v: string) {
  return { '@type': 'xsd:gYear', '@value': v } as any;
}
function dec(v: string) {
  return { '@type': 'xsd:decimal', '@value': v } as any;
}

// ═══════════════════════════════════════════════════════════════════════════
// Date sequences
// ═══════════════════════════════════════════════════════════════════════════

describe('Sequence of xsd:date values', () => {
  test('generates daily dates for a week', async () => {
    let v = Vars("d");
    const query = WOQL.sequence(v.d, dat('2025-01-06'), dat('2025-01-13'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(7);
    const values = result?.bindings.map((b: any) => b.d['@value']);
    expect(values).toEqual([
      '2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09',
      '2025-01-10', '2025-01-11', '2025-01-12',
    ]);
  });

  test('generates weekly dates with integer step', async () => {
    let v = Vars("d");
    const query = WOQL.sequence(v.d, dat('2025-01-01'), dat('2025-02-01'), 7);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(5);
    const values = result?.bindings.map((b: any) => b.d['@value']);
    expect(values).toEqual([
      '2025-01-01', '2025-01-08', '2025-01-15', '2025-01-22', '2025-01-29',
    ]);
  });

  test('crosses month boundary correctly', async () => {
    let v = Vars("d");
    const query = WOQL.sequence(v.d, dat('2025-01-30'), dat('2025-02-03'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(4);
    const values = result?.bindings.map((b: any) => b.d['@value']);
    expect(values).toEqual([
      '2025-01-30', '2025-01-31', '2025-02-01', '2025-02-02',
    ]);
  });

  test('handles Feb 28 → Mar 1 in non-leap year', async () => {
    let v = Vars("d");
    const query = WOQL.sequence(v.d, dat('2025-02-27'), dat('2025-03-02'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(3);
    const values = result?.bindings.map((b: any) => b.d['@value']);
    expect(values).toEqual(['2025-02-27', '2025-02-28', '2025-03-01']);
  });

  test('handles Feb 28-29 → Mar 1 in leap year', async () => {
    let v = Vars("d");
    const query = WOQL.sequence(v.d, dat('2024-02-27'), dat('2024-03-02'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(4);
    const values = result?.bindings.map((b: any) => b.d['@value']);
    expect(values).toEqual(['2024-02-27', '2024-02-28', '2024-02-29', '2024-03-01']);
  });

  test('empty range for equal dates', async () => {
    let v = Vars("d");
    const query = WOQL.sequence(v.d, dat('2025-06-01'), dat('2025-06-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('single date for adjacent days', async () => {
    let v = Vars("d");
    const query = WOQL.sequence(v.d, dat('2025-06-01'), dat('2025-06-02'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].d['@value']).toBe('2025-06-01');
  });

  test('date matcher succeeds for date in range', async () => {
    const query = WOQL.sequence(dat('2025-01-15'), dat('2025-01-01'), dat('2025-02-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('date matcher fails for date outside range', async () => {
    const query = WOQL.sequence(dat('2025-03-01'), dat('2025-01-01'), dat('2025-02-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('date matcher fails at exclusive end', async () => {
    const query = WOQL.sequence(dat('2025-02-01'), dat('2025-01-01'), dat('2025-02-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// gYearMonth sequences
// ═══════════════════════════════════════════════════════════════════════════

describe('Sequence of xsd:gYearMonth values', () => {
  test('generates months for H1 2025', async () => {
    let v = Vars("m");
    const query = WOQL.sequence(v.m, ym('2025-01'), ym('2025-07'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(6);
    const values = result?.bindings.map((b: any) => b.m['@value']);
    expect(values).toEqual([
      '2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06',
    ]);
  });

  test('generates months crossing year boundary', async () => {
    let v = Vars("m");
    const query = WOQL.sequence(v.m, ym('2024-10'), ym('2025-04'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(6);
    const values = result?.bindings.map((b: any) => b.m['@value']);
    expect(values).toEqual([
      '2024-10', '2024-11', '2024-12', '2025-01', '2025-02', '2025-03',
    ]);
  });

  test('single month for adjacent gYearMonth values', async () => {
    let v = Vars("m");
    const query = WOQL.sequence(v.m, ym('2025-06'), ym('2025-07'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].m['@value']).toBe('2025-06');
  });

  test('empty range for equal gYearMonth', async () => {
    let v = Vars("m");
    const query = WOQL.sequence(v.m, ym('2025-03'), ym('2025-03'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('gYearMonth matcher succeeds for month in range', async () => {
    const query = WOQL.sequence(ym('2025-03'), ym('2025-01'), ym('2025-07'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('gYearMonth matcher fails at exclusive end', async () => {
    const query = WOQL.sequence(ym('2025-07'), ym('2025-01'), ym('2025-07'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('quarterly step generates 4 quarter starts', async () => {
    let v = Vars("m");
    const query = WOQL.sequence(v.m, ym('2025-01'), ym('2026-01'), 3);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(4);
    const values = result?.bindings.map((b: any) => b.m['@value']);
    expect(values).toEqual(['2025-01', '2025-04', '2025-07', '2025-10']);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// DateTime sequences
// ═══════════════════════════════════════════════════════════════════════════

describe('Sequence of xsd:dateTime values', () => {
  test('generates hourly timestamps for 6 hours', async () => {
    let v = Vars("t");
    const query = WOQL.sequence(v.t, dt('2025-01-01T00:00:00Z'), dt('2025-01-01T06:00:00Z'), 3600);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(6);
    const values = result?.bindings.map((b: any) => b.t['@value']);
    expect(values).toEqual([
      '2025-01-01T00:00:00Z', '2025-01-01T01:00:00Z', '2025-01-01T02:00:00Z',
      '2025-01-01T03:00:00Z', '2025-01-01T04:00:00Z', '2025-01-01T05:00:00Z',
    ]);
  });

  test('crosses midnight with per-second step', async () => {
    let v = Vars("t");
    const query = WOQL.sequence(v.t, dt('2025-01-01T23:59:57Z'), dt('2025-01-02T00:00:02Z'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(5);
  });

  test('generates 15-minute intervals', async () => {
    let v = Vars("t");
    const query = WOQL.sequence(v.t, dt('2025-06-15T09:00:00Z'), dt('2025-06-15T10:00:00Z'), 900);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(4);
    const values = result?.bindings.map((b: any) => b.t['@value']);
    expect(values).toEqual([
      '2025-06-15T09:00:00Z', '2025-06-15T09:15:00Z',
      '2025-06-15T09:30:00Z', '2025-06-15T09:45:00Z',
    ]);
  });

  test('empty range for equal dateTime', async () => {
    let v = Vars("t");
    const query = WOQL.sequence(v.t, dt('2025-01-01T12:00:00Z'), dt('2025-01-01T12:00:00Z'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('dateTime matcher succeeds on hourly step', async () => {
    const query = WOQL.sequence(dt('2025-01-01T03:00:00Z'), dt('2025-01-01T00:00:00Z'), dt('2025-01-01T06:00:00Z'), 3600);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('dateTime matcher fails between steps', async () => {
    const query = WOQL.sequence(dt('2025-01-01T03:30:00Z'), dt('2025-01-01T00:00:00Z'), dt('2025-01-01T06:00:00Z'), 3600);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('dateTime matcher fails at exclusive end', async () => {
    const query = WOQL.sequence(dt('2025-01-01T06:00:00Z'), dt('2025-01-01T00:00:00Z'), dt('2025-01-01T06:00:00Z'), 3600);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// gYear sequences
// ═══════════════════════════════════════════════════════════════════════════

describe('Sequence of xsd:gYear values', () => {
  test('generates a decade of years', async () => {
    let v = Vars("y");
    const query = WOQL.sequence(v.y, yr('2020'), yr('2030'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(10);
    const values = result?.bindings.map((b: any) => b.y['@value']);
    expect(values).toEqual([
      '2020', '2021', '2022', '2023', '2024',
      '2025', '2026', '2027', '2028', '2029',
    ]);
  });

  test('generates every 5th year', async () => {
    let v = Vars("y");
    const query = WOQL.sequence(v.y, yr('2000'), yr('2020'), 5);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(4);
    const values = result?.bindings.map((b: any) => b.y['@value']);
    expect(values).toEqual(['2000', '2005', '2010', '2015']);
  });

  test('single year for adjacent values', async () => {
    let v = Vars("y");
    const query = WOQL.sequence(v.y, yr('2025'), yr('2026'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].y['@value']).toBe('2025');
  });

  test('empty range for equal gYear', async () => {
    let v = Vars("y");
    const query = WOQL.sequence(v.y, yr('2025'), yr('2025'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('gYear matcher succeeds for year in range', async () => {
    const query = WOQL.sequence(yr('2025'), yr('2020'), yr('2030'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('gYear matcher fails at exclusive end', async () => {
    const query = WOQL.sequence(yr('2030'), yr('2020'), yr('2030'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Decimal sequences
// ═══════════════════════════════════════════════════════════════════════════

describe('Sequence of xsd:decimal values', () => {
  test('generates 0, 0.3, 0.6, 0.9 with step 0.3', async () => {
    let v = Vars("r");
    const query = WOQL.sequence(v.r, dec('0.0'), dec('1.0'), dec('0.3'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(4);
    const values = result?.bindings.map((b: any) => b.r['@value']);
    expect(values).toEqual([0, 0.3, 0.6, 0.9]);
  });

  test('generates 1, 1.5, 2 with step 0.5', async () => {
    let v = Vars("r");
    const query = WOQL.sequence(v.r, dec('1.0'), dec('2.5'), dec('0.5'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(3);
    const values = result?.bindings.map((b: any) => b.r['@value']);
    expect(values).toEqual([1, 1.5, 2]);
  });

  test('decimal matcher succeeds for value on step', async () => {
    const query = WOQL.sequence(dec('0.6'), dec('0.0'), dec('1.0'), dec('0.3'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('decimal matcher fails for value between steps', async () => {
    const query = WOQL.sequence(dec('0.5'), dec('0.0'), dec('1.0'), dec('0.3'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

afterAll(async () => {
  await teardownTestBranch(client, branchName);
});
