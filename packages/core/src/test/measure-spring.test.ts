import {measureSpring, spring} from '../spring';

test('Measure spring should work', () => {
	const duration = measureSpring({
		fps: 30,
	});
	expect(duration).toBe(54);
	expect(
		spring({
			fps: 30,
			frame: duration,
		})
	).toBe(1);
	expect(
		spring({
			fps: 30,
			frame: duration - 1,
		})
	).not.toBe(1);
});
