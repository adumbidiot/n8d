import {Entity} from './Entity.js';
import {RectEntity} from './RectEntity.js';
import {TextEntity} from './TextEntity.js';

export class LoadingScreen extends Entity{
	constructor(opts){
		super(opts);
		this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: this.ctx.canvas.height/3, textAlign: 'center', content: 'Charged Conflict', fillStyle: 'blue'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: (this.ctx.canvas.height)/2, textAlign: 'center', content: 'By ADumbIdiot', font: '20px Comic Sans MS', fillStyle: 'red'}));
	}
	update(ctx){
		super.update(ctx);
		if(ctx.keys.stateChange){
			console.log(this.parent.removeChild(this.id));
		}
	}
}