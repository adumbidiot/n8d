// rollup.config.js
import svelte from 'rollup-plugin-svelte';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/n8d-navbar.js',
    format: 'iife',
	name: 'n8dNavbar'
  },
  plugins: [
    svelte()
  ]
}