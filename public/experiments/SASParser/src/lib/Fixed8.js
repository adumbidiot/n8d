import * as Library from '../Library.js';
import {Parsable} from './Parsable.js';

export class Fixed8 extends Parsable{
	static get size(){
		return 2;
	}
	static get name(){
		return 'fixed8';
	}
	constructor(){
		super();
		this.value = 0;
	}
	parse(buffer, offset){
		let first = buffer[offset];
		this.value += buffer[offset + 1];
		return this; //Incomplete? Stolen from v1
	}
}

Library.define(Fixed8.name, Fixed8);