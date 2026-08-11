import {expect, test} from 'bun:test';
import {
	getMissedFramesforCodec,
	getMissedFramesWithFractionalTrimApplied,
} from './test-utils';

test(
	'should render correct frames from embedded videos - WebM onthread',
	async () => {
		const missedFrames = await getMissedFramesforCodec('webm', 'normal');
		expect(missedFrames).toBeLessThanOrEqual(8);
	},
	{retry: 3},
);

test(
	'should render correct frames from embedded videos - WebM offthread',
	async () => {
		const missedFrames = await getMissedFramesforCodec('webm', 'offthread');
		expect(missedFrames).toBe(0);
	},
	{retry: 3},
);

test(
	'should render correct frames from embedded videos - MP4 onthread',
	async () => {
		const missedFrames = await getMissedFramesforCodec('mp4', 'normal');
		expect(missedFrames).toBeLessThanOrEqual(8);
	},
	{retry: 3},
);

test(
	'should render correct frames from embedded videos - MP4 offthread',
	async () => {
		const missedFrames = await getMissedFramesforCodec('mp4', 'offthread');
		expect(missedFrames).toBe(0);
	},
	{retry: 3},
);

test(
	'should select the containing OffthreadVideo frame for a fractional trim',
	async () => {
		const missedFrames = await getMissedFramesWithFractionalTrimApplied();
		expect(missedFrames).toBe(0);
	},
	{retry: 3},
);
