SASParser.lib.Uint16 = class extends SASParser.Parsable {
	constructor(){
		super();
		this.size = 2;
	}
	parse(buffer, offset){
		this.value = 0;
		for(let i = 0; i != 2; i++){
			this.value += (buffer[(i + offset)] << (i * 8));
		}
		return this;
	}
}