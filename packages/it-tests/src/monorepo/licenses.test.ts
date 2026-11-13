import {expect, test} from 'bun:test';
import {readFileSync} from 'node:fs';
import {getAllPackages} from './get-all-packages';

test('Published packages should declare a supported license', () => {
	const supportedLicenses = [
		'MIT',
		'ISC',
		'UNLICENSED',
		'SEE LICENSE IN LICENSE.md',
	];
	const invalidPackages: string[] = [];
	let publishedPackages = 0;

	for (const pkg of getAllPackages()) {
		const packageJson = JSON.parse(readFileSync(pkg.path, 'utf-8'));
		if (packageJson.private) {
			continue;
		}

		publishedPackages++;
		if (!supportedLicenses.includes(packageJson.license)) {
			invalidPackages.push(
				`${packageJson.name}: ${JSON.stringify(packageJson.license) ?? 'missing license field'}`,
			);
		}
	}

	expect(publishedPackages).toBeGreaterThan(0);
	if (invalidPackages.length > 0) {
		throw new Error(
			`Published packages must declare one of ${supportedLicenses.join(', ')}:\n${invalidPackages.join('\n')}`,
		);
	}
});
