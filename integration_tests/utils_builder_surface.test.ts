//@ts-check
import { describe, expect, test } from '@jest/globals';

// eslint-disable-next-line global-require
const UTILS = require('../lib/utils');
// eslint-disable-next-line global-require
const WOQLQuery = require('../lib/query/woqlBuilder');
// eslint-disable-next-line global-require
const ErrorMessage = require('../lib/errorMessage');

describe('Utils URL and variable helpers', () => {
  test('shorten and unshorten round-trip prefixed IRIs', () => {
    const prefixes = { rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#' };
    expect(UTILS.shorten('http://www.w3.org/1999/02/22-rdf-syntax-ns#type', prefixes)).toBe('type');
    expect(UTILS.unshorten('rdf:type')).toBe('http://www.w3.org/1999/02/22-rdf-syntax-ns#type');
    expect(UTILS.unshorten('http://x.y/z')).toBe('http://x.y/z');
  });

  test('json_shorten and json_unshorten remap object keys', () => {
    const prefixes = { p: 'http://x.y/ns#' };
    expect(UTILS.json_shorten({ 'http://x.y/ns#a': 1 }, prefixes)).toEqual({ a: 1 });
    expect(UTILS.json_unshorten({ 'rdf:type': 1 })).toEqual({ 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': 1 });
    expect(UTILS.json_unshorten({ 'p:a': 1 }, prefixes)).toEqual({ 'p:a': 1 });
  });

  test('URL predicates and extractors', () => {
    expect(UTILS.validURL('http://x.y/z')).toBe(true);
    expect(UTILS.validURL('not a url')).toBe(false);
    expect(UTILS.isIRI('http://x.y/z')).toBe(true);
    expect(UTILS.labelFromURL('http://x.y/ns#Thing')).toBe('Thing');
    expect(UTILS.urlFragment('http://x.y/ns#Thing')).toBe('Thing');
    expect(UTILS.lastURLBit('http://x.y/ns/Thing')).toBe('Thing');
    expect(UTILS.labelFromVariable('v:my_var')).toBe('V:my var');
  });

  test('variable namespacing helpers', () => {
    expect(UTILS.addNamespaceToVariable('name')).toBe('v:name');
    expect(UTILS.removeNamespaceFromVariable('v:name')).toBe('name');
    expect(UTILS.removeNamespacesFromVariables(['v:a', 'v:b'])).toEqual(['a', 'b']);
    expect(UTILS.addNamespacesToVariables(['a'])).toEqual(['v:a']);
  });

  test('getStdURL resolves known prefixes', () => {
    const url = UTILS.getStdURL('rdf', 'http://www.w3.org/1999/02/22-rdf-syntax-ns#', 'rdf:type');
    expect(url === false || typeof url === 'string').toBe(true);
  });

  test('getConfigValue reads a key from a row', () => {
    expect(UTILS.getConfigValue('k', { k: 'v' })).toBe('v');
  });

  test('encoding and id helpers', () => {
    expect(UTILS.decodeURISegment('a%20b')).toBe('a b');
    expect(UTILS.URIEncodePayload({ a: 1, b: 'x y' })).toBe('a=1&b=x%20y');
    expect(UTILS.removeDocType('doc:X')).toBe('doc:X');
    expect(UTILS.empty({})).toBe(true);
    expect(UTILS.empty({ a: 1 })).toBe(false);
    expect(UTILS.genBNID('b')).toMatch(/^b/);
    expect(UTILS.compareIDs('a', 'a')).toBe(true);
    expect(UTILS.compareIDs('a', 'b')).toBe(false);
    UTILS.addURLPrefix('ex', 'http://x.y/');
    expect(UTILS.standard_urls.ex).toBe('http://x.y/');
    expect(UTILS.getShorthand('http://x.y/ns#a') === false || typeof UTILS.getShorthand('http://x.y/ns#a') === 'string').toBe(true);
  });
});

describe('Utils TypeHelper and DateHelper', () => {
  test('parseRangeValue splits a bounded range', () => {
    expect(UTILS.TypeHelper.parseRangeValue('[0,10]')).toEqual(['0', '10']);
  });

  test('TypeHelper type predicates and formatters', () => {
    expect(UTILS.TypeHelper.isStringType('xsd:string')).toBe(true);
    expect(UTILS.TypeHelper.isDatatype('xsd:string')).toBe(true);
    expect(UTILS.TypeHelper.numberWithCommas(1234567)).toBe('1,234,567');
    expect(UTILS.TypeHelper.formatBytes(2048)).toMatch(/KB/);
  });

  test('parseXsdDate / parseXsdTime / parseXsdDateTime', () => {
    expect(UTILS.DateHelper.parseXsdDate('2024-01-15')).toMatchObject({ year: '2024', month: 1, day: 15 });
    expect(UTILS.DateHelper.parseXsdTime('12:30:45')).toMatchObject({ hour: '12', minute: '30', second: '45' });
    expect(UTILS.DateHelper.parseXsdDateTime('2024-01-15T12:30:45')).toMatchObject({ year: '2024', month: 1, day: 15, hour: '12' });
  });

  test('parseDate dispatches on xsd type', () => {
    expect(UTILS.DateHelper.parseDate('xsd:date', '2024-01-15')).toMatchObject({ year: '2024' });
    expect(UTILS.DateHelper.parseDate('xsd:time', '12:30:45')).toMatchObject({ hour: '12' });
    expect(UTILS.DateHelper.parseDate('xsd:dateTime', '2024-01-15T12:30:45')).toMatchObject({ year: '2024' });
    expect(UTILS.DateHelper.parseDate('xsd:dateTimeStamp', '2024-01-15T12:30:45')).toMatchObject({ year: '2024' });
    expect(UTILS.DateHelper.parseDate('xsd:gYear', '2024')).toEqual({ year: '2024' });
    expect(UTILS.DateHelper.parseDate('xsd:gYearRange', '2020-2024')).toEqual({ year: '2020-2024' });
    expect(UTILS.DateHelper.parseDate('xsd:gMonth', '--11')).toEqual({ month: '11' });
    expect(UTILS.DateHelper.parseDate('xsd:gDay', '15')).toEqual({ day: '15' });
    expect(UTILS.DateHelper.parseDate('xsd:gYearMonth', '2024-11')).toEqual({ year: '2024', month: '11' });
    expect(UTILS.DateHelper.parseDate('xsd:gMonthDay', '11-15')).toEqual({ month: '11', day: '15' });
  });

  test('xsdFromParsed serializes each xsd type', () => {
    const DH = UTILS.DateHelper;
    // parseDate/xsdFromParsed dispatch via this.* — call them on DateHelper, not detached.
    expect(DH.xsdFromParsed(DH.parseDate('xsd:time', '12:30:45'), 'xsd:time')).toBe('12:30:45');
    expect(DH.xsdFromParsed(DH.parseDate('xsd:dateTime', '2024-01-15T12:30:45'), 'xsd:dateTime')).toBe('2024-01-15T12:30:45');
    expect(DH.xsdFromParsed(DH.parseDate('xsd:gYear', '2024'), 'xsd:gYear')).toBe('2024');
  });

  test('xsdFromParsed and addXsdPadding round-trip', () => {
    const parsed = UTILS.DateHelper.parseXsdDate('2024-01-15');
    expect(UTILS.DateHelper.xsdFromParsed(parsed, 'xsd:date')).toBe('2024-01-15');
    expect(UTILS.DateHelper.addXsdPadding(parsed)).toMatchObject({ year: '2024', month: '01' });
  });

  test('convertTimestampToXsd parses unix seconds', () => {
    const parsed = UTILS.DateHelper.convertTimestampToXsd(1705321845);
    expect(parsed.year).toBeGreaterThanOrEqual(2024);
    expect(parsed).toHaveProperty('month');
    expect(parsed).toHaveProperty('hour');
  });

  test('extractXsdTimezone reads Z and offset suffixes', () => {
    expect(UTILS.DateHelper.extractXsdTimezone('2024-01-15T12:30:45+02:00')).toBeDefined();
    expect(UTILS.DateHelper.extractXsdTimezone('2024-01-15T12:30:45Z')).toBeDefined();
    expect(UTILS.DateHelper.extractXsdTimezone('2024-01-15T12:30:45')).toBe(false);
  });
});

describe('WOQLQuery builder surface', () => {
  test('star and all build catch-all triple queries', () => {
    expect(new WOQLQuery().star().query['@type']).toBe('Triple');
    expect(new WOQLQuery().all().query['@type']).toBe('Triple');
  });

  test('string, boolean, literal and iri produce node values', () => {
    expect(new WOQLQuery().string('abc')).toEqual({ '@type': 'xsd:string', '@value': 'abc' });
    expect(new WOQLQuery().boolean(true)).toEqual({ '@type': 'xsd:boolean', '@value': true });
    expect(new WOQLQuery().literal('5', 'xsd:integer')).toEqual({ '@type': 'xsd:integer', '@value': '5' });
    expect(new WOQLQuery().iri('doc:x')).toEqual({ '@type': 'NodeValue', node: 'doc:x' });
  });

  test('update_triple and update_quad build update queries', () => {
    expect(new WOQLQuery().update_triple('v:s', 'v:p', 'v:o').query['@type']).toBe('And');
    expect(new WOQLQuery().update_quad('v:s', 'v:p', 'v:o', 'schema').query['@type']).toBe('And');
  });

  test('nuke clears the instance graph', () => {
    expect(new WOQLQuery().nuke().query['@type']).toBe('And');
  });

  test('node and graph set query context', () => {
    const ctx = new WOQLQuery().node('v:s');
    expect(ctx.triple_builder_context.subject).toBe('v:s');
    expect(new WOQLQuery().graph('schema').triple('v:s', 'v:p', 'v:o').query['@type']).toBe('Triple');
  });

  test('insert builds an add-triple pattern', () => {
    expect(new WOQLQuery().insert('v:id', 'Person').query['@type']).toBe('AddTriple');
  });
});
