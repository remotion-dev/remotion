import {validateMediaProps} from '../validate-media-props';
import {expectToThrow} from './expect-to-throw';

test('It should not allow a video to have a negative volume', () => {
	expectToThrow(
		() => validateMediaProps({volume: -1}, 'Video'),
		/You have passed a volume below 0 to your <Video \/> component./
	);
});

test('It should not allow an audio element to have a negative volume', () => {
	expectToThrow(
		() => validateMediaProps({volume: -1}, 'Audio'),
		/You have passed a volume below 0 to your <Audio \/> component./
	);
});

test('It should not allow an audio element to have a wrong type', () => {
	expectToThrow(
		// @ts-expect-error
		() => validateMediaProps({volume: 'wrong'}, 'Audio'),
		/You have passed a volume of type string to your <Audio \/> component./
	);
});

test('It should not allow a video element to have a wrong type', () => {
	expectToThrow(
		// @ts-expect-error
		() => validateMediaProps({volume: 'wrong'}, 'Video'),
		/You have passed a volume of type string to your <Video \/> component/
	);
});

test('It should allow a valid volume', () => {
	expect(() => validateMediaProps({volume: 1}, 'Video')).not.toThrow();
});
