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
}