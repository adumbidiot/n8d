class World {
	constructor(id){
		let self = this;
		this.resourceLibrary = {};
		this.resourceList = [{
			name: 'Slime',
			resource: 'image',
			path: './assets/slime.png'
		},
		{
			name: 'Tree',
			resource: 'image',
			path: './assets/tree.png'
		},
		{
			name: 'Apple',
			resource: 'image',
			path: './assets/apple.png'
		}]; //TODO: Load from mainifest?
		
		this.canvas = document.getElementById(id); //TODO: handle direct tag pass, wrong element pass, ex div, p, h1
		if(!this.canvas){
			throw "ERROR: INVALID CANVAS ID";
		}
		
		this.ctx = this.canvas.getContext('2d');
		if(!this.ctx){
			throw "ERROR: FAILED TO GET 2D CONTEXT";
		}
		
		this.entities = []; //TODO: Store by entity type?
		this.quadtree = new World.Quadtree(0,0, 800, 600); //TODO: Get from canvas
		
		this.treeCount = 0; //TODO: Store spawn limits better?
		this.treeLimit = 5;
		
		this.appleCount = 0;
		this.appleLimit = 5;
		
		this.loadAssets(function(){
		console.log('[INFO] Resources loaded!');
			self.spawn('Slime', 110, 110);
			self.spawn('Slime', 140, 140);
			self.spawn('Tree', 50, 40);
			self.spawn('Apple', 200, 100);
			self.spawn('Apple', 400, 400);
			self.loop = setInterval(function(){
			self.update();
				self.draw();
			}, 1000/30);
		});

	}
	loadAssets(cb){
		let num = this.resourceList.length;
		for(let i = 0; i != this.resourceList.length; i++){
			this.loadResource(this.resourceList[i], function(){
				num--;
				if(num === 0){
					cb();
				}
			});
		}
	}
	loadResource(obj, cb){
		let ref = this;
		switch(obj.resource){
			case 'image': {
				let img = new Image();
				img.src = obj.path;
				img.onload = function(){
					ref.resourceLibrary[obj.name] = img;
					console.log('[RESOURCE] ' + obj.name + ' loaded');
					cb(); //TODO: errors
				}
				break;
			}
		}
	}
	update(){
		this.quadtree.clear();
		for(let i = 0; i != this.entities.length; i++){
				this.quadtree.insert(this.entities[i].rect);
		}
		
		for(var i = this.entities.length - 1; i != -1; i--){
				try{
					this.entities[i].update({index: i});
				}catch(e){
					console.log(e);
					clearInterval(w.loop);
					break;
				}
		}
	}
	draw(){
		this.ctx.clearRect(0,0, this.ctx.canvas.width, this.ctx.canvas.height);//Clear
		
		this.ctx.fillStyle = '#00c617'; //Background
		this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
		
		//TODO: Order rendering by Y-Value
		for(let i = 0; i != this.entities.length; i++){
				this.entities[i].draw();
		}
	}
	spawn(type, x, y){
		//TODO: Entity list, dynamic entity loader
		switch(type){ //TODO: Case sensitive?
			case "Slime": {
				this.entities.push(new World.Slime({x: x, y: y, world: this}));
				console.log("[SPAWN] SLIME");
				break;
			}
			case "Tree": {
				this.entities.push(new World.Tree({x: x, y: y, world: this}));
				console.log("[SPAWN] TREE");
				break;
			}
			case "Apple": {
				this.entities.push(new World.Apple({x: x, y: y, world: this}));
				console.log("[SPAWN] Apple");
				break;
			}
		}
	}
	despawn(index){
		//Remove entity from Array
		this.entities[index].onDelete();	
		this.entities.splice(index, 1); //TODO: Check if index is > array size
	}
}

