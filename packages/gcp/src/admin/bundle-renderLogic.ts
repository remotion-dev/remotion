import {BundlerInternals} from '@remotion/bundler';
import {binaryPath as x64BinaryPath} from '@remotion/compositor-linux-x64-musl';
import fs from 'fs';
import path from 'path';
import zl = require('zip-lib');

const bundleRenderLogic = async () => {
	let renderTypeParam = process.argv[2];

	if (renderTypeParam === undefined) {
		throw new Error('renderTypeParam is undefined');
	}

	if (renderTypeParam !== 'renderStill' && renderTypeParam !== 'renderMedia') {
		throw new Error('renderTypeParam must be either renderStill or renderMedia');
	}

	const outdir = path.join(__dirname, '../../containers/', renderTypeParam, '/dist');
	fs.mkdirSync(outdir, {
		recursive: true,
	});
	const outfile = path.join(outdir, 'index.js');

	(fs.rmSync ?? fs.rmdirSync)(outdir, {recursive: true});
	fs.mkdirSync(outdir, {recursive: true});
	const template = require.resolve(
		path.join(__dirname, '../index')
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

	console.log(renderTypeParam + ' bundled.');
};

bundleRenderLogic()
