let https = require('https');

function printHeaders(req){
	let keys = Object.keys(req.headers);
	for(var i = 0; i != keys.length; i++){
		console.log(keys[i] + ": '" + req.headers[keys[i]] + "'");
	}
}

module.exports.Client = class Client{
	constructor(key, secret){
		this.key = key;
		this.secret = secret;
	}
	
	getAuthHeader(){
		let key = this.key;
		let secret = this.secret;
		let time = Math.floor(new Date().getTime() / 1000);
		let nonce = (new Date().getTime()).toString(16);
	
		let result = '';
		result += `OAuth realm="Schoology API", `;
		result += `oauth_consumer_key="${key}", `;
		result += `oauth_token="", `;
		result += `oauth_nonce="${nonce}", `;
		result += `oauth_timestamp="${time}", `;
		result += `oauth_signature_method="PLAINTEXT", `;
		result += `oauth_version="1.0", `;
		result += `oauth_signature="${secret}%26"`;
		return result; 
	}
	
	request(url){
		let requestObject = {
			headers: {
				'Authorization': this.getAuthHeader(),
				'Content-Type': 'text/json',
				'Accept': 'application/json'
			}
		};
		
		return new Promise(function(resolve, reject){
			https.get(url, requestObject, function(req){
				let buf = "";
				req.on('data', function(data){
					buf += data;
				});
	
				req.on('end', function(){
					//console.log('Status: ' + req.statusCode);
					//printHeaders(req);
					try{
						let obj = JSON.parse(buf);
						console.log(obj);
						resolve(obj);
					}catch(e){
						reject({e, buf, status: req.statusCode});
					}
					
				});
			});
		});
	}
};