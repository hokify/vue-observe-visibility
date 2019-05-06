import base from './rollup.config.base'

const config = Object.assign({}, base, {
	output: {
		file: 'dist/vue-observe-visibility.umd.js',
		format: 'umd',
		name: 'VueObserveVisibility',
		exports: 'named',
	},
})

export default config
