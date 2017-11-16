const fastify = require('fastify')();
const fastifyStatic = require('fastify-static');
const path = require('path');

fastify.register(fastifyStatic, {
	root: path.join(__dirname, 'public')
});

fastify.listen(8080, function(err){
	if(err){
		throw err;
	}else{
		console.log('server running');
	}
});