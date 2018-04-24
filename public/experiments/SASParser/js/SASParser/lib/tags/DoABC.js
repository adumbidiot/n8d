SASParser.lib.tags[82] = class extends SASParser.Parsable {
	constructor(header){
		super();
		this.header = header;
		this.size = 0;
		this.type = 'DoABC';
	}
	parse(buffer, offset, size){
		let start = offset;
		this.size = this.header.length + this.header.size;
		offset += this.header.size;
		this.flags = new SASParser.lib['Uint32']().parse(buffer, offset);
		offset += this.flags.size;
		this.name = new SASParser.lib['String']().parse(buffer, offset);
		offset += this.name.size;
		this.data = buffer.slice(offset, start + this.header.length);
		return this;
	}
}