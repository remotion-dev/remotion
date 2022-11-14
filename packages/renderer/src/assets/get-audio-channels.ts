import execa from 'execa';
import type {FfmpegExecutable} from '../ffmpeg-executable';
import {getExecutableBinary} from '../ffmpeg-flags';
import {pLimit} from '../p-limit';
import type {
	AudioChannelsAndDurationResultCache,
	DownloadMap,
} from './download-map';

const limit = pLimit(1);

async function getAudioChannelsAndDurationUnlimited(
	downloadMap: DownloadMap,
	src: string,
	ffprobeExecutable: FfmpegExecutable,
	remotionRoot: string
): Promise<AudioChannelsAndDurationResultCache> {
	if (downloadMap.durationOfAssetCache[src]) {
		return downloadMap.durationOfAssetCache[src];
	}

	const args = [
		['-v', 'error'],
		['-show_entries', 'stream=channels:format=duration'],
		['-of', 'default=nw=1'],
		[src],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = await execa(
		await getExecutableBinary(ffprobeExecutable, remotionRoot, 'ffprobe'),
		args
	);

	const channels = task.stdout.match(/channels=([0-9]+)/);
	const duration = task.stdout.match(/duration=([0-9.]+)/);

	const result: AudioChannelsAndDurationResultCache = {
		channels: channels ? parseInt(channels[1], 10) : 0,
		duration: duration ? parseFloat(duration[1]) : null,
	};

	downloadMap.durationOfAssetCache[src] = result;

	return result;
}

export const getAudioChannelsAndDuration = (
	downloadMap: DownloadMap,
	src: string,
	ffprobeExecutable: FfmpegExecutable,
	remotionRoot: string
): Promise<AudioChannelsAndDurationResultCache> => {
	return limit(() =>
		getAudioChannelsAndDurationUnlimited(
			downloadMap,
			src,
			ffprobeExecutable,
			remotionRoot
		)
	);
};
