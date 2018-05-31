class Collider{
	constructor(width, height){
		this.broadPhase = new Quadtree(0, new Rect({x: 0, y: 0, width: width, height: height})); //Possibility of collider "interface", interchangable broadphase
		this.objects = []; //List of refs to all colliders regsitered
		this.colliderDefs = {
			Rect: Rect,
			Circle: Circle
		};
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
	getCollisions(object, opts){
		opts = opts || {};
		let disableBroad = opts.disableBroad;
		let probable = [];
		if(!disableBroad){
			probable = this.getProbableCollision(object); //Narrow phase is not implemented. Engine does not require presice collision detection (yet)...
		}else{
			probable = this.objects;
		}
		let data = [];
		for(let i = 0; i != probable.length; i++){
			if(this.isColliding(object, probable[i])){
				data.push(probable[i]);
			}
		}
		return data;
	}
	getColliderDef(name){
		return this.colliderDefs[name] || -1;
	}
	isColliding(collider1, collider2){
		//console.log(collider1, collider2);
		switch(collider1.type){
			case 'Rect':{
				switch(collider2.type){
					case 'Rect': {
						return (collider1.x < collider2.x + collider2.width && collider1.x + collider1.width > collider2.x && collider1.y < collider2.y + collider2.height && collider1.height + collider1.y > collider2.y);
					}
				}
				break;
			}
		}
		return -1;
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

let id = 0;

class Entity {
	constructor(opts){
		if(!opts) throw "Need to provide options to init!";
		if(this.constructor.name === 'Game') this.top = true;
		if(!opts.parent && !this.top) throw "Need to provide parent to init!";
		if(!this.top) this.parent = opts.parent;
		this.ctx = opts.ctx || this.parent.ctx;
		this.children = [];
		this.x = opts.x || 0;
		this.y = opts.y || 0;
		this.id = opts.id || ++id;
		this.stage = this;
		while(this.stage.parent){
			this.stage = this.stage.parent;
		}
	}
	update(ctx){
		for(let i = 0; i < this.children.length; i++){
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
		return -1;
	}
	insertEntity(name, opts){
		opts = opts || {};
		if(!opts.parent) opts.parent = this;
		let EntityDef = this.stage.entityDefs[name];
		if(!EntityDef){
			this.stage.halt();
			console.error(name, opts);
			return -1;
		}
		let child = new EntityDef(opts);
		this.children.push(child);
		return child;
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

class ImageEntity extends RectEntity{
	constructor(opts){
		super(opts);
		if(!opts.img) throw "no image";
		this.img = opts.img;
		this.sprite = document.createElement('canvas');
		this.sprite.width = this.width;
		this.sprite.height = this.height;
		this.setImage(this.img);
	}
	render(){
		this.ctx.drawImage(this.sprite, this.x, this.y);
	}
	setImage(img){
		let ctx = this.sprite.getContext('2d');
		this.img = img;
		ctx.clearRect(0, 0, this.sprite.width, this.sprite.height);
		ctx.drawImage(this.img, 0, 0, this.width, this.height);
	}
}

class Loader{
	constructor(gameOption){
		this.game = gameOption;
		this.assetLib = {};
		this.assetTypes = {
			img: LoaderImageEntry,
			audio: LoaderAudioEntry
		};
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
	loadAsset(url, type){
		let resolvedEntry = this.assetTypes[type] || LoaderEntryBase;
		url = this.resolveURL(url);
		this.assetLib[url] = new resolvedEntry(this.game, url);
	}
	getAsset(url){
		url = this.resolveURL(url);
		return this.assetLib[url].data;
	}
	resolveURL(url){
		let a = document.createElement('a');
		a.href = url;
		return a.href;
	}
	allLoaded(){
		if(this.getLoadedNum() === this.getAssetNum()) return true;
		return false
	}
	getAssetNum(){
		return Object.keys(this.assetLib).length;
	}
	getLoadedNum(){
		let num = 0;
		let keys = Object.keys(this.assetLib);
		for(let i = 0; i < keys.length; i++){
			if(this.assetLib[keys[i]].loaded) num++;
		}
		return num;
	}
}

class LoaderEntryBase{
	constructor(game, url){
		this.url = url;
		this.loaded = false;
		//console.log(this.constructor);
	}
}

class LoaderImageEntry extends LoaderEntryBase{
	constructor(game, url){
		super(game, url);
		this.data = new Image();
		this.data.src = url;
		this.data.onload = () => {
			this.loaded = true;
		};
	}
}

class LoaderAudioEntry extends LoaderEntryBase{
	constructor(game, url){
		super(game, url);
		fetch(url).catch((err) => {
			
		}).then((response) => {
			return response.arrayBuffer();
		}).catch((err) => {
			console.error(err);
		}).then((data) => {
			return game.audioManager.decodeAudio(data);
		}).catch((err) => {
			console.error(err);
		}).then((buf) => {
			this.data = buf;
			this.loaded = true;
		});
	}
}

class AudioManager{
	constructor(){
		let AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
		this.sounds = [];
	}
	play(buffer){
		let source = this.context.createBufferSource();
		source.buffer = buffer;
		source.connect(this.context.destination);
		source.start(0);
		console.log('s');
		this.sounds.push(source);
	}
	stopAll(){
		for(let i = 0; i != this.sounds.length; i++){
			this.sounds[i].stop();
		}
	}
	decodeAudio(buf){
		return new Promise((resolve, reject) => {
			this.context.decodeAudioData(buf, function(buffer){
				resolve(buffer);
			});
		});
	}
}

let defaultFPS = 60;

class Game extends Entity{
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
			CircleEntity: CircleEntity,
			ImageEntity: ImageEntity
		};
		this.loader = new Loader(this);
		this.audioManager = new AudioManager();
		this.fullscreenData = {};
		if(opts.entities){
			this.loadEntities(opts.entities).then(() => {
				this.insertEntity('LoadingScreen');
			});
		}
		if(opts.assets){
			this.loadAssets(opts.assets);
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
			let entity = await this.loader.loadEntitiy(arr[i]);
			this.defineEntity(entity.name, entity);
		}
	}
	loadAssets(arr){
		for(let i = 0; i != arr.length; i++){
			this.loader.loadAsset(arr[i].url, arr[i].type);
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
	log(str){
		
	}
	fullscreen(){
		this.canvas.addEventListener('webkitfullscreenchange', (e) => {
			if(document.webkitFullscreenElement === null){
				this.log('[GAME] Exited Fullscreen');
				this.canvas.style.height = this.fullscreenData.height;
			}else{
				this.log('[GAME] Entered Fullscreen');
				this.fullscreenData.height = this.canvas.style.height;
				this.canvas.style.height = '100%';
			}
		});
		
		this.canvas.webkitRequestFullscreen();
		
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

export { VERSION, Game };
