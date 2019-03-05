import svelte from 'rollup-plugin-svelte';

export default {
	input: 'src/main.js',
	output: {
		file: 'CodeFinder.js',
		format: 'umd',
		name: 'CodeFinder'
	},
	plugins: [
		svelte(),
	],
};