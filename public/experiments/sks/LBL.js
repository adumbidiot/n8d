class LBL extends UTF8TextFile{
	constructor(){
		super();
	}
	getChunk(index){
		let ret = '';
		for(let i = index * 4; i != index * 4 + 2; i++){
			ret += String.fromCharCode(this.buffer[i+this.offset]);
		}
		return ret;
	}
	load(path, cb){
		let self = this;
		super.load(path, function(){
			self.chunkArray = [];
			for(let i = 0; i != 18 * 32; i++){
				self.chunkArray.push(self.getChunk(i));
			}
			cb();
		});
	}
}