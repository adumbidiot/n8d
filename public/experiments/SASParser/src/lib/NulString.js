import * as Library from '../Library.js';
import {Parsable} from './Parsable.js';

export class NulString extends Parsable{
	static get size(){
		return 0;
	}
	constructor(){
		super();
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

Library.define(NulString.name, NulString);