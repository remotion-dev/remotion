type SineOptions = {
	frequency: number;
	sampleRate: number;
	length: number;
	amplitude: number;
	phase: number;
};

export const generateSine = ({
	frequency,
	sampleRate,
	length,
	amplitude,
	phase,
}: SineOptions): AudioData => {
	const out = new Int16Array(length * 2); // Double size for 2 channels
	const twoPiFOverFs = (2 * Math.PI * frequency) / sampleRate;
	for (let n = 0; n < length; n++) {
		const v = amplitude * Math.sin(phase + twoPiFOverFs * n);
		// Round to nearest integer; clamp to safe 16-bit just in case
		const sample = Math.max(-32768, Math.min(32767, Math.round(v)));
		// Copy same value to both channels
		out[n * 2] = sample; // Left channel
		out[n * 2 + 1] = sample; // Right channel
	}

	return new AudioData({
		data: out,
		format: 's16',
		numberOfChannels: 2,
		numberOfFrames: length, // Keep original frame count
		sampleRate,
		timestamp: 0,
	});
};

export const toInt16Array = (audioData: AudioData): Int16Array => {
	const out = new Int16Array(
		audioData.numberOfFrames * audioData.numberOfChannels,
	);
	audioData.copyTo(out, {
		planeIndex: 0,
		format: 's16',
		frameOffset: 0,
		frameCount: audioData.numberOfFrames,
	});
	return out;
};
