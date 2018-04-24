SASParser.lib.tags[-1] = class extends SASParser.Parsable {
	constructor(header){
		super();
		this.header = header;
		this.size = 0;
		this.type = 'Unknown';
	}
	parse(buffer, offset, size){
		this.size = this.header.length + this.header.size;
		this.data = buffer.slice(offset + this.header.size, offset + this.size);
		return this;
	}
}