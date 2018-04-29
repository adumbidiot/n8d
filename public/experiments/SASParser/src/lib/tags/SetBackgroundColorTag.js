import * as Library from '../../Library.js';
import {Tag} from './Tag';

export class SetBackgroundColorTag extends Tag{
	static get code(){
		return 9;
	}
	parse(buffer, offset){
		offset += this.recordHeader.size;
		this.BackgroundColor = Library.get('rgb').parse(buffer, offset);
		return this;
	}
}

Library.defineTag(SetBackgroundColorTag.code, SetBackgroundColorTag);