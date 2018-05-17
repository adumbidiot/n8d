const fastify = require('fastify')();
const fastifyStatic = require('fastify-static');
const path = require('path');
const PORT = 8080;

fastify.register(fastifyStatic, {
	root: path.join(__dirname, 'public')
});

fastify.listen(8888, function(err){
	if(err){
		throw err;
	}else{
		console.log('Server Running on port ' + PORT);
	}
});