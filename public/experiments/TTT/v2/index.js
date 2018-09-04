const TTTPromise = import("./tttjs/dist/tttjs.js");

let data = null;
let ai = null;

TTTPromise.then(TTTjs => {
  window.TTTjs = TTTjs;
  
  let c = new TTTjs.CompilerJS();
  console.log(c);
  let start = new Date();
  let data = c.run(100);
  let end = new Date();
	
	console.log(data);
	console.log("Compile Time: " + (end - start) + "ms");
	console.log("Nodes Processed: " + c.get_nodes_processed());
	console.log("Winners Processed: " + c.get_winners_processed());
	console.log("Nodes Scored: " + c.get_nodes_scored());
	
	let table = c.export_js();
	console.log(table);
	data = table;
	console.log(msgpack.encode(data));
	window.ai = new AI(data);
	window.ai.getMove("NNNNNNNNX");
 });
 
const key = new Map();
key.set('N', 0);
key.set('X', 1);
key.set('O', 2);
key.set(0, 'N');
key.set(1, 'X');
key.set(2, 'O');
 
 class AI {
	constructor(table){
		this.table = table;
	}
	
	hash(state){
		let num = 0;
		for (let i = 0; i != 9; i++) {
			num += Math.pow(3, i) * key.get(state[i]);
		}
		return num;
	}
	
	getNode(id){
		return this.table.nodes[id];
	}
	
	getMove(state){
		let id = this.hash(state);
		let node = this.getNode(id);
		let children = [];
		for(let i = 0; i != node.children.length; i++){
			children.push(this.getNode(node.children[i]));
		}
		
		console.log(id, node, children);
	}
 }