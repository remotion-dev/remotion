import execa from 'execa';
import type {FfmpegExecutable} from '../ffmpeg-executable';
import {pLimit} from '../p-limit';
import type {DownloadMap, VideoDurationResult} from './download-map';

const limit = pLimit(1);

async function getVideoStreamDurationUnlimited(
	downloadMap: DownloadMap,
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<VideoDurationResult> {
	if (downloadMap.videoDurationResultCache[src]) {
		return downloadMap.videoDurationResultCache[src];
	}

	const args = [
		['-v', 'error'],
		['-select_streams', 'v:0'],
		['-show_entries', 'stream=duration,r_frame_rate'],
		[src],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = await execa(ffprobeExecutable ?? 'ffprobe', args);

	const duration = task.stdout.match(/duration=([0-9.]+)/);
	const fps = task.stdout.match(/r_frame_rate=([0-9.]+)\/([0-9.]+)/);

	const result: VideoDurationResult = {
		duration: duration ? parseFloat(duration[1]) : null,
		fps: fps ? parseInt(fps[1], 10) / parseInt(fps[2], 10) : null,
	};

	downloadMap.videoDurationResultCache[src] = result;

	return result;
}

export const getVideoStreamDuration = (
	downloadMap: DownloadMap,
	src: string,
	ffprobeExecutable: FfmpegExecutable
): Promise<VideoDurationResult> => {
	return limit(() =>
		getVideoStreamDurationUnlimited(downloadMap, src, ffprobeExecutable)
	);
};
