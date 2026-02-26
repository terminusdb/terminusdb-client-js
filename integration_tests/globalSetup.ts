/**
 * Jest globalSetup — runs once before any test suite starts.
 *
 * Creates the shared integration-test database so that parallel workers
 * never race on database creation.
 */

import { WOQLClient } from "../index.js";
import { DbDetails } from "../dist/typescript/lib/typedef.js";

const TEST_SERVER_URL = "http://127.0.0.1:6363";
const TEST_USER = "admin";
const TEST_ORG = "admin";
const SHARED_TEST_DB = "db__integration_tests";

module.exports = async function globalSetup() {
  const client = new WOQLClient(TEST_SERVER_URL, {
    user: TEST_USER,
    organization: TEST_ORG,
    key: process.env.TDB_ADMIN_PASS ?? "root"
  });

  const dbs = await client.getDatabases();
  const dbExists = dbs.some(
    (db: any) => db.name === SHARED_TEST_DB
      || db.path === `${TEST_ORG}/${SHARED_TEST_DB}`
  );

  if (!dbExists) {
    const dbObj: DbDetails = {
      label: SHARED_TEST_DB,
      comment: "Shared database for integration tests",
      schema: true
    };
    await client.createDatabase(SHARED_TEST_DB, dbObj);
  }
};
