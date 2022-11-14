import execa from 'execa';
import type {FfmpegExecutable} from '../ffmpeg-executable';
import {getExecutableBinary} from '../ffmpeg-flags';
import {pLimit} from '../p-limit';
import type {DownloadMap, VideoDurationResult} from './download-map';

const limit = pLimit(1);

const parseAlternativeDuration = (stdout: string): number | null => {
	const webmDuration = stdout.match(
		/TAG:DURATION=([0-9.]+):([0-9.]+):([0-9.]+)/
	);
	if (!webmDuration) {
		return null;
	}

	const [, hours, minutes, seconds] = webmDuration;

	const hoursAsNumber = Number(hours);

	if (Number.isNaN(hoursAsNumber)) {
		return null;
	}

	const minutesAsNumber = Number(minutes);

	if (Number.isNaN(minutesAsNumber)) {
		return null;
	}

	const secondsAsNumber = Number(seconds);
	if (Number.isNaN(secondsAsNumber)) {
		return null;
	}

	return secondsAsNumber + minutesAsNumber * 60 + hoursAsNumber * 3600;
};

export const parseVideoStreamDuration = (stdout: string) => {
	const duration = stdout.match(/duration=([0-9.]+)/);
	const alternativeDuration = parseAlternativeDuration(stdout);
	const fps = stdout.match(/r_frame_rate=([0-9.]+)\/([0-9.]+)/);

	const result: VideoDurationResult = {
		duration: duration ? parseFloat(duration[1]) : alternativeDuration,
		fps: fps ? parseInt(fps[1], 10) / parseInt(fps[2], 10) : null,
	};

	return result;
};

async function getVideoStreamDurationUnlimited(
	downloadMap: DownloadMap,
	src: string,
	ffprobeExecutable: FfmpegExecutable,
	remotionRoot: string
): Promise<VideoDurationResult> {
	if (downloadMap.videoDurationResultCache[src]) {
		return downloadMap.videoDurationResultCache[src];
	}

	const args = [
		['-v', 'error'],
		['-select_streams', 'v:0'],
		['-show_entries', 'stream'],
		[src],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = await execa(
		await getExecutableBinary(ffprobeExecutable, remotionRoot, 'ffprobe'),
		args
	);

	return parseVideoStreamDuration(task.stdout);
}

export const getVideoStreamDuration = (
	downloadMap: DownloadMap,
	src: string,
	ffprobeExecutable: FfmpegExecutable,
	remotionRoot: string
): Promise<VideoDurationResult> => {
	return limit(() =>
		getVideoStreamDurationUnlimited(
			downloadMap,
			src,
			ffprobeExecutable,
			remotionRoot
		)
	);
};
