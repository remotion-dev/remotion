import {BundlerInternals} from '@remotion/bundler';
import {binaryPath as armBinaryPath} from '@remotion/compositor-linux-arm64-musl';
import fs from 'fs';
import path from 'path';
import {quit} from '../cli/helpers/quit';
import {FUNCTION_ZIP_ARM64} from '../shared/function-zip-path';
import zl = require('zip-lib');

const bundleLambda = async () => {
	const outdir = path.join(__dirname, '..', `build-render`);
	fs.mkdirSync(outdir, {
		recursive: true,
	});
	const outfile = path.join(outdir, 'index.js');

	(fs.rmSync ?? fs.rmdirSync)(outdir, {recursive: true});
	fs.mkdirSync(outdir, {recursive: true});
	const template = require.resolve(
		path.join(__dirname, '..', 'functions', 'index')
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
	fs.copyFileSync(armBinaryPath, compositorFile);
	await zl.archiveFolder(outdir, FUNCTION_ZIP_ARM64);

	fs.unlinkSync(compositorFile);
	fs.unlinkSync(outfile);
};

bundleLambda()
	.then(() => {
		console.log('Bundled Lambda');
	})
	.catch((err) => {
		console.log(err);
		quit(1);
	});
