const expect = require('chai').expect;

var WOQL = require('../lib/woql');

const idGenJson = require('./woqlJson/woqlIdgenJson');
const woqlStarJson = require('./woqlJson/woqlStarJson');
const woqlInsertJson = require('./woqlJson/woqlInsertJson');
const woqlDoctypeJson = require('./woqlJson/woqlDoctypeJson');
const woqlAndJson = require('./woqlJson/woqlAndJson');
const woqlOrJson = require('./woqlJson/woqlOrJson');
const woqlWhenJson = require('./woqlJson/woqlWhenJson');
const woqlOptJson = require('./woqlJson/woqlOptJson')
const woqlSelectJson = require('./woqlJson/woqlSelectJson')
const woqlTrimJson = require('./woqlJson/woqlTrimJson')
const woqlMathJson = require('./woqlJson/woqlMathJson')
const woqlCastJson = require('./woqlJson/woqlCastJson')
const woqlConcatJson = require('./woqlJson/woqlConcatJson')
const woqlReJson = require('./woqlJson/woqlReJson')
const woqlJoinSplitJson = require('./woqlJson/woqlJoinSplitJson')
const woqlJson= require('./woqlJson/woqlJson')
const woqlDeleteJson= require('./woqlJson/woqlDeleteJson')

describe('woql queries', function () {


	it('check the start properties values',function(){

		const woqlObject=WOQL.query();
		expect(woqlObject.chain_ended).to.equal(false);
		expect(woqlObject.contains_update).to.equal(false);
		expect(woqlObject.vocab.type).to.equal('rdf:type');
	})

  it('check the insert method',function(){

		const woqlObject=WOQL.insert("v:Bike_URL", "Bicycle");
    const woqlObjectDB=WOQL.insert("v:Bike_URL", "Bicycle", "myDB");
   
    
    const jsonObjDB={ "add_quad": [ 'v:Bike_URL', 'rdf:type', 'scm:Bicycle', 'db:myDB' ] };
		
    expect(woqlObject.json()).to.eql(woqlInsertJson.onlyNode);
    //expect(woqlObjectDB.json()).to.eql(jsonObjDB);


     //console.log(JSON.stringify(woqlObject.json(), null, 4));
	})

  
  it('check the doctype method',function(){
		const woqlObject=WOQL.doctype("Station");
		expect(woqlObject.json()).to.eql(woqlDoctypeJson);

    //console.log(JSON.stringify(woqlObject.json(), null, 4));

	})

  it('check the limit method',function(){
    const woqlObject=WOQL.limit(10);

    const limitJson={
              "@type": "woql:Limit",
              "woql:limit": {
                  "@type": "woql:Datatype",
                  "woql:datatype": {
                      "@type": "xsd:nonNegativeInteger",
                      "@value": 10
                  }
              },
              "woql:query": {}
          }
    expect(woqlObject.json()["woql:limit"]["woql:datatype"]["@value"]).to.equal(10);

    expect(woqlObject.json()).to.eql(limitJson);
	})

	it('check the start method',function(){

		const woqlObject=WOQL.limit(10).start(0);

		const jsonObj={"@type": "woql:Limit",
                  "woql:limit": {
                      "@type": "woql:Datatype",
                      "woql:datatype": {
                          "@type": "xsd:nonNegativeInteger",
                          "@value": 10
                      }
                  },
                  "woql:query": {
                      "@type": "woql:Start",
                      "woql:start": {
                          "@type": "woql:Datatype",
                          "woql:datatype": {
                              "@type": "xsd:nonNegativeInteger",
                              "@value": 0
                          }
                      },
                      "woql:query": {}
                  }
              }


		expect(woqlObject.json()).to.eql(jsonObj);

	})

  it('check the not method',function(){

		const woqlObject=WOQL.not(WOQL.triple("a", "b", "c"));

    const woqlObjectChain=WOQL.not().triple("a", "b", "c");
		const jsonObj={"@type": "woql:Not",
                  "woql:query": {
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
                  }
              }

		expect(woqlObject.json()).to.eql(jsonObj);
    expect(woqlObjectChain.json()).to.eql(jsonObj);

	})


  it('check the and method',function(){
		const woqlObject=WOQL.and(WOQL.triple("a", "b", "c"),WOQL.triple("1", "2", "3"));
		expect(woqlObject.json()).to.eql(woqlAndJson);
	})


  it('check the or method',function(){
		const woqlObject=WOQL.or(WOQL.triple("a", "b", "c"),WOQL.triple("1", "2", "3"));                     
		expect(woqlObject.json()).to.eql(woqlOrJson);
	})


  it('check the when method',function(){
    const woqlObject=WOQL.when(true, WOQL.add_class("id"));

    //const woqlObjectChain=WOQL.when(true).add_class("id")
    //console.log(JSON.stringify(woqlObject.json(), null, 4));

    expect(woqlObject.json()).to.eql(woqlWhenJson);
    //expect(woqlObjectChain.json()).to.eql(jsonObj);

  })

  it('check the opt method',function(){

		const woqlObject=WOQL.opt(WOQL.triple("a", "b", "c"));

    const woqlObjectChain=WOQL.opt().triple("a", "b", "c");

    //console.log(JSON.stringify(woqlObjectChain.json(), null, 4));

		expect(woqlObject.json()).to.eql(woqlOptJson);
    expect(woqlObjectChain.json()).to.eql(woqlOptJson);
	})

  it('check the from method',function(){

    const WOQLQuery=WOQL.limit(10);

    const woqlObjectChain=WOQL.from("http://dburl").limit(10);
    const woqlObject=WOQL.from("http://dburl", WOQLQuery);
    const jsonObj={
                    "@type": "woql:From",
                    "woql:graph_filter": {
                        "@type": "xsd:string",
                        "@value": "http://dburl"
                    },
                    "woql:query": {
                        "@type": "woql:Limit",
                        "woql:limit": {
                            "@type": "woql:Datatype",
                            "woql:datatype": {
                                "@type": "xsd:nonNegativeInteger",
                                "@value": 10
                            }
                        },
                        "woql:query": {}
                    }
                }

    expect(woqlObject.json()).to.eql(jsonObj);
    expect(woqlObjectChain.json()).to.eql(jsonObj);

  })
  

  it('check the star method',function(){

    const woqlObject=WOQL.limit(10).star();

    expect(woqlObject.json()).to.eql(woqlStarJson);

  })

  
  it('check the select method',function(){

		const woqlObject=WOQL.select("V1", WOQL.triple("a", "b", "c"));
    const woqlObjectMultiple=WOQL.select("V1", "V2", WOQL.triple("a", "b", "c"));

    const woqlObjectChain=WOQL.select("V1").triple("a", "b", "c");
    const woqlObjectChainMultiple=WOQL.select("V1","V2").triple("a", "b", "c");

	
    //console.log(JSON.stringify(woqlObjectMultiple.json(), null, 4));
    
	  expect(woqlObject.json()).to.eql(woqlSelectJson.jsonObj);
    expect(woqlObjectChain.json()).to.eql(woqlSelectJson.jsonObj);
    expect(woqlObjectMultiple.json()).to.eql(woqlSelectJson.jsonObjMulti);
    expect(woqlObjectChainMultiple.json()).to.eql(woqlSelectJson.jsonObjMulti);

	})

  it('check the eq method',function(){

    const woqlObject=WOQL.eq("a","b");

    const jsonObj={"@type": "woql:Equals",
                      "woql:left": {
                          "@type": "woql:Datatype",
                          "woql:datatype": {
                              "@type": "xsd:string",
                              "@value": "a"
                          }
                      },
                      "woql:right": {
                          "@type": "woql:Datatype",
                          "woql:datatype": {
                              "@type": "xsd:string",
                              "@value": "b"
                          }
                      }
                  }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the trim method',function(){

    const woqlObject=WOQL.trim("a","b");
    const jsonObj={ trim: [ "a", "b" ] };

    expect(woqlObject.json()).to.eql(woqlTrimJson);

  })

  it('check the eval method',function(){

    const woqlObject=WOQL.eval("1+2","b");
    expect(woqlObject.json()).to.eql(woqlMathJson.evalJson);

  })

  it('check the minus method',function(){

    const woqlObject=WOQL.minus("2","1");

    const jsonObj={ minus: [ '2', '1' ] };
    //console.log(JSON.stringify(woqlObject.json(), null, 4));
    expect(woqlObject.json()).to.eql(woqlMathJson.minusJson);

  })

  it('check the plus method',function(){

    const woqlObject=WOQL.plus("2","1");

    const jsonObj={ plus: [ '2', '1' ] };
    expect(woqlObject.json()).to.eql(woqlMathJson.plusJson);

  })

  it('check the times method',function(){

    const woqlObject=WOQL.times("2","1");

    const jsonObj={ times: [ '2', '1' ] };
    
    expect(woqlObject.json()).to.eql(woqlMathJson.timesJson);

  })
  
  it('check the divide method',function(){

    const woqlObject=WOQL.divide("2","1");

    const jsonObj={ divide: [ '2', '1' ] };
    expect(woqlObject.json()).to.eql(woqlMathJson.divideJson);

  })

  it('check the exp method',function(){

    const woqlObject=WOQL.exp("2","1");
    const jsonObj={ exp: [ '2', '1' ] };
    expect(woqlObject.json()).to.eql(woqlMathJson.expJson);

  })

  it('check the get method',function(){

    const woqlObject=WOQL.get("Map", "Target");

    const jsonObj={ "@type": "woql:Get", "woql:as_vars": "Map", "woql:query_resource": "Target"}
    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the as method',function(){
    const woqlObject=WOQL.as("Source", "v:Target", "string").as("Source2", "v:Target2");
    const woqlObject02=WOQL.as(["Source", "v:Target", "string"],["Source2", "v:Target2"]);
     
    const jsonObj=[{
                '@type': 'woql:NamedAsVar',
                'woql:identifier': { '@type': 'xsd:string', '@value': 'Source' },
                'woql:variable_name': { '@type': 'xsd:string', '@value': 'Target' },
                'woql:var_type': { '@type': 'xsd:anyURI', '@value': 'string' }
                },
              {
                '@type': 'woql:NamedAsVar',
                'woql:identifier': { '@type': 'xsd:string', '@value': 'Source2' },
                'woql:variable_name': { '@type': 'xsd:string', '@value': 'Target2' }
                }
              ]

      expect(woqlObject.json()).to.eql(jsonObj);
      expect(woqlObject02.json()).to.eql(jsonObj);
  })

  it('check the remote method',function(){

    const woqlObject=WOQL.remote({url: "http://url"});

    const jsonObj={"@type": "woql:RemoteResource",
                  "woql:remote_uri": {
                      "@type": "xsd:anyURI",
                      "@value": {
                          "url": "http://url"
                      }
                  }
              }

    //console.log(JSON.stringify(woqlObject.json(), null, 4));
    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the idgen method',function(){

    const woqlObject=WOQL.idgen("doc:Station",["v:Start_ID","v:End_ID"],"v:Start_Station_URL");

    //console.log(JSON.stringify(woqlObject.json(), null, 4));

    expect(woqlObject.json()).to.eql(idGenJson);

  })

  it('check the typecast method',function(){

    const woqlObject=WOQL.typecast("v:Duration", "xsd:integer", "v:Duration_Cast");

    const jsonObj={'@type': 'woql:Typecast',
                  'woql:typecast_value': {
                    '@type': 'woql:Variable',
                    'woql:variable_name': { '@value': 'Duration', '@type': 'xsd:string' }
                  },
                  'woql:typecast_type': { '@type': 'woql:Node', 'woql:node': 'xsd:integer' },
                  'woql:typecast_result': {
                    '@type': 'woql:Variable',
                    'woql:variable_name': { '@value': 'Duration_Cast', '@type': 'xsd:string' }
                  }
                }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the cast method',function(){

    const woqlObject=WOQL.cast("v:Duration", "xsd:integer", "v:Duration_Cast");

    //console.log(JSON.stringify(woqlObject.json(), null, 4));
    expect(woqlObject.json()).to.eql(woqlCastJson);

  })

  it('check the concat method',function(){

    const woqlObject=WOQL.concat("v:Duration yo v:Duration_Cast", "x"); 
    expect(woqlObject.json()).to.eql(woqlConcatJson);

  })

  it('check the re method',function(){

    const woqlObject=WOQL.re(".*", "v:string", "v:formated");
    expect(woqlObject.json()).to.eql(woqlReJson);

  })

  it('check the join method',function(){

    const woqlObject=WOQL.join(["v:A_obj", "v:B_obj"], ", ", "v:output");
    expect(woqlObject.json()).to.eql(woqlJoinSplitJson.joinJson);

  })

  it('check the split method',function(){

    const woqlObject=WOQL.split("A, B, C", ", ", "v:list_obj");
   
    expect(woqlObject.json()).to.eql(woqlJoinSplitJson.splitJson);

  })

  it('check the member method',function(){

    const woqlObject=WOQL.member("v:member", "v:list_obj");
    const jsonObj={ 'member': [ 'v:member', 'v:list_obj' ] };

    expect(woqlObject.json()).to.eql(woqlJson.memberJson);

  })

  it('check the group_by method',function(){
    const woqlObject=WOQL.group_by(["v:A", "v:B"],["v:C"],"v:New");
    expect(woqlObject.json()).to.eql(woqlJson.groupbyJson);
  })

  it('check the order_by method',function(){
    const woqlObject=WOQL.order_by("v:A", "v:B asc", "v:C asc")
    expect(woqlObject.json()).to.eql(woqlJson.orderbyJson);
  })

})

