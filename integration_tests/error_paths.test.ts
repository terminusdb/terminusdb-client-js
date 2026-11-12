//@ts-check
import { describe, expect, test } from '@jest/globals';
import { WOQL } from '../index.js';
import { createTestClient } from "./test_utils";

const client = createTestClient();

describe('Error surface against the real server', () => {
  test('query on a missing database rejects with a formatted API error', async () => {
    client.db('db__definitely_missing');
    await expect(
      client.query(WOQL.triple('v:s', 'v:p', 'v:o')),
    ).rejects.toThrow(/API Error|not_exist|Existence/);
  });

  test('createDatabase with no name rejects with an invalid-parameter error', async () => {
    await expect(client.createDatabase('', {} as any)).rejects.toThrow(/Invalid Parameter|mandatory/);
  });

  test('deleteDatabase on a missing database surfaces the server error', async () => {
    await expect(client.deleteDatabase('db__definitely_missing')).rejects.toBeDefined();
  });
});

describe('ErrorMessage helpers', () => {
  // These helpers are exported surface but unused inside lib — exercise the
  // exported contract directly.
  test('accessDenied builds a 403-shaped error object', () => {
    // eslint-disable-next-line global-require
    const ErrorMessage = require('../lib/errorMessage');
    const err = ErrorMessage.accessDenied('read', 'db_x', 'http://srv/');
    expect(err.status).toBe(403);
    expect(err.url).toContain('db_x');
    expect(err.body).toContain('read not permitted');
  });

  test('getInvalidURIMessage names the call and endpoint', () => {
    const ErrorMessage = require('../lib/errorMessage');
    const msg = ErrorMessage.getInvalidURIMessage('http://bad/', 'connect');
    expect(msg).toContain('connect');
    expect(msg).toContain('not a valid Terminus DB API endpoint');
  });

  test('getInvalidParameterMessage names the call and reason', () => {
    const ErrorMessage = require('../lib/errorMessage');
    expect(ErrorMessage.getInvalidParameterMessage('query', 'missing arg')).toContain('missing arg');
  });

  test('getAccessDeniedMessage formats the error', () => {
    const ErrorMessage = require('../lib/errorMessage');
    const msg = ErrorMessage.getAccessDeniedMessage('u', 'a', { status: 403 });
    expect(msg).toContain('Access Denied');
  });

  test('parseAPIError reads a fetch-style response', async () => {
    const ErrorMessage = require('../lib/errorMessage');
    const fake = {
      status: 404,
      type: 'basic',
      url: 'http://srv/api/woql',
      headers: {},
      redirected: false,
      data: {},
      text: () => 'not found',
      json: () => ({}),
    };
    const err = ErrorMessage.parseAPIError(fake);
    expect(err.status).toBe(404);
    expect(err.url).toContain('/api/woql');
    expect(err.body).toBe('not found');
  });

  test('parseAPIError tolerates a non-object body', () => {
    const ErrorMessage = require('../lib/errorMessage');
    const err = ErrorMessage.parseAPIError({
      status: 500, type: 'basic', url: 'u', headers: {}, redirected: false, data: 'oops',
    });
    expect(err.body).toBe('oops');
  });

  test('getErrorAsMessage formats status, url and method', () => {
    const ErrorMessage = require('../lib/errorMessage');
    const msg = ErrorMessage.getErrorAsMessage(
      'http://srv/api?x=1',
      { method: 'POST' },
      { status: 404, type: 'api:not_found', body: { 'api:message': 'db missing' } },
    );
    expect(msg).toContain('Code: 404');
    expect(msg).toContain('url: http://srv/api');
    expect(msg).toContain('method: POST');
  });
});
