let id = 0;

export class Entity {
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
		return -1;
	}
	insertEntity(name, opts){
		this.children.push(new this.stage.entityDefs[name](opts));
	}
}