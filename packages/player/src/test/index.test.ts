import {usePlayback} from '../index';

test('It should throw an error if not being used inside a RemotionRoot', () => {
	expect(() => {
		usePlayback();
	}).toThrow();
});
