import {expect, test} from 'bun:test';
import {
	getFrameFromX,
	getFrameIncrementFromWidth,
} from '../components/Timeline/timeline-scroll-logic';

test('getFrameFromX handles collapsed timeline widths', () => {
	expect(
		getFrameFromX({
			clientX: 0,
			durationInFrames: 100,
			extrapolate: 'clamp',
			width: 0,
		}),
	).toBe(0);
});

test('getFrameIncrementFromWidth never returns a negative increment', () => {
	expect(getFrameIncrementFromWidth(100, 0)).toBe(0.01);
});
