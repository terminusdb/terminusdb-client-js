module.exports = {
    quadJson: {
        '@type': 'woql:Quad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:a',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'scm:b',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@type': 'xsd:string',
                '@value': 'c',
            },
        },
        'woql:graph_filter': {
            '@type': 'xsd:string',
            '@value': 'd',
        },
    },
    trypleJson: {
        '@type': 'woql:Triple',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:a',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'scm:b',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@type': 'xsd:string',
                '@value': 'c',
            },
        },
    },
    getJson: {
        '@type': 'woql:Get',
        'woql:as_vars': [
            {
                '@type': 'woql:NamedAsVar',
                'woql:identifier': {
                    '@type': 'xsd:string',
                    '@value': 'M',
                },
                'woql:variable_name': {
                    '@type': 'xsd:string',
                    '@value': 'a',
                },
                'woql:var_type': {
                    '@type': 'xsd:anyURI',
                    '@value': 'p',
                },
            },
        ],
        'woql:query_resource': 'Target',
    },
    memberJson: {
        '@type': 'woql:Member',
        'woql:member': {
            '@type': 'woql:Variable',
            'woql:variable_name': {
                '@value': 'member',
                '@type': 'xsd:string',
            },
        },
        'woql:member_list': {
            '@type': 'woql:Variable',
            'woql:variable_name': {
                '@value': 'list_obj',
                '@type': 'xsd:string',
            },
        },
    },
    groupbyJson: {
        '@type': 'woql:GroupBy',
        'woql:group_by': [
            {
                '@type': 'woql:VariableListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:variable_name': {
                    '@value': 'A',
                    '@type': 'xsd:string',
                },
            },
            {
                '@type': 'woql:VariableListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:variable_name': {
                    '@value': 'B',
                    '@type': 'xsd:string',
                },
            },
        ],
        'woql:group_template': [
            {
                '@type': 'woql:VariableListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:variable_name': {
                    '@value': 'C',
                    '@type': 'xsd:string',
                },
            },
        ],
        'woql:grouped': {
            '@type': 'woql:Variable',
            'woql:variable_name': {
                '@value': 'New',
                '@type': 'xsd:string',
            },
        },
        'woql:query': {
            '@type': 'woql:Triple',
            'woql:subject': {
                '@type': 'woql:Variable',
                'woql:variable_name': {
                    '@value': 'A',
                    '@type': 'xsd:string',
                },
            },
            'woql:predicate': {
                '@type': 'woql:Variable',
                'woql:variable_name': {
                    '@value': 'B',
                    '@type': 'xsd:string',
                },
            },
            'woql:object': {
                '@type': 'woql:Variable',
                'woql:variable_name': {
                    '@value': 'C',
                    '@type': 'xsd:string',
                },
            },
        },
    },

    addClassJson: {
        '@type': 'woql:AddQuad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'scm:id',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'rdf:type',
        },
        'woql:object': {
            '@type': 'woql:Node',
            'woql:node': 'owl:Class',
        },
        'woql:graph': {
            '@type': 'xsd:string',
            '@value': 'schema/main',
        },
    },
    subsumptionJson: {
        '@type': 'woql:Subsumption',
        'woql:parent': {
            '@type': 'woql:Node',
            'woql:node': 'scm:ClassA',
        },
        'woql:child': {
            '@type': 'woql:Node',
            'woql:node': 'scm:ClassB',
        },
    },
    orderbyJson: {
        "@type": "woql:OrderBy",
        "woql:variable_ordering": [
            {
                "@type": "woql:VariableOrdering",
                "woql:index": {
                    "@type": "xsd:nonNegativeInteger",
                    "@value": 0
                },
                "woql:variable": {
                    "@type": "woql:Variable",
                    "woql:variable_name": {
                        "@value": "A",
                        "@type": "xsd:string"
                    }
                },
                "woql:descending": {
                    "@type": "xsd:boolean",
                    "@value": true
                }
            },
            {
                "@type": "woql:VariableOrdering",
                "woql:index": {
                    "@type": "xsd:nonNegativeInteger",
                    "@value": 1
                },
                "woql:variable": {
                    "@type": "woql:Variable",
                    "woql:variable_name": {
                        "@value": "B asc",
                        "@type": "xsd:string"
                    }
                },
                "woql:descending": {
                    "@type": "xsd:boolean",
                    "@value": true
                }
            },
            {
                "@type": "woql:VariableOrdering",
                "woql:index": {
                    "@type": "xsd:nonNegativeInteger",
                    "@value": 2
                },
                "woql:variable": {
                    "@type": "woql:Variable",
                    "woql:variable_name": {
                        "@value": "C asc",
                        "@type": "xsd:string"
                    }
                },
                "woql:descending": {
                    "@type": "xsd:boolean",
                    "@value": true
                }
            }
        ],
        "woql:query": {
            "@type": "woql:Triple",
            "woql:subject": {
                "@type": "woql:Variable",
                "woql:variable_name": {
                    "@value": "A",
                    "@type": "xsd:string"
                }
            },
            "woql:predicate": {
                "@type": "woql:Variable",
                "woql:variable_name": {
                    "@value": "B",
                    "@type": "xsd:string"
                }
            },
            "woql:object": {
                "@type": "woql:Variable",
                "woql:variable_name": {
                    "@value": "C",
                    "@type": "xsd:string"
                }
            }
        }
    },
    isAJson: {
        '@type': 'woql:IsA',
        'woql:element': {
            '@type': 'woql:Node',
            'woql:node': 'doc:instance',
        },
        'woql:of_type': {
            '@type': 'woql:Node',
            'woql:node': 'owl:Class',
        },
    },
    deleteTripleJson: {
        '@type': 'woql:DeleteTriple',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:a',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'scm:b',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@type': 'xsd:string',
                '@value': 'c',
            },
        },
    },
    deleteQuadJson: {
        '@type': 'woql:DeleteQuad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:a',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'scm:b',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@type': 'xsd:string',
                '@value': 'c',
            },
        },
        'woql:graph': {
            '@type': 'xsd:string',
            '@value': 'd',
        },
    },
    addTripleJson: {
        '@type': 'woql:AddTriple',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:a',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'scm:b',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@type': 'xsd:string',
                '@value': 'c',
            },
        },
    },
    addQuadJson: {
        '@type': 'woql:AddQuad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:a',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'scm:b',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@type': 'xsd:string',
                '@value': 'c',
            },
        },
        'woql:graph': {
            '@type': 'xsd:string',
            '@value': 'd',
        },
    },
    addPropertyJson: {
        '@type': 'woql:And',
        'woql:query_list': [
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:some_property',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:DatatypeProperty',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:some_property',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:range',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'xsd:string',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
        ],
    },
    deletePropertyJson: {
        '@type': 'woql:And',
        'woql:query_list': [
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:query': {
                    '@type': 'woql:DeleteQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:some_property',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'All',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:object': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Al2',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'string',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:query': {
                    '@type': 'woql:DeleteQuad',
                    'woql:subject': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Al3',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:predicate': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Al4',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:some_property',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'string',
                    },
                },
            },
        ],
    },
    graphMethodJson: {
        '@type': 'woql:AddQuad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:x',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'rdfs:label',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@value': 'my label',
                '@type': 'xsd:string',
                '@language': 'en',
            },
        },
        'woql:graph': {
            '@type': 'xsd:string',
            '@value': 'schema/main',
        },
    },
    labelMethodJson: {
        '@type': 'woql:AddQuad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:x',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'rdfs:label',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@value': 'my label',
                '@type': 'xsd:string',
                '@language': 'en',
            },
        },
        'woql:graph': {
            '@type': 'xsd:string',
            '@value': 'schema/main',
        },
    },
    labelMethodJson2: {
        '@type': 'woql:AddQuad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:x',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'rdfs:label',
        },
        'woql:object': {
            '@type': 'woql:Variable',
            'woql:variable_name': {
                '@value': 'label',
                '@type': 'xsd:string',
            },
        },
        'woql:graph': {
            '@type': 'xsd:string',
            '@value': 'schema/main',
        },
    },
    addClassDescJson: {
        '@type': 'woql:And',
        'woql:query_list': [
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:NewClass',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:Class',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:NewClass',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:comment',
                    },
                    'woql:object': {
                        '@type': 'woql:Datatype',
                        'woql:datatype': {
                            '@value': 'A new class object.',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
        ],
    },
    addNodePropJson: {
        '@type': 'woql:AddTriple',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:x',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'scm:myprop',
        },
        'woql:object': {
            '@type': 'woql:Datatype',
            'woql:datatype': {
                '@type': 'xsd:string',
                '@value': 'value',
            },
        },
    },
    nodeParentJson: {
        '@type': 'woql:AddQuad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:x',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'rdfs:subClassOf',
        },
        'woql:object': {
            '@type': 'woql:Node',
            'woql:node': 'scm:classParentName',
        },
        'woql:graph': {
            '@type': 'xsd:string',
            '@value': 'schema/main',
        },
    },
    nodeAbstractJson: {
        '@type': 'woql:AddQuad',
        'woql:subject': {
            '@type': 'woql:Node',
            'woql:node': 'doc:x',
        },
        'woql:predicate': {
            '@type': 'woql:Node',
            'woql:node': 'system:tag',
        },
        'woql:object': {
            '@type': 'woql:Node',
            'woql:node': 'system:abstract',
        },
        'woql:graph': {
            '@type': 'xsd:string',
            '@value': 'schema/main',
        },

    },
    propertyMaxJson: {
        '@type': 'woql:And',
        'woql:query_list': [
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:DatatypeProperty',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:range',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'xsd:string',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 2,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:domain',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:A',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 3,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_max',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:Restriction',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 4,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_max',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:onProperty',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 5,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_max',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:maxCardinality',
                    },
                    'woql:object': {
                        '@type': 'woql:Datatype',
                        'woql:datatype': {
                            '@value': 4,
                            '@type': 'xsd:nonNegativeInteger',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 6,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:A',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:subClassOf',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_max',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
        ],
    },
    propMinJson: {
        '@type': 'woql:And',
        'woql:query_list': [
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:DatatypeProperty',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:range',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'xsd:string',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 2,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:domain',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:A',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 3,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_min',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:Restriction',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 4,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_min',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:onProperty',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 5,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_min',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:minCardinality',
                    },
                    'woql:object': {
                        '@type': 'woql:Datatype',
                        'woql:datatype': {
                            '@value': 2,
                            '@type': 'xsd:nonNegativeInteger',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 6,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:A',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:subClassOf',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_min',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
        ],
    },
    propCardinalityJson: {
        '@type': 'woql:And',
        'woql:query_list': [
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:DatatypeProperty',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:range',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'xsd:string',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 2,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:domain',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:A',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 3,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_cardinality',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:Restriction',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 4,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_cardinality',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:onProperty',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 5,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_cardinality',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:cardinality',
                    },
                    'woql:object': {
                        '@type': 'woql:Datatype',
                        'woql:datatype': {
                            '@value': 3,
                            '@type': 'xsd:nonNegativeInteger',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 6,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:A',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:subClassOf',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:P_cardinality',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
        ],
    },
    chainInsertJson: {
        '@type': 'woql:And',
        'woql:query_list': [
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:query': {
                    '@type': 'woql:AddTriple',
                    'woql:subject': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Node_ID',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Type',
                            '@type': 'xsd:string',
                        },
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:query': {
                    '@type': 'woql:AddTriple',
                    'woql:subject': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Node_ID',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:label',
                    },
                    'woql:object': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Label',
                            '@type': 'xsd:string',
                        },
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 2,
                },
                'woql:query': {
                    '@type': 'woql:AddTriple',
                    'woql:subject': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Node_ID',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:comment',
                    },
                    'woql:object': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Description',
                            '@type': 'xsd:string',
                        },
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 3,
                },
                'woql:query': {
                    '@type': 'woql:AddTriple',
                    'woql:subject': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Node_ID',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop',
                    },
                    'woql:object': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Prop',
                            '@type': 'xsd:string',
                        },
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 4,
                },
                'woql:query': {
                    '@type': 'woql:AddTriple',
                    'woql:subject': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Node_ID',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop',
                    },
                    'woql:object': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Prop2',
                            '@type': 'xsd:string',
                        },
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 5,
                },
                'woql:query': {
                    '@type': 'woql:AddTriple',
                    'woql:subject': {
                        '@type': 'woql:Variable',
                        'woql:variable_name': {
                            '@value': 'Node_ID',
                            '@type': 'xsd:string',
                        },
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:subClassOf',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:myParentClass',
                    },
                },
            },
        ],
    },
    chainDoctypeJson: {
        '@type': 'woql:And',
        'woql:query_list': [
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 0,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:MyDoc',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:Class',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 1,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:MyDoc',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:subClassOf',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'system:Document',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 2,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:MyDoc',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:label',
                    },
                    'woql:object': {
                        '@type': 'woql:Datatype',
                        'woql:datatype': {
                            '@value': 'abc',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 3,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:MyDoc',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:comment',
                    },
                    'woql:object': {
                        '@type': 'woql:Datatype',
                        'woql:datatype': {
                            '@value': 'abcd',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 4,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:DatatypeProperty',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 5,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:range',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'xsd:dateTime',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 6,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:domain',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:MyDoc',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 7,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:label',
                    },
                    'woql:object': {
                        '@type': 'woql:Datatype',
                        'woql:datatype': {
                            '@value': 'aaa',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 8,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop2',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdf:type',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'owl:DatatypeProperty',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 9,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop2',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:range',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'xsd:integer',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 10,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop2',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:domain',
                    },
                    'woql:object': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:MyDoc',
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
            {
                '@type': 'woql:QueryListElement',
                'woql:index': {
                    '@type': 'xsd:nonNegativeInteger',
                    '@value': 11,
                },
                'woql:query': {
                    '@type': 'woql:AddQuad',
                    'woql:subject': {
                        '@type': 'woql:Node',
                        'woql:node': 'scm:prop2',
                    },
                    'woql:predicate': {
                        '@type': 'woql:Node',
                        'woql:node': 'rdfs:label',
                    },
                    'woql:object': {
                        '@type': 'woql:Datatype',
                        'woql:datatype': {
                            '@value': 'abe',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'woql:graph': {
                        '@type': 'xsd:string',
                        '@value': 'schema/main',
                    },
                },
            },
        ],
    },
}
