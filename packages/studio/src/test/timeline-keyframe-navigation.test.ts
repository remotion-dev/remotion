import {expect, test} from 'bun:test';
import {
	getNextKeyframeDisplayFrame,
	getPreviousKeyframeDisplayFrame,
	hasKeyframeAtSourceFrame,
} from '../components/Timeline/get-keyframe-navigation';

const keyframes = [{frame: 10}, {frame: 30}, {frame: 90}];

test('getPreviousKeyframeDisplayFrame returns the nearest earlier keyframe', () => {
	expect(getPreviousKeyframeDisplayFrame(keyframes, 0)).toBe(null);
	expect(getPreviousKeyframeDisplayFrame(keyframes, 10)).toBe(null);
	expect(getPreviousKeyframeDisplayFrame(keyframes, 11)).toBe(10);
	expect(getPreviousKeyframeDisplayFrame(keyframes, 30)).toBe(10);
	expect(getPreviousKeyframeDisplayFrame(keyframes, 100)).toBe(90);
});

test('getNextKeyframeDisplayFrame returns the nearest later keyframe', () => {
	expect(getNextKeyframeDisplayFrame(keyframes, 0)).toBe(10);
	expect(getNextKeyframeDisplayFrame(keyframes, 10)).toBe(30);
	expect(getNextKeyframeDisplayFrame(keyframes, 29)).toBe(30);
	expect(getNextKeyframeDisplayFrame(keyframes, 90)).toBe(null);
	expect(getNextKeyframeDisplayFrame(keyframes, 100)).toBe(null);
});

test('hasKeyframeAtSourceFrame checks source frame membership', () => {
	expect(hasKeyframeAtSourceFrame(keyframes, 10)).toBe(true);
	expect(hasKeyframeAtSourceFrame(keyframes, 11)).toBe(false);
});
