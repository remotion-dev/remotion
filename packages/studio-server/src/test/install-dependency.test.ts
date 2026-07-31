import {expect, test} from 'bun:test';
import {VERSION} from 'remotion/version';
import {getPackageInstallSpec} from '../preview-server/routes/install-dependency';

test('uses the matching version for Remotion packages', () => {
	expect(getPackageInstallSpec('remotion')).toBe(`remotion@${VERSION}`);
	expect(getPackageInstallSpec('@remotion/effects')).toBe(
		`@remotion/effects@${VERSION}`,
	);
});

test('uses the supported version for catalogued extra packages', () => {
	expect(getPackageInstallSpec('mediabunny')).toMatch(/^mediabunny@\d/);
});

test('lets the package manager resolve other packages', () => {
	expect(getPackageInstallSpec('lodash')).toBe('lodash');
	expect(getPackageInstallSpec('@acme/video')).toBe('@acme/video');
});

test('uses exact declared versions for non-Remotion dependencies', () => {
	expect(getPackageInstallSpec({name: 'lodash', version: '4.17.21'})).toBe(
		'lodash@4.17.21',
	);
	expect(
		getPackageInstallSpec({name: '@remotion/effects', version: '1.0.0'}),
	).toBe(`@remotion/effects@${VERSION}`);
});
