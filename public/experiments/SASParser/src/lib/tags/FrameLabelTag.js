import * as Library from '../../Library.js';
import {Tag} from './Tag';

export class FrameLabelTag extends Tag{
	static get code(){
		return 43;
	}
	parse(buffer, offset){
		offset += this.recordHeader.size;
		this.frameName = Library.get('nulstring').parse(buffer, offset);
		return this;
	}
}

Library.defineTag(FrameLabelTag.code, FrameLabelTag);