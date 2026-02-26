//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL } from '../index.js';
import { Vars } from '../lib/woql.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_interval_type';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

afterAll(async () => {
  await teardownTestBranch(client, branchName);
}, 30000);

// ---------------------------------------------------------------------------
// Typed-literal helpers
// ---------------------------------------------------------------------------
function dat(v: string) {
  return { '@type': 'xsd:date', '@value': v } as any;
}
function str(v: string) {
  return { '@type': 'xsd:string', '@value': v } as any;
}
function dti(v: string) {
  return { '@type': 'xdd:dateTimeInterval', '@value': v } as any;
}

// ═══════════════════════════════════════════════════════════════════════════
//  1. Interval predicate — construct, deconstruct, validate
// ═══════════════════════════════════════════════════════════════════════════

describe('Interval predicate — constructing intervals from dates', () => {
  test('build Q1 2025 from two xsd:date endpoints', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval(dat('2025-01-01'), dat('2025-04-01'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@type']).toBe('xdd:dateTimeInterval');
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01/2025-04-01');
  });

  test('build calendar year 2024 (leap year)', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval(dat('2024-01-01'), dat('2025-01-01'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2024-01-01/2025-01-01');
  });

  test('build single-day interval Feb 29 to Mar 1 on a leap year', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval(dat('2024-02-29'), dat('2024-03-01'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2024-02-29/2024-03-01');
  });
});

describe('Interval predicate — deconstructing intervals into dates', () => {
  test('extract start and end from a Q1 interval', async () => {
    let v = Vars("s", "e");
    const result = await client.query(
      WOQL.interval(v.s, v.e, dti('2025-01-01/2025-04-01')));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@type']).toBe('xsd:date');
    expect(result?.bindings[0].s['@value']).toBe('2025-01-01');
    expect(result?.bindings[0].e['@type']).toBe('xsd:date');
    expect(result?.bindings[0].e['@value']).toBe('2025-04-01');
  });

  test('extract start only (end already ground)', async () => {
    let v = Vars("s");
    const result = await client.query(
      WOQL.interval(v.s, dat('2025-04-01'), dti('2025-01-01/2025-04-01')));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2025-01-01');
  });
});

describe('Interval predicate — validation (all three args ground)', () => {
  test('succeeds when dates match the interval', async () => {
    const result = await client.query(
      WOQL.interval(
        dat('2025-01-01'), dat('2025-04-01'),
        dti('2025-01-01/2025-04-01')));
    expect(result?.bindings).toHaveLength(1);
  });

  test('fails when end date does not match interval', async () => {
    const result = await client.query(
      WOQL.interval(
        dat('2025-01-01'), dat('2025-06-01'),
        dti('2025-01-01/2025-04-01')));
    expect(result?.bindings).toHaveLength(0);
  });

  test('fails when start date does not match interval', async () => {
    const result = await client.query(
      WOQL.interval(
        dat('2025-02-01'), dat('2025-04-01'),
        dti('2025-01-01/2025-04-01')));
    expect(result?.bindings).toHaveLength(0);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  2. Typecast — converting between xsd:string and xdd:dateTimeInterval
// ═══════════════════════════════════════════════════════════════════════════

describe('Typecast — string to xdd:dateTimeInterval', () => {
  test('cast a half-open bracket string to dateTimeInterval', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.typecast(str('2025-01-01/2025-04-01'),
                    'xdd:dateTimeInterval', v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@type']).toBe('xdd:dateTimeInterval');
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01/2025-04-01');
  });

  test('cast a full-year interval string', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.typecast(str('2024-01-01/2025-01-01'),
                    'xdd:dateTimeInterval', v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2024-01-01/2025-01-01');
  });
});

describe('Typecast — xdd:dateTimeInterval to string', () => {
  test('cast an interval value back to string', async () => {
    let v = Vars("s");
    const result = await client.query(
      WOQL.typecast(dti('2025-01-01/2025-04-01'),
                    'xsd:string', v.s));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@type']).toBe('xsd:string');
    expect(result?.bindings[0].s['@value']).toBe('2025-01-01/2025-04-01');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  3. Roundtrip: string → dateTimeInterval → Interval → dates → Interval → string
// ═══════════════════════════════════════════════════════════════════════════

describe('Roundtrip — string through interval type and back', () => {
  test('string → typecast → deconstruct → reconstruct → typecast → string', async () => {
    let v = Vars("iv", "s", "e", "iv2", "out");
    const query = WOQL.and(
      // Step 1: cast string to dateTimeInterval
      WOQL.typecast(str('2025-07-01/2025-10-01'),
                    'xdd:dateTimeInterval', v.iv),
      // Step 2: deconstruct interval into start+end dates
      WOQL.interval(v.s, v.e, v.iv),
      // Step 3: reconstruct a new interval from those dates
      WOQL.interval(v.s, v.e, v.iv2),
      // Step 4: cast back to string
      WOQL.typecast(v.iv2, 'xsd:string', v.out),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    const b = result?.bindings[0];
    // Start and end dates extracted correctly
    expect(b.s['@value']).toBe('2025-07-01');
    expect(b.e['@value']).toBe('2025-10-01');
    // Roundtrip produces identical string
    expect(b.out['@value']).toBe('2025-07-01/2025-10-01');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  4. Different ways to articulate the same interval
// ═══════════════════════════════════════════════════════════════════════════

describe('Articulating the same interval in different ways', () => {
  // All of these express FY2025-Q1: 2025-01-01/2025-04-01

  test('way 1: typed literal — pass xdd:dateTimeInterval directly', async () => {
    let v = Vars("s", "e");
    const result = await client.query(
      WOQL.interval(v.s, v.e, dti('2025-01-01/2025-04-01')));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2025-01-01');
    expect(result?.bindings[0].e['@value']).toBe('2025-04-01');
  });

  test('way 2: two dates — construct via Interval predicate', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval(dat('2025-01-01'), dat('2025-04-01'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01/2025-04-01');
  });

  test('way 3: string + typecast — parse from a string value', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.typecast(str('2025-01-01/2025-04-01'),
                    'xdd:dateTimeInterval', v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01/2025-04-01');
  });

  test('way 4: typecast + Interval combined — parse then decompose', async () => {
    let v = Vars("iv", "s", "e");
    const query = WOQL.and(
      WOQL.typecast(str('2025-01-01/2025-04-01'),
                    'xdd:dateTimeInterval', v.iv),
      WOQL.interval(v.s, v.e, v.iv),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2025-01-01');
    expect(result?.bindings[0].e['@value']).toBe('2025-04-01');
  });

  test('all three ways produce equivalent results', async () => {
    let v = Vars("iv1", "iv2", "iv3");
    const query = WOQL.and(
      // Way 1: from dates
      WOQL.interval(dat('2025-01-01'), dat('2025-04-01'), v.iv1),
      // Way 2: from typecast
      WOQL.typecast(str('2025-01-01/2025-04-01'),
                    'xdd:dateTimeInterval', v.iv2),
      // Way 3: typed literal directly
      WOQL.eq(v.iv3, dti('2025-01-01/2025-04-01')),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    const b = result?.bindings[0];
    // All three produce the same value
    expect(b.iv1['@value']).toBe('2025-01-01/2025-04-01');
    expect(b.iv2['@value']).toBe('2025-01-01/2025-04-01');
    expect(b.iv3['@value']).toBe('2025-01-01/2025-04-01');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  5. Interval + IntervalRelation — combining the type with Allen's algebra
// ═══════════════════════════════════════════════════════════════════════════

describe('Interval type with IntervalRelation — real-world scheduling', () => {
  test('Q1 meets Q2: construct both intervals then check adjacency', async () => {
    let v = Vars("q1", "q2", "rel");
    const query = WOQL.and(
      WOQL.interval(dat('2025-01-01'), dat('2025-04-01'), v.q1),
      WOQL.interval(dat('2025-04-01'), dat('2025-07-01'), v.q2),
      WOQL.interval_relation("meets",
        dat('2025-01-01'), dat('2025-04-01'),
        dat('2025-04-01'), dat('2025-07-01')),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    // Both intervals were constructed
    expect(result?.bindings[0].q1['@value']).toBe('2025-01-01/2025-04-01');
    expect(result?.bindings[0].q2['@value']).toBe('2025-04-01/2025-07-01');
  });

  test('classify relation between two date-constructed intervals', async () => {
    let v = Vars("rel");
    const query = WOQL.and(
      // Sprint inside a quarter = "during"
      WOQL.interval_relation(v.rel,
        dat('2025-02-01'), dat('2025-02-15'),
        dat('2025-01-01'), dat('2025-04-01')),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].rel['@value']).toBe('during');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  6. Interval + DayAfter/DayBefore — adjacent-day intervals
// ═══════════════════════════════════════════════════════════════════════════

describe('Interval with DayAfter/DayBefore — building intervals from day arithmetic', () => {
  test('build a 7-day interval starting from a computed next-day', async () => {
    let v = Vars("next", "end", "iv");
    const query = WOQL.and(
      // Start after Jan 15
      WOQL.day_after(dat('2025-01-15'), v.next),
      // End is Jan 23 (7 days later)
      WOQL.day_after(dat('2025-01-22'), v.end),
      // Build the interval Jan 16 to Jan 23
      WOQL.interval(v.next, v.end, v.iv),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-16/2025-01-23');
  });

  test('find the day before an interval starts', async () => {
    let v = Vars("s", "e", "before_start");
    const query = WOQL.and(
      WOQL.interval(v.s, v.e, dti('2025-03-01/2025-04-01')),
      WOQL.day_before(v.s, v.before_start),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].before_start['@value']).toBe('2025-02-28');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  7. DateTime endpoints — intervals with sub-day precision
// ═══════════════════════════════════════════════════════════════════════════

function dtm(v: string) {
  return { '@type': 'xsd:dateTime', '@value': v } as any;
}

describe('Interval with dateTime endpoints', () => {
  test('construct from two dateTime values', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval(dtm('2025-01-01T09:00:00Z'), dtm('2025-01-01T17:30:00Z'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01T09:00:00Z/2025-01-01T17:30:00Z');
  });

  test('construct mixed date start + dateTime end', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval(dat('2025-01-01'), dtm('2025-04-01T12:00:00Z'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01/2025-04-01T12:00:00Z');
  });

  test('deconstruct dateTime interval preserves types', async () => {
    let v = Vars("s", "e");
    const result = await client.query(
      WOQL.interval(v.s, v.e, dti('2025-01-01T09:00:00Z/2025-04-01T17:30:00Z')));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@type']).toBe('xsd:dateTime');
    expect(result?.bindings[0].e['@type']).toBe('xsd:dateTime');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  8. IntervalStartDuration — start + precise duration decomposition
// ═══════════════════════════════════════════════════════════════════════════

function dur(v: string) {
  return { '@type': 'xsd:duration', '@value': v } as any;
}

describe('IntervalStartDuration — extract start and duration from interval', () => {
  test('90-day interval yields P90D', async () => {
    let v = Vars("s", "d");
    const result = await client.query(
      WOQL.interval_start_duration(v.s, v.d, dti('2025-01-01/2025-04-01')));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@value']).toBe('2025-01-01');
    expect(result?.bindings[0].d['@value']).toBe('P90D');
  });

  test('sub-day dateTime interval yields PT8H30M', async () => {
    let v = Vars("s", "d");
    const result = await client.query(
      WOQL.interval_start_duration(v.s, v.d, dti('2025-01-01T09:00:00Z/2025-01-01T17:30:00Z')));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].s['@type']).toBe('xsd:dateTime');
    expect(result?.bindings[0].d['@value']).toBe('PT8H30M');
  });
});

describe('IntervalStartDuration — construct interval from start + duration', () => {
  test('start Jan 1 + P90D yields Jan 1 to Apr 1', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval_start_duration(dat('2025-01-01'), dur('P90D'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01/2025-04-01');
  });

  test('start + P365D builds a full-year interval', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval_start_duration(dat('2025-01-01'), dur('P365D'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01/2026-01-01');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  9. IntervalDurationEnd — duration + end decomposition
// ═══════════════════════════════════════════════════════════════════════════

describe('IntervalDurationEnd — extract duration and end from interval', () => {
  test('90-day interval yields P90D and end date', async () => {
    let v = Vars("d", "e");
    const result = await client.query(
      WOQL.interval_duration_end(v.d, v.e, dti('2025-01-01/2025-04-01')));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].e['@value']).toBe('2025-04-01');
    expect(result?.bindings[0].d['@value']).toBe('P90D');
  });
});

describe('IntervalDurationEnd — construct interval from duration + end', () => {
  test('P90D before Apr 1 yields Jan 1 to Apr 1', async () => {
    let v = Vars("iv");
    const result = await client.query(
      WOQL.interval_duration_end(dur('P90D'), dat('2025-04-01'), v.iv));
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].iv['@value']).toBe('2025-01-01/2025-04-01');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
//  10. Roundtrip: all three decomposition views of the same interval
// ═══════════════════════════════════════════════════════════════════════════

describe('Three views of the same interval', () => {
  test('start/end, start/duration, and duration/end all agree', async () => {
    let v = Vars("s1", "e1", "s2", "d2", "d3", "e3");
    const iv = dti('2025-01-01/2025-04-01');
    const query = WOQL.and(
      WOQL.interval(v.s1, v.e1, iv),
      WOQL.interval_start_duration(v.s2, v.d2, iv),
      WOQL.interval_duration_end(v.d3, v.e3, iv),
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    const b = result?.bindings[0];
    // All views agree on start and end
    expect(b.s1['@value']).toBe(b.s2['@value']);
    expect(b.e1['@value']).toBe(b.e3['@value']);
    // Both duration views agree
    expect(b.d2['@value']).toBe(b.d3['@value']);
    expect(b.d2['@value']).toBe('P90D');
  });
});
