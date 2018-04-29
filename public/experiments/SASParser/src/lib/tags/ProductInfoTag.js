import * as Library from '../../Library.js';
import {Tag} from './Tag';

export class ProductInfoTag extends Tag{
	static get code(){
		return 41;
	}
	parse(buffer, offset){
		offset += this.recordHeader.size;
		this.productID = Library.get('uint32').parse(buffer, offset);
		offset += this.productID.size;
		this.edition = Library.get('uint32').parse(buffer, offset);
		offset += this.edition.size;
		this.majorVersion = buffer[offset];
		offset++;
		this.minorVersion = buffer[offset];
		offset++;
		this.buildLow = Library.get('uint32').parse(buffer, offset);
		offset += this.buildLow.size;
		this.buildHigh = Library.get('uint32').parse(buffer, offset);
		offset += this.buildHigh.size;
		this.compilationDateLow = Library.get('uint32').parse(buffer, offset);
		offset += this.compilationDateLow.size;
		this.compilationDateHigh = Library.get('uint32').parse(buffer, offset);
		offset += this.compilationDateHigh.size;
		return this;
	}
}

Library.defineTag(ProductInfoTag.code, ProductInfoTag);