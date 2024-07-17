import {expect, test} from 'bun:test';
import {Easing} from 'remotion';
import {interpolateStyles} from '../transformation-helpers/interpolate-styles';
import {translate} from '../transformation-helpers/make-transform';

test('If property is omitted, leave it in from previous keyframe', () => {
	expect(
		interpolateStyles(
			0,
			[0, 1],
			[
				{
					opacity: 1,
				},
				{},
			],
		),
	).toEqual({opacity: 1});
});

test('Handle units', () => {
	expect(
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					padding: '20px 40px',
				},
				{
					padding: '40px 80px',
				},
			],
		),
	).toEqual({padding: '30px 60px'});
});

test('Handle units', () => {
	expect(
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					backgroundColor: 'blue',
					opacity: 0,
				},
				{
					backgroundColor: 'pink',
					opacity: 1,
				},
			],
		),
	).toEqual({backgroundColor: 'rgba(128, 96, 229, 1)', opacity: 0.5});
});

test('Throw error on incompatible shorthands', () => {
	expect(() =>
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					padding: '20px 40px',
				},
				{
					padding: '80px',
				},
			],
		),
	).toThrow(
		/The start and end values must have the same structure. Start value: 20px 40px, end value: 80px/,
	);
});

test('Should throw an error on non-animatable properties', () => {
	expect(() =>
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					textAlign: 'center',
				},
				{
					textAlign: 'left',
				},
			],
		),
	).toThrow(
		/Non-animatable values cannot be interpolated. Start value: center, end value: left/,
	);
});

test('Should be able to interpolate transform strings - edge', () => {
	expect(
		interpolateStyles(
			0,
			[0, 1],
			[
				{
					transform: `scale(0.5)`,
				},
				{
					transform: `scale(1)`,
				},
			],
		),
	).toEqual({transform: `scale(0.5)`});
});

test('Should be able to interpolate transform strings - edge', () => {
	expect(
		interpolateStyles(
			2.5,
			[0, 1, 2],
			[
				{
					transform: `scale(0.5)`,
				},
				{
					transform: `scale(1) translateX(100px) rotate(20deg)`,
				},
				{
					transform: `scale(2) translateX(300px) rotate(60deg)`,
				},
			],
		),
	).toEqual({transform: `scale(2.5) translateX(400px) rotate(80deg)`});
});

test('Should be able to use extrapolateRight: "clamp"', () => {
	expect(
		interpolateStyles(
			2.5,
			[0, 1, 2],
			[
				{
					transform: `scale(0.5)`,
				},
				{
					transform: `scale(1) translateX(100px) rotate(20deg)`,
				},
				{
					transform: `scale(2) translateX(300px) rotate(60deg)`,
				},
			],
			{
				extrapolateRight: 'clamp',
			},
		),
	).toEqual({transform: `scale(2) translateX(300px) rotate(60deg)`});
});

test('Should be able to use Easing', () => {
	expect(
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					transform: `scale(0.5)`,
				},
				{
					transform: `scale(1)`,
				},
			],
			{
				extrapolateRight: 'clamp',
				easing: Easing.circle,
			},
		),
	).toEqual({transform: `scale(0.5669872981077807)`});
});

test('Should not be able to interpolate transform with different structure', () => {
	expect(() =>
		interpolateStyles(
			0.5,
			[0, 1, 2],
			[
				{
					transform: `scale(0.5)`,
				},
				{
					transform: `scale(1) translateX(100px) rotate(20deg)`,
				},
				{
					transform: `scale(2) translateX(300px) rotate(60deg)`,
				},
			],
		),
	).toThrow(
		/The start and end values must have the same structure. Start value: scale\(0.5\), end value: scale\(1\) translateX\(100px\) rotate\(20deg\)/,
	);
});

test('Should throw on units mismatch', () => {
	expect(() =>
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					padding: '20px',
				},
				{
					padding: '80%',
				},
			],
		),
	).toThrow(
		/The units of the start and end values must match. Start value: 20px, end value: 80%/,
	);
});

test('Should handle `border`', () => {
	expect(
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					border: '1px solid black',
				},
				{
					border: '10px solid red',
				},
			],
		),
	).toEqual({
		border: '5.5px solid rgba(128, 0, 0, 1)',
	});

	expect(() =>
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					border: '1px solid black',
				},
				{
					border: '10px dotted red',
				},
			],
		),
	).toThrow(
		/Non-animatable values cannot be interpolated. Start value: 1px solid black, end value: 10px dotted red/,
	);
});

test('Should interpolate between 0 and values with units', () => {
	expect(
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					padding: 0,
				},
				{
					padding: '10px',
				},
			],
		),
	).toEqual({
		padding: '5px',
	});
});

test('Should interpolate between negative values with units', () => {
	expect(
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					left: '-10px',
				},
				{
					left: '-20px',
				},
			],
		),
	).toEqual({
		left: '-15px',
	});
});

test('Should not ignore 0 values', () => {
	expect(
		interpolateStyles(
			0.999,
			[0, 1],
			[
				{
					left: 1000,
				},
				{
					left: 0,
				},
			],
		),
	).toEqual({
		left: 1,
	});
});

test('Should handle negative values in transforms well', () => {
	expect(
		interpolateStyles(
			0.5,
			[0, 1],
			[
				{
					transform: translate(100, 100),
				},
				{
					transform: translate(100, -100),
				},
			],
		),
	).toEqual({
		transform: 'translate(100px, 0px)',
	});
});

// Refer https://github.com/remotion-dev/remotion/issues/3922
test("Should assign proper start value from interpolate's inputRange array if first element is greater than input value", () => {
	expect(
		interpolateStyles(
			1.5,
			[2, 3],
			[
				{
					opacity: 0,
				},
				{
					opacity: 1,
				},
			],
		),
	).toEqual({opacity: -0.5});
});
