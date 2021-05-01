import {measureSpring, spring} from '../spring';
import {expectToThrow} from './expect-to-throw';

test('Measure spring should work', () => {
	const duration = measureSpring({
		fps: 30,
	});
	expect(duration).toBe(28);
	expect(
		spring({
			fps: 30,
			frame: duration,
		})
	).toBeCloseTo(1);
	expect(
		spring({
			fps: 30,
			frame: duration - 1,
		})
	).not.toBe(1);
});

test('Higher threshold should lead to faster spring', () => {
	expect(measureSpring({fps: 30, threshold: 0.05})).toBeLessThan(
		measureSpring({fps: 30, threshold: 0.01})
	);
});

test('Lower threshold should lead to slower spring', () => {
	expect(measureSpring({fps: 30, threshold: 0.001})).toBeGreaterThan(
		measureSpring({fps: 30, threshold: 0.01})
	);
});

test('Threshold edge cases', () => {
	expect(measureSpring({fps: 30, threshold: 0})).toBe(Infinity);
	expect(measureSpring({fps: 30, threshold: 1})).toBe(0);

	expectToThrow(
		() => measureSpring({fps: 30, threshold: NaN}),
		/Threshold is NaN/
	);
	expectToThrow(
		() => measureSpring({fps: 30, threshold: Infinity}),
		/Threshold is not finite/
	);
	expectToThrow(
		// @ts-expect-error
		() => measureSpring({fps: 30, threshold: null}),
		/threshold must be a number, got null of type object/
	);
});

test('Should throw on invalid FPS', () => {
	expectToThrow(
		() => measureSpring({fps: 0}),
		/"fps" must be positive, but got 0./
	);
});
