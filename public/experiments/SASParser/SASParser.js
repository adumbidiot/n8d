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
					magic += String.fromCharCode(buffer[i + offset])
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
				
				return {
					magic, 
					compression,
					version
				}
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
		let library = SASParser.library;
		this.startFile();
		
		console.log(rawBuffer);
		let header = library.header(rawBuffer, 0);
		this.onHeader(header);
		
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
	onHeader(){
		
	}
}