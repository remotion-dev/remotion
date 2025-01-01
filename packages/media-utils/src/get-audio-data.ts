import {fetchWithCorsCatch} from './fetch-with-cors-catch';
import {isRemoteAsset} from './is-remote-asset';
import {pLimit} from './p-limit';
import type {AudioData} from './types';

const metadataCache: {[key: string]: AudioData} = {};

const limit = pLimit(3);

type Options = {
	sampleRate?: number;
};

const fn = async (src: string, options?: Options): Promise<AudioData> => {
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
	const arrayBuffer = await response.arrayBuffer();

	const wave = await audioContext.decodeAudioData(arrayBuffer);

	const channelWaveforms = new Array(wave.numberOfChannels)
		.fill(true)
		.map((_, channel) => {
			return wave.getChannelData(channel);
		});

	const metadata: AudioData = {
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
 * @description Takes an audio src, loads it and returns data and metadata for the specified source.
 * @see [Documentation](https://remotion.dev/docs/get-audio-data)
 */
export const getAudioData = (src: string, options?: Options) => {
	return limit(fn, src, options);
};
