import {Parsable} from './Parsable.js';
import * as Library from '../Library.js';
import {Uint32} from './Uint32.js';
import {Rect} from './Rect.js'
import pako from 'pako';

export class Header extends Parsable{
	static get name(){
		return 'header';
	}
	static get size(){
		return -1;
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
		
		this.rawSize = Library.get(Uint32.name).parse(buffer, offset + 4);
		//use decompressed buffer
		let sizeRect = Library.get(Rect.name).parse(this.buffer, 0);
		this.width = sizeRect.xMax / 20;
		this.height = sizeRect.yMax / 20;
		
		return this;
	}
}

Library.define(Header.name, Header);