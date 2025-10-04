const { expect } = require('chai');
const sinon = require('sinon');
const WOQLClient = require('../lib/woqlClient');
const ConnectionConfig = require('../lib/connectionConfig');
const axiosInstance = require('../lib/axiosInstance');

describe('Remote Operations - Unit Tests', () => {
  let client;
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    client = new WOQLClient('http://localhost:6363', {
      user: 'admin',
      organization: 'admin',
      key: 'root'
    });
    client.db('testdb');
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('ConnectionConfig.remoteURL', () => {
    it('should generate correct URL without remote name', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      config.setOrganization('admin');
      config.setDB('testdb');
      
      const url = config.remoteURL();
      expect(url).to.equal('http://localhost:6363/api/remote/admin/testdb/local/branch/main');
    });

    it('should generate correct URL with remote name', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      config.setOrganization('admin');
      config.setDB('testdb');
      
      const url = config.remoteURL('origin');
      expect(url).to.equal('http://localhost:6363/api/remote/admin/testdb/local/branch/main/origin');
    });

    it('should URL encode remote name with special characters', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      config.setOrganization('admin');
      config.setDB('testdb');
      
      const url = config.remoteURL('remote-with-dashes');
      expect(url).to.include('remote-with-dashes');
    });

    it('should handle remote names with spaces', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      config.setOrganization('admin');
      config.setDB('testdb');
      
      const url = config.remoteURL('my remote');
      expect(url).to.include('my%20remote');
    });
  });

  describe('WOQLClient.createRemote', () => {
    it('should call dispatch with correct parameters', async () => {
      const stub = sandbox.stub(axiosInstance, 'post').resolves({
        status: 200,
        data: { '@type': 'api:RemoteResponse' }
      });

      await client.createRemote('origin', 'http://remote.example.com/org/db');

      expect(stub.calledOnce).to.be.true;
      const call = stub.getCall(0);
      expect(call.args[0]).to.include('/api/remote/admin/testdb/local/branch/main');
      expect(call.args[1]).to.deep.equal({
        remote_name: 'origin',
        remote_location: 'http://remote.example.com/org/db'
      });
    });

    it('should reject with invalid remote name', async () => {
      try {
        await client.createRemote('', 'http://example.com');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Create remote parameter error');
      }
    });

    it('should reject with null remote name', async () => {
      try {
        await client.createRemote(null, 'http://example.com');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Create remote parameter error');
      }
    });

    it('should reject with invalid remote location', async () => {
      try {
        await client.createRemote('origin', '');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Create remote parameter error');
      }
    });

    it('should reject with null remote location', async () => {
      try {
        await client.createRemote('origin', null);
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Create remote parameter error');
      }
    });

    it('should reject with non-string remote name', async () => {
      try {
        await client.createRemote(123, 'http://example.com');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Create remote parameter error');
      }
    });

    it('should reject with non-string remote location', async () => {
      try {
        await client.createRemote('origin', 123);
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Create remote parameter error');
      }
    });
  });

  describe('WOQLClient.getRemote', () => {
    it('should call dispatch with correct parameters', async () => {
      const stub = sandbox.stub(axiosInstance, 'get').resolves({
        status: 200,
        data: {
          '@type': 'api:RemoteResponse',
          'api:remote_name': 'origin',
          'api:remote_url': 'http://example.com/org/db'
        }
      });

      await client.getRemote('origin');

      expect(stub.calledOnce).to.be.true;
      const call = stub.getCall(0);
      expect(call.args[0]).to.include('/api/remote/admin/testdb/local/branch/main');
      expect(call.args[0]).to.include('remote_name=origin');
    });

    it('should reject with invalid remote name', async () => {
      try {
        await client.getRemote('');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Get remote parameter error');
      }
    });

    it('should reject with null remote name', async () => {
      try {
        await client.getRemote(null);
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Get remote parameter error');
      }
    });

    it('should reject with non-string remote name', async () => {
      try {
        await client.getRemote(123);
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Get remote parameter error');
      }
    });
  });

  describe('WOQLClient.updateRemote', () => {
    it('should call dispatch with correct parameters', async () => {
      const stub = sandbox.stub(axiosInstance, 'put').resolves({
        status: 200,
        data: { '@type': 'api:RemoteResponse' }
      });

      await client.updateRemote('origin', 'http://new.example.com/org/db');

      expect(stub.calledOnce).to.be.true;
      const call = stub.getCall(0);
      expect(call.args[0]).to.include('/api/remote/admin/testdb/local/branch/main');
      expect(call.args[1]).to.deep.equal({
        remote_name: 'origin',
        remote_location: 'http://new.example.com/org/db'
      });
    });

    it('should reject with invalid remote name', async () => {
      try {
        await client.updateRemote('', 'http://example.com');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Update remote parameter error');
      }
    });

    it('should reject with null remote name', async () => {
      try {
        await client.updateRemote(null, 'http://example.com');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Update remote parameter error');
      }
    });

    it('should reject with invalid remote location', async () => {
      try {
        await client.updateRemote('origin', '');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Update remote parameter error');
      }
    });

    it('should reject with null remote location', async () => {
      try {
        await client.updateRemote('origin', null);
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Update remote parameter error');
      }
    });

    it('should reject with non-string remote name', async () => {
      try {
        await client.updateRemote(123, 'http://example.com');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Update remote parameter error');
      }
    });

    it('should reject with non-string remote location', async () => {
      try {
        await client.updateRemote('origin', 123);
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Update remote parameter error');
      }
    });
  });

  describe('WOQLClient.deleteRemote', () => {
    it('should call dispatch with correct parameters', async () => {
      const stub = sandbox.stub(axiosInstance, 'delete').resolves({
        status: 200,
        data: { '@type': 'api:RemoteResponse' }
      });

      await client.deleteRemote('origin');

      expect(stub.calledOnce).to.be.true;
      const call = stub.getCall(0);
      expect(call.args[0]).to.include('/api/remote/admin/testdb/local/branch/main');
      expect(call.args[0]).to.include('remote_name=origin');
    });

    it('should reject with invalid remote name', async () => {
      try {
        await client.deleteRemote('');
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Delete remote parameter error');
      }
    });

    it('should reject with null remote name', async () => {
      try {
        await client.deleteRemote(null);
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Delete remote parameter error');
      }
    });

    it('should reject with non-string remote name', async () => {
      try {
        await client.deleteRemote(123);
        expect.fail('Should have rejected');
      } catch (error) {
        expect(error.message).to.include('Delete remote parameter error');
      }
    });
  });

  describe('Remote operations with different database contexts', () => {
    it('should use current database context', async () => {
      const stub = sandbox.stub(axiosInstance, 'post').resolves({
        status: 200,
        data: { '@type': 'api:RemoteAddedResponse' }
      });

      client.db('mydb');
      await client.createRemote('origin', 'http://example.com');

      const call = stub.getCall(0);
      expect(call.args[0]).to.include('/mydb/');
    });

    it('should use current organization context', async () => {
      const stub = sandbox.stub(axiosInstance, 'post').resolves({
        status: 200,
        data: { '@type': 'api:RemoteAddedResponse' }
      });

      client.organization('myorg');
      client.db('mydb');
      await client.createRemote('origin', 'http://example.com');

      const call = stub.getCall(0);
      expect(call.args[0]).to.include('/myorg/');
    });
  });
});
