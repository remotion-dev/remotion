import type {BufferIterator} from '../../../buffer-iterator';
import type {ParserContext} from '../../../parser-context';
import type {VideoSample} from '../../../webcodec-sample-types';
import type {MatroskaSegment} from '../segments';
import type {matroskaElements} from './all-segments';
import {parseBlockFlags} from './block-simple-block-flags';
import {expectChildren} from './parse-children';

export type TrackEntrySegment = {
	type: 'track-entry-segment';
	children: MatroskaSegment[];
};

export const parseTrackEntry = async (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): Promise<TrackEntrySegment> => {
	const children = await expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
		parserContext,
	});
	if (children.status === 'incomplete') {
		throw new Error('Incomplete children ' + length);
	}

	return {
		type: 'track-entry-segment',
		children: children.segments as MatroskaSegment[],
	};
};

export type TrackNumberSegment = {
	type: 'track-number-segment';
	trackNumber: number;
};

export type TrackUIDSegment = {
	type: 'track-uid-segment';
	trackUid: string;
};

export const parseTrackUID = (
	iterator: BufferIterator,
	length: number,
): TrackUIDSegment => {
	const bytes = iterator.getSlice(length);

	const asString = [...bytes]
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
	return {
		type: 'track-uid-segment',
		trackUid: asString,
	};
};

export type FlagLacingSegment = {
	type: 'flag-lacing-segment';
	lacing: boolean;
};

export const parseFlagLacing = (
	iterator: BufferIterator,
	length: number,
): FlagLacingSegment => {
	if (length !== 1) {
		throw new Error('Expected flag lacing to be 1 byte');
	}

	const bytes = iterator.getSlice(length);

	if (bytes[0] !== 1 && bytes[0] !== 0) {
		throw new Error('Expected lacing to be 1 or 0');
	}

	return {
		type: 'flag-lacing-segment',
		lacing: Boolean(bytes[0]),
	};
};

export type LanguageSegment = {
	type: 'language-segment';
	language: string;
};

export const parseLanguageSegment = (
	iterator: BufferIterator,
	length: number,
): LanguageSegment => {
	if (length !== 3) {
		throw new Error('Expected language segment to be 3 bytes');
	}

	const language = iterator.getByteString(length);

	return {
		type: 'language-segment',
		language,
	};
};

export type TrackInfo = {
	codec: string;
	trackTimescale: number | null;
};

type TrackType =
	| 'video'
	| 'audio'
	| 'complex'
	| 'subtitle'
	| 'button'
	| 'control'
	| 'metadata';

export const trackTypeToString = (trackType: number): TrackType => {
	switch (trackType) {
		case 1:
			return 'video';
		case 2:
			return 'audio';
		case 3:
			return 'complex';
		case 4:
			return 'subtitle';
		case 5:
			return 'button';
		case 6:
			return 'control';
		case 7:
			return 'metadata';
		default:
			throw new Error(`Unknown track type: ${trackType}`);
	}
};

export type DefaultDurationSegment = {
	type: 'default-duration-segment';
	defaultDuration: number;
};

export const parseDefaultDurationSegment = (
	iterator: BufferIterator,
	length: number,
): DefaultDurationSegment => {
	const defaultDuration = iterator.getUint(length);

	return {
		type: 'default-duration-segment',
		defaultDuration,
	};
};

export type VideoSegment = {
	type: 'video-segment';
	children: MatroskaSegment[];
};

export const parseVideoSegment = async (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): Promise<VideoSegment> => {
	const children = await expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
		parserContext,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete children');
	}

	return {
		type: 'video-segment',
		children: children.segments as MatroskaSegment[],
	};
};

export type AudioSegment = {
	type: 'audio-segment';
	children: MatroskaSegment[];
};

export const parseAudioSegment = async (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): Promise<AudioSegment> => {
	const children = await expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
		parserContext,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete children');
	}

	return {
		type: 'audio-segment',
		children: children.segments as MatroskaSegment[],
	};
};

export type WidthSegment = {
	type: 'width-segment';
	width: number;
};

export const parseWidthSegment = (
	iterator: BufferIterator,
	length: number,
): WidthSegment => {
	if (length !== 2) {
		throw new Error('Expected width segment to be 2 bytes');
	}

	const width = iterator.getUint16();

	return {
		type: 'width-segment',
		width,
	};
};

