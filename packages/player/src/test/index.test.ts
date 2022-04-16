import {expect, test} from 'vitest';
import {usePlayer} from '../use-player';

test('It should throw an error if not being used inside a RemotionRoot', () => {
	expect(() => {
		usePlayer();
	}).toThrow();
});
