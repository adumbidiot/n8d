var mdns = require('multicast-dns')()
 
mdns.on('response', function(response) {
  	if((response.answers[0].name.toLowerCase() == 'nanoAlien.local'.toLowerCase())||(response.answers[0].name.toLowerCase() == 'brunhilde.local'.toLowerCase())){
		console.log(response);
	}
});

mdns.on('query', function(query) {
	if((query.questions[0].name == 'nanoalien.local')||(query.questions[0].name == 'brunhilde.local')){
		console.log(query);
	}
	if((query.questions[0].name == 'brunhilde.local')){
		mdns.respond([{name:'brunhilde.local', type:'A', data:'10.174.16.98'}]);
		console.log('respond');
	}
});
 
// lets query for an A record for 'brunhilde.local' 
mdns.query({
  questions:[{
    name: 'nanoalien.local',
    type: 'A'
  }]
});

mdns.query('brunhilde.local', 'A');

mdns.respond([{name:'brunhilde.local', type:'A', data:'10.174.16.98'}]);