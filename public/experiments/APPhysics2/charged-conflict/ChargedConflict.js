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
		}
		update(){
			for(let i = 0; i != this.children.length; i++){
				this.children[i].update();
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
			throw"WIP";
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
			this.broadPhase = new Quadtree(0, new Rect(0, 0, width, height));
		}
		insert(collider){
			this.broadPhase.insert(collider);
		}
		remove(){
			
		}
		clear(){
			
		}
		getProbableCollision(){
			
		}
		getCollision(){
			
		}
	}

	let maxLevels = 5;
	let maxObjects = 10;

	class Quadtree{
		constructor(level, bounds){
			this.nodes = new Array(4);
			this.objects  = [];
			this.bounds = bounds;
			this.level = level;
		}
		split(){
				let newWidth = (this.bounds.width / 2) | 0;
				let newHeight = (this.bounds.height / 2) | 0;
				let x = bounds.x;
				let y = bounds.y;
				nodes[0] = new Quadtree(this.level + 1, new Rect(x + newWidth, y, newWidth, newHeight));
				nodes[1] = new Quadtree(this.level + 1, new Rect(x, y, newWidth, newHeight));
				nodes[2] = new Quadtree(this.level + 1, new Rect(x, y + newHeight, newWidth, newHeight));
				nodes[3] = new Quadtree(this.level + 1, new Rect(x + newWidth, y + newHeight, newWidth, newHeight));
		}
		clear(){
			
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
			if(this.nodes[0] == null){
				let index = this.getIndex(rect);
				console.log(index);
				if(index != -1){
					this.nodes[index].insert(rect);
				}
			}
			
			if(this.objects.length < maxObjects && this.level < maxLevels){
				if(this.nodes[0]){
					this.split();
				}
				
				this.objects.push(rect);
				
				let i = 0;
				while(i < this.objects.length){
					let index = this.getIndex(this.objects[i]);
					if(index != -1){
						this.nodes[index].insert(this.objects.splice(i, 1));
					}else{
						i++;
					}
				}
			}
		}
		retrieve(objects, rect){
			let index = this.getIndex();
			if(index != -1 && nodes[0]){
				nodes[index].retrieve(objects, rect);
			}
			return objects;
		}
	}

	class Rect{
		constructor(x, y, width, height){
			this.x = x;
			this.y = y;
			this.width = width;
			this.height = height;
		}
	}

	class LoadingScreen extends Entity{
		constructor(opts){
			super(opts);
			let stage = this;
			while(!stage.top){
				stage = stage.parent;
			}
			stage.collider.insert(new Rect(0, 0, stage.canvas.width, stage.canvas.height));
			this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: this.ctx.canvas.height/3, textAlign: 'center', content: 'Charged Conflict', fillStyle: 'blue'}));
			this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: (this.ctx.canvas.height)/2, textAlign: 'center', content: 'By ADumbIdiot', font: '20px Comic Sans MS', fillStyle: 'red'}));
		}
		update(ctx){
			super.update(ctx);
			if(ctx.keys.stateChange){
				console.log(this.parent.removeChild(this.id));
			}
		}
	}

	let defaultFPS = 60;

	class Game{
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
			this.top = true;
			this.collider = new Collider(this.canvas.width, this.canvas.height);
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

	let VERSION = '0.0.1';

	exports.VERSION = VERSION;
	exports.Game = Game;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
