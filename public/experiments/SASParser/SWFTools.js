(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cdnjs.cloudflare.com/ajax/libs/pako/1.0.6/pako.js')) :
	typeof define === 'function' && define.amd ? define(['exports', 'cdnjs.cloudflare.com/ajax/libs/pako/1.0.6/pako.js'], factory) :
	(factory((global.SWFTools = {}),global.pako));
}(this, (function (exports,pako) { 'use strict';

	pako = pako && pako.hasOwnProperty('default') ? pako['default'] : pako;

	let components = {};

	function define(str, classPrototype){
		components[str] = classPrototype;
	}

	function get(str){
		if(!components[str]){
			return null;
		}
		return new components[str]();
	}

	function getLibrary(){
		return components;
	}

	class Parsable {
		static get size(){
			throw "Method size from parsable object must be implemented!";
			//Return -1 if size is dynamic
		}
		constructor(){
			this.size = 0;
			//Size set to CLASSNAME.size or 0 if dynamic;
		}
		parse(buffer, index){
			throw "Method Parse from parsable object must be implemented!";
		}
	}

	class Uint32 extends Parsable{
		static get size(){
			return 4;
		}
		static get name(){
			return 'uint32';
		}
		constructor(){
			super();
			this.size = Uint32.size;
		}
		parse(buffer, offset){
			this.value = 0;
			for(let i = 0; i != 4; i++){
				this.value += (buffer[(i + offset)] << (i * 8));
			}
			return this;
		}
	}

	define(Uint32.name, Uint32);

	class Rect extends Parsable {
		static get size(){
			return -1;
		}
		static get name(){
			return 'rect';
		}
		constructor(){
			super();
		}
		parse(buffer, offset){
			let nbits = buffer[offset] >> 3; //uint8 to "uint5"
			let size = (nbits * 4) + 5;
			while(size % 8 != 0){
				size++;
			}		
			let xMin = 0;
			let xMax = 0;
			let yMin = 0;
			let yMax = 0;
			
			let bitPos = 5;
					
			for(let i = bitPos; i != nbits + bitPos; i++){
				let byteP = (i/8) | 0;
				let bitP = 7 - (i % 8);
				xMin += ((buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
			}
			bitPos += nbits;
			
			for(let i = bitPos; i != nbits + bitPos; i++){
				let byteP = (i/8) | 0;
				let bitP = 7 - (i % 8);
				xMax += ((buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
			}
			bitPos += nbits;
			
			for(let i = bitPos; i != nbits + bitPos; i++){
				let byteP = (i / 8) | 0;
				let bitP = 7 - (i % 8);
				yMin += ((buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
			}
			bitPos += nbits;
			
			for(let i = bitPos; i != nbits + bitPos; i++){
				let byteP = (i/8) | 0;
				let bitP = 7 - (i % 8);
				yMax += ((buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
			}
			bitPos += nbits;
			
			this.nbits = nbits;
			this.size = size/8;
			this.xMin = xMin;
			this.xMax = xMax;
			this.yMin = yMin;
			this.yMax = yMax;
			return this;
		}
	}

	define(Rect.name, Rect);

	class Header extends Parsable{
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
			
			this.rawSize = get(Uint32.name).parse(buffer, offset + 4);
			//use decompressed buffer
			let sizeRect = get(Rect.name).parse(this.buffer, 0);
			this.width = sizeRect.xMax / 20;
			this.height = sizeRect.yMax / 20;
			
			return this;
		}
	}

	define(Header.name, Header);

	class SWFParser{
		static get VERSION(){
			return '0.0.1';
		}
		constructor(maxTags){
			this.maxTags = maxTags || 500;
		}
		parse(arrayBuffer){
			let buffer = new Uint8Array(arrayBuffer);
			this.onfilestart();
			let index = 0;
			let header = get(Header.name).parse(buffer, index);
			this.onheader(header); 
		}
		//Abstract
		onfilestart(){
			
		}
		
		onheader(){
			
		}
	}

	function fetchAndParse(parser, path){
		fetch(path).then(function(response){
			return response.arrayBuffer();
		}).then(function(buffer){
			parser.parse(buffer);
		});
				
	}

	let VERSION = '0.0.1';

	exports.VERSION = VERSION;
	exports.getLibrary = getLibrary;
	exports.SWFParser = SWFParser;
	exports.fetchAndParse = fetchAndParse;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
