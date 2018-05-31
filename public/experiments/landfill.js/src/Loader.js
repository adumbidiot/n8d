export class Loader{
	constructor(gameOption){
		this.game = gameOption;
		this.assetLib = {};
		this.assetTypes = {
			img: LoaderImageEntry,
			audio: LoaderAudioEntry
		}
	}
	loadEntitiy(url){
		return new Promise((resolve, reject) => {
			import(url).catch(function(err){
				throw err;
			}).then((module) => {
				resolve(module.default(this.game));
			});
		});
	}
	loadAsset(url, type){
		let resolvedEntry = this.assetTypes[type] || LoaderEntryBase;
		url = this.resolveURL(url);
		this.assetLib[url] = new resolvedEntry(this.game, url);
	}
	getAsset(url){
		url = this.resolveURL(url);
		return this.assetLib[url].data;
	}
	resolveURL(url){
		let a = document.createElement('a');
		a.href = url;
		return a.href;
	}
	allLoaded(){
		if(this.getLoadedNum() === this.getAssetNum()) return true;
		return false
	}
	getAssetNum(){
		return Object.keys(this.assetLib).length;
	}
	getLoadedNum(){
		let num = 0;
		let keys = Object.keys(this.assetLib);
		for(let i = 0; i < keys.length; i++){
			if(this.assetLib[keys[i]].loaded) num++;
		}
		return num;
	}
}

class LoaderEntryBase{
	constructor(game, url){
		this.url = url;
		this.loaded = false;
		//console.log(this.constructor);
	}
}

class LoaderImageEntry extends LoaderEntryBase{
	constructor(game, url){
		super(game, url);
		this.data = new Image();
		this.data.src = url;
		this.data.onload = () => {
			this.loaded = true;
		}
	}
}

class LoaderAudioEntry extends LoaderEntryBase{
	constructor(game, url){
		super(game, url);
		fetch(url).catch((err) => {
			
		}).then((response) => {
			return response.arrayBuffer();
		}).catch((err) => {
			console.error(err);
		}).then((data) => {
			return game.audioManager.decodeAudio(data);
		}).catch((err) => {
			console.error(err);
		}).then((buf) => {
			this.data = buf;
			this.loaded = true;
		});
	}
}