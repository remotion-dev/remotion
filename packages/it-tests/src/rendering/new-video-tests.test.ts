//1. frame accuracy
//2. playback rate
//3. trims

import {expect, test} from 'bun:test';
import {
	getMissedFramesforCodec,
	getMissedFramesWithPlaybackrate,
	getMissedFramesWithTrimApplied,
} from './test-utils';

test(
	'should render correct frames from embedded videos - WebM codec video',
	async () => {
		const missedFrames = await getMissedFramesforCodec('webm', 'codec');
		expect(missedFrames).toBe(0);
	},
	{
		timeout: 30000,
	},
);

test(
	'should render correct frames from embedded videos - MP4 codec video',
	async () => {
		const missedFrames = await getMissedFramesforCodec('mp4', 'codec');
		expect(missedFrames).toBeLessThanOrEqual(0);
	},
	{
		timeout: 40000,
	},
);

//playback rate, ensure no frames are missed

test(
	'should render frames with correct playback speed - MP4 codec video',
	async () => {
		const missedFrames = await getMissedFramesWithPlaybackrate('codec');
		expect(missedFrames).toBeLessThanOrEqual(0);
	},
	{
		timeout: 40000,
	},
);

//should ensure that trimmed version is as expected

test(
	'should render correct frames after applying trim - MP4 codec video',
	async () => {
		const missedFrames = await getMissedFramesWithTrimApplied('codec');
		expect(missedFrames).toBeLessThanOrEqual(0);
	},
	{
		timeout: 40000,
	},
);
