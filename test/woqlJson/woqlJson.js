module.exports={
        memberJson:{
            "@type": "woql:Member",
            "woql:member": {
                "@type": "woql:Variable",
                "woql:variable_name": {
                    "@value": "member",
                    "@type": "xsd:string"
                }
            },
            "woql:member_list": {
                "@type": "woql:Variable",
                "woql:variable_name": {
                    "@value": "list_obj",
                    "@type": "xsd:string"
                }
            }
        },
        groupbyJson:{
            "@type": "woql:GroupBy",
            "woql:variable_list": [
                {
                    "@type": "woql:VariableListElement",
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
                    }
                },
                {
                    "@type": "woql:VariableListElement",
                    "woql:index": {
                        "@type": "xsd:nonNegativeInteger",
                        "@value": 1
                    },
                    "woql:variable": {
                        "@type": "woql:Variable",
                        "woql:variable_name": {
                            "@value": "B",
                            "@type": "xsd:string"
                        }
                    }
                }
            ],
            "woql:group_var": [
                "v:C"
            ],
            "woql:grouped": {
                "@type": "woql:Variable",
                "woql:variable_name": {
                    "@value": "New",
                    "@type": "xsd:string"
                }
            },
            "woql:query": {}
        },
        trypleJson:{
            "@type": "woql:Triple",
            "woql:subject": {
                "@type": "woql:Node",
                "woql:node": "doc:a"
            },
            "woql:predicate": {
                "@type": "woql:Node",
                "woql:node": "scm:b"
            },
            "woql:object": {
                "@type": "woql:Datatype",
                "woql:datatype": {
                    "@type": "xsd:string",
                    "@value": "c"
                }
            }
        },
        quadJson:{
            "@type": "woql:Quad",
            "woql:subject": {
                "@type": "woql:Node",
                "woql:node": "doc:a"
            },
            "woql:predicate": {
                "@type": "woql:Node",
                "woql:node": "scm:b"
            },
            "woql:object": {
                "@type": "woql:Datatype",
                "woql:datatype": {
                    "@type": "xsd:string",
                    "@value": "c"
                }
            },
            "woql:graph_filter": {
                "@type": "xsd:string",
                "@value": "d"
            }
        },
        addClassJson:{
            "@type": "woql:AddQuad",
            "woql:subject": {
                "@type": "woql:Node",
                "woql:node": "scm:id"
            },
            "woql:predicate": {
                "@type": "woql:Node",
                "woql:node": "rdf:type"
            },
            "woql:object": {
                "@type": "woql:Node",
                "woql:node": "owl:Class"
            },
            "woql:graph": {
                "@type": "xsd:string",
                "@value": "schema/main"
            }
        },
        subsumptionJson:{
            "@type": "woql:Subsumption",
            "woql:parent": {
                "@type": "woql:Node",
                "woql:node": "scm:ClassA"
            },
            "woql:child": {
                "@type": "woql:Node",
                "woql:node": "scm:ClassB"
            }
        },
        orderbyJson:{
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
                    }
                },
                {
                    "@type": "woql:VariableOrdering",
                    "woql:index": {
                        "@type": "xsd:nonNegativeInteger",
                        "@value": 1
                    },
                    "woql:ascending": {
                        "@type": "xsd:boolean",
                        "@value": true
                    },
                    "woql:variable": {
                        "@type": "woql:Variable",
                        "woql:variable_name": {
                            "@value": "B",
                            "@type": "xsd:string"
                        }
                    }
                },
                {
                    "@type": "woql:VariableOrdering",
                    "woql:index": {
                        "@type": "xsd:nonNegativeInteger",
                        "@value": 2
                    },
                    "woql:ascending": {
                        "@type": "xsd:boolean",
                        "@value": true
                    },
                    "woql:variable": {
                        "@type": "woql:Variable",
                        "woql:variable_name": {
                            "@value": "C",
                            "@type": "xsd:string"
                        }
                    }
                }
            ],
            "woql:query": {}
        },
        isAJson:{
            "@type": "woql:IsA",
            "woql:element": {
                "@type": "woql:Node",
                "woql:node": "doc:instance"
            },
            "woql:of_type": {
                "@type": "woql:Node",
                "woql:node": "owl:Class"
            }
        },
        deleteTripleJson:{
                "@type": "woql:DeleteTriple",
                "woql:subject": {
                    "@type": "woql:Node",
                    "woql:node": "doc:a"
                },
                "woql:predicate": {
                    "@type": "woql:Node",
                    "woql:node": "scm:b"
                },
                "woql:object": {
                    "@type": "woql:Datatype",
                    "woql:datatype": {
                        "@type": "xsd:string",
                        "@value": "c"
                    }
                }
            },
        deleteQuadJson:{
            "@type": "woql:DeleteQuad",
            "woql:subject": {
                "@type": "woql:Node",
                "woql:node": "doc:a"
            },
            "woql:predicate": {
                "@type": "woql:Node",
                "woql:node": "scm:b"
            },
            "woql:object": {
                "@type": "woql:Datatype",
                "woql:datatype": {
                    "@type": "xsd:string",
                    "@value": "c"
                }
            },
            "woql:graph": {
                "@type": "xsd:string",
                "@value": "d"
            }
        },
        addTripleJson:{
                "@type": "woql:AddTriple",
                "woql:subject": {
                    "@type": "woql:Node",
                    "woql:node": "doc:a"
                },
                "woql:predicate": {
                    "@type": "woql:Node",
                    "woql:node": "scm:b"
                },
                "woql:object": {
                    "@type": "woql:Datatype",
                    "woql:datatype": {
                        "@type": "xsd:string",
                        "@value": "c"
                    }
                }
            },
        addQuadJson:{
            "@type": "woql:AddQuad",
            "woql:subject": {
                "@type": "woql:Node",
                "woql:node": "doc:a"
            },
            "woql:predicate": {
                "@type": "woql:Node",
                "woql:node": "scm:b"
            },
            "woql:object": {
                "@type": "woql:Datatype",
                "woql:datatype": {
                    "@type": "xsd:string",
                    "@value": "c"
                }
            },
            "woql:graph": {
                "@type": "xsd:string",
                "@value": "d"
            }
        },
        addPropertyJson:{
                "@type": "woql:And",
                "woql:query_list": [
                    {
                        "@type": "woql:QueryListElement",
                        "woql:index": {
                            "@type": "xsd:nonNegativeInteger",
                            "@value": 0
                        },
                        "woql:query": {
                            "@type": "woql:AddQuad",
                            "woql:subject": {
                                "@type": "woql:Node",
                                "woql:node": "scm:some_property"
                            },
                            "woql:predicate": {
                                "@type": "woql:Node",
                                "woql:node": "rdf:type"
                            },
                            "woql:object": {
                                "@type": "woql:Node",
                                "woql:node": "owl:DatatypeProperty"
                            },
                            "woql:graph": {
                                "@type": "xsd:string",
                                "@value": "schema/main"
                            }
                        }
                    },
                    {
                        "@type": "woql:QueryListElement",
                        "woql:index": {
                            "@type": "xsd:nonNegativeInteger",
                            "@value": 1
                        },
                        "woql:query": {
                            "@type": "woql:AddQuad",
                            "woql:subject": {
                                "@type": "woql:Node",
                                "woql:node": "scm:some_property"
                            },
                            "woql:predicate": {
                                "@type": "woql:Node",
                                "woql:node": "rdfs:range"
                            },
                            "woql:object": {
                                "@type": "woql:Node",
                                "woql:node": "xsd:string"
                            },
                            "woql:graph": {
                                "@type": "xsd:string",
                                "@value": "schema/main"
                            }
                        }
                    }
                ]
            },
            deletePropertyJson:{
                        "@type": "woql:And",
                        "woql:query_list": [
                            {
                                "@type": "woql:QueryListElement",
                                "woql:index": {
                                    "@type": "xsd:nonNegativeInteger",
                                    "@value": 0
                                },
                                "woql:query": {
                                    "@type": "woql:DeleteQuad",
                                    "woql:subject": {
                                        "@type": "woql:Node",
                                        "woql:node": "scm:some_property"
                                    },
                                    "woql:predicate": {
                                        "@type": "woql:Variable",
                                        "woql:variable_name": {
                                            "@value": "All",
                                            "@type": "xsd:string"
                                        }
                                    },
                                    "woql:object": {
                                        "@type": "woql:Variable",
                                        "woql:variable_name": {
                                            "@value": "Al2",
                                            "@type": "xsd:string"
                                        }
                                    },
                                    "woql:graph": {
                                        "@type": "xsd:string",
                                        "@value": "string"
                                    }
                                }
                            },
                            {
                                "@type": "woql:QueryListElement",
                                "woql:index": {
                                    "@type": "xsd:nonNegativeInteger",
                                    "@value": 1
                                },
                                "woql:query": {
                                    "@type": "woql:DeleteQuad",
                                    "woql:subject": {
                                        "@type": "woql:Variable",
                                        "woql:variable_name": {
                                            "@value": "Al3",
                                            "@type": "xsd:string"
                                        }
                                    },
                                    "woql:predicate": {
                                        "@type": "woql:Variable",
                                        "woql:variable_name": {
                                            "@value": "Al4",
                                            "@type": "xsd:string"
                                        }
                                    },
                                    "woql:object": {
                                        "@type": "woql:Node",
                                        "woql:node": "scm:some_property"
                                    },
                                    "woql:graph": {
                                        "@type": "xsd:string",
                                        "@value": "string"
                                    }
                                }
                            }
                        ]
                    }



  
 
  
}