describe('triple builder', function () {

  it('check the triple method',function(){

    const woqlObject=WOQL.triple("a", "b", "c");
    expect(woqlObject.json()).to.eql(woqlJson.trypleJson);

  })

  it('check the quad method',function(){

    const woqlObject=WOQL.quad("a", "b", "c", "d");
    expect(woqlObject.json()).to.eql(woqlJson.quadJson);

  })

  it('check the add_class method',function(){

    const woqlObject=WOQL.add_class("id");  
    expect(woqlObject.json()).to.eql(woqlJson.addClassJson);

  })

  it('check the delete_class method',function(){
    const woqlObject=WOQL.delete_class("id");
    expect(woqlObject.json()).to.eql(woqlDeleteJson);
  })

  it('check the sub method',function(){
    const woqlObject=WOQL.sub("ClassA","ClassB");
    expect(woqlObject.json()).to.eql(woqlJson.subsumptionJson);
  })

  it('check the isa method',function(){

    const woqlObject=WOQL.isa("instance","Class");

    const jsonObj={ isa: [ "scm:instance", "owl:Class" ] };
    
    expect(woqlObject.json()).to.eql(woqlJson.isAJson);

  })

 /* it('check the delete method',function(){

    const woqlObject=WOQL.delete({ triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] });

    const jsonObj={ delete: [ { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] } ] };
    console.log(JSON.stringify(woqlObject.json(), null, 4));
    //expect(woqlObject.json()).to.eql(jsonObj);

  })*/

  it('check the delete_triple method',function(){
    const woqlObject=WOQL.delete_triple("a", "b", "c");
    expect(woqlObject.json()).to.eql(woqlJson.deleteTripleJson);

  })

  it('check the delete_quad method',function(){
    const woqlObject=WOQL.delete_quad("a", "b", "c", "d");
  
    expect(woqlObject.json()).to.eql(woqlJson.deleteQuadJson);

  })

  it('check the add_triple method',function(){

    const woqlObject=WOQL.add_triple("a", "b", "c");
    expect(woqlObject.json()).to.eql(woqlJson.addTripleJson);

  })

  it('check the add_quad method',function(){
    const woqlObject=WOQL.add_quad("a", "b", "c", "d");
    expect(woqlObject.json()).to.eql(woqlJson.addQuadJson);
  })


  it('check the add_property method',function(){
    const woqlObject=WOQL.add_property("some_property", "string");
    expect(woqlObject.json()).to.eql(woqlJson.addPropertyJson);

  })

  it('check the delete_property method',function(){
    const woqlObject=WOQL.delete_property("some_property", "string");  
    expect(woqlObject.json()).to.eql(woqlJson.deletePropertyJson);

  })
})


