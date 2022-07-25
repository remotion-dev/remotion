import {describe, expect, test} from 'vitest';
import {getServerPort, setPort} from '../config/preview-server';
import {expectToThrow} from './expect-to-throw';

describe('setting preview server port', () => {
	test.each<number>([2, 3, 3450, 8700])('accept only valid port %s', (port) => {
		setPort(port);
		expect(getServerPort()).toBe(port);
	});

	test.each<[number | string, string]>([
		['e', `Preview server port should be a number. Got string \\(\\"e\\"\\)`],
		[-1, `Preview server port should be a number between 1 and 65535. Got -1`],
		[0, `Preview server port should be a number between 1 and 65535. Got 0`],
		[
			999999,
			`Preview server port should be a number between 1 and 65535. Got 999999`,
		],
	])('throw error on invalid ports %s', (port, errorPattern) => {
		// @ts-expect-error
		expectToThrow(() => setPort(port), new RegExp(errorPattern));
	});
});
