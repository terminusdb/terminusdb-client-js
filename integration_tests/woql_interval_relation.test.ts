//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_interval_relation';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

function dec(v: number) {
  return { '@type': 'xsd:decimal', '@value': v } as any;
}
function dat(v: string) {
  return { '@type': 'xsd:date', '@value': v } as any;
}

// ---------------------------------------------------------------------------
// All 13 Allen relations — date-based examples with realistic scenarios
// ---------------------------------------------------------------------------

describe('IntervalRelation — 7 fundamental relations (dates)', () => {
  test('before: Q1 ends before Q3 starts (gap = Q2)', async () => {
    const query = WOQL.interval_relation("before",
      dat('2025-01-01'), dat('2025-04-01'),
      dat('2025-07-01'), dat('2025-10-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('before rejects adjacent quarters (no gap)', async () => {
    const query = WOQL.interval_relation("before",
      dat('2025-01-01'), dat('2025-04-01'),
      dat('2025-04-01'), dat('2025-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test('meets: Q1 meets Q2 — exclusive end equals next start', async () => {
    const query = WOQL.interval_relation("meets",
      dat('2025-01-01'), dat('2025-04-01'),
      dat('2025-04-01'), dat('2025-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('overlaps: design phase [Jan,Jun) overlaps dev phase [Apr,Oct)', async () => {
    const query = WOQL.interval_relation("overlaps",
      dat('2025-01-01'), dat('2025-06-01'),
      dat('2025-04-01'), dat('2025-10-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('starts: first week [Jan 1,Jan 8) starts January [Jan 1,Feb 1)', async () => {
    const query = WOQL.interval_relation("starts",
      dat('2025-01-01'), dat('2025-01-08'),
      dat('2025-01-01'), dat('2025-02-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('during: a week [Mar 10,Mar 17) during Q1 [Jan 1,Apr 1)', async () => {
    const query = WOQL.interval_relation("during",
      dat('2025-03-10'), dat('2025-03-17'),
      dat('2025-01-01'), dat('2025-04-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('finishes: last week [Jan 25,Feb 1] finishes January [Jan 1,Feb 1]', async () => {
    const query = WOQL.interval_relation("finishes",
      dat('2025-01-25'), dat('2025-02-01'),
      dat('2025-01-01'), dat('2025-02-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('equals: same fiscal year', async () => {
    const query = WOQL.interval_relation("equals",
      dat('2025-01-01'), dat('2026-01-01'),
      dat('2025-01-01'), dat('2026-01-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('equals rejects when end differs', async () => {
    const query = WOQL.interval_relation("equals",
      dat('2025-01-01'), dat('2026-01-01'),
      dat('2025-01-01'), dat('2025-12-31'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });
});

describe('IntervalRelation — 6 inverse relations (dates)', () => {
  test('after: Q3 after Q1', async () => {
    const query = WOQL.interval_relation("after",
      dat('2025-07-01'), dat('2025-10-01'),
      dat('2025-01-01'), dat('2025-04-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('met_by: Q2 met_by Q1', async () => {
    const query = WOQL.interval_relation("met_by",
      dat('2025-04-01'), dat('2025-07-01'),
      dat('2025-01-01'), dat('2025-04-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('overlapped_by: dev [Apr,Oct) overlapped_by design [Jan,Jun)', async () => {
    const query = WOQL.interval_relation("overlapped_by",
      dat('2025-04-01'), dat('2025-10-01'),
      dat('2025-01-01'), dat('2025-06-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('started_by: January started_by its first week', async () => {
    const query = WOQL.interval_relation("started_by",
      dat('2025-01-01'), dat('2025-02-01'),
      dat('2025-01-01'), dat('2025-01-08'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('contains: FY contains June', async () => {
    const query = WOQL.interval_relation("contains",
      dat('2025-01-01'), dat('2026-01-01'),
      dat('2025-06-01'), dat('2025-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('finished_by: January finished_by its last week', async () => {
    const query = WOQL.interval_relation("finished_by",
      dat('2025-01-01'), dat('2025-02-01'),
      dat('2025-01-25'), dat('2025-02-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// Classification — unbound relation variable determines which relation holds
// ---------------------------------------------------------------------------

describe('IntervalRelation — classification (all 13)', () => {
  const cases: [string, string, string, string, string][] = [
    ['before',        '2025-01-01', '2025-04-01', '2025-07-01', '2025-10-01'],
    ['meets',         '2025-01-01', '2025-04-01', '2025-04-01', '2025-07-01'],
    ['overlaps',      '2025-01-01', '2025-06-01', '2025-04-01', '2025-10-01'],
    ['starts',        '2025-01-01', '2025-01-08', '2025-01-01', '2025-02-01'],
    ['during',        '2025-03-10', '2025-03-17', '2025-01-01', '2025-04-01'],
    ['finishes',      '2025-01-25', '2025-02-01', '2025-01-01', '2025-02-01'],
    ['equals',        '2025-01-01', '2026-01-01', '2025-01-01', '2026-01-01'],
    ['after',         '2025-07-01', '2025-10-01', '2025-01-01', '2025-04-01'],
    ['met_by',        '2025-04-01', '2025-07-01', '2025-01-01', '2025-04-01'],
    ['overlapped_by', '2025-04-01', '2025-10-01', '2025-01-01', '2025-06-01'],
    ['started_by',    '2025-01-01', '2025-02-01', '2025-01-01', '2025-01-08'],
    ['contains',      '2025-01-01', '2026-01-01', '2025-06-01', '2025-07-01'],
    ['finished_by',   '2025-01-01', '2025-02-01', '2025-01-25', '2025-02-01'],
  ];

  test.each(cases)(
    'classifies "%s"',
    async (expected, xs, xe, ys, ye) => {
      let v = Vars("rel");
      const query = WOQL.interval_relation(v.rel, dat(xs), dat(xe), dat(ys), dat(ye));
      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].rel['@value']).toBe(expected);
    }
  );
});

// ---------------------------------------------------------------------------
// Generator patterns — deduce endpoints from equality-based relations
// ---------------------------------------------------------------------------

describe('IntervalRelation — generator: equals deduces Y from X', () => {
  test('equals with unbound Y deduces both Y endpoints', async () => {
    let v = Vars("ys", "ye");
    const query = WOQL.interval_relation("equals",
      dat('2025-01-01'), dat('2025-04-01'),
      v.ys, v.ye);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].ys['@value']).toBe('2025-01-01');
    expect(result?.bindings[0].ye['@value']).toBe('2025-04-01');
  });

  test('equals with unbound X deduces both X endpoints', async () => {
    let v = Vars("xs", "xe");
    const query = WOQL.interval_relation("equals",
      v.xs, v.xe,
      dat('2025-06-01'), dat('2025-09-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].xs['@value']).toBe('2025-06-01');
    expect(result?.bindings[0].xe['@value']).toBe('2025-09-01');
  });
});

describe('IntervalRelation — generator: meets deduces shared boundary', () => {
  test('meets with unbound Y_start deduces it from X_end', async () => {
    let v = Vars("ys");
    const query = WOQL.interval_relation("meets",
      dat('2025-01-01'), dat('2025-04-01'),
      v.ys, dat('2025-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].ys['@value']).toBe('2025-04-01');
  });

  test('meets with unbound X_end deduces it from Y_start', async () => {
    let v = Vars("xe");
    const query = WOQL.interval_relation("meets",
      dat('2025-01-01'), v.xe,
      dat('2025-04-01'), dat('2025-07-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].xe['@value']).toBe('2025-04-01');
  });
});

describe('IntervalRelation — generator: met_by deduces shared boundary', () => {
  test('met_by with unbound X_start deduces it from Y_end', async () => {
    let v = Vars("xs");
    const query = WOQL.interval_relation("met_by",
      v.xs, dat('2025-07-01'),
      dat('2025-01-01'), dat('2025-04-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].xs['@value']).toBe('2025-04-01');
  });
});

describe('IntervalRelation — generator: starts deduces shared start', () => {
  test('starts with unbound Y_start deduces it from X_start', async () => {
    let v = Vars("ys");
    const query = WOQL.interval_relation("starts",
      dat('2025-01-01'), dat('2025-01-08'),
      v.ys, dat('2025-02-01'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].ys['@value']).toBe('2025-01-01');
  });
});

describe('IntervalRelation — generator: started_by deduces shared start', () => {
  test('started_by with unbound Y_start deduces it from X_start', async () => {
    let v = Vars("ys");
    const query = WOQL.interval_relation("started_by",
      dat('2025-01-01'), dat('2025-02-01'),
      v.ys, dat('2025-01-08'));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].ys['@value']).toBe('2025-01-01');
  });
});

describe('IntervalRelation — generator: finishes deduces shared end', () => {
  test('finishes with unbound Y_end deduces it from X_end', async () => {
    let v = Vars("ye");
    const query = WOQL.interval_relation("finishes",
      dat('2025-01-25'), dat('2025-02-01'),
      dat('2025-01-01'), v.ye);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].ye['@value']).toBe('2025-02-01');
  });
});

describe('IntervalRelation — generator: finished_by deduces shared end', () => {
  test('finished_by with unbound Y_end deduces it from X_end', async () => {
    let v = Vars("ye");
    const query = WOQL.interval_relation("finished_by",
      dat('2025-01-01'), dat('2025-02-01'),
      dat('2025-01-25'), v.ye);
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].ye['@value']).toBe('2025-02-01');
  });
});

// ---------------------------------------------------------------------------
// Numeric intervals — same patterns work with decimals
// ---------------------------------------------------------------------------

describe('IntervalRelation — numeric intervals', () => {
  test('before: [1,3) before [5,8)', async () => {
    const query = WOQL.interval_relation("before", dec(1), dec(3), dec(5), dec(8));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });

  test('meets with decimal generator: deduce Y_start', async () => {
    let v = Vars("ys");
    const query = WOQL.interval_relation("meets", dec(1), dec(5), v.ys, dec(10));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].ys['@value']).toBe(5);
  });

  test('classify decimal intervals as "during"', async () => {
    let v = Vars("rel");
    const query = WOQL.interval_relation(v.rel, dec(3), dec(7), dec(1), dec(10));
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].rel['@value']).toBe('during');
  });
});

afterAll(async () => {
  await teardownTestBranch(client, branchName);
}, 30000);
