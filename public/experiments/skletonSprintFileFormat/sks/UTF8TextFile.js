class UTF8TextFile {
	constructor(){
		let self = this;
		this.offset = 3;
	}
	load(path, cb){
		let self = this;
		let request = new XMLHttpRequest();
		request.responseType = 'arraybuffer';
		request.onreadystatechange = function(){
				if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
					self.buffer = new Uint8Array(this.response);
					self.magicNumber = '' + self.buffer[0] + '' + self.buffer[1] + self.buffer[2];
					if(self.magicNumber != '239187191'){
						self.magicNumber = null;
						self.offset = 0;
						console.log('No Magic Number Detected');
					}
					cb();
  				}
			}
		request.open('GET', path);
		request.send();
	}	
}