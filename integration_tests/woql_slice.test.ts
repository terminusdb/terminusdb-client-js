//@ts-check
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { WOQLClient, WOQL } from "../index.js";
import { DbDetails } from "../dist/typescript/lib/typedef.js";
import { Vars } from "../lib/woql.js";

let client: WOQLClient;
const db01 = "db__test_woql_slice";

beforeAll(() => {
  client = new WOQLClient("http://127.0.0.1:6363", {
    user: "admin",
    organization: "admin",
    key: process.env.TDB_ADMIN_PASS ?? "root"
  });
  client.db(db01);
});

describe("Integration tests for WOQL slice operator", () => {
  test("Create a database", async () => {
    const dbObj: DbDetails = {
      label: db01,
      comment: "test slice operator",
      schema: true
    };
    const result = await client.createDatabase(db01, dbObj);
    expect(result["@type"]).toEqual("api:DbCreateResponse");
    expect(result["api:status"]).toEqual("api:success");
  });

  test("Basic slice: slice([A, B, C, D], 0, 2) returns [A, B]", async () => {
    let v = Vars("Result");
    const query = WOQL.slice(["A", "B", "C", "D"], v.Result, 0, 2);

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].Result).toEqual([
      { "@type": "xsd:string", "@value": "A" },
      { "@type": "xsd:string", "@value": "B" }
    ]);
  });

  test("Negative indices: slice([A, B, C, D], -2) returns [C, D]", async () => {
    let v = Vars("Result");
    // Without end parameter - slice from -2 to end
    const query = WOQL.slice(["A", "B", "C", "D"], v.Result, -2);

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].Result).toEqual([
      { "@type": "xsd:string", "@value": "C" },
      { "@type": "xsd:string", "@value": "D" }
    ]);
  });

  test("Out-of-bounds clamped: slice([A, B, C], 1, 100) returns [B, C]", async () => {
    let v = Vars("Result");
    const query = WOQL.slice(["A", "B", "C"], v.Result, 1, 100);

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].Result).toEqual([
      { "@type": "xsd:string", "@value": "B" },
      { "@type": "xsd:string", "@value": "C" }
    ]);
  });

  test("Empty slice: slice([A, B, C], 2, 2) returns []", async () => {
    let v = Vars("Result");
    const query = WOQL.slice(["A", "B", "C"], v.Result, 2, 2);

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].Result).toEqual([]);
  });

  test("Slice with numeric list: slice([10, 20, 30, 40], 1, 3) returns [20, 30]", async () => {
    let v = Vars("Result");
    const query = WOQL.slice([10, 20, 30, 40], v.Result, 1, 3);

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].Result).toEqual([
      { "@type": "xsd:decimal", "@value": 20 },
      { "@type": "xsd:decimal", "@value": 30 }
    ]);
  });

  test("Full range: slice([A, B, C, D], 0, 4) returns all elements", async () => {
    let v = Vars("Result");
    const query = WOQL.slice(["A", "B", "C", "D"], v.Result, 0, 4);

    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].Result).toEqual([
      { "@type": "xsd:string", "@value": "A" },
      { "@type": "xsd:string", "@value": "B" },
      { "@type": "xsd:string", "@value": "C" },
      { "@type": "xsd:string", "@value": "D" }
    ]);
  });

  test("Delete a database", async () => {
    const result = await client.deleteDatabase(db01);
    expect(result).toStrictEqual({
      "@type": "api:DbDeleteResponse",
      "api:status": "api:success"
    });
  });
});
