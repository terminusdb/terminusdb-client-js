//@ts-check
import { describe, expect, test, beforeAll } from "@jest/globals";
import { WOQLClient, WOQL } from "../index.js";
import { DbDetails } from "../dist/typescript/lib/typedef.js";
import { Vars } from "../lib/woql.js";

let client: WOQLClient;
const db01 = "db__test_woql_triple_relation";

beforeAll(async () => {
  client = new WOQLClient("http://127.0.0.1:6363", {
    user: "admin",
    organization: "admin",
    key: process.env.TDB_ADMIN_PASS ?? "root"
  });
  client.db(db01);
  await client.deleteDatabase(db01).catch(() => {});
});

describe("Integration tests for WOQL triple_relation (Allen intervals)", () => {
  test("Create a database", async () => {
    const dbObj: DbDetails = { label: db01, comment: "triple_relation", schema: true };
    const result = await client.createDatabase(db01, dbObj);
    expect(result["@type"]).toEqual("api:DbCreateResponse");
    expect(result["api:status"]).toEqual("api:success");
  });

  test("Create Event schema and interval documents", async () => {
    const schema = { "@type": "Class", "@id": "Event", interval: "xdd:dateTimeInterval" };
    const schemaResult = await client.addDocument(schema, { graph_type: "schema" });
    expect(schemaResult).toStrictEqual(["Event"]);

    const docs = [
      {
        "@type": "Event",
        "@id": "Event/ev-2025-Q1",
        interval: { "@type": "xdd:dateTimeInterval", "@value": "2025-01-01T00:00:00Z/2025-04-01T00:00:00Z" }
      },
      {
        "@type": "Event",
        "@id": "Event/ev-2025-Q2",
        interval: { "@type": "xdd:dateTimeInterval", "@value": "2025-04-01T00:00:00Z/2025-07-01T00:00:00Z" }
      }
    ];
    const result = await client.addDocument(docs);
    expect(result).toStrictEqual(["Event/ev-2025-Q1", "Event/ev-2025-Q2"]);
  });

  test("meets: interval ending exactly at the reference start", async () => {
    const v = Vars("doc", "iv");
    const query = WOQL.triple_relation(
      v.doc,
      "@schema:interval",
      v.iv,
      "meets",
      { "@type": "xdd:dateTimeInterval", "@value": "2025-04-01T00:00:00Z/2025-07-01T00:00:00Z" }
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].doc).toContain("Event/ev-2025-Q1");
  });

  test("contains at a seam instant: the point belongs to the interval it starts", async () => {
    const v = Vars("doc", "iv");
    const query = WOQL.triple_relation(
      v.doc,
      "@schema:interval",
      v.iv,
      "contains",
      { "@type": "xsd:dateTime", "@value": "2025-04-01T00:00:00Z" }
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
    expect(result?.bindings[0].doc).toContain("Event/ev-2025-Q2");
  });
});
