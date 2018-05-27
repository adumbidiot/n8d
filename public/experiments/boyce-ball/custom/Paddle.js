export default function(game){
	let RectEntity = game.getEntityDef('RectEntity');
	let Rect = game.collider.getColliderDef('Rect');
	
	return class Paddle extends RectEntity {
		constructor(opts){
			super(opts);
			this.width = 20;
			this.team = opts.team || 'neutral';
			switch(this.team){
				case 1:
					this.fillStyle = 'orange';
					this.triggerUp = 'ArrowUp';
					this.triggerDown = 'ArrowDown';
					break;
				case 2:
					this.fillStyle = 'powderBlue';
					this.triggerUp = 'w';
					this.triggerDown = 's';
					break;
			}
			this.collider = new Rect({x: this.x, y: this.y, width: this.width, height: this.height, parent: this});
			this.stage.collider.insert(this.collider);
		}
		update(ctx){
			super.update(ctx);
			if(ctx.keyManager.get(this.triggerUp)){
				this.y -= 5;
				if(this.y < 0){
					this.y = 0;
				}
			}else if(ctx.keyManager.get(this.triggerDown)){
				this.y += 5;
				if(this.y + this.height> this.stage.canvas.height){
					this.y = this.stage.canvas.height - this.height;
				}
			}
			this.collider.x = this.x;
			this.collider.y = this.y;
		}
		destroy(){
			super.destroy();
			this.stage.collider.remove(this.collider.id);
		}
	}
}