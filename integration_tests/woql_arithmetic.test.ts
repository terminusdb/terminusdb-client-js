//@ts-check
import { describe, expect, test, beforeAll } from '@jest/globals';
import { WOQLClient, WOQL } from '../index.js';
import { DbDetails } from '../dist/typescript/lib/typedef.js';
import { Vars } from '../lib/woql.js';

let client: WOQLClient //= new WOQLClient('http://127.0.0.1:6363');
const db01 = 'db__test_woql_arithmetic';

beforeAll(() => {
  client = new WOQLClient("http://127.0.0.1:6363", { user: 'admin', organization: 'admin', key: process.env.TDB_ADMIN_PASS ?? 'root' })
  client.db(db01);
});


describe('Tests for woql arithmetic', () => {
  test('Create a database', async () => {
    const dbObj: DbDetails = { label: db01, comment: 'add db', schema: true }
    const result = await client.createDatabase(db01, dbObj);
    //woqlClient return only the data no status
    expect(result["@type"]).toEqual("api:DbCreateResponse");
    expect(result["api:status"]).toEqual("api:success");
  });

  test('Test simple arithmetic with vars variables handling', async () => {
    let v = Vars("result");
    const query = WOQL.limit(100).eval(WOQL.times(2, 3), v.result);

    const expectedJson = [{"result": {"@type": "xsd:decimal", "@value": 6}}];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  test('Test simple arithmetic with string variable handling', async () => {
    const query = WOQL.limit(100).eval(WOQL.times(2, 3), "v:result");

    const expectedJson = [{"result": {"@type": "xsd:decimal", "@value": 6}}];
    
    const result = await client.query(query);
    expect(result?.bindings).toStrictEqual(expectedJson);
  });

  test('Delete a database', async () => {
    const result = await client.deleteDatabase(db01);
    expect(result).toStrictEqual({ '@type': 'api:DbDeleteResponse', 'api:status': 'api:success' });
  });
});
