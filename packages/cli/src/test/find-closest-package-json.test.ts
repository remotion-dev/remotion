import path from 'path';
import {expect, test} from 'vitest';
import {findClosestPackageJson} from '../find-closest-package-json';

test('Find closests package.json', () => {
	expect(
		findClosestPackageJson()?.endsWith(
			path.join('packages', 'cli', 'package.json')
		)
	).toBe(true);
});
