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
			this.value = '';
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
				this.length = get('uint32').parse(buffer, offset + this.size).value;
				this.size += 4;
			}
			this.code = this._uint.value >> 6;
			return this;
		}
	}
	define(RecordHeader.name, RecordHeader);

	class RGB extends Parsable{
		static get size(){
			return 3;
		}
		constructor(){
			super();
		}
		parse(buffer, offset){
			this.R = buffer[offset];
			offset += 1;
			this.G = buffer[offset];
			offset += 1;
			this.B = buffer[offset];
			return this;
		}
	}

	define(RGB.name, RGB);

	class ABCFile extends Parsable{
		static get size(){
			return -1;
		}
		
		constructor(){
			super();
		}
		
		parse(buffer, offset){
			this.size = 0;
			this.minorVersion = get('uint16').parse(buffer, offset); 
			this.size += 2;
			this.majorVersion = get('uint16').parse(buffer, offset + this.size);
			this.size += 2;
			this.constantPool = get('CPoolInfo').parse(buffer, offset + this.size);
			console.log(this.constantPool);
			return this;
		}
	}

	define(ABCFile.name, ABCFile);

	class CPoolInfo extends Parsable{
		static get size(){
			return -1;
		}
		constructor(){
			super();
		}
		parse(buffer, offset){
			this.size = 0;
			this.int_count = get('uint30variable').parse(buffer, offset);
			this.size += this.int_count.size;

			this.integer = [];
			for(let i = 0; i < this.int_count.value - 1; i++){
				this.integer.push(get('Int32Variable').parse(buffer, offset + this.size));
				this.size += this.integer[this.integer.length - 1].size;
			}
			
			this.uinteger = [];
			this.uint_count = get('uint30variable').parse(buffer, offset + this.size);
			this.size += this.uint_count.size;
			for(let i = 0; i < this.uint_count.value - 1; i++){
				this.uinteger.push(get('Int32Variable').parse(buffer, offset + this.size));
				this.size += this.uinteger[this.uinteger.length - 1].size;
			}
			
			
			this.double_count = get('uint30variable').parse(buffer, offset + this.size);
			this.size += this.double_count.size;
			
			this.double = [];
			for(let i = 0; i < this.double_count.value - 1; i++){
				this.double.push(get('Double').parse(buffer, offset + this.size));
				this.size += this.double[this.double.length - 1].size;
			}
			
			return this;
		}
	}

	define(CPoolInfo.name, CPoolInfo);

	class Uint30Variable extends Parsable{
		static get size(){
			return -1;
		}
		constructor(){
			super();
			this.value = 0;
		}
		parse(buffer, offset){
			this.size = 0;
			do{
				this.value += (buffer[offset + this.size] << this.size);
				this.size++;
			}while(buffer[offset + this.size - 1] >= 128);
			
			return this;
		}
	}

	define(Uint30Variable.name, Uint30Variable);

	class Int32Variable extends Parsable{
		static get size(){
			return -1;
		}
		constructor(){
			super();
			this.value = 0;
		}
		parse(buffer, offset){
			this.size = 0;
			do{
				this.value += ((buffer[offset + this.size] & 0b01111111) << (this.size * 7));
				this.size++;
			}while(buffer[offset + this.size - 1] >= 128);
			
			/*if(this.size >= 2){ 
				console.log(buffer[offset], buffer[offset+1], buffer[offset+1] << 6, this.value);
			}*/
			
			return this;
		}
	}

	define(Int32Variable.name, Int32Variable);

	class Double extends Parsable{
		static get size(){
			return 8;
		}
		constructor(){
			super();
			this.value = 0;
		}
		parse(buffer, offset){
			this.fraction = 0;
			for(let i = 0; i != 6; i++){
				console.log(this.fraction);
				this.fraction += buffer[i + offset] << (i * 8);
			}
			
			
			this.sign = buffer[offset + 8] & 0b10000000;
			this.exponent = (buffer[offset + 7] & 0b01111111) | (buffer[offset + 6] & 0b11110000) << 3;
			console.log(buffer[offset+ 7], buffer[offset + 6], this.exponent);
			
			
			return this;
		}
	}

	define(Double.name, Double);

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
			this.size = recordHeader.size + recordHeader.length;
		}
	}

	class UnknownTag extends Tag{
		static get code(){
			return -1;
		}
		parse(buffer, offset){
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
			offset += this.recordHeader.size + this.flags.size + this.scriptName.size + 1; //Off by one somewhere...
			
			this.abcFile = get('ABCFile').parse(buffer, offset);
			
			this.data = buffer.slice(offset, start + this.recordHeader.length);
			return this;
		}
	}

	defineTag(DoABCTag.code, DoABCTag);

	class EndTag extends Tag{
		static get code(){
			return 0;
		}
		parse(buffer, offset){
			this.size = this.recordHeader.length + this.recordHeader.size;
			this.data = buffer.slice(offset + this.recordHeader.size, offset + this.size);
			return this;
		}
	}

	defineTag(EndTag.code, EndTag);

	class FileAttributesTag extends Tag{
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

	defineTag(FileAttributesTag.code, FileAttributesTag);

	class MetadataTag extends Tag{
		static get code(){
			return 77;
		}
		parse(buffer, offset){
			this.Metadata = get('nulstring').parse(buffer, offset + this.recordHeader.size);
			return this;
		}
	}

	defineTag(MetadataTag.code, MetadataTag);

	class ScriptLimitsTag extends Tag{
		static get code(){
			return 65;
		}
		parse(buffer, offset){
			offset += this.recordHeader.size;
			this.MaxRecursionDepth = get('uint16').parse(buffer, offset);
			offset += this.MaxRecursionDepth.size;
			this.ScriptTimeoutSeconds = get('uint16').parse(buffer, offset);
			return this;
		}
	}

	defineTag(ScriptLimitsTag.code, ScriptLimitsTag);

	class SetBackgroundColorTag extends Tag{
		static get code(){
			return 9;
		}
		parse(buffer, offset){
			offset += this.recordHeader.size;
			this.BackgroundColor = get('rgb').parse(buffer, offset);
			return this;
		}
	}

	defineTag(SetBackgroundColorTag.code, SetBackgroundColorTag);

	class ProductInfoTag extends Tag{
		static get code(){
			return 41;
		}
		parse(buffer, offset){
			offset += this.recordHeader.size;
			this.productID = get('uint32').parse(buffer, offset);
			offset += this.productID.size;
			this.edition = get('uint32').parse(buffer, offset);
			offset += this.edition.size;
			this.majorVersion = buffer[offset];
			offset++;
			this.minorVersion = buffer[offset];
			offset++;
			this.buildLow = get('uint32').parse(buffer, offset);
			offset += this.buildLow.size;
			this.buildHigh = get('uint32').parse(buffer, offset);
			offset += this.buildHigh.size;
			this.compilationDateLow = get('uint32').parse(buffer, offset);
			offset += this.compilationDateLow.size;
			this.compilationDateHigh = get('uint32').parse(buffer, offset);
			offset += this.compilationDateHigh.size;
			return this;
		}
	}

	defineTag(ProductInfoTag.code, ProductInfoTag);

	class FrameLabelTag extends Tag{
		static get code(){
			return 43;
		}
		parse(buffer, offset){
			offset += this.recordHeader.size;
			this.frameName = get('nulstring').parse(buffer, offset);
			return this;
		}
	}

	defineTag(FrameLabelTag.code, FrameLabelTag);

	class SymbolClassTag extends Tag{
		static get code(){
			return 76;
		}
		constructor(recordHeader){
			super(recordHeader);
			this.maxSymbols = 100;
		}
		parse(buffer, offset){
			offset += this.recordHeader.size;
			this.numSymbols = get('uint16').parse(buffer, offset);
			offset += this.numSymbols.size;
			this.tagID = [];
			this.className = [];
			
			for(let i = 0; i < this.numSymbols.value && i < this.maxSymbols; i++){
				this.tagID.push(get('uint16').parse(buffer, offset));
				offset += this.tagID[this.tagID.length - 1].size;
				this.className.push(get('nulstring').parse(buffer, offset));
				offset += this.className[this.className.length - 1].size;
			}
			
			return this;
		}
	}

	defineTag(SymbolClassTag.code, SymbolClassTag);

	class ShowFrameTag extends Tag{
		static get code(){
			return 1;
		}
		parse(buffer, offset){
			this.data = buffer.slice(offset + this.recordHeader.size, offset + this.size);
			return this;
		}
	}

	defineTag(ShowFrameTag.code, ShowFrameTag);

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
			if(!this.eventMap[str]) return;
			if(str === 'start' || str === 'end'){ //Hack for timing
				this.eventMap[str](data);
			}else{ 
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
