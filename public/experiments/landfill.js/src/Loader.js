export class Loader{
	constructor(game){
		this.game = game;
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
		this.assetLib[url] = new resolvedEntry(url);
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
		let keys = Object.keys(this.assetLib);
		for(let i = 0; i < keys.length; i++){
			//console.log(this.assetLib[keys[i]].loaded);
			if(!this.assetLib[keys[i]].loaded) return false;
		}
		return true;
	}
}

class LoaderEntryBase{
	constructor(url){
		this.url = url;
		this.loaded = false;
		console.log(this.constructor);
	}
}

class LoaderImageEntry extends LoaderEntryBase{
	constructor(url){
		super(url);
		this.data = new Image();
		this.data.src = url;
		this.data.onload = () => {
			this.loaded = true;
		}
	}
}

class LoaderAudioEntry extends LoaderEntryBase{
	constructor(url){
		super(url);
		this.data = new Audio(url);
		this.loaded = true;
	}
}