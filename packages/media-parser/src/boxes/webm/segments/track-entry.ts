import type {BufferIterator} from '../../../buffer-iterator';
import type {ParserContext} from '../../../parser-context';
import {av1Bitstream} from '../bitstream/av1';
import type {MatroskaSegment} from '../segments';
import {getTrackByNumber, getTrackCodec} from '../traversal';
import {expectChildren} from './parse-children';

export type TrackEntrySegment = {
	type: 'track-entry-segment';
	children: MatroskaSegment[];
};

export const parseTrackEntry = (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): TrackEntrySegment => {
	const children = expectChildren({
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

export type CodecSegment = {
	type: 'codec-segment';
	codec: string;
};

export const parseCodecSegment = (
	iterator: BufferIterator,
	length: number,
): CodecSegment => {
	// Could make a TypeScript enum with it
	// https://www.matroska.org/technical/codec_specs.html
	const codec = iterator.getByteString(length);

	return {
		type: 'codec-segment',
		codec,
	};
};

type TrackType =
	| 'video'
	| 'audio'
	| 'complex'
	| 'subtitle'
	| 'button'
	| 'control'
	| 'metadata';

export type TrackTypeSegment = {
	type: 'track-type-segment';
	trackType: TrackType;
};

const trackTypeToString = (trackType: number): TrackType => {
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

export const parseTrackTypeSegment = (
	iterator: BufferIterator,
	length: number,
): TrackTypeSegment => {
	if (length !== 1) {
		throw new Error('Expected track type segment to be 1 byte');
	}

	const trackType = iterator.getUint8();

	const trackTypeString = trackTypeToString(trackType);

	// Could make the return type nicer
	/* 1 - video,
  	2 - audio,
		3 - complex,
		16 - logo,
		17 - subtitle,
		18 - buttons,
		32 - control,
		33 - metadata;
    */
	return {
		type: 'track-type-segment',
		trackType: trackTypeString,
	};
};

export type DefaultDurationSegment = {
	type: 'default-duration-segment';
	defaultDuration: number;
};

export const parseDefaultDurationSegment = (
	iterator: BufferIterator,
	length: number,
): DefaultDurationSegment => {
	const defaultDuration = iterator.getDecimalBytes(length);

	return {
		type: 'default-duration-segment',
		defaultDuration,
	};
};

export type VideoSegment = {
	type: 'video-segment';

	children: MatroskaSegment[];
};

export const parseVideoSegment = (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): VideoSegment => {
	const children = expectChildren({
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
	codecPrivateData: number[];
};

export const parseCodecPrivateSegment = (
	iterator: BufferIterator,
	length: number,
): CodecPrivateSegment => {
	return {
		type: 'codec-private-segment',
		codecPrivateData: [...iterator.getSlice(length)],
	};
};

export type Crc32Segment = {
	type: 'crc32-segment';
	crc32: number[];
};

export const parseCrc32Segment = (
	iterator: BufferIterator,
	length: number,
): Crc32Segment => {
	return {
		type: 'crc32-segment',
		crc32: [...iterator.getSlice(length)],
	};
};

export type SegmentUUIDSegment = {
	type: 'segment-uuid-segment';
	segmentUUID: string;
};

export const parseSegmentUUIDSegment = (
	iterator: BufferIterator,
	length: number,
): SegmentUUIDSegment => {
	return {
		type: 'segment-uuid-segment',
		segmentUUID: iterator.getSlice(length).toString(),
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

export const parseTagsSegment = (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): TagsSegment => {
	const children = expectChildren({
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
	if (length > 2) {
		throw new Error('Expected timestamp segment to be 1 byte or 2 bytes');
	}

	const value = length === 2 ? iterator.getUint16() : iterator.getUint8();

	return {
		type: 'timestamp-segment',
		timestamp: value,
	};
};

export type SimpleBlockSegment = {
	type: 'simple-block-segment';
	length: number;
	trackNumber: number;
	timecode: number;
	headerFlags: number;
	keyframe: boolean;
	lacing: [number, number];
	invisible: boolean;
};

export type GetTracks = () => TrackEntrySegment[];

export const parseSimpleBlockSegment = (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): SimpleBlockSegment => {
	const start = iterator.counter.getOffset();
	const trackNumber = iterator.getVint();
	const timecode = iterator.getUint16();
	const headerFlags = iterator.getUint8();

	const invisible = Boolean((headerFlags >> 5) & 1);
	const pos6 = (headerFlags >> 6) & 1;
	const pos7 = (headerFlags >> 6) & 1;
	const keyframe = Boolean((headerFlags >> 7) & 1);

	const track = getTrackByNumber(parserContext.getTracks(), trackNumber);
	if (!track) {
		throw new Error('Could not find track ' + trackNumber);
	}

	const codec = getTrackCodec(track);
	if (!codec) {
		throw new Error('Could not find codec for track ' + trackNumber);
	}

	console.log('block', start.toString(16));

	if (codec.codec === 'V_AV1') {
		let remainingNow = length - (iterator.counter.getOffset() - start);

		// eslint-disable-next-line no-constant-condition
		while (true) {
			const bitStream = av1Bitstream(iterator, remainingNow);
			remainingNow = length - (iterator.counter.getOffset() - start);
			if (!bitStream.discarded) {
				iterator.discard(remainingNow);
				break;
			}

			if (remainingNow === 0) {
				break;
			}
		}
	}

	return {
		type: 'simple-block-segment',
		length,
		trackNumber,
		timecode,
		headerFlags,
		keyframe,
		lacing: [pos6, pos7],
		invisible,
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

export const parseBlockGroupSegment = (
	iterator: BufferIterator,
	length: number,
	parserContext: ParserContext,
): BlockGroupSegment => {
	const children = expectChildren({
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
