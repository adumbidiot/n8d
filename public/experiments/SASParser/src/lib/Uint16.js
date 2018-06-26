import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';

export class Uint16 extends Parsable{
	static get size(){
		return 2;
	}
	constructor(){
		super();
		this.value = 0;
	}
	parse(buffer, offset){
		for(let i = 0; i != this.size; i++){
			this.value += (buffer[(i + offset)] << (i * 8));
		}
		return this;
	}
}

Library.define(Uint16.name, Uint16);