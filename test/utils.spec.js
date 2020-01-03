'use strict';
const UTILS = require('../lib/utils.js');
const expect = require('chai').expect;

describe('utils tests', function () {
   const servURL="http://localhost:6363/"

   it('check standard urls',function(){		
    expect(UTILS.standard_urls['rdf']).to.equal(UTILS.getStdURL("rdf", ""));
   })
   it('check URIEncodePayload',function(){		
   
    const expected = "a=A&b=B&c=C&day=sir&b=D";
   
    const payload = [{a: "A", b: "B", c: "C", "day": "sir"}, {b: "D"}];
   
    expect(UTILS.URIEncodePayload(payload)).to.equal(expected);
   
   })
   it('check addURLPrefix',function(){		
   
    const docURL = "http://mydocs/";
    UTILS.addURLPrefix("doc", docURL);
    
    expect(UTILS.standard_urls["doc"]).to.equal(docURL);
   
   })
   it('check empty',function(){		
      expect(UTILS.empty({})).to.equal(true);
      expect(UTILS.empty([])).to.equal(true);
      expect(UTILS.empty({a: ""})).to.equal(false);
      expect(UTILS.empty([""])).to.equal(false);
   })

 it('check genBNID',function(){		
    const bnid = UTILS.genBNID();
    expect(bnid.substring(0, 2)).to.equal("_:");
 })

 it('check getShorthand',function(){		
    const sh = UTILS.getShorthand(UTILS.standard_urls["rdf"] + "type");
    expect(sh).to.equal("rdf:type");
 })

 it('check compareIDs',function(){		
    const sh = UTILS.compareIDs(UTILS.standard_urls["rdf"] + "type", "rdf:type");
    expect(sh).to.equal(true);
 })

 it('check shorten',function(){		
    const sh = UTILS.shorten(UTILS.standard_urls["rdf"] + "type");
    expect(sh).to.equal("rdf:type");
 })

 it('check unshorten',function(){		
    const full = UTILS.standard_urls["rdf"] + "type";
    expect(UTILS.unshorten("rdf:type")).to.equal(full);
 })

 it('check valid URL',function(){		
    expect(UTILS.validURL("http://myweb/")).to.equal(true);
    expect(UTILS.validURL("https://myweb/")).to.equal(true);
    expect(UTILS.validURL("nothttps://myweb/")).to.equal(false);
 })

 it('check labelFromURL',function(){		
     const label = UTILS.labelFromURL("doc:This_IS_A_DOC");
     expect(label).to.equal("This IS A DOC");
 })

 it('check urlFragment',function(){		
     const frag = UTILS.urlFragment(UTILS.getStdURL("rdf", "type"));
     expect(frag).to.equal("type");
 })

 it('check lastURLBit',function(){		
     const label = UTILS.lastURLBit("http://adsfsd/X");
     expect(label).to.equal("X");
 })

 it('check addNamespacesToVariables',function(){		
     const full = UTILS.addNamespacesToVariables(["A", "v:B"]);
     expect(full).to.eql(["v:A", "v:B"])
 })

 it('check removeNamespacesFromVariables',function(){		
     const full = UTILS.removeNamespacesFromVariables(["A", "v:B"]);
     expect(full).to.eql(["A", "B"])
 })
  
 it('check isStringType',function(){		
     expect(UTILS.TypeHelper.isStringType(UTILS.getStdURL("xsd", "string"))).to.equal(true);
     expect(UTILS.TypeHelper.isStringType(UTILS.getStdURL("xsd", "decimal"))).to.equal(false);
 })
 
 it('check numberWithCommas',function(){
     const cnum = UTILS.TypeHelper.numberWithCommas(10000.323);
     const cnum2 = UTILS.TypeHelper.numberWithCommas(100009323, ".");
     expect(cnum).to.equal("10,000.323");
     expect(cnum2).to.equal("100.009.323");
 })

 it('check parseDate',function(){
     let xsdstr = "-0001-02-01T10:12:23.3";
     let parsed = UTILS.DateHelper.parseDate("xsd:dateTime", xsdstr);
     const expected = { year: "-0001", month: 2, day: 1, hour: "10", minute: "12", second: "23.3", timezone: false}	
     expect(parsed).to.eql(expected);
 })
  
 it('check xsdFromParsed',function(){		
    const parsed = { year: "-0001", month: 2, day: 1, hour: "10", minute: "12", second: "23.3"}	
    let xsdstr = UTILS.DateHelper.xsdFromParsed(parsed, "xsd:dateTime");
    let expected = "-0001-02-01T10:12:23.3";
    expect(xsdstr).to.equal(expected);
 })

 it('check convertTimestampToXsd',function(){		
    let parsed = UTILS.DateHelper.convertTimestampToXsd(0);
    const expected = { year: 1970, month: 1, day: 1, hour: 1, minute: 0, second: 0}	
    expect(parsed).to.eql(expected);
 })
});


