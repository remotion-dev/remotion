import {expect, test} from 'bun:test';
import path from 'node:path';
import {findClosestPackageJson} from '../find-closest-package-json';

test('Find closests package.json', () => {
	expect(
		findClosestPackageJson()?.endsWith(
			path.join('packages', 'renderer', 'package.json'),
		),
	).toBe(true);
});
