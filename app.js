var TerminusDB = require('./index.js');
//var UTILS = require('./lib/utils.js');

var dbClient= new TerminusDB.WOQLClient();



var connection=dbClient.connect("http://195.201.12.87:6363", "root");

connection.then((response)=>{
	console.log("I'm connect")


	dbClient.getSchema(getSchema,{"terminus:encoding":"terminus:turtle"}).then((response)=>
	console.log("getSchema RESPONSE OK")).catch((err)=>{
	console.log("PROMISE reject", 'GETSCHEMA');
});
	

}).catch((err)=>{
	console.log("PROMISE reject", 'CONNECTION');
});

//dbClient.getClassFrame('http://pippo').then(response=>{console.log(response)}).catch(err=>{
//	console.log("GETFRAME ERROR");
//})

var getSchema='terminus';





//var cc= new TerminusDB.IDParser();

//https://github.com/caolan/async