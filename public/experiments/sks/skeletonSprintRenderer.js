class SkeletonSprintRenderer {
	constructor(id, path){
		let self = this;
		
		this.resourceList = {};
		this.resourceList['00'] = new Image();
		this.resourceList.X0 = new Image();
		this.resourceList.X0.src = path + '/main.png';
		
		this.resourceList.B0 = new Image();
		this.resourceList.B0.src = path + '/block.png';
		
		this.resourceList.BK = new Image();
		this.resourceList.BK.src = path + '/block_key.png';
		
		this.resourceList.D1 = new Image();
		this.resourceList.D1.src= path + '/decoration_sconce.png';
		
		this.resourceList.E0 = new Image();
		this.resourceList.E0.src = path + '/exit.png';
		
		this.resourceList.T0 = new Image();
		this.resourceList.T0.src = path + '/toggleblocksolid.png';
		
		this.resourceList.T1 = new Image();
		this.resourceList.T1.src = path + '/toggleblockphase.png';
		
		this.resourceList.IK = new Image();
		this.resourceList.IK.src = path + '/item_key.png';
		
		this.resourceList.D0 = new Image();
		this.resourceList.D0.src = path + '/decoration_scaffold.png';
		
		this.resourceList.P0 = new Image();
		this.resourceList.P0.src = path + '/powerupburrow.png';
		
		this.resourceList.S0 = new Image();
		this.resourceList.S0.src = path + '/switch.png';
		
		this.resourceList.bg = new Image();
		this.resourceList.bg.src= path + '/background.png';
		this.resourceList.bg.onload=function(){
			self.ctx.drawImage(self.resourceList.bg, 0, 0, 800, 450);
		};
		
		this.canvas = document.getElementById(id);
		this.ctx = this.canvas.getContext('2d');
		
		
	}
	render(key, index){
		let y = ((index/32) | 0) * 25;
		let x = (index % 32) * 25;
		let img = this.resourceList[key];
		if(img){
			this.ctx.drawImage(img, x, y, 25, 25);
		}else{
			console.log('Unknown Key: ' + key);
		}
	}
	renderArray(array, type){
		if(type === 'lbl'){
			for(let i = 0; i != 18 * 32; i++){
				this.render(array[i], i);
			}
		}else if(type === 'sks'){
			for(let i = 0; i != 18 * 32; i++){
				this.render(this.sksToLBL(array[i]), i);
			}
		}else{
			throw "Bad Render Type: " + type;
		}
	}
	sksToLBL(num){
		switch(num){
			case 0x00: {
				return '00';
			}
			case 0x01: {
				return 'X0';
			}
			case 0x02: {
				return 'B0';
			}
			case 0x03: {
				return 'BK';
			}
			case 0x04: {
				return 'E0';
			}
			case 0x05: {
				return 'S0';
			}
			case 0x06: {
				return 'T0';
			}
			case 0x07: {
				return 'T1';
			}
			case 0x08: {
				return 'WR';
			}
			case 0x09: {
				return 'P0';
			}
			case 0x0A: {
				return 'IK';
			}
			case 0x0B: {
				return 'Z0';
			}
			case 0x0C: {
				return 'D0';
			}
			case 0x0D: {
				return 'D1';
			}
			default: {
				return 'UK';
			}
		}
		return null;
	}
}