import {bundle} from '@remotion/bundler';
import {renderMedia} from '@remotion/renderer';
import {getCompositionsFromBundle} from '@remotion/renderer/src/get-compositions-from-bundle';
import {webpackOverride} from './webpack-override';

const start = async () => {
	const clientBundle = await bundle({
		entryPoint: require.resolve('./index'),
		webpackOverride,
		runtime: 'browser',
	});
	const nodeBundle = await bundle({
		entryPoint: require.resolve('./index'),
		webpackOverride,
		runtime: 'browser',
	});

	const comps = getCompositionsFromBundle(nodeBundle, {});

	const comp = comps.find((c) => c.id === 'layers');

	if (!comp) {
		throw new Error('Composition not found');
	}

	await renderMedia({
		composition: comp,
		codec: 'h264',
		serveUrl: {
			browserUrl: clientBundle,
			nodeUrl: nodeBundle,
		},
	});
};

start();
