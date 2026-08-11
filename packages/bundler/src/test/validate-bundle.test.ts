import {expect, test} from 'bun:test';
import {bundle, convertBundleArgumentsIntoOptions} from '../bundle';

test('Should reject bad bundle options', () => {
	// @ts-expect-error
	expect(() => bundle()).toThrow(/bundle\(\) was called without arguments/);

	// @ts-expect-error
	expect(() => bundle({})).toThrow(
		/bundle\(\) was called without the `entryPoint` option/,
	);
});

test('Should gate the legacy positional bundle() signature', () => {
	expect(convertBundleArgumentsIntoOptions(['src/index.ts'], false)).toEqual({
		entryPoint: 'src/index.ts',
		onProgress: undefined,
	});

	expect(() =>
		convertBundleArgumentsIntoOptions(['src/index.ts'], true),
	).toThrow(
		'bundle() no longer supports the legacy positional arguments. Pass an options object instead: bundle({entryPoint, onProgress, ...options}).',
	);
});
