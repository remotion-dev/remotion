import {expect, test} from 'bun:test';
import {
	clampTimelineZoom,
	getTimelineMaxZoom,
	normalizedToTimelineZoom,
	sliderValueToTimelineZoom,
	TIMELINE_FRAMES_VISIBLE_AT_MAX_ZOOM,
	TIMELINE_MAX_ZOOM_FLOOR,
	TIMELINE_MIN_ZOOM,
	TIMELINE_ZOOM_SLIDER_PROPS,
	timelineZoomToNormalized,
	timelineZoomToSliderValue,
} from '../helpers/get-timeline-max-zoom';

test('keeps the previous max zoom for short compositions', () => {
	expect(getTimelineMaxZoom(1)).toBe(TIMELINE_MAX_ZOOM_FLOOR);
	expect(getTimelineMaxZoom(30)).toBe(TIMELINE_MAX_ZOOM_FLOOR);
	expect(getTimelineMaxZoom(150)).toBe(TIMELINE_MAX_ZOOM_FLOOR);
});

test('raises max zoom so longer compositions can still show individual frames', () => {
	expect(getTimelineMaxZoom(151)).toBe(5.1);
	expect(getTimelineMaxZoom(300)).toBe(10);
	expect(getTimelineMaxZoom(60 * 60 * 30)).toBe(3600);
	expect(getTimelineMaxZoom(2 * 60 * 60 * 30)).toBe(7200);
});

test('max zoom shows a fixed number of frames in the viewport', () => {
	const oneHourInFrames = 60 * 60 * 30;
	const maxZoom = getTimelineMaxZoom(oneHourInFrames);

	expect(oneHourInFrames / maxZoom).toBe(TIMELINE_FRAMES_VISIBLE_AT_MAX_ZOOM);
});

test('clamps and rounds timeline zoom', () => {
	expect(clampTimelineZoom({zoom: 0.2, durationInFrames: 150})).toBe(
		TIMELINE_MIN_ZOOM,
	);
	expect(clampTimelineZoom({zoom: 3.16, durationInFrames: 150})).toBe(3.2);
	expect(clampTimelineZoom({zoom: 9999, durationInFrames: 150})).toBe(
		TIMELINE_MAX_ZOOM_FLOOR,
	);
	expect(clampTimelineZoom({zoom: 9999, durationInFrames: 60 * 60 * 30})).toBe(
		3600,
	);
});

test('timeline zoom slider maps min and max', () => {
	const maxZoom = getTimelineMaxZoom(60 * 60 * 30);

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
	const maxZoom = getTimelineMaxZoom(60 * 60 * 30);

	expect(timelineZoomToSliderValue({zoom: 100, maxZoom})).toBeGreaterThan(
		timelineZoomToSliderValue({zoom: 5, maxZoom}),
	);
});
