let https = require('https');
let fs = require('fs');
let schoology = require('./schoology');

let client = new schoology.Client('', '');

let key = "";
let secret = "";
//let url = "https://api.schoology.com/v1/groups/818498677/updates";
//let url = "https://api.schoology.com/v1/users?start=0&limit=20000";
let url = "https://api.schoology.com/v1/groups";

let auth = client.getAuthHeader();
console.log(auth);

async function test(){
	try{
		let data = await client.request(url);
		fs.writeFile("./full-students.json", JSON.stringify(data), function(err) {
			if(err) {
				return console.log(err);
			}
			console.log("The file was saved!");
		}); 
	}catch(e){
		console.log(e);
	}
	
	
}


test();