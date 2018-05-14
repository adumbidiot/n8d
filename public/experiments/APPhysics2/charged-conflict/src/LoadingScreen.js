import {Entity} from './Entity.js';
import {RectEntity} from './RectEntity.js';
import {TextEntity} from './TextEntity.js';
import {Rect} from './Collider.js';
import {CircleEntity} from './CircleEntity.js';
import {ChargeParent} from './ChargeParent.js';
import {Charge} from './Charge.js'

export class LoadingScreen extends Entity{
	constructor(opts){
		super(opts);
		this.stage.collider.insert(new Rect({x: 0, y: 0, width: this.stage.canvas.width, height: this.stage.canvas.height, parent: this, id: 'loadingScreen'}));
		this.addChild(new RectEntity({parent: this, width: this.ctx.canvas.width, height: this.ctx.canvas.height, fillStyle: 'black'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: this.ctx.canvas.height/3, textAlign: 'center', content: 'Charged Conflict', fillStyle: 'blue'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: (this.ctx.canvas.height)/2, textAlign: 'center', content: 'By ADumbIdiot', font: '20px Comic Sans MS', fillStyle: 'red'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/5, textAlign: 'center', content: 'Feel free to click around...', font: '9px Comic Sans MS', fillStyle: 'white'}));
		this.addChild(new TextEntity({parent: this, x: this.ctx.canvas.width/2, y: 3 * (this.ctx.canvas.height)/4, textAlign: 'center', content: 'Press the spacebar to continue...', font: '13px Comic Sans MS', fillStyle: 'grey'}));
		this.chargeSim = new ChargeParent({parent: this});
		
		this.addPositive({x: 100, y: 100});
		this.addNegative({x: 150, y: 200});
		
		let N = this.stage.settings['loadingScreenParticleCount'] || 40;
		addRandom(this, N);
		
		this.addChild(this.chargeSim);
		
	}
	
	update(ctx){
		super.update(ctx);
		if(ctx.keyManager.isChanged(' ')){
			this.destroy();
		}
	}
	
	onClick(data){
		if(data.key === 3){
			this.chargeSim.addChild(new Charge({parent: this.chargeSim, x: data.x, y: data.y, charge: -0.0001}));
		}else if(data.key === 1){
			this.chargeSim.addChild(new Charge({parent: this.chargeSim, x: data.x, y: data.y, charge: 0.0001}));
		}else if(data.key === 2){
			this.addChild(new CircleEntity({x: data.x, y: data.y, radius: 10, parent: this, fillStyle: 'grey'}));
		}
	}
	destroy(){
			super.destroy();
			this.stage.collider.remove('loadingScreen');
	}
	addPositive(opts){
		opts = opts || {};
		let x = opts.x || 100;
		let y = opts.y || 100;
		this.chargeSim.addChild(new Charge({parent: this.chargeSim, x: x, y: y, charge: 0.0001}));
	}
	addNegative(opts){
		opts = opts || {};
		let x = opts.x || 150;
		let y = opts.y || 200;
		this.chargeSim.addChild(new Charge({parent: this.chargeSim, x: x, y: y, charge: -0.0001}));
	}
}

function getRandomInt(min, max) {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
}

function addRandom(screen, num){
	for(let i = 0; i != num; i++){
		let rng = Math.random();
		let coordX = getRandomInt(10, screen.stage.canvas.width - 10);
		let coordY = getRandomInt(10, screen.stage.canvas.height - 10);
		if(rng < .5){
			screen.addPositive({x: coordX, y: coordY});
		}else{
			screen.addNegative({x: coordX, y: coordY});
		}
	}
}