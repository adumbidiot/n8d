window.swfFile = function(buffer){
	let self = this;
	this.buffer = new Uint8Array();
	this.signature = "";
	this.compression = "";
	this.decompressedBuffer = null;
	this.dBitArray = "";
	this.version = 0x00;
	this.decompressedSize = new Uint32Array();
	this.frameSize;
	this.width;
	this.dBitArray = {
		getByte: function(index){
			var tot = "";
			for(var i = 0; i != 8; i++){
				tot += this.store[index + i];
			}
			return parseInt(tot, 2);	
		},
		getRect: function(index){
			return new self.Rect(this.store, index);
		},
		getFixed8: function(index){
			let dec = this.getByte(index);
			let whole = this.getByte(index + 8);
			return parseFloat(whole + dec);
		},
		getUint16: function(index){
			var tot = "";
			tot += this.getByte(index + 8).toString();
			tot += this.getByte(index).toString();
			return parseInt(tot, 2);
		},
		load: function(array){
			this.store = new Uint8Array(array.length * 8);
			for(var i = 0; i != this.store.length; i++){
				for(var j = 0; j != 8; j++){
					this.store[(i * 8) - j + 7] = (array[i] >> j) & 1;
				}
			}
		}	
	};
	if(!buffer){
		//Handle no buffer code here
		return;	
	}
	this.load(buffer);

	//Continue
}

window.swfFile.prototype.load = function(buffer){
	if(!buffer){
		throw "Error: No buffer to load";	
	}
	this.buffer = new Uint8Array(buffer);
	this.signature = String.fromCharCode(this.buffer[0]) + String.fromCharCode(this.buffer[1]) + String.fromCharCode(this.buffer[2]);
	switch(this.signature){
		case "FWS": {
			this.compression = "NONE";
			break;
		}
		case "CWS": {
			this.compression = "ZLIB"; //SWF 6 later
			if(!pako){
				throw "Error: Pako not found";
			}
			let compressedBuffer = new Uint8Array(this.buffer.buffer.slice(8));
			this.decompressedBuffer = pako.inflate(compressedBuffer);

			/*for(var i = 0; i != this.decompressedBuffer.length; i++){
				this.BitArray += this.decompressedBuffer[i].toString(2);	
			}*/

			this.dBitArray.load(this.decompressedBuffer);
			break;
		}
		case "ZWS": {
			this.compression = "LZMA"; //SWF 13 later
			throw "Error: No support for LZMA compression"
			break;
		}
		default: {
			throw "Error: Unknown Signature: " + this.signature; //Probably bad file
		}
	}	

	this.version = this.buffer[3];
	this.decompressedSize = new Uint32Array(this.buffer.buffer.slice(4, 8))[0]; //TODO: Cast to uint32 better
	
	let pIndex = 0;
	this.frameSize = this.dBitArray.getRect(pIndex);
	pIndex += this.frameSize.size;

	this.width = this.frameSize.xMax/20;
	this.height = this.frameSize.yMax/20;
	
	while(pIndex % 8 != 0){ //Fixed requires byte alignment
		pIndex++;
	}
	this.frameRate = this.dBitArray.getFixed8(pIndex);
	pIndex += 16;

	this.frameCount = this.dBitArray.getUint16(pIndex);
	pIndex += 16;
	//Header Parse End
	console.log(pIndex);
	//Tag Parse Begin
	new this.Tag(this.dBitArray.store, pIndex);
}

window.swfFile.prototype.Rect = function(array, index){
	this.nBits = 0;
	this.xMin = 0;
	this.xMax = 0;
	this.yMin = 0;
	this.yMax = 0;
	this.size = 5;

	for(var i = 0; i != 5; i++){
		this.nBits += array[i].toString();	
	}
	this.nBits = parseInt(this.nBits, 2);
	
	for(var i = 5; i != this.nBits + 5; i++){
		this.xMin += array[i].toString();
		this.xMax += array[i + this.nBits].toString();
		this.yMin += array[i + (2 * this.nBits)].toString();
		this.yMax += array[i + (3 * this.nBits)].toString();
	}

	this.xMin = parseInt(this.xMin, 2);
	this.xMax= parseInt(this.xMax, 2);
	this.yMin= parseInt(this.yMin, 2);
	this.yMax= parseInt(this.yMax, 2);
	this.size += 5 + (4 * this.nBits);
}

window.swfFile.prototype.Tag = function(array, index){
	let tot = "";
	let word = ["","","",""];
	
	for(var i = 0; i != 4; i++){
		word[2] += array[i + index].toString();
	}
	
	for(var i = 0; i != 4; i++){
		word[3] += array[i + index + 4].toString();
	}

	for(var i = 0; i != 4; i++){
		word[0] += array[i + index + 8].toString();
	}
	
	for(var i = 0; i != 4; i++){
		word[1] += array[i + index + 12].toString();
	}
	tot = word.join("");
	console.log(word);
	console.log(tot);
	let a = "";
	for(var i = 0; i != 10; i++){
		a += tot[i];
	}
	console.log(a);
	console.log(parseInt(a, 2));
}



//Load dependecies

if(!window.pako){
	throw "Error: Pako is not loaded";
}

//window.onload = function(){console.log("window loaded")}



