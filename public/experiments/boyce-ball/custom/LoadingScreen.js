export default function(game){
	let Entity = game.getEntityDef('Entity');
	
	return class LoadingScreen extends Entity{
		constructor(opts){
			super(opts);
			this.insertEntity('RectEntity', {parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'});
			this.insertEntity('TextEntity', {parent: this, x: this.ctx.canvas.width/2, y: this.ctx.canvas.height/3, textAlign: 'center', content: 'Boyce Ball', fillStyle: 'blue'});
			this.insertEntity('TextEntity', {parent: this, x: this.ctx.canvas.width/2, y: (this.ctx.canvas.height)/2, textAlign: 'center', content: 'By Web Dev', font: '20px Comic Sans MS', fillStyle: 'red'});
			this.insertEntity('TextEntity', {parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/4, textAlign: 'center', content: 'Press the spacebar to continue...', font: '13px Comic Sans MS', fillStyle: 'grey'});
		}
		
		update(ctx){
			super.update(ctx);
			if(ctx.keyManager.isChanged(' ')){
				this.destroy();
			}
		}
		
		destroy(){
			super.destroy();
			//this.stage.collider.remove('loadingScreen');
			this.stage.insertEntity('GameScreen', {parent: this});
		}
	}
}