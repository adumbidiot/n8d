export default function(game){
	let TextEntity = game.getEntityDef('TextEntity');
	
	return class AssetCounter extends TextEntity{
		constructor(opts){
			super(opts);
			this.x = 10;
			this.y = 16;
			this.updateDisplay();
			this.fillStyle = 'pink';
			this.font = '16px Comic Sans MS';
			this.textAlign = 'start';
		}
		update(ctx){
			super.update(ctx);
			this.updateDisplay();
		}
		updateDisplay(){
			this.content = game.loader.getLoadedNum() + '/' + game.loader.getAssetNum();
			if(game.loader.allLoaded()){
					this.content += ' Loaded all Assets!';
			}else{
				this.content += ' Assets Loaded';
			}
		}
	}
}