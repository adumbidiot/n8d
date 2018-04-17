const SASParser = class {
	static get VERSION(){
		return '0.0.1a';
	}
	parse(buf){
		console.log(buf); //TEMP
		let buffer = new Uint8Array(buf);
		this.onfilestart();
		let index = 0;
		let header = new SASParser.lib['Header']().parse(buffer, 0);
		buffer = header.buffer;
		console.log(header);
		
		
	}
	//Abstract
	onfilestart(){
		
	}
}

SASParser.lib = {};