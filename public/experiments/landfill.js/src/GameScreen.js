import {Entity} from './Entity.js';
import {RectEntity} from './RectEntity.js';
import {Paddle} from './Paddle.js';

export class GameScreen extends Entity{
	constructor(opts){
		super(opts);
		this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
		this.bluePaddle = new Paddle({parent: this})
		this.addChild(this.bluePaddle);
		this.addChild(new RectEntity({parent: this, width: 100, height: this.ctx.canvas.height / 4, fillStyle: 'blue', x: this.ctx.canvas.width - 20, y: this.ctx.canvas.width/2, id: 'bluePlayer'}));
		this.addChild(new RectEntity({parent: this, width: 100, height: 100, fillStyle: 'red'}));
	}
	update(ctx){
		super.update(ctx);	
	}
}