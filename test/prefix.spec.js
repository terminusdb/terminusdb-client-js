const { expect } = require('chai');
const { WOQLClient } = require('../index');

describe('Prefix Management', function () {
  this.timeout(10000);

  const SERVER_URL = process.env.TERMINUSDB_SERVER_URL || 'http://127.0.0.1:6363';
  const USER = 'admin';
  const PASSWORD = 'root';
  
  let client;
  let testDbName;

  beforeEach(async function () {
    client = new WOQLClient(SERVER_URL, { user: USER, key: PASSWORD, organization: USER });
    testDbName = `test_prefix_${Date.now()}`;
    
    // Create test database
    await client.createDatabase(testDbName, {
      label: 'Test Prefix DB',
      comment: 'Database for testing prefix operations'
    });
    client.db(testDbName);
  });

  afterEach(async function () {
    try {
      await client.deleteDatabase(testDbName);
    } catch (err) {
      // Ignore errors during cleanup
    }
  });

  describe('addPrefix', function () {
    it('should add a new prefix successfully', async function () {
      const result = await client.addPrefix('ex', 'http://example.org/');
      expect(result).to.have.property('api:status', 'api:success');
      expect(result).to.have.property('api:prefix_name', 'ex');
      expect(result).to.have.property('api:prefix_uri', 'http://example.org/');
    });

    it('should fail when adding duplicate prefix', async function () {
      await client.addPrefix('ex', 'http://example.org/');
      try {
        await client.addPrefix('ex', 'http://example.com/');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.data).to.have.property('api:status', 'api:failure');
        expect(err.data['api:error']).to.have.property('@type', 'api:PrefixAlreadyExists');
      }
    });

    it('should fail with invalid IRI', async function () {
      try {
        await client.addPrefix('ex', 'not-a-valid-uri');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.data).to.have.property('api:status', 'api:failure');
        expect(err.data['api:error']).to.have.property('@type', 'api:InvalidIRI');
      }
    });

    it('should fail with reserved prefix name', async function () {
      try {
        await client.addPrefix('@custom', 'http://example.org/');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.data).to.have.property('api:status', 'api:failure');
        expect(err.data['api:error']).to.have.property('@type', 'api:ReservedPrefix');
      }
    });
  });

  describe('getPrefix', function () {
    it('should retrieve an existing prefix', async function () {
      await client.addPrefix('ex', 'http://example.org/');
      const uri = await client.getPrefix('ex');
      expect(uri).to.equal('http://example.org/');
    });

    it('should fail when prefix does not exist', async function () {
      try {
        await client.getPrefix('nonexistent');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.status).to.equal(404);
      }
    });
  });

  describe('updatePrefix', function () {
    it('should update an existing prefix', async function () {
      await client.addPrefix('ex', 'http://example.org/');
      const result = await client.updatePrefix('ex', 'http://example.com/');
      expect(result).to.have.property('api:status', 'api:success');
      expect(result).to.have.property('api:prefix_uri', 'http://example.com/');
      
      // Verify the update
      const uri = await client.getPrefix('ex');
      expect(uri).to.equal('http://example.com/');
    });

    it('should fail when prefix does not exist', async function () {
      try {
        await client.updatePrefix('nonexistent', 'http://example.org/');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.status).to.equal(404);
      }
    });
  });

  describe('upsertPrefix', function () {
    it('should create prefix if it does not exist', async function () {
      const result = await client.upsertPrefix('ex', 'http://example.org/');
      expect(result).to.have.property('api:status', 'api:success');
      expect(result).to.have.property('api:prefix_uri', 'http://example.org/');
    });

    it('should update prefix if it already exists', async function () {
      await client.addPrefix('ex', 'http://example.org/');
      const result = await client.upsertPrefix('ex', 'http://example.com/');
      expect(result).to.have.property('api:status', 'api:success');
      expect(result).to.have.property('api:prefix_uri', 'http://example.com/');
    });
  });

  describe('deletePrefix', function () {
    it('should delete an existing prefix', async function () {
      await client.addPrefix('ex', 'http://example.org/');
      const result = await client.deletePrefix('ex');
      expect(result).to.have.property('api:status', 'api:success');
      
      // Verify deletion
      try {
        await client.getPrefix('ex');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.status).to.equal(404);
      }
    });

    it('should fail when prefix does not exist', async function () {
      try {
        await client.deletePrefix('nonexistent');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.status).to.equal(404);
      }
    });

    it('should fail when deleting reserved prefix', async function () {
      try {
        await client.deletePrefix('@base');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.data).to.have.property('api:status', 'api:failure');
        expect(err.data['api:error']).to.have.property('@type', 'api:ReservedPrefix');
      }
    });
  });
});
