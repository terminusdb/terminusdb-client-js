//@ts-check
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { WOQL } from "../index.js";
import { createTestClient, cleanupDatabase, setupTestDatabase } from "./test_utils";

const testDb = "db__test_woql_random_idgen";
let client = createTestClient();

beforeAll(async () => {
  client.db(testDb);
  await setupTestDatabase(client, testDb, { comment: "Test database for random ID generation" });

  const schema = [
    {
      "@type": "Class",
      "@id": "Person",
      "@key": { "@type": "Random" },
      name: "xsd:string"
    }
  ];

  await client.addDocument(schema, { graph_type: "schema" });
}, 30000);

describe("WOQL Random ID Generation", () => {
  test("Generate random ID using WOQL", async () => {
    const query = WOQL.random_idgen("Person/", "v:person_id");

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();
    expect(result?.bindings?.length).toBeGreaterThan(0);

    // Server returns bindings without the 'v:' prefix
    const binding = result?.bindings?.[0];
    const personId = binding["person_id"] || binding["v:person_id"];
    expect(personId).toBeDefined();
    expect(personId).toContain("Person/");

    // Should have a 16-character random suffix
    const suffix = personId.split("Person/")[1];
    expect(suffix.length).toBe(16);
  });

  test("Generate multiple unique IDs", async () => {
    const query = WOQL.and(
      WOQL.random_idgen("Person/", "v:id1"),
      WOQL.random_idgen("Person/", "v:id2"),
      WOQL.random_idgen("Person/", "v:id3")
    );

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();
    expect(result?.bindings?.length).toBe(1);

    const binding = result?.bindings?.[0];
    const id1 = binding["id1"] || binding["v:id1"];
    const id2 = binding["id2"] || binding["v:id2"];
    const id3 = binding["id3"] || binding["v:id3"];

    // All IDs should be different
    expect(id1).not.toEqual(id2);
    expect(id1).not.toEqual(id3);
    expect(id2).not.toEqual(id3);

    // All should start with prefix
    expect(id1).toContain("Person/");
    expect(id2).toContain("Person/");
    expect(id3).toContain("Person/");
  });

  test("Use random ID to create document", async () => {
    //Generate random ID
    const query = WOQL.random_idgen("Person/", "v:new_person");

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();

    const binding = result?.bindings?.[0];
    const personId = binding["new_person"] || binding["v:new_person"];
    expect(personId).toBeDefined();
    expect(personId).toContain("Person/");

    // Create the document using the generated ID
    const doc = {
      "@type": "Person",
      "@id": personId,
      name: "Alice"
    };

    await client.addDocument(doc);

    // Verify the document was created
    const retrieved: any = await client.getDocument({ id: personId });
    expect(retrieved["@id"]).toEqual(personId);
    expect(retrieved.name).toEqual("Alice");
  });

  test("Generate different IDs on repeated query execution", async () => {
    const query = WOQL.random_idgen("Data/", "v:id");
    const ids = new Set<string>();

    for (let i = 0; i < 10; i++) {
      const result = await client.query(query);
      const binding = result?.bindings?.[0];
      const id = binding["id"] || binding["v:id"];
      ids.add(id);
    }

    // All 10 executions should produce unique IDs
    expect(ids.size).toBe(10);
  });

  test("Mix WOQL builder with raw JSON-LD", async () => {
    // Test mixing WOQL builder syntax with raw JSON-LD
    // This verifies the pattern documented in woql-json-ld-queries guide
    const query1 = WOQL.and(
      WOQL.random_idgen("Test/", "v:test_id"),
      {
        "@type": "LexicalKey",
        base: {
          "@type": "DataValue",
          data: {
            "@type": "xsd:string",
            "@value": "Display/"
          }
        },
        key_list: [],
        uri: {
          "@type": "NodeValue",
          variable: "out"
        }
      } as any
    );

    const result1 = await client.query(query1);
    const binding1 = result1?.bindings?.[0];
    
    // Verify random_idgen result
    const id1 = binding1["test_id"] || binding1["v:test_id"];
    expect(id1).toBeDefined();
    expect(id1).toContain("Test/");
    
    // Verify the ID has correct 16-character suffix
    const suffix = id1.split("Test/")[1];
    expect(suffix.length).toBe(16);
    
    // Verify LexicalKey result (empty key_list generates just the base)
    const out = binding1["out"] || binding1["v:out"];
    expect(out).toBeDefined();
    expect(out).toContain("Display/");
  });

  test("Both random_idgen and idgen_random aliases work", async () => {
    // Test random_idgen alias
    const query1 = WOQL.random_idgen("Test/", "v:test_id");
    const result1 = await client.query(query1);
    const binding1 = result1?.bindings?.[0];
    const id1 = binding1["test_id"] || binding1["v:test_id"];
    expect(id1).toBeDefined();
    expect(id1).toContain("Test/");

    // Test idgen_random alias (should produce same structure)
    const query2 = WOQL.idgen_random("Test/", "v:test_id");
    const result2 = await client.query(query2);
    const binding2 = result2?.bindings?.[0];
    const id2 = binding2["test_id"] || binding2["v:test_id"];
    expect(id2).toBeDefined();
    expect(id2).toContain("Test/");

    // Both queries should produce the same JSON structure (same variable name)
    expect(query1.json()).toEqual(query2.json());
  });

  afterAll(async () => {
    try {
      await client.deleteDatabase(testDb);
    } catch (e) {
      // Ignore errors
    }
  });
});
