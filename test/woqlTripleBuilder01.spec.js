const expect = require('chai').expect;

var WOQL = require('../lib/woql');
const woqlJson= require('./woqlJson/woqlJson')
const woqlDeleteJson= require('./woqlJson/woqlDeleteJson')


describe('triple builder', function () {

  it('check the triple method',function(){

    const woqlObject=WOQL.triple("a", "b", "c");
    expect(woqlObject.json()).to.eql(woqlJson.trypleJson);

    

  })

  it('check the quad method',function(){

    const woqlObject=WOQL.quad("a", "b", "c", "d");
    expect(woqlObject.json()).to.eql(woqlJson.quadJson);
   //console.log(JSON.stringify(woqlObject.json(), null, 4));
  })

  it('check the add_class method',function(){

    const woqlObject=WOQL.add_class("id");  
    expect(woqlObject.json()).to.eql(woqlJson.addClassJson);

  })

  it('check the sub method',function(){
    const woqlObject=WOQL.sub("ClassA","ClassB");
    expect(woqlObject.json()).to.eql(woqlJson.subsumptionJson);
  })

  it('check the isa method',function(){

    const woqlObject=WOQL.isa("instance","Class");

    const jsonObj={ isa: [ "scm:instance", "owl:Class" ] };
    
    expect(woqlObject.json()).to.eql(woqlJson.isAJson);

  })

 /* it('check the delete method',function(){

    const woqlObject=WOQL.delete({ triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] });

    const jsonObj={ delete: [ { triple: [ "doc:a", "scm:b", { "@language": "en", "@value": "c" } ] } ] };
    console.log(JSON.stringify(woqlObject.json(), null, 4));
    //expect(woqlObject.json()).to.eql(jsonObj);

  })*/

  it('check the delete_triple method',function(){
    const woqlObject=WOQL.delete_triple("a", "b", "c");
    expect(woqlObject.json()).to.eql(woqlJson.deleteTripleJson);

  })

  it('check the delete_quad method',function(){
    const woqlObject=WOQL.delete_quad("a", "b", "c", "d");
  
    expect(woqlObject.json()).to.eql(woqlJson.deleteQuadJson);

  })

  it('check the add_triple method',function(){

    const woqlObject=WOQL.add_triple("a", "b", "c");
    expect(woqlObject.json()).to.eql(woqlJson.addTripleJson);

  })

  it('check the add_quad method',function(){
    const woqlObject=WOQL.add_quad("a", "b", "c", "d");
    expect(woqlObject.json()).to.eql(woqlJson.addQuadJson);
  })


  it('check the add_property method',function(){
    const woqlObject=WOQL.add_property("some_property", "string");
    expect(woqlObject.json()).to.eql(woqlJson.addPropertyJson);

  })

})