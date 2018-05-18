let colliderTypes = {
	'Rect': Rect,
	'Circle': Circle
}
export class Collider{
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

export class ColliderMask{
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

export class Rect extends ColliderMask{
	constructor(opts){
		super(opts);
		this.width = opts.width;
		this.height = opts.height;
		this.parent = opts.parent || null;
		this.type = opts.type || 'Rect' || this.type;
	}
}

export class Circle extends ColliderMask{
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