import {expect, test} from 'bun:test';
import {
	getMissedFramesForCodecs,
	getMissedFramesWithFractionalTrimApplied,
} from './test-utils';

test(
	'should render correct frames from embedded videos',
	async () => {
		const missedFrames = await getMissedFramesForCodecs();
		expect(missedFrames.webm.normal).toBeLessThanOrEqual(8);
		expect(missedFrames.webm.offthread).toBe(0);
		expect(missedFrames.mp4.normal).toBeLessThanOrEqual(8);
		expect(missedFrames.mp4.offthread).toBe(0);
	},
	{retry: 3, timeout: 90000},
);

test(
	'should select the containing OffthreadVideo frame for a fractional trim',
	async () => {
		const missedFrames = await getMissedFramesWithFractionalTrimApplied();
		expect(missedFrames).toBe(0);
	},
	{retry: 3},
);
