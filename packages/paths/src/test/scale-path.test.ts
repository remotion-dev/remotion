import {expect, test} from 'bun:test';
import {scalePath} from '../scale-path';

test('scalePath() should work', () => {
	expect(scalePath('M -10 -10 L 10 10', 2, 3)).toBe('M -10 -10 L 30 50');
});
