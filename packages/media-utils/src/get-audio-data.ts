import {isRemoteAsset} from './is-remote-asset';
import {pLimit} from './p-limit';
import type {AudioData} from './types';

const metadataCache: {[key: string]: AudioData} = {};

const limit = pLimit(3);

const fetchWithCorsCatch = async (src: string) => {
	try {
		const response = await fetch(src, {
			mode: 'cors',
			referrerPolicy: 'no-referrer-when-downgrade',
		});
		return response;
	} catch (err) {
		const error = err as Error;
		if (
			// Chrome
			error.message.includes('Failed to fetch') ||
			// Safari
			error.message.includes('Load failed') ||
			// Firefox
			error.message.includes('NetworkError when attempting to fetch resource')
		) {
			throw new TypeError(
				`Failed to read from ${src}: ${error.message}. Does the resource support CORS?`
			);
		}

		throw err;
	}
};

const fn = async (src: string): Promise<AudioData> => {
	if (metadataCache[src]) {
		return metadataCache[src];
	}

	if (typeof document === 'undefined') {
		throw new Error('getAudioData() is only available in the browser.');
	}

	const audioContext = new AudioContext();

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
		sampleRate: audioContext.sampleRate,
		durationInSeconds: wave.duration,
		numberOfChannels: wave.numberOfChannels,
		resultId: String(Math.random()),
		isRemote: isRemoteAsset(src),
	};
	metadataCache[src] = metadata;
	return metadata;
};

export const getAudioData = (src: string) => {
	return limit(fn, src);
};
