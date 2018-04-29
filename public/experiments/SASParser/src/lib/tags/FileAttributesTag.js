import * as Library from '../../Library.js';
import {Tag} from './Tag';

export class FileAttributesTag extends Tag{
	static get code(){
		return 69;
	}
	parse(buffer, offset){
		offset += this.recordHeader.size;
		let uint = buffer[offset];
		this.reserved1 = this.isBitSet(uint, 7);
		this.useDirectBlit = this.isBitSet(uint, 6);
		this.useGPU = this.isBitSet(uint, 5);
		this.hasMetadata = this.isBitSet(uint, 4);
		this.actionScript3 = this.isBitSet(uint, 3);
		this.noCrossDomainCache = this.isBitSet(uint, 2);
		this.reserved2 = this.isBitSet(uint, 1);
		this.useNetwork = this.isBitSet(uint, 0);
		//Next 3 bytes reserved
		return this;
	}
	isBitSet(uint, offset){
		return (uint & (1 << offset))> 0;
	}
}

Library.defineTag(FileAttributesTag.code, FileAttributesTag);