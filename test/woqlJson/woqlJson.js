module.exports = {
    quadJson: {
        '@type': 'Triple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'a',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'b',
        },
        'object': {
            '@type': 'Value',
            'node':  'c'
        },
        'graph': 'd'
    },
    trypleJson: {
        '@type': 'Triple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'a',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'b',
        },
        'object': {
            '@type': 'Value',
            'node': 'c'
        },
    },
    getJson: {
        '@type': 'Get',
        'columns': [
            {
                '@type': 'Column',
                'indicator': {
                    '@type': 'Indicator',
                    'name': 'M',
                },
                'variable': 'a',
                'type': 'p'
            },
        ],
        'resource': 'Target',
    },
    memberJson: {
        '@type': 'Member',
        'member': {
            '@type': 'Value',
            'variable': 'member'
        },
        'list': {
            '@type': 'Value',
            'variable': 'list_obj'
        },
    },
    groupbyJson: {
        '@type': 'GroupBy',
        'group_by': ['A','B'],
        'template': ['C'],
        'grouped': {
            '@type': 'Value',
            'variable': 'New'
        },
        'query': {
            '@type': 'Triple',
            'subject': {
                '@type': 'NodeValue',
                'variable': 'A'
            },
            'predicate': {
                '@type': 'NodeValue',
                'variable': 'B'
            },
            'object': {
                '@type': 'Value',
                'variable': 'C'
            },
        },
    },

    addClassJson: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'id',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'rdf:type',
        },
        'object': {
            '@type': 'Value',
            'node': 'sys:Class',
        },
        'graph': 'schema'
    },
    subsumptionJson: {
        '@type': 'Subsumption',
        'parent': {
            '@type': 'NodeValue',
            'node': 'ClassA',
        },
        'child': {
            '@type': 'NodeValue',
            'node': 'ClassB',
        },
    },
    orderbyJson: {
    "@type": "OrderBy",
    "ordering": [
        {
            "@type": "OrderTemplate",
            "variable": "A",
            "order" : "asc"
        },
        {
            "@type": "OrderTemplate",
            "variable": "B",
            "order" : "asc"
        },
        {
            "@type": "OrderTemplate",
            "variable": "C",
            "order" : "asc"
        }
    ],
    "query": {
        "@type": "Triple",
        "subject": {
            "@type": "NodeValue",
            "variable": "A"
        },
        "predicate": {
            "@type": "NodeValue",
            "variable": "B"
        },
        "object": {
            "@type": "Value",
            "variable": "C"
        }
    }
},
    isAJson: {
        '@type': 'IsA',
        'element': {
            '@type': 'NodeValue',
            'node': 'instance',
        },
        'type': {
            '@type': 'NodeValue',
            'node': 'Class',
        },
    },
    deleteTripleJson: {
        '@type': 'DeleteTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'a',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'b',
        },
        'object': {
            '@type': 'Value',
            'node': 'c'
        },
    },
    deleteQuadJson: {
        '@type': 'DeleteTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'a',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'b',
        },
        'object': {
            '@type': 'Value',
            'node': 'c'
        },
        'graph': 'd'
    },
    addTripleJson: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'a',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'b',
        },
        'object': {
            '@type': 'Value',
            'node': 'c'
        },
    },
    addQuadJson: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'a',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'b',
        },
        'object': {
            '@type': 'Value',
            'node': 'c'
        },
        'graph': 'd'
    },
    addPropertyJson: {
        '@type': 'And',
        'and': [{
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'some_property',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'Value',
                        'node': 'owl:DatatypeProperty',
                    },
                    'graph': 'schema'
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'some_property',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:range',
                    },
                    'object': {
                        '@type': 'Value',
                        'node': 'xsd:string',
                    },
                    'graph': 'schema'
                },
            ],
    },
    deletePropertyJson: {
        '@type': 'And',
        'and': [
                {
                    '@type': 'DeleteTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'some_property',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'variable': 'All'
                    },
                    'object': {
                        '@type': 'Value',
                        'variable': 'Al2'
                    },
                    'graph': 'string'
                },
                {
                    '@type': 'DeleteTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'variable': 'Al3'
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'variable': 'Al4'
                    },
                    'object': {
                        '@type': 'Value',
                        'node': 'some_property',
                    },
                    'graph': 'string'
                },
            ],
    },
    graphMethodJson: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'x',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'rdfs:label',
        },
        'object': {
            '@type': 'Value',
            'data': {
                '@value': 'my label',
                '@type': 'xsd:string',
                '@language': 'en',
            },
        },
        'graph': 'schema'
    },
    labelMethodJson: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'x',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'rdfs:label',
        },
        'object': {
            '@type': 'Value',
            'data': {
                '@value': 'my label',
                '@type': 'xsd:string',
                '@language': 'en',
            },
        },
        'graph': 'schema'
    },
    labelMethodJson2: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'x',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'rdfs:label',
        },
        'object': {
            '@type': 'Value',
            'variable': 'label'
        },
        'graph': 'schema'
    },
    addClassDescJson: {
        '@type': 'And',
        'and': [
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'NewClass',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:Class',
                    },
                    'graph': 'schema'
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'NewClass',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:comment',
                    },
                    'object': {
                        '@type': 'Value',
                        'data': {
                            '@value': 'A new class object.',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'graph': 'schema'
                },
        ],
    },
    addNodePropJson: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'x',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'myprop',
        },
        'object': {
            '@type': 'Value',
            'node': 'value'
        },
    },
    nodeParentJson: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'x',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'rdfs:subClassOf',
        },
        'object': {
            '@type': 'Value',
            'node': 'classParentName',
        },
        'graph': 'schema'
    },
    nodeAbstractJson: {
        '@type': 'AddTriple',
        'subject': {
            '@type': 'NodeValue',
            'node': 'x',
        },
        'predicate': {
            '@type': 'NodeValue',
            'node': 'system:tag',
        },
        'object': {
            '@type': 'Value',
            'node': 'system:abstract',
        },
        'graph': 'schema'

    },
    propertyMaxJson: {
        '@type': 'And',
        'query_list': [
               {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:ValueProperty',
                    },
                    'graph': 'schema'
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:range',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'xsd:string',
                    },
                    'graph': 'schema'
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:domain',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'A',
                    },
                    'graph': 'schema',
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_max_4',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:Restriction',
                    },
                    'graph': 'schema',
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_max_4',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'owl:onProperty',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'graph': 'schema',
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_max_4',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'owl:maxCardinality',
                    },
                    'object': {
                        '@type': 'Value',
                        'data': {
                            '@value': 4,
                            '@type': 'xsd:nonNegativeInteger',
                        },
                    },
                    'graph': 'schema',
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'A',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:subClassOf',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'P_max_4',
                    },
                    'graph': 'schema',
                },
          ],
    },
    propMinJson: {
        '@type': 'And',
        'and': [
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:ValueProperty',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:range',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'xsd:string',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:domain',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'A',
                    },
                    'graph': 'schema',
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_min_2',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:Restriction',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_min_2',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'owl:onProperty',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_min_2',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'owl:minCardinality',
                    },
                    'object': {
                        '@type': 'Value',
                        'data': {
                            '@value': 2,
                            '@type': 'xsd:nonNegativeInteger',
                        },
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'A',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:subClassOf',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'P_min_2',
                    },
                    'graph': 'schema',
              },
         ],
    },
    propCardinalityJson: {
        '@type': 'And',
        'and': [
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:ValueProperty',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:range',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'xsd:string',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:domain',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'A',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_cardinality_3',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:Restriction',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_cardinality_3',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'owl:onProperty',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'P',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'P_cardinality_3',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'owl:cardinality',
                    },
                    'object': {
                        '@type': 'Value',
                        'data': {
                            '@value': 3,
                            '@type': 'xsd:nonNegativeInteger',
                        },
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'A',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:subClassOf',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'P_cardinality_3',
                    },
                    'graph': 'schema',
            },
        ],
    },
    chainInsertJson: {
        '@type': 'And',
        'and': [
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'variable': 'Node_ID'
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'Variable',
                        'variable': 'Type'
                    },
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'variable': 'Node_ID'
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:label',
                    },
                    'object': {
                        '@type': 'Value',
                        'variable': 'Label'
                    },
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'variable': 'Node_ID'
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:comment',
                    },
                    'object': {
                        '@type': 'Value',
                        'variable': 'Description'
                    },
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'variable': 'Node_ID'
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'prop',
                    },
                    'object': {
                        '@type': 'Value',
                        'variable': 'Prop'
                    },
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'variable': 'Node_ID'
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'prop',
                    },
                    'object': {
                        '@type': 'Value',
                        'variable': 'Prop2'
                    },
                },
                {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'variable': 'Node_ID'
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:subClassOf',
                    },
                    'object': {
                        '@type': 'Value',
                        'node': 'myParentClass',
                    },
               },
        ],
    },
    chainDoctypeJson: {
        '@type': 'And',
        'and': [
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'MyDoc',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:Class',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'MyDoc',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:subClassOf',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'system:Document',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'MyDoc',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:label',
                    },
                    'object': {
                        '@type': 'Value',
                        'data': {
                            '@value': 'abc',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'MyDoc',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:comment',
                    },
                    'object': {
                        '@type': 'Value',
                        'data': {
                            '@value': 'abcd',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'prop',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:ValueProperty',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'prop',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:range',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'xsd:dateTime',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'prop',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:domain',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'MyDoc',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'prop',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:label',
                    },
                    'object': {
                        '@type': 'Value',
                        'data': {
                            '@value': 'aaa',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'prop2',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdf:type',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'owl:DatatypeProperty',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'prop2',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:range',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'xsd:integer',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'prop2',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:domain',
                    },
                    'object': {
                        '@type': 'NodeValue',
                        'node': 'MyDoc',
                    },
                    'graph': 'schema',
            },
            {
                    '@type': 'AddTriple',
                    'subject': {
                        '@type': 'NodeValue',
                        'node': 'prop2',
                    },
                    'predicate': {
                        '@type': 'NodeValue',
                        'node': 'rdfs:label',
                    },
                    'object': {
                        '@type': 'Value',
                        'data': {
                            '@value': 'abe',
                            '@type': 'xsd:string',
                            '@language': 'en',
                        },
                    },
                    'graph': 'schema'
              },
        ],
    },
}
