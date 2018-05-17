import {Entity} from './Entity.js';

let defaultWidth = 100;
let defaultHeight = 100;
let defaultFillStyle = 'white';

export class RectEntity extends Entity{
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