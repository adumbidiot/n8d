(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.ChargedConflict = {})));
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
			let obj = -1;
			for(let i = 0; i != this.objects.length; i++){
				if(this.objects[i].id === id){
					this.objects.splice(i, 1);
					i--;
				}
			}
			if(obj != -1){
				this.reindex();
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

	class Circle extends ColliderMask{
		constructor(opts){
			super(opts);
			this.r = opts.r;
			this.parent = opts.parent;
			//this.type = this.constructor.name;
		}
		cast(type){
			switch(type){
				case Rect.name:
					return new Rect({x: this.x, y: this.y, width: 2 * this.r, height: 2 * this.r, parent: this.parent});
			}
		}
	}

	class CircleEntity extends Entity{
			constructor(opts){
				super(opts);
				this.radius = opts.radius || 10;
				this.fillStyle = opts.fillStyle || 'red';
			}
			render(){
				super.render();
				this.ctx.beginPath();
				this.ctx.fillStyle = this.fillStyle;
				this.ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
				this.ctx.fill();
			}
	}

	class ChargeParent extends Entity{
		constructor(opts){
			super(opts);
			this.charges = [];
			this.width = opts.width || this.ctx.canvas.width;
			this.height = opts.height || this.ctx.canvas.height;
		}
		addChild(child){
			this.charges.push(child); //TODO: Reject noncharges
			super.addChild(child); //Hindsight: Should have just rejected all non-charge children and looped over the children in charges. 
		}
	}

	const k = 9 * Math.pow(10, 9);
	let defaultCharge = 10;
	let defaultMass = 1;

	class Charge extends CircleEntity{
		constructor(opts){
			super(opts);
			this.charge = opts.charge || defaultCharge;
			this.mass = opts.mass || defaultMass;
			switch(Math.sign(this.charge)){
				case 1: 
					this.fillStyle = 'red';
					break;
				case -1: 
					this.fillStyle = 'blue';
					break;
				case 0: 
					this.fillStyle = 'grey';
					break;
			}
			if(!(this.parent instanceof ChargeParent)){
				throw "Charge must be a child of ChargeParent!";
			}
			
			this.vx = 0;
			this.vy = 0;
			this.ax = 0;
			this.ay = 0;
			
			this.stage.collider.insert(new Circle({x: this.x, y: this.y, r: 10, parent: this, id: 'charge' + this.id}));
		}
		render(){
			super.render();
		}
		update(ctx){
			super.update(ctx);
			this.ax = 0;
			this.ay = 0;
			
			let rx = 0;
			let ry = 0;
			let r = 0;
			
			for(let i = 0; i != this.parent.charges.length; i++){
				if(this.parent.charges[i].id === this.id) continue;
				rx = this.x - this.parent.charges[i].x;
				ry = this.y - this.parent.charges[i].y;
				
				r = Math.hypot(rx, ry);
				if(r === 0 || r < this.radius) continue; //Temp. Things get WEIRD. Like crashy weird.
				
				let angle = Math.asin(ry / r);
				let angleX = Math.cos(angle) * Math.sign(this.x - this.parent.charges[i].x);
				let angleY = Math.sin(angle);
				
				let f = calculateAttraction(this.charge, this.parent.charges[i].charge, r); 
				
				let fx = (f * angleX);
				let fy = (f * angleY);

				this.ax += (fx / this.mass); //F = MA
				this.ay += (fy / this.mass);
			}
			this.vx += this.ax;
			this.x += this.vx;
			
			this.vy += this.ay;
			this.y += this.vy;
			
			
			//wallBound.bind(this)(); //Make a global setting
			noWall.bind(this)();
		}
		destroy(){
			super.destroy(); //Don't pollute collider system with old colliders
			this.stage.collider.remove('charge' + this.id);
		}
	}

	function calculateAttraction(q1, q2, r){
		return (k * q1 * q2)/ (r * r); // F = kq1q2/r^2
	}

	function noWall(){ //Teleports to other end of screen. Hilariously wrong physics but whatever. Great loading screen.
		if(this.x > this.ctx.canvas.width){
			this.x = 0;
		}
		if(this.y > this.ctx.canvas.height){
			this.y = 0;
		}
			
		if((this.y) < 0){
			this.y = this.ctx.canvas.height;
		}
		if((this.x) < 0){
			this.y = this.ctx.canvas.width;
		}
	}

	class LoadingScreen extends Entity{
		constructor(opts){
			super(opts);
			this.stage.collider.insert(new Rect({x: 0, y: 0, width: this.stage.canvas.width, height: this.stage.canvas.height, parent: this, id: 'loadingScreen'}));
			this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: this.ctx.canvas.height/3, textAlign: 'center', content: 'Charged Conflict', fillStyle: 'blue'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: (this.ctx.canvas.height)/2, textAlign: 'center', content: 'By ADumbIdiot', font: '20px Comic Sans MS', fillStyle: 'red'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/5, textAlign: 'center', content: 'Feel free to click around...', font: '9px Comic Sans MS', fillStyle: 'white'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/4, textAlign: 'center', content: 'Press the spacebar to continue...', font: '13px Comic Sans MS', fillStyle: 'grey'}));
			this.chargeSim = new ChargeParent({parent: this});
			
			//this.addPositive({x: 100, y: 100});
			//this.addNegative({x: 150, y: 200});
			
			let N = this.stage.settings['loadingScreenParticleCount'] || 40;
			addRandom(this, N);
			
			this.addChild(this.chargeSim);
			
		}
		
		update(ctx){
			super.update(ctx);
			if(ctx.keyManager.isChanged(' ')){
				this.destroy();
			}
		}
		
		onClick(data){
			if(data.key === 3){
				this.chargeSim.addChild(new Charge({parent: this.chargeSim, x: data.x, y: data.y, charge: -0.0001}));
			}else if(data.key === 1){
				this.chargeSim.addChild(new Charge({parent: this.chargeSim, x: data.x, y: data.y, charge: 0.0001}));
			}else if(data.key === 2){
				this.addChild(new CircleEntity({x: data.x, y: data.y, radius: 10, parent: this, fillStyle: 'grey'}));
			}
		}
		destroy(){
				super.destroy();
				this.stage.collider.remove('loadingScreen');
		}
		addPositive(opts){
			opts = opts || {};
			let x = opts.x || 100;
			let y = opts.y || 100;
			this.chargeSim.addChild(new Charge({parent: this.chargeSim, x: x, y: y, charge: 0.0001}));
		}
		addNegative(opts){
			opts = opts || {};
			let x = opts.x || 150;
			let y = opts.y || 200;
			this.chargeSim.addChild(new Charge({parent: this.chargeSim, x: x, y: y, charge: -0.0001}));
		}
	}

	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}

	function addRandom(screen, num){
		for(let i = 0; i != num; i++){
			let rng = Math.random();
			let coordX = getRandomInt(10, screen.stage.canvas.width - 10);
			let coordY = getRandomInt(10, screen.stage.canvas.height - 10);
			if(rng < .5){
				screen.addPositive({x: coordX, y: coordY});
			}else{
				screen.addNegative({x: coordX, y: coordY});
			}
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
			this.settings = opts.settings || {}; //Global settings object
			this.ctx = this.canvas.getContext('2d'); //Store a ctx for easy access
			this.fps = opts.fps || defaultFPS; //Let users set fps. NOTE: Physics is set on fps so changing it will mess up eveything. Probably fun to watch though;
			this.tree = []; //Should have just had it inherit from Entity. RIP
			this.keyManager = new KeyManager(); //Slightly less messy than a global object for key states
			this.top = true; //Way to tell parent apart from the rest
			this.collider = new Collider(this.canvas.width, this.canvas.height); //Collider engine. Maybe make it replacable. or maybe allow it to be attached to entities. IDK.
			this.gameLoop = setInterval(this.loop.bind(this), 1000/this.fps); //Start Game Loop
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
