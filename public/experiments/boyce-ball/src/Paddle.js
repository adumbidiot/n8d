import {RectEntity} from './RectEntity.js';

export class Paddle extends RectEntity {
	constructor(opts){
		super(opts);
	}
	update(ctx){
		super.update(ctx);
		if(ctx.keyManager.get('w')){
			this.y -= 5;
			
			if(this.y < 0){
				this.y = 0;
			}
		}else if(ctx.keyManager.get('s')){
			this.y += 5;
			if(this.y + this.height> this.stage.canvas.height){
				player.y = this.stage.canvas.height - player.height;
			}
		}
	}
}