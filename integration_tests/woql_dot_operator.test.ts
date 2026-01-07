//@ts-check
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { WOQL } from "../index.js";
import { createTestClient, setupTestDatabase, cleanupDatabase } from "./test_utils";

const db01 = "db__test_woql_dot_operator";
let client = createTestClient();

// Reusable WOQL query that uses dot operator with path results
let pathQueryWithDot: any;

// Schema for Person with knows relationship
const personSchema = [
  {
    "@base": "terminusdb:///data/",
    "@schema": "terminusdb:///schema#",
    "@type": "@context"
  },
  {
    "@id": "Person",
    "@key": {
      "@fields": ["name"],
      "@type": "Lexical"
    },
    "@type": "Class",
    name: {
      "@class": "xsd:string",
      "@type": "Optional"
    },
    knows: {
      "@class": "Person",
      "@type": "Set"
    }
  }
];

beforeAll(async () => {
  client.db(db01);

  // Create database with schema
  await setupTestDatabase(client, db01, { comment: "Test Dot operator" });

  // Add schema
  await client.addDocument(personSchema, {
    graph_type: "schema",
    full_replace: true
  });

  // Insert test data: Alice -> Bob -> Charlie
  // Note: IDs match the name field due to lexical key
  const people = [
    {
      "@id": "Person/Alice",
      "@type": "Person",
      name: "Alice",
      knows: ["Person/Bob", "Person/Ada"] // Forward reference - will be resolved
    },
    {
      "@id": "Person/Bob",
      "@type": "Person",
      name: "Bob",
      knows: ["Person/Charlie", "Person/Ada"]
    },
    {
      "@id": "Person/Ada",
      "@type": "Person",
      name: "Ada",
      knows: ["Person/Charlie"]
    },
    {
      "@id": "Person/Charlie",
      "@type": "Person",
      name: "Charlie",
      knows: []
    }
  ];

  await client.addDocument(people, { graph_type: "instance" });

  pathQueryWithDot = WOQL.and(
    WOQL.path("Person/Alice", "knows+", "v:destination", "v:path_edges"),
    WOQL.member("v:edge", "v:path_edges"),
    WOQL.dot("v:edge", "subject", "v:from"),
    WOQL.dot("v:edge", "predicate", "v:via"),
    WOQL.dot("v:edge", "object", "v:to")
  );
}, 30000);

afterAll(async () => {
  await client.deleteDatabase(db01);
});

