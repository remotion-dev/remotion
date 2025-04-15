export const resampleAudioData = (audioData: AudioData, sampleRate: number) => {
	const {
		numberOfChannels,
		sampleRate: currentSampleRate,
		numberOfFrames,
	} = audioData;
	const ratio = currentSampleRate / sampleRate;
	const newFrameLength = Math.round(numberOfFrames / ratio);

	const newAudioData = new AudioData({
		data: new Float32Array(newFrameLength * numberOfChannels),
		format: audioData.format as AudioSampleFormat,
		numberOfChannels,
		numberOfFrames: newFrameLength,
		sampleRate,
		timestamp: audioData.timestamp,
	});

	return newAudioData;
};
