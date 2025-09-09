export const logAudioData = (audioData: AudioData) => {
	const srcChannels = new Int16Array(
		audioData.numberOfFrames * audioData.numberOfChannels,
	);

	audioData.copyTo(srcChannels, {
		planeIndex: 0,
		format: 's16',
	});

	return srcChannels.slice(0, 10).join(',');
};
