export default {
	input: 'src/main.js',
	external: ['pako'],
	output: {
		file: 'SWFTools.js',
		name: 'SWFTools',
		format: 'umd',
		paths: {
			pako: 'cdnjs.cloudflare.com/ajax/libs/pako/1.0.6/pako.js'
		},
		globals: {pako: 'pako'}
	}
}