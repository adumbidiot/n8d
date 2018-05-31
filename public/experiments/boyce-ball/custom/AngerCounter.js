export default function(game){
	let TextEntity = game.getEntityDef('TextEntity');
	
	return class AngerCounter extends TextEntity{
		constructor(opts){
			super(opts);
			this.x = this.ctx.canvas.width - 10;
			this.y = 16;
			this.content = 'Anger Level ' + 0;
			this.fillStyle = 'pink';
			this.font = '16px Comic Sans MS';
			this.textAlign = 'end';
		}
		update(ctx){
			super.update(ctx);
			this.content = 'Anger Level ' + this.parent.getByID('boyce-bg').angerLevel;
		}
	}
}