//@ts-check
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { WOQL } from "../index.js";
import { Vars } from "../lib/woql.js";
import { createTestClient, setupTestDatabase, cleanupDatabase } from "./test_utils";

const dbName = "db__test_woql_triple_slice";
let client = createTestClient();

// Schema: Sensor with integer readings and string tags
const sensorSchema = [
  {
    "@base": "terminusdb:///data/",
    "@schema": "terminusdb:///schema#",
    "@type": "@context"
  },
  {
    "@id": "Sensor",
    "@key": {
      "@fields": ["name"],
      "@type": "Lexical"
    },
    "@type": "Class",
    name: "xsd:string",
    reading: {
      "@class": "xsd:integer",
      "@type": "Set"
    },
    tag: {
      "@class": "xsd:string",
      "@type": "Set"
    }
  }
];

beforeAll(async () => {
  client.db(dbName);
  await setupTestDatabase(client, dbName, { comment: "Test triple_slice predicates" });

  // Add schema
  await client.addDocument(sensorSchema, {
    graph_type: "schema",
    full_replace: true
  });

  // Insert a sensor with several integer readings and string tags
  const sensor = {
    "@id": "Sensor/probe-1",
    "@type": "Sensor",
    name: "probe-1",
    reading: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    tag: ["alpha", "beta", "gamma", "delta", "epsilon"]
  };

  await client.addDocument(sensor, { graph_type: "instance" });
}, 60000);

afterAll(async () => {
  await cleanupDatabase(client, dbName);
});

describe("triple_slice: forward range queries on integers", () => {

  test("returns readings within a numeric range", async () => {
    let v = Vars("s", "o");
    const query = WOQL.triple_slice(
      v.s, "reading", v.o,
      WOQL.literal(25, "integer"),
      WOQL.literal(75, "integer")
    );

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();

    const values = result.bindings.map(
      (b: any) => b.o?.["@value"]
    );
    // Range [25, 75) should include 30, 40, 50, 60, 70
    expect(values).toEqual(expect.arrayContaining([30, 40, 50, 60, 70]));
    expect(values).toHaveLength(5);
  });

  test("returns readings in ascending order", async () => {
    let v = Vars("s", "o");
    const query = WOQL.triple_slice(
      v.s, "reading", v.o,
      WOQL.literal(1, "integer"),
      WOQL.literal(101, "integer")
    );

    const result = await client.query(query);
    const values = result.bindings.map((b: any) => b.o?.["@value"]);

    // Forward iteration should yield ascending order
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeGreaterThan(values[i - 1]);
    }
  });

  test("half-open range excludes the upper bound", async () => {
    let v = Vars("s", "o");
    // [50, 60) should include only 50
    const query = WOQL.triple_slice(
      v.s, "reading", v.o,
      WOQL.literal(50, "integer"),
      WOQL.literal(60, "integer")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result.bindings[0].o?.["@value"]).toBe(50);
  });

  test("limit(1) retrieves the first (lowest) value in the range", async () => {
    let v = Vars("s", "o");
    const query = WOQL.limit(1).triple_slice(
      v.s, "reading", v.o,
      WOQL.literal(1, "integer"),
      WOQL.literal(101, "integer")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result.bindings[0].o?.["@value"]).toBe(10);
  });

});

describe("triple_slice_rev: reverse range queries on integers", () => {

  test("returns readings within a numeric range in reverse", async () => {
    let v = Vars("s", "o");
    const query = WOQL.triple_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(25, "integer"),
      WOQL.literal(75, "integer")
    );

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();

    const values = result.bindings.map(
      (b: any) => b.o?.["@value"]
    );
    // Same set as forward, but returned in descending order
    expect(values).toEqual(expect.arrayContaining([30, 40, 50, 60, 70]));
    expect(values).toHaveLength(5);
  });

  test("returns readings in descending order", async () => {
    let v = Vars("s", "o");
    const query = WOQL.triple_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(1, "integer"),
      WOQL.literal(101, "integer")
    );

    const result = await client.query(query);
    const values = result.bindings.map((b: any) => b.o?.["@value"]);

    // Reverse iteration should yield descending order
    for (let i = 1; i < values.length; i++) {
      expect(values[i]).toBeLessThan(values[i - 1]);
    }
  });

  test("limit(1) retrieves the last (highest) value in the range", async () => {
    let v = Vars("s", "o");
    const query = WOQL.limit(1).triple_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(1, "integer"),
      WOQL.literal(101, "integer")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result.bindings[0].o?.["@value"]).toBe(100);
  });

  test("half-open range excludes the upper bound in reverse too", async () => {
    let v = Vars("s", "o");
    // [50, 60) should include only 50, even in reverse
    const query = WOQL.triple_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(50, "integer"),
      WOQL.literal(60, "integer")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result.bindings[0].o?.["@value"]).toBe(50);
  });

});

