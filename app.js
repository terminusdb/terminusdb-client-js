var WOQLClient = require('./lib/woqlClient');

var dbClient= new WOQLClient();

var connection=dbClient.connect("http://195.201.12.87:6363/", "root");

connection.then((response)=>console.log("I'm connect")).catch((err)=>{
	console.log(err);
});


//https://github.com/caolan/async