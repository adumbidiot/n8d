export default function(game){
	let ImageEntity = game.getEntityDef('ImageEntity');
	let Entity = game.getEntityDef('Entity');
	
	return class GameBackground extends Entity{
		constructor(opts){
			super(opts);
			this.angerLevel = 0;
			this.red = 0;
			
			this.display_color = this.insertEntity('RectEntity', {
				parent: this, 
				width: this.ctx.canvas.width, 
				height: this.ctx.canvas.height,
				fillStyle: 'rgb(' + this.red + ' ,0 ,0)'
			});
			
			this.display = this.insertEntity('ImageEntity', { 
				img: game.loader.getAsset('./jacob.png'), 
				width: this.ctx.canvas.width, 
				height: this.ctx.canvas.height
			});
			
			
			
			this.i = 0;
			this.time = 0;
			this.states = ['./jacob.png', './jacob1.png', './jacob2.png', './jacob1.png'];
			for(let i = 0; i != this.states.length; i++){
				this.states[i] = game.loader.getAsset(this.states[i]);
			}
			this.step = 0;
		}
		update(){
			this.i++;
			if(this.angerLevel === 0){
				this.i = 0;
			}
			this.time++;
			this.i %= this.states.length;
			this.time %= 150;
			this.display.setImage(this.states[this.i]);
			this.display.x += this.i > 1 ? -this.angerLevel : this.angerLevel;
			this.display.y += this.i > 1 ? this.angerLevel : -this.angerLevel;
			if(this.time === 0){
				this.angerLevel++;
				this.red = Math.min(this.red + 20, 255);
				this.display_color.fillStyle = 'rgb(' + this.red + ' ,0 ,0)';
			}
			if(this.angerLevel === 100){
				game.loader.getAsset('BFG.mp3', 'audio').play();
			
			}
		}
	}
}