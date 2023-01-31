import {BundlerInternals} from '@remotion/bundler';
import {binaryPath as x64BinaryPath} from '@remotion/compositor-linux-x64-musl';
import fs from 'fs';
import path from 'path';
import zl = require('zip-lib');

const bundleLambda = async () => {
	const outdir = path.join(__dirname, '..', 'container', '/', 'dist');
	fs.mkdirSync(outdir, {
		recursive: true,
	});
	const outfile = path.join(outdir, 'index.js');

	(fs.rmSync ?? fs.rmdirSync)(outdir, {recursive: true});
	fs.mkdirSync(outdir, {recursive: true});
	const template = require.resolve(
		path.join(__dirname, 'index')
	);

	await BundlerInternals.esbuild.build({
		platform: 'node',
		target: 'node14',
		bundle: true,
		outfile,
		entryPoints: [template],
		treeShaking: true,
		external: ['./compositor', './compositor.exe'],
	});

	const compositorFile = `${outdir}/compositor`;

	fs.copyFileSync(x64BinaryPath, compositorFile);
};

bundleLambda()
	.then(() => {
		console.log('Lambda bundled for gcp');
	})
	.catch((err) => {
		console.log(err);
		process.exit(1);
	});
