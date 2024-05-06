type SampleBase = {
	format: string;
	offset: number;
	dataReferenceIndex: number;
	version: number;
	revisionLevel: number;
	vendor: number[];
	size: number;
};

type AudioSample = SampleBase & {
	type: 'audio';
	numberOfChannels: number;
	sampleSize: number;
	compressionId: number;
	packetSize: number;
	sampleRate: number;
	samplesPerPacket: number;
	bytesPerPacket: number;
	bytesPerFrame: number;
	bitsPerSample: number;
};

type VideoSample = SampleBase & {
	type: 'video';
	temporalQuality: number;
	spacialQuality: number;
	width: number;
	height: number;
	compressorName: number[];
	horizontalResolutionPpi: number;
	verticalResolutionPpi: number;
	dataSize: number;
	frameCountPerSample: number;
	depth: number;
	colorTableId: number;
};

type UnknownSample = SampleBase & {
	type: 'unknown';
};

export type Sample = AudioSample | VideoSample | UnknownSample;

type SampleAndNext = {
	sample: Sample | null;
	next: Buffer;
	size: number;
};

// https://developer.apple.com/documentation/quicktime-file-format/video_sample_description
const videoTags = [
	'cvid',
	'jpeg',
	'smc ',
	'rle ',
	'rpza',
	'kpcd',
	'png ',
	'mjpa',
	'mjpb',
	'SVQ1',
	'SVQ3',
	'mp4v',
	'avc1',
	'dvc ',
	'dvcp',
	'gif ',
	'h263',
	'tiff',
	'raw ',
	'2vuY',
	'yuv2',
	'v308',
	'v408',
	'v216',
	'v410',
	'v210',
	'hvc1',
];

// https://developer.apple.com/documentation/quicktime-file-format/sound_sample_descriptions
const audioTags = [
	0x00000000,
	'NONE',
	'raw ',
	'twos',
	'sowt',
	'MAC3 ',
	'MAC6 ',
	'ima4',
	'fl32',
	'fl64',
	'in24',
	'in32',
	'ulaw',
	'alaw',
	0x6d730002,
	0x6d730011,
	'dvca',
	'QDMC',
	'QDM2',
	'Qclp',
	0x6d730055,
	'.mp3',
	'mp4a',
	'ac-3',
];

export const processSampleAndSubtract = ({
	data,
	fileOffset,
}: {
	data: Buffer;
	fileOffset: number;
}): SampleAndNext => {
	let chunkOffset = 0;

	const boxSize = data.readUint32BE(chunkOffset);
	chunkOffset += 4;
	if (boxSize === 0) {
		throw new Error(`Expected box size of ${data.length}, got ${boxSize}`);
	}

	const boxTypeBuffer = data.subarray(chunkOffset, chunkOffset + 4);
	chunkOffset += 4;
	const boxType = boxTypeBuffer.toString('utf-8');
	const isVideo = videoTags.includes(boxType);
	const isAudio =
		audioTags.includes(boxType) || audioTags.includes(Number(boxTypeBuffer));

	const next = data.subarray(boxSize);

	// 6 reserved bytes
	chunkOffset += 6;

	const dataReferenceIndex = data.readUint16BE(chunkOffset);
	chunkOffset += 2;

	const version = data.readInt16BE(chunkOffset);
	chunkOffset += 2;

	const revisionLevel = data.readUint16BE(chunkOffset);
	chunkOffset += 2;

	const vendor = data.subarray(chunkOffset, chunkOffset + 4);
	chunkOffset += 4;

	if (!isVideo && !isAudio) {
		return {
			sample: {
				type: 'unknown',
				offset: fileOffset,
				dataReferenceIndex,
				version,
				revisionLevel,
				vendor: [...vendor],
				size: boxSize,
				format: boxType,
			},
			next,
			size: boxSize,
		};
	}

	if (isAudio) {
		if (version !== 1) {
			throw new Error(`Unsupported version ${version}`);
		}

		const numberOfChannels = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const sampleSize = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const compressionId = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const packetSize = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const sampleRate = data.readUint32BE(chunkOffset) / 2 ** 16;
		chunkOffset += 4;

		const samplesPerPacket = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const bytesPerPacket = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const bytesPerFrame = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const bitsPerSample = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		return {
			sample: {
				format: boxType,
				offset: fileOffset,
				dataReferenceIndex,
				version,
				revisionLevel,
				vendor: [...vendor],
				size: boxSize,
				type: 'audio',
				numberOfChannels,
				sampleSize,
				compressionId,
				packetSize,
				sampleRate,
				samplesPerPacket,
				bytesPerPacket,
				bytesPerFrame,
				bitsPerSample,
			},
			next,
			size: boxSize,
		};
	}

	if (isVideo) {
		const temporalQuality = data.readUint32BE(chunkOffset);
		chunkOffset += 4;

		const spacialQuality = data.readUint32BE(chunkOffset);
		chunkOffset += 4;

		const width = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const height = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const horizontalResolution = data.readUint32BE(chunkOffset) / 2 ** 16;
		chunkOffset += 4;

		const verticalResolution = data.readUint32BE(chunkOffset) / 2 ** 16;
		chunkOffset += 4;

		const dataSize = data.readUint32BE(chunkOffset);
		chunkOffset += 4;

		const frameCountPerSample = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const pascalString = data.subarray(chunkOffset, chunkOffset + 32);
		chunkOffset += 32;

		const depth = data.readUint16BE(chunkOffset);
		chunkOffset += 2;

		const colorTableId = data.readInt16BE(chunkOffset);
		chunkOffset += 2;

		chunkOffset += 4;

		return {
			sample: {
				format: boxType,
				offset: fileOffset,
				dataReferenceIndex,
				version,
				revisionLevel,
				vendor: [...vendor],
				size: boxSize,
				type: 'video',
				width,
				height,
				horizontalResolutionPpi: horizontalResolution,
				verticalResolutionPpi: verticalResolution,
				spacialQuality,
				temporalQuality,
				dataSize,
				frameCountPerSample,
				compressorName: [...pascalString],
				depth,
				colorTableId,
			},
			next,
			size: boxSize,
		};
	}

	throw new Error(`Unknown sample format ${boxType}`);
};

export const parseSamples = (data: Buffer, fileOffset: number): Sample[] => {
	const samples: Sample[] = [];
	let remaining = data;
	let bytesConsumed = fileOffset;

	while (remaining.length > 0) {
		const {next, sample, size} = processSampleAndSubtract({
			data: remaining,
			fileOffset: bytesConsumed,
		});

		remaining = next;
		if (sample) {
			samples.push(sample);
		}

		bytesConsumed += size;
	}

	return samples;
};
