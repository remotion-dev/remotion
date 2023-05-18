import {BundlerInternals} from '@remotion/bundler';
import {execSync} from 'child_process';
import {copyFileSync, mkdirSync, rmSync} from 'fs';
import path from 'path';

const bundleInstaller = async () => {
	const outdir = path.join(__dirname, '..', `build-installer`);
	mkdirSync(outdir, {recursive: true});

	const bundlemjs = path.join(outdir, 'bundled.mjs');
	await BundlerInternals.esbuild.build({
		platform: 'node',
		target: 'node18',
		bundle: true,
		outfile: bundlemjs,
		format: 'esm',
		entryPoints: [path.resolve(__dirname, '../../gcpInstaller/install.mts')],
	});

	const tfoutfile = path.join(outdir, 'main.tf');
	copyFileSync(
		path.resolve(__dirname, '../../gcpInstaller/main.tf'),
		tfoutfile
	);

	execSync(
		`tar -cf ../../gcpInstaller/gcpInstaller.tar -C . ${path.relative(
			outdir,
			bundlemjs
		)} ${path.relative(outdir, tfoutfile)}`,
		{
			stdio: 'inherit',
			cwd: outdir,
		}
	);
	rmSync(outdir, {recursive: true});
};

bundleInstaller();
