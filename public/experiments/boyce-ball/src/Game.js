import {LoadingScreen} from './LoadingScreen.js';
import {Collider, Rect} from './Collider.js';

let defaultFPS = 60;

export class Game{
	static get VERSION(){
		return '0.0.1';
	}
	constructor(opts){
		if(!opts) throw "Need to provide options to init game!"; //Might just create a canvas and everything
		if(!opts.canvas) throw "Need to provide canvas element to init game!";
		this.canvas = opts.canvas;
		this.canvas.focus();
		this.settings = opts.settings || {}; //Global settings object
		this.ctx = this.canvas.getContext('2d'); //Store a ctx for easy access
		this.fps = opts.fps || defaultFPS; //Let users set fps. NOTE: Physics is set on fps so changing it will mess up eveything. Probably fun to watch though;
		this.tree = []; //Should have just had it inherit from Entity. RIP
		this.keyManager = new KeyManager(); //Slightly less messy than a global object for key states
		this.top = true; //Way to tell parent apart from the rest
		this.collider = new Collider(this.canvas.width, this.canvas.height); //Collider engine. Maybe make it replacable. or maybe allow it to be attached to entities. IDK.
		this.start();
		this.addChild(new LoadingScreen({parent: this})); //Loading screen for assets. This has no assets yet, so it just does a cute physics thing.
		this.canvas.addEventListener('mousedown', this.processClick.bind(this)); //Capture inputs
		this.canvas.addEventListener('mouseup', this.processClick.bind(this));
		this.canvas.addEventListener('contextmenu', function(e){
			e.preventDefault(); //INSPECT THIS. HA. But seriously I want this game to support right clicks.
			return false;
		});
		this.canvas.addEventListener('keydown', this.processKey.bind(this)); 
		this.canvas.addEventListener('keyup', this.processKey.bind(this));
			
	}
	loop(){
		this.clearScreen();
		let ctx = {keyManager: this.keyManager};
		this.update(ctx);
		this.render();
		this.keyManager.resetChanged(); //Allow detection of sudden events or listen to changes
	}
	clearScreen(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //SSSHHHHH
	}
	update(ctx){
		this.collider.reindex(); //Things might have moved. Maybe blurring the lines between entity and collider is a good idea, but ill keep them seperate for cimplicity for now
		for(let i = 0; i < this.tree.length; i++){
			this.tree[i].update(ctx);
		}
	}
	render(){
		for(let i = 0; i != this.tree.length; i++){
			this.ctx.save(); //So you can get a clean env each time
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
				 return this.tree.splice(i, 1); //Reomve and return if founnd
			}
		}
		return -1; //Could not find child with specified id
	}
	getID(){
		
	}
	processClick(e){
		let rect = this.canvas.getBoundingClientRect();
		let x = event.clientX - rect.left;
		let y = event.clientY - rect.top;
		if(e.type === 'mouseup'){
			switch(e.type){
				case 1: {
					this.keyManager.set('mouseLeft');
					break;
				}
				case 2: {
					this.keyManager.set('mouseScroll');
					break;
				}
				case 3: {
					this.keyManager.set('mouseRight');
					break;
				}
			}
		}else if(e.type === 'mousedown'){
			switch(e.type){
				case 1: {
					this.keyManager.unset('mouseLeft');
					break;
				}
				case 2: {
					this.keyManager.unset('mouseScroll');
					break;
				}
				case 3: {
					this.keyManager.unset('mouseRight');
					break;
				}
			}
			
			let collisions = this.collider.getCollisions(new Rect({x, y, width: 0, height: 0}));
			for(let i = 0; i != collisions.length; i++){
				collisions[i].parent.onClick({x, y, key: e.which});
			}
		}else{
			console.error(e);
		}
	}
	processKey(e){
		if(e.type === 'keyup'){
			this.keyManager.unset(e.key);
		}else if(e.type === 'keydown'){
			this.keyManager.set(e.key);
		}else{
			console.error(e);
		}
	}
	halt(){
		clearInterval(this.gameLoop);
	}
	start(){
		this.gameLoop = setInterval(this.loop.bind(this), 1000/this.fps); //Start Game Loop
	}
	setFPS(fps){
		this.fps = fps;
		this.halt();
		this.start();
	}
}

class KeyManager{
	constructor(){
		this.store = {};
		this.changed = false;
		this.changedKeys = [];
	}
	set(key){
		this.store[key] = true;
		this.changed = true;
		this.changedKeys.push(key);
	}
	get(key){
		return this.store[key];
	}
	unset(key){
		this.store[key] = false;
		this.changed = true;
	}
	resetChanged(){
		this.changed = false;
		this.changedKeys.length = 0;
	}
	isChanged(key){
		if(key){
			return this.changedKeys.includes(key);
		}
		return this.changed;
	}
	reset(){
		let keys = Object.keys(this.store);
		for(let i = 0; i != keys.length; i++){
			this.store[keys[i]] = false;
		}
	}
	static resolveClickCode(code){ //Code to readable. Thoguht it might be useful but it didnt pan out. Kept it just in case i needed it.
		switch(code){
			case 3:
				return 'mouseRight';
		}
	}
}