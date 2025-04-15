const getDataTypeForAudioFormat = (format: AudioSampleFormat) => {
	switch (format) {
		case 'f32':
			return Float32Array;
		case 'f32-planar':
			return Float32Array;
		case 's16':
			return Int16Array;
		case 's16-planar':
			return Int16Array;
		case 'u8':
			return Uint8Array;
		case 'u8-planar':
			return Uint8Array;
		case 's32':
			return Int32Array;
		case 's32-planar':
			return Int32Array;
		default:
			throw new Error(`Unsupported audio format: ${format satisfies never}`);
	}
};

const isPlanarFormat = (format: AudioSampleFormat) => {
	return format.includes('-planar');
};

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

	if (!audioData.format) {
		throw new Error('AudioData format is not set');
	}

	const DataType = getDataTypeForAudioFormat(audioData.format);

	const isPlanar = isPlanarFormat(audioData.format);
	const planes = isPlanar ? numberOfChannels : 1;
	const srcChannels = new Array(planes)
		.fill(true)
		.map(
			() => new DataType((isPlanar ? 1 : numberOfChannels) * numberOfFrames),
		);

	for (let i = 0; i < planes; i++) {
		audioData.clone().copyTo(srcChannels[i], {
			planeIndex: i,
		});
	}

	const data = new DataType(newNumberOfFrames * numberOfChannels);
	const chunkSize = numberOfFrames / newNumberOfFrames;

	for (
		let newFrameIndex = 0;
		newFrameIndex < newNumberOfFrames;
		newFrameIndex++
	) {
		const start = Math.floor(newFrameIndex * chunkSize);
		const end = Math.max(Math.floor(start + chunkSize), start + 1);

		if (isPlanar) {
			for (
				let channelIndex = 0;
				channelIndex < numberOfChannels;
				channelIndex++
			) {
				const chunk = srcChannels[channelIndex].slice(start, end);

				const average =
					(chunk as Int32Array<ArrayBuffer>).reduce((a, b) => a + b, 0) /
					chunk.length;

				data[newFrameIndex + channelIndex * newNumberOfFrames] = average;
			}
		} else {
			const sampleCountAvg = end - start;

			for (
				let channelIndex = 0;
				channelIndex < numberOfChannels;
				channelIndex++
			) {
				const items = [];
				for (let k = 0; k < sampleCountAvg; k++) {
					const num =
						srcChannels[0][(start + k) * numberOfChannels + channelIndex];
					items.push(num);
				}

				const average = items.reduce((a, b) => a + b, 0) / items.length;
				data[newFrameIndex * numberOfChannels + channelIndex] = average;
			}
		}
	}

	const newAudioData = new AudioData({
		data,
		format: audioData.format,
		numberOfChannels,
		numberOfFrames: newNumberOfFrames,
		sampleRate: newSampleRate,
		timestamp: audioData.timestamp,
	});

	return newAudioData;
};
