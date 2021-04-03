import {AudioContextMetadata} from './types';

const metadataCache: {[key: string]: AudioContextMetadata} = {};

export const getAudioMetadata = async (
	src: string
): Promise<AudioContextMetadata> => {
	if (metadataCache[src]) {
		return metadataCache[src];
	}
	const audioContext = new OfflineAudioContext({
		length: 1,
		sampleRate: 3000,
		numberOfChannels: 1,
	});

	const response = await fetch(src);
	const arrayBuffer = await response.arrayBuffer();

	const wave = await audioContext.decodeAudioData(arrayBuffer);

	const channelWaveforms = new Array(wave.numberOfChannels)
		.fill(true)
		.map((_, channel) => {
			return wave.getChannelData(channel);
		});

	const metadata: AudioContextMetadata = {
		channelWaveforms,
		sampleRate: audioContext.sampleRate,
		duration: wave.duration,
		numberOfChannels: wave.numberOfChannels,
	};
	metadataCache[src] = metadata;
	return metadata;
};
