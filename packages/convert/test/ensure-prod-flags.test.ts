import {expect, test} from 'bun:test';
import {TEST_FAST} from '~/lib/config';

test('Should not have convert fast enabled', () => {
	expect(TEST_FAST).toBe(false);
});
