export const resampleAudioData = ({
	audioData,
	newSampleRate,
}: {
	audioData: AudioData;
	newSampleRate: number;
}) => {
	const {
		numberOfChannels,
		sampleRate: currentSampleRate,
		numberOfFrames,
	} = audioData;
	const ratio = currentSampleRate / newSampleRate;
	const newNumberOfFrames = Math.floor(numberOfFrames / ratio);

	// TODO: Float32Array hardcoded
	const src = new Float32Array(numberOfChannels * numberOfFrames);
	audioData.clone().copyTo(src, {
		// TODO: Plane index hardcoded
		planeIndex: 0,
	});

	const data = new Float32Array(newNumberOfFrames * numberOfChannels);
	const chunkSize = numberOfFrames / newNumberOfFrames;

	for (let i = 0; i < newNumberOfFrames; i++) {
		const start = Math.floor(i * chunkSize);
		const end = Math.max(Math.floor(start + chunkSize), start + 1);
		const chunk = src.slice(start, end);
		const average = chunk.reduce((a, b) => a + b, 0) / chunk.length;
		for (let j = 0; j < numberOfChannels; j++) {
			data[i * numberOfChannels + j] = average;
		}
	}

	const newAudioData = new AudioData({
		data,
		format: audioData.format as AudioSampleFormat,
		numberOfChannels,
		numberOfFrames: newNumberOfFrames,
		sampleRate: newSampleRate,
		timestamp: audioData.timestamp,
	});

	return newAudioData;
};
