import {LoadingScreen} from './LoadingScreen.js';
import {Collider} from './Collider.js';

let defaultFPS = 60;

export class Game{
	static get VERSION(){
		return '0.0.1';
	}
	constructor(opts){
		if(!opts) throw "Need to provide options to init!";
		if(!opts.canvas) throw "Need to provide canvas to init!";
		this.canvas = opts.canvas;
		this.ctx = this.canvas.getContext('2d');
		this.fps = opts.fps || defaultFPS;
		this.tree = [];
		this.keys = {};
		this.loop = setInterval(this.loadLoop.bind(this), 1000/this.fps);
		this.addChild(new LoadingScreen({parent: this}));
		this.canvas.addEventListener('click', this.processClick.bind(this));
		this.canvas.addEventListener('keydown', this.processKey.bind(this));
		this.canvas.addEventListener('keyup', this.processKey.bind(this));
	}
	loadLoop(){
		this.clearScreen();
		let ctx = {keys: this.keys};
		this.update(ctx);
		this.render();
		this.keys.stateChange = false;
	}
	clearScreen(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
	update(ctx){
		for(let i = 0; i < this.tree.length; i++){
			this.tree[i].update(ctx);
		}
	}
	render(){
		for(let i = 0; i != this.tree.length; i++){
			this.ctx.save();
			this.tree[i].render();
			this.ctx.restore();
		}
	}
	addChild(child){
		this.tree.push(child); //TODO: Id system
	}
	removeChild(id){
		for(let i = 0; i != this.tree.length; i++){
			if(this.tree[i].id === id){
				 return this.tree.splice(i, 1);
			}
		}
		return -1;
	}
	getID(){
		
	}
	processClick(e){
		let rect = this.canvas.getBoundingClientRect();
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;
		console.log(x, y);
	}
	processKey(e){
		if(e.type === 'keyup'){
			this.keys[e.key] = true;
		}else if(e.type === 'keydown'){
			this.keys[e.key] = false;
		}
		this.keys.stateChange = true;
	}
}