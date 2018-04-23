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
		let i = 0;
		for(i = 0; i != 500; i++){
			let tag = new SASParser.lib['RecordHeader']().parse(buffer, index);
			if(SASParser.lib[tag.code]){
				
			}else{
				this.onunknowntag(tag, buffer.slice(index + tag.size, index + tag.size + tag.length));
			}
			if(tag.code === 0){
				break;
			}
			index += tag.size + tag.length;
		}
		this.onfileend(i);
	}
	//Abstract
	onfilestart(){
		
	}
	
	onheader(){
		
	}
	
	onunknowntag(){
		
	}
	
	onfileend(iterations){
		
	}
}

SASParser.lib = {};