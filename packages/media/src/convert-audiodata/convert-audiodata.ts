export type PcmS16AudioData = {
	data: Int16Array;
	numberOfFrames: number;
	timestamp: number;
};

export const fixFloatingPoint = (value: number) => {
	const decimal = Math.abs(value % 1);

	if (decimal < 0.0000001) {
		return value < 0 ? Math.ceil(value) : Math.floor(value);
	}

	if (decimal > 0.9999999) {
		return value < 0 ? Math.floor(value) : Math.ceil(value);
	}

	return value;
};

export const copyAudioDataToInterleavedS16 = ({
	audioData,
	frameOffset,
	frameCount,
}: {
	audioData: AudioData;
	frameOffset: number;
	frameCount: number;
}) => {
	const source = new Int16Array(audioData.numberOfChannels * frameCount);
	const isF32 = audioData.format === 'f32' || audioData.format === 'f32-planar';

	if (isF32) {
		// Firefox decodes as f32. Normalize to f32-planar first so the final
		// s16 conversion starts from the same representation in every browser.
		const bytesPerPlane = frameCount * 4;
		const f32Buffer = new ArrayBuffer(
			audioData.numberOfChannels * bytesPerPlane,
		);
		for (let channel = 0; channel < audioData.numberOfChannels; channel++) {
			audioData.copyTo(
				new Float32Array(f32Buffer, channel * bytesPerPlane, frameCount),
				{
					planeIndex: channel,
					frameOffset,
					frameCount,
					format: 'f32-planar',
				},
			);
		}

		const f32AudioData = new AudioData({
			format: 'f32-planar',
			sampleRate: audioData.sampleRate,
			numberOfFrames: frameCount,
			numberOfChannels: audioData.numberOfChannels,
			timestamp: audioData.timestamp,
			data: f32Buffer,
		});

		f32AudioData.copyTo(source, {
			planeIndex: 0,
			format: 's16',
			frameOffset: 0,
			frameCount,
		});
		f32AudioData.close();
	} else {
		// Chrome decodes as s16-planar. Copy directly to interleaved s16.
		audioData.copyTo(source, {
			planeIndex: 0,
			format: 's16',
			frameOffset,
			frameCount,
		});
	}

	return source;
};
