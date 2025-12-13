//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQLClient, WOQL } from '../index.js';
import { DbDetails } from '../dist/typescript/lib/typedef.js';

let client: WOQLClient;
const db01 = 'db__test_woql_set_operations';

beforeAll(() => {
  client = new WOQLClient("http://127.0.0.1:6363", { user: 'admin', organization: 'admin', key: process.env.TDB_ADMIN_PASS ?? 'root' });
  client.db(db01);
});

describe('Tests for WOQL set operations', () => {
  test('Create a database', async () => {
    const dbObj: DbDetails = { label: db01, comment: 'test woql set operations', schema: true };
    const result = await client.createDatabase(db01, dbObj);
    expect(result["@type"]).toEqual("api:DbCreateResponse");
    expect(result["api:status"]).toEqual("api:success");
  });

  describe('set_difference', () => {
    test('computes difference between two lists', async () => {
      const query = WOQL.and(
        WOQL.eq("v:ListA", [1, 2, 3, 4]),
        WOQL.eq("v:ListB", [2, 4]),
        WOQL.set_difference("v:ListA", "v:ListB", "v:Diff")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].Diff).toEqual([1, 3]);
    });

    test('returns empty list when first list is subset of second', async () => {
      const query = WOQL.and(
        WOQL.eq("v:ListA", [1, 2]),
        WOQL.eq("v:ListB", [1, 2, 3]),
        WOQL.set_difference("v:ListA", "v:ListB", "v:Diff")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].Diff).toEqual([]);
    });

    test('handles empty lists', async () => {
      const query = WOQL.and(
        WOQL.eq("v:ListA", []),
        WOQL.eq("v:ListB", [1]),
        WOQL.set_difference("v:ListA", "v:ListB", "v:Diff")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].Diff).toEqual([]);
    });
  });

  describe('set_intersection', () => {
    test('computes intersection of two lists', async () => {
      const query = WOQL.and(
        WOQL.eq("v:ListA", [1, 2, 3]),
        WOQL.eq("v:ListB", [2, 3, 4]),
        WOQL.set_intersection("v:ListA", "v:ListB", "v:Common")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].Common).toEqual([2, 3]);
    });

    test('returns empty list when no common elements', async () => {
      const query = WOQL.and(
        WOQL.eq("v:ListA", [1, 2]),
        WOQL.eq("v:ListB", [3, 4]),
        WOQL.set_intersection("v:ListA", "v:ListB", "v:Common")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].Common).toEqual([]);
    });
  });

  describe('set_union', () => {
    test('computes union of two lists', async () => {
      const query = WOQL.and(
        WOQL.eq("v:ListA", [1, 2]),
        WOQL.eq("v:ListB", [2, 3]),
        WOQL.set_union("v:ListA", "v:ListB", "v:All")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].All).toEqual([1, 2, 3]);
    });

    test('removes duplicates', async () => {
      const query = WOQL.and(
        WOQL.eq("v:ListA", [1, 1, 2]),
        WOQL.eq("v:ListB", [2, 2]),
        WOQL.set_union("v:ListA", "v:ListB", "v:All")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].All).toEqual([1, 2]);
    });
  });

  describe('set_member', () => {
    test('checks membership in a set', async () => {
      const query = WOQL.and(
        WOQL.eq("v:MySet", [1, 2, 3]),
        WOQL.set_member(2, "v:MySet")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
    });

    test('fails for non-member', async () => {
      const query = WOQL.and(
        WOQL.eq("v:MySet", [1, 2, 3]),
        WOQL.set_member(5, "v:MySet")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(0);
    });
  });

  describe('list_to_set', () => {
    test('converts list to set removing duplicates and sorting', async () => {
      const query = WOQL.and(
        WOQL.eq("v:MyList", [3, 1, 2, 1]),
        WOQL.list_to_set("v:MyList", "v:MySet")
      );

      const result = await client.query(query);
      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].MySet).toEqual([1, 2, 3]);
    });
  });

  describe('performance test', () => {
    test('handles large set operations efficiently', async () => {
      // Create two large arrays with some overlap
      const listA = Array.from({ length: 1000 }, (_, i) => i);
      const listB = Array.from({ length: 1000 }, (_, i) => i + 500);

      const query = WOQL.and(
        WOQL.eq("v:ListA", listA),
        WOQL.eq("v:ListB", listB),
        WOQL.set_difference("v:ListA", "v:ListB", "v:Diff")
      );

      const startTime = Date.now();
      const result = await client.query(query);
      const elapsed = Date.now() - startTime;

      expect(result?.bindings).toHaveLength(1);
      expect(result?.bindings[0].Diff.length).toEqual(500);

      // Should complete in under 1 second with O(n log n) algorithm
      expect(elapsed).toBeLessThan(1000);
    });
  });

  test('Delete a database', async () => {
    const result = await client.deleteDatabase(db01);
    expect(result).toStrictEqual({ '@type': 'api:DbDeleteResponse', 'api:status': 'api:success' });
  });
});
