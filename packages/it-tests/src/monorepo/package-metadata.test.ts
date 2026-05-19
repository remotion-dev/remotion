import {expect, test} from 'bun:test';
import {writeFileSync} from 'fs';
import {join} from 'path';
import {Pkgs, apiDocs, descriptions} from '@remotion/studio-shared';
import {getAllPackages, updatePackageJson} from './get-all-packages';

test('All packages should have a repository field', () => {
	const dirs = getAllPackages();

	expect(dirs.length).toBeGreaterThan(0);

	for (const {pkg, path} of dirs) {
		updatePackageJson(path, (data) => {
			return {
				...data,
				repository: {
					url: `https://github.com/remotion-dev/remotion/tree/main/packages/${pkg}`,
				},
			};
		});
	}
});

test('All packages should have a homepage field', () => {
	const dirs = getAllPackages();

	expect(dirs.length).toBeGreaterThan(0);

	for (const {pkg, path} of dirs) {
		const homepage = apiDocs[pkg as Pkgs];
		updatePackageJson(path, (data) => {
			return {
				...data,
				homepage: homepage ?? undefined,
			};
		});
	}
});

test('All packages should have a description field', () => {
	const dirs = getAllPackages();

	expect(dirs.length).toBeGreaterThan(0);

	for (const {pkg, path} of dirs) {
		const description = descriptions[pkg as Pkgs];
		if (description === undefined) {
			throw new Error(`No description for ${pkg}`);
		}
		updatePackageJson(path, (data) => {
			return {
				...data,
				description: description ?? undefined,
			};
		});
	}
});

test('All packages should have a README.md file', () => {
	const dirs = getAllPackages();

	expect(dirs.length).toBeGreaterThan(0);

	for (const {pkg, path} of dirs) {
		if (pkg === 'core') {
			continue;
		}
		const description = descriptions[pkg as Pkgs];
		const docs = apiDocs[pkg as Pkgs];

		const readmePath = join(path, '..', 'README.md');

		const name = pkg === 'create-video' ? 'create-video' : `@remotion/${pkg}`;

		const readme =
			[
				`# @remotion/${pkg}`,
				description ? '' : null,
				description ?? null,
				'',
				docs
					? `[![NPM Downloads](https://img.shields.io/npm/dm/${name}.svg?style=flat&color=black&label=Downloads)](https://npmcharts.com/compare/${name}?minimal=true)`
					: null,
				docs ? '' : null,
				docs ? '## Installation' : null,
				docs ? '' : null,
				docs ? '```bash' : null,
				docs ? `npm install ${name} --save-exact` : null,
				docs ? '```' : null,
				docs ? '' : null,
				docs
					? 'When installing a Remotion package, make sure to align the version of all `remotion` and `@remotion/*` packages to the same version.'
					: null,
				docs
					? 'Remove the `^` character from the version number to use the exact version.'
					: null,
				docs ? '' : null,
				'## Usage',
				'',
				docs
					? 'See the [documentation](' + docs + ') for more information.'
					: 'This is an internal package and has no documentation.',
			]
				.filter((t) => t !== null)
				.join('\n') + '\n';

		if (pkg === 'convert' || pkg === 'remotion-media') {
			continue;
		}

		writeFileSync(readmePath, readme);
	}
});
