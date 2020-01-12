const expect = require('chai').expect;

const allSchemaElementResult=require('./extraFile/allSchemaElementBikeCallResponse'); 
const compressSchemaElementResult=require('./extraFile/compressSchemaElementBikeResult'); 

const allClassBikeCallResponse=require('./extraFile/allClassBikeCallResponse');
const compressAllClassesResult=require('./extraFile/compressAllClassesResult');
const getAllClassesBikeSorted=require('./extraFile/getAllClassesBikeSorted');

var WOQLResult = require('../lib/woqlResult');


describe('woql results 01', function () { 

	context('get all schema element query call result',function() {
	    it('check the WOQL Rule',function(){
	        const results=new WOQLResult();
	        expect(results.hasBindings()).to.equal(false);
		})

		it('check compress result from all Schema Element (bike dataset)',function() {

			const results=new WOQLResult(allSchemaElementResult);
			expect(results.getBindings()).to.eql(compressSchemaElementResult);
		})

	})

	context("get all classes query call result",function(){
		let results;

		beforeEach(function() {
	   		results=new WOQLResult(allClassBikeCallResponse);

		});

		it('check compress result from all Classes (bike dataset)',function() {		
			expect(results.getBindings()).to.eql(compressAllClassesResult);
		})

		//getVariableList
		it('check get variable list from result dataset',function() {
			const varList=[ 'v:Abstract', 'v:Comment', 'v:Element', 'v:Label' ]

			expect(results.getVariableList()).to.eql(varList);
		})

		it('check the result length', function(){
			expect(results.count()).to.eql(3);
		})

		it('check the result navigation ', function(){
			const fistItem={ 'v:Abstract': 'unknown',
						  'v:Comment': 'unknown',
						  'v:Element': 'http://195.201.12.87:6365/pybike/schema#Bicycle',
						  'v:Label': { '@language': 'en', '@value': 'Bicycle' } }

			expect(results.first()).to.eql(fistItem);

			

			const secondItem={ 'v:Abstract': 'unknown',
					  'v:Comment': 'unknown',
					  'v:Element': 'http://195.201.12.87:6365/pybike/schema#Journey',
					  'v:Label': { '@language': 'en', '@value': 'Journey' } }

			results.next();
			expect(results.next()).to.eql(secondItem);
			//expect(results.prev()).to.eql(fistItem);

			const lastItem={ 'v:Abstract': 'unknown',
						  'v:Comment': 
						   { '@language': 'en',
						     '@value': 'A station where municipal bicycles are deposited' },
						  'v:Element': 'http://195.201.12.87:6365/pybike/schema#Station',
						  'v:Label': { '@language': 'en', '@value': 'Bike Station' } }


			expect(results.last()).to.eql(lastItem);

			

		})

		it('sort result asc', function(){

			results.sort('v:Label');

			expect(results.getBindings()).to.eql(getAllClassesBikeSorted.asc);
		})

		it('sort result desc', function(){
			results.sort('v:Label','desc');
			expect(results.getBindings()).to.eql(getAllClassesBikeSorted.desc);
		})

		it('check the compare function',function(){
			
		})
	})
})
