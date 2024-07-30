import type {BufferIterator} from '../../buffer-iterator';
import type {DurationSegment} from './segments/duration';
import {parseDurationSegment} from './segments/duration';
import type {InfoSegment} from './segments/info';
import {parseInfoSegment} from './segments/info';
import type {MainSegment} from './segments/main';
import {parseMainSegment} from './segments/main';
import {parseMuxingSegment, type MuxingAppSegment} from './segments/muxing';
import {parseSeekSegment, type SeekSegment} from './segments/seek';
import type {SeekHeadSegment} from './segments/seek-head';
import {parseSeekHeadSegment} from './segments/seek-head';
import {
	parseSeekPositionSegment,
	type SeekPositionSegment,
} from './segments/seek-position';
import type {TimestampScaleSegment} from './segments/timestamp-scale';
import {parseTimestampScaleSegment} from './segments/timestamp-scale';
import type {
	AlphaModeSegment,
	CodecSegment,
	ColorSegment,
	DefaultDurationSegment,
	FlagLacingSegment,
	HeightSegment,
	LanguageSegment,
	MaxBlockAdditionId,
	TrackEntrySegment,
	TrackNumberSegment,
	TrackTypeSegment,
	TrackUIDSegment,
	VideoSegment,
	WidthSegment,
} from './segments/track-entry';
import {
	parseAlphaModeSegment,
	parseCodecSegment,
	parseColorSegment,
	parseDefaultDurationSegment,
	parseFlagLacing,
	parseHeightSegment,
	parseLanguageSegment,
	parseMaxBlockAdditionId,
	parseTrackEntry,
	parseTrackNumber,
	parseTrackTypeSegment,
	parseTrackUID,
	parseVideoSegment,
	parseWidthSegment,
} from './segments/track-entry';
import type {TracksSegment} from './segments/tracks';
import {parseTracksSegment} from './segments/tracks';
import type {UnknownSegment} from './segments/unknown';
import {parseUnknownSegment} from './segments/unknown';
import type {VoidSegment} from './segments/void';
import {parseVoidSegment} from './segments/void';
import type {WritingAppSegment} from './segments/writing';
import {parseWritingSegment} from './segments/writing';

export type MatroskaSegment =
	| MainSegment
	| UnknownSegment
	| SeekHeadSegment
	| SeekSegment
	| SeekPositionSegment
	| VoidSegment
	| InfoSegment
	| TimestampScaleSegment
	| MuxingAppSegment
	| WritingAppSegment
	| DurationSegment
	| TracksSegment
	| TrackEntrySegment
	| TrackNumberSegment
	| TrackUIDSegment
	| FlagLacingSegment
	| LanguageSegment
	| CodecSegment
	| TrackTypeSegment
	| DefaultDurationSegment
	| VideoSegment
	| WidthSegment
	| HeightSegment
	| AlphaModeSegment
	| MaxBlockAdditionId
	| ColorSegment;

export const expectSegment = (iterator: BufferIterator): MatroskaSegment => {
	const segmentId = iterator.getMatroskaSegmentId();

	if (segmentId === '0x') {
		return {
			type: 'unknown-segment',
			id: segmentId,
		};
	}

	if (segmentId === '0x18538067') {
		return parseMainSegment(iterator);
	}

	if (segmentId === '0x114d9b74') {
		return parseSeekHeadSegment(iterator);
	}

	if (segmentId === '0x4dbb') {
		return parseSeekSegment(iterator);
	}

	if (segmentId === '0x53ac') {
		return parseSeekPositionSegment(iterator);
	}

	if (segmentId === '0xec') {
		return parseVoidSegment(iterator);
	}

	if (segmentId === '0x1549a966') {
		return parseInfoSegment(iterator);
	}

	if (segmentId === '0x2ad7b183') {
		return parseTimestampScaleSegment(iterator);
	}

	if (segmentId === '0x4d80') {
		return parseMuxingSegment(iterator);
	}

	if (segmentId === '0x5741') {
		return parseWritingSegment(iterator);
	}

	if (segmentId === '0x4489') {
		return parseDurationSegment(iterator);
	}

	if (segmentId === '0x1654ae6b') {
		return parseTracksSegment(iterator);
	}

	if (segmentId === '0xae') {
		return parseTrackEntry(iterator);
	}

	if (segmentId === '0xd7') {
		return parseTrackNumber(iterator);
	}

	if (segmentId === '0x73c5') {
		return parseTrackUID(iterator);
	}

	if (segmentId === '0x9c') {
		return parseFlagLacing(iterator);
	}

	if (segmentId === '0x22b59c') {
		return parseLanguageSegment(iterator);
	}

	if (segmentId === '0x86') {
		return parseCodecSegment(iterator);
	}

	if (segmentId === '0x83') {
		return parseTrackTypeSegment(iterator);
	}

	if (segmentId === '0x55ee') {
		return parseMaxBlockAdditionId(iterator);
	}

	if (segmentId === '0x55b0') {
		return parseColorSegment(iterator);
	}

	if (segmentId === '0x23e383') {
		return parseDefaultDurationSegment(iterator);
	}

	if (segmentId === '0xe0') {
		return parseVideoSegment(iterator);
	}

	if (segmentId === '0xb0') {
		return parseWidthSegment(iterator);
	}

	if (segmentId === '0xba') {
		return parseHeightSegment(iterator);
	}

	if (segmentId === '0x53c0') {
		return parseAlphaModeSegment(iterator);
	}

	const length = iterator.getVint(8);

	const bytesRemaining = iterator.byteLength() - iterator.counter.getOffset();
	const toDiscard = Math.min(
		bytesRemaining,
		length > 0 ? length : bytesRemaining,
	);

	const child = parseUnknownSegment(iterator, segmentId, toDiscard);
	return child;
};
