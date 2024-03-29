module.exports = {
  divJson: {
    '@type': 'Div',
    left: {
      '@type': 'ArithmeticValue',
      data: { '@type': 'xsd:decimal', '@value': '2' },
    },
    right: {
      '@type': 'ArithmeticValue',
      data: { '@type': 'xsd:decimal', '@value': '1' },
    },
  },
  minusJson: {
    '@type': 'Minus',
    left: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '2',
      },
    },
    right: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '1',
      },
    },
  },
  evalJson: {
    '@type': 'Eval',
    expression: '1+2',
    result: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:string',
        '@value': 'b',
      },
    },
  },
  plusJson: {
    '@type': 'Plus',
    left: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '2',
      },
    },
    right: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '1',
      },
    },
  },
  timesJson: {
    '@type': 'Times',
    left: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '2',
      },
    },
    right: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '1',
      },
    },
  },
  divideJson: {
    '@type': 'Divide',
    left: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '2',
      },
    },
    right: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '1',
      },
    },
  },
  expJson: {
    '@type': 'Exp',
    left: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '2',
      },
    },
    right: {
      '@type': 'ArithmeticValue',
      data: {
        '@type': 'xsd:decimal',
        '@value': '1',
      },
    },
  },
};
