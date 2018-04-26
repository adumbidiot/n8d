import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';
import pako from 'pako';

export class Header extends Parsable{
	static get name(){
		return 'header';
	}
	
	static get size(){
		return 0;
	}
	
	constructor(){
		super();
	}
	
	parse(buffer, offset){
		this.magic = '';
		this.compression = 'NONE';
		this.version = buffer[offset + 3];
		
		for(let i = 0; i != 3; i++){
			this.magic += String.fromCharCode(buffer[i + offset]);
		}
		
		switch(this.magic){
			case 'CWS': {
				this.compression = "ZLIB"; //SWF 6 later
				let compressedBuffer = new Uint8Array(buffer.buffer.slice(8));
				this.buffer = pako.inflate(compressedBuffer);
				break;
			}
			default: {
				throw "Unrecognized Magic Number (" + this.magic + ")!";
			}
		}
		
		this.rawSize = Library.get('uint32').parse(buffer, offset + 4);
		//use decompressed buffer
		let sizeRect = Library.get('rect').parse(this.buffer, 0);
		this.width = sizeRect.xMax / 20;
		this.height = sizeRect.yMax / 20;
		this.size = sizeRect.size;
		offset = this.size;
		
		this.frameRate = Library.get('fixed8').parse(this.buffer, offset);
		offset += this.frameRate.size;
		
		this.frameCount = Library.get('uint16').parse(this.buffer, offset);
		offset += this.frameCount.size;
		this.size = offset;

		return this;
	}
}

Library.define(Header.name, Header);