import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import {createRequire} from 'module';
import {webpackOverride} from './src/webpack-override.mjs';

process.title = 'debugleak';

const require = createRequire(import.meta.url);

const bundled = await bundle({
	entryPoint: require.resolve('./src/index.ts'),
	webpackOverride,
});

const composition = await selectComposition({
	serveUrl: bundled,
	id: 'nested',
});

const instance = openBrowser('chrome', {chromiumOptions: {headless: true}});

for (let i = 0; i < 100; i++) {
	const buf = await renderStill({
		composition,
		serveUrl: bundled,
		output: 'out.png',
		chromiumOptions: {},
		puppeteerInstance: await instance,
	});
	console.log('rendered', i);
}
console.log('done');
