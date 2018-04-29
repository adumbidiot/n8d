import * as Library from '../Library.js';
import {Parsable} from './Parsable.js';

export class RecordHeader extends Parsable {
	static get size(){
		return 0;
	}
	constructor(){
		super();
	}
	parse(buffer, offset){
		this._uint = Library.get('uint16').parse(buffer, offset);
		this.size += this._uint.size;
		this.length = this._uint.value & (0x3F);
		this.long = (this.length < 0x3F) ? false : true;
		if(this.long){
			this.length = Library.get('uint32').parse(buffer, offset + this.size).value;
			this.size += 4;
		}
		this.code = this._uint.value >> 6;
		return this;
	}
}
Library.define(RecordHeader.name, RecordHeader);