describe('triple builder chaining methods', function () {

  it('check the node method',function(){
    const woqlObject=WOQL.node("some_node");
    const jsonObj={ "@type": "woql:And"};
    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the graph method',function(){

    const woqlObject=WOQL.node("doc:x", "add_quad").graph("db:schema");
    const woqlObject2=WOQL.node("doc:x", "add_quad").graph("db:mySchema").label("my label", "en");

    const jsonObj={};
    const jsonObj2={ 'add_quad': ['doc:x', 'rdfs:label', { '@value': 'my label', '@language': 'en' }, 'db:mySchema'] };

    console.log(JSON.stringify(woqlObject.json(), null, 4));
    
    //expect(woqlObject.json()).to.eql(jsonObj);
    //expect(woqlObject2.json()).to.eql(jsonObj2);

  })
/*
  it('check the label method',function(){

    const woqlObject=WOQL.node("doc:x", "add_quad").label("my label", "en");
    const woqlObject2=WOQL.node("doc:x", "add_quad").label("v:label");

    const jsonObj={ 'add_quad': ['doc:x', 'rdfs:label', { '@value': 'my label', '@language': 'en' }, 'db:schema'] };
    const jsonObj2={ 'add_quad': ['doc:x', 'rdfs:label', "v:label", 'db:schema'] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the add class method',function(){

    const woqlObject=WOQL.add_class("NewClass").description("A new class object.").entity();

    const jsonObj={ "and": [{"add_quad": ['scm:NewClass', 'rdf:type', "owl:Class", 'db:schema']},
                  {"add_quad": ['scm:NewClass', 'rdfs:comment', { '@value': "A new class object.", '@language': 'en' }, 'db:schema']},
                  {"add_quad": ['scm:NewClass', 'rdfs:subClassOf', "tcs:Entity", 'db:schema']}
    ]};

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the comment method',function(){

    const woqlObject=WOQL.node("doc:x", "add_quad").comment("my comment");

    const jsonObj={ "comment": [
            {
              "@language": "en",
              "@value": "my comment"
            },
            {}
          ] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the property method',function(){

    const woqlObject=WOQL.node("doc:x", "add_triple").property("myprop", "value");

    const jsonObj={ 'add_triple': ['doc:x', 'scm:myprop', { '@value': 'value', '@language': 'en' }] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the entity method',function(){

    const woqlObject=WOQL.node("doc:x", "add_quad").entity();

    const jsonObj={ add_quad: [ 'doc:x', 'rdfs:subClassOf', 'tcs:Entity', 'db:schema' ] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the parent method',function(){

    const woqlObject=WOQL.node("doc:x", "add_quad").parent("Z");

    const jsonObj={ add_quad: [ 'doc:x', 'rdfs:subClassOf', 'scm:Z', 'db:schema' ] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the abstract method',function(){

    const woqlObject=WOQL.node("doc:x", "add_quad").abstract();

    const jsonObj={ add_quad: [ 'doc:x', 'tcs:tag', 'tcs:abstract', 'db:schema' ] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the relationship method',function(){

    const woqlObject=WOQL.node("doc:x", "add_quad").relationship();

    const jsonObj={ add_quad: [ 'doc:x', 'rdfs:subClassOf', 'tcs:Entity', 'db:schema' ] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the max method',function(){

    const woqlObject=WOQL.add_property("P", "string").max(4);

    const jsonObj={ "and": [ { "add_quad": ["scm:P",
                                        "rdf:type",
                                        "owl:DatatypeProperty",
                                        "db:schema"] },
                           { "add_quad": ["scm:P",
                                        "rdfs:range",
                                        "xsd:string",
                                        "db:schema"] },
                           { "add_quad": ["scm:P_max",
                                        "rdf:type",
                                        "owl:Restriction",
                                        "db:schema"] },
                           { "add_quad": [ "scm:P_max",
                                        "owl:onProperty",
                                        "scm:P",
                                        "db:schema"] },
                           { "add_quad": [ "scm:P_max",
                                        "owl:maxCardinality",
                                        { "@value": 4, "@type": "xsd:nonNegativeInteger" },
                                        "db:schema"] } ] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the min method',function(){

    const woqlObject=WOQL.add_property("P", "string").min(2);

    const jsonObj={ "and": [ { "add_quad": ["scm:P",
                                        "rdf:type",
                                        "owl:DatatypeProperty",
                                        "db:schema"] },
                             { "add_quad": ["scm:P",
                                        "rdfs:range",
                                        "xsd:string",
                                        "db:schema"] },
                             { "add_quad": ["scm:P_min",
                                        "rdf:type",
                                        "owl:Restriction",
                                        "db:schema"] },
                             { "add_quad": [ "scm:P_min",
                                        "owl:onProperty",
                                        "scm:P",
                                        "db:schema"] },
                             { "add_quad": [ "scm:P_min",
                                        "owl:minCardinality",
                                        { "@value": 2, "@type": "xsd:nonNegativeInteger" },
                                        "db:schema"] } ] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the cardinality method',function(){

    const woqlObject=WOQL.add_property("P", "string").cardinality(3);

    const jsonObj={ "and": [ { "add_quad": ["scm:P",
                                          "rdf:type",
                                          "owl:DatatypeProperty",
                                          "db:schema"] },
                             { "add_quad": ["scm:P",
                                          "rdfs:range",
                                          "xsd:string",
                                          "db:schema"] },
                             { "add_quad": ["scm:P_cardinality",
                                          "rdf:type",
                                          "owl:Restriction",
                                          "db:schema"] },
                             { "add_quad": [ "scm:P_cardinality",
                                          "owl:onProperty",
                                          "scm:P",
                                          "db:schema"] },
                             { "add_quad": [ "scm:P_cardinality",
                                          "owl:cardinality",
                                          { "@value": 3, "@type": "xsd:nonNegativeInteger" },
                                          "db:schema"] } ] };

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the chained insert method',function(){
    const woqlObject = WOQL.insert("v:Node_ID", "v:Type")
          .label("v:Label")
          .description("v:Description")
          .property("prop", "v:Prop")
          .property("prop", "v:Prop2")
          .entity()
          .parent("hello");
    const jsonObj={ and: [
         { add_triple: ["v:Node_ID", "rdf:type", "v:Type"] },
         { add_triple: ["v:Node_ID", "rdfs:label", "v:Label"] },
         { add_triple: ["v:Node_ID", "rdfs:comment", "v:Description"] },
         { add_triple: ["v:Node_ID", "scm:prop", "v:Prop"] },
         { add_triple: ["v:Node_ID", "scm:prop", "v:Prop2"] },
         { add_triple: ["v:Node_ID", "rdfs:subClassOf", "tcs:Entity"] },
         { add_triple: ["v:Node_ID", "rdfs:subClassOf", "scm:hello"] }
    ]};
     expect(woqlObject.json()).to.eql(jsonObj);
})
  it('check the chained doctype method',function(){
  const woqlObject = WOQL.doctype("MyDoc").label("abc").description("abcd")
        .property("prop", "dateTime").label("aaa")
        .property("prop2", "integer").label("abe")

  const jsonObj={ and: [
          { add_quad: ["scm:prop2", "rdf:type", "owl:DatatypeProperty", "db:schema"] },
          { add_quad: ["scm:prop2", "rdfs:range", "xsd:integer", "db:schema"] },
          { add_quad: ["scm:prop2", "rdfs:domain", "scm:MyDoc", "db:schema"] },
          { and: [
              { add_quad: ["scm:prop", "rdf:type", "owl:DatatypeProperty", "db:schema"] },
              { add_quad: ["scm:prop", "rdfs:range", "xsd:dateTime", "db:schema"] },
              { add_quad: ["scm:prop", "rdfs:domain", "scm:MyDoc", "db:schema"] },
            { and: [
               { add_quad: ["scm:MyDoc", "rdf:type", "owl:Class", "db:schema"] },
               { add_quad: ["scm:MyDoc", "rdfs:subClassOf", "tcs:Document", "db:schema"] },
               { add_quad: ["scm:MyDoc", "rdfs:label", {"@value": "abc", "@language": "en"}, "db:schema"] },
               { add_quad: ["scm:MyDoc", "rdfs:comment", {"@value": "abcd", "@language": "en"}, "db:schema"] },
            ]},
            { add_quad: ["scm:prop", "rdfs:label", {"@value": "aaa", "@language": "en"}, "db:schema"] }
         ]},
         { add_quad: ["scm:prop2", "rdfs:label", {"@value": "abe", "@language": "en"}, "db:schema"] }
  ]};
   expect(woqlObject.json()).to.eql(jsonObj);
})*/

})
