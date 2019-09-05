var TerminusDB = require('./index.js');
//var UTILS = require('./lib/utils.js');

var dbClient= new TerminusDB.WOQLClient();

var connection=dbClient.connect("https://dev.datachemist.net/platform", "root");

connection.then((response)=>console.log("I'm connect",response)).catch((err)=>{
	console.log("PROMISE reject", 'CONNECTION');
});

dbClient.getClassFrame('http://pippo').then(response=>{console.log(response)}).catch(err=>{
	console.log("GETFRAME ERROR");
})

var cc= new TerminusDB.IDParser();

//https://github.com/caolan/async