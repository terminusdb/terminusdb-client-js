const { expect } = require('chai');

const WOQL = require('../lib/woql');
const WOQLRule = require('../lib/viewer/woqlRule');
// var FrameRule = require('../lib/viewer/frameRule');

describe('woql rules', () => {
  it('check direct create WOQL Rule', () => {
    const woqlRule = new WOQLRule();
    woqlRule.literal(true).type('xdd:coordinatePolygon').scope('cell');
    const jsonObj = { pattern: { literal: true, type: ['xdd:coordinatePolygon'], scope: 'cell' } };
    expect(woqlRule.json()).to.eql(jsonObj);
  });
  /* it('Direct Create frame rule',function(){
        const woqlRule= new FrameRule();
        woqlRule.literal(true).type("xdd:coordinatePolygon").scope("data")
        const jsonObj= {pattern: {literal : true, type: ["xdd:coordinatePolygon"], scope: "data"}}
        expect(woqlRule.json()).to.eql(jsonObj);
    }) */
  /* it('Check Terminus Rule literal',function(){
        const woqlRule= new WOQLRule();
        const frameRule= new FrameRule();
        woqlRule.literal(true);
        frameRule.literal(true);
        const jsonObj = {pattern: {literal: true }};
        expect(woqlRule.json()).to.eql(jsonObj);
        expect(woqlRule.json()).to.eql(frameRule.json());
    })
    it('Check Terminus Rule type',function(){
        const woqlRule= new WOQLRule();
        const frameRule= new FrameRule();
        var t = "xsd:integer";
        woqlRule.type(t);
        frameRule.type(t);
        const jsonObj = {pattern: {type: [t] }};
        expect(woqlRule.json()).to.eql(jsonObj);
        expect(woqlRule.json()).to.eql(frameRule.json());
    })
    it('Check Terminus Rule scope',function(){
        const woqlRule= new WOQLRule();
        const frameRule= new FrameRule();
        var t = "edge";
        woqlRule.scope(t);
        frameRule.scope(t);
        const jsonObj = {pattern: {scope: t }};
        expect(woqlRule.json()).to.eql(jsonObj);
        expect(woqlRule.json()).to.eql(frameRule.json());
    })
    it('Check Terminus Rule value',function(){
        const woqlRule= new WOQLRule();
        const frameRule= new FrameRule();
        var t = "hello world";
        woqlRule.value(t);
        frameRule.value(t);
        const jsonObj = {pattern: {value: [t] }};
        expect(woqlRule.json()).to.eql(jsonObj);
       // expect(woqlRule.json()).to.eql(frameRule.json());
    }) */
  it('Check Terminus Pattern', () => {
    const woqlRule = new WOQLRule();
    const t = 'hello world';
    const x = woqlRule.pattern.testValue(t, t);
    const y = woqlRule.pattern.testValue(t, [t]);
    const z = woqlRule.pattern.testValue({ '@value': t }, [t]);
    const c = woqlRule.pattern.testValue({ '@value': t }, (n) => n == 'hello world');
    expect(x).to.equal(true);
    expect(y).to.equal(true);
    expect(z).to.equal(true);
    expect(c).to.equal(true);
  });
  it('Check Terminus Basics', () => {
    const woqlRule = new WOQLRule();
    woqlRule.scope('row').type('xsd:integer').value('>45');
    const t = woqlRule.pattern.testBasics('row', { '@value': 46, '@type': 'xsd:integer' });
    expect(t).to.equal(true);
  });
  it('Check woql Rule set Variables', () => {
    const woqlRule = new WOQLRule();
    woqlRule.setVariables(['a', 'b']);
    const jsonObj = { pattern: { variables: ['a', 'b'] } };
    expect(woqlRule.json()).to.eql(jsonObj);
  });
  it('Check woql Rule set Variable', () => {
    const woqlRule = new WOQLRule();
    woqlRule.scope('row').v('a').in(4);
    const jsonObj = { pattern: { scope: 'row', constraints: { a: [[4]] } } };
    expect(woqlRule.json()).to.eql(jsonObj);
  });
  it('Check woql Rule edge', () => {
    const woqlRule = new WOQLRule();
    woqlRule.edge('a', 'b');
    const jsonObj = {
      pattern: {
        scope: 'edge', source: 'a', target: 'b', variables: ['a'],
      },
    };
    expect(woqlRule.json()).to.eql(jsonObj);
  });
  it('Check woql Rule rownum', () => {
    const woqlRule = new WOQLRule();
    woqlRule.rownum(2);
    const jsonObj = { pattern: { rownum: 2 } };
    expect(woqlRule.json()).to.eql(jsonObj);
  });
  it('Check woql Rule in', () => {
    const woqlRule = new WOQLRule();
    woqlRule.v('a').in('a', 'b', 'abc');
    const jsonObj = { pattern: { constraints: { a: [['a', 'b', 'abc']] } } };
    expect(woqlRule.json()).to.eql(jsonObj);
  });
  it('Check woql Rule filter', () => {
    const woqlRule = new WOQLRule();
    const ff = function (a) { if (a == 'abc') return true; return false; };
    woqlRule.v('a').filter(eval(ff));
    const jsonObj = { pattern: { constraints: { a: [ff] } } };
    expect(woqlRule.json()).to.eql(jsonObj);
  });
  it('Check woql Rule matchRow', () => {
    const r1 = new WOQLRule();
    r1.scope('row').v('a').in(1).rownum(3);
    const row = { a: 1, b: '43' };
    expect(r1.matchRow([r1], row, 3).length).to.equal(1);
  });
  it('Check woql Rule matchColumn', () => {
    const r1 = new WOQLRule();
    r1.scope('column').vars('b');
    expect(r1.matchColumn([r1], 'b').length).to.equal(1);
  });
  it('Check woql Rule matchCell', () => {
    const r1 = new WOQLRule();
    r1.vars('b');
    const row = { a: 1, b: '43' };
    expect(r1.matchCell([r1], row, 'b', 1).length).to.equal(1);
  });
  it('Check woql Rule matchPair', () => {
    const r1 = new WOQLRule();
    r1.edge('a', 'b');
    const row = { a: 1, b: '43' };
    expect(r1.matchPair([r1], row, 'a', 'b').length).to.equal(1);
  });
  it('Check woql Rule matchNode', () => {
    const r1 = new WOQLRule();
    r1.scope('node').vars('a').in('>0');
    const row = { a: 1, b: '43' };
    expect(r1.matchNode([r1], row, 'a').length).to.equal(1);
  });
  /*
    it('Check frame Rule scope',function(){
        const fr = new FrameRule();
        fr.scope("object");
        const jsonObj = {pattern: {scope: "object"}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule label',function(){
        const fr = new FrameRule();
        fr.scope("*").label("helo world");
        const jsonObj = {pattern: {scope: "*", label: ["helo world"]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule frame_type',function(){
        const fr = new FrameRule();
        fr.scope("data").frame_type("oneOf");
        const jsonObj = {pattern: {scope: "data", frame_type: ["oneOf"]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule subject',function(){
        const fr = new FrameRule();
        fr.scope("object").subject("doc:mine");
        const jsonObj = {pattern: {scope: "object", subject: ["doc:mine"]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule subjectClass',function(){
        const fr = new FrameRule();
        fr.scope("object").subjectClass("scm:Mine");
        const jsonObj = {pattern: {scope: "object", subjectClass: ["scm:Mine"]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule range',function(){
        const fr = new FrameRule();
        fr.scope("property").range("scm:Mine");
        const jsonObj = {pattern: {scope: "property", range: ["scm:Mine"]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule type',function(){
        const fr = new FrameRule();
        fr.scope("property").type("scm:Mine");
        const jsonObj = {pattern: {scope: "property", type: ["scm:Mine"]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule literal',function(){
        const fr = new FrameRule();
        fr.scope("property").literal(true);
        const jsonObj = {pattern: {scope: "property", literal: true}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule property',function(){
        const fr = new FrameRule();
        fr.scope("property").property("rdfs:comment");
        const jsonObj = {pattern: {scope: "property", property: ["rdfs:comment"]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule value',function(){
        const fr = new FrameRule();
        fr.scope("property").value(400);
        const jsonObj = {pattern: {scope: "property", value: [400]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule depth',function(){
        const fr = new FrameRule();
        fr.scope("property").depth(">3");
        const jsonObj = {pattern: {scope: "property", depth: ">3"}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule index',function(){
        const fr = new FrameRule();
        fr.scope("property").index(2);
        const jsonObj = {pattern: {scope: "property", index: [2]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule status',function(){
        const fr = new FrameRule();
        fr.scope("property").status("error");
        const jsonObj = {pattern: {scope: "property", status: ["error"]}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule parent',function(){
        const par = new FrameRule();
        par.subject("s")
        const fr = new FrameRule();
        fr.scope("property").parent(par.pattern);
        const jsonObj = {pattern: {scope: "property", parent: {subject: ["s"]}}};
        expect(fr.json()).to.eql(jsonObj);
    })
    it('Check frame Rule children',function(){
        const par = new FrameRule();
        par.subject("s")
        const fr = new FrameRule();
        fr.scope("property").children(par.pattern);
        const jsonObj = {pattern: {scope: "property", children: [{subject: ["s"]}]}};
        expect(fr.json()).to.eql(jsonObj);
    }) */
});

/* describe('woql test frame', function () {
    it('Check frame pattern 1',function(){
        const fr = new FrameRule();
        fr.scope("*");
        //fr.patternMatchesFrame(pframe);
    })
}) */
