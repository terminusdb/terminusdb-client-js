'use strict';
const expect = require('chai').expect;
var IDParser = require('../lib/terminusIDParser');

describe('IDParser tests', function () {
	const servURL="http://localhost:6363/"
	let idParser;
	
	beforeEach(function(){
		idParser=new IDParser();
	})	

	it('check default values',function(){		
		expect(idParser.server()).to.equal(false);
		expect(idParser.dbid()).to.equal(false);
		expect(idParser.docid()).to.equal(false);	
	})

	it('test parse serverURL',function(){
		expect(idParser.validURL(servURL)).to.equal(true);
		expect(idParser.parseServerURL(servURL)).to.equal(servURL);
		expect(idParser.server()).to.equal(servURL);
	})

	it('test parse parseDBID',function(){
		const dbName="terminus"
		//check db as TerminusDB name
		expect(idParser.parseDBID(dbName)).to.equal(dbName);
		expect(idParser.dbid()).to.equal(dbName);
		expect(idParser.server()).to.equal(false);

		//check db name as TerminusDB Url
		expect(idParser.parseDBID(servURL+dbName)).to.equal(dbName)
		expect(idParser.dbid()).to.equal(dbName);
		expect(idParser.server()).to.equal(servURL);
	})

	//@param {string} docURL Terminus Document URL or Terminus Document ID
	it('test parse parseDocumentURL',function(){
		const docURL="http://localhost:6363/masterdb/document/admin"
		const dbName="masterdb"
		const documentName="admin"

		expect(idParser.parseDocumentURL(docURL)).to.equal(documentName)
		expect(idParser.server()).to.equal(servURL)
		expect(idParser.dbid()).to.equal(dbName)
		expect(idParser.docid()).to.equal(documentName)

		const newDocumentName='newDocument'
		//set a document as documentName this didn't change serverURL and dbID name
		expect(idParser.parseDocumentURL(newDocumentName)).to.equal(newDocumentName)
		expect(idParser.server()).to.equal(servURL)
		expect(idParser.dbid()).to.equal(dbName)
		expect(idParser.docid()).to.equal(newDocumentName)
	})

	//check if the url of get schema is corrects
	it('test parse parseSchemaURL',function(){	
		const schemaFullUrl="http://localhost:6363/masterdb/schema"
		const dbName="masterdb"
		expect(idParser.parseSchemaURL(schemaFullUrl)).to.equal(dbName)
		expect(idParser.server()).to.equal(servURL)
		expect(idParser.dbid()).to.equal(dbName)
	})

	//check if the url of get schema is corrects
	it('test parse parseQueryURL',function(){	
		const woqlclientFullURL="http://localhost:6363/terminus/woql"
    	const dbName="terminus"
		expect(idParser.parseQueryURL(woqlclientFullURL)).to.equal(dbName)
		expect(idParser.server()).to.equal(servURL)
		expect(idParser.dbid()).to.equal(dbName)
	})

	//check if the url of get schema is corrects
	it('test parse parseQueryURL',function(){	
		const woqlclientFullURL="http://localhost:6363/terminus/woql"
    	const dbName="terminus"
		expect(idParser.parseQueryURL(woqlclientFullURL)).to.equal(dbName)
		expect(idParser.server()).to.equal(servURL)
		expect(idParser.dbid()).to.equal(dbName)
	})

	it('test parse parseClassFrameURL',function(){	
		const woqlclientFullURL="http://localhost:6363/terminus/frame"
    	const servURL="http://localhost:6363/"
    	const dbName="terminus"
		expect(idParser.parseClassFrameURL(woqlclientFullURL)).to.equal(dbName)
		expect(idParser.server()).to.equal(servURL)
		expect(idParser.dbid()).to.equal(dbName)
	})


	it('test validPrefixedURL',function(){
		const context= {
		    "doc":"http://localhost:6363/terminus/document/",
		    "owl":"http://www.w3.org/2002/07/owl#",
		    "rdf":"http://www.w3.org/1999/02/22-rdf-syntax-ns#",
		    "rdfs":"http://www.w3.org/2000/01/rdf-schema#",
		    "xsd":"http://www.w3.org/2001/XMLSchema#"
		}
        
        const docFullUrl='http://localhost:6363/terminus/document/myDocument'
		idParser.setContext(context);
		expect(idParser.validPrefixedURL('doc:myDocument',context)).to.equal(true);
		expect(idParser.validPrefixedURL('dic:myDocument',context)).to.equal(false);
		expect(idParser.expandPrefixed('doc:myDocument',context)).to.equal(docFullUrl);
	})
})


//