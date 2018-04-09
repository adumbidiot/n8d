class fibonacciVisual{
	constructor(opts){
		opts = opts || {};
		if(opts.canvasID){
			this.canvas = document.getElementById(opts.canvasID);
		}
		this.canvas = this.canvas || opts.canvas || document.createElement('canvas');
		this.nFunc = opts.nFunc || (function(){
			return 2;
		});
		this.ctx = this.canvas.getContext('2d');
		this.drawData = [];
		this.fibonacci = new fibonacciVisualCore();
		this.bitWidth = opts.bitWidth || 1;
		this.onColor = opts.onColor || 'black';
		this.offColor = opts.offColor || 'white';
	}
	setN(n){
			this.nFunc = function(){
				return (function(){
					return n;
				})();
			};
	}
	setNFunc(func){
		this.nFunc = func;
	}
	get n(){
		return this.nFunc();
	}
	draw(){
		this.resize().clear();
		this.ctx.fillStyle = this.onColor;
		for(let  i = 0; i != this.drawData.length; i++){
			let data = this.drawData[i].toArray(2).value;
			for(let j = 0; j != data.length; j++){
				if(data[data.length - 1 - j] === 1){
					this.ctx.fillRect(j * this.bitWidth,i * this.bitWidth, this.bitWidth, this.bitWidth);
				}		
			}
		}
		return this;
	}
	clear(){
		this.ctx.fillStyle = this.offColor;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		return this;
	}
	calc(){
		this.drawData = this.fibonacci.calc(this.n).getSequence();
		return this;
	}
	resize(){
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		canvas.height = this.n * this.bitWidth;
		canvas.width = this.n * this.bitWidth;
		return this;
	}
	produceImage(){
		this.calc().draw();
	}
	updateOnColor(color, redraw){
		this.onColor = color;
		if(redraw) this.draw();
	}
	updateOffColor(color, redraw){
		this.offColor = color;
		if(redraw) this.draw();
	}
	getDataURL(){
		 return this.canvas.toDataURL('image/png');
	}
}