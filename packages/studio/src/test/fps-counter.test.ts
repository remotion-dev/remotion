import {expect, test} from 'bun:test';
import {getFramesAdvancedPerSecond} from '../components/FpsCounter';

// One sample per display refresh, like the counter gets during playback.
const makeSamples = ({
	refreshRate,
	fps,
	playbackSpeed,
	count,
	startFrame = 0,
	durationInFrames = Infinity,
}: {
	refreshRate: number;
	fps: number;
	playbackSpeed: number;
	count: number;
	startFrame?: number;
	durationInFrames?: number;
}) => {
	return new Array(count).fill(true).map((_, i) => {
		const time = (i * 1000) / refreshRate;
		const advanced = Math.floor((time / 1000) * fps * playbackSpeed);
		const frame = Number.isFinite(durationInFrames)
			? (((startFrame + advanced) % durationInFrames) + durationInFrames) %
				durationInFrames
			: startFrame + advanced;
		return {time, frame};
	});
};

test('measures 30fps at 1x on a 60Hz display', () => {
	const samples = makeSamples({
		refreshRate: 60,
		fps: 30,
		playbackSpeed: 1,
		count: 61,
	}).filter((sample, i, arr) => i === 0 || sample.frame !== arr[i - 1].frame);
	expect(getFramesAdvancedPerSecond(samples, 1)).toBeCloseTo(30, 0);
});

test('measures 120fps at 4x even though the display only updates 60 times', () => {
	const samples = makeSamples({
		refreshRate: 60,
		fps: 30,
		playbackSpeed: 4,
		count: 15,
	});
	expect(getFramesAdvancedPerSecond(samples, 4)).toBeCloseTo(120, 0);
});

test('measures 60fps at 2x', () => {
	const samples = makeSamples({
		refreshRate: 60,
		fps: 30,
		playbackSpeed: 2,
		count: 15,
	});
	expect(getFramesAdvancedPerSecond(samples, 2)).toBeCloseTo(60, 0);
});

test('ignores the jump back to the start when playback loops', () => {
	const samples = makeSamples({
		refreshRate: 60,
		fps: 30,
		playbackSpeed: 4,
		count: 15,
		startFrame: 90,
		durationInFrames: 100,
	});
	expect(samples.some((s, i) => i > 0 && s.frame < samples[i - 1].frame)).toBe(
		true,
	);
	expect(getFramesAdvancedPerSecond(samples, 4)).toBeCloseTo(120, 0);
});

test('measures reverse playback', () => {
	const samples = makeSamples({
		refreshRate: 60,
		fps: 30,
		playbackSpeed: -2,
		count: 15,
		startFrame: 500,
	});
	expect(getFramesAdvancedPerSecond(samples, -2)).toBeCloseTo(60, 0);
});

test('needs two samples', () => {
	expect(getFramesAdvancedPerSecond([{time: 0, frame: 0}], 1)).toBe(null);
});
