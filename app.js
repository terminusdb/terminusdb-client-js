var WOQLClient = require('./index.js');

var dbClient= new WOQLClient();

var connection=dbClient.connect("http://195.201.12.87:6363/", "root");

connection.then((response)=>console.log("I'm connect")).catch((err)=>{
	console.log("PROMISE reject", 'CONNECTION');
});

dbClient.getClassFrame('http://pippo').then(response=>{console.log(response)}).catch(err=>{
	console.log("GETFRAME ERROR");
})


//https://github.com/caolan/async