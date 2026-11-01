/**
 * Shared test utilities for integration tests
 * 
 * This module provides common setup and teardown functions to avoid
 * code duplication across integration test files.
 * 
 * Uses a shared database with per-test-suite branches for faster test isolation.
 */

import { WOQLClient } from "../index.js";
import { DbDetails } from "../dist/typescript/lib/typedef.js";

/**
 * Default server configuration for tests
 */
export const TEST_SERVER_URL = "http://127.0.0.1:6363";
export const TEST_USER = "admin";
export const TEST_ORG = "admin";
export const SHARED_TEST_DB = "db__integration_tests";

/**
 * Creates a WOQLClient configured for testing
 */
export function createTestClient(): WOQLClient {
  return new WOQLClient(TEST_SERVER_URL, {
    user: TEST_USER,
    organization: TEST_ORG,
    key: process.env.TDB_ADMIN_PASS ?? "root"
  });
}

/**
 * Points the client at the shared test database.
 *
 * The database is created by globalSetup.ts (runs once, sequentially,
 * before any parallel worker starts), so no creation logic is needed here.
 */
export async function ensureSharedDatabase(client: WOQLClient): Promise<void> {
  client.db(SHARED_TEST_DB);
}

/**
 * Cleans up a branch if it exists (safe to call if it doesn't exist)
 */
export async function cleanupBranch(client: WOQLClient, branchName: string): Promise<void> {
  try {
    await client.deleteBranch(branchName);
  } catch (_e) {
    // Branch doesn't exist, which is fine
  }
}

/**
 * Sets up a test branch in the shared database
 * Cleans up any existing branch first, then creates a fresh one
 * 
 * @param client - The WOQLClient instance
 * @param branchName - The name of the branch to create
 * @returns The result of branch()
 */
export async function setupTestBranch(
  client: WOQLClient,
  branchName: string
): Promise<any> {
  // Ensure shared database exists
  await ensureSharedDatabase(client);
  
  // Clean up any existing branch from previous failed runs
  await cleanupBranch(client, branchName);
  
  // Create a new branch from empty (not from main, to get clean state)
  const result = await client.branch(branchName, true);
  
  // Switch to the new branch
  client.checkout(branchName);
  
  return result;
}

/**
 * Tears down a test branch
 * Safe to call even if the branch doesn't exist
 */
export async function teardownTestBranch(client: WOQLClient, branchName: string): Promise<void> {
  // Switch back to main before deleting
  client.checkout("main");
  await cleanupBranch(client, branchName);
}

/**
 * Cleans up a database if it exists (safe to call if it doesn't exist)
 * This is useful for cleaning up leftover databases from failed test runs
 * 
 * @param client - The WOQLClient instance
 * @param dbName - The name of the database to clean up
 */
export async function cleanupDatabase(client: WOQLClient, dbName: string): Promise<void> {
  try {
    await client.deleteDatabase(dbName);
  } catch (_e) {
    // Database doesn't exist, which is fine
  }
}

/**
 * Sets up a test database with optional schema
 * Cleans up any existing database first, then creates a fresh one
 * 
 * @param client - The WOQLClient instance
 * @param dbName - The name of the database to create
 * @param options - Optional configuration for the database
 * @returns The result of createDatabase
 */
export async function setupTestDatabase(
  client: WOQLClient,
  dbName: string,
  options: Partial<DbDetails> = {}
): Promise<any> {
  // Clean up any existing database from previous failed runs
  await cleanupDatabase(client, dbName);
  
  // Set up the client to use this database
  client.db(dbName);
  
  // Create the database with default options merged with provided options
  const dbObj: DbDetails = {
    label: dbName,
    comment: options.comment || `Test database: ${dbName}`,
    schema: options.schema ?? true,
    ...options
  };
  
  return client.createDatabase(dbName, dbObj);
}

/**
 * Tears down a test database
 * Safe to call even if the database doesn't exist
 * 
 * @param client - The WOQLClient instance
 * @param dbName - The name of the database to delete
 */
export async function teardownTestDatabase(client: WOQLClient, dbName: string): Promise<void> {
  await cleanupDatabase(client, dbName);
}

/**
 * Helper to run beforeAll setup for a standard integration test
 * Creates the client and cleans up any existing database
 * 
 * @param dbName - The database name for this test suite
 * @returns Object with client that will be initialized
 */
export function createTestSetup(dbName: string): {
  client: WOQLClient;
  beforeAllFn: () => Promise<void>;
  afterAllFn: () => Promise<void>;
} {
  let client: WOQLClient;
  
  return {
    get client() {
      return client;
    },
    beforeAllFn: async () => {
      client = createTestClient();
      client.db(dbName);
      await cleanupDatabase(client, dbName);
    },
    afterAllFn: async () => {
      await cleanupDatabase(client, dbName);
    }
  };
}
