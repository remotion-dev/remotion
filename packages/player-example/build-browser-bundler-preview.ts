import {build} from 'bun';

const result = await build({
	entrypoints: ['src/browser-bundler-preview/entry.ts'],
	define: {'process.env.NODE_ENV': JSON.stringify('development')},
	format: 'iife',
	target: 'browser',
	minify: true,
	naming: 'browser-bundler-preview.js',
	outdir: 'public',
});

if (!result.success) {
	throw new AggregateError(result.logs, 'Could not build the Player preview.');
}
