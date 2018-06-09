// rollup.config.js
import svelte from 'rollup-plugin-svelte';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/n8d-navbar.js',
    format: 'iife',
	name: 'N8DNavbar'
  },
  plugins: [
    svelte({
	
	})
  ]
}