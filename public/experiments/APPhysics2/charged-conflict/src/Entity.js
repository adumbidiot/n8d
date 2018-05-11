let id = 0;

export class Entity {
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