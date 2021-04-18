import {interpolateColors} from '../interpolateColors';
import {expectToThrow} from './expect-to-throw';

test('Throws if color space is not right', () => {
	expectToThrow(() => {
		//@ts-expect-error
		interpolateColors(1, [0, 1], ['#ffaadd', '#fabedf'], 'GFR');
	}, /invalid color space provided: GFR. Supported values are: \['RGB', 'HSV'\]/);
});

test('Throws if color string is not right', () => {
	expectToThrow(() => {
		interpolateColors(1, [0, 1], ['#fabgdf', '#ffaabb']);
	}, /invalid color string #fabgdf provided/);
});

test('Throws error if input, inputRange or outputRange is undefined', () => {
	expectToThrow(() => {
		//@ts-expect-error
		interpolateColors(undefined, undefined, undefined);
	}, /input or inputRange or outputRange can not be undefined/);
});

test('inputRange and outputRange must be of same length', () => {
	expectToThrow(() => {
		interpolateColors(1, [1, 2, 3], ['#ffffff', '#aaaaaa']);
	}, /inputRange \(3\) and outputRange \(2\) must have the same length/);
});

test('Basic interpolate Colors', () => {
	expect(interpolateColors(1, [0, 1], ['#ffaadd', '#fabfdf'])).toBe(
		'rgba(250, 191, 223, 1)'
	);
});

test('Color shorthands', () => {
	expect(interpolateColors(1, [0, 1], ['#fad', '#fabfdf'])).toBe(
		'rgba(250, 191, 223, 1)'
	);
});
