import svelte from 'rollup-plugin-svelte'
export default {
  input: 'src/main.js',
  plugins: [
		svelte({

		})
	],
	output: {
	  file: 'dist/n8d-experiments.js',
	  name: 'N8DExperiments',
	  format: 'iife'	  
  }
}