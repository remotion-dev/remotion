import {expect, test} from 'bun:test';
import {
	clampTimelineZoom,
	getTimelineMaxZoom,
	normalizedToTimelineZoom,
	sliderValueToTimelineZoom,
	TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
	TIMELINE_MIN_ZOOM,
	TIMELINE_ZOOM_SLIDER_PROPS,
	timelineZoomToNormalized,
	timelineZoomToSliderValue,
} from '../helpers/get-timeline-max-zoom';
import {TIMELINE_PADDING} from '../helpers/timeline-layout';

test('max zoom gives every frame a fixed width', () => {
	const durationInFrames = 60 * 60 * 30;
	const timelineViewportWidth = 1200;
	const maxZoom = getTimelineMaxZoom({
		durationInFrames,
		timelineViewportWidth,
	});
	const usableTimelineWidth =
		maxZoom * timelineViewportWidth - TIMELINE_PADDING * 2;

	expect(usableTimelineWidth / durationInFrames).toBe(
		TIMELINE_FRAME_WIDTH_AT_MAX_ZOOM,
	);
});

test('short compositions stay fitted to the viewport', () => {
	expect(
		getTimelineMaxZoom({durationInFrames: 10, timelineViewportWidth: 1200}),
	).toBe(TIMELINE_MIN_ZOOM);
});

test('clamps and rounds timeline zoom', () => {
	const timelineViewportWidth = 1200;
	expect(
		clampTimelineZoom({
			zoom: 0.2,
			durationInFrames: 150,
			timelineViewportWidth,
		}),
	).toBe(TIMELINE_MIN_ZOOM);
	expect(
		clampTimelineZoom({
			zoom: 3.16,
			durationInFrames: 300,
			timelineViewportWidth,
		}),
	).toBe(3.2);
	const maxZoom = getTimelineMaxZoom({
		durationInFrames: 150,
		timelineViewportWidth,
	});
	expect(
		clampTimelineZoom({
			zoom: 9999,
			durationInFrames: 150,
			timelineViewportWidth,
		}),
	).toBe(maxZoom);
	expect(
		clampTimelineZoom({
			zoom: 9999,
			durationInFrames: 60 * 60 * 30,
			timelineViewportWidth,
		}),
	).toBe(
		getTimelineMaxZoom({
			durationInFrames: 60 * 60 * 30,
			timelineViewportWidth,
		}),
	);
});

test('timeline zoom slider maps min and max', () => {
	const maxZoom = getTimelineMaxZoom({
		durationInFrames: 60 * 60 * 30,
		timelineViewportWidth: 1200,
	});

	expect(timelineZoomToSliderValue({zoom: TIMELINE_MIN_ZOOM, maxZoom})).toBe(0);
	expect(timelineZoomToSliderValue({zoom: maxZoom, maxZoom})).toBe(
		TIMELINE_ZOOM_SLIDER_PROPS.max,
	);
	expect(sliderValueToTimelineZoom({sliderValue: 0, maxZoom})).toBe(
		TIMELINE_MIN_ZOOM,
	);
	expect(
		sliderValueToTimelineZoom({
			sliderValue: TIMELINE_ZOOM_SLIDER_PROPS.max,
			maxZoom,
		}),
	).toBe(maxZoom);
});

test('normalized timeline zoom maps min, midpoint and max', () => {
	const maxZoom = 6;

	expect(normalizedToTimelineZoom({normalized: 0, maxZoom})).toBe(
		TIMELINE_MIN_ZOOM,
	);
	expect(normalizedToTimelineZoom({normalized: 0.5, maxZoom})).toBeCloseTo(
		Math.sqrt(maxZoom),
	);
	expect(normalizedToTimelineZoom({normalized: 1, maxZoom})).toBe(maxZoom);
	expect(
		timelineZoomToNormalized({zoom: Math.sqrt(maxZoom), maxZoom}),
	).toBeCloseTo(0.5);
});

test('timeline zoom slider increases with zoom', () => {
	const maxZoom = getTimelineMaxZoom({
		durationInFrames: 60 * 60 * 30,
		timelineViewportWidth: 1200,
	});

	expect(timelineZoomToSliderValue({zoom: 100, maxZoom})).toBeGreaterThan(
		timelineZoomToSliderValue({zoom: 5, maxZoom}),
	);
});
