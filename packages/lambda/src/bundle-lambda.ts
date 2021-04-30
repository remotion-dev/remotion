import fs from 'fs';
import path from 'path';
import esbuild = require('esbuild');
import zl = require('zip-lib');

const copy = function (src: string, dest: string) {
	fs.copyFileSync(src, dest);
};

const copyDir = function (src: string, dest: string): void {
	fs.mkdirSync(dest, {recursive: true});
	const files = fs.readdirSync(src);
	for (let i = 0; i < files.length; i++) {
		const current = fs.lstatSync(path.join(src, files[i]));
		if (current.isDirectory()) {
			copyDir(path.join(src, files[i]), path.join(dest, files[i]));
		} else if (current.isSymbolicLink()) {
			const symlink = fs.readlinkSync(path.join(src, files[i]));
			fs.symlinkSync(symlink, path.join(dest, files[i]));
		} else {
			copy(path.join(src, files[i]), path.join(dest, files[i]));
		}
	}
};

export const bundleLambda = async (type: 'render') => {
	const outdir = path.join(__dirname, '..', `build-${type}`);
	fs.mkdirSync(outdir, {
		recursive: true,
	});
	const outfile = path.join(outdir, 'index.js');

	fs.rmdirSync(outdir, {recursive: true});
	fs.mkdirSync(outdir, {recursive: true});
	const template = path.join(__dirname, '..', 'template', 'render.ts');

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
