module.exports={
   "@context":{
      "doc":"http://localhost/terminus/document/",
      "ex":"http://example.org/",
      "owl":"http://www.w3.org/2002/07/owl#",
      "rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
      "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
      "terminus":"https://localhost/ontology/terminus#",
      "xsd":"http://www.w3.org/2001/XMLSchema#"
   },
   "@id":"doc:admin",
   "@type":"terminus:User",
   "rdfs:comment":{
      "@language":"en",
      "@value":"This is the server super user account"
   },
   "rdfs:label":{
      "@language":"en",
      "@value":"Server Admin User"
   },
   "terminus:authority":{
      "@id":"doc:access_all_areas",
      "@type":"terminus:ServerCapability",
      "rdfs:comment":{
         "@language":"en",
         "@value":"Access all server functions"
      },
      "rdfs:label":{
         "@language":"en",
         "@value":"All Capabilities"
      },
      "terminus:action":[
         {
            "@id":"terminus:class_frame",
            "@type":"terminus:DBAction"
         },
         {
            "@id":"terminus:create_database",
            "@type":"terminus:DBAction"
         },
         {
            "@id":"terminus:create_document",
            "@type":"terminus:DBAction"
         }
      ],
      "terminus:authority_scope":[
         {
            "@id":"doc:first_database",
            "@type":"terminus:Database",
            "rdfs:comment":{
               "@language":"en",
               "@value":"First TerminusDB"
            },
            "rdfs:label":{
               "@language":"en",
               "@value":"First TerminusDB"
            },
            "terminus:allow_origin":{
               "@type":"xsd:string",
               "@value":"*"
            }
         },
         {
            "@id":"doc:second_database",
            "@type":"terminus:Database",
            "rdfs:comment":{
               "@language":"en",
               "@value":"Second TerminusDB"
            },
            "rdfs:label":{
               "@language":"en",
               "@value":"Second TerminusDB"
            },
            "terminus:allow_origin":{
               "@type":"xsd:string",
               "@value":"*"
            }
         },
         {
            "@id":"doc:terminus",
            "@type":"terminus:Database",
            "rdfs:comment":{
               "@language":"en",
               "@value":"The master database contains the meta-data about databases, users and roles"
            },
            "rdfs:label":{
               "@language":"en",
               "@value":"Master Database"
            },
            "terminus:allow_origin":{
               "@type":"xsd:string",
               "@value":"*"
            }
         },
         {
            "@id":"doc:server",
            "@type":"terminus:Server",
            "rdfs:comment":{
               "@language":"en",
               "@value":"The current Database Server itself"
            },
            "rdfs:label":{
               "@language":"en",
               "@value":"The DB server"
            },
            "terminus:allow_origin":{
               "@type":"xsd:string",
               "@value":"*"
            },
            "terminus:resource_includes":[
               {
                  "@id":"doc:first_database",
                  "@type":"terminus:Database"
               },
               {
                  "@id":"doc:second_database",
                  "@type":"terminus:Database"
               },
               {
                  "@id":"doc:terminus",
                  "@type":"terminus:Database"
               }
            ]
         }
      ]
   }
}