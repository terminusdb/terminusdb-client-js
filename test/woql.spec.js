//const chai =require('chai');
const expect = require('chai').expect;

//const chaiJsonEqual = require('chai-json-equal');

var WOQL = require('../lib/woql');

//chai.use(chaiJsonEqual);

describe('woql queries', function () {


	it('check the start properties values',function(){

		const woqlObject=WOQL.query();
		expect(woqlObject.chain_ended).to.equal(false);
		expect(woqlObject.contains_update).to.equal(false);
		expect(woqlObject.vocab.type).to.equal('rdf:type');
	})


	it('check the limit method',function(){

		const woqlObject=WOQL.limit(10);

		expect(woqlObject.json().limit[0]).to.equal(10);

		expect(woqlObject.json()).to.eql({ limit: [ 10, {} ] });

	})

	it('check the start method',function(){

		const woqlObject=WOQL.limit(10).start(0);

		const jsonObj={"limit": [10,{"start": [0,{}]}]}

		expect(woqlObject.json()).to.eql(jsonObj);

	})

  it('check the not method',function(){

		const woqlObject=WOQL.not(WOQL.triple("a", "b", "c"));

    const woqlObjectChain=WOQL.not().triple("a", "b", "c");

    //console.log(woqlObject.json());

		const jsonObj={ not: [ { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] } ] }

		expect(woqlObject.json()).to.eql(jsonObj);
    expect(woqlObjectChain.json()).to.eql(jsonObj);

	})

  it('check the and method',function(){

		const woqlObject=WOQL.and(WOQL.triple("a", "b", "c"),WOQL.triple("1", "2", "3"));

		const jsonObj={ and: [ { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] }, { triple: [ "doc:1", "scm:2", { "@language": "en", "@value": "3" } ] } ] }

		expect(woqlObject.json()).to.eql(jsonObj);

	})

  it('check the or method',function(){

		const woqlObject=WOQL.or(WOQL.triple("a", "b", "c"),WOQL.triple("1", "2", "3"));

		const jsonObj={ or: [ { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] },
                           { triple: [ "doc:1", "scm:2", { "@language": "en", "@value": "3" } ] } ] }

		expect(woqlObject.json()).to.eql(jsonObj);

	})

  it('check the opt method',function(){

		const woqlObject=WOQL.opt(WOQL.triple("a", "b", "c"));

    //const woqlObjectChain=WOQL.opt().triple("a", "b", "c");

		const jsonObj={ opt: [ { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] } ] }

		expect(woqlObject.json()).to.eql(jsonObj);
    //expect(woqlObjectChain.json()).to.eql(jsonObj);

	})

  it('check the select method',function(){

		const woqlObject=WOQL.select("V1", WOQL.triple("a", "b", "c"));
    const woqlObjectMultiple=WOQL.select("V1", "V2", WOQL.triple("a", "b", "c"));
    const woqlObjectChain=WOQL.select("V1").triple("a", "b", "c");
    const woqlObjectChainMultiple=WOQL.select("V1","V2").triple("a", "b", "c");

		const jsonObj={ select: [ 'V1', { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] } ] }
    const jsonObjMultiple={ select: [ 'V1', 'V2', { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] } ] }

		expect(woqlObject.json()).to.eql(jsonObj);
    expect(woqlObjectChain.json()).to.eql(jsonObj);
    expect(woqlObjectMultiple.json()).to.eql(jsonObjMultiple);
    expect(woqlObjectChainMultiple.json()).to.eql(jsonObjMultiple);

	})

  it('check the eq method',function(){

    const woqlObject=WOQL.eq("a","b");

    const jsonObj={ eq: [ { "@language": "en", "@value": "a" }, { "@language": "en", "@value": "b" } ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the trim method',function(){

    const woqlObject=WOQL.trim("a","b");

    const jsonObj={ trim: [ "a", "b" ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the eval method',function(){

    const woqlObject=WOQL.eval("1+2","b");

    const jsonObj={ eval: [ '1+2', 'b' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the minus method',function(){

    const woqlObject=WOQL.minus("2","1");

    const jsonObj={ minus: [ '2', '1' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the plus method',function(){

    const woqlObject=WOQL.plus("2","1");

    const jsonObj={ plus: [ '2', '1' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the times method',function(){

    const woqlObject=WOQL.times("2","1");

    const jsonObj={ times: [ '2', '1' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the divide method',function(){

    const woqlObject=WOQL.divide("2","1");

    const jsonObj={ divide: [ '2', '1' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the exp method',function(){

    const woqlObject=WOQL.exp("2","1");

    const jsonObj={ exp: [ '2', '1' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the as method',function(){

    const woqlObject=WOQL.as("Source", "Target");

    const jsonObj={ as: [ { '@value': 'Source' }, 'v:Target' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the unique method',function(){

    const woqlObject=WOQL.as("Prefix", ["V1","V2"]);

    const jsonObj={ as: [ { '@value': 'Prefix' }, 'v:V1,V2' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

})

describe('triple builder', function () {

  it('check the triple method',function(){

    const woqlObject=WOQL.triple("a", "b", "c");

    const jsonObj={ triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the quad method',function(){

    const woqlObject=WOQL.quad("a", "b", "c", "d");

    const jsonObj={ quad: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" }, "db:d" ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the addClass method',function(){

    const woqlObject=WOQL.addClass("id");

    const jsonObj={ add_quad: [ 'scm:id', 'rdf:type', 'owl:Class', 'db:schema' ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the deleteClass method',function(){

    const woqlObject=WOQL.deleteClass("id");

    const jsonObj= { and: [ { delete_quad: [ 'scm:id', 'v:All', 'v:Al2', 'db:schema' ] }, { delete_quad: [ 'v:Al3', 'v:Al4', 'scm:id', 'db:schema' ] } ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the sub method',function(){

    const woqlObject=WOQL.sub("ClassA","ClassB");

    const jsonObj={ sub: [ "scm:ClassA", "scm:ClassB" ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the isa method',function(){

    const woqlObject=WOQL.isa("instance","Class");

    const jsonObj={ isa: [ "scm:instance", "owl:Class" ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the delete method',function(){

    const woqlObject=WOQL.delete({ triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] });

    const jsonObj={ delete: [ { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] } ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the delete_triple method',function(){

    const woqlObject=WOQL.delete_triple("a", "b", "c");

    const jsonObj={ delete_triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the delete_quard method',function(){

    const woqlObject=WOQL.delete_quad("a", "b", "c", "d");

    const jsonObj={ delete_quad: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" }, "db:d" ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the add_triple method',function(){

    const woqlObject=WOQL.add_triple("a", "b", "c");

    const jsonObj={ add_triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the add_quard method',function(){

    const woqlObject=WOQL.add_quad("a", "b", "c", "d");

    const jsonObj={ add_quad: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" }, "db:d" ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })


  it('check the addProperty method',function(){
    //{ limit: [ 10, { start: [Array] } ] }
    const woqlObject=WOQL.addProperty("some_property", "string");

    console.log(woqlObject.json())
    //const jsonObj={ add_quad: [ 'scm:some_property', 'rdf:scm', 'owl:Class', 'db:schema' ] }

    //expect(woqlObject.json()).to.eql(jsonObj);

  })

  it('check the deleteProperty method',function(){
    //{ limit: [ 10, { start: [Array] } ] }
    const woqlObject=WOQL.deleteProperty("some_property", "string");

    const jsonObj={ and: [ { delete_quad: [ 'scm:some_property', 'v:All', 'v:Al2', 'xsd:string' ] }, { delete_quad: [ 'v:Al3', 'v:Al4', 'scm:some_property', 'xsd:string' ] } ] }

    expect(woqlObject.json()).to.eql(jsonObj);

  })

})


describe('triple builder chanier', function () {

  it('check the node method',function(){

    const woqlObject=WOQL.node("some_node");

    const jsonObj={}

    expect(woqlObject.json()).to.eql(jsonObj);

  })

})
