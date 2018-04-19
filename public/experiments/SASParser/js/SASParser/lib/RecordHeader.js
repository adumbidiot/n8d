SASParser.lib['RecordHeader'] = class extends SASParser.Parsable {
	constructor(){
		super();
	}
	parse(buffer, offset){
		let uint = new SASParser.lib['Uint16'](buffer, offset);
		let size = 2;
		let length = uint & (0x3F);
		let long = (length < 0x3F) ? false : true;
		if(long){
			length = this.parseUint32(index + 2);
			size += 4;
		}
		
		return {
			code: uint >> 6,
			length: length,
			long: long,
			size: size,
			_uint16: uint
		}
		return this;
	}
}