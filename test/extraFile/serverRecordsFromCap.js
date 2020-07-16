module.exports={
    "@id": "doc:server",
    "@type": "system:Server",
    "rdfs:comment": {
        "@language": "en",
        "@value": "The current Database Server itself"
    },
    "rdfs:label": {
        "@language": "en",
        "@value": "The DB server"
    },
    "system:allow_origin": {
        "@type": "xsd:string",
        "@value": "*"
    },
    "system:resource_includes": [
        {
            "@id": "doc:Database%5fadmin%7CTEST",
            "@type": "system:Database"
        },
        {
            "@id": "doc:Database%5fadmin%7Cbike",
            "@type": "system:Database"
        },
        {
            "@id": "doc:Database%5fadmin%7Ctesting123",
            "@type": "system:Database"
        },
        {
            "@id": "doc:Database%5ffalse%7Cadfadsf",
            "@type": "system:Database"
        },
        {
            "@id": "doc:terminus",
            "@type": "system:Database"
        }
    ],
    "system:resource_name": {
        "@type": "xsd:string",
        "@value": "http://195.201.12.87:6380"
    },
    "system:authority": [
        "system:class_frame",
        "system:create_database",
        "system:create_document",
        "system:delete_database",
        "system:delete_document",
        "system:get_document",
        "system:get_schema",
        "system:read_access",
        "system:update_document",
        "system:update_schema",
        "system:write_access"
    ]
}
