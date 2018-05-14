import {CircleEntity} from './CircleEntity.js';
import {ChargeParent} from './ChargeParent.js';
import {Circle} from './Collider.js';

const k = 9 * Math.pow(10, 9);
let defaultCharge = 10;
let defaultMass = 1;

export class Charge extends CircleEntity{
	constructor(opts){
		super(opts);
		this.charge = opts.charge || defaultCharge;
		this.mass = opts.mass || defaultMass;
		
		this.boundStrategy = /*'wallBound';*/this.stage.settings['loadingScreenBoundStrategy'] || 'wallBound' ||'noWall';
		
		switch(Math.sign(this.charge)){
			case 1: 
				this.fillStyle = 'red';
				break;
			case -1: 
				this.fillStyle = 'blue';
				break;
			case 0: 
				this.fillStyle = 'grey';
				break;
		}
		if(!(this.parent instanceof ChargeParent)){
			throw "Charge must be a child of ChargeParent!";
		}
		
		this.vx = 0;
		this.vy = 0;
		this.ax = 0;
		this.ay = 0;
		
		this.stage.collider.insert(new Circle({x: this.x, y: this.y, r: 10, parent: this, id: 'charge' + this.id}));
	}
	render(){
		super.render();
	}
	update(ctx){
		return;
		super.update(ctx);
		
		this.updateAcceleration();
		this.updateVelocity();
		this.updatePosition();
	}
	updateAcceleration(){
		this.ax = 0;
		this.ay = 0;
		
		let rx = 0;
		let ry = 0;
		let r = 0;
	
		for(let i = 0; i != this.parent.charges.length; i++){
			if(this.parent.charges[i].id === this.id) continue;
			rx = this.x - this.parent.charges[i].x;
			ry = this.y - this.parent.charges[i].y;
			
			r = Math.hypot(rx, ry);
			if(this.id === this.parent.charges[i].id) continue;
			if(r === 0 || r < this.radius + this.parent.charges[i].radius) r = this.radius + this.parent.charges[i].radius; //Patch for no colliders. NOTE: Keep in mind this will need to stay after becuase of simulation stepping causing teleportation
			
			let angle = Math.asin(ry / r);
			let angleX = Math.cos(angle) * Math.sign(this.x - this.parent.charges[i].x);
			let angleY = Math.sin(angle);
			
			let f = calculateAttraction(this.charge, this.parent.charges[i].charge, r); 
				
			let fx = (f * angleX);
			let fy = (f * angleY);

			this.ax += (fx / this.mass); //F = MA
			this.ay += (fy / this.mass);
		}
	}
	updateVelocity(){
		this.vx += this.ax;
		this.vy += this.ay;
	}
	
	updatePosition(){
		this.x += this.vx;
		this.y += this.vy;
		if(this.boundStrategy === 'wallBound'){
			wallBound.bind(this)(); //Make a global setting
		}else if(this.boundStrategy === 'noWall'){
			noWall.bind(this)();
		}
	}
	
	destroy(){
		super.destroy(); //Don't pollute collider system with old colliders
		this.stage.collider.remove('charge' + this.id);
	}
}

function calculateAttraction(q1, q2, r){
	return (k * q1 * q2)/ (r * r); // F = kq1q2/r^2
}

function noWall(){ //Teleports to other end of screen. Hilariously wrong physics but whatever. Great loading screen.
	if(this.x > this.ctx.canvas.width){
		this.x = 0;
	}
	if(this.y > this.ctx.canvas.height){
		this.y = 0;
	}
		
	if((this.y) < 0){
		this.y = this.ctx.canvas.height;
	}
	if((this.x) < 0){
		this.y = this.ctx.canvas.width;
	}
}

function wallBound(){ //Prevent from leaving screen
	if((this.x + this.radius) > this.ctx.canvas.width){
		this.x = this.ctx.canvas.width - this.radius;
		this.vx = 0;
	}
		
	if((this.x - this.radius) < 0){
		this.x = this.radius;
		this.vx = 0;
	}
		
	if((this.y + this.radius) > this.ctx.canvas.height){
		this.y = this.ctx.canvas.height - this.radius;
		this.vy = 0;
	}
		
	if((this.y - this.radius) < 0){
		this.y = this.radius;
		this.vy = 0;
	}
}