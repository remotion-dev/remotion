import {expect, test} from 'bun:test';
import {clampFrameToCompositionRange} from '../timeline-position-state';

test('clamps timeline frames to the composition range', () => {
	expect(clampFrameToCompositionRange(-1, 100)).toBe(0);
	expect(clampFrameToCompositionRange(0, 100)).toBe(0);
	expect(clampFrameToCompositionRange(50, 100)).toBe(50);
	expect(clampFrameToCompositionRange(99, 100)).toBe(99);
	expect(clampFrameToCompositionRange(100, 100)).toBe(99);
});
