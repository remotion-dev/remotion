type AudioContextMetadata = {
	waveform: Float32Array;
	sampleRate: number;
	duration: number;
	numberOfChannels: number;
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

export const getWaveform = async (
	arrayBuffer: ArrayBuffer
): Promise<Float32Array> => {
	const audioContext = new AudioContext();

	const wave = await audioContext.decodeAudioData(arrayBuffer);
	const channelData = wave.getChannelData(0);
	return channelData;
};

export const getAudioMetadata = async (
	src: string
): Promise<AudioContextMetadata> => {
	const audioContext = new AudioContext();

	const response = await fetch(src);
	const arrayBuffer = await response.arrayBuffer();

	const wave = await audioContext.decodeAudioData(arrayBuffer);
	const channelData = wave.getChannelData(0);

	return {
		waveform: channelData,
		sampleRate: audioContext.sampleRate,
		duration: wave.duration,
		numberOfChannels: wave.numberOfChannels,
	};
};
