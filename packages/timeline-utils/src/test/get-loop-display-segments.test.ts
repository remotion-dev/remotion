import {expect, test} from 'bun:test';
import {getLoopDisplaySegments} from '../loop-display';

test('splits an integer display window at loop boundaries', () => {
	expect(
		getLoopDisplaySegments({
			displayDurationInFrames: 5,
			displayOffsetInFrames: 8,
			loopDurationInFrames: 10,
		}),
	).toEqual([
		{
			loopIndex: 0,
			absoluteOffsetInFrames: 8,
			loopOffsetInFrames: 8,
			durationInFrames: 2,
		},
		{
			loopIndex: 1,
			absoluteOffsetInFrames: 10,
			loopOffsetInFrames: 0,
			durationInFrames: 3,
		},
	]);
});

test('handles fractional display windows', () => {
	expect(
		getLoopDisplaySegments({
			displayDurationInFrames: 5.25,
			displayOffsetInFrames: 8.5,
			loopDurationInFrames: 10,
		}),
	).toEqual([
		{
			loopIndex: 0,
			absoluteOffsetInFrames: 8.5,
			loopOffsetInFrames: 8.5,
			durationInFrames: 1.5,
		},
		{
			loopIndex: 1,
			absoluteOffsetInFrames: 10,
			loopOffsetInFrames: 0,
			durationInFrames: 3.75,
		},
	]);
});

test('does not emit an empty segment when the window ends on a boundary', () => {
	const segments = getLoopDisplaySegments({
		displayDurationInFrames: 10,
		displayOffsetInFrames: 10,
		loopDurationInFrames: 10,
	});
	expect(segments).toHaveLength(1);
	expect(segments[0].loopIndex).toBe(1);
	expect(segments[0].durationInFrames).toBe(10);
});

test('stays bounded for fractional offsets that stalled the accumulating loop', () => {
	// Regression: `processed += segmentDuration` used to no-op once the
	// floating-point residue was smaller than the ULP of `processed`,
	// growing arrays until an out-of-memory crash.
	const displayOffsetInFrames = 11256.685714285799;
	const displayDurationInFrames = 33426.30571428571;
	// Stalls the previous accumulating implementation after 12 iterations
	const loopDurationInFrames = 99.999;
	const segments = getLoopDisplaySegments({
		displayDurationInFrames,
		displayOffsetInFrames,
		loopDurationInFrames,
	});

	expect(segments.length).toBeLessThanOrEqual(
		Math.ceil(displayDurationInFrames / loopDurationInFrames) + 1,
	);
	const total = segments.reduce(
		(sum, segment) => sum + segment.durationInFrames,
		0,
	);
	expect(total).toBeCloseTo(displayDurationInFrames, 6);
	for (const segment of segments) {
		expect(segment.durationInFrames).toBeGreaterThan(0);
		expect(segment.loopOffsetInFrames).toBeGreaterThanOrEqual(0);
		expect(segment.loopOffsetInFrames).toBeLessThan(loopDurationInFrames);
	}
});

test('handles negative display offsets', () => {
	expect(
		getLoopDisplaySegments({
			displayDurationInFrames: 8,
			displayOffsetInFrames: -3,
			loopDurationInFrames: 10,
		}),
	).toEqual([
		{
			loopIndex: -1,
			absoluteOffsetInFrames: -3,
			loopOffsetInFrames: 7,
			durationInFrames: 3,
		},
		{
			loopIndex: 0,
			absoluteOffsetInFrames: 0,
			loopOffsetInFrames: 0,
			durationInFrames: 5,
		},
	]);
});

test('returns no segments for degenerate inputs', () => {
	expect(
		getLoopDisplaySegments({
			displayDurationInFrames: 0,
			displayOffsetInFrames: 0,
			loopDurationInFrames: 10,
		}),
	).toEqual([]);
	expect(
		getLoopDisplaySegments({
			displayDurationInFrames: 10,
			displayOffsetInFrames: 0,
			loopDurationInFrames: 0,
		}),
	).toEqual([]);
	expect(
		getLoopDisplaySegments({
			displayDurationInFrames: Infinity,
			displayOffsetInFrames: 0,
			loopDurationInFrames: 10,
		}),
	).toEqual([]);
});
