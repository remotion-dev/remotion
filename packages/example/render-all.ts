import {bundle} from '@remotion/bundler';
import {getCompositions, renderMedia} from '@remotion/renderer';
import {webpackOverride} from './src/webpack-override.mjs';

const start = async () => {
	const bundled = await bundle({
		entryPoint: require.resolve('./src/index.ts'),
		webpackOverride,
	});

	const compositions = await getCompositions(bundled);

	for (const composition of compositions) {
		console.log(`Rendering ${composition.id}...`);
		await renderMedia({
			codec: 'h264',
			composition,
			serveUrl: bundled,
			outputLocation: `out/${composition.id}.mp4`,
		});
	}
};

start()
	.then(() => {
		process.exit(0);
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
