const polka = require('polka');
const {join} = require('path');
const serveStatic = require('serve-static');
const sirv = require('sirv'); 
//const {http} = require('uws');
const http = require('http');

const PORT = 8080;
const dir = join(__dirname, 'public');
const serve = serveStatic(dir);

const {handler} = polka().use(serve);
	
http.createServer(handler).listen(PORT, err => {
	console.log(`> Running on localhost:${PORT}`);
});