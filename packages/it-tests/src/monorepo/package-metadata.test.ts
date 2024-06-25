import {expect, test} from 'bun:test';
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