export type HeightSegment = {
	type: 'height-segment';
	height: number;
};

export const parseHeightSegment = (
	iterator: BufferIterator,
	length: number,
): HeightSegment => {
	if (length !== 2) {
		throw new Error('Expected height segment to be 2 bytes');
	}

	const height = iterator.getUint16();

	return {
		type: 'height-segment',
		height,
	};
};

export type DisplayWidthSegment = {
	type: 'display-width-segment';
	displayWidth: number;
};

export const parseDisplayWidthSegment = (
	iterator: BufferIterator,
	length: number,
): DisplayWidthSegment => {
	if (length !== 2) {
		throw new Error(
			`Expected display width segment to be 2 bytes, got ${length}`,
		);
	}

	const displayWidth = iterator.getUint16();

	return {
		type: 'display-width-segment',
		displayWidth,
	};
};

export type DisplayHeightSegment = {
	type: 'display-height-segment';
	displayHeight: number;
};

export const parseDisplayHeightSegment = (
	iterator: BufferIterator,
	length: number,
): DisplayHeightSegment => {
	if (length !== 2) {
		throw new Error(
			`Expected display height segment to be 2 bytes, got ${length}`,
		);
	}

	const displayHeight = iterator.getUint16();

	return {
		type: 'display-height-segment',
		displayHeight,
	};
};

export type AlphaModeSegment = {
	type: 'alpha-mode-segment';
	alphaMode: number;
};

export const parseAlphaModeSegment = (
	iterator: BufferIterator,
	length: number,
): AlphaModeSegment => {
	if (length !== 1) {
		throw new Error('Expected alpha mode segment to be 1 byte');
	}

	const alphaMode = iterator.getUint8();

	return {
		type: 'alpha-mode-segment',
		alphaMode,
	};
};

export type MaxBlockAdditionId = {
	type: 'max-block-addition-id-segment';
	maxBlockAdditionId: number;
};

export const parseMaxBlockAdditionId = (
	iterator: BufferIterator,
	length: number,
): MaxBlockAdditionId => {
	if (length !== 1) {
		throw new Error('Expected alpha mode segment to be 1 byte');
	}

	const maxBlockAdditionId = iterator.getUint8();

	return {
		type: 'max-block-addition-id-segment',
		maxBlockAdditionId,
	};
};

export type ColorSegment = {
	type: 'color-segment';
	length: number;
};

export const parseColorSegment = (
	iterator: BufferIterator,
	length: number,
): ColorSegment => {
	iterator.discard(length);

	return {
		type: 'color-segment',
		length,
	};
};

export type TitleSegment = {
	type: 'title-segment';
	title: string;
};

export const parseTitleSegment = (
	iterator: BufferIterator,
	length: number,
): TitleSegment => {
	const title = iterator.getByteString(length);

	return {
		type: 'title-segment',
		title,
	};
};

export type InterlacedSegment = {
	type: 'interlaced-segment';
	interlaced: boolean;
};

export const parseInterlacedSegment = (
	iterator: BufferIterator,
	length: number,
): InterlacedSegment => {
	if (length !== 1) {
		throw new Error(
			'Expected interlaced segment to be 1 byte, but is ' + length,
		);
	}

	const interlaced = iterator.getUint8();

	return {
		type: 'interlaced-segment',
		interlaced: Boolean(interlaced),
	};
};

export type CodecPrivateSegment = {
	type: 'codec-private-segment';
	codecPrivateData: Uint8Array;
};

export const parseCodecPrivateSegment = (
	iterator: BufferIterator,
	length: number,
): CodecPrivateSegment => {
	return {
		type: 'codec-private-segment',
		codecPrivateData: iterator.getSlice(length),
	};
};

export type DefaultFlagSegment = {
	type: 'default-flag-segment';
	defaultFlag: boolean;
};

export const parseDefaultFlagSegment = (
	iterator: BufferIterator,
	length: number,
): DefaultFlagSegment => {
	if (length !== 1) {
		throw new Error('Expected default flag segment to be 1 byte');
	}

	return {
		type: 'default-flag-segment',
		defaultFlag: Boolean(iterator.getUint8()),
	};
};

