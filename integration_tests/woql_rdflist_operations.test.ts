//@ts-check
import { describe, expect, test, beforeAll, afterAll } from "@jest/globals";
import { WOQL } from "../index.js";

/**
 * Integration test for WOQL rdf:List operations
 *
 * Tests comprehensive rdf:List manipulation using the WOQL library functions.
 * rdf:List structures use rdf:first, rdf:rest, and rdf:nil predicates to
 * implement linked list data structures in RDF.
 *
 * This test suite demonstrates how to work with rdf:List structures using
 * WOQL queries and verifies that the library functions work correctly.
 */

import { createTestClient, setupTestDatabase } from "./test_utils";

const testDb = "db__test_woql_rdflist_ops";
let client = createTestClient();

beforeAll(async () => {
  client.db(testDb);
  await setupTestDatabase(client, testDb, {
    comment: "Test database for rdf:List operations"
  });

  // Schema with a class that has an rdf:List property
  const schema = [
    {
      "@type": "Class",
      "@id": "TaskList",
      "@key": { "@type": "Random" },
      name: "xsd:string",
      tasks: "Task" // Will be an rdf:List of Task references
    },
    {
      "@type": "Class",
      "@id": "Task",
      "@key": { "@type": "Random" },
      title: "xsd:string",
      priority: "xsd:integer"
    }
  ];

  await client.addDocument(schema, { graph_type: "schema" });
}, 30000);

