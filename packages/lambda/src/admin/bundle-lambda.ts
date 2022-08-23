import {BundlerInternals} from '@remotion/bundler';
import fs from 'fs';
import path from 'path';
import {quit} from '../cli/helpers/quit';
import {FUNCTION_ZIP} from '../shared/function-zip-path';
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
	});

	await zl.archiveFolder(outdir, FUNCTION_ZIP);
	fs.unlinkSync(outfile);
};

bundleLambda()
	.then(() => {
		console.log('Lambda bundled');
	})
	.catch((err) => {
		console.log(err);
		quit(1);
	});
