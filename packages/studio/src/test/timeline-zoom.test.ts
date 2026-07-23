import {expect, test} from 'bun:test';
import {getFrameIncrementFromWidth} from '../components/Timeline/timeline-scroll-logic';
import {
	getMaxTimelineZoom,
	getTimelineZoomFromSliderValue,
	getTimelineZoomSliderValue,
	TIMELINE_MIN_ZOOM,
} from '../state/timeline-zoom';

test('maps the timeline zoom slider logarithmically', () => {
	expect(
		getTimelineZoomFromSliderValue({
			maxZoom: 100,
			sliderValue: 0,
		}),
	).toBe(1);
	expect(
		getTimelineZoomFromSliderValue({
			maxZoom: 100,
			sliderValue: 0.5,
		}),
	).toBe(10);
	expect(
		getTimelineZoomFromSliderValue({
			maxZoom: 100,
			sliderValue: 1,
		}),
	).toBe(100);
	expect(
		getTimelineZoomSliderValue({
			maxZoom: 100,
			zoom: 10,
		}),
	).toBeCloseTo(0.5);
});

test('makes each frame at least 20 pixels wide at maximum zoom', () => {
	const durationInFrames = 100;
	const timelineViewportWidth = 1000;
	const maxZoom = getMaxTimelineZoom({
		durationInFrames,
		timelineViewportWidth,
	});

	expect(maxZoom).toBe(2.1);
	expect(
		getFrameIncrementFromWidth(
			durationInFrames,
			timelineViewportWidth * maxZoom,
		),
	).toBeGreaterThanOrEqual(20);
	expect(
		getFrameIncrementFromWidth(
			durationInFrames,
			timelineViewportWidth * (maxZoom - 0.1),
		),
	).toBeLessThan(20);
});

test('supports maximum zoom levels above the old fixed limit', () => {
	expect(
		getMaxTimelineZoom({
			durationInFrames: 1000,
			timelineViewportWidth: 800,
		}),
	).toBe(25.1);
});

test('does not allow zooming out beyond the minimum zoom', () => {
	expect(
		getMaxTimelineZoom({
			durationInFrames: 10,
			timelineViewportWidth: 1000,
		}),
	).toBe(TIMELINE_MIN_ZOOM);
});

test('handles an unavailable timeline viewport', () => {
	expect(
		getMaxTimelineZoom({
			durationInFrames: 100,
			timelineViewportWidth: 0,
		}),
	).toBe(TIMELINE_MIN_ZOOM);
});
