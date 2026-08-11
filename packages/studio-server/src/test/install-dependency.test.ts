import {expect, test} from 'bun:test';
import {VERSION} from 'remotion/version';
import {getPackageInstallSpec} from '../preview-server/routes/install-dependency';

test('uses the matching version for Remotion packages', () => {
	expect(getPackageInstallSpec({name: 'remotion', version: null})).toBe(
		`remotion@${VERSION}`,
	);
	expect(
		getPackageInstallSpec({name: '@remotion/effects', version: null}),
	).toBe(`@remotion/effects@${VERSION}`);
});

test('uses the supported version for unversioned catalogued packages', () => {
	expect(getPackageInstallSpec({name: 'mediabunny', version: null})).toMatch(
		/^mediabunny@\d/,
	);
});

test('lets the package manager resolve other unversioned packages', () => {
	expect(getPackageInstallSpec({name: 'lodash', version: null})).toBe('lodash');
	expect(getPackageInstallSpec({name: '@acme/video', version: null})).toBe(
		'@acme/video',
	);
});

test('uses exact declared versions for non-Remotion dependencies', () => {
	expect(getPackageInstallSpec({name: 'lodash', version: '4.17.21'})).toBe(
		'lodash@4.17.21',
	);
	expect(getPackageInstallSpec({name: 'mediabunny', version: '1.2.3'})).toBe(
		'mediabunny@1.2.3',
	);
});

test('always aligns Remotion package versions', () => {
	expect(
		getPackageInstallSpec({name: '@remotion/effects', version: '1.0.0'}),
	).toBe(`@remotion/effects@${VERSION}`);
});
