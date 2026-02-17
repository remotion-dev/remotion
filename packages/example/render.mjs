import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);

const bundled = await bundle({
	entryPoint: require.resolve('./src/index.ts'),
	// If you have a webpack override in remotion.config.ts, pass it here as well.
	webpackOverride: (config) => config,
});

const inputProps = {};

const composition = await selectComposition({
	serveUrl: bundled,
	id: 'MyComp',
	inputProps,
});

console.log('Starting to render composition');

await renderMedia({
	codec: 'h264',
	composition,
	serveUrl: bundled,
	outputLocation: `out/${composition.id}.mp4`,
	chromiumOptions: {
		enableMultiProcessOnLinux: true,
	},
	inputProps,
});

console.log(`Rendered composition ${composition.id}.`);