World.Entity = class Entity{
	constructor(args){
		args = args || {};
		
		this.sprite = args.world.resourceLibrary[args.sprite];
		if(!this.sprite){
			console.warn('[WARN] Entity: No Sprite Specified');
			this.sprite = new Image();
		}
		
		this.width =  args.width || this.sprite.width || 0;
		this.height =  args.height || this.sprite.height || 0;
		this.x = args.x || 0;
		this.y = args.y || 0;
		
		if(!args.world){
			throw "ENTITY MUST Be ASSIGNED TO A WORLD!";
		}else if(!args.world.ctx){
			throw "ENTITY MUST HAVE 2D CONTEXT!";
		}else{
			this.world = args.world;
			this.ctx = args.world.ctx;
		}
		
		this.dx = this.x - this.width/2;
		this.dy = this.y - this.height/2;
		
		this.rect = new World.Quadtree.Rect(this.dx, this.dy, this.width, this.height, this);
	}
	onDelete(){
		//Placeholder
	}
	draw(){
		
	}
	update(){
	}
}

World.Slime = class Slime extends World.Entity{
	constructor(args){
		args = args || {};
		args.sprite = 'Slime';
		
		args.width = 50;
		args.height = 40;
		super(args);
		
		this.state = 'wander';
				
		this.inventory = {
			wood: 0
		};
		
		this.stats = {
			attack: 5
		};
		
		//Bob logic
		this.bobDirection = 1;
		this.yBob = 0; //avoid editing y-cood direcly
		this.heightBob = 0; //Avoid editing height directly
		
		//Temp AI vars
		this.direction = 1; //left-right behavior
	}
	calculateBob(){
		this.heightBob += 1 * this.bobDirection;
		this.yBob -= 1 * this.bobDirection; //Correct for height change
		if(this.heightBob >= 10){
			this.bobDirection *= -1;
		}
		
		if(this.heightBob <= -10){
			this.bobDirection *= -1;
		}
	}
	draw(){
			this.calculateBob();
			this.ctx.drawImage(this.sprite, this.getdx(), this.getdy() + this.yBob, this.width, this.height + this.heightBob);
	}
	update(){
		
		//Temporary left-right behavior
		this.x += 2 * this.direction;
		if(this.x > this.ctx.canvas.width - 100){
				this.direction *= -1;	
		}
		if(this.x < 0){
					this.direction *= -1;
		}
				
		//Hack for now
		//TODO: switch to use object directly
		this.rect.x = this.getdx();
		this.rect.y = this.getdy();
	}
	getdx(){
		return this.x + this.width/2;
	}
	getdy(){
		return this.y + this.height/2;
	}
}

World.Apple = class Apple extends World.Entity{
	constructor(args){
		args = args || {};
		args.sprite = 'Apple';
		super(args);
		
		this.world.appleCount++;
		
		this.growTime = 0;
	}
	update(args){
		this.growTime++; //TODO: Add option to change? Speedgrow?
		if(this.growTime >= 100){ // 1000 = ~33 seconds at 30 fps
			if(!(this.world.treeCount < this.world.treeLimit)){
				this.growTime %= 100;
				this.world.despawn(args.index);
				return;
			}
			this.world.spawn('Tree', this.x, this.y - 50);
			this.world.despawn(args.index);
		}
			
		this.rect.x = this.dx;
		this.rect.y = this.dy;
	}
	draw(){
			this.ctx.drawImage(this.sprite, this.dx, this.dy, this.width, this.height);
	}
	onDelete(){
		this.world.appleCount--;
	}
}

World.Tree = class Tree extends World.Entity{
	constructor(args){
		args = args || {};
		args.sprite = 'Tree';
		args.width = 50;
		args.height = 100;
		super(args);
		
		this.world = args.world;
		
		this.world.treeCount++;
		
		this.health = 10;
		
		this.nextApple = 0;
	}
	draw(){
		this.ctx.drawImage(this.sprite, this.dx, this.dy, this.width, this.height);
	}
	update(){
		//TODO: Make RNG algortihm take local tree density into account
		//TODO: Maybe a larger nextapple amount?
		this.nextApple++; 
		if(this.nextApple > 1000){
			let rngX = (100 - (Math.random() * 200)); 
			let rngY = (100 - (Math.random() * 200));
			this.world.spawn('Apple', rngX + this.x, this.y + rngY);
			this.nextApple = 0;
		}
		
		this.rect.x = this.dx;
		this.rect.y = this.dy;
	}
}

