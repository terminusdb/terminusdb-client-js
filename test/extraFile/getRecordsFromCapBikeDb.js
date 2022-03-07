module.exports = {
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
};
