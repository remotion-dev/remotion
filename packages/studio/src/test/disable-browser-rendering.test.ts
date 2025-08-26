import {expect, test} from 'bun:test';
import {SHOW_BROWSER_RENDERING} from '../helpers/show-browser-rendering';

test('should not show browser rendering', () => {
	expect(SHOW_BROWSER_RENDERING).toBe(false);
});