describe("WOQL rdf:List Operations", () => {
  test("Create an rdf:List manually using triples", async () => {
    // Build an rdf:List structure manually to understand the structure
    // List: ["Task A", "Task B", "Task C"]

    const query = WOQL.and(
      // Create list cells using random IDs
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),

      // Cell 1: first = "Task A", rest = cell2
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("Task A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),

      // Cell 2: first = "Task B", rest = cell3
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("Task B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),

      // Cell 3: first = "Task C", rest = nil (end of list)
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("Task C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const result = await client.query(query);
    expect(result?.inserts).toBeGreaterThan(0);

    const bindings = result?.bindings?.[0];
    const cell1 = bindings["cell1"] || bindings["v:cell1"];
    expect(cell1).toBeDefined();
    expect(cell1).toContain("Cons/");

    // Store for later tests
    (global as any).testListHead = cell1;
  });

  test("WOQL.lib.rdflist_peek: Get first element", async () => {
    const listHead = (global as any).testListHead;

    const query = WOQL.lib().rdflist_peek(listHead, "v:first_value");

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();
    expect(result?.bindings?.length).toBeGreaterThan(0);

    const binding = result?.bindings?.[0];
    const firstValue = binding["first_value"] || binding["v:first_value"];
    expect(firstValue).toBeDefined();
    expect(firstValue["@value"]).toEqual("Task A");
  });

  test("WOQL.lib.rdflist_length: Count list elements", async () => {
    const listHead = (global as any).testListHead;

    const query = WOQL.lib().rdflist_length(listHead, "v:length");

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();

    const binding = result?.bindings?.[0];
    const length = binding["length"] || binding["v:length"];
    expect(length).toBeDefined();
    expect(parseInt(length["@value"])).toBe(3);
  });

  test("WOQL.lib.rdflist_member: Traverse and read all list values", async () => {
    const listHead = (global as any).testListHead;

    const query = WOQL.lib().rdflist_member(listHead, "v:value");

    const result = await client.query(query);
    expect(result?.bindings).toBeDefined();
    expect(result?.bindings?.length).toBeGreaterThan(0);

    // Should get multiple bindings, one for each element
    const values = result?.bindings?.map((b: any) => {
      const val = b["value"] || b["v:value"];
      return val?.["@value"] || val;
    });

    expect(values).toContain("Task A");
    expect(values).toContain("Task B");
    expect(values).toContain("Task C");
  });

  test("WOQL.lib.rdflist_list: Generator mode - collect all values as array", async () => {
    // Create list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Use rdflist_list to collect all values into array
    const query = WOQL.lib().rdflist_list(listHead, "v:list");
    const result = await client.query(query);

    expect(result?.bindings).toBeDefined();
    expect(result?.bindings?.length).toBe(1);

    const binding = result?.bindings?.[0];
    const list = binding["list"] || binding["v:list"];
    expect(Array.isArray(list)).toBe(true);
    expect(list.length).toBe(3);

    const values = list.map((item: any) => item?.["@value"] || item);
    expect(values).toEqual(["A", "B", "C"]);
  });

  test("WOQL.lib.rdflist_list: Compare with rdflist_slice full range", async () => {
    // Create list: [X, Y, Z]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("X")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("Y")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("Z")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // rdflist_list should give same result as rdflist_slice(0, length)
    const listQuery = WOQL.lib().rdflist_list(listHead, "v:list");
    const sliceQuery = WOQL.lib().rdflist_slice(listHead, 0, 3, "v:slice");

    const listResult = await client.query(listQuery);
    const sliceResult = await client.query(sliceQuery);

    const listValues =
      listResult?.bindings?.[0]?.["list"] ||
      listResult?.bindings?.[0]?.["v:list"];
    const sliceValues =
      sliceResult?.bindings?.[0]?.["slice"] ||
      sliceResult?.bindings?.[0]?.["v:slice"];

    // Both should return arrays with same values
    expect(Array.isArray(listValues)).toBe(true);
    expect(Array.isArray(sliceValues)).toBe(true);
    expect(listValues.length).toBe(sliceValues.length);
  });

  test("WOQL.lib.rdflist_pop: Remove first element in-place", async () => {
    // Create a fresh list for this test: [X, Y, Z]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("X")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("Y")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("Z")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );
    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Pop the first element in-place
    const popQuery = WOQL.lib().rdflist_pop(listHead, "v:popped");
    const popResult = await client.query(popQuery);
    expect(popResult?.inserts).toBeGreaterThan(0);
    expect(popResult?.deletes).toBeGreaterThan(0);

    const popped =
      popResult?.bindings?.[0]?.["popped"] ||
      popResult?.bindings?.[0]?.["v:popped"];
    expect(popped["@value"]).toEqual("X");

    // Verify the list head (same IRI) now starts with Y
    const verifyQuery = WOQL.lib().rdflist_peek(listHead, "v:first");
    const verifyResult = await client.query(verifyQuery);
    const firstValue =
      verifyResult?.bindings?.[0]?.["first"] ||
      verifyResult?.bindings?.[0]?.["v:first"];
    expect(firstValue["@value"]).toEqual("Y");

    // Verify length is now 2
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(Number.parseInt(len["@value"])).toBe(2);

    // Verify full order: [Y, Z]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toEqual(["Y", "Z"]);
  });

  test("WOQL.lib.rdflist_push: Add element to front in-place", async () => {
    // Create a fresh list for this test: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );
    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Push a new value to the front in-place
    const pushQuery = WOQL.lib().rdflist_push(listHead, WOQL.string("Z"));
    const pushResult = await client.query(pushQuery);
    expect(pushResult?.inserts).toBeGreaterThan(0);
    expect(pushResult?.deletes).toBeGreaterThan(0);

    // Verify the list head (same IRI) now has the new first value
    const verifyQuery = WOQL.lib().rdflist_peek(listHead, "v:first");
    const verifyResult = await client.query(verifyQuery);
    const firstValue =
      verifyResult?.bindings?.[0]?.["first"] ||
      verifyResult?.bindings?.[0]?.["v:first"];
    expect(firstValue["@value"]).toEqual("Z");

    // Verify length is now 4
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(Number.parseInt(len["@value"])).toBe(4);

    // Verify full order: [Z, A, B, C]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toEqual(["Z", "A", "B", "C"]);
  });

  test("WOQL.lib.rdflist_append: Add element to end", async () => {
    const listHead = (global as any).testListHead;

    // Append a new value to the end
    const query = WOQL.lib().rdflist_append(
      listHead,
      WOQL.string("Task D - Last"),
      "v:new_cell"
    );

    const result = await client.query(query);
    expect(result?.inserts).toBeGreaterThan(0);
    expect(result?.deletes).toBeGreaterThan(0); // Deletes the old nil reference

    const binding = result?.bindings?.[0];
    const newCell = binding["new_cell"] || binding["v:new_cell"];
    expect(newCell).toBeDefined();

    // Verify the list now has 4 elements
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(parseInt(len["@value"])).toBe(4);

    // Verify we can read all values including the new one
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toContain("Task D - Last");
  });

  test("WOQL.lib.rdflist_empty and rdflist_is_empty: Empty list operations", async () => {
    // Create an empty list (just rdf:nil)
    const emptyQuery = WOQL.lib().rdflist_empty("v:empty_list");
    const emptyResult = await client.query(emptyQuery);

    const binding = emptyResult?.bindings?.[0];
    const emptyList = binding["empty_list"] || binding["v:empty_list"];
    expect(emptyList).toEqual("rdf:nil");

    // Check if it's empty
    const checkQuery = WOQL.lib().rdflist_is_empty(emptyList);
    const checkResult = await client.query(checkQuery);
    expect(checkResult?.bindings).toBeDefined();
    expect(checkResult?.bindings?.length).toBeGreaterThan(0);
  });

  test("Complex: Build list and push multiple elements in-place", async () => {
    // Create a list with one element: [First]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:list_head"),
      WOQL.add_triple("v:list_head", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:list_head", "rdf:first", WOQL.string("First")),
      WOQL.add_triple("v:list_head", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    expect(createResult?.inserts).toBeGreaterThan(0);

    const listHead =
      createResult?.bindings?.[0]?.["list_head"] ||
      createResult?.bindings?.[0]?.["v:list_head"];

    // Push "Second" to front: [Second, First]
    const push1Query = WOQL.lib().rdflist_push(listHead, WOQL.string("Second"));
    await client.query(push1Query);

    // Push "Third" to front: [Third, Second, First]
    const push2Query = WOQL.lib().rdflist_push(listHead, WOQL.string("Third"));
    await client.query(push2Query);

    // Verify the list has correct order (Third, Second, First due to pushes)
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:item");
    const readResult = await client.query(readQuery);

    const items = readResult?.bindings?.map((b: any) => {
      const item = b["item"] || b["v:item"];
      return item?.["@value"] || item;
    });

    // Items should be in reverse order since we pushed
    expect(items[0]).toEqual("Third");
    expect(items[1]).toEqual("Second");
    expect(items[2]).toEqual("First");
  });

  test("Working with Task objects in lists", async () => {
    // Create some Task documents
    const task1 = {
      "@type": "Task",
      "@id": "Task/high_priority",
      title: "Fix critical bug",
      priority: 1
    };

    const task2 = {
      "@type": "Task",
      "@id": "Task/medium_priority",
      title: "Update documentation",
      priority: 2
    };

    await client.addDocument([task1, task2]);

    // Build a list of task references using string literals
    const listQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),

      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple(
        "v:cell1",
        "rdf:first",
        WOQL.string("Task/high_priority")
      ),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),

      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple(
        "v:cell2",
        "rdf:first",
        WOQL.string("Task/medium_priority")
      ),
      WOQL.add_triple("v:cell2", "rdf:rest", "rdf:nil")
    );

    const listResult = await client.query(listQuery);
    expect(listResult?.inserts).toBeGreaterThan(0);

    const taskListHead =
      listResult?.bindings?.[0]?.["cell1"] ||
      listResult?.bindings?.[0]?.["v:cell1"];
    expect(taskListHead).toBeDefined();

    // Read the task list - just verify we can traverse it
    const readQuery = WOQL.lib().rdflist_member(taskListHead, "v:task_ref");

    const readResult = await client.query(readQuery);
    expect(readResult?.bindings).toBeDefined();
    expect(readResult?.bindings?.length).toBeGreaterThanOrEqual(2);

    const taskRefs = readResult?.bindings
      ?.map((b: any) => {
        const ref = b["task_ref"] || b["v:task_ref"];
        return ref?.["@value"] || ref;
      })
      .filter((ref: any) => ref && ref !== "rdf:nil");

    expect(taskRefs).toContain("Task/high_priority");
    expect(taskRefs).toContain("Task/medium_priority");
  });

  test("WOQL.lib.rdflist_clear: Clear a list", async () => {
    // Create a simple list first
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:head"),
      WOQL.add_triple("v:head", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:head", "rdf:first", WOQL.string("Item to clear")),
      WOQL.add_triple("v:head", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    expect(createResult?.inserts).toBeGreaterThan(0);

    const head =
      createResult?.bindings?.[0]?.["head"] ||
      createResult?.bindings?.[0]?.["v:head"];
    expect(head).toBeDefined();

    // Verify the list exists with peek
    const peekQuery = WOQL.lib().rdflist_peek(head, "v:first_value");
    const peekResult = await client.query(peekQuery);
    expect(peekResult?.bindings).toBeDefined();
    const firstVal =
      peekResult?.bindings?.[0]?.["first_value"] ||
      peekResult?.bindings?.[0]?.["v:first_value"];
    expect(firstVal?.["@value"]).toEqual("Item to clear");

    // Clear the list - deletes all cons cells and returns rdf:nil
    const clearQuery = WOQL.lib().rdflist_clear(head, "v:empty_list");
    const clearResult = await client.query(clearQuery);
    expect(clearResult?.deletes).toBeGreaterThan(0);

    // Verify the new list value is rdf:nil
    const emptyList =
      clearResult?.bindings?.[0]?.["empty_list"] ||
      clearResult?.bindings?.[0]?.["v:empty_list"];
    expect(emptyList).toEqual("rdf:nil");

    // Verify the old cons cell is gone (no triples)
    const verifyGoneQuery = WOQL.triple(head, "v:pred", "v:obj");
    const verifyGoneResult = await client.query(verifyGoneQuery);
    expect(verifyGoneResult?.bindings?.length || 0).toBe(0);
  });

  test("WOQL.lib.rdflist_clear: Clear list with document references", async () => {
    // Create Task documents to reference in the list
    const task1Id = "Task/clear_docref_1";
    const task2Id = "Task/clear_docref_2";

    await client.addDocument([
      {
        "@type": "Task",
        "@id": task1Id,
        title: "Clear Test Task 1",
        priority: 1
      },
      {
        "@type": "Task",
        "@id": task2Id,
        title: "Clear Test Task 2",
        priority: 2
      }
    ]);

    // Create a standalone 2-element list referencing these tasks
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", task1Id),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", task2Id),
      WOQL.add_triple("v:cell2", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    expect(createResult?.inserts).toBeGreaterThan(0);

    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];
    const cell2 =
      createResult?.bindings?.[0]?.["cell2"] ||
      createResult?.bindings?.[0]?.["v:cell2"];

    // Clear the list - deletes all cons cells
    const clearQuery = WOQL.lib().rdflist_clear(listHead, "v:empty_list");
    const clearResult = await client.query(clearQuery);
    expect(clearResult?.deletes).toBeGreaterThan(0);

    // Verify the new list value is rdf:nil
    const emptyList =
      clearResult?.bindings?.[0]?.["empty_list"] ||
      clearResult?.bindings?.[0]?.["v:empty_list"];
    expect(emptyList).toEqual("rdf:nil");

    // Verify all cons cells are gone
    const checkCell1 = WOQL.triple(listHead, "v:pred", "v:obj");
    const checkCell1Result = await client.query(checkCell1);
    expect(checkCell1Result?.bindings?.length || 0).toBe(0);

    const checkCell2 = WOQL.triple(cell2, "v:pred", "v:obj");
    const checkCell2Result = await client.query(checkCell2);
    expect(checkCell2Result?.bindings?.length || 0).toBe(0);

    // IMPORTANT: The Task documents should still exist (we only cleared the list structure)
    const task1Doc = await client.getDocument({ id: task1Id });
    expect(task1Doc).toBeDefined();
    expect((task1Doc as any).title).toEqual("Clear Test Task 1");

    const task2Doc = await client.getDocument({ id: task2Id });
    expect(task2Doc).toBeDefined();
    expect((task2Doc as any).title).toEqual("Clear Test Task 2");
  });

  test("WOQL.lib.rdflist_clear: Clear standalone list with document references", async () => {
    // Create Task documents first
    const task1Id = `Task/clear_test_task1_${Date.now()}`;
    const task2Id = `Task/clear_test_task2_${Date.now()}`;

    await client.addDocument({
      "@type": "Task",
      "@id": task1Id,
      title: "Clear Test Task 1",
      priority: 1
    });

    await client.addDocument({
      "@type": "Task",
      "@id": task2Id,
      title: "Clear Test Task 2",
      priority: 2
    });

    // Create a list containing references to these tasks
    const createListQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", task1Id),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", task2Id),
      WOQL.add_triple("v:cell2", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createListQuery);
    expect(createResult?.inserts).toBeGreaterThan(0);

    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];
    const cell2 =
      createResult?.bindings?.[0]?.["cell2"] ||
      createResult?.bindings?.[0]?.["v:cell2"];

    // Verify the list has 2 elements
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(Number.parseInt(len["@value"])).toBe(2);

    // Clear the list - deletes all cons cells
    const clearQuery = WOQL.lib().rdflist_clear(listHead, "v:empty_list");
    const clearResult = await client.query(clearQuery);
    expect(clearResult?.deletes).toBeGreaterThan(0);

    // Verify the new list value is rdf:nil
    const emptyList =
      clearResult?.bindings?.[0]?.["empty_list"] ||
      clearResult?.bindings?.[0]?.["v:empty_list"];
    expect(emptyList).toEqual("rdf:nil");

    // Verify all cons cells are gone
    const checkCell1 = WOQL.triple(listHead, "v:pred", "v:obj");
    const checkCell1Result = await client.query(checkCell1);
    expect(checkCell1Result?.bindings?.length || 0).toBe(0);

    const checkCell2 = WOQL.triple(cell2, "v:pred", "v:obj");
    const checkCell2Result = await client.query(checkCell2);
    expect(checkCell2Result?.bindings?.length || 0).toBe(0);

    // IMPORTANT: The Task documents should still exist (we only cleared the list structure)
    const task1Doc = await client.getDocument({ id: task1Id });
    expect(task1Doc).toBeDefined();
    expect((task1Doc as any).title).toEqual("Clear Test Task 1");

    const task2Doc = await client.getDocument({ id: task2Id });
    expect(task2Doc).toBeDefined();
    expect((task2Doc as any).title).toEqual("Clear Test Task 2");
  });

  test("Pattern: Delete all documents referenced by list using group_by", async () => {
    // This test demonstrates using group_by with rdflist_member + delete_document
    // to delete all documents in a single query, then clear the list.
    await client.addDocument(
      {
        "@id": "Project",
        "@type": "Class",
        "@key": { "@type": "Random" },
        tasks: {
          "@type": "List",
          "@class": "Task"
        }
      },
      { graph_type: "schema" }
    );

    // Create Task documents
    const task1Id = `Task/groupby_pattern_task1_${Date.now()}`;
    const task2Id = `Task/groupby_pattern_task2_${Date.now()}`;
    const task3Id = `Task/groupby_pattern_task3_${Date.now()}`;

    const doc = {
      "@id": "Project/1",
      "@type": "Project",
      tasks: [
        { "@type": "Task", "@id": task1Id, title: "Task 1", priority: 1 },
        { "@type": "Task", "@id": task2Id, title: "Task 2", priority: 2 },
        { "@type": "Task", "@id": task3Id, title: "Task 3", priority: 3 }
      ]
    };

    await client.addDocument(doc);

    // Delete all documents and clear list using group_by pattern (single query)
    const deleteAndClearQuery = WOQL.and(
      WOQL.triple("Project/1", "tasks", "v:listHead"),
      WOQL.group_by(
        [],
        "v:subdoc",
        "v:members",
        WOQL.and(
          WOQL.lib().rdflist_member("v:listHead", "v:subdoc"),
          WOQL.delete_document("v:subdoc")
        )
      ),
      // Clear list and get rdf:nil as new list value
      WOQL.lib().rdflist_clear("v:listHead", "v:empty_list"),
      // Update the reference to point to rdf:nil
      WOQL.delete_triple("Project/1", "tasks", "v:listHead"),
      WOQL.add_triple("Project/1", "tasks", "v:empty_list")
    );

    const deleteResult = await client.query(deleteAndClearQuery);
    expect(deleteResult?.deletes).toBeGreaterThan(0);

    // Verify tasks list is now empty (rdf:nil = [])
    const project = await client.getDocument({ id: "Project/1" });
    expect((project as any).tasks).toEqual([]);
  });

  test("WOQL.lib.rdflist_insert: Insert at position 0 (head)", async () => {
    // Create a fresh list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    expect(createResult?.inserts).toBeGreaterThan(0);

    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Insert "X" at position 0: [A, B, C] -> [X, A, B, C]
    const insertQuery = WOQL.lib().rdflist_insert(
      listHead,
      0,
      WOQL.string("X")
    );
    const insertResult = await client.query(insertQuery);
    expect(insertResult?.inserts).toBeGreaterThan(0);
    expect(insertResult?.deletes).toBeGreaterThan(0);

    // Verify the list now has X at head
    const peekQuery = WOQL.lib().rdflist_peek(listHead, "v:first");
    const peekResult = await client.query(peekQuery);
    const firstVal =
      peekResult?.bindings?.[0]?.["first"] ||
      peekResult?.bindings?.[0]?.["v:first"];
    expect(firstVal?.["@value"]).toEqual("X");

    // Verify length is now 4
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(parseInt(len["@value"])).toBe(4);

    // Verify order: [X, A, B, C]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values[0]).toEqual("X");
    expect(values[1]).toEqual("A");
    expect(values[2]).toEqual("B");
    expect(values[3]).toEqual("C");
  });

  test("WOQL.lib.rdflist_insert: Insert at position 1 (after head)", async () => {
    // Create a fresh list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Insert "Y" at position 1: [A, B, C] -> [A, Y, B, C]
    const insertQuery = WOQL.lib().rdflist_insert(
      listHead,
      1,
      WOQL.string("Y")
    );
    const insertResult = await client.query(insertQuery);
    expect(insertResult?.inserts).toBeGreaterThan(0);
    expect(insertResult?.deletes).toBeGreaterThan(0);

    // Verify length is now 4
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(parseInt(len["@value"])).toBe(4);

    // Verify order: [A, Y, B, C]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values[0]).toEqual("A");
    expect(values[1]).toEqual("Y");
    expect(values[2]).toEqual("B");
    expect(values[3]).toEqual("C");
  });

  test("WOQL.lib.rdflist_insert: Insert at position 2 (using path)", async () => {
    // Create a fresh list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Insert "Z" at position 2: [A, B, C] -> [A, B, Z, C]
    const insertQuery = WOQL.lib().rdflist_insert(
      listHead,
      2,
      WOQL.string("Z")
    );
    const insertResult = await client.query(insertQuery);
    expect(insertResult?.inserts).toBeGreaterThan(0);
    expect(insertResult?.deletes).toBeGreaterThan(0);

    // Verify length is now 4
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(parseInt(len["@value"])).toBe(4);

    // Verify order: [A, B, Z, C]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values[0]).toEqual("A");
    expect(values[1]).toEqual("B");
    expect(values[2]).toEqual("Z");
    expect(values[3]).toEqual("C");
  });

  test("WOQL.lib.rdflist_drop: Drop element at position 0 (head)", async () => {
    // Create a fresh list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    expect(createResult?.inserts).toBeGreaterThan(0);

    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Drop element at position 0: [A, B, C] -> [B, C]
    const dropQuery = WOQL.lib().rdflist_drop(listHead, 0);
    const dropResult = await client.query(dropQuery);
    expect(dropResult?.deletes).toBeGreaterThan(0);

    // Verify the list now has B at head
    const peekQuery = WOQL.lib().rdflist_peek(listHead, "v:first");
    const peekResult = await client.query(peekQuery);
    const firstVal =
      peekResult?.bindings?.[0]?.["first"] ||
      peekResult?.bindings?.[0]?.["v:first"];
    expect(firstVal?.["@value"]).toEqual("B");

    // Verify length is now 2
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(Number.parseInt(len["@value"])).toBe(2);

    // Verify order: [B, C]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values[0]).toEqual("B");
    expect(values[1]).toEqual("C");
  });

  test("WOQL.lib.rdflist_drop: Drop element at position 1 (middle)", async () => {
    // Create a fresh list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Drop element at position 1: [A, B, C] -> [A, C]
    const dropQuery = WOQL.lib().rdflist_drop(listHead, 1);
    const dropResult = await client.query(dropQuery);
    expect(dropResult?.deletes).toBeGreaterThan(0);

    // Verify length is now 2
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(Number.parseInt(len["@value"])).toBe(2);

    // Verify order: [A, C]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values[0]).toEqual("A");
    expect(values[1]).toEqual("C");
  });

  test("WOQL.lib.rdflist_drop: Drop element at position 2 (last)", async () => {
    // Create a fresh list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Drop element at position 2: [A, B, C] -> [A, B]
    const dropQuery = WOQL.lib().rdflist_drop(listHead, 2);
    const dropResult = await client.query(dropQuery);
    expect(dropResult?.deletes).toBeGreaterThan(0);

    // Verify length is now 2
    const lengthQuery = WOQL.lib().rdflist_length(listHead, "v:len");
    const lengthResult = await client.query(lengthQuery);
    const len =
      lengthResult?.bindings?.[0]?.["len"] ||
      lengthResult?.bindings?.[0]?.["v:len"];
    expect(Number.parseInt(len["@value"])).toBe(2);

    // Verify order: [A, B]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values[0]).toEqual("A");
    expect(values[1]).toEqual("B");
  });

  test("WOQL.lib.rdflist_swap: Swap pos 2 with pos 0", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Swap C (pos 2) with A (pos 0): [A, B, C, D] -> [C, B, A, D]
    const swapQuery = WOQL.lib().rdflist_swap(listHead, 2, 0);
    await client.query(swapQuery);

    // Verify order: [C, B, A, D]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toEqual(["C", "B", "A", "D"]);
  });

  test("WOQL.lib.rdflist_swap: Swap pos 0 with pos 3", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Swap A (pos 0) with D (pos 3): [A, B, C, D] -> [D, B, C, A]
    const swapQuery = WOQL.lib().rdflist_swap(listHead, 0, 3);
    await client.query(swapQuery);

    // Verify order: [D, B, C, A]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toEqual(["D", "B", "C", "A"]);
  });

  test("WOQL.lib.rdflist_swap: Swap adjacent pos 1 with pos 2", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Swap B (pos 1) with C (pos 2): [A, B, C, D] -> [A, C, B, D]
    const swapQuery = WOQL.lib().rdflist_swap(listHead, 1, 2);
    await client.query(swapQuery);

    // Verify order: [A, C, B, D]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toEqual(["A", "C", "B", "D"]);
  });

  test("WOQL.lib.rdflist_swap: Swap adjacent pos 2 with pos 1", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Swap C (pos 2) with B (pos 1): [A, B, C, D] -> [A, C, B, D]
    const swapQuery = WOQL.lib().rdflist_swap(listHead, 2, 1);
    await client.query(swapQuery);

    // Verify order: [A, C, B, D]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toEqual(["A", "C", "B", "D"]);
  });

  test("WOQL.lib.rdflist_swap: No-op when posA equals posB", async () => {
    // Create list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Swap pos 1 with pos 1 (no-op): [A, B, C] -> [A, B, C]
    const swapQuery = WOQL.lib().rdflist_swap(listHead, 1, 1);
    const swapResult = await client.query(swapQuery);
    expect(swapResult?.bindings?.length).toBeGreaterThan(0);

    // Verify order unchanged: [A, B, C]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toEqual(["A", "B", "C"]);
  });

  test("WOQL.lib.rdflist_swap: Swap last with first (pos 3 with pos 0)", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Swap D (pos 3) with A (pos 0): [A, B, C, D] -> [D, B, C, A]
    const swapQuery = WOQL.lib().rdflist_swap(listHead, 3, 0);
    await client.query(swapQuery);

    // Verify order: [D, B, C, A]
    const readQuery = WOQL.lib().rdflist_member(listHead, "v:val");
    const readResult = await client.query(readQuery);
    const values = readResult?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });
    expect(values).toEqual(["D", "B", "C", "A"]);
  });

  test("WOQL.lib.rdflist_slice: slice(0, 2) returns first two elements", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // slice(0, 2) should return [A, B]
    const sliceQuery = WOQL.lib().rdflist_slice(listHead, 0, 2, "v:result");
    const sliceResult = await client.query(sliceQuery);

    const values =
      sliceResult?.bindings?.[0]?.["result"] ||
      sliceResult?.bindings?.[0]?.["v:result"];
    const extracted = values?.map((v: any) => v?.["@value"] || v);
    expect(extracted).toHaveLength(2);
    expect(extracted).toContain("A");
    expect(extracted).toContain("B");
  });

  test("WOQL.lib.rdflist_slice: slice(1, 3) returns middle elements", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // slice(1, 3) should return [B, C]
    const sliceQuery = WOQL.lib().rdflist_slice(listHead, 1, 3, "v:result");
    const sliceResult = await client.query(sliceQuery);

    const values =
      sliceResult?.bindings?.[0]?.["result"] ||
      sliceResult?.bindings?.[0]?.["v:result"];
    const extracted = values?.map((v: any) => v?.["@value"] || v);
    expect(extracted).toHaveLength(2);
    expect(extracted).toContain("B");
    expect(extracted).toContain("C");
  });

  test("WOQL.lib.rdflist_slice: slice(2, 4) returns last two elements", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // slice(2, 4) should return [C, D]
    const sliceQuery = WOQL.lib().rdflist_slice(listHead, 2, 4, "v:result");
    const sliceResult = await client.query(sliceQuery);

    const values =
      sliceResult?.bindings?.[0]?.["result"] ||
      sliceResult?.bindings?.[0]?.["v:result"];
    const extracted = values?.map((v: any) => v?.["@value"] || v);
    expect(extracted).toHaveLength(2);
    expect(extracted).toContain("C");
    expect(extracted).toContain("D");
  });

  test("WOQL.lib.rdflist_slice: empty slice when start >= end", async () => {
    const listHead = (global as any).testListHead;

    // slice(2, 2) should return empty array
    const sliceQuery = WOQL.lib().rdflist_slice(listHead, 2, 2, "v:result");
    const sliceResult = await client.query(sliceQuery);

    const values =
      sliceResult?.bindings?.[0]?.["result"] ||
      sliceResult?.bindings?.[0]?.["v:result"];
    expect(values).toEqual([]);
  });

  test("WOQL.lib.rdflist_slice: single element slice(1, 2)", async () => {
    // Create list: [A, B, C]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // slice(1, 2) should return [B]
    const sliceQuery = WOQL.lib().rdflist_slice(listHead, 1, 2, "v:result");
    const sliceResult = await client.query(sliceQuery);

    const values =
      sliceResult?.bindings?.[0]?.["result"] ||
      sliceResult?.bindings?.[0]?.["v:result"];
    const extracted = values?.map((v: any) => v?.["@value"] || v);
    expect(extracted).toHaveLength(1);
    expect(extracted).toContain("B");
  });

  test("WOQL path query ordering: verify results are in hop-count order", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Use raw path query {0,3} to traverse and get values in order
    const pathQuery = WOQL.and(
      WOQL.path(listHead, "rdf:rest{0,3}", "v:node"),
      WOQL.triple("v:node", "rdf:first", "v:val")
    );
    const result = await client.query(pathQuery);

    // Extract values in the order they were returned
    const values = result?.bindings?.map((b: any) => {
      const val = b["val"] || b["v:val"];
      return val?.["@value"] || val;
    });

    // Path queries should return results in hop-count order (0 hops, 1 hop, 2 hops, 3 hops)
    // This means [A, B, C, D] in order
    console.log("Path query results in order:", values);
    expect(values).toEqual(["A", "B", "C", "D"]);
  });

  test("WOQL.lib.rdflist_reverse: reverse a 4-element list in place", async () => {
    // Create list: [A, B, C, D]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell3"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell4"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("A")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("B")),
      WOQL.add_triple("v:cell2", "rdf:rest", "v:cell3"),
      WOQL.add_triple("v:cell3", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell3", "rdf:first", WOQL.string("C")),
      WOQL.add_triple("v:cell3", "rdf:rest", "v:cell4"),
      WOQL.add_triple("v:cell4", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell4", "rdf:first", WOQL.string("D")),
      WOQL.add_triple("v:cell4", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Reverse the list in place
    const reverseQuery = WOQL.lib().rdflist_reverse(listHead);
    await client.query(reverseQuery);

    // Read the list values after reversal using path query (returns ordered by hops)
    const readQuery = WOQL.and(
      WOQL.path(listHead, "rdf:rest*", "v:node", "v:path"),
      WOQL.length("v:path", "v:pos"),
      WOQL.triple("v:node", "rdf:first", "v:val")
    );
    const readResult = await client.query(WOQL.order_by("v:pos", readQuery));

    // Collect values from all bindings in order
    const extracted = readResult?.bindings
      ?.map((b: any) => (b["val"] || b["v:val"])?.["@value"])
      ?.filter((v: any) => v !== undefined);

    // Should be [D, C, B, A] after in-place reversal
    expect(extracted).toEqual(["D", "C", "B", "A"]);
  });

  test("WOQL.lib.rdflist_reverse: reverse a 2-element list in place", async () => {
    // Create list: [X, Y]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell2"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("X")),
      WOQL.add_triple("v:cell1", "rdf:rest", "v:cell2"),
      WOQL.add_triple("v:cell2", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell2", "rdf:first", WOQL.string("Y")),
      WOQL.add_triple("v:cell2", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Reverse the list in place
    const reverseQuery = WOQL.lib().rdflist_reverse(listHead);
    await client.query(reverseQuery);

    // Read the list values after reversal using path query
    const readQuery = WOQL.and(
      WOQL.path(listHead, "rdf:rest*", "v:node", "v:path"),
      WOQL.length("v:path", "v:pos"),
      WOQL.triple("v:node", "rdf:first", "v:val")
    );
    const readResult = await client.query(WOQL.order_by("v:pos", readQuery));

    const extracted = readResult?.bindings
      ?.map((b: any) => (b["val"] || b["v:val"])?.["@value"])
      ?.filter((v: any) => v !== undefined);

    // Should be [Y, X] after in-place reversal
    expect(extracted).toEqual(["Y", "X"]);
  });

  test("WOQL.lib.rdflist_reverse: reverse a single-element list in place", async () => {
    // Create list: [Only]
    const createQuery = WOQL.and(
      WOQL.idgen_random("terminusdb://data/Cons/", "v:cell1"),
      WOQL.add_triple("v:cell1", "rdf:type", "rdf:List"),
      WOQL.add_triple("v:cell1", "rdf:first", WOQL.string("Only")),
      WOQL.add_triple("v:cell1", "rdf:rest", "rdf:nil")
    );

    const createResult = await client.query(createQuery);
    const listHead =
      createResult?.bindings?.[0]?.["cell1"] ||
      createResult?.bindings?.[0]?.["v:cell1"];

    // Reverse the list in place
    const reverseQuery = WOQL.lib().rdflist_reverse(listHead);
    await client.query(reverseQuery);

    // Read the list values after reversal using path query
    const readQuery = WOQL.and(
      WOQL.path(listHead, "rdf:rest*", "v:node", "v:path"),
      WOQL.length("v:path", "v:pos"),
      WOQL.triple("v:node", "rdf:first", "v:val")
    );
    const readResult = await client.query(WOQL.order_by("v:pos", readQuery));

    const extracted = readResult?.bindings
      ?.map((b: any) => (b["val"] || b["v:val"])?.["@value"])
      ?.filter((v: any) => v !== undefined);

    // Should be [Only] (same as original) after in-place reversal
    expect(extracted).toEqual(["Only"]);
  });

  afterAll(async () => {
    try {
      await client.deleteDatabase(testDb);
      delete (global as any).testListHead;
    } catch (e) {
      // Ignore errors
    }
  });
});
