const { expect } = require('chai');

const {
  apiErrorFormatted,
  getErrorAsMessage,
  getAPIErrorMessage,
  getAccessDeniedMessage,
  accessDenied,
  getInvalidURIMessage,
  getInvalidParameterMessage,
  parseAPIError,
} = require('../lib/errorMessage');

describe('errorMessage tests', () => {
  describe('getErrorAsMessage', () => {
    it('should format error with response.data', () => {
      const err = {
        response: {
          data: { message: 'Database not found', code: '404' },
          status: 404,
          action: 'getDatabase',
          type: 'api_error',
        },
      };
      const result = getErrorAsMessage('http://localhost:6363/db/mydb', { method: 'GET' }, err);

      expect(result).to.include('Code: 404');
      expect(result).to.include('Action: getDatabase');
      expect(result).to.include('Type: api_error');
      expect(result).to.include('url: http://localhost:6363/db/mydb');
      expect(result).to.include('method: GET');
      expect(result).to.include('message Database not found');
      expect(result).to.include('code 404');
    });

    it('should format error with body', () => {
      const err = {
        body: 'Connection refused',
        status: 500,
        type: 'network_error',
      };
      const result = getErrorAsMessage('http://localhost:6363/api', { method: 'POST' }, err);

      expect(result).to.include('Connection refused');
      expect(result).to.include('Code: 500');
      expect(result).to.include('Type: network_error');
    });

    it('should handle error with stack trace', () => {
      const err = {
        response: {
          data: 'Error occurred',
          status: 500,
          stack: 'Error: Something went wrong\n    at Function.test (test.js:1:1)',
        },
      };
      const result = getErrorAsMessage('http://localhost:6363/api', null, err);

      expect(result).to.include('Error occurred');
      expect(result).to.include('\n');
      expect(result).to.include('Error: Something went wrong');
    });

    it('should strip query parameters from URL', () => {
      const err = {
        response: {
          data: 'Error',
          status: 400,
        },
      };
      const result = getErrorAsMessage('http://localhost:6363/api?param=value&other=test', null, err);

      expect(result).to.include('url: http://localhost:6363/api');
      expect(result).not.to.include('param=value');
    });

    it('should handle minimal error object', () => {
      const err = {
        response: {
          status: 401,
        },
      };
      const result = getErrorAsMessage('http://localhost:6363/api', null, err);

      expect(result).to.include('Code: 401');
      expect(result).to.include('url: http://localhost:6363/api');
    });

    it('should handle error without response or body', () => {
      const err = {
        status: 500,
        type: 'unknown',
      };
      const result = getErrorAsMessage('http://localhost:6363/api', null, err);

      expect(result).to.include('Code: 500');
      expect(result).to.include('Type: unknown');
    });
  });

  describe('getAPIErrorMessage', () => {
    it('should prefix error message with "API Error"', () => {
      const err = {
        response: {
          data: 'Invalid request',
          status: 400,
        },
      };
      const result = getAPIErrorMessage('http://localhost:6363/api', { method: 'POST' }, err);

      expect(result).to.include('API Error');
      expect(result).to.include('Code: 400');
      expect(result).to.include('Invalid request');
    });
  });

  describe('getAccessDeniedMessage', () => {
    it('should prefix error message with "Access Denied"', () => {
      const err = {
        response: {
          data: 'Unauthorized',
          status: 403,
        },
      };
      const result = getAccessDeniedMessage('http://localhost:6363/api', { method: 'GET' }, err);

      expect(result).to.include('Access Denied');
      expect(result).to.include('Code: 403');
      expect(result).to.include('Unauthorized');
    });
  });

  describe('accessDenied', () => {
    it('should create an access denied error object', () => {
      const result = accessDenied('createDatabase', 'mydb', 'http://localhost:6363/');

      expect(result).to.deep.equal({
        status: 403,
        url: 'http://localhost:6363/mydb',
        type: 'client',
        action: 'createDatabase',
        body: 'createDatabase not permitted for http://localhost:6363/mydb',
      });
    });

    it('should handle missing server parameter', () => {
      const result = accessDenied('deleteDatabase', 'mydb');

      expect(result.url).to.equal('mydb');
      expect(result.body).to.include('deleteDatabase not permitted for mydb');
    });

    it('should handle missing db parameter', () => {
      const result = accessDenied('listDatabases', undefined, 'http://localhost:6363/');

      expect(result.url).to.equal('http://localhost:6363/');
    });

    it('should handle all parameters missing', () => {
      const result = accessDenied('someAction');

      expect(result.status).to.equal(403);
      expect(result.type).to.equal('client');
      expect(result.action).to.equal('someAction');
      expect(result.url).to.equal('');
    });
  });

  describe('getInvalidURIMessage', () => {
    it('should format invalid URI message', () => {
      const result = getInvalidURIMessage('invalid/url', 'connect');

      expect(result).to.include('Invalid argument to');
      expect(result).to.include('connect');
      expect(result).to.include('invalid/url');
      expect(result).to.include('is not a valid Terminus DB API endpoint');
    });

    it('should handle different call names', () => {
      const result = getInvalidURIMessage('http://wrong-domain.com', 'createDatabase');

      expect(result).to.include('createDatabase');
      expect(result).to.include('http://wrong-domain.com');
    });
  });

  describe('getInvalidParameterMessage', () => {
    it('should format invalid parameter message', () => {
      const result = getInvalidParameterMessage('query', 'WOQL query must be an object');

      expect(result).to.include('Invalid Parameter to');
      expect(result).to.include('query');
      expect(result).to.include('WOQL query must be an object');
    });

    it('should handle different call and message combinations', () => {
      const result = getInvalidParameterMessage('connect', 'Server URL is required');

      expect(result).to.include('connect');
      expect(result).to.include('Server URL is required');
    });
  });

  describe('parseAPIError', () => {
    it('should parse API error with object data', () => {
      const response = {
        status: 404,
        type: 'not_found',
        data: { error: 'Database not found' },
        url: 'http://localhost:6363/db/test',
        headers: { 'content-type': 'application/json' },
        redirected: false,
        text: () => 'Database not found',
      };

      const result = parseAPIError(response);

      expect(result.status).to.equal(404);
      expect(result.type).to.equal('not_found');
      expect(result.body).to.equal('Database not found');
      expect(result.url).to.equal('http://localhost:6363/db/test');
      expect(result.headers).to.deep.equal({ 'content-type': 'application/json' });
      expect(result.redirected).to.equal(false);
    });

    it('should parse API error with string data', () => {
      const response = {
        status: 500,
        type: 'server_error',
        data: 'Internal server error',
        url: 'http://localhost:6363/api',
        headers: {},
        redirected: false,
      };

      const result = parseAPIError(response);

      expect(result.status).to.equal(500);
      expect(result.body).to.equal('Internal server error');
    });

    it('should handle response with json() method', () => {
      const response = {
        status: 400,
        type: 'bad_request',
        data: { error: 'Invalid input' },
        url: 'http://localhost:6363/api',
        headers: {},
        redirected: false,
        text: () => {
          throw new Error('text() failed');
        },
        json: () => ({ error: 'Invalid input' }),
      };

      const result = parseAPIError(response);

      expect(result.status).to.equal(400);
      expect(result.body).to.deep.equal({ error: 'Invalid input' });
    });

    it('should handle response with toString() fallback', () => {
      const response = {
        status: 503,
        type: 'service_unavailable',
        data: { message: 'Service unavailable' },
        url: 'http://localhost:6363/api',
        headers: {},
        redirected: false,
        text: () => {
          throw new Error('text() failed');
        },
        json: () => {
          throw new Error('json() failed');
        },
        toString: () => 'Response object',
      };

      const result = parseAPIError(response);

      expect(result.status).to.equal(503);
      expect(result.body).to.equal('Response object');
    });
  });

  describe('apiErrorFormatted', () => {
    it('should create formatted error with response data', () => {
      const err = {
        response: {
          data: { message: 'Query failed', details: 'Syntax error' },
          status: 400,
        },
      };

      const result = apiErrorFormatted('http://localhost:6363/woql', { method: 'POST' }, err);

      expect(result).to.be.an.instanceof(Error);
      expect(result.message).to.include('API Error');
      expect(result.message).to.include('Code: 400');
      expect(result.data).to.deep.equal({ message: 'Query failed', details: 'Syntax error' });
      expect(result.status).to.equal(400);
    });

    it('should create formatted error without response data', () => {
      const err = {
        body: 'Network error',
        status: 503,
      };

      const result = apiErrorFormatted('http://localhost:6363/api', null, err);

      expect(result).to.be.an.instanceof(Error);
      expect(result.message).to.include('API Error');
      expect(result.message).to.include('Code: 503');
    });

    it('should handle error with response status only', () => {
      const err = {
        response: {
          status: 401,
        },
      };

      const result = apiErrorFormatted('http://localhost:6363/api', { method: 'GET' }, err);

      expect(result).to.be.an.instanceof(Error);
      expect(result.status).to.equal(401);
      expect(result.data).to.be.undefined;
    });

    it('should handle minimal error', () => {
      const err = {
        response: {},
      };

      const result = apiErrorFormatted('http://localhost:6363/api', null, err);

      expect(result).to.be.an.instanceof(Error);
      expect(result.message).to.include('API Error');
    });
  });
});
