const waveFormCache: {[src: string]: Float32Array} = {};

export const getWaveform = async (src: string): Promise<Float32Array> => {
	if (waveFormCache[src]) {
		return waveFormCache[src];
	}
	const audioContext = new AudioContext();

	const response = await fetch(src);
	const arrayBuffer = await response.arrayBuffer();
	const wave = await audioContext.decodeAudioData(arrayBuffer);
	const channelData = wave.getChannelData(0);
	waveFormCache[src] = channelData;
	return channelData;
};
