# Remote Operations API

This document describes the native support for TerminusDB remotes handling in the JavaScript client.

## Overview

Remotes in TerminusDB are named connections to remote databases that enable clone, push, pull, and fetch operations. The JavaScript client provides native CRUD operations for managing remotes.

## API Methods

### createRemote(remoteName, remoteLocation)

Creates a new remote connection for the current database.

**Parameters:**
- `remoteName` (string, required): The name of the remote to create
- `remoteLocation` (string, required): The URL of the remote repository

**Returns:** Promise that resolves to the API response

**Example:**
```javascript
const client = new WOQLClient('http://localhost:6363', {
  user: 'admin',
  organization: 'admin',
  key: 'root'
});

client.db('mydb');

// Create a remote named 'origin'
await client.createRemote('origin', 'http://remote.server.com/admin/mydb');
```

**Response:**
```json
{
  "@type": "api:RemoteAddedResponse",
  "api:status": "api:success"
}
```

---

### getRemote(remoteName)

Retrieves information about an existing remote connection.

**Parameters:**
- `remoteName` (string, required): The name of the remote to retrieve

**Returns:** Promise that resolves to remote details

**Example:**
```javascript
const remote = await client.getRemote('origin');
console.log(remote.remote_url); 
// Output: "http://remote.server.com/admin/mydb"
```

**Response:**
```json
{
  "remote_url": "http://remote.server.com/admin/mydb"
}
```

---

### updateRemote(remoteName, remoteLocation)

Updates an existing remote connection with a new URL.

**Parameters:**
- `remoteName` (string, required): The name of the remote to update
- `remoteLocation` (string, required): The new URL for the remote repository

**Returns:** Promise that resolves to the API response

**Example:**
```javascript
// Update the 'origin' remote to a new location
await client.updateRemote('origin', 'http://new-server.com/admin/mydb');
```

**Response:**
```json
{
  "@type": "api:RemoteUpdatedResponse",
  "api:status": "api:success"
}
```

---

### deleteRemote(remoteName)

Deletes an existing remote connection.

**Parameters:**
- `remoteName` (string, required): The name of the remote to delete

**Returns:** Promise that resolves to the API response

**Example:**
```javascript
// Delete the 'origin' remote
await client.deleteRemote('origin');
```

**Response:**
```json
{
  "@type": "api:RemoteDeletedResponse",
  "api:status": "api:success"
}
```

---

## Complete Workflow Example

```javascript
const { WOQLClient } = require('@terminusdb/terminusdb-client');

async function manageRemotes() {
  // Initialize client
  const client = new WOQLClient('http://localhost:6363', {
    user: 'admin',
    organization: 'admin',
    key: 'root'
  });

  // Set database context
  client.db('mydb');

  try {
    // Create a new remote
    console.log('Creating remote...');
    await client.createRemote('origin', 'http://remote.server.com/admin/mydb');
    
    // Get remote details
    console.log('Fetching remote details...');
    const remote = await client.getRemote('origin');
    console.log('Remote URL:', remote.remote_url);
    
    // Update remote URL
    console.log('Updating remote...');
    await client.updateRemote('origin', 'http://new-server.com/admin/mydb');
    
    // Verify update
    const updatedRemote = await client.getRemote('origin');
    console.log('Updated URL:', updatedRemote.remote_url);
    
    // Use the remote for push/pull operations
    console.log('Pulling from remote...');
    await client.pull({
      remote: 'origin',
      remote_branch: 'main',
      message: 'Pulling latest changes'
    });
    
    // Delete remote when no longer needed
    console.log('Deleting remote...');
    await client.deleteRemote('origin');
    
    console.log('Remote operations completed successfully!');
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

manageRemotes();
```

---

## Multiple Remotes

You can create and manage multiple remotes for the same database:

```javascript
// Create multiple remotes
await client.createRemote('origin', 'http://main-server.com/admin/mydb');
await client.createRemote('backup', 'http://backup-server.com/admin/mydb');
await client.createRemote('staging', 'http://staging-server.com/admin/mydb');

// Pull from different remotes
await client.pull({
  remote: 'origin',
  remote_branch: 'main',
  message: 'Sync with origin'
});

await client.pull({
  remote: 'staging',
  remote_branch: 'dev',
  message: 'Sync with staging'
});

// Push to specific remote
await client.push({
  remote: 'backup',
  remote_branch: 'main',
  message: 'Backup current state'
});
```

---

## Error Handling

All remote methods validate their parameters and provide meaningful error messages:

