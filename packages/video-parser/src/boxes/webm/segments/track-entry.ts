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
	const length = iterator.getVint(8);

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
	const length = iterator.getVint(1);
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
	const length = iterator.getVint(1);
	if (length !== 8) {
		throw new Error('Expected track number to be 8 byte');
	}

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
	const length = iterator.getVint(1);
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
	const length = iterator.getVint(1);
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
	const length = iterator.getVint(1);

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
	const length = iterator.getVint(1);
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
	const length = iterator.getVint(1);

	const defaultDuration = iterator.getDecimalBytes(length);

	return {
		type: 'default-duration-segment',
		defaultDuration,
	};
};
