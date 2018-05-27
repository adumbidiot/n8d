import {Entity} from './Entity.js';
import {RectEntity} from './RectEntity';
export class ImageEntity extends RectEntity{
	constructor(opts){
		super(opts);
		if(!opts.img) throw "no image";
		this.img = opts.img;
		this.sprite = document.createElement('canvas');
		this.sprite.width = this.width;
		this.sprite.height = this.height;
		this.setImage(this.img);
	}
	render(){
		this.ctx.drawImage(this.sprite, this.x, this.y);
	}
	setImage(img){
		let ctx = this.sprite.getContext('2d');
		this.img = img;
		ctx.clearRect(0, 0, this.sprite.width, this.sprite.height);
		ctx.drawImage(this.img, 0, 0, this.width, this.height);
	}
}