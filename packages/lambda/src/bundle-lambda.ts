import fs from 'fs';
import path from 'path';
import esbuild = require('esbuild');
import zl = require('zip-lib');

export const bundleLambda = async () => {
	const outdir = path.join(__dirname, '..', 'build');
	fs.mkdirSync(outdir, {
		recursive: true,
	});
	const outfile = path.join(outdir, 'index.js');
	const template = path.join(__dirname, '..', 'template', 'render.ts');

	await esbuild.build({
		platform: 'node',
		bundle: true,
		outfile,
		entryPoints: [template],
	});

	return zl.archiveFolder(outdir, 'function.zip');
};
