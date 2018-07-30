export default class AI {
	constructor(){
		this.table = null;
	}
	
	async loadFromURL(url){
		let data = await fetch(url).then(res => res.arrayBuffer());
		this.table = msgpack.decode(new Uint8Array(data));
	}
	
	loadFromLocalStorage(key){
		let data = new Uint8Array(JSON.parse(localStorage.getItem('table')).data);
		this.table = msgpack.decode(data);
	}
	
	getMove(team, hash){
		let children = this.table[hash].children;
		
		console.log(children);
		
		let top = this.table[children[0]];
		
		for(let i = 0; i != children.length; i++){
			if(team == 'X' && top.score <= (this.table[children[i]].score)){
				top = this.table[children[i]];
			}else if(team == 'O' && Math.min(top.score, this.table[children[i]].score) != top.score){
				top = this.table[children[i]];
			}
		}
		
		return top;
	}
}