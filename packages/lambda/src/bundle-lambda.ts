import fs from 'fs';
import path from 'path';
import esbuild = require('esbuild');
import zl = require('zip-lib');

export const bundleLambda = async (type: 'render') => {
	const outdir = path.join(__dirname, '..', `build-${type}`);
	fs.mkdirSync(outdir, {
		recursive: true,
	});
	const outfile = path.join(outdir, 'index.js');

	(fs.rmSync ?? fs.rmdirSync)(outdir, {recursive: true});
	fs.mkdirSync(outdir, {recursive: true});
	const template = path.join(__dirname, '..', 'src', 'functions', 'index.ts');

	await esbuild.build({
		platform: 'node',
		target: 'node12',
		bundle: true,
		outfile,
		entryPoints: [template],
	});

	const out = path.join(process.cwd(), `function-${type}.zip`);
	await zl.archiveFolder(outdir, out);
	return out;
};
