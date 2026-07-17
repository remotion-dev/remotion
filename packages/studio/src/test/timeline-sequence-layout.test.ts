import {expect, test} from 'bun:test';
import type {VideoConfig} from 'remotion';
import {
	SEQUENCE_BORDER_WIDTH,
	getTimelineSequenceLayout,
} from '../helpers/get-timeline-sequence-layout';
const makeVideoConfig = (durationInFrames: number): VideoConfig => ({
	durationInFrames,
	fps: 30,
	height: 1080,
	width: 1920,
	id: 'main',
	// @ts-expect-error
	component: {_payload: {_status: 1}},
	props: {},
	nonce: [[0, 16]],
});

test('Should test timeline sequence layout without max media duration', () => {
	expect(
		getTimelineSequenceLayout({
			durationInFrames: 400,
			startFrom: 2023,
			startFromMedia: 0,
			maxMediaDuration: null,
			premountDisplay: null,
			postmountDisplay: null,
			video: {
				durationInFrames: 2423,
				fps: 30,
				height: 1080,
				width: 1920,
				id: 'main',
				// @ts-expect-error
				component: {
					_payload: {
						_status: 1,
					},
				},
				props: {},
				nonce: [[0, 16]],
			},
			windowWidth: 1414.203125,
		}),
	).toEqual({
		marginLeft: 1154.0226668902187,
		premountWidth: null,
		postmountWidth: null,
		width: 227.18045810978126,
		naturalWidth: 227.18045810978126,
	});
});
test('Should test timeline sequence layout with max media duration', () => {
	expect(
		getTimelineSequenceLayout({
			durationInFrames: 400,
			startFrom: 2023,
			maxMediaDuration: 400,
			startFromMedia: 10,
			premountDisplay: null,
			postmountDisplay: null,
			video: {
				durationInFrames: 2423,
				fps: 30,
				height: 1080,
				width: 1920,
				id: 'main',
				// @ts-expect-error
				component: {
					_payload: {
						_status: 1,
					},
				},
				props: {},
				nonce: [[0, 16]],
			},
			windowWidth: 1414.203125,
		}),
	).toEqual({
		marginLeft: 1154.0226668902187,
		premountWidth: null,
		postmountWidth: null,
		width: 221.47594665703676,
		naturalWidth: 221.47594665703676,
	});
});

test('naturalWidth > width when segment is clipped by timeline end', () => {
	// Segment of 100 frames starting at frame 250 in a 300-frame composition
	// startFrom + durationInFrames = 350 > 300, so it gets clipped
	const clipped = getTimelineSequenceLayout({
		durationInFrames: 100,
		startFrom: 250,
		startFromMedia: 0,
		maxMediaDuration: null,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(300),
		windowWidth: 1000,
	});

	expect(clipped.naturalWidth).toBeGreaterThan(clipped.width);
});

test('naturalWidth === width when segment fits within timeline', () => {
	// Segment of 100 frames starting at frame 100 in a 300-frame comp
	// startFrom + durationInFrames = 200 < 300, so no clipping
	const result = getTimelineSequenceLayout({
		durationInFrames: 100,
		startFrom: 100,
		startFromMedia: 0,
		maxMediaDuration: null,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(300),
		windowWidth: 1000,
	});

	expect(result.naturalWidth).toBe(result.width);
});

test('one-frame segments have a one-frame width', () => {
	const result = getTimelineSequenceLayout({
		durationInFrames: 1,
		startFrom: 0,
		startFromMedia: 0,
		maxMediaDuration: null,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(300),
		windowWidth: 1000,
	});

	expect(result.width).toBe(2.226666666666667);
	expect(result.naturalWidth).toBe(2.226666666666667);
});

test('adjacent sequences have no visual gap', () => {
	const first = getTimelineSequenceLayout({
		durationInFrames: 23.5,
		startFrom: 0,
		startFromMedia: 0,
		maxMediaDuration: null,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(120),
		windowWidth: 1000,
	});
	const second = getTimelineSequenceLayout({
		durationInFrames: 20,
		startFrom: 23.5,
		startFromMedia: 0,
		maxMediaDuration: null,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(120),
		windowWidth: 1000,
	});

	expect(first.marginLeft + first.width + SEQUENCE_BORDER_WIDTH).toBe(
		second.marginLeft,
	);
});

test('audio layer width uses fractional maxMediaDuration', () => {
	const floored = getTimelineSequenceLayout({
		durationInFrames: 30,
		startFrom: 0,
		startFromMedia: 0,
		maxMediaDuration: 23,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(120),
		windowWidth: 1000,
	});
	const fractional = getTimelineSequenceLayout({
		durationInFrames: 30,
		startFrom: 0,
		startFromMedia: 0,
		maxMediaDuration: 23.5,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(120),
		windowWidth: 1000,
	});

	expect(fractional.width).toBeGreaterThan(floored.width);
	expect(fractional.naturalWidth).toBeGreaterThan(floored.naturalWidth);
});

test('media trimmed past its duration has zero width', () => {
	const result = getTimelineSequenceLayout({
		durationInFrames: 300,
		startFrom: 0,
		startFromMedia: 500,
		maxMediaDuration: 300,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(300),
		windowWidth: 1000,
	});

	expect(result.width).toBe(0);
	expect(result.naturalWidth).toBe(0);
});

test('media trimmed past its duration and timeline end has zero width', () => {
	const result = getTimelineSequenceLayout({
		durationInFrames: 200,
		startFrom: 200,
		startFromMedia: 500,
		maxMediaDuration: 300,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(300),
		windowWidth: 1000,
	});

	expect(result.width).toBe(0);
	expect(result.naturalWidth).toBe(0);
});

test('Loop overshoot: naturalWidth > width when total loop duration exceeds comp', () => {
	// 4 full iterations of 100 frames = 400, but comp is only 350
	const overshoot = getTimelineSequenceLayout({
		durationInFrames: 400,
		startFrom: 0,
		startFromMedia: 0,
		maxMediaDuration: null,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(350),
		windowWidth: 1000,
	});

	expect(overshoot.naturalWidth).toBeGreaterThan(overshoot.width);

	// When loop fits exactly, naturalWidth === width
	const exact = getTimelineSequenceLayout({
		durationInFrames: 350,
		startFrom: 0,
		startFromMedia: 0,
		maxMediaDuration: null,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(350),
		windowWidth: 1000,
	});

	expect(exact.naturalWidth).toBe(exact.width);
});

test('naturalWidth is constrained by maxMediaDuration but not by timeline end', () => {
	// Segment of 200 frames, media only 150 frames, starts near timeline end
	// Both timeline end and maxMediaDuration clip width,
	// but only maxMediaDuration clips naturalWidth
	const clippedByBoth = getTimelineSequenceLayout({
		durationInFrames: 200,
		startFrom: 800,
		startFromMedia: 0,
		maxMediaDuration: 150,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(900),
		windowWidth: 1000,
	});

	expect(clippedByBoth.naturalWidth).toBeGreaterThan(clippedByBoth.width);

	// Same segment but not clipped by timeline end (starts earlier)
	// Both should have the same behavior
	const clippedByMediaOnly = getTimelineSequenceLayout({
		durationInFrames: 200,
		startFrom: 100,
		startFromMedia: 0,
		maxMediaDuration: 150,
		premountDisplay: null,
		postmountDisplay: null,
		video: makeVideoConfig(900),
		windowWidth: 1000,
	});

	// When not clipped by timeline end, width === naturalWidth,
	// both constrained by maxMediaDuration
	expect(clippedByMediaOnly.naturalWidth).toBe(clippedByMediaOnly.width);
});
