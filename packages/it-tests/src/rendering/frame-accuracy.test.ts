import {expect, test} from 'bun:test';
import {getMissedFramesforCodec} from './test-utils';

test(
	'should render correct frames from embedded videos - WebM onthread',
	async () => {
		const missedFrames = await getMissedFramesforCodec('webm', 'normal');
		expect(missedFrames).toBeLessThanOrEqual(8);
	},
	{
		timeout: 30000,
	},
);

test(
	'should render correct frames from embedded videos - WebM offthread',
	async () => {
		const missedFrames = await getMissedFramesforCodec('webm', 'offthread');
		expect(missedFrames).toBe(0);
	},
	{
		timeout: 30000,
	},
);

test(
	'should render correct frames from embedded videos - MP4 onthread',
	async () => {
		const missedFrames = await getMissedFramesforCodec('mp4', 'normal');
		expect(missedFrames).toBeLessThanOrEqual(8);
	},
	{
		timeout: 30000,
	},
);

test(
	'should render correct frames from embedded videos - MP4 offthread',
	async () => {
		const missedFrames = await getMissedFramesforCodec('mp4', 'offthread');
		expect(missedFrames).toBe(0);
	},
	{
		timeout: 30000,
	},
);
