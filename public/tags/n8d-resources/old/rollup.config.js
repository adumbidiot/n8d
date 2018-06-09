import riot  from 'rollup-plugin-riot'
export default {
  input: 'src/main.js',
  plugins: [
		riot({
			ext: 'tag.html'
		})
	],
	external: ['riot'],
	output: {
	  file: 'dist/n8d-resources.js',
	  format: 'iife',
	  globals: {
		  riot: 'riot'
	  },
	  
  }
}