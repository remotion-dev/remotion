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
	next: ArrayBuffer;
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
	data: ArrayBuffer;
	fileOffset: number;
}): SampleAndNext => {
	let chunkOffset = 0;

	const view = new DataView(data);

	const boxSize = view.getUint32(chunkOffset);
	chunkOffset += 4;
	if (boxSize === 0) {
		throw new Error(`Expected box size of ${data.byteLength}, got ${boxSize}`);
	}

	const boxTypeBuffer = data.slice(chunkOffset, chunkOffset + 4);
	chunkOffset += 4;
	const boxType = new TextDecoder().decode(boxTypeBuffer);
	const isVideo = videoTags.includes(boxType);
	const isAudio =
		audioTags.includes(boxType) || audioTags.includes(Number(boxTypeBuffer));

	const next = data.slice(boxSize);

	// 6 reserved bytes
	chunkOffset += 6;

	const dataReferenceIndex = view.getUint16(chunkOffset);
	chunkOffset += 2;

	const version = view.getUint16(chunkOffset);
	chunkOffset += 2;

	const revisionLevel = view.getUint16(chunkOffset);
	chunkOffset += 2;

	const vendor = data.slice(chunkOffset, chunkOffset + 4);
	chunkOffset += 4;

	if (!isVideo && !isAudio) {
		return {
			sample: {
				type: 'unknown',
				offset: fileOffset,
				dataReferenceIndex,
				version,
				revisionLevel,
				vendor: [...Array.from(new Uint8Array(vendor))],
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

		const numberOfChannels = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const sampleSize = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const compressionId = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const packetSize = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const sampleRate = view.getUint32(chunkOffset) / 2 ** 16;
		chunkOffset += 4;

		const samplesPerPacket = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const bytesPerPacket = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const bytesPerFrame = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const bitsPerSample = view.getUint16(chunkOffset);
		chunkOffset += 2;

		return {
			sample: {
				format: boxType,
				offset: fileOffset,
				dataReferenceIndex,
				version,
				revisionLevel,
				vendor: [...Array.from(new Uint8Array(vendor))],
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
		const temporalQuality = view.getUint32(chunkOffset);
		chunkOffset += 4;

		const spacialQuality = view.getUint32(chunkOffset);
		chunkOffset += 4;

		const width = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const height = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const horizontalResolution = view.getUint32(chunkOffset) / 2 ** 16;
		chunkOffset += 4;

		const verticalResolution = view.getUint32(chunkOffset) / 2 ** 16;
		chunkOffset += 4;

		const dataSize = view.getUint32(chunkOffset);
		chunkOffset += 4;

		const frameCountPerSample = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const pascalString = data.slice(chunkOffset, chunkOffset + 32);
		chunkOffset += 32;

		const depth = view.getUint16(chunkOffset);
		chunkOffset += 2;

		const colorTableId = view.getInt16(chunkOffset);
		chunkOffset += 2;

		chunkOffset += 4;

		return {
			sample: {
				format: boxType,
				offset: fileOffset,
				dataReferenceIndex,
				version,
				revisionLevel,
				vendor: [...Array.from(new Uint8Array(vendor))],
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
				compressorName: [...Array.from(new Uint8Array(pascalString))],
				depth,
				colorTableId,
			},
			next,
			size: boxSize,
		};
	}

	throw new Error(`Unknown sample format ${boxType}`);
};

export const parseSamples = (
	data: ArrayBuffer,
	fileOffset: number,
): Sample[] => {
	const samples: Sample[] = [];
	let remaining = data;
	let bytesConsumed = fileOffset;

	while (remaining.byteLength > 0) {
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
