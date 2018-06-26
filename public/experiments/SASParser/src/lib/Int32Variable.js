import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';

export class Int32Variable extends Parsable{
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
			this.value += ((buffer[offset + this.size] & 0b01111111) << (this.size * 7));
			this.size++;
		}while(buffer[offset + this.size - 1] >= 128);
		
		/*if(this.size >= 2){ 
			console.log(buffer[offset], buffer[offset+1], buffer[offset+1] << 6, this.value);
		}*/
		
		return this;
	}
}

Library.define(Int32Variable.name, Int32Variable);