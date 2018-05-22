import {Collider, Rect} from './Collider.js';
import {Entity} from './Entity.js';
import {RectEntity} from './RectEntity.js';
import {TextEntity} from './TextEntity.js';
import {CircleEntity} from './CircleEntity.js';

let defaultFPS = 60;

export class Game extends Entity{
	static get VERSION(){
		return '0.0.1';
	}
	constructor(opts){
		if(!opts) throw "Need to provide options to init game!"; //Might just create a canvas and everything
		if(!opts.canvas) throw "Need to provide canvas element to init game!";
		super({ctx: opts.canvas.getContext('2d')});
		this.canvas = opts.canvas;
		this.canvas.focus();
		this.entityDefs = {
			Entity: Entity,
			RectEntity: RectEntity,
			TextEntity: TextEntity,
			CircleEntity: CircleEntity
		};
		this.loader = new Loader(this);
		if(opts.entities){
			this.loadEntities(opts.entities).then(() => {
				this.insertEntity('LoadingScreen', {parent: this});
			});
		}
		this.settings = opts.settings || {}; //Global settings object
		this.fps = opts.fps || defaultFPS; //Let users set fps. NOTE: Physics is set on fps so changing it will mess up eveything. Probably fun to watch though;
		this.keyManager = new KeyManager(); //Slightly less messy than a global object for key states
		this.collider = new Collider(this.canvas.width, this.canvas.height); //Collider engine. Maybe make it replacable. or maybe allow it to be attached to entities. IDK.
		this.start();
		this.canvas.addEventListener('mousedown', this.processClick.bind(this)); //Capture inputs
		this.canvas.addEventListener('mouseup', this.processClick.bind(this));
		this.canvas.addEventListener('contextmenu', function(e){
			e.preventDefault(); //INSPECT THIS. HA. But seriously I want this game to support right clicks.
			return false;
		});
		this.canvas.addEventListener('keydown', this.processKey.bind(this)); 
		this.canvas.addEventListener('keyup', this.processKey.bind(this));
			
	}
	async loadEntities(arr){
		for(let i = 0; i != arr.length; i++){
			let entity = await this.loader.loadEntitiy(arr[i])
			this.defineEntity(entity.name, entity);
		}
	}
	loop(){
		let now = Date.now();
		let delta = now - (this.last || 0);
		this.last = now;
		
		this.clearScreen();
		let ctx = {keyManager: this.keyManager, delta: delta};
		this.update(ctx);
		this.render();
		this.keyManager.resetChanged(); //Allow detection of sudden events or listen to changes
		//requestAnimationFrame(this.loop.bind(this));
	}
	clearScreen(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); //SSSHHHHH
	}
	update(ctx){
		this.collider.reindex(); //Things might have moved. Maybe blurring the lines between entity and collider is a good idea, but ill keep them seperate for cimplicity for now
		super.update(ctx);
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
		//requestAnimationFrame(this.loop.bind(this));
	}
	setFPS(fps){
		this.fps = fps;
		this.halt();
		this.start();
	}
	defineEntity(name, opt){
		//Assume url for now
		this.entityDefs[name] = opt;
	}
	getEntityDef(name){
		return this.entityDefs[name] || -1;
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

class Loader{
		constructor(game){
			this.game = game;
		}
		loadEntitiy(url){
			return new Promise((resolve, reject) => {
				import(url).catch(function(err){
					throw err;
				}).then((module) => {
					resolve(module.default(this.game));
				});
			});
		}
}