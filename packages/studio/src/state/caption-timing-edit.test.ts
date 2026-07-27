import {expect, test} from 'bun:test';
import type {TSequence} from 'remotion';
import {getCaptionTimingBounds} from './caption-timing-edit';

test('derives caption timing bounds from the selected Sequence', () => {
	const bounds = getCaptionTimingBounds({
		sequence: {duration: 80, from: 100} as TSequence,
		sequenceFrameOffset: 20,
	});

	expect(bounds).toEqual({
		sourceDurationInFrames: 100,
		timelineStartInFrames: 80,
		visibleDurationInFrames: 80,
		visibleStartInFrames: 100,
	});
});
