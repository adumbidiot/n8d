export default function(game){
	let TextEntity = game.getEntityDef('TextEntity');
	
	return class FPSCounter extends TextEntity{
		constructor(opts){
			super(opts);
			this.x = 10;
			this.y = 16;
			this.content = 60 + 'fps';
			this.fillStyle = 'pink';
			this.font = '16px Comic Sans MS';
			this.textAlign = 'start';
			this.i = 0;
		}
		update(ctx){
			super.update(ctx);
			this.i++;
			this.i %= 30;
			if(this.i === 0){
				this.content = ((1000/ctx.delta) | 0) + ' fps';
			}
		}
	}
}