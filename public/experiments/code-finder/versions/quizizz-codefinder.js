class quizizzCodefinder extends HTMLElement {
	static is(){
		return "quizizz-codefinder";
	}
	constructor(){
		super();
					
		this.shadow = this.attachShadow({mode: 'open'});
					
		let style = document.createElement('style');
		style.innerHTML = '@import url(quizizz.css);';
		this.shadow.appendChild(style);
				
		this.main = document.createElement('div');
		this.main.id = 'main';
		this.shadow.appendChild(this.main);
					
		this.toggle = document.createElement('div');
		this.toggle.id = 'toggle';
		this.toggle.className = 'toggle-start';
		this.toggle.innerHTML = 'Start';
		this.toggle.onclick = () => {
			if(this.codeFinder.isPaused()){
				this.codeFinder.go();
				this.toggle.className = 'toggle-pause';
				this.toggle.innerHTML = 'Pause';
			}else{
				this.codeFinder.stop();
				this.toggle.className = 'toggle-start';
				this.toggle.innerHTML = 'Start';
			}
		}
		this.shadow.appendChild(this.toggle);
					
		this.codeDisplay = document.createElement('div');
		this.codeDisplay.id = 'code-display';
		this.codeDisplay.innerHTML = 'Press Start...';
		this.shadow.appendChild(this.codeDisplay);
		this.initCodeFinder();
	}
	initCodeFinder(){
		if(!codeFinder){
			throw "codeFinder must be defined"; //TODO: Combine in single file
		}
		if(!io){
			throw "io must be defined"; //TODO: Move to codefinder
		}
		this.codeFinder = new codeFinder({pause: true, pauseOnCode: true, maxConnections: 10});
		this.codeFinder.oncode = (code) => {
			this.codeDisplay.innerHTML = code;
			this.toggle.className = 'toggle-start';
			this.toggle.innerHTML = 'Start';
		}
	}
}
customElements.define(quizizzCodefinder.is(), quizizzCodefinder);