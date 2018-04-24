const SASParser = class {
	static get VERSION(){
		return '0.0.1a';
	}
	constructor(maxTags){
		this.maxTags = maxTags || 500;
	}
	parse(buf){
		let buffer = new Uint8Array(buf);
		this.onfilestart();
		let index = 0;
		let header = new SASParser.lib['Header']().parse(buffer, index);
		buffer = header.buffer;
		index += header.size;
		this.onheader(header);
		//Header done
		let i = 0;
		for(i = 0; i != this.maxTags; i++){
			let rec = new SASParser.lib['RecordHeader']().parse(buffer, index);
			let tag = null;
			if(SASParser.lib.tags[rec.code]){
				tag = new SASParser.lib.tags[rec.code](rec).parse(buffer, index);
				this.ontag(tag);
			}else{
				tag = new SASParser.lib.tags[-1](rec).parse(buffer, index + rec.size);
				this.onunknowntag(tag);
			}
			if(rec.code === 0){
				break;
			}
			index += rec.size + rec.length;
		}
		this.onfileend(i);
	}
	//Abstract
	onfilestart(){
		
	}
	
	onheader(header){
		
	}
	
	ontag(tag){
		
	}
	
	onunknowntag(tag){
		
	}
	
	onfileend(iterations){
		
	}
}

SASParser.lib = {};
SASParser.lib.tags = [];