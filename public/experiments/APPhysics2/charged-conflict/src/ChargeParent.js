import {Entity} from './Entity.js';

export class ChargeParent extends Entity{
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
	update(ctx){
		for(let i = 0; i != this.children.length; i++){
			this.children[i].updateAcceleration();
			this.children[i].updateVelocity();
		}
		for(let i = 0; i != this.children.length; i++){
			this.children[i].updatePosition();
		}
	}
	getChargeCount(){
		return this.children.length; //Cracks around 400 charges. More than enoguh.
	}
}