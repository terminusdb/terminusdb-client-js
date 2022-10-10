const schema: object = [
    {
        "@base": "terminusdb:///data/",
        "@schema": "terminusdb:///schema#",
        "@type": "@context"
    },
    {
        "@id": "Child",
        "@inherits": "Person",
        "@key": {
            "@fields": [
                "name"
            ],
            "@type": "Lexical"
        },
        "@type": "Class"
    },
    {
        "@id": "Person",
        "@key": {
            "@fields": [
                "name"
            ],
            "@type": "Lexical"
        },
        "@type": "Class",
        "age": {
            "@class": "xsd:decimal",
            "@type": "Optional"
        },
        "has_parent": {
            "@class": "Parent",
            "@type": "Optional"
        },
        "name": {
            "@class": "xsd:string",
            "@type": "Optional"
        }
    },
    {
        "@id": "Parent",
        "@inherits": "Person",
        "@key":{
            "@fields": [
                "name"
            ],
            "@type": "Lexical"
        },
        "@type": "Class",
        "has_child": {
            "@class": "Child",
            "@type": "Optional"
        }
    }
]

export default schema