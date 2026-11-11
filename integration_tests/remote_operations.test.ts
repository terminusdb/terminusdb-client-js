//@ts-check
import {describe, expect, test, beforeAll, afterAll} from '@jest/globals';
import {WOQLClient} from '../index.js';

let client: WOQLClient;
let testDbName: string;

// Note: These tests require a TerminusDB server that supports the remote API

beforeAll(() => {
  client = new WOQLClient("http://127.0.0.1:6363", {
    user: 'admin',
    organization: 'admin',
    key: process.env.TDB_ADMIN_PASS ?? 'root'
  });
  testDbName = `remote_test_${Date.now()}`;
});

afterAll(async () => {
  // Clean up test database
  try {
    await client.deleteDatabase(testDbName);
  } catch (e) {
    // Database might not exist, that's okay
  }
});

describe('Remote Operations', () => {
  const remoteName = 'test_remote';
  const remoteUrl = 'http://example.com/admin/test_db';
  const updatedRemoteUrl = 'http://updated.example.com/admin/test_db';

  beforeAll(async () => {
    // Create a test database for remote operations
    await client.createDatabase(testDbName, {
      label: 'Remote Test Database',
      comment: 'Database for testing remote operations',
      schema: true
    });
    client.db(testDbName);
  }, 15000);

  describe('createRemote', () => {
    test('should create a new remote successfully', async () => {
      const result = await client.createRemote(remoteName, remoteUrl);
      expect(result).toBeDefined();
      expect(result['@type']).toEqual('api:RemoteResponse');
      expect(result['api:status']).toEqual('api:success');
    });

    test('should reject when remoteName is missing', async () => {
      await expect(client.createRemote('', remoteUrl)).rejects.toThrow(
        'Create remote parameter error'
      );
    });

    test('should reject when remoteName is not a string', async () => {
      await expect(client.createRemote(null as any, remoteUrl)).rejects.toThrow(
        'Create remote parameter error'
      );
    });

    test('should reject when remoteLocation is missing', async () => {
      await expect(client.createRemote('test', '')).rejects.toThrow(
        'Create remote parameter error'
      );
    });

    test('should reject when remoteLocation is not a string', async () => {
      await expect(client.createRemote('test', null as any)).rejects.toThrow(
        'Create remote parameter error'
      );
    });

    test('should reject when creating duplicate remote', async () => {
      // Remote already exists from first test
      await expect(client.createRemote(remoteName, remoteUrl)).rejects.toThrow();
    });
  });

  describe('getRemote', () => {
    test('should retrieve an existing remote', async () => {
      const result = await client.getRemote(remoteName);
      expect(result).toBeDefined();
      expect(result['@type']).toEqual('api:RemoteResponse');
      expect(result['api:remote_name']).toEqual(remoteName);
      expect(result['api:remote_url']).toEqual(remoteUrl);
    });

    test('should reject when remoteName is missing', async () => {
      await expect(client.getRemote('')).rejects.toThrow(
        'Get remote parameter error'
      );
    });

    test('should reject when remoteName is not a string', async () => {
      await expect(client.getRemote(null as any)).rejects.toThrow(
        'Get remote parameter error'
      );
    });

    test('should reject when remote does not exist', async () => {
      await expect(client.getRemote('nonexistent_remote')).rejects.toThrow();
    });
  });

  describe('updateRemote', () => {
    test('should update an existing remote successfully', async () => {
      const result = await client.updateRemote(remoteName, updatedRemoteUrl);
      expect(result).toBeDefined();
      expect(result['@type']).toEqual('api:RemoteResponse');
      expect(result['api:status']).toEqual('api:success');
    });

    test('should verify remote was updated', async () => {
      const result = await client.getRemote(remoteName);
      expect(result['api:remote_url']).toEqual(updatedRemoteUrl);
    });

    test('should reject when remoteName is missing', async () => {
      await expect(client.updateRemote('', updatedRemoteUrl)).rejects.toThrow(
        'Update remote parameter error'
      );
    });

    test('should reject when remoteName is not a string', async () => {
      await expect(client.updateRemote(null as any, updatedRemoteUrl)).rejects.toThrow(
        'Update remote parameter error'
      );
    });

    test('should reject when remoteLocation is missing', async () => {
      await expect(client.updateRemote(remoteName, '')).rejects.toThrow(
        'Update remote parameter error'
      );
    });

    test('should reject when remoteLocation is not a string', async () => {
      await expect(client.updateRemote(remoteName, null as any)).rejects.toThrow(
        'Update remote parameter error'
      );
    });

    test('should reject when updating non-existent remote', async () => {
      await expect(
        client.updateRemote('nonexistent_remote', updatedRemoteUrl)
      ).rejects.toThrow();
    });
  });

  describe('deleteRemote', () => {
    test('should delete an existing remote successfully', async () => {
      const result = await client.deleteRemote(remoteName);
      expect(result).toBeDefined();
      expect(result['@type']).toEqual('api:RemoteResponse');
      expect(result['api:status']).toEqual('api:success');
    });

    test('should verify remote was deleted', async () => {
      await expect(client.getRemote(remoteName)).rejects.toThrow();
    });

    test('should reject when remoteName is missing', async () => {
      await expect(client.deleteRemote('')).rejects.toThrow(
        'Delete remote parameter error'
      );
    });

    test('should reject when remoteName is not a string', async () => {
      await expect(client.deleteRemote(null as any)).rejects.toThrow(
        'Delete remote parameter error'
      );
    });

    test('should reject when deleting non-existent remote', async () => {
      await expect(client.deleteRemote('nonexistent_remote')).rejects.toThrow();
    });
  });

  describe('Remote operations workflow', () => {
    const workflowRemote = 'workflow_remote';
    const workflowUrl = 'http://workflow.example.com/admin/test';

    test('should support complete CRUD workflow', async () => {
      // Create
      const createResult = await client.createRemote(workflowRemote, workflowUrl);
      expect(createResult['@type']).toEqual('api:RemoteResponse');
      expect(createResult['api:status']).toEqual('api:success');

      // Read
      let getResult = await client.getRemote(workflowRemote);
      expect(getResult['api:remote_url']).toEqual(workflowUrl);

      // Update
      const newUrl = 'http://new-workflow.example.com/admin/test';
      const updateResult = await client.updateRemote(workflowRemote, newUrl);
      expect(updateResult['@type']).toEqual('api:RemoteResponse');
      expect(updateResult['api:status']).toEqual('api:success');

      // Verify update
      getResult = await client.getRemote(workflowRemote);
      expect(getResult['api:remote_url']).toEqual(newUrl);

      // Delete
      const deleteResult = await client.deleteRemote(workflowRemote);
      expect(deleteResult['@type']).toEqual('api:RemoteResponse');
      expect(deleteResult['api:status']).toEqual('api:success');

      // Verify deletion
      await expect(client.getRemote(workflowRemote)).rejects.toThrow();
    });

    test('should handle special characters in remote names', async () => {
      const specialRemote = 'remote-with-dashes_and_underscores';
      const url = 'http://example.com/org/db';

      await client.createRemote(specialRemote, url);
      const result = await client.getRemote(specialRemote);
      expect(result['api:remote_url']).toEqual(url);
      await client.deleteRemote(specialRemote);
    });

    test('should handle URLs with different protocols', async () => {
      const httpsRemote = 'https_remote';
      const httpsUrl = 'https://secure.example.com/admin/db';

      await client.createRemote(httpsRemote, httpsUrl);
      const result = await client.getRemote(httpsRemote);
      expect(result['api:remote_url']).toEqual(httpsUrl);
      await client.deleteRemote(httpsRemote);
    });

    test('should handle URLs with ports', async () => {
      const portRemote = 'port_remote';
      const portUrl = 'http://example.com:6363/admin/db';

      await client.createRemote(portRemote, portUrl);
      const result = await client.getRemote(portRemote);
      expect(result['api:remote_url']).toEqual(portUrl);
      await client.deleteRemote(portRemote);
    });

    test('should handle URLs with paths', async () => {
      const pathRemote = 'path_remote';
      const pathUrl = 'http://example.com/path/to/org/db';

      await client.createRemote(pathRemote, pathUrl);
      const result = await client.getRemote(pathRemote);
      expect(result['api:remote_url']).toEqual(pathUrl);
      await client.deleteRemote(pathRemote);
    });
  });

  describe('Multiple remotes', () => {
    test('should support multiple remotes for same database', async () => {
      const remote1 = 'origin';
      const remote2 = 'backup';
      const remote3 = 'staging';

      const url1 = 'http://origin.example.com/admin/db';
      const url2 = 'http://backup.example.com/admin/db';
      const url3 = 'http://staging.example.com/admin/db';

      // Create multiple remotes
      await client.createRemote(remote1, url1);
      await client.createRemote(remote2, url2);
      await client.createRemote(remote3, url3);

      // Verify all remotes exist
      const result1 = await client.getRemote(remote1);
      expect(result1['api:remote_url']).toEqual(url1);

      const result2 = await client.getRemote(remote2);
      expect(result2['api:remote_url']).toEqual(url2);

      const result3 = await client.getRemote(remote3);
      expect(result3['api:remote_url']).toEqual(url3);

      // Clean up
      await client.deleteRemote(remote1);
      await client.deleteRemote(remote2);
      await client.deleteRemote(remote3);
    });

    test('should allow independent updates to different remotes', async () => {
      const remote1 = 'remote_a';
      const remote2 = 'remote_b';
      const url1 = 'http://a.example.com/admin/db';
      const url2 = 'http://b.example.com/admin/db';
      const newUrl1 = 'http://new-a.example.com/admin/db';

      await client.createRemote(remote1, url1);
      await client.createRemote(remote2, url2);

      // Update only remote1
      await client.updateRemote(remote1, newUrl1);

      // Verify remote1 was updated
      const result1 = await client.getRemote(remote1);
      expect(result1['api:remote_url']).toEqual(newUrl1);

      // Verify remote2 unchanged
      const result2 = await client.getRemote(remote2);
      expect(result2['api:remote_url']).toEqual(url2);

      // Clean up
      await client.deleteRemote(remote1);
      await client.deleteRemote(remote2);
    });
  });
});
