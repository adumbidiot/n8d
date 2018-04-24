class swfFile{
	constructor(){
	}
	load(buffer){
		if(!buffer){
			throw "Error: No buffer to load";	
		}
		this.rawBuffer = new Uint8Array(buffer);
		this.signature = String.fromCharCode(this.rawBuffer[0]) + String.fromCharCode(this.rawBuffer[1]) + String.fromCharCode(this.rawBuffer[2]);
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
				let compressedBuffer = new Uint8Array(this.rawBuffer.buffer.slice(8));
				this.buffer = pako.inflate(compressedBuffer);
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
		
		this.version = this.rawBuffer[3];
		this.decompressedSize = new Uint32Array(this.rawBuffer.buffer.slice(4, 8))[0]; //slice of life
		
		let pIndex = 0; //Byte position of parse
		this.frameSize = this.parseRect(pIndex);
		this.width = this.frameSize.xMax/20;
		this.height = this.frameSize.yMax/20;
		pIndex += this.frameSize.size/8;
		
		this.frameRate = this.parseFixed8(pIndex);
		pIndex += 2;
		
		this.frameCount = this.parseUint16(pIndex);
		pIndex += 2;
		
		this.tags = [];
		
		let cTag = this.parseTag(pIndex);
		for(let i = 0; i != 500 && (cTag.header.code != 0); i++){
			//console.log('Index: ' + pIndex);
			cTag = this.parseTag(pIndex);
			this.tags.push(cTag);
			pIndex += this.tags[this.tags.length-1].size;
		}
		console.log('Parse Complete');
	}
	parseRect(index){
		let nbits = this.buffer[index] >> 3; //uint8 to "uint5"
		let size = (nbits*4) + 5;
		while(size % 8 != 0){
			size++;
		}		
		let xMin = 0;
		let xMax = 0;
		let yMin = 0;
		let yMax = 0;
		
		let bitPos = 5;
				
		for(let i = bitPos; i != nbits + bitPos; i++){
			let byteP = (i/8) | 0;
			let bitP = 7 - (i % 8);
			xMin += ((this.buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
		}
		bitPos += nbits;
		
		for(let i = bitPos; i != nbits + bitPos; i++){
			let byteP = (i/8) | 0;
			let bitP = 7 - (i % 8);
			xMax += ((this.buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
		}
		bitPos += nbits;
		
		for(let i = bitPos; i != nbits + bitPos; i++){
			let byteP = (i/8) | 0;
			let bitP = 7 - (i % 8);
			yMin += ((this.buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
		}
		bitPos += nbits;
		
		for(let i = bitPos; i != nbits + bitPos; i++){
			let byteP = (i/8) | 0;
			let bitP = 7 - (i % 8);
			yMax += ((this.buffer[byteP] >> bitP) & 1) << (14 - (i - bitPos));
		}
		bitPos += nbits;
		
		return {
			nbits: nbits,
			size: size,
			xMin: xMin,
			xMax: xMax,
			yMin: yMin,
			yMax: yMax
		}
	}
	parseFixed8(index){
		let first = this.buffer[index];
		let second = this.buffer[index+1];
		return second;
	}
	parseUint16(index){
		return this.buffer[index] + (this.buffer[index + 1] << 8);
	}
	parseUint32(index){
		return this.buffer[index] + (this.buffer[index + 1] << 8) + (this.buffer[index + 2] << 16) + (this.buffer[index + 3] << 32);
	}
	parseEncodedUint32(index){
		let size = 1;
		let value = this.buffer[index];

		if(this.buffer[index] & 0x80 === 1){
			value = value << 8;
			value += this.buffer[index + 1];
			size++;
			if(this.buffer[index + 1] & 0x080 === 1){
				value = value << 8;
				value += this.buffer[index + 2];
				size++;
			}
		}
		
		return {
			size: size,
			value: value
		}
	}
	parseString(index){
		let value = '';
		let size = 0;
		while(this.buffer[index + size] != 0){
			value += String.fromCharCode(this.buffer[index + size]);
			size++;
		}
		size++;
		
		return {
			value: value,
			size: size
		};
	}
	parseRecordHeader(index){
		let uint = this.parseUint16(index);
		let size = 2;
		let length = uint & (0x3F);
		let long = (length < 0x3F) ? false : true;
		if(long){
			length = this.parseUint32(index + 2);
			size += 4;
		}
		
		return {
			code: uint >> 6,
			length: length,
			long: long,
			size: size,
			_uint16: uint
		}
	}
	parseTag(index){
		let header = this.parseRecordHeader(index);
		let tag = {
			size: header.length
		};
		switch(header.code){
			case 69: {
				tag = this.parseFileAttributes(index + header.size);
				break;
			}
			case 9: {
				tag = this.parseSetBackgroundColor(index + header.size);
				break;
			}
			case 64: {
				tag = this.parseEnableDebugger2(index + header.size);
				break;
			}
			case 86: {
				tag = this.parseDefineSceneAndFrameLabelData(index + header.size);
				break;
			}
			case 45: {
				tag = this.parseSoundStreamHead(index + header.size);
				break;
			}
			case 14: {
				tag = this.parseDefineSound(index + header.size);
				break;
			}
			case 2: {
				//tag = this.parseDefineShape(index + header.size);
				break;
			}
		}
		tag.header = header;
		tag.size += header.size; //Length in header + size of header == sizeof tag
		return tag;
	}
	parseFileAttributes(index){
		let byte1 = this.buffer[index];
		
		return {
			useDirectBlit: (byte1 & 64) >> 6,
			useGPU: (byte1 & 32) >> 5,
			hasMetadata: (byte1 & 16) >> 4,
			actionScript3: (byte1 & 8) >> 3,
			noCrossDomainCache: (byte1 & 4) >> 2,
			useNetwork: byte1 & 1,
			size: 4
		};
	}
	parseSetBackgroundColor(index){
		return {
			R: this.buffer[index],
			G: this.buffer[index + 1],
			B: this.buffer[index + 2],
			size: 3
		}
	}
	parseEnableDebugger2(index){
		let passwordHash = this.parseString(index + 2);
		let size = 2 + passwordHash.size;
		
		return {
			size: size,
			passwordHash: passwordHash.value
		};
	}
	parseDefineSceneAndFrameLabelData(index){
		let size = 0;
		let sCount = this.parseEncodedUint32(index);
		let sOffset = this.parseEncodedUint32(index + sCount.size);
		let sName = this.parseString(index + sCount.size + sOffset.size);
		let fLabelCount = this.parseEncodedUint32(index+ sCount.size + sOffset.size + sName.size);
		
		let sceneCount = sCount.value;
		let sceneOffset = sOffset.value;
		let sceneName = sName.value;
		let frameLabelCount = fLabelCount.value;
		
		size += sCount.size;
		size += sOffset.size;
		size += sName.size;
		size += fLabelCount.size;
		
		
		return {
			sceneCount: sceneCount,
			sceneOffset: sceneOffset,
			sceneName: sceneName,
			frameLabelCount: frameLabelCount,
			size: size
		}
	}
	parseSoundStreamHead(index){
		let size = 0;
		let byte1 = this.buffer[index];
		size +=1;
		
		let byte2 = this.buffer[index];
		size +=1;
		
		let uint = this.parseUint16(index + size);
		size += 2;
		
		//TODO: Latency Seek

		return {
			playBackSoundRate: (byte1 >> 2) & 3,
			playBackSoundSize: (byte1 >> 1) & 1,
			playBackSoundType: (byte1 & 1),
			streamSoundCompression: (byte2 >> 4),
			streamSoundRate: (byte2 >> 2) & 3,
			streamSoundSize: (byte2 >> 1) & 1,
			streamSoundType: (byte2 & 1),
			streamSoundSampleCount: uint,
			size: size
		};
	}
	parseDefineSound(index){
		let size = 0;
		
		let soundID = this.parseUint16(index);
		size += 2;
		
		let byte1 = this.buffer[index + size];
		size += 1;
		
		let soundFormat = byte1 >> 4;
		let soundRate = (byte1 >> 2) & 3;
		let soundSize = (byte1 >> 1) & 1;
		let soundType = byte1 & 1;
		
		let soundSampleCount = this.parseUint32(index + size);
		size += 4;
		
		return {
			soundID,
			soundFormat,
			soundRate,
			soundSize,
			soundType,
			soundSampleCount,
			size
		}
	}
	parseDefineShape(index){
		let size = 0;
		let id = this.parseUint16(index);
		size += 2;
		
		let shapeBounds = this.parseRect(index + size);
		
		return {
			id: id,
			shapeBounds: shapeBounds,
			size: size
		}
	}
}
