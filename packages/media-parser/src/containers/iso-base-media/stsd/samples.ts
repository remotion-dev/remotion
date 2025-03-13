import type {AnySegment} from '../../../parse-result';
import type {ParserState} from '../../../state/parser-state';
import type {IsoBaseMediaBox} from '../base-media-box';
import {getIsoBaseMediaChildren} from '../get-children';

type SampleBase = {
	format: string;
	offset: number;
	dataReferenceIndex: number;
	size: number;
};

export type AudioSample = SampleBase & {
	type: 'audio';
	numberOfChannels: number;
	sampleSize: number;
	compressionId: number;
	packetSize: number;
	sampleRate: number;
	samplesPerPacket: number | null;
	bytesPerPacket: number | null;
	bytesPerFrame: number | null;
	bitsPerSample: number | null;
	children: AnySegment[];
	version: number;
	revisionLevel: number;
	vendor: number[];
};

export type VideoSample = SampleBase & {
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
	descriptors: IsoBaseMediaBox[];
	version: number;
	revisionLevel: number;
	vendor: number[];
};

type UnknownSample = SampleBase & {
	type: 'unknown';
};

export type Sample = AudioSample | VideoSample | UnknownSample;

type FormatBoxAndNext = {
	sample: Sample | null;
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
	'hev1',
	'ap4h',
	'av01',
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
	'lpcm',
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

export const processIsoFormatBox = async ({
	state,
}: {
	state: ParserState;
}): Promise<FormatBoxAndNext> => {
	const {iterator} = state;
	const fileOffset = iterator.counter.getOffset();
	const bytesRemaining = iterator.bytesRemaining();
	const boxSize = iterator.getUint32();

	if (bytesRemaining < boxSize) {
		throw new Error(`Expected box size of ${bytesRemaining}, got ${boxSize}`);
	}

	const boxFormat = iterator.getAtom();

	const isVideo = videoTags.includes(boxFormat);
	const isAudio =
		audioTags.includes(boxFormat) || audioTags.includes(Number(boxFormat));

	// 6 reserved bytes
	iterator.discard(6);

	const dataReferenceIndex = iterator.getUint16();

	if (!isVideo && !isAudio) {
		const bytesRemainingInBox =
			boxSize - (iterator.counter.getOffset() - fileOffset);
		iterator.discard(bytesRemainingInBox);

		return {
			sample: {
				type: 'unknown',
				offset: fileOffset,
				dataReferenceIndex,
				size: boxSize,
				format: boxFormat,
			},
		};
	}

	if (isAudio) {
		const version = iterator.getUint16();
		const revisionLevel = iterator.getUint16();
		const vendor = iterator.getSlice(4);

		if (version === 0) {
			const numberOfChannels = iterator.getUint16();
			const sampleSize = iterator.getUint16();
			const compressionId = iterator.getUint16();
			const packetSize = iterator.getUint16();
			const sampleRate = iterator.getFixedPointUnsigned1616Number();

			const children = await getIsoBaseMediaChildren({
				state,
				size: boxSize - (iterator.counter.getOffset() - fileOffset),
			});

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
					samplesPerPacket: null,
					bytesPerPacket: null,
					bytesPerFrame: null,
					bitsPerSample: null,
					children,
				},
			};
		}

		if (version === 1) {
			const numberOfChannels = iterator.getUint16();
			const sampleSize = iterator.getUint16();
			const compressionId = iterator.getInt16();
			const packetSize = iterator.getUint16();
			const sampleRate = iterator.getFixedPointUnsigned1616Number();

			const samplesPerPacket = iterator.getUint32();

			const bytesPerPacket = iterator.getUint32();
			const bytesPerFrame = iterator.getUint32();
			const bytesPerSample = iterator.getUint32();

			const children = await getIsoBaseMediaChildren({
				state,
				size: boxSize - (iterator.counter.getOffset() - fileOffset),
			});

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
					bitsPerSample: bytesPerSample,
					children,
				},
			};
		}

		if (version === 2) {
			iterator.getUint16(); // always 3
			const sampleSize = iterator.getUint16();
			const compressionId = iterator.getUint16();
			const packetSize = iterator.getUint16();
			iterator.getFixedPointUnsigned1616Number(); // LQ sample rate;

			iterator.getUint32(); // ignore
			const higherSampleRate = iterator.getFloat64();
			const numAudioChannel = iterator.getUint32(); // ignore;
			iterator.getUint32(); // ignore, always 0x7F000000?
			const bitsPerChannel = iterator.getUint32();
			iterator.getUint32(); // ignore;
			const bytesPerFrame = iterator.getUint32();
			const samplesPerPacket = iterator.getUint32();

			const children = await getIsoBaseMediaChildren({
				state,
				size: boxSize - (iterator.counter.getOffset() - fileOffset),
			});

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
					numberOfChannels: numAudioChannel,
					sampleSize,
					compressionId,
					packetSize,
					sampleRate: higherSampleRate,
					samplesPerPacket,
					bytesPerPacket: null,
					bytesPerFrame,
					bitsPerSample: bitsPerChannel,
					children,
				},
			};
		}

		throw new Error(`Unsupported version ${version}`);
	}

	if (isVideo) {
		const version = iterator.getUint16();
		const revisionLevel = iterator.getUint16();
		const vendor = iterator.getSlice(4);
		const temporalQuality = iterator.getUint32();
		const spacialQuality = iterator.getUint32();
		const width = iterator.getUint16();
		const height = iterator.getUint16();
		const horizontalResolution = iterator.getFixedPointUnsigned1616Number();
		const verticalResolution = iterator.getFixedPointUnsigned1616Number();
		const dataSize = iterator.getUint32();
		const frameCountPerSample = iterator.getUint16();
		const compressorName = iterator.getPascalString();
		const depth = iterator.getUint16();
		const colorTableId = iterator.getInt16();

		const bytesRemainingInBox =
			boxSize - (iterator.counter.getOffset() - fileOffset);

		const children: IsoBaseMediaBox[] =
			bytesRemainingInBox > 8
				? await getIsoBaseMediaChildren({
						state,
						size: bytesRemainingInBox,
					})
				: (iterator.discard(bytesRemainingInBox), []);

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
				descriptors: children,
			},
		};
	}

	throw new Error(`Unknown sample format ${boxFormat}`);
};

export const parseIsoFormatBoxes = async ({
	maxBytes,
	state,
}: {
	maxBytes: number;
	state: ParserState;
}): Promise<Sample[]> => {
	const {iterator} = state;
	const samples: Sample[] = [];
	const initialOffset = iterator.counter.getOffset();

	while (
		iterator.bytesRemaining() > 0 &&
		iterator.counter.getOffset() - initialOffset < maxBytes
	) {
		const {sample} = await processIsoFormatBox({
			state,
		});

		if (sample) {
			samples.push(sample);
		}
	}

	return samples;
};
