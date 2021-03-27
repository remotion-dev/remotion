import {usePlaybackTime} from '../index';

test('It should throw an error', () => {
	expect(() => {
		const [
			toggle,
			frameBack,
			frameForward,
			onKeyPress,
			isLastFrame,
		] = usePlaybackTime();
	}).toThrow();
});
