import Compiler from './Compiler.js';
import {hashState, key, genState, getWinner} from './Utils.js';

export class TTT {
	constructor() {
		this.compiler = new Compiler();
		try{
			let data = new Uint8Array(JSON.parse(localStorage.getItem('table')).data);
			this.table = msgpack.decode(data);
		}catch(e){
			console.error(e);
		}
	}
	
	async loadTreeFromURL(url){
		let data = await fetch(url).then(res => res.arrayBuffer());
		this.table = msgpack.decode(new Uint8Array(data));
	}
	
	recompileTree(){
		this.compiler.process();
	}

	genState(num){
		return genState(num);
	}
	
	hash(arr){
		return hashState(arr);
	}
	
	getWinner(arr){
		return getWinner(arr);
	}
	
	
}