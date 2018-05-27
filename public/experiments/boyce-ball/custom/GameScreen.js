export default function(game){
	let Entity = game.getEntityDef('Entity');
	
	return class GameScreen extends Entity{
		constructor(opts){
			super(opts);
			this.insertEntity('GameBackground', {
				width: this.ctx.canvas.width, 
				height: this.ctx.canvas.height,
				id: 'boyce-bg'
			});
			
			let vMid = (this.ctx.canvas.height - 100) / 2;
			this.insertEntity('Paddle', {parent: this, x: 20, team: 2, height: 100, y: vMid});
			this.insertEntity('Paddle', {parent: this, x: this.ctx.canvas.width - 40, y: vMid, team: 1, height: 100});
			this.insertEntity('Ball', {parent: this});
			
			this.insertEntity('FPSCounter', {parent: this});
			game.loader.getAsset('Chill beat.m4a', 'audio').play();
		}
	}
}