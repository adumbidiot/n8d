SASParser.lib.String = class extends SASParser.Parsable {
	constructor(){
		super();
		this.size = 0;
		this.value = '';
	}
	parse(buffer, offset){
		let i = offset;
		while(buffer[i] != 0){
			this.value += String.fromCharCode(buffer[i]);
			i++;
		}
		this.size = i - offset;
		
		return this;
	}
}