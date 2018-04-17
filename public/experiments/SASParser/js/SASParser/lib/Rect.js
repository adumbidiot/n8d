SASParser.lib['Rect'] = class extends SASParser.Parsable {
	constructor(){
		super();
	}
	parse(buffer, offset){
		let nbits = buffer[offset] >> 3; //uint8 to "uint5"
		let size = (nbits * 4) + 5;
		while(size % 8 != 0){
			size++;
		}		
		let xMin = 0;
		let xMax = 0;
		let yMin = 0;
		let yMax = 0;
		
		let bitPos = 5;
				
		for(let i = bitPos; i != nbits + bitPos; i++){
			let byteP = (i/8) | 0;
			let bitP = 7 - (i % 8);
			xMin += ((buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
		}
		bitPos += nbits;
		
		for(let i = bitPos; i != nbits + bitPos; i++){
			let byteP = (i/8) | 0;
			let bitP = 7 - (i % 8);
			xMax += ((buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
		}
		bitPos += nbits;
		
		for(let i = bitPos; i != nbits + bitPos; i++){
			let byteP = (i / 8) | 0;
			let bitP = 7 - (i % 8);
			yMin += ((buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
		}
		bitPos += nbits;
		
		for(let i = bitPos; i != nbits + bitPos; i++){
			let byteP = (i/8) | 0;
			let bitP = 7 - (i % 8);
			yMax += ((buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
		}
		bitPos += nbits;
		
		this.nbits = nbits;
		this.size = size/8;
		this.xMin = xMin;
		this.xMax = xMax;
		this.yMin = yMin;
		this.yMax = yMax;
		return this;
	}
}