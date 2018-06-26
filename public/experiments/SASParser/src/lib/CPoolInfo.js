import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';

export class CPoolInfo extends Parsable{
	static get size(){
		return -1;
	}
	constructor(){
		super();
	}
	parse(buffer, offset){
		this.size = 0;
		this.int_count = Library.get('uint30variable').parse(buffer, offset);
		this.size += this.int_count.size;

		this.integer = [];
		for(let i = 0; i < this.int_count.value - 1; i++){
			this.integer.push(Library.get('Int32Variable').parse(buffer, offset + this.size));
			this.size += this.integer[this.integer.length - 1].size;
		}
		
		this.uinteger = [];
		this.uint_count = Library.get('uint30variable').parse(buffer, offset + this.size);
		this.size += this.uint_count.size;
		for(let i = 0; i < this.uint_count.value - 1; i++){
			this.uinteger.push(Library.get('Int32Variable').parse(buffer, offset + this.size));
			this.size += this.uinteger[this.uinteger.length - 1].size;
		}
		
		
		this.double_count = Library.get('uint30variable').parse(buffer, offset + this.size);
		this.size += this.double_count.size;
		
		this.double = [];
		for(let i = 0; i < this.double_count.value - 1; i++){
			this.double.push(Library.get('Double').parse(buffer, offset + this.size));
			this.size += this.double[this.double.length - 1].size;
		}
		
		return this;
	}
}

Library.define(CPoolInfo.name, CPoolInfo);