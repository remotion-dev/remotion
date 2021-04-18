import {renderHook} from '@testing-library/react-hooks';
import {validateMediaProps} from '../validate-media-props';

test('It should not allow a video to have a negative volume', () => {
	const {result} = renderHook(() => validateMediaProps({volume: -1}, 'Video'));
	expect(result.error).toEqual(
		TypeError(
			'You have passed a volume below 0 to your <Video /> component. Volume must be between 0 and 1'
		)
	);
});

test('It should not allow an audio element to have a negative volume', () => {
	const {result} = renderHook(() => validateMediaProps({volume: -1}, 'Audio'));
	expect(result.error).toEqual(
		TypeError(
			'You have passed a volume below 0 to your <Audio /> component. Volume must be between 0 and 1'
		)
	);
});

test('It should not allow an audio element to have a wrong type', () => {
	const {result} = renderHook(() =>
		//@ts-expect-error
		validateMediaProps({volume: 'wrong'}, 'Audio')
	);
	expect(result.error).toEqual(
		TypeError(
			"You have passed a volume of type string to your <Audio /> component. Volume must be a number or a function with the signature '(frame: number) => number' undefined."
		)
	);
});

test('It should not allow a video element to have a wrong type', () => {
	const {result} = renderHook(() =>
		//@ts-expect-error
		validateMediaProps({volume: 'wrong'}, 'Video')
	);
	expect(result.error).toEqual(
		TypeError(
			"You have passed a volume of type string to your <Video /> component. Volume must be a number or a function with the signature '(frame: number) => number' undefined."
		)
	);
});

test('It should allow a valid volume', () => {
	const {result} = renderHook(() => validateMediaProps({volume: 1}, 'Video'));
	expect(result.error).toEqual(undefined);
});
