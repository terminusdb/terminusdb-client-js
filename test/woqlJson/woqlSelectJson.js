module.exports={jsonObj:{
                    "@type": "Select",
                    "variables": ["V1"],
                    "query": {
                        "@type": "Triple",
                        "subject": {
                            "@type": "NodeValue",
                            "node": "a"
                        },
                        "predicate": {
                            "@type": "NodeValue",
                            "node": "b"
                        },
                        "object": {
                            "@type": "Value",
                            "node": "c"
                        }
                    }
                },
            jsonObjMulti:{
                    "@type": "Select",
                    "variables": ["V1","V2"],
                    "query": {
                        "@type": "Triple",
                        "subject": {
                            "@type": "NodeValue",
                            "node": "a"
                        },
                        "predicate": {
                            "@type": "NodeValue",
                            "node": "b"
                        },
                        "object": {
                            "@type": "Value",
                            "node": "c"
                        }
                    }
                }
    }
