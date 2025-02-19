import {callFf} from '../call-ffmpeg';
import type {LogLevel} from '../log-level';
import type {CancelSignal} from '../make-cancel-signal';
import {pLimit} from '../p-limit';
import type {
	AudioChannelsAndDurationResultCache,
	DownloadMap,
} from './download-map';

const limit = pLimit(1);

export const getAudioChannelsAndDurationWithoutCache = async ({
	src,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
}: {
	src: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
}) => {
	const args = [
		['-v', 'error'],
		['-select_streams', 'a:0'],
		[
			'-show_entries',
			'stream=channels:stream=start_time:format=duration:format=format_name',
		],
		['-of', 'default=nw=1'],
		[src],
	]
		.reduce<(string | null)[]>((acc, val) => acc.concat(val), [])
		.filter(Boolean) as string[];

	try {
		const task = await callFf({
			bin: 'ffprobe',
			args,
			indent,
			logLevel,
			binariesDirectory,
			cancelSignal,
		});
		const channels = task.stdout.match(/channels=([0-9]+)/);
		const duration = task.stdout.match(/duration=([0-9.]+)/);
		const startTime = task.stdout.match(/start_time=([0-9.]+)/);
		const container = task.stdout.match(/format_name=([a-zA-Z0-9.]+)/);

		const isMP3 = container ? container[1] === 'mp3' : false;

		const result: AudioChannelsAndDurationResultCache = {
			channels: channels ? parseInt(channels[1], 10) : 0,
			duration: duration ? parseFloat(duration[1]) : null,
			// We ignore the start time for MP3 because that is an inherent encoder thing
			// not in the sense that we want
			startTime: startTime ? (isMP3 ? 0 : parseFloat(startTime[1])) : null,
		};
		return result;
	} catch (err) {
		if (
			(err as Error).message.includes(
				'This file cannot be read by `ffprobe`. Is it a valid multimedia file?',
			)
		) {
			throw new Error(
				'This file cannot be read by `ffprobe`. Is it a valid multimedia file?',
			);
		}

		throw err;
	}
};

async function getAudioChannelsAndDurationUnlimited({
	downloadMap,
	src,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
}: {
	downloadMap: DownloadMap;
	src: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
}): Promise<AudioChannelsAndDurationResultCache> {
	if (downloadMap.durationOfAssetCache[src]) {
		return downloadMap.durationOfAssetCache[src];
	}

	const result = await getAudioChannelsAndDurationWithoutCache({
		src,
		indent,
		logLevel,
		binariesDirectory,
		cancelSignal,
	});

	downloadMap.durationOfAssetCache[src] = result;

	return result;
}

export const getAudioChannelsAndDuration = ({
	downloadMap,
	src,
	indent,
	logLevel,
	binariesDirectory,
	cancelSignal,
}: {
	downloadMap: DownloadMap;
	src: string;
	indent: boolean;
	logLevel: LogLevel;
	binariesDirectory: string | null;
	cancelSignal: CancelSignal | undefined;
}): Promise<AudioChannelsAndDurationResultCache> => {
	return limit(() =>
		getAudioChannelsAndDurationUnlimited({
			downloadMap,
			src,
			indent,
			logLevel,
			binariesDirectory,
			cancelSignal,
		}),
	);
};
