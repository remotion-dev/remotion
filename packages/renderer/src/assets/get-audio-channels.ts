import {callFf} from '../call-ffmpeg';
import type {LogLevel} from '../log-level';
import {pLimit} from '../p-limit';
import type {
	AudioChannelsAndDurationResultCache,
	DownloadMap,
} from './download-map';

const limit = pLimit(1);

export const getAudioChannelsAndDurationWithoutCache = async (
	src: string,
	indent: boolean,
	logLevel: LogLevel,
	binariesDirectory: string | null,
) => {
	const args = [
		['-v', 'error'],
		['-show_entries', 'stream=channels:format=duration'],
		['-of', 'default=nw=1'],
		[src],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	const task = await callFf({
		bin: 'ffprobe',
		args,
		indent,
		logLevel,
		binariesDirectory,
	});

	const channels = task.stdout.match(/channels=([0-9]+)/);
	const duration = task.stdout.match(/duration=([0-9.]+)/);

	const result: AudioChannelsAndDurationResultCache = {
		channels: channels ? parseInt(channels[1], 10) : 0,
		duration: duration ? parseFloat(duration[1]) : null,
	};
	return result;
};

async function getAudioChannelsAndDurationUnlimited({
	downloadMap,
	src,
	indent,
	logLevel,
	binariesDirectory,
}: {
	downloadMap: DownloadMap;
	src: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
}): Promise<AudioChannelsAndDurationResultCache> {
	if (downloadMap.durationOfAssetCache[src]) {
		return downloadMap.durationOfAssetCache[src];
	}

	const result = await getAudioChannelsAndDurationWithoutCache(
		src,
		indent,
		logLevel,
		binariesDirectory,
	);

	downloadMap.durationOfAssetCache[src] = result;

	return result;
}

export const getAudioChannelsAndDuration = ({
	downloadMap,
	src,
	indent,
	logLevel,
	binariesDirectory,
}: {
	downloadMap: DownloadMap;
	src: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
}): Promise<AudioChannelsAndDurationResultCache> => {
	return limit(() =>
		getAudioChannelsAndDurationUnlimited({
			downloadMap,
			src,
			indent,
			logLevel,
			binariesDirectory,
		}),
	);
};
