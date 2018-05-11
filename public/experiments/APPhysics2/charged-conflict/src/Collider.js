let colliderTypes = {
	rect: Rect
}
export class Collider{
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

export class Rect{
	constructor(x, y, width, height){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}