export type TagsSegment = {
	type: 'tags-segment';
	children: MatroskaSegment[];
};

export const parseTagsSegment = async (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): Promise<TagsSegment> => {
	const children = await expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
		parserContext,
	});

	if (children.status === 'incomplete') {
		throw new Error('Incomplete children');
	}

	return {
		type: 'tags-segment',
		children: children.segments as MatroskaSegment[],
	};
};

export type TagSegment = {
	type: 'tag-segment';
	length: number;
};

export const parseTagSegment = (
	iterator: BufferIterator,
	length: number,
): TagSegment => {
	iterator.discard(length);

	return {
		type: 'tag-segment',
		length,
	};
};

export type ClusterSegment = {
	type: 'cluster-segment';
	children: MatroskaSegment[];
};

export type TimestampSegment = {
	type: 'timestamp-segment';
	timestamp: number;
};

export const parseTimestampSegment = (
	iterator: BufferIterator,
	length: number,
): TimestampSegment => {
	return {
		type: 'timestamp-segment',
		timestamp: iterator.getUint(length),
	};
};

export type SimpleBlockOrBlockSegment = {
	type: 'simple-block-or-block-segment';
	length: number;
	trackNumber: number;
	timecodeInMicroseconds: number;
	keyframe: boolean | null;
	lacing: number;
	invisible: boolean;
	videoSample: Omit<VideoSample, 'type'> | null;
};

export type GetTracks = () => TrackEntrySegment[];

export const parseSimpleBlockOrBlockSegment = async ({
	iterator,
	length,
	parserContext,
	type,
}: {
	iterator: BufferIterator;
	length: number;
	parserContext: ParserContext;
	type:
		| (typeof matroskaElements)['Block']
		| (typeof matroskaElements)['SimpleBlock'];
}): Promise<SimpleBlockOrBlockSegment> => {
	const start = iterator.counter.getOffset();
	const trackNumber = iterator.getVint();
	if (trackNumber === null) {
		throw new Error('Not enough data to get track number, should not happen');
	}

	const timecodeRelativeToCluster = iterator.getUint16();

	const {invisible, lacing, keyframe} = parseBlockFlags(iterator, type);

	const {codec, trackTimescale} =
		parserContext.parserState.getTrackInfoByNumber(trackNumber);

	const clusterOffset =
		parserContext.parserState.getTimestampOffsetForByteOffset(
			iterator.counter.getOffset(),
		);

	const timescale = parserContext.parserState.getTimescale();

	if (clusterOffset === undefined) {
		throw new Error(
			'Could not find offset for byte offset ' + iterator.counter.getOffset(),
		);
	}

	// https://github.com/hubblec4/Matroska-Chapters-Specs/blob/master/notes.md/#timestampscale
	// The TimestampScale Element is used to calculate the Raw Timestamp of a Block. The timestamp is obtained by adding the Block's timestamp to the Cluster's Timestamp Element, and then multiplying that result by the TimestampScale. The result will be the Block's Raw Timestamp in nanoseconds.
	const timecodeInNanoSeconds =
		(timecodeRelativeToCluster + clusterOffset) *
		timescale *
		(trackTimescale ?? 1);

	// Timecode should be in microseconds
	const timecodeInMicroseconds = timecodeInNanoSeconds / 1000;

	if (!codec) {
		throw new Error('Could not find codec for track ' + trackNumber);
	}

	const remainingNow = length - (iterator.counter.getOffset() - start);

	let videoSample: Omit<VideoSample, 'type'> | null = null;

	if (codec.startsWith('V_')) {
		const partialVideoSample: Omit<VideoSample, 'type'> = {
			data: iterator.getSlice(remainingNow),
			cts: null,
			dts: null,
			duration: undefined,
			trackId: trackNumber,
			timestamp: timecodeInMicroseconds,
		};

		if (keyframe === null) {
			// If we don't know if this is a keyframe, we know after we emit the BlockGroup
			videoSample = partialVideoSample;
		} else {
			const sample: VideoSample = {
				...partialVideoSample,
				type: keyframe ? 'key' : 'delta',
			};

			await parserContext.parserState.onVideoSample(trackNumber, sample);
		}
	}

	if (codec.startsWith('A_')) {
		await parserContext.parserState.onAudioSample(trackNumber, {
			data: iterator.getSlice(remainingNow),
			trackId: trackNumber,
			timestamp: timecodeInMicroseconds,
			type: 'key',
		});
	}

	const remainingNowAfter = length - (iterator.counter.getOffset() - start);
	if (remainingNowAfter > 0) {
		iterator.discard(remainingNowAfter);
	}

	return {
		type: 'simple-block-or-block-segment',
		length,
		trackNumber,
		timecodeInMicroseconds,
		keyframe,
		lacing,
		invisible,
		videoSample,
	};
};

