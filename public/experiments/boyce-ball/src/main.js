import * as landfill from '../../landfill.js/dist/landfill.js';
export let VERSION = '0.0.1';
export class Game{
	constructor(opts){
		opts.entities = [
			'./custom/LoadingScreen.js',
			'./custom/GameScreen.js'
		];
		this.engine = new landfill.Game(opts);
	}
}
export {landfill};