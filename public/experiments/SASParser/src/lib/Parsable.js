export class Parsable {
	static get size(){
		throw "Method size from parsable object must be implemented!";
		//Return -1 if size is dynamic
	}
	constructor(){
		this.size = 0;
		//Size set to CLASSNAME.size or 0 if dynamic;
	}
	parse(buffer, index){
		throw "Method Parse from parsable object must be implemented!";
	}
}