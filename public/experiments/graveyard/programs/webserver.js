var express = require('express');
var app = express();
var views = 0;
var port = 80;

app.use(function(req, res, next){
		console.log('IP:    ' + req.ip);
		console.log('Views: ' + views + ' +1');
		views++;
		next();
	});

app.get('/*', function(req, res){
		res.send('Hello World');	
	});

app.listen(port, function(){
	console.log('App listening at port ' + port);
});