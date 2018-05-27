export default function(game){
	let Entity = game.getEntityDef('Entity');
	
	return class LoadingScreen extends Entity{
		constructor(opts){
			super(opts);
			this.insertEntity('ImageEntity', {
				width: this.ctx.canvas.width, 
				height: this.ctx.canvas.height, 
				img: game.loader.getAsset('stock-photo-cyber-internet-robot-hacker-hacking-into-a-computer-to-steal-personal-data.png')
			});
			
			this.insertEntity('TextEntity', {
				x: this.ctx.canvas.width/2, 
				y: this.ctx.canvas.height/3, 
				textAlign: 'center', 
				font: '75px Comic Sans MS',
				content: 'Boyce Ball', 
				fillStyle: 'orange'
			});
			
			this.insertEntity('TextEntity', {
				x: this.ctx.canvas.width/2, 
				y: (this.ctx.canvas.height)/2, 
				textAlign: 'center', 
				content: 'By Web Dev', 
				font: '25px Comic Sans MS', 
				fillStyle: 'powderBlue'
			});
			
			this.insertEntity('TextEntity', {
				x: this.ctx.canvas.width/2, 
				y: 3 * (this.ctx.canvas.height)/4, 
				textAlign: 'center', 
				content: 'Press the spacebar to continue...', 
				font: '20px Comic Sans MS', 
				fillStyle: 'pink'
			});
			
		}
		
		update(ctx){
			super.update(ctx);
			if(ctx.keyManager.isChanged(' ') && game.loader.allLoaded()){
				this.destroy();
			}
		}
		
		destroy(){
			super.destroy();
			this.stage.insertEntity('GameScreen', {parent: this});
		}
	}
}