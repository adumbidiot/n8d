import * as Library from '../../Library.js';
import {Tag} from './Tag.js';

export class DoABCTag extends Tag{
	static get code(){
		return 82;
	}
	parse(buffer, offset){
		let start = offset;
		this.size = this.recordHeader.length + this.recordHeader.size;
		this.flags = Library.get('uint32').parse(buffer, offset + this.recordHeader.size);
		this.scriptName = Library.get('nulstring').parse(buffer, offset + this.recordHeader.size + this.flags.size);
		offset += this.recordHeader.size + this.flags.size + this.scriptName.size;
		this.data = buffer.slice(offset, start + this.recordHeader.length);
		return this;
	}
}

Library.defineTag(DoABCTag.code, DoABCTag);