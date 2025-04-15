export const assertIs = (value: unknown, expected: unknown) => {
	if (value !== expected) {
		throw new Error(`Expected ${expected}, got ${value}`);
	}
};

export const assertJson = (value: unknown, expected: unknown) => {
	if (JSON.stringify(value) !== JSON.stringify(expected)) {
		throw new Error(
			`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`,
		);
	}
};

export const audioDataToSerializable = (audioData: AudioData) => {
	const target = new Float32Array(audioData.numberOfFrames);
	audioData.clone().copyTo(target, {
		planeIndex: 0,
	});

	return {
		data: Array.from(target),
		format: audioData.format,
		numberOfChannels: audioData.numberOfChannels,
		numberOfFrames: audioData.numberOfFrames,
		sampleRate: audioData.sampleRate,
		timestamp: audioData.timestamp,
	};
};
