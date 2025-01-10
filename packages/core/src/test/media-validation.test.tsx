import {describe, expect, test} from 'bun:test';
import {validateMediaProps} from '../validate-media-props.js';
import {expectToThrow} from './expect-to-throw.js';

describe('ValidateMediaProps should throw with invalid volume inputs', () => {
	const testComponents: string[] = ['Audio', 'Video'];
	testComponents.forEach((component) => {
		test(`It should not allow an ${component} element to have a negative volume `, () => {
			expectToThrow(
				// @ts-expect-error
				() => validateMediaProps({volume: -1}, component),
				new RegExp(
					`You have passed a volume below 0 to your <${component} /> component. Volume must be between 0 and 1`,
				),
			);
		});
		test(`It should not allow an ${component} element to have an invalid type`, () => {
			expectToThrow(
				// @ts-expect-error
				() => validateMediaProps({volume: 'invalidType'}, component),
				new RegExp(
					`You have passed a volume of type string to your <${component} /> component.`,
				),
			);
		});
	});
});

describe('ValidateMediaProps should not throw with valid volume inputs', () => {
	const validInputs: (number | Function | undefined)[] = [
		0,
		1,
		undefined,
		() => 1,
		(x: number) => x,
	];
	validInputs.forEach((vol) =>
		test(`valid volume ${vol} shold not throw`, () => {
			// @ts-expect-error
			expect(() => validateMediaProps({volume: vol}, 'Video')).not.toThrow();
		}),
	);
});

describe('ValidateMediaProps should throw with invalid playbackRate', () => {
	test(`It should not allow playbackRate of 0 or below.`, () => {
		expectToThrow(
			() => validateMediaProps({playbackRate: -1}, 'Audio'),
			/You have passed a playbackRate of -1 to your <Audio \/> component. Playback rate must be a real number above 0./,
		);
	});
	test(`It should not allow non-finite playbackRate.`, () => {
		expectToThrow(
			() => validateMediaProps({playbackRate: Infinity}, 'Audio'),
			/You have passed a playbackRate of Infinity to your <Audio \/> component. Playback rate must be a real number above 0./,
		);
	});
	test(`It should not allow NaN playbackRate.`, () => {
		expectToThrow(
			() => validateMediaProps({playbackRate: NaN}, 'Audio'),
			/You have passed a playbackRate of NaN to your <Audio \/> component. Playback rate must be a real number above 0./,
		);
	});
	test(`It should not allow regular playbackrate.`, () => {
		expect(() => validateMediaProps({playbackRate: 1}, 'Audio')).not.toThrow();
	});
});
