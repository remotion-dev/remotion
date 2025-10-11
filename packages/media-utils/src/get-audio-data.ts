import {fetchWithCorsCatch} from './fetch-with-cors-catch';
import {isRemoteAsset} from './is-remote-asset';
import {pLimit} from './p-limit';
import type {MediaUtilsAudioData} from './types';

const metadataCache: {[key: string]: MediaUtilsAudioData} = {};

const limit = pLimit(3);

type Options = {
	sampleRate?: number;
};

const fn = async (
	src: string,
	options?: Options,
): Promise<MediaUtilsAudioData> => {
	if (metadataCache[src]) {
		return metadataCache[src];
	}

	if (typeof document === 'undefined') {
		throw new Error('getAudioData() is only available in the browser.');
	}

	const audioContext = new AudioContext({
		sampleRate: options?.sampleRate ?? 48000,
	});

	const response = await fetchWithCorsCatch(src);
	if (!response.ok) {
		throw new Error(
			`Failed to fetch audio data from ${src}: ${response.status} ${response.statusText}`,
		);
	}

	const arrayBuffer = await response.arrayBuffer();

	const wave = await audioContext.decodeAudioData(arrayBuffer);

	const channelWaveforms = new Array(wave.numberOfChannels)
		.fill(true)
		.map((_, channel) => {
			return wave.getChannelData(channel);
		});

	const metadata: MediaUtilsAudioData = {
		channelWaveforms,
		sampleRate: wave.sampleRate,
		durationInSeconds: wave.duration,
		numberOfChannels: wave.numberOfChannels,
		resultId: String(Math.random()),
		isRemote: isRemoteAsset(src),
	};
	metadataCache[src] = metadata;
	return metadata;
};

/*
 * @description Takes an audio or video src, loads it and returns data and metadata for the specified source.
 * @see [Documentation](https://remotion.dev/docs/get-audio-data)
 */
export const getAudioData = (src: string, options?: Options) => {
	return limit(fn, src, options);
};
