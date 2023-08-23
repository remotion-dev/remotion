import {BundlerInternals} from '@remotion/bundler';
import {execSync} from 'child_process';
import {copyFileSync, mkdirSync, rmSync} from 'fs';
import path from 'path';

const bundleInstaller = async () => {
	const outdir = path.join(__dirname, '..', `build-installer`);
	mkdirSync(outdir, {recursive: true});

	const bundlemjs = path.join(outdir, 'install.mjs');
	await BundlerInternals.esbuild.build({
		platform: 'node',
		target: 'node18',
		bundle: true,
		outfile: bundlemjs,
		format: 'esm',
		entryPoints: [path.resolve(__dirname, '../gcpInstaller/install.mts')],
	});

	const tfoutfile = path.join(outdir, 'main.tf');
	copyFileSync(path.resolve(__dirname, '../gcpInstaller/main.tf'), tfoutfile);

	const sapermissionsoutfile = path.join(outdir, 'sa-permissions.json');
	copyFileSync(
		path.resolve(__dirname, '../shared/sa-permissions.json'),
		sapermissionsoutfile,
	);

	execSync(
		`tar -cf ../gcpInstaller/gcpInstaller.tar -C . ${path.relative(
			outdir,
			bundlemjs,
		)} ${path.relative(outdir, tfoutfile)} ${path.relative(
			outdir,
			sapermissionsoutfile,
		)}`,
		{
			stdio: 'inherit',
			cwd: outdir,
		},
	);
	rmSync(outdir, {recursive: true});
};

bundleInstaller();
