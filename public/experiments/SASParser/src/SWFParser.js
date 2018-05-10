import * as Library from './Library.js';
import './SWFParserLibraryDeps.js';

export class SWFParser {
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
		let header = Library.get('header').parse(buffer, 0);
		this.emit('header', header);
		buffer = header.buffer;
		let index = header.size;
		
		let i = 0;
		let tag = null;
		let recordHeader = null;
		for(i = 0; i != this.maxTags; i++){
			recordHeader = Library.get('recordheader').parse(buffer, index);
			this.emit('tag', Library.getTag(recordHeader).parse(buffer, index));
			
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

export function fetchAndParse(parser, path){
	fetch(path).then(function(response){
		return response.arrayBuffer();
	}).then(function(buffer){
		parser.parse(buffer);
	});
			
}