import {Entity} from './Entity.js';
import {RectEntity} from './RectEntity.js';

export class GameScreen extends Entity{
	constructor(opts){
		super(opts);
		this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
		this.addChild(new RectEntity({parent: this, width: 100, height: this.ctx.canvas.height / 4, fillStyle: 'blue', x: this.ctx.canvas.width - 20, y: this.ctx.canvas.width/2, id: 'bluePlayer'}));
		this.addChild(new RectEntity({parent: this, width: 100, height: 100, fillStyle: 'red'}));
	}
	update(ctx){
		super.update(ctx);
		if(ctx.keyManager.get('w')){
			let player = this.getByID('bluePlayer');
			player.y -= 5;
			
			if(player.y < 0){
				player.y = 0;
			}
		}else if(ctx.keyManager.get('s')){
			let player = this.getByID('bluePlayer');
			player.y += 5;
			if(player.y + player.height> this.stage.canvas.height){
				player.y = this.stage.canvas.height - player.height;
			}
		}
		
		if(){
			
		}	
	}
}