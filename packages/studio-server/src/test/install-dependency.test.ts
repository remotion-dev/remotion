import {expect, test} from 'bun:test';
import {VERSION} from 'remotion/version';
import {getPackageInstallSpec} from '../preview-server/routes/install-dependency';

test('uses the matching version for Remotion packages', () => {
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
