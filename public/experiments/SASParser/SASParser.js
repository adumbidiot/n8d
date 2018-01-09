// Simple API for SWF
class SASParser{
	static get VERSION(){
		return '0.0.1';
	}
	static get library(){
		return {
			tag: {
				
			},
			header: function(buffer, offset){
				let magic = '';
				let compression = 'NONE';
				let version = buffer[3 + offset];
				
				for(let i = 0; i != 3; i++){
					magic += String.fromCharCode(buffer[i + offset]);
				}
				
				switch(magic){
					case 'CWS': {
						compression = 'ZLIB';
						break;
					}
					default: {
						throw "Unrecognized Magic Number!";
					}
				}
				
				let decompressedSize = this.Uint32(buffer, offset + 4);
				
				return {
					magic, //3 bytes, i = 0
					compression, //Sugar
					version, //1 bytes , i = 3
					decompressedSize // i = 4
				}
			},
			rect: function(buffer, offset){
				
			},
			Uint32: function(buffer, offset){
				let int = 0;
				for(let i = 0; i != 4; i++){
					int += (buffer[(i + offset)] << (i*8));
				}
				return int;
			}
		}
	}
	constructor(){
		
	}
	parse(buffer){
		if((!buffer) || !(buffer instanceof ArrayBuffer)){
			throw "Buffer must be a valid arraybuffer";
		}
		let rawBuffer = new Uint8Array(buffer);
		let library = this.constructor.library;
		this.startFile();
		
		console.log(rawBuffer);
		let header = library.header(rawBuffer, 0);
		this.onHeader(header);

		
		switch(header.compression){
			case 'ZLIB': {
				//pako needed
				buffer = pako.inflate(rawBuffer.buffer.slice(8));
				console.log(buffer);
				break;
			}
			case 'NONE': {
				buffer = new Uint8Array(rawBuffer.buffer.slice(8));
			}
		}
		
		this.endFile();
	}
	// Abstract
	//When it starts
	startFile(){
		
	}
	//When the pain goes away
	endFile(){
		
	}
	//When a tag 
	onTag(){
		
	}
	//Doesnt know how to parse
	onUnknownTag(rawBufferTag){
		//Raw buffer
	}
	//when the header
	onHeader(head){
		
	}
}