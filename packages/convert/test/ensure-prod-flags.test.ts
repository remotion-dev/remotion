import {expect, test} from 'bun:test';
import {REMOTION_PRO_ORIGIN, TEST_FAST} from '~/lib/config';

test('Should not have convert fast enabled', () => {
	expect(TEST_FAST).toBe(false);
});

test('Should point to production remotion.pro', () => {
	expect(REMOTION_PRO_ORIGIN).toBe('https://www.remotion.pro');
});
