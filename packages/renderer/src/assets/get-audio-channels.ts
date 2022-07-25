import execa from 'execa';
import type {FfmpegExecutable} from '../ffmpeg-executable';
import {pLimit} from '../p-limit';

type Result = {
	channels: number;
	duration: number | null;
};

const durationOfAssetCache: Record<string, Result> = {};

const limit = pLimit(1);

async function getAudioChannelsAndDurationUnlimited(
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<Result> {
	if (durationOfAssetCache[src]) {
		return durationOfAssetCache[src];
	}

	const args = [
		['-v', 'error'],
		['-show_entries', 'stream=channels:format=duration'],
		['-of', 'default=nw=1'],
		[src],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = await execa(ffprobeExecutable ?? 'ffprobe', args);

	const channels = task.stdout.match(/channels=([0-9]+)/);
	const duration = task.stdout.match(/duration=([0-9.]+)/);

	const result: Result = {
		channels: channels ? parseInt(channels[1], 10) : 0,
		duration: duration ? parseFloat(duration[1]) : null,
	};

	durationOfAssetCache[src] = result;

	return result;
}

export const getAudioChannelsAndDuration = (
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<Result> => {
	return limit(() =>
		getAudioChannelsAndDurationUnlimited(src, ffprobeExecutable)
	);
};