describe("Tests for WOQL Dot operator", () => {
  test("Dot operator field should be DataValue with xsd:string", () => {
    // This test verifies the CORRECT client behavior: field wrapped as xsd:string
    // Both JS and Python clients implement it this way

    const query = WOQL.dot("v:dict", "field_name", "v:output");

    // @ts-ignore - Testing internal JSON structure
    const json = query.json();

    // The field should be wrapped as DataValue with xsd:string (correct client behavior)
    // @ts-ignore - Testing internal JSON structure
    expect(json.field).toBeDefined();
    // @ts-ignore - Testing internal JSON structure
    expect(json.field["@type"]).toBe("DataValue");
    // @ts-ignore - Testing internal JSON structure
    expect(json.field.data).toBeDefined();
    // @ts-ignore - Testing internal JSON structure
    expect(json.field.data["@type"]).toBe("xsd:string");
    // @ts-ignore - Testing internal JSON structure
    expect(json.field.data["@value"]).toBe("field_name");
  });

  test("Dot operator generates valid WOQL JSON structure", () => {
    // Test that dot operator generates valid WOQL JSON that can be serialized
    // The dot operator is typically used with path query results to extract
    // edge metadata fields like 'source', 'target', etc.

    // Example: Extract source and target from path edges
    const query = WOQL.and(
      WOQL.triple("v:a", "knows", "v:b"),
      WOQL.path("v:a", "knows+", "v:end", "v:path_edges"),
      WOQL.dot("v:path_edges", "source", "v:source_node"),
      WOQL.dot("v:path_edges", "target", "v:target_node")
    );

    // @ts-ignore - Testing internal JSON structure
    const json = query.json();

    // Verify the structure is valid
    // @ts-ignore - Testing internal JSON structure
    expect(json["@type"]).toBe("And");
    // @ts-ignore - Testing internal JSON structure
    expect(json.and).toBeDefined();
    // @ts-ignore - Testing internal JSON structure
    expect(Array.isArray(json.and)).toBe(true);
    // @ts-ignore - Testing internal JSON structure
    expect(json.and.length).toBe(4);

    // Find the dot operations
    // @ts-ignore - Testing internal JSON structure
    const dotOps = json.and.filter((op: any) => op["@type"] === "Dot");
    expect(dotOps.length).toBe(2);

    // Verify field is wrapped as DataValue with xsd:string in both dot operations
    dotOps.forEach((dotOp: any) => {
      expect(dotOp.field).toBeDefined();
      expect(dotOp.field["@type"]).toBe("DataValue");
      expect(dotOp.field.data).toBeDefined();
      expect(dotOp.field.data["@type"]).toBe("xsd:string");
      const fieldValue = dotOp.field.data["@value"];
      expect(fieldValue === "source" || fieldValue === "target").toBe(true);
    });
  });

  test("Dot operator compiles without server error", async () => {
    // End-to-end test: verify dot operator compiles successfully
    // The server compiler now correctly handles xsd:string typed literals
    //
    // Before the fix, ANY query with dot operator would fail with:
    // "Not well formed WOQL JSON-LD" error during compilation
    //
    // After the fix, queries with dot operator compile successfully

    // Use the reusable pathQueryWithDot that contains multiple dot operators
    // This query may return 0 results (depends on path structure), but the key
    // test is that it compiles without error - proving the bug fix works
    const result = await client.query(pathQueryWithDot);

    if (!result.bindings) {
      console.error(
        `=== Dot Operator Compilation Test Error ===` +
          `\n   Query compiled successfully (no server compilation error)` +
          `\n   However, 0 bindings returned`
      );
    }
    expect(result.bindings).toBeDefined();

    // The key verification: we got here without a compilation error
    // Before the fix, this would throw: "Not well formed WOQL JSON-LD"
    expect(result.bindings.length).toBeGreaterThanOrEqual(0);
  });

  test("Dot operator extracts values from queried documents", async () => {
    const query = WOQL.and(
      // Find Alice's person ID
      WOQL.eq("v:person_id", "Person/Alice"),
      WOQL.triple("v:person_id", "rdf:type", "@schema:Person"),
      WOQL.triple("v:person_id", "name", "v:name_value"),
      // Read the document as JSON object
      // @ts-ignore - read_document exists but may not be in TypeScript definitions
      WOQL.read_document("v:person_id", "v:person_doc"),
      // Extract the name field using dot operator
      WOQL.opt().dot("v:person_doc", "name", "v:extracted_name")
    );

    const result = await client.query(query);

    expect(result.bindings?.length).toBeGreaterThan(0);
    if (!result.bindings || result.bindings.length === 0) {
      console.error(
        `=== Dot Operator Extraction Test Error ===` +
          `\n   Query compiled successfully (no server compilation error)` +
          `\n   However, 0 bindings returned`
      );
    } else {
      const binding = result.bindings[0];
      expect(binding?.name_value?.["@value"]).toBe("Alice");
      expect(binding?.extracted_name).toBe("Alice");
    }
  });

  test("Dot operator extracts values from path edges", async () => {
    const fullQuery = WOQL.and(
      WOQL.path("Person/Alice", "knows+", "v:known_person", "v:path_edges"),
      WOQL.member("v:edge", "v:path_edges"),
      WOQL.opt().dot("v:edge", "subject", "v:extracted_subject"),
      WOQL.opt().dot("v:edge", "woql:subject", "v:extracted_woql_subject"),
      WOQL.opt().dot(
        "v:edge",
        "http://terminusdb.com/schema/woql#subject",
        "v:extracted_terminus_subject"
      )
    );

    const fullResult = await client.query(fullQuery);

    expect(fullResult.bindings?.length).toBeGreaterThan(0);
    if (!fullResult.bindings || fullResult.bindings.length === 0) {
      console.error(
        `=== Dot Operator Extraction Path Edge Error ===` +
          `\n   Query compiled successfully (no server compilation error)` +
          `\n   However, 0 bindings returned`
      );
    } else {
      const binding = fullResult.bindings[0];
      expect(binding?.extracted_subject).toBe("Person/Alice");
      expect(binding?.extracted_woql_subject).toBe("Person/Alice");
      expect(binding?.extracted_terminus_subject).toBe("Person/Alice");
    }
  });

  test("Reusable query JSON structure verification", () => {
    // Verify the reusable pathQueryWithDot has correct JSON structure
    // with DataValue wrapped fields (xsd:string)

    // @ts-ignore - Testing internal JSON structure
    const json = pathQueryWithDot.json();

    // @ts-ignore - Testing internal JSON structure
    expect(json["@type"]).toBe("And");
    // @ts-ignore - Testing internal JSON structure
    expect(json.and).toBeDefined();

    // Find all dot operations in the query
    // @ts-ignore - Testing internal JSON structure
    const dotOps = json.and.filter((op: any) => op["@type"] === "Dot");

    expect(dotOps.length).toBe(3); // subject, predicate, object

    // Verify ALL dot operations have DataValue wrapped xsd:string fields
    dotOps.forEach((dotOp: any, i: number) => {
      const fieldValue = dotOp.field.data["@value"];

      expect(dotOp.field["@type"]).toBe("DataValue");
      expect(dotOp.field.data["@type"]).toBe("xsd:string");
      expect(["subject", "predicate", "object"].includes(fieldValue)).toBe(
        true
      );
    });
  });

  test("Field value structure - DataValue with xsd:string", () => {
    // This test verifies the client produces the CORRECT structure:
    // DataValue wrapped with xsd:string type (same as Python client)

    const actualQuery = WOQL.dot("v:dict", "field_name", "v:output");
    // @ts-ignore - Testing internal JSON structure
    const actualJson = actualQuery.json();
    // @ts-ignore - Testing internal JSON structure
    const actualField = actualJson.field;

    // Verify the field is wrapped as DataValue with xsd:string
    // This matches the Python client implementation
    expect(actualField).toBeDefined();
    expect(actualField["@type"]).toBe("DataValue");
    expect(actualField.data).toBeDefined();
    expect(actualField.data["@type"]).toBe("xsd:string");
    expect(actualField.data["@value"]).toBe("field_name");
  });
});
