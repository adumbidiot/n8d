class codeFinder{
	constructor(){
		this.tries = 0;
		this.code = -1; 
		this.pause = false;
		this.noPauseOnCode = false;
		this.sockets = [];
		this.connections = 0;
		this.socketCFG = {
			"force new connection" : true, 
			"reconnectionAttempts": "Infinity", 
			"timeout" : 100000, 
			"transports" : ["websocket"]
		}
		this.sockets.push(io("https://socket.quizizz.com", this.socketCFG));
		this.sockets[0].on('connect', this.registerSocket.bind(this));
	}
	registerSocket(){
		this.connections++;
		//on new conn
		this.sockets[this.sockets.length - 1].on('checkRoom', this.onResult(this.sockets[this.sockets.length - 1]));
		this.sockets.push(io("https://socket.quizizz.com", this.socketCFG).on('connect', this.registerSocket.bind(this)));	
	}
	onResult(socket){
		if(!this.pause){
			socket.code = getCode();
			socket.emit('checkRoom', {roomCode: socket.code, d:1});
			this.tries++;
			//document.getElementById('tries').innerHTML = tries;
			//On new try
		}
		return function(data){
			var cur = socket.code;
			if(data){
				//document.getElementById('answers').innerHTML += '<p>' + cur + '</p>';
				this.onCode(cur);
				if(!this.noPauseOnCode){
					stop();	
				}
			}
			if(!this.pause){
				socket.code = getCode();
				socket.emit('checkRoom', {roomCode: socket.code, d:1});
				this.tries++;
				//document.getElementById('tries').innerHTML = tries;
			}
		}.bind(this);
	}
	stop(){
		pause = true;
	}
	go(){
		pause = false;
		test();
	}
	onCode(){
		
	}
}

function test(){
	for(var i = 0; i != sockets.length - 1; i++){
		tries++;
		sockets[i].code = getCode();
		sockets[i].emit('checkRoom', {roomCode: sockets[i].code, d:1});
		document.getElementById('tries').innerHTML = tries;
	}
}

function getCode(){
	this.code++;
	var data = code.toString();
	for(var i = data.length; i < 6; i++){
		data += '0';
	} 
	
	return data;
}

let l = new codeFinder();
l.onCode = function(l){
	console.log(l);
}