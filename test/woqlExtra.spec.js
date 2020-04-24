const expect = require('chai').expect;
const WOQL = require('../lib/woql');
const woqlExtraJson= require('./woqlJson/woqlExtraJson');

describe('woql queries', function () {
	it('check the using method',function(){
		const woqlObject=WOQL.using("userName/dbName/local/commit/commitID").triple("v:A", "v:B", "v:C");

		const woqlTriple=WOQL.triple("v:A", "v:B", "v:C");
		const woqlObject01=WOQL.using("userName/dbName/local/commit/commitID",woqlTriple);


		expect(woqlObject.json()).to.eql(woqlExtraJson.usingJson);
		expect(woqlObject01.json()).to.eql(woqlExtraJson.usingJson);
	})

	it('check more using method',function(){
		/*
		* To see every triple that are in version 1 and not in version 2
		*/
		const woqlObject=WOQL.and(
			   WOQL.using("admin/dbName/local/commit/commitID_1").triple("v:A", "v:B", "v:C"), 
			   WOQL.using("admin/dbName/local/commit/commitID_2").not().triple("v:A", "v:B", "v:C")
			)

		//console.log(JSON.stringify(woqlObject.json(), null, 4));

		expect(woqlObject.json()).to.eql(woqlExtraJson.multiUsingJson);
	})
})