describe("triple_slice vs triple_slice_rev: comparative tests", () => {

  test("forward and reverse return the same count", async () => {
    let v = Vars("s", "o");
    const fwdQuery = WOQL.triple_slice(
      v.s, "reading", v.o,
      WOQL.literal(20, "integer"),
      WOQL.literal(80, "integer")
    );
    const revQuery = WOQL.triple_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(20, "integer"),
      WOQL.literal(80, "integer")
    );

    const fwdResult = await client.query(fwdQuery);
    const revResult = await client.query(revQuery);
    expect(fwdResult.bindings.length).toBe(revResult.bindings.length);
  });

  test("forward first equals reverse last", async () => {
    let v = Vars("s", "o");
    const firstQuery = WOQL.limit(1).triple_slice(
      v.s, "reading", v.o,
      WOQL.literal(1, "integer"),
      WOQL.literal(101, "integer")
    );
    const lastQuery = WOQL.limit(1).triple_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(1, "integer"),
      WOQL.literal(101, "integer")
    );

    const first = await client.query(firstQuery);
    const last = await client.query(lastQuery);

    expect(first.bindings[0].o?.["@value"]).toBe(10);
    expect(last.bindings[0].o?.["@value"]).toBe(100);
  });

  test("forward and reverse are mirror images of each other", async () => {
    let v = Vars("s", "o");
    const fwdQuery = WOQL.triple_slice(
      v.s, "reading", v.o,
      WOQL.literal(1, "integer"),
      WOQL.literal(101, "integer")
    );
    const revQuery = WOQL.triple_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(1, "integer"),
      WOQL.literal(101, "integer")
    );

    const fwd = await client.query(fwdQuery);
    const rev = await client.query(revQuery);

    const fwdValues = fwd.bindings.map((b: any) => b.o?.["@value"]);
    const revValues = rev.bindings.map((b: any) => b.o?.["@value"]);

    expect(fwdValues).toEqual(revValues.reverse());
  });

});

describe("triple_slice on string values", () => {

  test("forward range on strings returns alphabetical order", async () => {
    let v = Vars("s", "o");
    const query = WOQL.triple_slice(
      v.s, "tag", v.o,
      WOQL.literal("a", "string"),
      WOQL.literal("z", "string")
    );

    const result = await client.query(query);
    const values = result.bindings.map((b: any) => b.o?.["@value"]);

    // 5 tags + 1 name property ("probe-1") all fall within [a, z)
    expect(values.length).toBe(6);
    for (let i = 1; i < values.length; i++) {
      expect(values[i] > values[i - 1]).toBe(true);
    }
  });

  test("reverse range on strings returns reverse alphabetical order", async () => {
    let v = Vars("s", "o");
    const query = WOQL.triple_slice_rev(
      v.s, "tag", v.o,
      WOQL.literal("a", "string"),
      WOQL.literal("z", "string")
    );

    const result = await client.query(query);
    const values = result.bindings.map((b: any) => b.o?.["@value"]);

    // 5 tags + 1 name property ("probe-1") all fall within [a, z)
    expect(values.length).toBe(6);
    for (let i = 1; i < values.length; i++) {
      expect(values[i] < values[i - 1]).toBe(true);
    }
  });

  test("limit(1) on reverse strings gives the last alphabetically", async () => {
    let v = Vars("s", "o");
    const query = WOQL.limit(1).triple_slice_rev(
      v.s, "tag", v.o,
      WOQL.literal("a", "string"),
      WOQL.literal("z", "string")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    // "probe-1" (from name property) sorts after "gamma", so it comes first in reverse
    expect(result.bindings[0].o?.["@value"]).toBe("probe-1");
  });

  test("string sub-range returns only matching values", async () => {
    let v = Vars("s", "o");
    // [b, e) should include "beta" and "delta" but not "epsilon" (starts with e)
    const query = WOQL.triple_slice(
      v.s, "tag", v.o,
      WOQL.literal("b", "string"),
      WOQL.literal("e", "string")
    );

    const result = await client.query(query);
    const values = result.bindings.map((b: any) => b.o?.["@value"]);
    expect(values).toEqual(expect.arrayContaining(["beta", "delta"]));
    expect(values).not.toContain("epsilon");
    expect(values).not.toContain("alpha");
  });

});

describe("quad_slice and quad_slice_rev with explicit graph", () => {

  test("quad_slice queries instance graph explicitly", async () => {
    let v = Vars("s", "o");
    const query = WOQL.quad_slice(
      v.s, "reading", v.o,
      WOQL.literal(45, "integer"),
      WOQL.literal(65, "integer"),
      "instance"
    );

    const result = await client.query(query);
    // [45, 65) includes both 50 and 60
    expect(result?.bindings).toHaveLength(2);
    expect(result.bindings[0].o?.["@value"]).toBe(50);
    expect(result.bindings[1].o?.["@value"]).toBe(60);
  });

  test("quad_slice_rev queries instance graph explicitly in reverse", async () => {
    let v = Vars("s", "o");
    const query = WOQL.quad_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(15, "integer"),
      WOQL.literal(55, "integer"),
      "instance"
    );

    const result = await client.query(query);
    const values = result.bindings.map((b: any) => b.o?.["@value"]);

    // [15, 55) in reverse: 50, 40, 30, 20
    expect(values).toEqual([50, 40, 30, 20]);
  });

});

describe("edge cases", () => {

  test("empty range returns no results for forward", async () => {
    let v = Vars("s", "o");
    const query = WOQL.triple_slice(
      v.s, "reading", v.o,
      WOQL.literal(999, "integer"),
      WOQL.literal(1000, "integer")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test("empty range returns no results for reverse", async () => {
    let v = Vars("s", "o");
    const query = WOQL.triple_slice_rev(
      v.s, "reading", v.o,
      WOQL.literal(999, "integer"),
      WOQL.literal(1000, "integer")
    );

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(0);
  });

  test("single-element range works in both directions", async () => {
    let v = Vars("s", "o");
    // [50, 51) should include only 50
    const fwd = await client.query(
      WOQL.triple_slice(v.s, "reading", v.o,
        WOQL.literal(50, "integer"), WOQL.literal(51, "integer"))
    );
    const rev = await client.query(
      WOQL.triple_slice_rev(v.s, "reading", v.o,
        WOQL.literal(50, "integer"), WOQL.literal(51, "integer"))
    );

    expect(fwd?.bindings).toHaveLength(1);
    expect(rev?.bindings).toHaveLength(1);
    expect(fwd.bindings[0].o?.["@value"]).toBe(50);
    expect(rev.bindings[0].o?.["@value"]).toBe(50);
  });

});
