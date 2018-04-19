SASParser.lib['Header'] = class extends SASParser.Parsable {
		constructor(){
			super();
			this.size = (3 + 1 + 4);
		}
		parse(buffer, offset){
			this.magic = '';
			this.compression = 'NONE';
			this.version = buffer[3 + offset];
				
			for(let i = 0; i != 3; i++){
				this.magic += String.fromCharCode(buffer[i + offset]);
			}
				
			switch(this.magic){
				case 'CWS': {
					this.compression = "ZLIB"; //SWF 6 later
					if(!pako){
						throw "Error: Pako not found";
					}
					let compressedBuffer = new Uint8Array(buffer.buffer.slice(8));
					this.buffer = pako.inflate(compressedBuffer);
					break;
				}
				default: {
					throw "Unrecognized Magic Number (" + this.magic + ")!";
				}
			}
				
			this.rawSize = new SASParser.lib['Uint32']().parse(buffer, offset + 4).value;
			//use decompressed buffer
			let sizeRect = new SASParser.lib['Rect']().parse(this.buffer, 0);
			this.width = sizeRect.xMax / 20;
			this.height = sizeRect.yMax / 20;
					
			this.size = sizeRect.size; //new buffer overwrites old, old siezes dont matter
			offset = this.size;
			
			this.frameRate = new SASParser.lib['Fixed8']().parse(this.buffer, offset);
			offset += this.frameRate.size;
			this.size += offset;
			
			this.frameCount = new SASParser.lib['Uint16']().parse(this.buffer, offset);
			offset += this.frameCount.size;
			this.size += offset;
			
			/*return {
				magic, //3 bytes, i = 0
				compression, //Sugar
				version, //1 bytes , i = 3
				decompressedSize, // i = 4
				size
			}*/
			return this;
		}
}