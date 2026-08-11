import {expect, test} from 'bun:test';
import {getBundlePublicPath, getBundleStaticHash} from '../bundle';
import {getOutputConfig} from '../shared-bundler-config';

test('defaults bundles to a relocatable public path', () => {
	const publicPath = getBundlePublicPath(null);

	expect(publicPath).toBe('./');
	expect(getBundleStaticHash(publicPath)).toBe('./public');
});

test('preserves explicit absolute public paths', () => {
	expect(getBundlePublicPath('/')).toBe('/');
	expect(getBundleStaticHash('/')).toBe('/public');
	expect(getBundleStaticHash('/sites/alpha/')).toBe('/sites/alpha/public');
});

test('lets Webpack and Rspack derive chunk paths from the bundle script URL', () => {
	expect(getOutputConfig('production')).not.toHaveProperty('publicPath');
});
