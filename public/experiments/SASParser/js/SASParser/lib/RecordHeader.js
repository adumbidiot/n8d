SASParser.lib['RecordHeader'] = class extends SASParser.Parsable {
	constructor(){
		super();
	}
	parse(buffer, offset){
		let uint = new SASParser.lib['Uint16']().parse(buffer, offset).value;
		let size = 2;
		let length = uint & (0x3F);
		let long = (length < 0x3F) ? false : true;
		if(long){
			length = new SASParser.lib['Uint16']().parse(buffer, offset + 2).value;
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