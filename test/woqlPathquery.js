'use strict'
const expect = require('chai').expect
var WOQL = require('../lib/woql')

describe('woql path query and path query prettyprint', function() {
    it('simple path query', function() {
        const query = WOQL.path("v:X", "hop", "v:Y", "v:Path")
        const json = {
            "@type": "Path",
            "subject": {
                "@type": "NodeValue",
                "variable": "X",
            },
            "pattern": {
                "@type": "PathPredicate",
                "predicate": "hop",
            },
            "object": {
                "@type": "Value",
                "variable": "Y",
            },
            "path": {
                "@type": "Value",
                "variable": "Path",
            },
        }
        expect(query.json()).to.eql(json)
        expect(query.prettyPrint()).to.eql('WOQL.path("v:X", "hop", "v:Y", "v:Path")')
    })
   
    it('test plus directed path query', function() {
        const query = WOQL.path("v:X", "<hop+", "v:Y", "v:Path")
        const json = {
            "@type": "Path",
            "subject": {
                "@type": "NodeValue",
                "variable": "X",
            },
            "pattern": {
                "@type": "PathPlus",
                "plus": {
                    "@type": "InversePathPredicate",
                    "predicate": "hop",
                },
            },
            "object": {
                "@type": "Value",
                "variable": "Y",
            },
            "path": {
                "@type": "Value",
                "variable": "Path",
            },
        }
        expect(query.json()).to.eql(json)
        expect(query.prettyPrint()).to.eql('WOQL.path("v:X", "<hop+", "v:Y", "v:Path")')
    })

    it('test grouped path query', function() {
        const query = WOQL.path("v:X", "(<hop,hop>)+", "v:Y", "v:Path")
        const json = {
            "@type": "Path",
            "subject": {
                "@type": "NodeValue",
                "variable": "X",
            },
            "pattern": {
                "@type": "PathPlus",
                "plus": {
                    "@type": "PathSequence",
                    "sequence": [
                        {
                            "@type": "InversePathPredicate",
                            "predicate": "hop",
                        },
                        {
                            "@type": "PathPredicate",
                            "predicate": "hop",
                        },
                    ],
                },
            },
            "object": {
                "@type": "Value",
                "variable": "Y",
            },
            "path": {
                "@type": "Value",
                "variable": "Path",
            },
        }
        expect(query.json()).to.eql(json)
        expect(query.prettyPrint()).to.eql('WOQL.path("v:X", "(<hop,hop>)+", "v:Y", "v:Path")')
    })
   
    it('test double grouped path query', function() {
        const query = WOQL.path(
            "v:X", "((<hop,hop>)|(<hop2,hop2>))+", "v:Y", "v:Path"
        )
        const json = {
            "@type": "Path",
            "subject": {
                "@type": "NodeValue",
                "variable": "X",
            },
            "pattern": {
                "@type": "PathPlus",
                "plus": {
                    "@type": "PathOr",
                    "or": [
                        {
                            "@type": "PathSequence",
                            "sequence": [
                                {"@type": "InversePathPredicate", "predicate": "hop"},
                                {
                                    "@type": "PathPredicate",
                                    "predicate": "hop",
                                },
                            ],
                        },
                        {
                            "@type": "PathSequence",
                            "sequence": [
                                {
                                    "@type": "InversePathPredicate",
                                    "predicate": "hop2",
                                },
                                {
                                    "@type": "PathPredicate",
                                    "predicate": "hop2",
                                },
                            ],
                        },
                    ],
                },
            },
            "object": {
                "@type": "Value",
                "variable": "Y",
            },
            "path": {"@type": "Value", "variable": "Path"},
        }
        expect(query.json()).to.eql(json)
        expect(query.prettyPrint()).to.eql('WOQL.path("v:X", "((<hop,hop>)|(<hop2,hop2>))+", "v:Y", "v:Path")')
    })
})