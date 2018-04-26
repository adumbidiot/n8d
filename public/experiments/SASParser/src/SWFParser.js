import * as Library from './Library.js';
import {Header} from './lib/Header.js';

export class SWFParser{
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
		let header = Library.get(Header.name).parse(buffer, index);
		this.onheader(header); 
	}
	//Abstract
	onfilestart(){
		
	}
	
	onheader(){
		
	}
}

export function fetchAndParse(parser, path){
	fetch(path).then(function(response){
		return response.arrayBuffer();
	}).then(function(buffer){
		parser.parse(buffer);
	});
			
}