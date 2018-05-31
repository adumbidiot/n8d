export class AudioManager{
	constructor(){
		let AudioContext = window.AudioContext || window.webkitAudioContext;
		this.context = new AudioContext();
		this.sounds = [];
	}
	play(buffer){
		let source = this.context.createBufferSource();
		source.buffer = buffer;
		source.connect(this.context.destination);
		source.start(0);
		console.log('s');
		this.sounds.push(source);
	}
	stopAll(){
		for(let i = 0; i != this.sounds.length; i++){
			this.sounds[i].stop();
		}
	}
	decodeAudio(buf){
		return new Promise((resolve, reject) => {
			this.context.decodeAudioData(buf, function(buffer){
				resolve(buffer);
			});
		});
	}
}