var skeleton = {
	image: new Image(128, 128),
	sprites: {
		normal: [
			new Image(128, 128),
			new Image(128, 128),
			new Image(128, 128)
		],
		inverted: new Image(128, 128)
	},
	x: 0,
	y: 0,
	direction: 'left',
	mainSpeed: (2.8 * 2),
	jumpSpeed: (6 * 2),
	jumpSpeedLimit: (6 * 2),
	jumping: false,
	touchingTop: false,
	touchingBottom: false,
	touchingLeft: false,
	touchingRight: false,
	scaleX: false,
	draw: function(ctx){
		if(leftDown && skeleton.direction === 'right')
		{
			skeleton.direction = 'left';
			skeleton.image = skeleton.sprites.normal[0];
		}

		if(rightDown && skeleton.direction === 'left')
		{
			skeleton.direction = 'right';
			skeleton.image = skeleton.sprites.inverted;
		}
		
		skeleton.handleInputX();
		
		if(skeleton.jumping == true){
			//TODO: Jump anim
		}else if(rightDown || leftDown){
			if(skeleton.direction == 'left'){
				skeleton.image = skeleton.sprites.normal[skeleton.sprites.normal.index];
				skeleton.sprites.normal.index += 1;
				if(skeleton.sprites.normal.index == 3){
					skeleton.sprites.normal.index = 0;
				}
			}
		}

		touchingTop = false;
		touchingBottom = false;
		touchingLeft = false;
		touchingRight = false;
		
		skeleton.y += skeleton.jumpSpeed;

		skeleton.handleSwitchY();
		skeleton.handleSwitchX();

		skeleton.handleCollision();
		
		
		/*
		//TODO: Add a get grounded func?, embed into collider? (collidey[return if collided/grounded])
		if(upDown && skeleton.grounded){
			skeleton.jumping = true;
			skeleton.jumpSpeed = skeleton.jumpSpeedLimit;
			skeleton.y -= skeleton.jumpSpeed;
			console.log(skeleton);
		}
		
		if(skeleton.jumping){
			if(skeleton.jumpSpeed <= 0){
				skeleton.jumpSpeed *= 1 - skeleton.jumpSpeedLimit/50;
			}else if(skeleton.jumpSpeed > skeleton.jumpSpeedLimit){
				skeleton.jumpSpeed *= 1 + skeleton.jumpSpeedLimit/125;
				if(skeleton.jumpSpeed > skeleton.jumpSpeedLimit/5){
					skeleton.jumpSpeed *= -1;
				}	
			}
		}
		*/
		//console.log(skeleton.y);
		ctx.drawImage(skeleton.image, skeleton.x, skeleton.y, 50, 50);
	},
	handleSwitchX: function(){
		if(skeleton.x < -20){
			skeleton.x = 1560;
		}else if(skeleton.x > 1560){
			skeleton.x = -20;
		}	
	},
	handleSwitchY: function(){
		if(skeleton.y < (-10 *2)){
			skeleton.y = (2 * (450 + 10));
		}else if(skeleton.y > (2 * (450 + 10))){
			skeleton.y = -20;
		}
	},
	handleCollision: function(){
		for(var i = 0; i != blocks.blockArray.length; i++){
			for(var j = 0; j != blocks.blockArray[i].length; j++){
				if(blocks.blockArray[i][j] != 0){
					var x = j * 50;
					var y = i * 50;
					if(skeleton.x + 50 > x && skeleton.x + 50 < x + 6 && skeleton.y + 25 > y && skeleton.y < y + 25 ){
						skeleton.x = x - 50;
						//console.log('collide right');
						skeleton.touchingRight = true;
					}
					if(skeleton.x > x + 44 && skeleton.x < x + 50 && skeleton.y + 25 > y && skeleton.y + 25 < y + 50 ){
						skeleton.x = x + 50;
						//console.log('collide left');
						skeleton.touchingLeft = true;
					}
					if(skeleton.x + 25 > x && skeleton.x + 25 < x + 50 && skeleton.y + 50 > y && skeleton.y + 50 < y + 48 ){
						//console.log('collide bottom');
						skeleton.y = y - 50;
					}
					
					//console.log(x + ',' + y);
				}	
			}
		}	
	},
	handleInputX: function(){
		if(rightDown && !touchingRight){
			skeleton.x += skeleton.mainSpeed;
		}else if(leftDown && !touchingLeft){
			skeleton.x += -skeleton.mainSpeed;
		}
	},
	collidableBlockExists(y, x){
		if(!blocks.blockArray[y] || !blocks.blockArray[y][x]){
			return false;
		}
		if(blocks.blockArray[y][x] == 0){
			return false;
		}
		return true;
	}
};

skeleton.image.src = './skeleton.png';
skeleton.sprites.normal.index = 0;
skeleton.sprites.normal[0].src = './skeleton.png';
skeleton.sprites.normal[1].src = './skeleton2.png';
skeleton.sprites.normal[2].src = './skeleton3.png';
skeleton.sprites.inverted.src= './skeletonInverted.png';

/*
window.temp = document.createElement('canvas');
window.temp.width = 128;
window.temp.height = 128;
window.temp1 = temp.getContext('2d');
window.temp1.scale(-1, 1);
window.addEventListener('load',function(){
	document.getElementsByTagName('body')[0].appendChild(temp);
	temp1.drawImage(skeleton.image, 0, 0, skeleton.image.width * -1, skeleton.image.height);
	skeleton.sprites.inverted = temp.toDataURL('image/png');
	delete window.temp1;
	delete window.temp;
});
*/
