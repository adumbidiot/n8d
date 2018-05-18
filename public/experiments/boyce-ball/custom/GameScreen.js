export default function(game){
	let Entity = game.getEntityDef('Entity');
	
	return class GameScreen extends Entity{
		constructor(opts){
			super(opts);
			this.insertEntity('RectEntity', {parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'});
			
			let vMid = (this.ctx.canvas.height - 100)/2;
			this.insertEntity('Paddle', {parent: this, x: 20, team: 'blue', height: 100, y: vMid});
			this.insertEntity('Paddle', {parent: this, x: this.ctx.canvas.width - 40, y: vMid, team: 'red', height: 100});
			this.insertEntity('Ball', {parent: this});
			//this.addChild(new RectEntity({parent: this, width: 100, height: this.ctx.canvas.height / 4, fillStyle: 'blue', x: this.ctx.canvas.width - 20, y: this.ctx.canvas.width/2, id: 'bluePlayer'}));
			//this.addChild(new RectEntity({parent: this, width: 100, height: 100, fillStyle: 'red'}));
		}
	}
}