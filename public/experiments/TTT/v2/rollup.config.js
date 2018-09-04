import svelte from 'rollup-plugin-svelte';

export default[
	{
		input: 'src/main.js',
		output: {
			name: 'TTT',
			file: 'dist/TTT.js',
			format: 'iife'
		}
	},
	{
		input: 'src/gui.js',
		output: {
			name: 'TTTGUI',
			file: 'dist/TTTGUI.js',
			format: 'iife'
		},
		plugins: [
			svelte({
				customElement: true
			})
		]
	}
]
