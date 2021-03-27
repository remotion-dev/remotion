import {
	getShouldOutputImageSequence,
	setImageSequence,
} from '../config/image-sequence';
import {expectToThrow} from './expect-to-throw';

test('setImageSequence should throw if image sequence is not a boolean value', () => {
	expectToThrow(
		() =>
			setImageSequence(
				// @ts-expect-error
				'invalidImageSequence'
			),
		/setImageSequence accepts a Boolean Value/
	);
});

test('getShouldOutputImageSequence should return false by default', () => {
	expect(getShouldOutputImageSequence()).toEqual(false);
});

test('setImageSequence should NOT throw if image sequence is a boolean value', () => {
	expect(() => setImageSequence(true)).not.toThrow();
	expect(getShouldOutputImageSequence()).toEqual(true);
});
