'use strict'
const axios = require("axios");
const expect = require('chai').expect;
const allClassQuery=`select([v('Class'), v('Label'), v('Comment'), 
                    v('Abstract')],(t(v('Class'), rdf/type, 
                    owl/'Class', dg/schema), opt(t(v('Class'), rdfs/label, 
                    v('Label'), dg/schema)), opt(t(v('Class'), rdfs/comment, 
                    v('Comment'), dg/schema)), opt(t(v('Class'), dcog/tag, 
                    v('Abstract'), dg/schema))))`;

describe('woql query', function () {

	 it('check database document id',function(done){
       global.sandbox.stub(axios, "get").returns(Promise.resolve({status:200, data: {}}));

	   //WOQLClient.prototype.select = function (qurl, woql, opts)
	   //global.client.select()

       done();
     })
})
//someText = someText.replace(/(\r\n|\n|\r)/gm, "");

