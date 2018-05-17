import {Entity} from './Entity.js';
import {RectEntity} from './RectEntity.js';
import {TextEntity} from './TextEntity.js';
import {Rect} from './Collider.js';
import {CircleEntity} from './CircleEntity.js';
import {ChargeParent} from './ChargeParent.js';
import {Charge} from './Charge.js';
import {GameScreen} from './GameScreen.js';

export class LoadingScreen extends Entity{
	constructor(opts){
		super(opts);
		this.stage.collider.insert(new Rect({x: 0, y: 0, width: this.stage.canvas.width, height: this.stage.canvas.height, parent: this, id: 'loadingScreen'}));
		this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: this.ctx.canvas.height/3, textAlign: 'center', content: 'Boyce Ball', fillStyle: 'blue'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: (this.ctx.canvas.height)/2, textAlign: 'center', content: 'By Web Dev', font: '20px Comic Sans MS', fillStyle: 'red'}));
		//this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/5, textAlign: 'center', content: 'Feel free to click around...', font: '9px Comic Sans MS', fillStyle: 'white'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/4, textAlign: 'center', content: 'Press the spacebar to continue...', font: '13px Comic Sans MS', fillStyle: 'grey'}));
		
	}
	
	update(ctx){
		super.update(ctx);
		if(ctx.keyManager.isChanged(' ')){
			this.destroy();
		}
	}
	
	onClick(data){
		
	}
	destroy(){
			super.destroy();
			this.stage.collider.remove('loadingScreen');
			this.stage.addChild(new GameScreen({parent: this, x:0, y:0}));
	}
}