import {expect, test} from 'bun:test';
import {
	clampInspectorKeyframeDisplayFrame,
	getInspectorKeyframeSourceFrame,
} from '../components/InspectorPanel/keyframe-inspector-frame';

test('clamps the inspector keyframe frame to the composition timeline', () => {
	expect(
		clampInspectorKeyframeDisplayFrame({
			durationInFrames: 50,
			frame: -12,
		}),
	).toBe(0);
	expect(
		clampInspectorKeyframeDisplayFrame({
			durationInFrames: 50,
			frame: 12.4,
		}),
	).toBe(12);
	expect(
		clampInspectorKeyframeDisplayFrame({
			durationInFrames: 50,
			frame: 12.5,
		}),
	).toBe(13);
	expect(
		clampInspectorKeyframeDisplayFrame({
			durationInFrames: 50,
			frame: 80,
		}),
	).toBe(49);
});

test('falls back to frame 0 if the composition has no duration', () => {
	expect(
		clampInspectorKeyframeDisplayFrame({
			durationInFrames: 0,
			frame: 12,
		}),
	).toBe(0);
});

test('converts an inspector display frame to the source keyframe frame', () => {
	expect(
		getInspectorKeyframeSourceFrame({
			displayFrame: 40,
			keyframeDisplayOffset: 12,
		}),
	).toBe(28);
});
