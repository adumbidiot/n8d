class fibonacciVisualCore{
	constructor(){
		this.sequence = new Array(2);
		this.sequence[0] = new bigInt(0);
		this.sequence[1] = new bigInt(1);
		this.n = 2;
	}
	calc(n){
		this.n = n;
		while(n > this.sequence.length){
			this.sequence[this.sequence.length] = this.sequence[this.sequence.length - 1].add(this.sequence[this.sequence.length - 2]);
		}
		return this;
	}
	getSequence(){
		return this.sequence.slice(0, this.n);
	}
}