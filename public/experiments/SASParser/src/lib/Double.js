import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';

export class Double extends Parsable{
	static get size(){
		return 8;
	}
	constructor(){
		super();
		this.value = 0;
	}
	parse(buffer, offset){
		this.fraction = 0;
		for(let i = 0; i != 6; i++){
			console.log(this.fraction);
			this.fraction += buffer[i + offset] << (i * 8);
		}
		
		
		this.sign = buffer[offset + 8] & 0b10000000;
		this.exponent = (buffer[offset + 7] & 0b01111111) | (buffer[offset + 6] & 0b11110000) << 3;
		console.log(buffer[offset+ 7], buffer[offset + 6], this.exponent);
		
		
		return this;
	}
}

Library.define(Double.name, Double);