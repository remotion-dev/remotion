import {interpolate} from '../interpolate';
import {expectToThrow} from './expect-to-throw';

test('Interpolate test', () => {
	expectToThrow(() => {
		interpolate(1, [0, 2], [0, 1, 2]);
	}, /must have the same length/);
	expectToThrow(() => {
		interpolate(1, [0], [0, 2]);
	}, /must have at least 2 elements/);
	expectToThrow(() => {
		interpolate(1, [-Infinity, Infinity], [0, 2]);
	}, /cannot be \]-infinity;\+infinity\[/);
	expectToThrow(() => {
		interpolate(1, [0, 1], [9]);
	}, /outputRange must have at least 2 elements/);
	expectToThrow(() => {
		interpolate(1, [0], [9, 2]);
	}, /inputRange must have at least 2 elements/);
	expectToThrow(() => {
		interpolate(1, [0, 1, 0.5], [0, 2]);
	}, /inputRange must be monotonically non-decreasing/);
	expect(interpolate(1, [0, 1], [0, 2])).toEqual(2);
	expect(interpolate(0.5, [0, 0.5, 1], [0, 0.1, 2])).toEqual(0.1);
});