```javascript
try {
  // Invalid remote name (empty string)
  await client.createRemote('', 'http://example.com');
} catch (error) {
  console.error(error.message);
  // Output: "Create remote parameter error - you must specify a valid remote name"
}

try {
  // Invalid remote location (null)
  await client.createRemote('origin', null);
} catch (error) {
  console.error(error.message);
  // Output: "Create remote parameter error - you must specify a valid remote location URL"
}

try {
  // Remote doesn't exist
  await client.getRemote('nonexistent');
} catch (error) {
  console.error(error.message);
  // Output: API error from server
}

try {
  // Duplicate remote name
  await client.createRemote('origin', 'http://example.com');
  await client.createRemote('origin', 'http://another.com'); // Will fail
} catch (error) {
  console.error(error.message);
  // Output: API error about duplicate remote
}
```

---

## URL Formats

Remote URLs should follow the standard TerminusDB database URL format:

```
http(s)://[host]:[port]/[organization]/[database]
```

**Examples:**
- `http://localhost:6363/admin/mydb`
- `https://cloud.terminusdb.com/myorg/mydb`
- `http://192.168.1.100:6363/company/projectdb`

---

## Integration with Pull/Push/Fetch

Once remotes are created, use them with existing version control operations:

```javascript
// Create remote
await client.createRemote('origin', 'http://remote.server.com/admin/mydb');

// Pull from remote
await client.pull({
  remote: 'origin',
  remote_branch: 'main',
  message: 'Pulling changes from origin'
});

// Push to remote
await client.push({
  remote: 'origin',
  remote_branch: 'main',
  message: 'Pushing changes to origin'
});

// Fetch from remote
await client.fetch('origin');
```

---

## Context Awareness

Remote operations respect the current client context:

```javascript
const client = new WOQLClient('http://localhost:6363', {
  user: 'admin',
  organization: 'admin',
  key: 'root'
});

// Set database context
client.db('database1');

// Remote created for database1
await client.createRemote('origin', 'http://example.com/org/db1');

// Switch database context
client.db('database2');

// Remote created for database2 (independent from database1's remotes)
await client.createRemote('origin', 'http://example.com/org/db2');
```

---

## Best Practices

1. **Use descriptive remote names**: Choose names that clearly indicate the remote's purpose
   ```javascript
   await client.createRemote('production', 'https://prod.example.com/org/db');
   await client.createRemote('staging', 'https://staging.example.com/org/db');
   await client.createRemote('backup', 'https://backup.example.com/org/db');
   ```

2. **Verify remote existence before operations**:
   ```javascript
   try {
     await client.getRemote('origin');
     // Remote exists, proceed with operations
   } catch (error) {
     // Remote doesn't exist, create it
     await client.createRemote('origin', remoteUrl);
   }
   ```

3. **Clean up unused remotes**:
   ```javascript
   // Delete temporary remotes
   await client.deleteRemote('temporary_remote');
   ```

4. **Handle errors gracefully**:
   ```javascript
   async function safeRemoteOperation() {
     try {
       await client.createRemote('origin', remoteUrl);
       return { success: true };
     } catch (error) {
       console.error('Failed to create remote:', error.message);
       return { success: false, error: error.message };
     }
   }
   ```

---

## Backward Compatibility

The new remote methods are fully backward compatible. Existing code using `sendCustomRequest` for remote operations will continue to work:

```javascript
// Old approach (still works)
await client.sendCustomRequest('POST', '/api/remote/admin/mydb/local/origin', {
  remote_url: 'http://example.com'
});

// New approach (recommended)
await client.createRemote('origin', 'http://example.com');
```

---

## TypeScript Support

All remote methods include full TypeScript type definitions:

```typescript
interface WOQLClient {
  createRemote(remoteName: string, remoteLocation: string): Promise<any>;
  getRemote(remoteName: string): Promise<any>;
  updateRemote(remoteName: string, remoteLocation: string): Promise<any>;
  deleteRemote(remoteName: string): Promise<any>;
}
```

---

## Testing

The remote operations include comprehensive test coverage:

- **Unit tests**: `test/remoteOperations.spec.js` (28 tests)
- **Integration tests**: `integration_tests/remote_operations.test.ts` (30+ tests)

Run tests with:
```bash
npm test -- test/remoteOperations.spec.js
```

---

## Related Methods

- `pull(remoteSourceRepo)`: Pull changes from a remote
- `push(remoteTargetRepo)`: Push changes to a remote
- `fetch(remoteName)`: Fetch commits from a remote
- `clone(cloneSource, newDbId)`: Clone a remote database

---

## Support

For issues or questions about remote operations:
- GitHub Issues: https://github.com/terminusdb/terminusdb-client-js/issues
- Documentation: https://terminusdb.com/docs/
- Discord: https://discord.gg/terminusdb
