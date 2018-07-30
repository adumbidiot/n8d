import Node from './Node.js';
import {genState, hashState, getWinner} from './Utils.js';

export default class Compiler {
	constructor(){
		this.table = new Array(Math.pow(3, 9));
		
		this.queue = [];
		this.queue.push(new Node(0, 0, null));
		this.table[0] = this.queue[0];
		this.stepTime = 0;
		this.maxLevel = 10;
		this.winners = [];
		this.nodesProcessed = 0;
	}
	
	getPossibleStates(arr, team) {
		let states = [];
		for (let i = 0; i != 9; i++) {
			if (arr[i] == 'N') {
				let temp = arr.slice();
				temp[i] = team;
				states.push(temp);
			}
		}
		return states;
	}
	
	process() {
		if (this.queue.length == 0) {
			console.log('done');
			setTimeout(this.postProcess.bind(this), this.stepTime);
			return;
		}

		let node = this.queue.shift();
		if(node.level > this.maxLevel - 1){
			setTimeout(this.postProcess.bind(this), this.stepTime);
			console.log("Level limit reached: " + this.maxLevel);
			return;
		}
		
		if(getWinner(genState(node.id)) != 'N'){
			setTimeout(this.process.bind(this), this.stepTime);
			return;
		}
		
		let team = (node.level % 2 == 0) ? 'X' : 'O'; 
		
		let states = this.getPossibleStates(genState(node.id), team).map((state) => {
			return hashState(state);
		});
		
		let nodes = [];
		for(let i = 0; i != states.length; i++){
			node.children.push(states[i]);
			
			if(this.table[states[i]]){
				this.table[states[i]].parents.push(node.id);
			}else{
				nodes.push(new Node(states[i], node.level + 1, node.id));
				this.table[nodes[nodes.length - 1].id] = nodes[nodes.length - 1];
				if(getWinner(genState(nodes[nodes.length - 1].id)) != 'N'){
					this.winners.push(nodes[nodes.length - 1].id);
				}
			}
		}
		
		this.queue = this.queue.concat(nodes);
		
		this.nodesProcessed++;
		this.onProcessedNode(this.nodesProcessed);

		setTimeout(this.process.bind(this), this.stepTime);
	}
	
	postProcess(){
		if(this.winners.length == 0){
			this.onFinish();
			return;
		}
		
		let nodeID = this.winners.shift();
		let node = this.table[nodeID];
		
		let winner = getWinner(genState(nodeID));
		node.score = (winner == 'X') ? 1 : -1;
		
		console.log(node);
		
		let self = this;
		function addScore(pNode){
			pNode.score += node.score;
			if(!pNode.parents[0]) return;
			for(let i = 0; i != pNode.parents.length; i++){
				addScore(self.table[pNode.parents[i]]);
			}
		}
		
		if(winner == 'X' && node.level % 2 == 1){
			for(let i = 0; i != node.parents.length; i++){
				this.table[node.parents[i]].score += 100;
			}
			addScore(node);			
		}
		
		if(winner == 'O' && node.level % 2 == 0){
			for(let i = 0; i != node.parents.length; i++){
				this.table[node.parents[i]].score -= 100;
			}
			addScore(node);
		}
		
		
		
		node.score *= 100;
		setTimeout(this.postProcess.bind(this), this.stepTime);
	}
	
	onFinish(){
		console.log("Compilation Complete!");
		this.saveToDisk();
		//let a = msgpack.encode(this.table);
		/*try{
			localStorage.setItem('table', JSON.stringify(a));
		}catch(e){
			console.error(e);
			console.log(a);
			download(JSON.stringify(a), 'table.TTT');
		}*/
	}
	
	saveToDisk(){
		download(msgpack.encode(this.table), 'table.TTT');
	}
	
	onProcessedNode(){
		
	}
}