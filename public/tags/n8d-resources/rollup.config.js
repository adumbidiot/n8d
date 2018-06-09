import svelte from 'rollup-plugin-svelte'
export default {
  input: 'src/main.js',
  plugins: [
		svelte({
			customElement: true
		})
	],
	output: {
	  file: 'dist/n8d-resources.js',
	  name: 'N8DResources',
	  format: 'iife'	  
  }
}