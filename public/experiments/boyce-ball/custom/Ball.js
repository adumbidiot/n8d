export default function(game){
	let RectEntity = game.getEntityDef('RectEntity');
	let Rect = game.collider.getColliderDef('Rect');
	
	return class Ball extends RectEntity{
		constructor(opts){
			super(opts);
			this.vx = 3.5;
			this.vy = 3.5;
			this.ax = 0.0002;
			this.ay = 0.0002;
			this.width = 40;
			this.height = 40;
			this.collider = new Rect({x: this.x, y: this.y, width: this.width, height: this.height});
			this.sprite = game.loader.getAsset('./jacob.png');
			this.bg = this.parent.getByID('boyce-bg');
		}
		update(ctx){
			super.update(ctx);
			this.vx += this.ax;
			this.vy += this.ay;
			this.x += this.vx;
			this.y += this.vy;
			
			if(this.y + this.height > this.ctx.canvas.height){
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
				if(this.x < this.ctx.canvas.width/2){
					this.vx = Math.abs(this.vx);
					this.ax = Math.abs(this.ax);
				}else{
					this.vx = -Math.abs(this.vx);
					this.ax = -Math.abs(this.ax);
				}
			}
			if(this.x > this.ctx.canvas.width){
				this.stage.insertEntity('StatsScreen', {winner: 1, angerLevel: this.bg.angerLevel, ballVX: this.vx});
				this.parent.destroy();
			}else if(this.x + this.width < 0){
				this.stage.insertEntity('StatsScreen', {winner: 2, angerLevel: this.bg.angerLevel, ballVX: this.vx});
				this.parent.destroy();
			}
		}
		render(){
			this.ctx.drawImage(this.sprite, this.x, this.y, this.width, this.height);
		}
	}
}