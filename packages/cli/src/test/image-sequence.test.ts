import {afterEach, beforeAll, expect, test} from 'bun:test';
import {
	getShouldOutputImageSequence,
	setImageSequence,
} from '../config/image-sequence';
import {expectToThrow} from './expect-to-throw';

const invalidImageSequence: String = 'invalidImageSequence';
let defaultImageSequence: boolean;

beforeAll(() => {
	defaultImageSequence = getShouldOutputImageSequence(null);
});
afterEach(() => {
	setImageSequence(defaultImageSequence);
});
test('setImageSequence should throw if image sequence is not a boolean value', () => {
	expectToThrow(
		() =>
			// @ts-expect-error
			setImageSequence(invalidImageSequence),
		/setImageSequence accepts a Boolean Value/,
	);
});
test('setImageSequence should NOT throw if image sequence is a boolean value', () => {
	expect(() => setImageSequence(true)).not.toThrow();
});
test('getShouldOutputImageSequence should return false by default', () => {
	expect(getShouldOutputImageSequence(null)).toEqual(false);
});
test('getShouldOutputImageSequence should return true if a single frame number is passed', () => {
	expect(getShouldOutputImageSequence(1)).toEqual(true);
});
test('getShouldOutputImageSequence should return true', () => {
	setImageSequence(true);
	expect(getShouldOutputImageSequence(null)).toEqual(true);
});
