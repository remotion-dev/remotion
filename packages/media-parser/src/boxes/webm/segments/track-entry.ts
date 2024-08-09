import type {BufferIterator} from '../../../buffer-iterator';
import type {MatroskaSegment} from '../segments';
import {expectChildren} from './parse-children';

export type TrackEntrySegment = {
	type: 'track-entry-segment';
	children: MatroskaSegment[];
};

export const parseTrackEntry = (
	iterator: BufferIterator,
): TrackEntrySegment => {
	const offset = iterator.counter.getOffset();

	const length = iterator.getVint();

	return {
		type: 'track-entry-segment',
		children: expectChildren(
			iterator,
			length - (iterator.counter.getOffset() - offset),
		),
	};
};

export type TrackNumberSegment = {
	type: 'track-number-segment';
	trackNumber: number;
};

export const parseTrackNumber = (
	iterator: BufferIterator,
): TrackNumberSegment => {
	const length = iterator.getVint();
	if (length !== 1) {
		throw new Error('Expected track number to be 1 byte');
	}

	const trackNumber = iterator.getUint8();

	return {
		type: 'track-number-segment',
		trackNumber,
	};
};

export type TrackUIDSegment = {
	type: 'track-uid-segment';
	trackUid: string;
};

export const parseTrackUID = (iterator: BufferIterator): TrackUIDSegment => {
	const length = iterator.getVint();

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
): FlagLacingSegment => {
	const length = iterator.getVint();
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
): LanguageSegment => {
	const length = iterator.getVint();
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

export const parseCodecSegment = (iterator: BufferIterator): CodecSegment => {
	const length = iterator.getVint();

	// Could make a TypeScript enum with it
	// https://www.matroska.org/technical/codec_specs.html
	const codec = iterator.getByteString(length);

	return {
		type: 'codec-segment',
		codec,
	};
};

export type TrackTypeSegment = {
	type: 'track-type-segment';
	trackType: number;
};

export const parseTrackTypeSegment = (
	iterator: BufferIterator,
): TrackTypeSegment => {
	const length = iterator.getVint();
	if (length !== 1) {
		throw new Error('Expected track type segment to be 1 byte');
	}

	const trackType = iterator.getUint8();

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
		trackType,
	};
};

export type DefaultDurationSegment = {
	type: 'default-duration-segment';
	defaultDuration: number;
};

export const parseDefaultDurationSegment = (
	iterator: BufferIterator,
): DefaultDurationSegment => {
	const length = iterator.getVint();

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

export const parseVideoSegment = (iterator: BufferIterator): VideoSegment => {
	const length = iterator.getVint();

	return {
		type: 'video-segment',
		children: expectChildren(iterator, length),
	};
};

export type WidthSegment = {
	type: 'width-segment';
	width: number;
};

export const parseWidthSegment = (iterator: BufferIterator): WidthSegment => {
	const length = iterator.getVint();
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

export const parseHeightSegment = (iterator: BufferIterator): HeightSegment => {
	const length = iterator.getVint();
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
): AlphaModeSegment => {
	const length = iterator.getVint();
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
): MaxBlockAdditionId => {
	const length = iterator.getVint();
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

export const parseColorSegment = (iterator: BufferIterator): ColorSegment => {
	const length = iterator.getVint();

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

export const parseTitleSegment = (iterator: BufferIterator): TitleSegment => {
	const length = iterator.getVint();
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
): InterlacedSegment => {
	const length = iterator.getVint();
	if (length !== 1) {
		throw new Error('Expected interlaced segment to be 1 byte');
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
): CodecPrivateSegment => {
	const length = iterator.getVint();

	return {
		type: 'codec-private-segment',
		codecPrivateData: [...iterator.getSlice(length)],
	};
};

export type Crc32Segment = {
	type: 'crc32-segment';
	crc32: number[];
};

export const parseCrc32Segment = (iterator: BufferIterator): Crc32Segment => {
	const length = iterator.getVint();

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
): SegmentUUIDSegment => {
	const length = iterator.getVint();

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
): DefaultFlagSegment => {
	const length = iterator.getVint();
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

export const parseTagsSegment = (iterator: BufferIterator): TagsSegment => {
	const offset = iterator.counter.getOffset();
	const length = iterator.getVint();

	return {
		type: 'tags-segment',
		children: expectChildren(
			iterator,
			length - (iterator.counter.getOffset() - offset),
		),
	};
};

export type TagSegment = {
	type: 'tag-segment';
	length: number;
};

export const parseTagSegment = (iterator: BufferIterator): TagSegment => {
	const length = iterator.getVint();

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

export const parseClusterSegment = (
	iterator: BufferIterator,
): ClusterSegment => {
	const length = iterator.getVint();

	return {
		type: 'cluster-segment',
		children: expectChildren(iterator, length),
	};
};

export type TimestampSegment = {
	type: 'timestamp-segment';
	timestamp: number;
};

export const parseTimestampSegment = (
	iterator: BufferIterator,
): TimestampSegment => {
	const length = iterator.getVint();
	const value = iterator.getUint8();
	iterator.discard(length);

	return {
		type: 'timestamp-segment',
		timestamp: value,
	};
};
