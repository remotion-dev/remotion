import {expect, test} from 'bun:test';
import {bundle} from '../bundle';

test('Should reject bad bundle options', () => {
	// @ts-expect-error
	expect(() => bundle()).toThrow(/bundle\(\) was called without arguments/);

	// @ts-expect-error
	expect(() => bundle({})).toThrow(
		/bundle\(\) was called without the `entryPoint` option/,
	);

	// @ts-expect-error
	expect(() => bundle('src/index.ts')).toThrow(
		'bundle() no longer supports the legacy positional arguments. Pass an options object instead: bundle({entryPoint, onProgress, ...options}).',
	);
});
