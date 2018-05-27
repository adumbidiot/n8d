import * as landfill from '../../landfill.js/dist/landfill.js';
export let VERSION = '0.0.1';
export class Game{
	constructor(opts){
		opts.entities = [
			'./custom/LoadingScreen.js',
			'./custom/GameBackground.js',
			'./custom/FPSCounter.js',
			'./custom/GameScreen.js',
			'./custom/Paddle.js',
			'./custom/StatsScreen.js',
			'./custom/Ball.js'
		];
		opts.assets = [
			{url: 'jacob.png', type: 'img'},
			{url: 'jacob1.png', type: 'img'},
			{url: 'jacob2.png', type: 'img'},
			{url: 'stock-photo-cyber-internet-robot-hacker-hacking-into-a-computer-to-steal-personal-data.png', type: 'img'},
			{url: 'jacob_says.png', type: 'img'},
			{url: 'Chill beat.m4a', type: 'audio'}
		];
		this.engine = new landfill.Game(opts);
		this.engine.log = function(str){
			console.log(str);
		}
	}
}
export {landfill};