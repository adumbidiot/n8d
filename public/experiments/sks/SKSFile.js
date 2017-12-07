class SKSFile {
	constructor(){
		this.buffer = new Uint8Array(32 * 18);
		
	}
	fromLBLArray(array){
		for(let i = 0; i != 32 * 18; i++){
			this.buffer[i] = this.LBLToSKS(array[i]);
		}
	}
	LBLToSKS(val){
		switch(val){
			case '00': {
				return 0x00;
			}
			case 'X0': {
				return 0x01;
			}
			case 'B0': {
				return 0x02;
			}
			case 'BK': {
				return 0x03;
			}
			case 'E0': {
				return 0x04;
			}
			case 'S0': {
				return 0x05;
			}
			case 'T0': {
				return 0x06;
			}
			case 'T1': {
				return 0x07;
			}
			case 'WR': {
				return 0x08;
			}
			case 'P0': {
				return 0x09;
			}
			case 'IK': {
				return 0x0A;
			}
			case 'Z0': {
				return 0x0B;
			}
			case 'D0': {
				return 0x0C;
			}
			case 'D1': {
				return 0x0D;
			}
		}
		return null;
	}
	download(){
		let d = new Uint8Array(3 + (32 * 18));
		d[0] = 0x53;
		d[1] = 0x4B;
		d[2] = 0x53;
		for(let i = 0; i != 32 * 18; i++){
			d[i + 3] = this.buffer[i];
		}
		console.log(d);
		download(d, 'level.sks', 'application/octet-stream');
	}
	load(path){
		let self = this;
		let request = new XMLHttpRequest();
		request.responseType = 'arraybuffer';
		request.onreadystatechange = function(){
			if(this.readyState === XMLHttpRequest.DONE && this.status === 200) {
				let res = new Uint8Array(this.response);
				console.log('Loaded SKS: ');
				console.log(res);
				self.magicNumber = String.fromCharCode(res[0]) + String.fromCharCode(res[1]) + String.fromCharCode(res[2]);
				if(self.magicNumber != 'SKS'){
					throw "Magic Number Not Recognized: " + magicNumber;
				}
				for(let i = 0; i != (18 * 32) + 3; i++){
					self.buffer[i] = res[i + 3];
				}
				console.log(self.buffer);
			}
		}
		request.open('GET', path);
		request.send();
	}
}