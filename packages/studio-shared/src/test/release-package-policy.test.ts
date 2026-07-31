import {expect, test} from 'bun:test';
import {
	moveRemovedDependenciesToDevDependencies,
	packagesRemovedInV5,
	shouldReleasePackage,
} from '../release-package-policy';

test('releases the deprecated packages on the 4.x line', () => {
	for (const packageName of packagesRemovedInV5) {
		expect(shouldReleasePackage({packageName, releaseVersion: '4.0.500'})).toBe(
			true,
		);
	}
});

test('does not release the deprecated packages starting with v5', () => {
	for (const packageName of packagesRemovedInV5) {
		expect(shouldReleasePackage({packageName, releaseVersion: '5.0.0'})).toBe(
			false,
		);
		expect(shouldReleasePackage({packageName, releaseVersion: '6.0.0'})).toBe(
			false,
		);
	}
});

test('continues to release other packages in v5', () => {
	expect(
		shouldReleasePackage({
			packageName: '@remotion/effects',
			releaseVersion: '5.0.0',
		}),
	).toBe(true);
});

test('rejects an invalid release version', () => {
	expect(() =>
		shouldReleasePackage({
			packageName: '@remotion/effects',
			releaseVersion: 'latest',
		}),
	).toThrow('Invalid release version: latest');
});

test('keeps dependencies on the 4.x line', () => {
	const packageJson = {
		dependencies: {
			'@remotion/media-parser': 'workspace:*',
			remotion: 'workspace:*',
		},
	};

	expect(
		moveRemovedDependenciesToDevDependencies({
			packageJson,
			releaseVersion: '4.0.500',
		}),
	).toEqual(packageJson);
});

test('does not leave a dangling v5 dependency', () => {
	expect(
		moveRemovedDependenciesToDevDependencies({
			packageJson: {
				dependencies: {
					'@remotion/media-parser': 'workspace:*',
					remotion: 'workspace:*',
				},
			},
			releaseVersion: '5.0.0',
		}),
	).toEqual({
		dependencies: {remotion: 'workspace:*'},
		devDependencies: {'@remotion/media-parser': 'workspace:*'},
	});
});
