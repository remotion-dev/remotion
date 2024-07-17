import {getArrayBufferIterator} from '../../../read-and-increment-offset';

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
	next: ArrayBufferLike;
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
	data: ArrayBufferLike;
	fileOffset: number;
}): SampleAndNext => {
	const iterator = getArrayBufferIterator(data);
	const boxSize = iterator.getUint32();
	if (boxSize !== data.byteLength) {
		throw new Error(`Expected box size of ${data.byteLength}, got ${boxSize}`);
	}

	const boxFormat = iterator.getAtom();
	const isVideo = videoTags.includes(boxFormat);
	const isAudio =
		audioTags.includes(boxFormat) || audioTags.includes(Number(boxFormat));

	const next = data.slice(boxSize);

	// 6 reserved bytes
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();
	const version = iterator.getUint16();
	const revisionLevel = iterator.getUint16();
	const vendor = iterator.getSlice(4);

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
				format: boxFormat,
			},
			next,
			size: boxSize,
		};
	}

	if (isAudio) {
		if (version !== 1) {
			throw new Error(`Unsupported version ${version}`);
		}

		const numberOfChannels = iterator.getUint16();
		const sampleSize = iterator.getUint16();
		const compressionId = iterator.getUint16();
		const packetSize = iterator.getUint16();
		const sampleRate = iterator.getFixedPoint1616Number();
		const samplesPerPacket = iterator.getUint16();
		const bytesPerPacket = iterator.getUint16();
		const bytesPerFrame = iterator.getUint16();
		const bitsPerSample = iterator.getUint16();

		return {
			sample: {
				format: boxFormat,
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
		const temporalQuality = iterator.getUint32();
		const spacialQuality = iterator.getUint32();
		const width = iterator.getUint16();
		const height = iterator.getUint16();
		const horizontalResolution = iterator.getFixedPoint1616Number();
		const verticalResolution = iterator.getFixedPoint1616Number();
		const dataSize = iterator.getUint32();
		const frameCountPerSample = iterator.getUint16();
		const compressorName = iterator.getPascalString();
		const depth = iterator.getUint16();
		const colorTableId = iterator.getInt16();

		iterator.discard(4);

		return {
			sample: {
				format: boxFormat,
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
				compressorName,
				depth,
				colorTableId,
			},
			next,
			size: boxSize,
		};
	}

	throw new Error(`Unknown sample format ${boxFormat}`);
};

export const parseSamples = (
	data: ArrayBufferLike,
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
