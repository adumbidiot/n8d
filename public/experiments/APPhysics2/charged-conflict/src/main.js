import * as landfill from '../../../../landfill.js/dist/landfill.js';
export let VERSION = '0.0.1';
export class Game{
	constructor(opts){
		opts.entities = [
			'../custom/ChargeParent.js',
			'../custom/Charge.js',
			'../custom/LoadingScreen.js'
		];
		this.engine = new landfill.Game(opts);
	}
}
export {landfill};