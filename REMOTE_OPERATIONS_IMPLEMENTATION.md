# Remote Operations Implementation Details

## Summary

Native remote operations support has been implemented in the TerminusDB JavaScript client based on the OpenAPI specification from the CleoDB repository.

## Implementation

### API Endpoints (from OpenAPI spec)

Based on `/Users/hoijnet/Code/terminusdb/cleodb/docs/openapi.yaml`:

**POST `/remote/{path}`** - Create a new remote
- Path parameter: `branch_path` (e.g., `admin/test/local/branch/foo`)
- Request body:
  ```json
  {
    "remote_name": "origin",
    "remote_location": "http://cloud.terminusdb.com/org/db"
  }
  ```
- Response: `{ "@type": "api:RemoteResponse", "api:status": "api:success" }`

**GET `/remote/{path}?remote_name=origin`** - Get remote details  
- Path parameter: `branch_path`
- Query parameter: `remote_name`
- Response:
  ```json
  {
    "@type": "api:RemoteResponse",
    "api:remote_name": "origin",
    "api:remote_url": "http://cloud.terminusdb.com/org/db",
    "api:status": "api:success"
  }
  ```

**PUT `/remote/{path}`** - Update a remote
- Path parameter: `branch_path`
- Request body:
  ```json
  {
    "remote_name": "origin",
    "remote_location": "http://new-cloud.terminusdb.com/org/db"
  }
  ```
- Response: `{ "@type": "api:RemoteResponse", "api:status": "api:success" }`

**DELETE `/remote/{path}?remote_name=origin`** - Delete a remote
- Path parameter: `branch_path`
- Query parameter: `remote_name`
- Response: `{ "@type": "api:RemoteResponse", "api:status": "api:success" }`

### Client Methods

```javascript
// ConnectionConfig - URL generation
ConnectionConfig.prototype.remoteURL()
// Returns: http://server/api/remote/org/db/local/branch/main

// WOQLClient - CRUD operations
WOQLClient.prototype.createRemote(remoteName, remoteLocation)
WOQLClient.prototype.getRemote(remoteName)
WOQLClient.prototype.updateRemote(remoteName, remoteLocation)
WOQLClient.prototype.deleteRemote(remoteName)
```

### Key Design Decisions

1. **URL Structure**: Uses `branchBase('remote')` to include the full branch path as required by the API
2. **Payload Format**: POST/PUT send `{ remote_name, remote_location }` in body
3. **Query Parameters**: GET/DELETE use `?remote_name=` query parameter
4. **Error Handling**: All methods validate parameters before making API calls

## Testing

### Unit Tests (`test/remoteOperations.spec.js`)
- 28 tests covering all CRUD operations
- Parameter validation
- URL generation
- Mock API responses
- ✅ All passing

### Integration Tests (`integration_tests/remote_operations.test.ts`)
- 29 tests for real server interaction
- Complete CRUD workflows  
- Multiple remotes
- Special characters handling
- Error scenarios

**Note**: Integration tests require a TerminusDB server with full remote API support. Some tests may fail on older server versions that don't fully implement the `/api/remote/` endpoint.

## Server Compatibility

The remote API was added in TerminusDB/CleoDB and may not be available in all versions. To check if your server supports remotes:

```javascript
try {
  await client.createRemote('test', 'http://example.com/org/db');
  console.log('Remote API supported');
} catch (error) {
  if (error.message.includes('Bad descriptor path')) {
    console.log('Server does not fully support remote API yet');
  }
}
```

## OpenAPI Reference

Full API specification: `/Users/hoijnet/Code/terminusdb/cleodb/docs/openapi.yaml`  
Lines 864-1013 contain the remote endpoint definitions.

## Files Modified

- `lib/connectionConfig.js` - Added `remoteURL()` method
- `lib/const.js` - Added remote operation constants
- `lib/woqlClient.js` - Added 4 CRUD methods
- `test/remoteOperations.spec.js` - 28 unit tests
- `integration_tests/remote_operations.test.ts` - 29 integration tests
- `REMOTE_OPERATIONS.md` - User-facing documentation
