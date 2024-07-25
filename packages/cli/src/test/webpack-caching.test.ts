import {expect, test} from 'bun:test';
import {
	DEFAULT_WEBPACK_CACHE_ENABLED,
	getWebpackCaching,
	setWebpackCaching,
} from '../config/webpack-caching';
import {expectToThrow} from './expect-to-throw';

test('getWebpackCaching - default value', () => {
	expect(getWebpackCaching()).toEqual(DEFAULT_WEBPACK_CACHE_ENABLED);
});

test('webpack caching - setter - valid input', () => {
	const valuesToTest = [true, false];
	valuesToTest.forEach((entry) => {
		setWebpackCaching(entry);
		expect(getWebpackCaching()).toEqual(entry);
	});
});

test('webpack caching - setter - invalid input', () => {
	const valuesToTest = [undefined, 'true', 'false'];
	valuesToTest.forEach((entry) => {
		expectToThrow(() => {
			// @ts-expect-error
			setWebpackCaching(entry);
		}, /Caching flag must be a boolean./);
	});
});
