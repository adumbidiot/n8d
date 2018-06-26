import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';

export class Uint30Variable extends Parsable{
	static get size(){
		return -1;
	}
	constructor(){
		super();
		this.value = 0;
	}
	parse(buffer, offset){
		this.size = 0;
		do{
			this.value += (buffer[offset + this.size] << this.size);
			this.size++;
		}while(buffer[offset + this.size - 1] >= 128);
		
		return this;
	}
}

Library.define(Uint30Variable.name, Uint30Variable);