(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.BoyceBall = {})));
}(this, (function (exports) { 'use strict';

	let id = 0;

	class Entity {
		constructor(opts){
			if(!opts) throw "Need to provide options to init!";
			if(!opts.parent) throw "Need to provide parent to init!";
			this.parent = opts.parent;
			this.ctx = this.parent.ctx;
			this.children = [];
			this.x = opts.x || 0;
			this.y = opts.y || 0;
			this.id = opts.id || ++id;
			this.stage = this;
			while(!this.stage.top){
				this.stage = this.stage.parent;
			}
		}
		update(ctx){
			for(let i = 0; i != this.children.length; i++){
				this.children[i].update(ctx);
			}
		}
		render(){
			for(let i = 0; i != this.children.length; i++){
				this.ctx.save();
				this.children[i].render();
				this.ctx.restore();
			}
		}
		addChild(child){
			this.children.push(child);
		}
		removeChild(id){
			for(let i = 0; i != this.children.length; i++){
				if(this.children[i].id === id){
					 return this.children.splice(i, 1);
				}
			}
			return -1;
		}
		onClick(){
			
		}
		destroy(){
			while(this.children.length > 0){
				this.children[0].destroy();
			}
			this.parent.removeChild(this.id);
		}
		getByID(id){
			for(let i = 0; i != this.children.length; i++){
				if(id == this.children[i].id) return this.children[i];
			}
		}
	}

	let defaultWidth = 100;
	let defaultHeight = 100;
	let defaultFillStyle = 'white';

	class RectEntity extends Entity{
			constructor(opts){
				super(opts);
				this.width = opts.width || defaultWidth;
				this.height = opts.height || defaultHeight;
				this.fillStyle = opts.fillStyle || defaultFillStyle;
			}
			update(){
				super.update();
			}
			render(){
				super.render();
				this.ctx.fillStyle = this.fillStyle;
				this.ctx.fillRect(this.x + this.parent.x, this.y + this.parent.y, this.width, this.height);
			}
	}

	let defaultContent = 'Hello World!';
	let defaultFillStyle$1 = 'white';
	let defaultFont = '30px Comic Sans MS';

	class TextEntity extends Entity{
		constructor(opts){
			super(opts);
			this.content = opts.content || defaultContent;
			this.fillStyle = opts.fillStyle || defaultFillStyle$1;
			this.font = opts.font || defaultFont;
			this.textAlign = opts.textAlign || 'center';
		}
		update(){
			super.update();
		}
		render(){
			super.render();
			this.ctx.fillStyle = this.fillStyle;
			this.ctx.font = this.font;
			this.ctx.textAlign = this.textAlign;
			this.ctx.fillText(this.content, this.x + this.parent.x, this.y + this.parent.y);
		}
	}

	class Collider{
		constructor(width, height){
			this.broadPhase = new Quadtree(0, new Rect({x: 0, y: 0, width: width, height: height})); //Possibility of collider "interface", interchangable broadphase
			this.objects = []; //List of refs to all colliders regsitered
		}
		insert(collider){
			this.objects.push(collider);
			this.insertRaw(collider);
			this.reindex();
		}
		insertRaw(collider){
			let object = collider;
			if(!(object instanceof Rect)){
				object = collider.cast('Rect'); //God I miss programming in an actual language... 
			}
			this.broadPhase.insert(object);
		}
		remove(id){
			for(let i = 0; i != this.objects.length; i++){
				if(this.objects[i].id === id){
					this.objects.splice(i, 1);
					i--;
				}
			}
		}
		reindex(){
			this.clear();
			for(let i = 0; i != this.objects.length; i++){
				this.insertRaw(this.objects[i]);
			}
		}
		clear(){
			this.broadPhase.clear();
		}
		getProbableCollision(object){
			let list = [];
			this.broadPhase.retrieve(list, object);
			return list;
		}
		getCollisions(object){
			return this.getProbableCollision(object); //Narrow phase is not implemented. Engine does not require presice collision detection (yet)...
		}
	}

	let maxLevels = 5;
	let maxObjects = 10;

	class Quadtree{ 
	//Quadtree implementation. 
	//Obviously works only with rects and points. 
	//It is used as a broad phase before the unimplemented narrow phase. 
	//Also shamelessly stolen from https://gamedevelopment.tutsplus.com/tutorials/quick-tip-use-quadtrees-to-detect-likely-collisions-in-2d-space--gamedev-374
		constructor(level, bounds){
			this.nodes = new Array(4);
			this.objects  = [];
			this.bounds = bounds;
			this.level = level;
		}
		split(){
				let newWidth = (this.bounds.width / 2) | 0;
				let newHeight = (this.bounds.height / 2) | 0;
				let x = this.bounds.x;
				let y = this.bounds.y;
				this.nodes[0] = new Quadtree(this.level + 1, new Rect({x: x + newWidth, y : y, width: newWidth, height: newHeight}));
				this.nodes[1] = new Quadtree(this.level + 1, new Rect({x: x, y: y, width: newWidth, height: newHeight}));
				this.nodes[2] = new Quadtree(this.level + 1, new Rect({x: x, y: y + newHeight, width: newWidth, height: newHeight}));
				this.nodes[3] = new Quadtree(this.level + 1, new Rect({x: x + newWidth, y: y + newHeight, width: newWidth, height: newHeight}));
		}
		clear(){
			this.objects.length = 0;
	 
			for (let i = 0; i != this.nodes.length; i++) {
				if (this.nodes[i]) {
					this.nodes[i].clear();
					this.nodes[i] = null;
				}
			}
		}
		getIndex(rect){
			let index = -1;
			let midpointX = this.bounds.x + (this.bounds.width / 2);
			let midpointY = this.bounds.y + (this.bounds.height / 2);
			let top = (rect.y < midpointY) && (rect.y + rect.height < midpointY);
			let bottom = (rect.y > midpointY);
			let left = (rect.x < midpointX) && (rect.x + rect.width < midpointX);
			let right = rect.x > midpointX;
			
			if(left){
				if(top){
					index = 1;
				}else if(bottom){
					index = 2;
				}
			}else if(right){
				if(top){
					index = 0;
				}else if(bottom){
					index = 3;
				}
			}
			return index;
		}
		insert(rect){
			if(this.nodes[0]){
				let index = this.getIndex(rect);
				if(index != -1){
					this.nodes[index].insert(rect);
				}
			}
			
			if(this.objects.length < maxObjects && this.level < maxLevels){
				if(!this.nodes[0]){
					this.split();
				}
				
				this.objects.push(rect);
				
				let i = 0;
				while(i < this.objects.length){
					let index = this.getIndex(this.objects[i]);
					if(index != -1){
						this.nodes[index].insert(this.objects.splice(i, 1)[0]);
					}else{
						i++;
					}
				}
			}
		}
		retrieve(objects, rect){
			let index = this.getIndex(rect);
			
			if(index != -1 && this.nodes[0]){
				this.nodes[index].retrieve(objects, rect);
			}
			for(let i = 0; i != this.objects.length; i++){
				objects.push(this.objects[i]);
			}
			return objects;
		}
	}

	let uniqueID = 0; //Split off into seperate files

	class ColliderMask{
		constructor(opts){
			if(!opts) throw 'Need opts to make collider';
			this.x = opts.x || 0;
			this.y = opts.y || 0;
			this.type = 'Collider';
			this.id = opts.id || ++uniqueID; 
		}
		cast(type){
			return -1;
		}
	}

	class Rect extends ColliderMask{
		constructor(opts){
			super(opts);
			this.width = opts.width;
			this.height = opts.height;
			this.parent = opts.parent || null;
			this.type = opts.type || 'Rect' || this.type;
		}
	}

	class Paddle extends RectEntity {
		constructor(opts){
			super(opts);
		}
		update(ctx){
			super.update(ctx);
			if(ctx.keyManager.get('w')){
				this.y -= 5;
				
				if(this.y < 0){
					this.y = 0;
				}
			}else if(ctx.keyManager.get('s')){
				this.y += 5;
				if(this.y + this.height> this.stage.canvas.height){
					player.y = this.stage.canvas.height - player.height;
				}
			}
		}
	}

	class GameScreen extends Entity{
		constructor(opts){
			super(opts);
			this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
			this.bluePaddle = new Paddle({parent: this});
			this.addChild(this.bluePaddle);
			this.addChild(new RectEntity({parent: this, width: 100, height: this.ctx.canvas.height / 4, fillStyle: 'blue', x: this.ctx.canvas.width - 20, y: this.ctx.canvas.width/2, id: 'bluePlayer'}));
			this.addChild(new RectEntity({parent: this, width: 100, height: 100, fillStyle: 'red'}));
		}
		update(ctx){
			super.update(ctx);	
		}
	}

	class LoadingScreen extends Entity{
		constructor(opts){
			super(opts);
			this.stage.collider.insert(new Rect({x: 0, y: 0, width: this.stage.canvas.width, height: this.stage.canvas.height, parent: this, id: 'loadingScreen'}));
			this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: this.ctx.canvas.height/3, textAlign: 'center', content: 'Boyce Ball', fillStyle: 'blue'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: (this.ctx.canvas.height)/2, textAlign: 'center', content: 'By Web Dev', font: '20px Comic Sans MS', fillStyle: 'red'}));
			//this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/5, textAlign: 'center', content: 'Feel free to click around...', font: '9px Comic Sans MS', fillStyle: 'white'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/4, textAlign: 'center', content: 'Press the spacebar to continue...', font: '13px Comic Sans MS', fillStyle: 'grey'}));
			
		}
		
		update(ctx){
			super.update(ctx);
			if(ctx.keyManager.isChanged(' ')){
				this.destroy();
			}
		}
		
		onClick(data){
			
		}
		destroy(){
				super.destroy();
				this.stage.collider.remove('loadingScreen');
				this.stage.addChild(new GameScreen({parent: this, x:0, y:0}));
		}
	}

	let defaultFPS = 60;

	class Game{
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

	let VERSION = '0.0.1';

	exports.VERSION = VERSION;
	exports.Game = Game;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
