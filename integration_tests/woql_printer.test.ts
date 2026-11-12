//@ts-check
import { describe, expect, test, beforeAll, afterAll } from '@jest/globals';
import { WOQL, Doc } from '../index.js';
import { createTestClient, setupTestBranch, teardownTestBranch } from "./test_utils";

const branchName = 'test_woql_printer';
let client = createTestClient();

beforeAll(async () => {
  await setupTestBranch(client, branchName);
}, 30000);

describe('WOQL prettyPrint integration', () => {
  test('triple / and / or / not decompile to WOQL calls', async () => {
    const query = WOQL.and(
      WOQL.triple('v:s', 'v:p', 'v:o'),
      WOQL.or(WOQL.triple('v:a', 'v:b', 'v:c'), WOQL.triple('v:d', 'v:e', 'v:f')),
      WOQL.not(WOQL.triple('v:x', 'v:y', 'v:z')),
    );
    const result = await client.query(query);
    expect(result).toBeDefined();
    const printed = query.prettyPrint();
    expect(printed).toContain('WOQL.and(');
    expect(printed).toContain('WOQL.or(');
    expect(printed).toContain('WOQL.not(');
    expect(printed).toContain('WOQL.triple("v:s", "v:p", "v:o")');
  });

  test('select, distinct and order_by decompile variable lists', async () => {
    const selectQuery = WOQL.select('v:a', 'v:b',
      WOQL.and(WOQL.triple('v:a', 'v:b', 'v:c')));
    const result = await client.query(selectQuery);
    expect(result?.bindings).toBeDefined();
    expect(selectQuery.prettyPrint()).toContain('WOQL.select("v:a", "v:b"');

    const distinctQuery = WOQL.distinct('v:a', 'v:b', WOQL.triple('v:a', 'v:b', 'v:c'));
    expect(distinctQuery.prettyPrint()).toContain('WOQL.distinct("v:a", "v:b"');

    const orderQuery = WOQL.order_by(['v:a', 'desc'], WOQL.triple('v:a', 'v:b', 'v:c'));
    const printed = orderQuery.prettyPrint();
    expect(printed).toContain('WOQL.order_by(');
    expect(printed).toContain('desc');
  });

  test('group_by and eval round-trip through the server', async () => {
    const groupQuery = WOQL.group_by('v:k', 'v:v', 'v:out',
      WOQL.and(WOQL.triple('v:k', 'v:p', 'v:v')));
    const result = await client.query(groupQuery);
    expect(result?.bindings).toBeDefined();
    const printed = groupQuery.prettyPrint();
    expect(printed).toContain('WOQL.group_by(');
    expect(printed).toContain('v:out');

    const evalQuery = WOQL.eval(WOQL.times(2, 3), 'v:x');
    const evalResult = await client.query(evalQuery);
    expect(evalResult?.bindings[0].x['@value']).toBe(6);
    const evalPrinted = evalQuery.prettyPrint();
    expect(evalPrinted).toContain('WOQL.eval(');
    expect(evalPrinted).toContain('WOQL.times(');
  });

  test('path patterns decompile to path syntax', () => {
    expect(WOQL.path('v:s', 'rdf:rest*', 'v:o').prettyPrint()).toContain('rdf:rest*');
    expect(WOQL.path('v:s', 'rdf:rest+', 'v:o').prettyPrint()).toContain('rdf:rest+');
    expect(WOQL.path('v:s', 'rdf:rest{1,3}', 'v:o').prettyPrint()).toContain('{1,3}');
    expect(WOQL.path('v:s', 'p1,p2', 'v:o').prettyPrint()).toContain('p1,p2');
    expect(WOQL.path('v:s', 'p1|p2', 'v:o').prettyPrint()).toContain('p1|p2');
    expect(WOQL.path('v:s', '<rdf:rest', 'v:o').prettyPrint()).toContain('<rdf:rest');
    expect(WOQL.path('v:s', '(p1|p2)+', 'v:o').prettyPrint()).toContain('(p1|p2)+');
  });

  test('regexp decompiles its pattern', () => {
    const printed = WOQL.re('h(.*)', 'v:s', 'v:r').prettyPrint();
    expect(printed).toContain('WOQL.re(');
    expect(printed).toContain('h(.*)');
  });

  test('get with as columns and remote resource decompiles', () => {
    const query = WOQL.get(WOQL.as('col1', 'v:col1'), WOQL.remote('https://example.org/data.csv'));
    const printed = query.prettyPrint();
    expect(printed).toContain('WOQL.get(');
    expect(printed).toContain('WOQL.as("col1", "v:col1")');
    expect(printed).toContain('example.org/data.csv');
  });

  test('document dictionaries decompile inside update_document', () => {
    const query = WOQL.update_document(
      new (Doc as any)({ '@type': 'Person', name: 'Ada' }),
    );
    const printed = query.prettyPrint();
    expect(printed).toContain('WOQL.update_document(');
    expect(printed).toContain('Person');
    expect(printed).toContain('Ada');
  });

  test('typecast and true decompile', () => {
    expect(WOQL.typecast('v:a', 'xsd:string', 'v:b').prettyPrint()).toContain('WOQL.typecast(');
    expect(WOQL.true().prettyPrint()).toContain('true()');
  });

  test('python flavor uses the python prelude', () => {
    const printed = WOQL.triple('v:s', 'v:p', 'v:o').prettyPrint('python');
    expect(printed).toContain('WOQLQuery().triple(');
  });
});

afterAll(async () => {
  await teardownTestBranch(client, branchName);
});
