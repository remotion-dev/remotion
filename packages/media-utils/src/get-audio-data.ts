import {isRemoteAsset} from './is-remote-asset';
import {AudioData} from './types';

const metadataCache: {[key: string]: AudioData} = {};

export const getAudioData = async (src: string): Promise<AudioData> => {
	if (metadataCache[src]) {
		return metadataCache[src];
	}

	const audioContext = new AudioContext();

	const response = await fetch(src);
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
