import fs from 'fs';
import path from 'path';
import esbuild = require('esbuild');

export const bundleLambda = async () => {
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

	await esbuild.build({
		platform: 'node',
		target: 'node14',
		bundle: true,
		outfile,
		entryPoints: [template],
	});

	return outfile;
};
