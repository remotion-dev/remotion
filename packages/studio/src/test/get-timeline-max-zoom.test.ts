import {expect, test} from 'bun:test';
import {
	clampTimelineZoom,
	getTimelineMinZoom,
	getTimelineWidth,
	getTimelineZoom,
	normalizedToTimelineZoom,
	sliderValueToTimelineZoom,
	TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
	TIMELINE_ZOOM_SLIDER_PROPS,
	timelineZoomToNormalized,
	timelineZoomToSliderValue,
} from '../helpers/get-timeline-max-zoom';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';

test('maximum zoom is a fixed number of pixels per frame', () => {
	const durationInFrames = 60 * 60 * 30;
	const timelineWidth = getTimelineWidth({
		durationInFrames,
		zoom: TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
	});
	const usableTimelineWidth = timelineWidth - TIMELINE_PADDING * 2;

	expect(usableTimelineWidth / durationInFrames).toBe(
		TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
	);
});

test('minimum zoom fits a long composition into the viewport', () => {
	const durationInFrames = 300;
	const timelineViewportWidth = 1200;
	const minZoom = getTimelineMinZoom({
		durationInFrames,
		timelineViewportWidth,
	});

	expect(getTimelineWidth({durationInFrames, zoom: minZoom})).toBe(
		timelineViewportWidth,
	);
});

test('short compositions do not exceed the maximum frame width', () => {
	expect(
		getTimelineMinZoom({durationInFrames: 10, timelineViewportWidth: 1200}),
	).toBe(TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM);
});

test('clamps and rounds timeline zoom in pixels per frame', () => {
	const durationInFrames = 600;
	const timelineViewportWidth = 1200;
	const minZoom = getTimelineMinZoom({
		durationInFrames,
		timelineViewportWidth,
	});

	expect(
		clampTimelineZoom({
			zoom: 0.2,
			durationInFrames,
			timelineViewportWidth,
		}),
	).toBe(minZoom);
	expect(
		clampTimelineZoom({
			zoom: 3.1615,
			durationInFrames,
			timelineViewportWidth,
		}),
	).toBe(3.162);
	expect(
		clampTimelineZoom({
			zoom: 9999,
			durationInFrames,
			timelineViewportWidth,
		}),
	).toBe(TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM);
});

test('uses fit-to-viewport zoom when no persisted zoom exists', () => {
	const durationInFrames = 300;
	const timelineViewportWidth = 1200;

	expect(
		getTimelineZoom({
			durationInFrames,
			timelineViewportWidth,
			zoom: null,
		}),
	).toBe(getTimelineMinZoom({durationInFrames, timelineViewportWidth}));
});

test('timeline zoom slider maps fit and maximum zoom', () => {
	const minZoom = 2;

	expect(timelineZoomToSliderValue({zoom: minZoom, minZoom})).toBe(0);
	expect(
		timelineZoomToSliderValue({
			zoom: TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
			minZoom,
		}),
	).toBe(TIMELINE_ZOOM_SLIDER_PROPS.max);
	expect(sliderValueToTimelineZoom({sliderValue: 0, minZoom})).toBe(minZoom);
	expect(
		sliderValueToTimelineZoom({
			sliderValue: TIMELINE_ZOOM_SLIDER_PROPS.max,
			minZoom,
		}),
	).toBe(TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM);
});

test('normalized timeline zoom maps minimum, midpoint and maximum', () => {
	const minZoom = 2;
	const midpoint = Math.sqrt(minZoom * TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM);

	expect(normalizedToTimelineZoom({normalized: 0, minZoom})).toBe(minZoom);
	expect(normalizedToTimelineZoom({normalized: 0.5, minZoom})).toBeCloseTo(
		midpoint,
	);
	expect(normalizedToTimelineZoom({normalized: 1, minZoom})).toBe(
		TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
	);
	expect(timelineZoomToNormalized({zoom: midpoint, minZoom})).toBeCloseTo(0.5);
});
