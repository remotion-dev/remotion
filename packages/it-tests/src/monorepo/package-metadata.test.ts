import {Pkgs, apiDocs, descriptions} from '@remotion/studio-shared';
import {expect, test} from 'bun:test';
import {writeFileSync} from 'fs';
import {join} from 'path';
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

		const webcodecsLicenseDisclaimer = [
			'',
			'## License',
			'This package is licensed under the [/docs/license](Remotion License).',
			'We consider a team of 4 or more people a "company".',
			'',
			'**For "companies"**: A Remotion Company license needs to be obtained to use this package.',
			'In a future version of `@remotion/webcodecs`, this package will also require the purchase of a newly created "WebCodecs Conversion Seat". [Get in touch](https://remotion.dev/contact) with us if you are planning to use this package.',
			'',
			'**For individuals and teams up to 3**: You can use this package for free.',
			'',
			'This is a short, non-binding explanation of our license. See the [https://remotion.dev/docs/license](License) itself for more details.',
		].join('\n');

		const readme =
			[
				`# @remotion/${pkg}`,
				description ? ' ' : null,
				description ?? null,
				' ',
				`[![NPM Downloads](https://img.shields.io/npm/dm/${name}.svg?style=flat&color=black&label=Downloads)](https://npmcharts.com/compare/${name}?minimal=true)`,
				' ',
				'## Installation',
				' ',
				'```bash',
				`npm install ${name} --save-exact`,
				'```',
				' ',
				'When installing a Remotion package, make sure to align the version of all `remotion` and `@remotion/*` packages to the same version.',
				'Remove the `^` character from the version number to use the exact version.',
				' ',
				'## Usage',
				' ',
				docs
					? 'See the [documentation](' + docs + ') for more information.'
					: 'This is an internal package and has no documentation.',
				pkg === 'webcodecs' ? webcodecsLicenseDisclaimer : null,
			]
				.filter(Boolean)
				.join('\n') + '\n';

		writeFileSync(readmePath, readme);
	}
});
