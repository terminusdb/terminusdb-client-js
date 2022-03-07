module.exports = {
  '@type': 'When',
  query: {
    '@type': 'True',
  },
  consequent: {
    '@type': 'AddTriple',
    subject: {
      '@type': 'NodeValue',
      node: 'scm:id',
    },
    predicate: {
      '@type': 'NodeValue',
      node: 'rdf:type',
    },
    object: {
      '@type': 'NodeValue',
      node: 'owl:Class',
    },
    graph: 'schema',
  },
};