World.Quadtree = class Quadtree {
	constructor(x, y, w, h){
		this.thresh = 4;
		this.quads = [];
		this.objects = [];
		this.rect = new World.Quadtree.Rect(x,y,w,h);
	}
	clear(){
		this.objects.length = 0;
		for(let i = 0; i != this.quads.length; i++){
			if(this.quads[i] != null){
				this.quads[i].clear();
				this.quads[i] = null;
			}
		}
	}
	split(){
		let subWidth = (this.rect.w / 2) | 0;
		let subHeight = (this.rect.h / 2) | 0;
		let x = this.rect.x | 0;
		let y = this.rect.y | 0;
		
		this.quads[0] = (new World.Quadtree(x, y, subWidth, subHeight));
		this.quads[1] = (new World.Quadtree(x + subWidth, y, subWidth, subHeight));
		this.quads[2] = (new World.Quadtree(x + subWidth, y + subHeight, subWidth, subHeight));
		this.quads[3] = (new World.Quadtree(x, y + subHeight, subWidth, subHeight));
	}
	getIndex(rect){
		let index = -1;
		let verticalMidpoint = this.rect.x + (this.rect.w/2);
		let horizantalMidpoint = this.rect.y + (this.rect.h/2);
		
		let topQuad = (rect.y < horizantalMidpoint && rect.y + rect.h < horizantalMidpoint);
		let bottomQuad = (rect.y > horizantalMidpoint);
		
		if(rect.x < verticalMidpoint && (rect.x + rect.w) < verticalMidpoint){
			if(topQuad){
				index = 1;
			}else if(bottomQuad){
				index = 2;
			}
		}else if(rect.x > verticalMidpoint){
			if(topQuad){
				index = 0;
			}else if(bottomQuad){
				index = 3;
			}
		}
		return index;
	}
	insert(rect){
		if(this.quads[0] != null){
			let index = this.getIndex(rect);
			
			if(index != -1){
				this.quads[index].insert(rect);
				return;
			}
		}
		this.objects.push(rect);
		
		if(this.objects.length > this.thresh){
			if(this.quads[0] == null){
				this.split();
			}
			let i = 0;
			while(i < this.objects.length){
				let index = this.getIndex(this.objects[i]);
				if(index != -1){
					this.quads[index].insert(this.objects.splice(i, 1)[0]);
				}else{
					i++;
				}
			}
		}
	}
	retrieve(rect){
		let index = this.getIndex(rect);
		let obj = [];
		if(index != -1 && this.quads[0] != null){
			let temp = this.quads[index].retrieve(rect);
			obj = obj.concat(temp);
		}
		
		obj = obj.concat(this.objects);
		
		return obj;
	}
}

World.Quadtree.Rect = class Rect {
	constructor(x, y, w ,h, parent){
		this.x = x;
		this.y = y;
		this.w = w;
		this.h = h;
		this.parent = parent;
	}
}

//TODO: Load Entities seperately?
//TODO: Buldings
//TODO: Bushes
//TODO: Rocks
//TODO: Lakes
//TODO: Villages
//TODO: Village AI
//TODO: Animals
//TODO: Slime AI
//TODO: Modular SLime AI
//TODO: slime "converstions"
//TODO: Slime "politics"
//TODO: SLime search AI
//TODO: Web-worker speedup/Use seperate thread for logic?
//TODO: WASM rewrite?
//TODO: Better UI
//TODO: Scrolling World?
//TODO: Infinite World?
//TODO: Bordered world? 
//TODO: Chunked world?
//TODO: Time-Speedup button
//TODO: SLime inventories
//TODO: Slime health
//TODO: Make all animals inherit from base class animal?
//TODO: Slime states?
//TODO: Better sprites?
//TODO: World save/load (JSON or ????)