import * as Library from '../../Library.js';
import {Tag} from './Tag.js';

export class EndTag extends Tag{
	static get code(){
		return 0;
	}
	parse(buffer, offset){
		this.size = this.recordHeader.length + this.recordHeader.size;
		this.data = buffer.slice(offset + this.recordHeader.size, offset + this.size);
		return this;
	}
}

Library.defineTag(EndTag.code, EndTag);