export const parseTrackNumber = (
	iterator: BufferIterator,
	length: number,
): TrackNumberSegment => {
	if (length !== 1) {
		throw new Error('Expected track number to be 1 byte');
	}

	const trackNumber = iterator.getUint8();

	return {
		type: 'track-number-segment',
		trackNumber,
	};
};

export type BlockGroupSegment = {
	type: 'block-group-segment';
	children: MatroskaSegment[];
};

export const parseBlockGroupSegment = async (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): Promise<BlockGroupSegment> => {
	const children = await expectChildren({
		iterator,
		length,
		initialChildren: [],
		wrap: null,
		parserContext,
	});
	if (children.status === 'incomplete') {
		throw new Error('Incomplete boxes are not allowed');
	}

	return {
		type: 'block-group-segment',
		children: children.segments as MatroskaSegment[],
	};
};

export type ReferenceBlockSegment = {
	type: 'reference-block-segment';
	referenceBlock: number;
};

export const parseReferenceBlockSegment = (
	iterator: BufferIterator,
	length: number,
): ReferenceBlockSegment => {
	if (length > 4) {
		throw new Error(
			`Expected reference block segment to be 4 bytes, but got ${length}`,
		);
	}

	const referenceBlock =
		length === 4
			? iterator.getUint32()
			: length === 3
				? iterator.getUint24()
				: length === 2
					? iterator.getUint16()
					: iterator.getUint8();

	return {
		type: 'reference-block-segment',
		referenceBlock,
	};
};

export type BlockAdditionsSegment = {
	type: 'block-additions-segment';
	blockAdditions: Uint8Array;
};

export const parseBlockAdditionsSegment = (
	iterator: BufferIterator,
	length: number,
): BlockAdditionsSegment => {
	const blockAdditions = iterator.getSlice(length);

	return {
		type: 'block-additions-segment',
		blockAdditions,
	};
};

export type BlockElement = {
	type: 'block-element-segment';
	length: number;
};

export const parseBlockElementSegment = (
	iterator: BufferIterator,
	length: number,
): BlockElement => {
	iterator.discard(length);

	return {
		type: 'block-element-segment',
		length,
	};
};

export type SamplingFrequencySegment = {
	type: 'sampling-frequency-segment';
	samplingFrequency: number;
};

export const parseSamplingFrequencySegment = (
	iterator: BufferIterator,
	length: number,
): SamplingFrequencySegment => {
	if (length === 4) {
		return {
			type: 'sampling-frequency-segment',
			samplingFrequency: iterator.getFloat32(),
		};
	}

	if (length === 8) {
		return {
			type: 'sampling-frequency-segment',
			samplingFrequency: iterator.getFloat64(),
		};
	}

	throw new Error(
		`Expected length of sampling frequency segment to be 4 or 8, got ${length}`,
	);
};

export type ChannelsSegment = {
	type: 'channels-segment';
	channels: number;
};

export const parseChannelsSegment = (
	iterator: BufferIterator,
	length: number,
): ChannelsSegment => {
	if (length !== 1) {
		throw new Error(
			`Expected length of channels segment to be 1, got ${length}`,
		);
	}

	const channels = iterator.getUint8();

	return {
		type: 'channels-segment',
		channels,
	};
};

export type BitDepthSegment = {
	type: 'bit-depth-segment';
	bitDepth: number;
};

export const parseBitDepthSegment = (
	iterator: BufferIterator,
	length: number,
): BitDepthSegment => {
	if (length !== 1) {
		throw new Error(
			`Expected length of bit depth segment to be 1, got ${length}`,
		);
	}

	const bitDepth = iterator.getUint8();

	return {
		type: 'bit-depth-segment',
		bitDepth,
	};
};
