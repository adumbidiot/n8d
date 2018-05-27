export default function(game){
	let Entity = game.getEntityDef('Entity');
	
	return class StatsScreen extends Entity{
		constructor(opts){
			super(opts);

			//console.log(opts);
			this.insertEntity('ImageEntity', {
				width: this.ctx.canvas.width, 
				height: this.ctx.canvas.height, 
				img: game.loader.getAsset('stats.png')
			});
			
			this.insertEntity('TextEntity', {
				x: this.ctx.canvas.width/2, 
				y: this.ctx.canvas.height/3, 
				textAlign: 'center', 
				font: '75px Comic Sans MS', 
				content: 'Player ' + opts.winner + ' Won!', 
				fillStyle: opts.winner == 1 ? 'powderBlue': 'orange'
			});
			
			this.angerText = this.insertEntity('TextEntity', {
				x: this.ctx.canvas.width/2, 
				y: 3 * (this.ctx.canvas.height)/4, 
				textAlign: 'center', 
				content: 'JAcOb ReAcHed AnGeR lEvEl ' + opts.angerLevel, 
				font: '20px Comic Sans MS', 
				fillStyle: 'red'
			});
			
			this.insertEntity('TextEntity', {
				x: this.ctx.canvas.width/2, 
				y: 4 * (this.ctx.canvas.height)/7, 
				textAlign: 'center', 
				content: 'Jacob moved at velocity ' + Math.abs(opts.ballVX.toFixed(2)), 
				font: '20px Comic Sans MS', 
				fillStyle: 'green'
			});
			
			this.insertEntity('TextEntity', {
				x: this.ctx.canvas.width/2, 
				y: 2 * (this.ctx.canvas.height)/4, 
				textAlign: 'center', 
				content: 'Press the spacebar to play again!', 
				font: '20px Comic Sans MS', 
				fillStyle: 'green'
			});
		}
		
		update(ctx){
			super.update(ctx);
			//angerText.font = '40px Comic Sans MS';
			if(ctx.keyManager.isChanged(' ')){
				this.destroy();
			}
		}
		
		destroy(){
			super.destroy();
			this.stage.insertEntity('GameScreen', {parent: this});
		}
	}
}