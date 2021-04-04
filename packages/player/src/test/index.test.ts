import {usePlaybackTime} from '../index';

test('It should throw an error if not being used inside a RemotionRoot', () => {
	expect(() => {
		usePlaybackTime();
	}).toThrow();
});
