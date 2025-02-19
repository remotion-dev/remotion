import {BundlerInternals} from '@remotion/bundler';
import {execSync} from 'child_process';
import {copyFileSync, mkdirSync, rmSync} from 'fs';
import path from 'path';

export const hasGTar = () => {
	try {
		const output = execSync('gtar --usage', {});
		return output.includes('--sort');
	} catch {
		return false;
	}
};

export const bundleInstaller = async () => {
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

	const tarArgs = `-cf ../gcpInstaller/gcpInstaller.tar -C . ${path.relative(
		outdir,
		bundlemjs,
	)} ${path.relative(outdir, tfoutfile)} ${path.relative(
		outdir,
		sapermissionsoutfile,
	)}`;

	// A reproducible build will lead to no pending change in Git
	if (hasGTar()) {
		console.time('Made reproducible build with gtar');
		execSync(
			`gtar --mtime='2023-01-01 00:00Z' --sort=name --owner=0 --group=0 --numeric-owner --pax-option=exthdr.name=%d/PaxHeaders/%f,delete=atime,delete=ctime ${tarArgs}`,
			{
				stdio: 'inherit',
				cwd: outdir,
			},
		);
		console.timeEnd('Made reproducible build with gtar');
	} else {
		console.time('Made non-reproducible build with tar.');
		execSync(`tar ${tarArgs}`, {
			stdio: 'inherit',
			cwd: outdir,
		});
		console.timeEnd('Made non-reproducible build with tar.');
	}

	rmSync(outdir, {recursive: true});
};
