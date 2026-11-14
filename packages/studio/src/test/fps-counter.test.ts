import {expect, test} from 'bun:test';
import {getExpectedFps, getRefreshRate} from '../components/FpsCounter';

const frameTimes = (gaps: number[]) => {
	const times = [0];
	for (const gap of gaps) {
		times.push(times[times.length - 1] + gap);
	}

	return times;
};

test('estimates a 60Hz display despite jitter and a long frame', () => {
	const gaps = [16.6, 16.8, 16.7, 16.5, 16.9, 120, 16.7, 16.6, 16.8, 16.7];
	expect(getRefreshRate(frameTimes(gaps))).toBeCloseTo(60, 0);
});

test('estimates a 120Hz display', () => {
	expect(
		getRefreshRate(frameTimes(new Array(29).fill(1000 / 120))),
	).toBeCloseTo(120, 0);
});

test('needs two frame times', () => {
	expect(getRefreshRate([5])).toBe(null);
});

test('a 30fps comp at 4x on a 60Hz display only has to reach 60', () => {
	expect(getExpectedFps({fps: 30, playbackSpeed: 4, refreshRate: 60})).toBe(60);
});

test('a 30fps comp at 1x still has to reach 30, so 5 painted frames a second stays red', () => {
	const expected = getExpectedFps({fps: 30, playbackSpeed: 1, refreshRate: 60});
	expect(expected).toBe(30);
	expect(expected * 0.9).toBeGreaterThan(5);
});

test('reverse playback uses the absolute speed', () => {
	expect(getExpectedFps({fps: 30, playbackSpeed: -2, refreshRate: 120})).toBe(
		60,
	);
});

test('falls back to speed × fps until the refresh rate is known', () => {
	expect(getExpectedFps({fps: 30, playbackSpeed: 4, refreshRate: null})).toBe(
		120,
	);
});
