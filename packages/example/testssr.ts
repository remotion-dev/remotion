import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {webpackOverride} from './src/webpack-override.mjs';

const serveUrl = await bundle({
	entryPoint: 'src/index.ts',
	webpackOverride,
});
console.log('Bundled', serveUrl);

const composition = await selectComposition({
	id: 'OffthreadRemoteVideo',
	serveUrl,
});

console.log('Composition', composition);

await renderStill({
	composition,
	serveUrl,
}).catch((err) => {
	console.log({err});
});

console.log('Rendered still');
