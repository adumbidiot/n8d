SASParser.lib['Fixed8'] = class extends SASParser.Parsable{
	constructor(){
		super();
		this.size = 2;
	}
	parse(buffer, offset){
		let first = buffer[offset];
		let second = buffer[offset + 1];
		this.value = second;
		return this; //Incomplete? Stolen from v1
	}
}