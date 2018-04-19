const SASParser = class {
	static get VERSION(){
		return '0.0.1a';
	}
	parse(buf){
		console.log(buf); //TEMP
		let buffer = new Uint8Array(buf);
		this.onfilestart();
		let index = 0;
		let header = new SASParser.lib['Header']().parse(buffer, index);
		buffer = header.buffer;
		index += header.size;
		this.onheader(header);
		//Header done
		for(let i = 0; i != 1; i++){
			let tag = new SASParser.lib['RecordHeader']().parse(buffer, index);
			console.log(tag);
		}
		
	}
	//Abstract
	onfilestart(){
		
	}
	
	onheader(){
		
	}
}

SASParser.lib = {};