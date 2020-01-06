const expect = require('chai').expect;

var ObjectFrame = require('../lib/objectFrame');

describe('Object Frame Rules', function () { 
    it('check the Object Frame constructor',function(){
        const dof = new ObjectFrame("mycls");
        const frames = dof.getAsFrame("myprop", {cls: "ParentCls", subjid: "doc:utop"});
        const jsonObj= {domain: "ParentCls", domainValue : "doc:utop", frame: [], property: "myprop", range: "mycls", type: "objectProperty"};
        expect(frames).to.eql(jsonObj);
    })
    it('check the Class Frame Loading',function(){
        const dof = new ObjectFrame("mycls");
        dof.subjid = "doc:utop";
        const frames = [{domain: "mycls", domainValue : "doc:utop", property: "mprop", range: "xsd:string", type: "datatypeProperty", rangeValue: {"@value": "", "@type": "xsd:string"}, label: {"@value": "Prop label", "@type": "xsd:string"}}];
        dof.loadClassFrames(frames);
        const df = dof.addProperty("mprop");
        df.set("helloworld");
        const extract = dof.extract();
        const jsonObj= {"@id": "doc:utop", "@type": "mycls", mprop: [{ "@type": "xsd:string", "@value": "helloworld"}]};
        expect(extract).to.eql(jsonObj);
    })

})

