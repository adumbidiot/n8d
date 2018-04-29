import * as Library from '../../Library.js';
import {Tag} from './Tag';

export class MetadataTag extends Tag{
	static get code(){
		return 77;
	}
	parse(buffer, offset){
		this.Metadata = Library.get('nulstring').parse(buffer, offset + this.recordHeader.size);
		return this;
	}
}

Library.defineTag(MetadataTag.code, MetadataTag);