const { expect } = require('chai');

const WOQL = require('../lib/woql');
const { Doc } = require('../lib/query/woqlDoc');

/**
 * Test for update_document with a list of subdocuments
 *
 * This test verifies that the WOQL builder correctly converts
 * update_document calls with nested Doc() objects containing lists
 * of subdocuments.
 *
 * Issue: When using new Doc() inside another Doc(), the convert()
 * function may double-wrap the already-converted structure.
 */
describe('WOQL update_document with list of subdocuments', () => {
  // The expected correct WOQL JSON structure for updating a document
  // with a list of subdocuments
  const expectedUpdateDocWithListJson = {
    '@type': 'UpdateDocument',
    document: {
      '@type': 'Value',
      dictionary: {
        '@type': 'DictionaryTemplate',
        data: [
          {
            '@type': 'FieldValuePair',
            field: '@type',
            value: { '@type': 'Value', data: { '@type': 'xsd:string', '@value': 'UpdateList' } },
          },
          {
            '@type': 'FieldValuePair',
            field: '@id',
            value: { '@type': 'Value', data: { '@type': 'xsd:string', '@value': 'UpdateList/list' } },
          },
          {
            '@type': 'FieldValuePair',
            field: 'list',
            value: {
              '@type': 'Value',
              list: [
                {
                  '@type': 'Value',
                  dictionary: {
                    '@type': 'DictionaryTemplate',
                    data: [
                      {
                        '@type': 'FieldValuePair',
                        field: '@type',
                        value: { '@type': 'Value', data: { '@type': 'xsd:string', '@value': 'Structure' } },
                      },
                      {
                        '@type': 'FieldValuePair',
                        field: 'string',
                        value: { '@type': 'Value', data: { '@type': 'xsd:string', '@value': '3' } },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  };

  it('should correctly convert update_document with nested Doc in list', () => {
    // This is what the user is trying to do:
    const woqlObject = WOQL.update_document(
      new Doc({
        '@type': 'UpdateList',
        '@id': 'UpdateList/list',
        list: [new Doc({ '@type': 'Structure', string: '3' })],
      }),
    );

    const result = woqlObject.json();
    expect(result).to.deep.equal(expectedUpdateDocWithListJson);
  });

  it('should correctly convert Doc with list of plain objects (no nested Doc)', () => {
    // Alternative approach: use plain objects in the list
    const woqlObject = WOQL.update_document(
      new Doc({
        '@type': 'UpdateList',
        '@id': 'UpdateList/list',
        list: [{ '@type': 'Structure', string: '3' }], // Plain object, not new Doc()
      }),
    );

    const result = woqlObject.json();
    expect(result).to.deep.equal(expectedUpdateDocWithListJson);
  });

  it('should show what new Doc() returns directly', () => {
    // Test what Doc returns to understand the conversion
    const subdoc = new Doc({ '@type': 'Structure', string: '3' });

    // Doc should return a properly converted Value/DictionaryTemplate structure
    const expectedSubdoc = {
      '@type': 'Value',
      dictionary: {
        '@type': 'DictionaryTemplate',
        data: [
          {
            '@type': 'FieldValuePair',
            field: '@type',
            value: { '@type': 'Value', data: { '@type': 'xsd:string', '@value': 'Structure' } },
          },
          {
            '@type': 'FieldValuePair',
            field: 'string',
            value: { '@type': 'Value', data: { '@type': 'xsd:string', '@value': '3' } },
          },
        ],
      },
    };

    expect(subdoc).to.deep.equal(expectedSubdoc);
  });
});
