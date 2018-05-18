export default function(game){
	let CircleEntity = game.getEntityDef('CircleEntity');
	let Rect = game.collider.getColliderDef('Rect');
	
	return class Ball extends CircleEntity{
		constructor(opts){
			super(opts);
			this.vx = 3;
			this.vy = 3;
			this.collider = new Rect({x: 0, y:0, width: 2 * this.radius, height: 2 * this.radius});
		}
		update(ctx){
			super.update(ctx);
			this.x += this.vx;
			this.y += this.vy;
			if(this.y + this.radius > this.ctx.canvas.height){
				this.vy *= -1;
			}else if(this.y < 0){
				this.vy *= -1;
			}
			this.collider.x = this.x;
			this.collider.y = this.y;
			let collisions = this.stage.collider.getCollisions(this.collider, {disableBroad: true});
			if(collisions.length > 0){
				this.vx *= -1;
			}
			console.log(ctx.delta);
		}
	}
}