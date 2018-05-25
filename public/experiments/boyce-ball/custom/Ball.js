export default function(game){
	let RectEntity = game.getEntityDef('RectEntity');
	let Rect = game.collider.getColliderDef('Rect');
	
	return class Ball extends RectEntity{
		constructor(opts){
			super(opts);
			this.vx = 3;
			this.vy = 3;
			this.ax = 0.002;
			this.ay = 0.002;
			this.width = 40;
			this.height = 10;
			this.collider = new Rect({x: this.x, y: this.y, width: this.width, height: this.height});
			this.sprite = new Image();
			this.sprite.src = "jacob.png";
		}
		update(ctx){
			super.update(ctx);
			this.vx += this.ax;
			this.vy += this.ay;
			this.x += this.vx;
			this.y += this.vy;
			
			if(this.y > this.ctx.canvas.height){
				this.vy *= -1;
				this.ay *= -1;
			}else if(this.y < 0){
				this.vy *= -1;
				this.ay *= -1;
			}
			
			this.collider.x = this.x;
			this.collider.y = this.y;
			
			let collisions = this.stage.collider.getCollisions(this.collider, {disableBroad: true}); //Fix collisions
			
			if(collisions.length > 0){
				this.vx *= -1;
				this.ax *= -1;
			}
			console.log(this.vx, this.vy);
		}
		render(){
			this.ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
		}
	}
}