class codeFinder{
	constructor(opts){
		opts = opts || {};
		this.tries = 0;
		this.code = -1; 
		this.pause = opts.pause || false;
		this.pauseOnCode = opts.pauseOnCode || false;//true;
		this.sockets = [];
		this.connections = 0;
		this.maxConnections = opts.maxConnections || 40;
		this.socketCFG = {
			"force new connection" : true, 
			"reconnectionAttempts": "Infinity", 
			"timeout" : 100000, 
			"transports" : ["websocket"]
		}
		this.registerNewSocket();
	}
	registerNewSocket(){
		this.sockets.push(io("https://socket.quizizz.com", this.socketCFG).on('connect', this.onRegisteredSocket.bind(this)));
	}
	onRegisteredSocket(){
		this.connections++; //Add to var
		this.onconnection(this.connections); //tell user new conn
		
		let sock = this.sockets[this.sockets.length - 1];
		sock.on('v3/checkRoom', this.generateDataCallback(sock));
		
		if(!this.pause){ //if not paused..
			this.startTry(sock); //try a code
		}
		if(this.connections < this.maxConnections){ //If there is room for a conn...
			this.registerNewSocket(); //...register a new conn
		}
	}
	startTry(sock){
		this.tries++;
		this.ontry(this.tries) //Report to user
		sock.code = this.getCode(); //Get a new code
		sock.emit('v3/checkRoom', {roomCode: sock.code, d:1});//and send the try
	}
	generateDataCallback(sock){
		return function(data){
			let cur = sock.code;
			
			if(!data.error){ //if exists.. (returns null if not)
				//console.log(data);
				this.oncode(cur); //return code TODO: Return More Data
				if(this.pauseOnCode){
					this.stop(); //pause
				}
			}
			if(!this.pause){ //if not paused..
				this.startTry(sock); //try a code
			}
		}.bind(this);
	}
	stop(){
		this.pause = true;
		//this.onPauseChange
	}
	go(){
		let oldPauseValue = this.pause;
		this.pause = false;
		if(oldPauseValue){
			this.restartAllSockets();
		}
		//this.onPauseChange()
	}
	getCode(){
		this.code++;
		var data = this.code.toString();
		for(var i = data.length; i < 6; i++){
			data += '0';
		} 
		return data;
	}
	getCurrentCode(){
		return this.code;
	}
	restartAllSockets(){
		for(var i = 0; i != this.sockets.length; i++){
			this.startTry(this.sockets[i]);
		}
	}
	isPaused(){
		return this.pause;
	}
	oncode(){}
	onconnection(){}
	ontry(){}
}

function test(){
	for(var i = 0; i != sockets.length - 1; i++){
		tries++;
		sockets[i].code = getCode();
		sockets[i].emit('checkRoom', {roomCode: sockets[i].code, d:1});
		//document.getElementById('tries').innerHTML = tries;
	}
}