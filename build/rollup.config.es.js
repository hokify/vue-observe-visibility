import base from './rollup.config.base'

const config = Object.assign({}, base, {
	output: {
		file: 'dist/vue-observe-visibility.esm.js',
		format: 'es',
		name: 'VueObserveVisibility',
		exports: 'named',
	},
})

export default config
