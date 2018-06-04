// rollup.config.js
import svelte from 'rollup-plugin-svelte';

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/display-swf.js',
    format: 'iife',
	name: 'n8dNavbar'
  },
  plugins: [
    svelte()
  ]
}