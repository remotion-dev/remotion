import {expect, test} from 'bun:test';
import {bundle} from '../bundle';

test('Should reject bad bundle options', () => {
	// @ts-expect-error
	expect(() => bundle()).toThrow(/bundle\(\) was called without arguments/);

	// @ts-expect-error
	expect(() => bundle({})).toThrow(
		/bundle\(\) was called without the `entryPoint` option/,
	);
});
