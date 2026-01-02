//@ts-check
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals';
import { DbDetails, DocParamsGet } from '../dist/typescript/lib/typedef';
import schemaJson from './persons_schema'
import { createTestClient, cleanupDatabase } from "./test_utils";

const db01 = 'db__test_create_database';
let client = createTestClient();

beforeAll(async () => {
  await cleanupDatabase(client, db01);
});

describe('Create a database, schema and insert data', () => {
  test('Create a database', async () => {
    const dbObj : DbDetails = { label: db01, comment: 'add db', schema: true }
    const result = await client.createDatabase(db01,dbObj);
    //woqlClient return only the data no status
    expect(result["@type"]).toEqual("api:DbCreateResponse");
    expect(result["api:status"]).toEqual("api:success");
  }, 15000);

  test('Create a schema', async () => {
      const result = await client.addDocument(schemaJson,{graph_type:"schema",full_replace:true});
      expect(result).toStrictEqual(["Child", "Person", "Parent" ]);
  })

  test('Insert Document Child Tom', async () => {
      const person = {"age":"10","name":"Tom","@type":"Child" }
      const result = await client.addDocument(person);
      expect(result).toStrictEqual(["terminusdb:///data/Child/Tom" ]);
  })

  test('Insert Document Child Anna', async () => {
      const person = {"age":"20","name":"Anna","@type":"Child"}
      const result = await client.addDocument(person);
      expect(result).toStrictEqual(["terminusdb:///data/Child/Anna" ]);
  })

  test('Insert Document Parent Tom Senior', async () => {
      const person = {"age":"40","name":"Tom Senior","@type":"Parent" , "has_child":"Child/Tom"}
      const result = await client.addDocument(person);
      expect(result).toStrictEqual(["terminusdb:///data/Parent/Tom%20Senior" ]);
  })

  test('Get document history on an object', async () => {
      const result = await client.getDocumentHistory("Child/Tom");
      expect(result[0].message).toStrictEqual("add a new document");
  })

  test('Query Person by name', async () => {
      const queryTemplate = {"name":"Tom", "@type":"Person" }
      const result = await client.getDocument({query:queryTemplate});
      expect(result).toStrictEqual({ '@id': 'Child/Tom', '@type': 'Child', age: 10, name: 'Tom' });
  })

  test('Query Person by ege', async () => {
      const queryTemplate = {"age":"40", "@type":"Person" }
      const result = await client.getDocument({query:queryTemplate});
      expect(result).toStrictEqual({"@id": "Parent/Tom%20Senior", "age":40,"name":"Tom Senior","@type":"Parent" , "has_child":"Child/Tom"});
  })

  const change_request = "change_request02";

  test('Create Branch change_request', async () => {
    const result = await client.branch(change_request);
    expect(result).toStrictEqual({ '@type': 'api:BranchResponse', 'api:status': 'api:success' });
  })

  test('Checkout Branch change_request', async () => {
    client.checkout(change_request)
    expect(client.checkout()).toStrictEqual(change_request);
  })

  test('Update Child Tom, link Parent', async () => {
    const childTom = { '@id': 'Child/Tom', '@type': 'Child', age: 10, name: 'Tom' , has_parent:"Parent/Tom%20Senior"}
    const result = await client.updateDocument(childTom);
    expect(result).toStrictEqual(["terminusdb:///data/Child/Tom" ]);
  })

  test('Diff beetwen main and change_request branch', async () => {
     const result = await client.getVersionDiff("main",change_request);
      expect(result).toStrictEqual([
        {
          '@id': 'Child/Tom',
          has_parent: {
            '@after': 'Parent/Tom%20Senior',
            '@before': null,
            '@op': 'SwapValue'
          }
        }
      ]);
  })

  test('Checkout Branch change_request', async () => {
    client.checkout("main")
    expect(client.checkout()).toStrictEqual("main");
  })

  test('Merge beetwen main and change_request branch', async () => {
    const result = await client.apply("main", change_request, "merge change_request to main");
    expect(result).toStrictEqual( { '@type': 'api:ApplyResponse', 'api:status': 'api:success' });   
  })

  test('Check if merge worked. Query Person by age in main branch', async () => {
    const queryTemplate = {"age":"10", "@type":"Person" }
    const result = await client.getDocument({query:queryTemplate});
    //console.log(result)
    expect(result).toStrictEqual({
      '@id': 'Child/Tom',
      '@type': 'Child',
      age: 10,
      name: 'Tom',
      has_parent: 'Parent/Tom%20Senior'
    });
  })

  test('Delete a branch', async () => {
    const result = await client.deleteBranch(change_request);
    expect(result).toStrictEqual({ '@type': 'api:BranchResponse', 'api:status': 'api:success' });
  });

});

afterAll(async () => {
  await cleanupDatabase(client, db01);
});
