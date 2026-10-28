/**
 * Unit tests for the WOQL triple_count overloads and triple_range_count
 *
 * Verifies the generated WOQL JSON only; these tests do not connect to a
 * database.
 */

const { expect } = require('chai');
const WOQL = require('../lib/woql');

describe('WOQL triple_count', () => {
  it('generates resource JSON for the two-argument form', () => {
    const query = WOQL.triple_count('admin/minecraft/local/_commits', 'v:c');
    expect(query.json()).to.eql({
      '@type': 'TripleCount',
      resource: 'admin/minecraft/local/_commits',
      count: { '@type': 'Value', variable: 'c' },
    });
  });

  it('generates pattern JSON for subject, predicate, object and count', () => {
    const query = WOQL.triple_count('v:s', 'rdf:type', 'scm:Person', 'v:c');
    expect(query.json()).to.eql({
      '@type': 'TripleCount',
      subject: { '@type': 'NodeValue', variable: 's' },
      predicate: { '@type': 'NodeValue', node: 'rdf:type' },
      object: { '@type': 'Value', node: 'scm:Person' },
      count: { '@type': 'Value', variable: 'c' },
    });
  });

  it('generates pattern JSON with a graph selector', () => {
    const query = WOQL.triple_count('v:s', 'rdf:type', 'scm:Person', 'v:c', 'schema/main');
    const json = query.json();
    expect(json['@type']).to.equal('TripleCount');
    expect(json.graph).to.equal('schema/main');
    expect(json.subject).to.eql({ '@type': 'NodeValue', variable: 's' });
  });

  it('accepts a bound count literal', () => {
    const query = WOQL.triple_count('v:s', 'rdf:type', 'scm:Person', 3);
    expect(query.json().count).to.eql({
      '@type': 'Value',
      data: { '@type': 'xsd:decimal', '@value': 3 },
    });
  });
});

describe('WOQL triple_range_count', () => {
  it('generates range count JSON', () => {
    const query = WOQL.triple_range_count(
      'v:s',
      'age',
      WOQL.literal(10, 'integer'),
      WOQL.literal(18, 'integer'),
      'v:c',
    );
    expect(query.json()).to.eql({
      '@type': 'TripleRangeCount',
      subject: { '@type': 'NodeValue', variable: 's' },
      predicate: { '@type': 'NodeValue', node: 'age' },
      low: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 10 } },
      high: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 18 } },
      count: { '@type': 'Value', variable: 'c' },
    });
  });

  it('generates range count JSON with a graph selector', () => {
    const query = WOQL.quad_range_count(
      'v:s',
      'age',
      WOQL.literal(10, 'integer'),
      WOQL.literal(18, 'integer'),
      'v:c',
      'instance/main',
    );
    const json = query.json();
    expect(json['@type']).to.equal('TripleRangeCount');
    expect(json.graph).to.equal('instance/main');
  });
});
