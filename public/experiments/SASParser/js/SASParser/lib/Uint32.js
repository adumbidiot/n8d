SASParser.lib.Uint32 = class {
	constructor(){
		this.size = 4;
	}
	parse(buffer, offset){
		this.value = 0;
		for(let i = 0; i != 4; i++){
			this.value += (buffer[(i + offset)] << (i * 8));
		}
		return this;
	}
}