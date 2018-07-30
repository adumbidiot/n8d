var TTT = (function (exports) {
	'use strict';

	const key = new Map();

	key.set('N', 0);
	key.set('X', 1);
	key.set('O', 2);
	key.set(0, 'N');
	key.set(1, 'X');
	key.set(2, 'O');

	function hashState(arr) {
		let num = 0;
		for (let i = 0; i != 9; i++) {
			num += Math.pow(3, i) * key.get(arr[i]);
		}
		return num;
	}

	function genState(num) {
		let state = [];
		while (num > 0) {
			state.push(key.get(num % 3));
			num = (num / 3) | 0;
		}

		for (let i = state.length; i != 9; i++) {
			state.push('N');
		}
		
		return state;
	}

	function getWinnerRow(index, arr){
		index *= 3;
		if(arr[index] == 'N'){
			return 'N';
		}
		
		for(let i = 0; i != 3; i++){
			if(arr[index] != arr[index + i]){
				return 'N';
			}
		}
		
		return arr[index];
	}

	function getWinnerCol(index, arr){
		if(arr[index] == 'N'){
			return 'N';
		}
		
		for(let i = 0; i != 3; i++){
			if(arr[index] != arr[index + i * 3]){
				return 'N';
			}
		}
		
		return arr[index];
	}

	function getWinnerDiag(index, arr){
		index *= 2;
		
		if(arr[index] == 'N'){
			return 'N';
		}
		
		let step = 4 / ((index / 2) + 1);
		
		for(let i = 0; i != 3; i++){
			if(arr[index] != arr[index + i * step]){
				return 'N';
			}
		}
		
		return arr[index];
	}

	function getWinner(arr){
		for(let i = 0; i != 3; i++){
			let winner = getWinnerRow(i, arr);
			if(winner != 'N'){
				return winner;
			}
		}
		
		for(let i = 0; i != 3; i++){
			let winner = getWinnerCol(i, arr);
			if(winner != 'N'){
				return winner;
			}
		}
		
		for(let i = 0; i != 2; i++){
			let winner = getWinnerDiag(i, arr);
			if(winner != 'N'){
				return winner;
			}
		}
		
		return 'N';
	}

	class Node {
		constructor(id, level, parent){
			this.id = id;
			this.level = level;
			this.children = [];
			this.parents = [parent]; 
			this.score = 0;
		}
	}

	class Compiler {
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

	class TTT {
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

	exports.TTT = TTT;

	return exports;

}({}));
