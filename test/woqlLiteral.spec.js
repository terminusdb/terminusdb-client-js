const { expect } = require('chai');
const WOQL = require('../lib/woql');

describe('WOQL.literal() tests', () => {
  it('should correctly wrap literal value 0 with xsd:double in DataValue structure', () => {
    const result = WOQL.eq("v:var", WOQL.literal(0, 'xsd:double'));

    const expected = {
      '@type': 'Equals',
      'left': {
        '@type': 'Value',
        'variable': 'var'
      },
      'right': {
        '@type': 'Value',
        'data': {
          '@type': 'xsd:double',
          '@value': 0
        }
      }
    };

    expect(result.query).to.eql(expected);
  });
});
