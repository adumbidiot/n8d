import * as Library from '../Library.js';
import {Parsable} from './Parsable.js';

export class RGB extends Parsable{
	static get size(){
		return 3;
	}
	constructor(){
		super();
	}
	parse(buffer, offset){
		this.R = buffer[offset];
		offset += 1;
		this.G = buffer[offset];
		offset += 1;
		this.B = buffer[offset];
		return this;
	}
}

Library.define(RGB.name, RGB);