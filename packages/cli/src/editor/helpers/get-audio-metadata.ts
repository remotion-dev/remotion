export type AudioContextMetadata = {
	channelWaveforms: Float32Array[];
	sampleRate: number;
	duration: number;
	numberOfChannels: number;
};
const metadataCache: {[key: string]: AudioContextMetadata} = {};

export const combineWaveforms = (waveforms: Float32Array[]) => {
	if (waveforms.length === 0) {
		return null;
	}
	const combinedWaveform = Float32Array.of(waveforms[0].length);
	for (let i = 0; i < waveforms[0].length; i++) {
		combinedWaveform[i] = waveforms.map((w) => w[i]).reduce((a, b) => a + b, 0);
	}

	return combinedWaveform;
};

export const getAudioDuration = (src: string) => {
	const audio = document.createElement('audio');
	audio.src = src;
	return new Promise<number>((resolve, reject) => {
		const onError = (ev: ErrorEvent) => {
			reject(ev.error);
			cleanup();
		};
		const onLoadedMetadata = () => {
			resolve(audio.duration);
			cleanup();
		};
		const cleanup = () => {
			audio.removeEventListener('loadedmetadata', onLoadedMetadata);
			audio.removeEventListener('error', onError);
		};
		audio.addEventListener('loadedmetadata', onLoadedMetadata, {once: true});
		audio.addEventListener('error', onError, {once: true});
	});
};

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
