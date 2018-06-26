import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';

export class ABCFile extends Parsable{
	static get size(){
		return 0;
	}
	
	constructor(){
		super();
	}
	
	parse(buffer, offset){
		this.minorVersion = Library.get('uint16').parse(buffer, offset); 
		this.size += 2;
		this.majorVersion = Library.get('uint16').parse(buffer, offset + this.size);
		this.size += 2;
		this.constantPool = Library.get('CPoolInfo').parse(buffer, offset + this.size);
		console.log(this.constantPool);
		return this;
	}
}

Library.define(ABCFile.name, ABCFile);