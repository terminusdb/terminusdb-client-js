module.exports = {
  '@context': {
    doc: 'http://localhost/terminus/document/',
    owl: 'http://www.w3.org/2002/07/owl#',
    rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
    rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
    system: 'https://localhost/ontology/system#',
    xsd: 'http://www.w3.org/2001/XMLSchema#',
  },
  '@id': 'doc:admin',
  '@type': 'system:User',
  'rdfs:comment': {
    '@language': 'en',
    '@value': 'This is the server super user account',
  },
  'rdfs:label': {
    '@language': 'en',
    '@value': 'Server Admin User',
  },
  'system:authority': {
    '@id': 'doc:access_all_areas',
    '@type': 'system:ServerCapability',
    'rdfs:comment': {
      '@language': 'en',
      '@value': 'Access all server functions',
    },
    'rdfs:label': {
      '@language': 'en',
      '@value': 'All Capabilities',
    },
    'system:action': [
      {
        '@id': 'system:class_frame',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:create_database',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:create_document',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:delete_database',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:delete_document',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:get_document',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:get_schema',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:update_document',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:update_schema',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:woql_select',
        '@type': 'system:DBAction',
      },
      {
        '@id': 'system:woql_update',
        '@type': 'system:DBAction',
      },
    ],
    'system:authority_scope': [
      {
        '@id': 'doc:first_database',
        '@type': 'system:Database',
        'rdfs:comment': {
          '@language': 'en',
          '@value': 'First TerminusDB',
        },
        'rdfs:label': {
          '@language': 'en',
          '@value': 'First TerminusDB',
        },
        'system:allow_origin': {
          '@type': 'xsd:string',
          '@value': '*',
        },
      },
      {
        '@id': 'doc:second_database',
        '@type': 'system:Database',
        'rdfs:comment': {
          '@language': 'en',
          '@value': 'Second TerminusDB',
        },
        'rdfs:label': {
          '@language': 'en',
          '@value': 'Second TerminusDB',
        },
        'system:allow_origin': {
          '@type': 'xsd:string',
          '@value': '*',
        },
      },
      {
        '@id': 'doc:test_database',
        '@type': 'system:Database',
        'rdfs:comment': {
          '@language': 'en',
          '@value': 'Test TerminusDB',
        },
        'rdfs:label': {
          '@language': 'en',
          '@value': 'Test TerminusDB',
        },
        'system:allow_origin': {
          '@type': 'xsd:string',
          '@value': '*',
        },
      },
      {
        '@id': 'doc:terminus',
        '@type': 'system:Database',
        'rdfs:comment': {
          '@language': 'en',
          '@value':
                        'The master database contains the meta-data about databases, users and roles',
        },
        'rdfs:label': {
          '@language': 'en',
          '@value': 'Master Database',
        },
        'system:allow_origin': {
          '@type': 'xsd:string',
          '@value': '*',
        },
      },
      {
        '@id': 'doc:server',
        '@type': 'system:Server',
        'rdfs:comment': {
          '@language': 'en',
          '@value': 'The current Database Server itself',
        },
        'rdfs:label': {
          '@language': 'en',
          '@value': 'The DB server',
        },
        'system:allow_origin': {
          '@type': 'xsd:string',
          '@value': '*',
        },
        'system:resource_includes': [
          {
            '@id': 'doc:first_database',
            '@type': 'system:Database',
          },
          {
            '@id': 'doc:second_database',
            '@type': 'system:Database',
          },
          {
            '@id': 'doc:terminus',
            '@type': 'system:Database',
          },
        ],
      },
    ],
  },
};
