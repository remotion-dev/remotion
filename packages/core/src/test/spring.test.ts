import {isApproximatelyTheSame} from '../is-approximately-the-same';
import {spring} from '../spring';

test('Basic spring should work', () => {
	expect(
		spring({
			fps: 30,
			frame: 0,
		})
	).toEqual(0);

	expect(
		spring({
			fps: 30,
			frame: 0,
			from: 1,
			to: 0,
		})
	).toEqual(1);
});

test('Spring should go to 1', () => {
	expect(
		isApproximatelyTheSame(
			spring({
				fps: 30,
				frame: 1,
			}),
			0.04941510804510185
		)
	).toBe(true);
	expect(
		spring({
			fps: 30,
			frame: 100,
		})
	).toBeCloseTo(1);
});
