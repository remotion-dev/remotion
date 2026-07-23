import {expect, test} from 'bun:test';
import type {CaptionJson} from '../caption-json';
import {applyCaptionTimingDrag} from './caption-timing';

const caption: CaptionJson = {
	text: ' Hello',
	startMs: 1000,
	endMs: 2000,
	timestampMs: 1250,
	confidence: 0.9,
};

const makeCaption = (startMs: number, endMs: number): CaptionJson => ({
	...caption,
	startMs,
	endMs,
});

test('resizes on frame boundaries and preserves the relative timestamp', () => {
	expect(
		applyCaptionTimingDrag({
			caption,
			previousCaption: null,
			nextCaption: null,
			deltaFrames: 15,
			durationInFrames: 300,
			fps: 30,
			type: 'resize-end',
		}),
	).toEqual({
		...caption,
		startMs: 1000,
		endMs: 2500,
		timestampMs: 1375,
	});
});

test('does not resize a caption start over the previous caption', () => {
	const result = applyCaptionTimingDrag({
		caption,
		previousCaption: makeCaption(500, 900),
		nextCaption: null,
		deltaFrames: -100,
		durationInFrames: 300,
		fps: 30,
		type: 'resize-start',
	});

	expect(result.startMs).toBe(900);
	expect(result.timestampMs).toBe(1175);
});

test('does not resize a caption end over the next caption', () => {
	const result = applyCaptionTimingDrag({
		caption,
		previousCaption: null,
		nextCaption: makeCaption(2200, 2600),
		deltaFrames: 100,
		durationInFrames: 300,
		fps: 30,
		type: 'resize-end',
	});

	expect(result.endMs).toBe(2200);
	expect(result.timestampMs).toBe(1300);
});

test('resizing the end preserves a non-frame-aligned start', () => {
	const nonAlignedCaption = makeCaption(916, 2000);
	const result = applyCaptionTimingDrag({
		caption: nonAlignedCaption,
		previousCaption: makeCaption(500, 910),
		nextCaption: null,
		deltaFrames: 1,
		durationInFrames: 300,
		fps: 30,
		type: 'resize-end',
	});

	expect(result.startMs).toBe(916);
	expect(result.endMs).toBeCloseTo(2033.333);
});

test('resizing the start preserves a non-frame-aligned end', () => {
	const nonAlignedCaption = makeCaption(1000, 2184);
	const result = applyCaptionTimingDrag({
		caption: nonAlignedCaption,
		previousCaption: null,
		nextCaption: makeCaption(2190, 2500),
		deltaFrames: -1,
		durationInFrames: 300,
		fps: 30,
		type: 'resize-start',
	});

	expect(result.startMs).toBeCloseTo(966.667);
	expect(result.endMs).toBe(2184);
});

test('keeps captions at least one frame long', () => {
	const result = applyCaptionTimingDrag({
		caption,
		previousCaption: null,
		nextCaption: null,
		deltaFrames: -100,
		durationInFrames: 300,
		fps: 30,
		type: 'resize-end',
	});

	expect(result.endMs - result.startMs).toBeCloseTo(1000 / 30);
});
