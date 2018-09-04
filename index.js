const polka = require('polka');
const {join} = require('path');
const serveStatic = require('sirv');

const sirv = require('sirv'); 
//const {http} = require('uws');
const http = require('http');

const PORT = 8080;
const dir = join(__dirname, 'public');

let serveOpts = {
	dev: (process.env.NODE_ENV == 'development'),
	etag: true
};

const serve = sirv(dir, serveOpts);

const {handler} = polka().use(serve);
	
http.createServer(handler).listen(PORT, err => {
	console.log(`> Running on localhost:${PORT}`);
});