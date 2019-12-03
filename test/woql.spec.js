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
		//{ limit: [ 10, {} ] }

		//console.log(woqlObject.json());

		expect(woqlObject.json().limit[0]).to.equal(10);

		//chai.should(woqlObject.json()).jsonEqual({ limit: [ 10, {} ] });

		expect(woqlObject.json()).to.eql({ limit: [ 10, {} ] });

	})

	it('check the start method',function(){
		//{ limit: [ 10, { start: [Array] } ] }
		const woqlObject=WOQL.limit(10).start(0);

		const jsonObj={"limit": [10,{"start": [0,{}]}]}

		//console.log(JSON.stringify(woqlObject.json(),null,2))

		expect(woqlObject.json()).to.eql(jsonObj);

	})

})