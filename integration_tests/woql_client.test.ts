//@ts-check
import { describe, expect, test, beforeAll } from '@jest/globals';
import { WOQLClient, WOQL } from '../index.js';
import { DbDetails, DocParamsGet } from '../dist/typescript/lib/typedef.js';
import schemaJson from './persons_schema'
import { mock_employees_limit_1 } from './data/employees_limit1';
import fs from 'fs';

let client: WOQLClient //= new WOQLClient('http://localhost:6363');

beforeAll(() => {
  client = new WOQLClient("http://localhost:6363", { user: 'admin', organization: 'admin', key: process.env.TDB_ADMIN_PASS ?? 'root' })
});

const db01 = 'db__test_woql';

describe('Create a database, schema and insert data', () => {
  test('Create a database', async () => {
    const dbObj: DbDetails = { label: db01, comment: 'add db', schema: true }
    const result = await client.createDatabase(db01, dbObj);
    //woqlClient return only the data no status
    expect(result["@type"]).toEqual("api:DbCreateResponse");
    expect(result["api:status"]).toEqual("api:success");
  });

  test('Create a schema', async () => {
    const result = await client.addDocument(schemaJson, { graph_type: "schema", full_replace: true });
    expect(result).toStrictEqual(["Child", "Person", "Parent"]);
  })

  test('Query with CSV upload from file', async () => {
    const query = WOQL.limit(1).and(
      WOQL.get(
        WOQL.as('Name', 'v:Name')
          .as('Manager', 'v:Manager')
          .as('Title', 'v:Title'),
        WOQL.post("./integration_tests/data/employees.csv")
      ),
    );
    const result = await client.query(query, undefined, undefined, undefined, undefined,);
    expect(result?.bindings).toStrictEqual(mock_employees_limit_1);
  });

  test('Query with CSV upload as resource attachment', async () => {
    const query = WOQL.limit(1).and(
      WOQL.get(
        WOQL.as('Name', 'v:Name')
          .as('Manager', 'v:Manager')
          .as('Title', 'v:Title'),
        WOQL.post("employees.csv")
      ),
    );
    const data = fs.readFileSync('./integration_tests/data/employees.csv');
    const result = await client.query(query, undefined, undefined, undefined, undefined, [{
      filename: "employees.csv",
      data: data,
    }]);
    expect(result?.bindings).toStrictEqual(mock_employees_limit_1);
  });

  test('Get branches from the server (only main)', async () => {
    const result = await client.getBranches();
    expect(result.main["@id"]).toStrictEqual("Branch/main");
    expect(Object.keys(result)).toStrictEqual(["main"]);
  });

  test('Get commits log from the server', async () => {
    const result = await client.getCommitsLog();
    expect(result.length).toStrictEqual(1);
    expect(result[0]["@type"]).toStrictEqual("ValidCommit");
  });

  test('Get prefixes from the server', async () => {
    const result = await client.getPrefixes();
    expect(result).toStrictEqual({"@base": "terminusdb:///data/", "@schema": "terminusdb:///schema#", "@type": "Context"});
  });

  test('Get userOrganisations from the server', async () => {
    const result = (await client.getUserOrganizations()).filter(org => org["@id"] === "Organization/admin");
    expect(result[0]["@id"]).toStrictEqual("Organization/admin");
  });

  test('Delete a database', async () => {
    const result = await client.deleteDatabase(db01);
    expect(result).toStrictEqual({ '@type': 'api:DbDeleteResponse', 'api:status': 'api:success' });
  });
});
