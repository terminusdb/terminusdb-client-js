//@ts-check
/**
 * Integration tests for issue #378: Var arguments in read_document and length
 *
 * These tests verify that WOQL.vars() Var objects can be passed to
 * read_document() and length() without TypeScript errors, and that the
 * resulting queries compile and execute correctly against TerminusDB.
 *
 * Before the fix: TypeScript rejects Var arguments (compile-time failure).
 * After the fix: Tests compile and pass at runtime.
 */
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { WOQL } from "../index.js";
import { Vars } from "../lib/woql.js";
import {
  createTestClient,
  setupTestBranch,
  teardownTestBranch,
} from "./test_utils";

const branchName = "test_woql_var_type_compat";
let client = createTestClient();

// Schema: a simple Item class with a name and a tags list
const itemSchema = [
  {
    "@base": "terminusdb:///data/",
    "@schema": "terminusdb:///schema#",
    "@type": "@context",
  },
  {
    "@id": "Item",
    "@key": { "@type": "Lexical", "@fields": ["name"] },
    "@type": "Class",
    name: "xsd:string",
    tags: { "@type": "Set", "@class": "xsd:string" },
  },
];

beforeAll(async () => {
  await setupTestBranch(client, branchName);

  // Add schema
  await client.addDocument(itemSchema, {
    graph_type: "schema",
    full_replace: true,
  });

  // Insert test documents
  await client.addDocument([
    { "@type": "Item", name: "Alpha", tags: ["fast", "reliable"] },
    { "@type": "Item", name: "Beta", tags: ["cheap"] },
    { "@type": "Item", name: "Gamma", tags: ["fast", "cheap", "new"] },
  ]);
}, 60000);

afterAll(async () => {
  await teardownTestBranch(client, branchName);
});

describe("Issue #378: Var type compatibility with read_document", () => {
  test("read_document accepts Var objects from WOQL.vars() for IRI", async () => {
    // Use Var objects (not "v:" strings) for read_document arguments
    const [uri, doc] = WOQL.vars("uri", "doc");

    // Construct query: find an Item by type, then read it as a document
    const query = WOQL.and(
      WOQL.triple(uri, "rdf:type", "@schema:Item"),
      WOQL.read_document(uri, doc)
    );

    const result = await client.query(query);

    // Should return bindings for each Item document
    expect(result?.bindings).toBeDefined();
    expect(result!.bindings.length).toBeGreaterThanOrEqual(1);

    // Each binding should have a doc that is an object with @type "Item"
    const docs = result!.bindings.map(
      (b: Record<string, unknown>) => b.doc
    );
    for (const d of docs) {
      expect(d).toHaveProperty("@type", "Item");
      expect(d).toHaveProperty("name");
    }
  });

  test("read_document accepts Var objects from WOQL.Vars() for both IRI and output", async () => {
    // Use WOQL.Vars (record-style) instead of destructured array
    const v = Vars("itemUri", "itemDoc");

    const query = WOQL.and(
      WOQL.eq(v.itemUri, "Item/Alpha"),
      WOQL.read_document(v.itemUri, v.itemDoc)
    );

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(1);
    const doc = result!.bindings[0].itemDoc;
    expect(doc).toHaveProperty("@type", "Item");
    expect(doc).toHaveProperty("name", "Alpha");
  });

  test("read_document compiles correct JSON-LD with Var arguments", () => {
    const [uri, doc] = WOQL.vars("uri", "doc");

    const query = WOQL.read_document(uri, doc);
    const json = query.json();

    // Verify the compiled JSON-LD structure uses NodeValue/Value with variable
    expect(json).toHaveProperty("@type", "ReadDocument");
    expect(json).toHaveProperty("identifier");
    expect(json.identifier).toHaveProperty("variable", "uri");
    expect(json).toHaveProperty("document");
    expect(json.document).toHaveProperty("variable", "doc");
  });
});

describe("Issue #378: Var type compatibility with length", () => {
  test("length accepts Var object for result variable", async () => {
    const v = Vars("name", "names", "count");

    // Collect all item names, then count them
    const query = WOQL.and(
      WOQL.collect(
        v.name,
        v.names,
        WOQL.triple("v:itemId", "name", v.name)
      ),
      WOQL.length(v.names, v.count)
    );

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(1);
    expect(result!.bindings[0].count["@value"]).toBe(3);
  });

  test("length accepts Var object for list argument via string variable", async () => {
    const [count] = WOQL.vars("count");

    // Use a string "v:list" for the list and a Var for the count
    const query = WOQL.and(
      WOQL.collect("v:name", "v:list", WOQL.triple("v:itemId", "name", "v:name")),
      WOQL.length("v:list", count)
    );

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(1);
    expect(result!.bindings[0].count["@value"]).toBe(3);
  });

  test("length compiles correct JSON-LD with Var arguments", () => {
    const v = Vars("myList", "len");

    const query = WOQL.length(v.myList, v.len);
    const json = query.json();

    // Verify the compiled JSON-LD structure
    expect(json).toHaveProperty("@type", "Length");
    expect(json).toHaveProperty("list");
    expect(json).toHaveProperty("length");
    // The length field should be a variable reference
    expect(json.length).toHaveProperty("variable", "len");
  });
});

describe("Issue #378: Mixed Var and string variable usage", () => {
  test("read_document works with Var for IRI and string for output", async () => {
    const [uri] = WOQL.vars("uri");

    const query = WOQL.and(
      WOQL.eq(uri, "Item/Beta"),
      WOQL.read_document(uri, "v:betaDoc")
    );

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(1);
    expect(result!.bindings[0].betaDoc).toHaveProperty("@type", "Item");
    expect(result!.bindings[0].betaDoc).toHaveProperty("name", "Beta");
  });

  test("read_document works with string for IRI and Var for output", async () => {
    const [doc] = WOQL.vars("doc");

    const query = WOQL.read_document("Item/Gamma", doc);

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(1);
    expect(result!.bindings[0].doc).toHaveProperty("@type", "Item");
    expect(result!.bindings[0].doc).toHaveProperty("name", "Gamma");
  });

  test("length works with literal list and Var result", async () => {
    const [count] = WOQL.vars("count");

    const query = WOQL.length(["a", "b", "c"], count);

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(1);
    expect(result!.bindings[0].count["@value"]).toBe(3);
  });
});
