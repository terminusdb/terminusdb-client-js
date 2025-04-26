//@ts-check
import { describe, expect, test, beforeAll } from '@jest/globals';
import { WOQLClient, WOQL, Vars } from '../index.js';
import { DbDetails } from '../dist/typescript/lib/typedef.js';

let client: WOQLClient
const db01 = 'db__test_woql_regression';

beforeAll(async () => {
  client = new WOQLClient("http://localhost:6363", { user: 'admin', organization: 'admin', key: process.env.TDB_ADMIN_PASS ?? 'root' })
  client.db(db01);
  const dbObj: DbDetails = { label: db01, comment: 'add db', schema: true }
  await client.createDatabase(db01, dbObj);
});

afterAll(async () => {
  await client.deleteDatabase(db01);
});

describe('Tests for woql graph addressing', () => {
  it('should construct correct query for: from instance', async () => {
    const query = WOQL.from('instance').limit(10).eval(WOQL.plus(1, 1), 'v:result');

    const expectedJson = [{ "result": { "@type": "xsd:decimal", "@value": 2 } }];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  it('should construct correct query for: from schema', async () => {
    // This tests corresponds to issue #2077, with incorrect AST, now fixed
    // https://github.com/terminusdb/terminusdb/issues/2077
    let v = Vars("cls");
    const query = WOQL.from("schema")
      .triple(v.cls, "rdf:type", "sys:Class")
    const expectedJson = [];
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  test('should construct correct query for: info', async () => {
    const result = await client.info();
    expect(result["@type"]).toStrictEqual("api:InfoResponse");
  });
});
