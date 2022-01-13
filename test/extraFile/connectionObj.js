module.exports = {
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
  'system:agent_key_hash': {
    '@type': 'xsd:string',
    '@value': '$pbkdf2-sha512$t=32768$ISbyCYB0Z2r/00THgkjVTQ$Pua1CJndFkVjOrug6AivfnvU5Q/v3+6Xs+Tb3ybhqf77rlXXlDjE9FkCpXS+f1m0l8+CtkNIkb++Lm+YYcPrig',
  },
  'system:agent_name': {
    '@type': 'xsd:string',
    '@value': 'admin',
  },
  'doc:Database%5fadmin%7CTEST': {
    '@id': 'doc:Database%5fadmin%7CTEST',
    '@type': 'system:Database',
    'rdfs:comment': {
      '@language': 'en',
      '@value': 'TEST',
    },
    'rdfs:label': [
      {
        '@language': 'en',
        '@value': 'TEST',
      },
      {
        '@language': 'en',
        '@value': 'admin|TEST',
      },
    ],
    'system:allow_origin': {
      '@type': 'xsd:string',
      '@value': '*',
    },
    'system:database_state': {
      '@id': 'system:finalized',
      '@type': 'system:DatabaseState',
    },
    'system:resource_name': {
      '@type': 'xsd:string',
      '@value': 'admin|TEST',
    },
    'system:authority': [
      'system:class_frame',
      'system:create_database',
      'system:create_document',
      'system:delete_database',
      'system:delete_document',
      'system:get_document',
      'system:get_schema',
      'system:read_access',
      'system:update_document',
      'system:update_schema',
      'system:write_access',
    ],
  },
  'doc:Database%5fadmin%7Cbike': {
    '@id': 'doc:Database%5fadmin%7Cbike',
    '@type': 'system:Database',
    'rdfs:comment': {
      '@language': 'en',
      '@value': 'bike desc',
    },
    'rdfs:label': [
      {
        '@language': 'en',
        '@value': 'admin|bike',
      },
      {
        '@language': 'en',
        '@value': 'bike test',
      },
    ],
    'system:allow_origin': {
      '@type': 'xsd:string',
      '@value': '*',
    },
    'system:database_state': {
      '@id': 'system:finalized',
      '@type': 'system:DatabaseState',
    },
    'system:resource_name': {
      '@type': 'xsd:string',
      '@value': 'admin|bike',
    },
    'system:authority': [
      'system:class_frame',
      'system:create_database',
      'system:create_document',
      'system:delete_database',
      'system:delete_document',
      'system:get_document',
      'system:get_schema',
      'system:read_access',
      'system:update_document',
      'system:update_schema',
      'system:write_access',
    ],
  },
  'doc:Database%5fadmin%7Ctesting123': {
    '@id': 'doc:Database%5fadmin%7Ctesting123',
    '@type': 'system:Database',
    'rdfs:comment': {
      '@language': 'en',
      '@value': 'thsi is a',
    },
    'rdfs:label': [
      {
        '@language': 'en',
        '@value': 'admin|testing123',
      },
      {
        '@language': 'en',
        '@value': 'this is a test',
      },
    ],
    'system:allow_origin': {
      '@type': 'xsd:string',
      '@value': '*',
    },
    'system:database_state': {
      '@id': 'system:finalized',
      '@type': 'system:DatabaseState',
    },
    'system:resource_name': {
      '@type': 'xsd:string',
      '@value': 'admin|testing123',
    },
    'system:authority': [
      'system:class_frame',
      'system:create_database',
      'system:create_document',
      'system:delete_database',
      'system:delete_document',
      'system:get_document',
      'system:get_schema',
      'system:read_access',
      'system:update_document',
      'system:update_schema',
      'system:write_access',
    ],
  },
  'doc:Database%5ffalse%7Cadfadsf': {
    '@id': 'doc:Database%5ffalse%7Cadfadsf',
    '@type': 'system:Database',
    'rdfs:comment': {
      '@language': 'en',
      '@value': 'asdf',
    },
    'rdfs:label': [
      {
        '@language': 'en',
        '@value': 'asdf',
      },
      {
        '@language': 'en',
        '@value': 'false|adfadsf',
      },
    ],
    'system:allow_origin': {
      '@type': 'xsd:string',
      '@value': '*',
    },
    'system:database_state': {
      '@id': 'system:finalized',
      '@type': 'system:DatabaseState',
    },
    'system:resource_name': {
      '@type': 'xsd:string',
      '@value': 'false|adfadsf',
    },
    'system:authority': [
      'system:class_frame',
      'system:create_database',
      'system:create_document',
      'system:delete_database',
      'system:delete_document',
      'system:get_document',
      'system:get_schema',
      'system:read_access',
      'system:update_document',
      'system:update_schema',
      'system:write_access',
    ],
  },
  'doc:terminus': {
    '@id': 'doc:terminus',
    '@type': 'system:Database',
    'rdfs:comment': {
      '@language': 'en',
      '@value': 'The master database contains the meta-data about databases, users and roles',
    },
    'rdfs:label': {
      '@language': 'en',
      '@value': 'Master Database',
    },
    'system:allow_origin': {
      '@type': 'xsd:string',
      '@value': '*',
    },
    'system:resource_name': {
      '@type': 'xsd:string',
      '@value': 'terminus',
    },
    'system:authority': [
      'system:class_frame',
      'system:create_database',
      'system:create_document',
      'system:delete_database',
      'system:delete_document',
      'system:get_document',
      'system:get_schema',
      'system:read_access',
      'system:update_document',
      'system:update_schema',
      'system:write_access',
    ],
  },
  'doc:server': {
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
        '@id': 'doc:Database%5fadmin%7CTEST',
        '@type': 'system:Database',
      },
      {
        '@id': 'doc:Database%5fadmin%7Cbike',
        '@type': 'system:Database',
      },
      {
        '@id': 'doc:Database%5fadmin%7Ctesting123',
        '@type': 'system:Database',
      },
      {
        '@id': 'doc:Database%5ffalse%7Cadfadsf',
        '@type': 'system:Database',
      },
      {
        '@id': 'doc:terminus',
        '@type': 'system:Database',
      },
    ],
    'system:resource_name': {
      '@type': 'xsd:string',
      '@value': 'http://195.201.12.87:6380',
    },
    'system:authority': [
      'system:class_frame',
      'system:create_database',
      'system:create_document',
      'system:delete_database',
      'system:delete_document',
      'system:get_document',
      'system:get_schema',
      'system:read_access',
      'system:update_document',
      'system:update_schema',
      'system:write_access',
    ],
  },
};
