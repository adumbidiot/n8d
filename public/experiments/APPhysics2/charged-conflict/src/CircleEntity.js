import {Entity} from './Entity.js';

export class CircleEntity extends Entity{
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