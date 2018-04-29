import * as Library from '../../Library.js';
import {Tag} from './Tag';

export class SymbolClassTag extends Tag{
	static get code(){
		return 76;
	}
	constructor(recordHeader){
		super(recordHeader);
		this.maxSymbols = 100;
	}
	parse(buffer, offset){
		offset += this.recordHeader.size;
		this.numSymbols = Library.get('uint16').parse(buffer, offset);
		offset += this.numSymbols.size;
		this.tagID = [];
		this.className = [];
		
		for(let i = 0; i < this.numSymbols.value && i < this.maxSymbols; i++){
			this.tagID.push(Library.get('uint16').parse(buffer, offset));
			offset += this.tagID[this.tagID.length - 1].size;
			this.className.push(Library.get('nulstring').parse(buffer, offset));
			offset += this.className[this.className.length - 1].size;
		}
		
		return this;
	}
}

Library.defineTag(SymbolClassTag.code, SymbolClassTag);