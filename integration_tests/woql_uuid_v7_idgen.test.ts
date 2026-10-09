//@ts-check
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { WOQL } from "../index.js";
import { createTestClient, setupTestDatabase } from "./test_utils";

const testDb = "db__test_woql_uuid_v7_idgen";
let client = createTestClient();

const UUID_V7_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

beforeAll(async () => {
  client.db(testDb);
  await setupTestDatabase(client, testDb, { comment: "Test database for UUID v7 ID generation" });

  const schema = [
    {
      "@type": "Class",
      "@id": "Artwork",
      "@key": { "@type": "UuidV7" },
      title: "xsd:string"
    }
  ];

  await client.addDocument(schema, { graph_type: "schema" });
}, 30000);

describe("WOQL UUID v7 ID Generation", () => {
  test("Generate UUID v7 ID using WOQL", async () => {
    const query = WOQL.idgen_uuid_v7("Artwork/", "v:artwork_id");

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();
    expect(result?.bindings?.length).toBeGreaterThan(0);

    const binding = result?.bindings?.[0];
    const artworkId = binding["artwork_id"] || binding["v:artwork_id"];
    expect(artworkId).toBeDefined();
    expect(artworkId).toContain("Artwork/");

    const suffix = artworkId.split("Artwork/")[1];
    expect(suffix).toMatch(UUID_V7_RE);
  });

  test("Generate multiple unique IDs", async () => {
    const query = WOQL.and(
      WOQL.idgen_uuid_v7("Artwork/", "v:id1"),
      WOQL.idgen_uuid_v7("Artwork/", "v:id2"),
      WOQL.idgen_uuid_v7("Artwork/", "v:id3")
    );

    const result = await client.query(query);
    expect(result?.bindings?.length).toBe(1);

    const binding = result?.bindings?.[0];
    const id1 = binding["id1"] || binding["v:id1"];
    const id2 = binding["id2"] || binding["v:id2"];
    const id3 = binding["id3"] || binding["v:id3"];

    expect(id1).not.toEqual(id2);
    expect(id1).not.toEqual(id3);
    expect(id2).not.toEqual(id3);

    expect(id1).toContain("Artwork/");
    expect(id2).toContain("Artwork/");
    expect(id3).toContain("Artwork/");
  });

  test("Generated IDs are time-ordered", async () => {
    const query = WOQL.idgen_uuid_v7("Artwork/", "v:id");

    const result1 = await client.query(query);
    const result2 = await client.query(query);

    const id1 = result1?.bindings?.[0]?.["id"] || result1?.bindings?.[0]?.["v:id"];
    const id2 = result2?.bindings?.[0]?.["id"] || result2?.bindings?.[0]?.["v:id"];

    // UUID v7 is lexicographically sortable by creation time
    expect(id2 > id1).toBe(true);
  });

  test("Document without @id gets UUID v7 suffix under class base", async () => {
    const doc = {
      "@type": "Artwork",
      title: "Impression, soleil levant"
    };

    const result: any = await client.addDocument(doc);
    const id = result[0];
    expect(id).toBeDefined();
    expect(id).toContain("Artwork/");
    const suffix = id.split("Artwork/")[1];
    expect(suffix).toMatch(UUID_V7_RE);
  });

  test("Document with arbitrary IRI @id is accepted", async () => {
    const doc = {
      "@type": "Artwork",
      "@id": "https://linked.art/example/object/47",
      title: "External reference"
    };

    await client.addDocument(doc);

    const retrieved: any = await client.getDocument({ id: "https://linked.art/example/object/47" });
    expect(retrieved["@id"]).toEqual("https://linked.art/example/object/47");
    expect(retrieved.title).toEqual("External reference");
  });

  afterAll(async () => {
    try {
      await client.deleteDatabase(testDb);
    } catch (e) {
      // Ignore errors
    }
  });
});
