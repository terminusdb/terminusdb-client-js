'use strict';
const expect = require('chai').expect;
var IDParser = require('../lib/terminusIDParser');

describe('IDParser tests', function () {
	const servURL="http://localhost:6363/"
	let idParser;
	
	beforeEach(function(){
		idParser=new IDParser();
	})	


	it('test parse serverURL',function(){
		expect(idParser.validURL(servURL)).to.equal(true);
		expect(idParser.parseServerURL(servURL)).to.equal(servURL);
	})

	it('test parse parseDBID',function(){
		const dbName="terminus"
		//check db as TerminusDB name
		expect(idParser.parseDBID(dbName)).to.equal(dbName);
	})

	it('test parse parseAccount',function(){
		const account="admin"
		//check db as TerminusDB name
		expect(idParser.parseAccount(account)).to.equal(account);
	})

	it('test parse parseBranch',function(){
		const branch="myBranch"
		//check db as TerminusDB name
		expect(idParser.parseBranch(branch)).to.equal(branch);
	})	
})


//