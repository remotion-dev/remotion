import {expect, test} from 'bun:test';
import {usePlayer} from '../use-player.js';

test('It should throw an error if not being used inside a RemotionRoot', () => {
	expect(() => {
		usePlayer();
	}).toThrow();
});
