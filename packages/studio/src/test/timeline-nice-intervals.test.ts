import {expect, test} from 'bun:test';
import {
	getNiceSecondInterval,
	getTimelineTickScale,
} from '../components/Timeline/TimelineTimeIndicators';

test('getNiceSecondInterval snaps to exact nice values', () => {
	expect(getNiceSecondInterval(1)).toBe(1);
	expect(getNiceSecondInterval(2)).toBe(2);
	expect(getNiceSecondInterval(5)).toBe(5);
	expect(getNiceSecondInterval(10)).toBe(10);
	expect(getNiceSecondInterval(15)).toBe(15);
	expect(getNiceSecondInterval(30)).toBe(30);
	expect(getNiceSecondInterval(60)).toBe(60);
	expect(getNiceSecondInterval(300)).toBe(300);
	expect(getNiceSecondInterval(600)).toBe(600);
	expect(getNiceSecondInterval(3600)).toBe(3600);
});

test('getNiceSecondInterval rounds up to next nice value', () => {
	expect(getNiceSecondInterval(0.5)).toBe(1);
	expect(getNiceSecondInterval(1.5)).toBe(2);
	expect(getNiceSecondInterval(3)).toBe(5);
	expect(getNiceSecondInterval(7)).toBe(10);
	expect(getNiceSecondInterval(12)).toBe(15);
	expect(getNiceSecondInterval(20)).toBe(30);
	expect(getNiceSecondInterval(45)).toBe(60);
	expect(getNiceSecondInterval(90)).toBe(120);
	expect(getNiceSecondInterval(150)).toBe(180);
	expect(getNiceSecondInterval(250)).toBe(300);
	expect(getNiceSecondInterval(500)).toBe(600);
	expect(getNiceSecondInterval(700)).toBe(900);
	expect(getNiceSecondInterval(1000)).toBe(1200);
	expect(getNiceSecondInterval(1500)).toBe(1800);
	expect(getNiceSecondInterval(2000)).toBe(3600);
});

test('getNiceSecondInterval handles the 108000-frame case', () => {
	// 108000 frames at 30fps = 3600 seconds
	// With ~932px width, rawNthSecond ≈ 326.16
	// Should snap to 600 (10 minutes), not 327 (5min 27sec)
	expect(getNiceSecondInterval(326.16)).toBe(600);
});

test('getNiceSecondInterval handles values beyond 1 hour', () => {
	// Falls back to Math.ceil(raw / 3600) * 3600
	expect(getNiceSecondInterval(4000)).toBe(7200);
	expect(getNiceSecondInterval(7200)).toBe(7200);
	expect(getNiceSecondInterval(10000)).toBe(10800);
});

test('uses individual frames when they have enough visual space', () => {
	expect(
		getTimelineTickScale({
			fps: 30,
			frameInterval: 15,
			rawSecondMarkerEveryNth: 0.5,
		}),
	).toEqual({
		labelEverySeconds: 1,
		mediumTickEvery: {interval: 2, unit: 'frames'},
		minorTickEvery: {interval: 1, unit: 'frames'},
	});
});

test('uses frame intervals which divide a second while zoomed in', () => {
	expect(
		getTimelineTickScale({
			fps: 30,
			frameInterval: 3,
			rawSecondMarkerEveryNth: 0.5,
		}),
	).toEqual({
		labelEverySeconds: 1,
		mediumTickEvery: {interval: 10, unit: 'frames'},
		minorTickEvery: {interval: 2, unit: 'frames'},
	});
});

test('uses clean time subdivisions for long compositions', () => {
	expect(
		getTimelineTickScale({
			fps: 30,
			frameInterval: 0.004541666666666667,
			rawSecondMarkerEveryNth: 757,
		}),
	).toEqual({
		labelEverySeconds: 900,
		mediumTickEvery: null,
		minorTickEvery: {interval: 180, unit: 'seconds'},
	});
});

test('keeps a ten-hour composition sparse and aligned', () => {
	expect(
		getTimelineTickScale({
			fps: 30,
			frameInterval: 1 / 1080,
			rawSecondMarkerEveryNth: 3708,
		}),
	).toEqual({
		labelEverySeconds: 7200,
		mediumTickEvery: {interval: 1800, unit: 'seconds'},
		minorTickEvery: {interval: 600, unit: 'seconds'},
	});
});
