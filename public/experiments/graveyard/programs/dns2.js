var mdns = require('multicast-dns')()
 
mdns.on('response', function(response) {
  	
});

mdns.on('query', function(query) {
	if(query.questions[0].name == 'nanopi.home'){
		console.log(query);
	}
	console.log(query.questions[0].name);
});
 

