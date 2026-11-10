const { expect } = require('chai');
const sinon = require('sinon');

const DispatchRequest = require('../lib/dispatchRequest');
const CONST = require('../lib/const');

const jsonResponse = (data, status = 200, headers = {}) => new Response(
  JSON.stringify(data),
  { status, headers },
);

describe('dispatchRequest tests', () => {
  let fetchStub;
  const lastOptions = () => fetchStub.firstCall.args[1];

  beforeEach(() => {
    fetchStub = sinon.stub(globalThis, 'fetch');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('GET requests', () => {
    it('should make a GET request without payload', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'success' });
      expect(fetchStub.calledOnce).to.be.true;
      expect(lastOptions().method).to.equal('GET');
    });

    it('should make a GET request with payload as query parameters', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      const payload = { param1: 'value1', param2: 'value2' };
      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      const callUrl = fetchStub.firstCall.args[0];
      expect(callUrl).to.include('?');
      expect(callUrl).to.include('param1=value1');
      expect(callUrl).to.include('param2=value2');
    });

    it('should return result with data version when requested', async () => {
      fetchStub.resolves(jsonResponse(
        { result: 'success' },
        200,
        { 'terminusdb-data-version': 'v123' },
      ));

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
      fetchStub.resolves(new Response('Not found', { status: 404 }));

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
        expect(err.status).to.equal(404);
      }
    });
  });

  describe('POST requests', () => {
    it('should make a POST request with JSON payload', async () => {
      fetchStub.resolves(jsonResponse({ result: 'created' }));

      const payload = { name: 'test', value: 123 };
      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'created' });
      expect(fetchStub.calledOnce).to.be.true;
      expect(JSON.parse(lastOptions().body)).to.deep.equal(payload);
      expect(lastOptions().method).to.equal('POST');
    });

    it('should compress large POST payloads when compress is true', async () => {
      fetchStub.resolves(jsonResponse({ result: 'created' }));

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

      const options = lastOptions();
      expect(options.headers['Content-Encoding']).to.equal('gzip');
      // The payload should be compressed (Uint8Array)
      expect(options.body).to.be.an.instanceof(Uint8Array);
    });

    it('should not compress small POST payloads', async () => {
      fetchStub.resolves(jsonResponse({ result: 'created' }));

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

      const options = lastOptions();
      expect(options.headers['Content-Encoding']).to.be.undefined;
      expect(JSON.parse(options.body)).to.deep.equal(smallPayload);
    });

    it('should handle POST request errors', async () => {
      fetchStub.resolves(jsonResponse({ error: 'Bad request' }, 400));

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
        expect(err.status).to.equal(400);
      }
    });
  });

  describe('PUT requests', () => {
    it('should make a PUT request with JSON payload', async () => {
      fetchStub.resolves(jsonResponse({ result: 'updated' }));

      const payload = { id: 1, name: 'updated' };
      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.PUT,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'updated' });
      expect(fetchStub.calledOnce).to.be.true;
      expect(lastOptions().method).to.equal('PUT');
      expect(JSON.parse(lastOptions().body)).to.deep.equal(payload);
    });

    it('should compress large PUT payloads when compress is true', async () => {
      fetchStub.resolves(jsonResponse({ result: 'updated' }));

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

      const options = lastOptions();
      expect(options.headers['Content-Encoding']).to.equal('gzip');
      expect(options.body).to.be.an.instanceof(Uint8Array);
    });

    it('should handle PUT request errors', async () => {
      fetchStub.resolves(new Response('Unauthorized', { status: 401 }));

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
        expect(err.status).to.equal(401);
      }
    });
  });

  describe('DELETE requests', () => {
    it('should make a DELETE request without payload', async () => {
      fetchStub.resolves(jsonResponse({ result: 'deleted' }));

      const result = await DispatchRequest(
        'http://localhost:6363/api/test/123',
        CONST.DELETE,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'deleted' });
      expect(fetchStub.calledOnce).to.be.true;
      expect(lastOptions().method).to.equal('DELETE');
    });

    it('should make a DELETE request with payload', async () => {
      fetchStub.resolves(jsonResponse({ result: 'deleted' }));

      const payload = { confirm: true };
      await DispatchRequest(
        'http://localhost:6363/api/test/123',
        CONST.DELETE,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      const options = lastOptions();
      expect(JSON.parse(options.body)).to.deep.equal(payload);
      expect(options.headers['Content-Type']).to.equal('application/json; charset=utf-8');
    });

    it('should handle DELETE request errors', async () => {
      fetchStub.resolves(new Response('Forbidden', { status: 403 }));

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
        expect(err.status).to.equal(403);
      }
    });
  });

  describe('HEAD requests', () => {
    it('should make a HEAD request', async () => {
      fetchStub.resolves(new Response(null, {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }));

      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.HEAD,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.equal('');
      expect(fetchStub.calledOnce).to.be.true;
      expect(lastOptions().method).to.equal('HEAD');
    });

    it('should handle HEAD request errors', async () => {
      fetchStub.resolves(new Response('Not found', { status: 404 }));

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
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'mypassword' }
      );

      expect(lastOptions().headers.Authorization).to.include('Basic');
    });

    it('should handle JWT authentication', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'jwt', key: 'my-jwt-token' }
      );

      expect(lastOptions().headers.Authorization).to.equal('Bearer my-jwt-token');
    });

    it('should handle API key authentication', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'apikey', key: 'my-api-key' }
      );

      expect(lastOptions().headers.Authorization).to.equal('Token my-api-key');
    });

    it('should handle remote authentication', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'local' },
        { type: 'jwt', key: 'remote-token' }
      );

      const { headers } = lastOptions();
      expect(headers.Authorization).to.include('Basic');
      expect(headers['Authorization-Remote']).to.equal('Bearer remote-token');
    });

    it('should work without authentication', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        null
      );

      expect(lastOptions().headers.Authorization).to.be.undefined;
    });
  });

  describe('Custom headers', () => {
    it('should include custom headers', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

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

      const { headers } = lastOptions();
      expect(headers['X-Custom-Header']).to.equal('custom-value');
      expect(headers['X-Another-Header']).to.equal('another-value');
    });
  });

  describe('User-Agent header', () => {
    it('should include User-Agent header in Node.js environment', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(lastOptions().headers['User-Agent']).to.include('terminusdb-client-js/');
    });
  });

  describe('CSV and Triples operations', () => {
    it('should handle ADD_CSV action', async () => {
      fetchStub.resolves(jsonResponse({ result: 'csv added' }));

      const csvData = new FormData();
      const result = await DispatchRequest(
        'http://localhost:6363/api/csv',
        CONST.ADD_CSV,
        csvData,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'csv added' });
      const options = lastOptions();
      expect(options.method).to.equal('PUT');
      expect(options.body).to.equal(csvData);
      expect(options.headers['Content-Type']).to.equal('application/form-data; charset=utf-8');
    });

    it('should handle INSERT_TRIPLES action', async () => {
      fetchStub.resolves(jsonResponse({ result: 'triples inserted' }));

      const triplesData = 'some triples data';
      const result = await DispatchRequest(
        'http://localhost:6363/api/triples',
        CONST.INSERT_TRIPLES,
        triplesData,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'triples inserted' });
      expect(lastOptions().body).to.equal(triplesData);
    });
  });

  describe('QUERY_DOCUMENT action', () => {
    it('should handle QUERY_DOCUMENT action with X-HTTP-Method-Override header', async () => {
      fetchStub.resolves(jsonResponse({ documents: [] }));

      const payload = { query: { '@type': 'Person' } };
      await DispatchRequest(
        'http://localhost:6363/api/document',
        CONST.QUERY_DOCUMENT,
        payload,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      const options = lastOptions();
      expect(options.method).to.equal('POST');
      expect(options.headers['X-HTTP-Method-Override']).to.equal('GET');
    });
  });

  describe('Form data uploads', () => {
    it('should buffer stream payloads into a request body', async () => {
      fetchStub.resolves(jsonResponse({ result: 'ok' }));

      const { Readable } = require('stream');
      const stream = Readable.from([Buffer.from('{"query":true}')]);

      await DispatchRequest(
        'http://localhost:6363/api/woql',
        CONST.POST,
        stream,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      const options = lastOptions();
      expect(Buffer.isBuffer(options.body)).to.be.true;
      expect(options.body.toString()).to.include('{"query":true}');
    });

    it('should let fetch set the boundary for native FormData bodies', async () => {
      fetchStub.resolves(jsonResponse({ result: 'ok' }));

      const formData = new FormData();
      formData.append('payload', new Blob(['{"query":true}'], { type: 'application/json' }), 'body.json');

      await DispatchRequest(
        'http://localhost:6363/api/woql',
        CONST.POST,
        formData,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        { 'Content-Type': 'multipart/form-data' } // a manual boundary-less header must not survive
      );

      const options = lastOptions();
      expect(options.body).to.equal(formData);
      expect(options.headers['Content-Type']).to.be.undefined;
      expect(options.headers['content-type']).to.be.undefined;
    });

    it('should reject when a stream payload emits an error', async () => {
      const { Readable } = require('stream');
      const stream = new Readable({
        read() { this.destroy(new Error('read failure')); },
      });

      try {
        await DispatchRequest(
          'http://localhost:6363/api/test',
          CONST.POST,
          stream,
          { type: 'basic', user: 'admin', key: 'test' }
        );
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err).to.be.an.instanceof(Error);
        expect(err.message).to.include('API Error');
      }
    });

    it('should pass Buffer bodies through unmodified', async () => {
      fetchStub.resolves(jsonResponse({ result: 'ok' }));

      const buf = Buffer.from('raw-bytes');
      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        buf,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(lastOptions().body).to.equal(buf);
    });

    it('should send string payloads without re-encoding', async () => {
      fetchStub.resolves(jsonResponse({ result: 'ok' }));

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        '{"raw":true}',
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(lastOptions().body).to.equal('{"raw":true}');
    });
  });

  describe('Data version handling', () => {
    it('should return empty data version when header is missing', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

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
      const response = () => jsonResponse(
        { result: 'success' },
        200,
        { 'terminusdb-data-version': 'v456' },
      );

      const auth = { type: 'basic', user: 'admin', key: 'test' };

      // Test POST
      fetchStub.resolves(response());
      let result = await DispatchRequest(
        'http://localhost:6363/api/test', CONST.POST, {}, auth, null, null, true
      );
      expect(result.dataVersion).to.equal('v456');

      // Test PUT
      fetchStub.resolves(response());
      result = await DispatchRequest(
        'http://localhost:6363/api/test', CONST.PUT, {}, auth, null, null, true
      );
      expect(result.dataVersion).to.equal('v456');

      // Test DELETE
      fetchStub.resolves(response());
      result = await DispatchRequest(
        'http://localhost:6363/api/test', CONST.DELETE, null, auth, null, null, true
      );
      expect(result.dataVersion).to.equal('v456');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty payload', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      const result = await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.POST,
        null,
        { type: 'basic', user: 'admin', key: 'test' }
      );

      expect(result).to.deep.equal({ result: 'success' });
      expect(JSON.parse(lastOptions().body)).to.deep.equal({});
    });

    it('should handle empty custom headers object', async () => {
      fetchStub.resolves(jsonResponse({ result: 'success' }));

      await DispatchRequest(
        'http://localhost:6363/api/test',
        CONST.GET,
        null,
        { type: 'basic', user: 'admin', key: 'test' },
        null,
        {}
      );

      expect(fetchStub.calledOnce).to.be.true;
    });
  });
});
