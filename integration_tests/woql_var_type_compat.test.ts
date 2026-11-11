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
import { WOQL, WOQLQuery, Var } from "../index.js";
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

describe("Issue #378: Var acceptance sweep - remaining functions", () => {
  test("idgen_uuid_v7 accepts Var for the output variable", async () => {
    const v = WOQL.Vars("itemName", "newId");

    const query = WOQL.and(
      WOQL.triple("v:item", "name", v.itemName),
      WOQL.idgen_uuid_v7("Item/", v.newId)
    );

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(3);
    for (const binding of result!.bindings) {
      expect(binding.newId).toMatch(/^Item\//);
    }
  });

  test("idgen accepts Var list elements and Var output variable", () => {
    const v = WOQL.Vars("first", "last", "generatedId");

    const query = new WOQLQuery().idgen("doc:Item/", [v.first, v.last], v.generatedId);
    const json = query.json();

    expect(json).toHaveProperty("@type", "LexicalKey");
    expect(json.uri).toHaveProperty("variable", "generatedId");
  });

  test("idgen_uuid_v7 builder method accepts Var output variable", () => {
    const [newId] = WOQL.vars("newId");

    const query = new WOQLQuery().idgen_uuid_v7("Item/", newId);
    const json = query.json();

    expect(json).toHaveProperty("@type", "UuidV7");
    expect(json.uri).toHaveProperty("variable", "newId");
  });

  test("re accepts Var for pattern, input and result list", async () => {
    const v = WOQL.Vars("pat", "itemName", "match");

    const query = WOQL.and(
      WOQL.eq(v.pat, WOQL.string("^Al")),
      WOQL.triple("v:item", "name", v.itemName),
      new WOQLQuery().re(v.pat, v.itemName, [v.match])
    );

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(1);
    const bound = result!.bindings[0].itemName as { "@value"?: string } | string;
    expect(typeof bound === "object" ? bound["@value"] : bound).toBe("Alpha");
  });

  test("select accepts Var arguments and a trailing subquery", async () => {
    const v = WOQL.Vars("itemName", "itemTags");

    const query = WOQL.select(
      v.itemName,
      WOQL.triple("v:item", "name", v.itemName)
    );

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(3);
    for (const binding of result!.bindings) {
      expect(Object.keys(binding)).toEqual(["itemName"]);
    }
  });

  test("distinct accepts Var arguments and a trailing subquery", async () => {
    const v = WOQL.Vars("tag");

    const query = WOQL.distinct(
      v.tag,
      WOQL.triple("v:item", "tags", v.tag)
    );

    const result = await client.query(query);

    expect(result?.bindings).toHaveLength(4);
  });

  test("order_by accepts Var, [Var, order] tuples and a trailing subquery", async () => {
    const v = WOQL.Vars("itemName");

    const query = WOQL.order_by(
      [v.itemName, "desc"],
      WOQL.triple("v:item", "name", v.itemName)
    );

    const result = await client.query(query);

    const names = result?.bindings.map((b: Record<string, unknown>) => {
      const bound = b.itemName as { "@value"?: string } | string;
      return typeof bound === "object" ? bound["@value"] : bound;
    });
    expect(names).toEqual([
      "Gamma",
      "Beta",
      "Alpha",
    ]);
  });

  test("update_quad builder accepts Var for subject, predicate and object", () => {
    const v = WOQL.Vars("s", "p", "o");

    const query = new WOQLQuery().update_quad(v.s, v.p, v.o, "schema/main");
    const json = query.json();

    expect(json).toHaveProperty("@type", "And");
  });

  test("Vars() and VarsUnique() return a record of Var", async () => {
    const v = WOQL.Vars("alpha");
    const vu = WOQL.VarsUnique("beta");

    const alphaVar: Var = v.alpha;
    const betaVar: Var = vu.beta;
    expect(alphaVar.name).toBe("alpha");
    expect(betaVar.name).toMatch(/^beta/);

    const query = WOQL.and(
      WOQL.eq(alphaVar, "Item/Alpha"),
      WOQL.read_document(alphaVar, vu.beta)
    );
    const result = await client.query(query);
    expect(result?.bindings).toHaveLength(1);
  });
});
