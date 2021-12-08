module.exports = {
    '@context': {
        doc: 'system:///terminus/document/',
        layer: 'http://terminusdb.com/schema/layer#',
        owl: 'http://www.w3.org/2002/07/owl#',
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
        ref: 'http://terminusdb.com/schema/ref#',
        repo: 'http://terminusdb.com/schema/repository#',
        system: 'http://terminusdb.com/schema/system#',
        vio: 'http://terminusdb.com/schema/vio#',
        woql: 'http://terminusdb.com/schema/woql#',
        xdd: 'http://terminusdb.com/schema/xdd#',
        xsd: 'http://www.w3.org/2001/XMLSchema#',
    },
    '@id': 'doc:admin',
    '@type': 'system:User',
    'rdfs:comment': {'@language': 'en', '@value': 'This is the server super user account'},
    'rdfs:label': {'@language': 'en', '@value': 'Server Admin User'},
    'system:agent_key_hash': {
        '@type': 'xsd:string',
        '@value':
            '$pbkdf2-sha512$t=32768$ISbyCYB0Z2r/00THgkjVTQ$Pua1CJndFkVjOrug6AivfnvU5Q/v3+6Xs+Tb3ybhqf77rlXXlDjE9FkCpXS+f1m0l8+CtkNIkb++Lm+YYcPrig',
    },
    'system:agent_name': {'@type': 'xsd:string', '@value': 'admin'},
    'system:authority': {
        '@id': 'doc:access_all_areas',
        '@type': 'system:ServerCapability',
        'rdfs:comment': {'@language': 'en', '@value': 'Access all server functions'},
        'rdfs:label': {'@language': 'en', '@value': 'All Capabilities'},
        'system:access': {
            '@id': 'doc:server_access',
            '@type': 'system:Access',
            'system:action': [
                {'@id': 'system:class_frame', '@type': 'system:DBAction'},
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
                {'@id': 'system:get_document', '@type': 'system:DBAction'},
                {'@id': 'system:get_schema', '@type': 'system:DBAction'},
                {'@id': 'system:read_access', '@type': 'system:DBAction'},
                {
                    '@id': 'system:update_document',
                    '@type': 'system:DBAction',
                },
                {'@id': 'system:update_schema', '@type': 'system:DBAction'},
                {'@id': 'system:write_access', '@type': 'system:DBAction'},
            ],
            'system:authority_scope': [
                {
                    '@id': 'doc:Database%5fadmin%7CTEST',
                    '@type': 'system:Database',
                    'rdfs:comment': {'@language': 'en', '@value': 'TEST'},
                    'rdfs:label': [
                        {'@language': 'en', '@value': 'TEST'},
                        {'@language': 'en', '@value': 'admin|TEST'},
                    ],
                    'system:allow_origin': {'@type': 'xsd:string', '@value': '*'},
                    'system:database_state': {
                        '@id': 'system:finalized',
                        '@type': 'system:DatabaseState',
                    },
                    'system:resource_name': {'@type': 'xsd:string', '@value': 'admin|TEST'},
                },
                {
                    '@id': 'doc:Database%5fadmin%7Cbike',
                    '@type': 'system:Database',
                    'rdfs:comment': {'@language': 'en', '@value': 'bike desc'},
                    'rdfs:label': [
                        {'@language': 'en', '@value': 'admin|bike'},
                        {'@language': 'en', '@value': 'bike test'},
                    ],
                    'system:allow_origin': {'@type': 'xsd:string', '@value': '*'},
                    'system:database_state': {
                        '@id': 'system:finalized',
                        '@type': 'system:DatabaseState',
                    },
                    'system:resource_name': {'@type': 'xsd:string', '@value': 'admin|bike'},
                },
                {
                    '@id': 'doc:Database%5fadmin%7Ctesting123',
                    '@type': 'system:Database',
                    'rdfs:comment': {'@language': 'en', '@value': 'thsi is a'},
                    'rdfs:label': [
                        {'@language': 'en', '@value': 'admin|testing123'},
                        {'@language': 'en', '@value': 'this is a test'},
                    ],
                    'system:allow_origin': {'@type': 'xsd:string', '@value': '*'},
                    'system:database_state': {
                        '@id': 'system:finalized',
                        '@type': 'system:DatabaseState',
                    },
                    'system:resource_name': {'@type': 'xsd:string', '@value': 'admin|testing123'},
                },
                {
                    '@id': 'doc:Database%5ffalse%7Cadfadsf',
                    '@type': 'system:Database',
                    'rdfs:comment': {'@language': 'en', '@value': 'asdf'},
                    'rdfs:label': [
                        {'@language': 'en', '@value': 'asdf'},
                        {'@language': 'en', '@value': 'false|adfadsf'},
                    ],
                    'system:allow_origin': {'@type': 'xsd:string', '@value': '*'},
                    'system:database_state': {
                        '@id': 'system:finalized',
                        '@type': 'system:DatabaseState',
                    },
                    'system:resource_name': {'@type': 'xsd:string', '@value': 'false|adfadsf'},
                },
                {
                    '@id': 'doc:terminus',
                    '@type': 'system:Database',
                    'rdfs:comment': {
                        '@language': 'en',
                        '@value':
                            'The master database contains the meta-data about databases, users and roles',
                    },
                    'rdfs:label': {'@language': 'en', '@value': 'Master Database'},
                    'system:allow_origin': {'@type': 'xsd:string', '@value': '*'},
                    'system:resource_name': {'@type': 'xsd:string', '@value': 'terminus'},
                },
                {
                    '@id': 'doc:server',
                    '@type': 'system:Server',
                    'rdfs:comment': {
                        '@language': 'en',
                        '@value': 'The current Database Server itself',
                    },
                    'rdfs:label': {'@language': 'en', '@value': 'The DB server'},
                    'system:allow_origin': {'@type': 'xsd:string', '@value': '*'},
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
                        {'@id': 'doc:terminus', '@type': 'system:Database'},
                    ],
                    'system:resource_name': {
                        '@type': 'xsd:string',
                        '@value': 'http://195.201.12.87:6380',
                    },
                },
            ],
        },
    },
}
