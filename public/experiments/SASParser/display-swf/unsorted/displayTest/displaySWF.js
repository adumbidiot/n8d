/*
*	Display a swf from SWFTools nicely. Requires SWFTools.
*/
let DisplaySWFTemplate = document.createElement('template');
DisplaySWFTemplate.innerHTML = `
		<div style="width: 640px; height: 450px; border-radius: 40px; background-color: black;">
			<div style="position: absolute; width: 320px; left: 160px; height: 20px; top: 215px;">
				<input id="filename-input" style="width: 70%; height: 100%; display: inline;">
				<button style="width: 20%; height: 100%; background-color: green; display: inline; user-select: none;" id="load">Load</button>
			</div>
		</div>
`;


class DisplaySWF extends HTMLElement {
	static is(){
		return 'display-swf';
	}
	static get observedAttributes() {
      return ['src'];
    }
	get src(){
		return this.getAttribute('src');
	}
	constructor(){
		super();
		this.parser = new SWFTools.SWFParser();
		
		let main = document.createElement('div');
		main.style.cssText = '';
		
		let filenameInput = document.createElement('input');
		filenameInput.type = 'text';
		filenameInput.style.cssText = 'position: absolute; width: 320px; left: 160; height: 20px; top: 215px;';
		filenameInput.value = this.filename;
		main.appendChild(filenameInput);
		
		this.shadow = this.attachShadow({mode: 'open'});
	}
	connectedCallback() {
		let content = DisplaySWFTemplate.content.cloneNode(true);
		this.input = content.querySelector('#filename-input');
		this.input.value = this.src;
		content.querySelector('#load').addEventListener('click', () =>{
			console.log(this.input.value);
			SWFTools.fetchAndParse(this.parser, this.input.value);
			console.log('loading..');
		});
		this.shadow.appendChild(content);
		
	}
}

customElements.define(DisplaySWF.is(), DisplaySWF);