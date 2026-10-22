import {expect, test} from 'bun:test';
import {getBoundedKeyframeDragDelta} from '../keyframe-move';

test('bounded keyframe drag delta stays inside the composition timeline', () => {
	expect(
		getBoundedKeyframeDragDelta({
			targets: [{displayFrame: 10}],
			delta: -20,
			durationInFrames: 100,
		}),
	).toBe(-10);

	expect(
		getBoundedKeyframeDragDelta({
			targets: [{displayFrame: 90}],
			delta: 20,
			durationInFrames: 100,
		}),
	).toBe(9);
});

test('bounded keyframe drag delta allows negative source frames when display frames stay in range', () => {
	expect(
		getBoundedKeyframeDragDelta({
			targets: [{displayFrame: 30}],
			delta: -30,
			durationInFrames: 100,
		}),
	).toBe(-30);
});

test('bounded keyframe drag delta clamps multi-selection at the first timeline edge', () => {
	const targets = [{displayFrame: 20}, {displayFrame: 95}];

	expect(
		getBoundedKeyframeDragDelta({
			targets,
			delta: -30,
			durationInFrames: 100,
		}),
	).toBe(-20);

	expect(
		getBoundedKeyframeDragDelta({
			targets,
			delta: 10,
			durationInFrames: 100,
		}),
	).toBe(4);
});
