import {usePlayer} from '../index';

test('It should throw an error if not being used inside a RemotionRoot', () => {
	expect(() => {
		usePlayer();
	}).toThrow();
});
