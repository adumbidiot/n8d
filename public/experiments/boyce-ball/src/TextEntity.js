import {Entity} from './Entity.js';

let defaultContent = 'Hello World!';
let defaultFillStyle = 'white';
let defaultFont = '30px Comic Sans MS';

export class TextEntity extends Entity{
	constructor(opts){
		super(opts);
		this.content = opts.content || defaultContent;
		this.fillStyle = opts.fillStyle || defaultFillStyle;
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
