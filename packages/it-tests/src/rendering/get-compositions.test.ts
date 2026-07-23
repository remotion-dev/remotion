import {expect, test} from 'bun:test';
import {getCompositions} from '@remotion/renderer';

test('getCompositions() should give a good error message if there is no compositions file', async () => {
	// @ts-expect-error
	expect(() => getCompositions()).toThrow(
		'No serve URL or webpack bundle directory was passed to getCompositions().',
	);

	// @ts-expect-error
	expect(() => getCompositions({})).toThrow(
		'No serve URL or webpack bundle directory was passed to getCompositions().',
	);
});
