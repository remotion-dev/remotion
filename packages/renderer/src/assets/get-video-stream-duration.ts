import execa from 'execa';
import type {FfmpegExecutable} from '../ffmpeg-executable';
import {pLimit} from '../p-limit';

type Result = {
	duration: number | null;
};

const durationOfAssetCache: Record<string, Result> = {};

const limit = pLimit(1);

async function getVideoStreamDurationUnlimited(
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<Result> {
	if (durationOfAssetCache[src]) {
		return durationOfAssetCache[src];
	}

	const args = [
		['-v', 'error'],
		['-select_streams', 'v:0'],
		['-show_entries', 'stream=duration'],
		[src],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = await execa(ffprobeExecutable ?? 'ffprobe', args);

	const duration = task.stdout.match(/duration=([0-9.]+)/);

	const result: Result = {
		duration: duration ? parseFloat(duration[1]) : null,
	};

	durationOfAssetCache[src] = result;

	return result;
}

export const getVideoStreamDuration = (
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<Result> => {
	return limit(() => getVideoStreamDurationUnlimited(src, ffprobeExecutable));
};
