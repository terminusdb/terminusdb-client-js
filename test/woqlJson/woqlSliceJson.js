/**
 * Expected JSON output for WOQL slice operator tests
 */

const WOQL_SLICE_JSON = {
  // Basic slice with all parameters
  basicSlice: {
    '@type': 'Slice',
    list: {
      '@type': 'DataValue',
      list: [
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'a' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'b' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'c' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'd' } },
      ],
    },
    result: { '@type': 'DataValue', variable: 'Result' },
    start: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 1 } },
    end: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 3 } },
  },

  // Slice with negative indices
  negativeIndices: {
    '@type': 'Slice',
    list: {
      '@type': 'DataValue',
      list: [
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'a' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'b' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'c' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'd' } },
      ],
    },
    result: { '@type': 'DataValue', variable: 'Result' },
    start: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': -2 } },
    end: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': -1 } },
  },

  // Slice without end parameter (optional)
  withoutEnd: {
    '@type': 'Slice',
    list: {
      '@type': 'DataValue',
      list: [
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'a' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'b' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'c' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'd' } },
      ],
    },
    result: { '@type': 'DataValue', variable: 'Result' },
    start: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 1 } },
    // Note: no 'end' property when end is omitted
  },

  // Slice with variable as list input
  variableList: {
    '@type': 'Slice',
    list: { '@type': 'DataValue', variable: 'MyList' },
    result: { '@type': 'DataValue', variable: 'Result' },
    start: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 0 } },
    end: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 2 } },
  },

  // Slice with variable indices
  variableIndices: {
    '@type': 'Slice',
    list: {
      '@type': 'DataValue',
      list: [
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'x' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'y' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'z' } },
      ],
    },
    result: { '@type': 'DataValue', variable: 'Result' },
    start: { '@type': 'DataValue', variable: 'Start' },
    end: { '@type': 'DataValue', variable: 'End' },
  },

  // Slice from start (index 0)
  fromStart: {
    '@type': 'Slice',
    list: {
      '@type': 'DataValue',
      list: [
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'a' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'b' } },
        { '@type': 'DataValue', data: { '@type': 'xsd:string', '@value': 'c' } },
      ],
    },
    result: { '@type': 'DataValue', variable: 'Result' },
    start: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 0 } },
    end: { '@type': 'Value', data: { '@type': 'xsd:integer', '@value': 2 } },
  },
};

module.exports = WOQL_SLICE_JSON;
