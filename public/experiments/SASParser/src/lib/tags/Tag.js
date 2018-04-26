import {Parsable} from '../Parsable.js';

export class Tag extends Parsable{
	static get code(){
		throw "Static method code must be implemented";
	}
	static get size(){
		return 0;
	}
	constructor(recordHeader){
		super();
		this.recordHeader = recordHeader;
		this.name = this.constructor.name;
	}
}