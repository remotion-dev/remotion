import {bundle} from '@remotion/bundler';
import {webpackOverride} from './src/webpack-override.mjs';
import {renderMedia, selectComposition} from '@remotion/renderer';

const serveUrl = await bundle({
	entryPoint: 'src/index.ts',
	webpackOverride,
});
console.log('Bundled', serveUrl);

const composition = await selectComposition({
	id: 'react-svg',
	serveUrl,
});

console.log('Composition', composition);

await renderMedia({
	codec: 'h264',
	composition,
	serveUrl,
	onProgress: ({progress}) => {
		console.log(progress);
	},
});

console.log('Rendered video');
