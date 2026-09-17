import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'bun';
import rootPackage from '../../package.json';
import remotionPackage from '../core/package.json';

if (process.env.NODE_ENV !== 'production') {
	throw new Error('This script must be run using NODE_ENV=production');
}

const define = {
	__BROWSER_BUNDLER_DEPENDENCY_VERSIONS__: JSON.stringify({
		react: rootPackage.workspaces.catalog.react,
		'react-dom': rootPackage.workspaces.catalog['react-dom'],
		remotion: remotionPackage.version,
	}),
};

const output = await build({
	entrypoints: ['src/index.ts', 'src/runtime.ts', 'src/compiler.ts'],
	naming: '[name].js',
	outdir: 'dist',
	target: 'browser',
	define,
	external: [
		'@rspack/browser',
		'react',
		'react-dom',
		'react-dom/client',
		'react/jsx-runtime',
		'react/jsx-dev-runtime',
		'remotion',
		'remotion/no-react',
		'remotion/version',
	],
});

if (!output.success) {
	throw new Error(output.logs.join('\n'));
}

// Ship Rspack's runtime as part of the worker. Consumers should not have to
// rebundle its generated module loader or know its internal dependency graph.
const workerOutput = await build({
	entrypoints: ['src/browser-bundler-worker.ts'],
	naming: '[name].js',
	outdir: 'dist',
	target: 'browser',
	minify: true,
	define,
});
if (!workerOutput.success) {
	throw new Error(workerOutput.logs.join('\n'));
}

const rspackDir = path.dirname(
	fileURLToPath(import.meta.resolve('@rspack/browser')),
);
for (const asset of [
	'rspack.wasm32-wasi.wasm',
	'wasi-worker-browser.mjs',
	'wasi-worker-browser.mjs.LICENSE.txt',
	'index.js.LICENSE.txt',
]) {
	await Bun.write(
		path.join('dist', asset),
		Bun.file(path.join(rspackDir, asset)),
	);
}
