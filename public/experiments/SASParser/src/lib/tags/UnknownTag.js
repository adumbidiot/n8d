import * as Library from '../../Library.js';
import {Tag} from './Tag';

export class UnknownTag extends Tag{
	static get code(){
		return -1;
	}
	parse(buffer, offset){
		this.data = buffer.slice(offset + this.recordHeader.size, offset + this.size);
		return this;
	}
}

Library.defineTag(UnknownTag.code, UnknownTag);