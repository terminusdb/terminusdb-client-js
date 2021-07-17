module.exports={
    "@type": "And",
    "and": [
             {
                "@type": "AddTriple",
                "subject": {
                    "@type": "NodeValue",
                    "node": "scm:Station"
                },
                "predicate": {
                    "@type": "NodeValue",
                    "node": "rdf:type"
                },
                "object": {
                    "@type": "Value",
                    "node": "owl:Class"
                },
                "graph": "schema"
             },
             {
                "@type": "AddTriple",
                "subject": {
                    "@type": "NodeValue",
                    "node": "scm:Station"
                },
                "predicate": {
                    "@type": "NodeValue",
                    "node": "rdfs:subClassOf"
                },
                "object": {
                    "@type": "Value",
                    "node": "system:Document"
                },
                "graph": "schema"
            }
    ]
}
