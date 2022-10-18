import {expect, test} from 'vitest';
import {bundle} from '../bundle';

test('Should reject bad bundle options', () => {
	// @ts-expect-error
	expect(() => bundle()).rejects.toThrow(
		/bundle\(\) was called without arguments/
	);

	// @ts-expect-error
	expect(() => bundle({})).rejects.toThrow(
		/bundle\(\) was called without the `entryPoint` option/
	);
});
