const { expect } = require('chai');
const sinon = require('sinon');
const pako = require('pako');

// We need to mock axiosInstance before requiring dispatchRequest
const axiosInstance = require('../lib/axiosInstance');
const DispatchRequest = require('../lib/dispatchRequest');
const CONST = require('../lib/const');

describe('dispatchRequest tests', () => {
  let axiosStub;

  beforeEach(() => {
    // Create stubs for axios methods
    axiosStub = {
      get: sinon.stub(axiosInstance, 'get'),
      post: sinon.stub(axiosInstance, 'post'),
      put: sinon.stub(axiosInstance, 'put'),
      delete: sinon.stub(axiosInstance, 'delete'),
      head: sinon.stub(axiosInstance, 'head'),
    };
  });

  afterEach(() => {
    // Restore all stubs
    sinon.restore();
  });

  describe('GET requests', () => {
    it('should make a GET request without payload', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'success' });
      expect(axiosStub.get.calledOnce).to.be.true;
    });

    it('should make a GET request with payload as query parameters', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      const payload = { param1: 'value1', param2: 'value2' };
      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(axiosStub.get.calledOnce).to.be.true;
      const callUrl = axiosStub.get.firstCall.args[0];
      expect(callUrl).to.include('?');
      expect(callUrl).to.include('param1=value1');
      expect(callUrl).to.include('param2=value2');
    });

    it('should return result with data version when requested', async () => {
      const mockResponse = {
        data: { result: 'success' },
        headers: { 'terminusdb-data-version': 'v123' },
      };
      axiosStub.get.resolves(mockResponse);

      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        null,
        true // getDataVersion
      );

      expect(result).to.deep.equal({
        result: { result: 'success' },
        dataVersion: 'v123',
      });
    });

    it('should handle GET request errors', async () => {
      const mockError = {
        response: {
          data: 'Not found',
          status: 404,
        },
      };
      axiosStub.get.rejects(mockError);

      try {
        await DispatchRequest(
          'http://localhost:6363/api/test',
          CONST.GET,
          null,
          { type: 'basic', user: 'admin', key: 'test' }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.include('API Error');
      }
    });
  });

  describe('POST requests', () => {
    it('should make a POST request with JSON payload', async () => {
      const mockResponse = { data: { result: 'created' } };
      axiosStub.post.resolves(mockResponse);

      const payload = { name: 'test', value: 123 };
      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'created' });
      expect(axiosStub.post.calledOnce).to.be.true;
      const callArgs = axiosStub.post.firstCall.args;
      expect(callArgs[1]).to.deep.equal(payload);
    });

    it('should compress large POST payloads when compress is true', async () => {
      const mockResponse = { data: { result: 'created' } };
      axiosStub.post.resolves(mockResponse);

      // Create a large payload (> 1024 bytes)
      const largePayload = { data: 'x'.repeat(2000) };
      
      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        largePayload,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        null,
        false,
        true // compress
      );

      expect(axiosStub.post.calledOnce).to.be.true;
      const callArgs = axiosStub.post.firstCall.args;
      const options = callArgs[2];
      expect(options.headers['Content-Encoding']).to.equal('gzip');
      // The payload should be compressed (Uint8Array)
      expect(callArgs[1]).to.be.an.instanceof(Uint8Array);
    });

    it('should not compress small POST payloads', async () => {
      const mockResponse = { data: { result: 'created' } };
      axiosStub.post.resolves(mockResponse);

      const smallPayload = { data: 'small' };
      
      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        smallPayload,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        null,
        false,
        true // compress
      );

      expect(axiosStub.post.calledOnce).to.be.true;
      const callArgs = axiosStub.post.firstCall.args;
      const options = callArgs[2];
      expect(options.headers['Content-Encoding']).to.be.undefined;
      expect(callArgs[1]).to.deep.equal(smallPayload);
    });

    it('should handle POST request errors', async () => {
      const mockError = {
        response: {
          data: { error: 'Bad request' },
          status: 400,
        },
      };
      axiosStub.post.rejects(mockError);

      try {
        await DispatchRequest(
          'http://localhost:6363/api/test',
          CONST.POST,
          { data: 'test' },
          { type: 'basic', user: 'admin', key: 'test' }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.include('API Error');
      }
    });
  });

  describe('PUT requests', () => {
    it('should make a PUT request with JSON payload', async () => {
      const mockResponse = { data: { result: 'updated' } };
      axiosStub.put.resolves(mockResponse);

      const payload = { id: 1, name: 'updated' };
      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.PUT,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'updated' });
      expect(axiosStub.put.calledOnce).to.be.true;
    });

    it('should compress large PUT payloads when compress is true', async () => {
      const mockResponse = { data: { result: 'updated' } };
      axiosStub.put.resolves(mockResponse);

      const largePayload = { data: 'x'.repeat(2000) };
      
      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.PUT,
        largePayload,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        null,
        false,
        true // compress
      );

      expect(axiosStub.put.calledOnce).to.be.true;
      const callArgs = axiosStub.put.firstCall.args;
      const options = callArgs[2];
      expect(options.headers['Content-Encoding']).to.equal('gzip');
      expect(callArgs[1]).to.be.an.instanceof(Uint8Array);
    });

    it('should handle PUT request errors', async () => {
      const mockError = {
        response: {
          data: 'Unauthorized',
          status: 401,
        },
      };
      axiosStub.put.rejects(mockError);

      try {
        await DispatchRequest(
          'http://localhost:6363/api/test',
          CONST.PUT,
          { data: 'test' },
          { type: 'basic', user: 'admin', key: 'test' }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.include('API Error');
      }
    });
  });

  describe('DELETE requests', () => {
    it('should make a DELETE request without payload', async () => {
      const mockResponse = { data: { result: 'deleted' } };
      axiosStub.delete.resolves(mockResponse);

      const result = await DispatchRequest(
        'http://localhost:6363/api/test/123',
        CONST.DELETE,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'deleted' });
      expect(axiosStub.delete.calledOnce).to.be.true;
    });

    it('should make a DELETE request with payload', async () => {
      const mockResponse = { data: { result: 'deleted' } };
      axiosStub.delete.resolves(mockResponse);

      const payload = { confirm: true };
      await DispatchRequest(
        'http://localhost:6363/api/test/123',
        CONST.DELETE,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(axiosStub.delete.calledOnce).to.be.true;
      const callArgs = axiosStub.delete.firstCall.args;
      const options = callArgs[1];
      expect(options.data).to.deep.equal(payload);
      expect(options.headers['Content-Type']).to.equal('application/json; charset=utf-8');
    });

    it('should handle DELETE request errors', async () => {
      const mockError = {
        response: {
          data: 'Forbidden',
          status: 403,
        },
      };
      axiosStub.delete.rejects(mockError);

      try {
        await DispatchRequest(
          'http://localhost:6363/api/test/123',
          CONST.DELETE,
          null,
          { type: 'basic', user: 'admin', key: 'test' }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.include('API Error');
      }
    });
  });

  describe('HEAD requests', () => {
    it('should make a HEAD request', async () => {
      const mockResponse = {
        data: null,
        headers: { 'content-type': 'application/json' },
      };
      axiosStub.head.resolves(mockResponse);

      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.HEAD,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.be.null;
      expect(axiosStub.head.calledOnce).to.be.true;
    });

    it('should handle HEAD request errors', async () => {
      const mockError = {
        response: {
          data: 'Not found',
          status: 404,
        },
      };
      axiosStub.head.rejects(mockError);

      try {
        await DispatchRequest(
          'http://localhost:6363/api/test',
          CONST.HEAD,
          null,
          { type: 'basic', user: 'admin', key: 'test' }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.include('API Error');
      }
    });
  });

  describe('Authentication', () => {
    it('should handle basic authentication', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'mypassword' }
      );

      expect(axiosStub.get.calledOnce).to.be.true;
      const options = axiosStub.get.firstCall.args[1];
      expect(options.headers.Authorization).to.include('Basic');
    });

    it('should handle JWT authentication', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'jwt', key: 'my-jwt-token' }
      );

      expect(axiosStub.get.calledOnce).to.be.true;
      const options = axiosStub.get.firstCall.args[1];
      expect(options.headers.Authorization).to.equal('Bearer my-jwt-token');
    });

    it('should handle API key authentication', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'apikey', key: 'my-api-key' }
      );

      expect(axiosStub.get.calledOnce).to.be.true;
      const options = axiosStub.get.firstCall.args[1];
      expect(options.headers.Authorization).to.equal('Token my-api-key');
    });

    it('should handle remote authentication', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'local' },
        { type: 'jwt', key: 'remote-token' }
      );

      expect(axiosStub.get.calledOnce).to.be.true;
      const options = axiosStub.get.firstCall.args[1];
      expect(options.headers.Authorization).to.include('Basic');
      expect(options.headers['Authorization-Remote']).to.equal('Bearer remote-token');
    });

    it('should work without authentication', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        null
      );

      expect(axiosStub.get.calledOnce).to.be.true;
      const options = axiosStub.get.firstCall.args[1];
      expect(options.headers.Authorization).to.be.undefined;
    });
  });

  describe('Custom headers', () => {
    it('should include custom headers', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'X-Another-Header': 'another-value',
      };

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        customHeaders
      );

      expect(axiosStub.get.calledOnce).to.be.true;
      const options = axiosStub.get.firstCall.args[1];
      expect(options.headers['X-Custom-Header']).to.equal('custom-value');
      expect(options.headers['X-Another-Header']).to.equal('another-value');
    });
  });

  describe('User-Agent header', () => {
    it('should include User-Agent header in Node.js environment', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(axiosStub.get.calledOnce).to.be.true;
      const options = axiosStub.get.firstCall.args[1];
      expect(options.headers['User-Agent']).to.include('terminusdb-client-js/');
    });
  });

  describe('CSV and Triples operations', () => {
    it('should handle ADD_CSV action', async () => {
      const mockResponse = { data: { result: 'csv added' } };
      axiosStub.put.resolves(mockResponse);

      const csvData = new FormData();
      const result = await DispatchRequest(
        'http://localhost:6363/api/csv',
        CONST.ADD_CSV,
        csvData,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'csv added' });
      expect(axiosStub.put.calledOnce).to.be.true;
      const options = axiosStub.put.firstCall.args[2];
      expect(options.headers['Content-Type']).to.equal('application/form-data; charset=utf-8');
    });

    it('should handle INSERT_TRIPLES action', async () => {
      const mockResponse = { data: { result: 'triples inserted' } };
      axiosStub.put.resolves(mockResponse);

      const triplesData = 'some triples data';
      const result = await DispatchRequest(
        'http://localhost:6363/api/triples',
        CONST.INSERT_TRIPLES,
        triplesData,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'triples inserted' });
      expect(axiosStub.put.calledOnce).to.be.true;
    });
  });

  describe('QUERY_DOCUMENT action', () => {
    it('should handle QUERY_DOCUMENT action with X-HTTP-Method-Override header', async () => {
      const mockResponse = { data: { documents: [] } };
      axiosStub.post.resolves(mockResponse);

      const payload = { query: { '@type': 'Person' } };
      await DispatchRequest(
        'http://localhost:6363/api/document',
        CONST.QUERY_DOCUMENT,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(axiosStub.post.calledOnce).to.be.true;
      const options = axiosStub.post.firstCall.args[2];
      expect(options.headers['X-HTTP-Method-Override']).to.equal('GET');
    });
  });

  describe('Data version handling', () => {
    it('should return empty data version when header is missing', async () => {
      const mockResponse = {
        data: { result: 'success' },
        headers: {},
      };
      axiosStub.get.resolves(mockResponse);

      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        null,
        true
      );

      expect(result).to.deep.equal({
        result: { result: 'success' },
        dataVersion: '',
      });
    });

    it('should return data version for all HTTP methods when requested', async () => {
      const mockResponse = {
        data: { result: 'success' },
        headers: { 'terminusdb-data-version': 'v456' },
      };

      // Test POST
      axiosStub.post.resolves(mockResponse);
      let result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        {},
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        null,
        true
      );
      expect(result.dataVersion).to.equal('v456');

      // Test PUT
      axiosStub.put.resolves(mockResponse);
      result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.PUT,
        {},
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        null,
        true
      );
      expect(result.dataVersion).to.equal('v456');

      // Test DELETE
      axiosStub.delete.resolves(mockResponse);
      result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.DELETE,
        null,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        null,
        true
      );
      expect(result.dataVersion).to.equal('v456');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty payload', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.post.resolves(mockResponse);

      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'success' });
      expect(axiosStub.post.calledOnce).to.be.true;
      const payload = axiosStub.post.firstCall.args[1];
      expect(payload).to.deep.equal({});
    });

    it('should handle empty custom headers object', async () => {
      const mockResponse = { data: { result: 'success' } };
      axiosStub.get.resolves(mockResponse);

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        {}
      );

      expect(axiosStub.get.calledOnce).to.be.true;
    });
  });
});
