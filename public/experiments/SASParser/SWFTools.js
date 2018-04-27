(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('cdnjs.cloudflare.com/ajax/libs/pako/1.0.6/pako.js')) :
	typeof define === 'function' && define.amd ? define(['exports', 'cdnjs.cloudflare.com/ajax/libs/pako/1.0.6/pako.js'], factory) :
	(factory((global.SWFTools = {}),global.pako));
}(this, (function (exports,pako) { 'use strict';

	pako = pako && pako.hasOwnProperty('default') ? pako['default'] : pako;

	let components = {};
	let tagComponents = [];

	function define(str, classPrototype){
		components[str.toLowerCase()] = classPrototype;
	}

	function get(str){
		str = str.toLowerCase();
		if(!components[str]){
			return null;
		}
		return new components[str]();
	}

	function defineTag(id, classPrototype){
		tagComponents[id] = classPrototype;
	}

	function getTag(recordHeader){
		if(!tagComponents[recordHeader.code]){
			return new tagComponents[-1](recordHeader);
		}
		return new tagComponents[recordHeader.code](recordHeader);
	}

	class Parsable {
		static get size(){
			throw "Method size from parsable object must be implemented!";
			//Return 0 if size is dynamic
		}
		constructor(){
			this.size = this.constructor.size;
			this.constructor.name;// Trigger error if not implemented
			//Size set to CLASSNAME.size or 0 if dynamic;
		}
		parse(buffer, index){
			throw "Method Parse from parsable object must be implemented!";
		}
	}

	class Header extends Parsable{
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
			
			this.rawSize = get('uint32').parse(buffer, offset + 4);
			//use decompressed buffer
			let sizeRect = get('rect').parse(this.buffer, 0);
			this.width = sizeRect.xMax / 20;
			this.height = sizeRect.yMax / 20;
			this.size = sizeRect.size;
			offset = this.size;
			
			this.frameRate = get('fixed8').parse(this.buffer, offset);
			offset += this.frameRate.size;
			
			this.frameCount = get('uint16').parse(this.buffer, offset);
			offset += this.frameCount.size;
			this.size = offset;

			return this;
		}
	}

	define(Header.name, Header);

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

	class Uint16 extends Parsable{
		static get size(){
			return 2;
		}
		static get name(){
			return 'uint16';
		}
		constructor(){
			super();
			this.value = 0;
		}
		parse(buffer, offset){
			for(let i = 0; i != this.size; i++){
				this.value += (buffer[(i + offset)] << (i * 8));
			}
			return this;
		}
	}

	define(Uint16.name, Uint16);

	class NulString extends Parsable{
		static get size(){
			return 0;
		}
		constructor(){
			super();
		}
		parse(buffer, offset){
			let i = offset;
			while(buffer[i] != 0){
				this.value += String.fromCharCode(buffer[i]);
				i++;
			}
			this.size = i - offset;
			return this;
		}
	}

	define(NulString.name, NulString);

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

	class Fixed8 extends Parsable{
		static get size(){
			return 2;
		}
		static get name(){
			return 'fixed8';
		}
		constructor(){
			super();
			this.value = 0;
		}
		parse(buffer, offset){
			let first = buffer[offset];
			this.value += buffer[offset + 1];
			return this; //Incomplete? Stolen from v1
		}
	}

	define(Fixed8.name, Fixed8);

	class RecordHeader extends Parsable {
		static get size(){
			return 0;
		}
		constructor(){
			super();
		}
		parse(buffer, offset){
			this._uint = get('uint16').parse(buffer, offset);
			this.size += this._uint.size;
			this.length = this._uint.value & (0x3F);
			this.long = (this.length < 0x3F) ? false : true;
			if(this.long){
				this.length = get('uint16').parse(buffer, offset + this.size).value;
				this.size += 4;
			}
			this.code = this._uint.value >> 6;
			return this;
		}
	}
	define(RecordHeader.name, RecordHeader);

	class Tag extends Parsable{
		static get code(){
			throw "Static method code must be implemented";
		}
		static get size(){
			return 0;
		}
		constructor(recordHeader){
			super();
			this.recordHeader = recordHeader;
			this.name = this.constructor.name;
		}
	}

	class UnknownTag extends Tag{
		static get code(){
			return -1;
		}
		parse(buffer, offset){
			this.size = this.recordHeader.length + this.recordHeader.size;
			this.data = buffer.slice(offset + this.recordHeader.size, offset + this.size);
			return this;
		}
	}

	defineTag(UnknownTag.code, UnknownTag);

	class DoABCTag extends Tag{
		static get code(){
			return 82;
		}
		parse(buffer, offset){
			let start = offset;
			this.size = this.recordHeader.length + this.recordHeader.size;
			this.flags = get('uint32').parse(buffer, offset + this.recordHeader.size);
			this.scriptName = get('nulstring').parse(buffer, offset + this.recordHeader.size + this.flags.size);
			offset += this.recordHeader.size + this.flags.size + this.name.size;
			this.data = buffer.slice(offset, start + this.recordHeader.length);
			return this;
		}
	}

	defineTag(DoABCTag.code, DoABCTag);

	class SWFParser {
		static get VERSION(){
			return '0.0.1';
		}
		
		constructor(maxTags){
			this.maxTags = maxTags || 500;
			this.eventMap = {};
		}
		
		parse(arrayBuffer){
			let buffer = new Uint8Array(arrayBuffer);
			this.emit('start');
			let header = get('header').parse(buffer, 0);
			this.emit('header', header);
			buffer = header.buffer;
			let index = header.size;
			
			let i = 0;
			let recordHeader = null;
			for(i = 0; i != this.maxTags; i++){
				recordHeader = get('recordheader').parse(buffer, index);
				this.emit('tag', getTag(recordHeader).parse(buffer, index));
				
				if(recordHeader.code === 0){
					break;
				}
				index += recordHeader.size + recordHeader.length;
			}
			this.emit('end', i);
		}
		
		on(str, func){
			//One event func per str for now...
			this.eventMap[str] = func;
		}
		
		emit(str, data){
			if(str === 'start' || str === 'end'){ //Hack for timing
				this.eventMap[str](data);
			}else if(this.eventMap[str]){ 
				setTimeout(this.eventMap[str].bind(this, data), 0);
			}
		}
	}

	function fetchAndParse(parser, path){
		fetch(path).then(function(response){
			return response.arrayBuffer();
		}).then(function(buffer){
			parser.parse(buffer);
		});
				
	}

	//export {getLibrary} from './Library.js';
	let VERSION = '0.0.1';

	exports.VERSION = VERSION;
	exports.SWFParser = SWFParser;
	exports.fetchAndParse = fetchAndParse;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
