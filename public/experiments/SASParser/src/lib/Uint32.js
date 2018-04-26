import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';

export class Uint32 extends Parsable{
	static get size(){
		return 4;
	}
	static get name(){
		return 'uint32';
	}
	constructor(){
		super();
		this.size = Uint32.size;
	}
	parse(buffer, offset){
		this.value = 0;
		for(let i = 0; i != 4; i++){
			this.value += (buffer[(i + offset)] << (i * 8));
		}
		return this;
	}
}

Library.define(Uint32.name, Uint32);