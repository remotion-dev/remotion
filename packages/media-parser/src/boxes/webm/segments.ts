import {registerTrack} from '../../add-new-matroska-tracks';
import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import {getTrack} from './get-track';
import {matroskaElements} from './segments/all-segments';
import type {DurationSegment} from './segments/duration';
import {parseDurationSegment} from './segments/duration';
import type {InfoSegment} from './segments/info';
import {parseInfoSegment} from './segments/info';
import {type MainSegment} from './segments/main';
import {parseMuxingSegment, type MuxingAppSegment} from './segments/muxing';
import {expectChildren} from './segments/parse-children';
import type {SeekIdSegment} from './segments/seek';
import {
	parseSeekIdSegment,
	parseSeekSegment,
	type SeekSegment,
} from './segments/seek';
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
	AudioSegment,
	BitDepthSegment,
	BlockElement,
	BlockGroupSegment,
	ChannelsSegment,
	ClusterSegment,
	CodecPrivateSegment,
	CodecSegment,
	ColorSegment,
	Crc32Segment,
	DefaultDurationSegment,
	DefaultFlagSegment,
	DisplayHeightSegment,
	DisplayWidthSegment,
	FlagLacingSegment,
	HeightSegment,
	InterlacedSegment,
	LanguageSegment,
	MaxBlockAdditionId,
	SamplingFrequencySegment,
	SegmentUUIDSegment,
	SimpleBlockSegment,
	TagSegment,
	TagsSegment,
	TimestampSegment,
	TitleSegment,
	TrackEntrySegment,
	TrackNumberSegment,
	TrackTypeSegment,
	TrackUIDSegment,
	VideoSegment,
	WidthSegment,
} from './segments/track-entry';
import {
	parseAlphaModeSegment,
	parseAudioSegment,
	parseBitDepthSegment,
	parseBlockElementSegment,
	parseBlockGroupSegment,
	parseChannelsSegment,
	parseCodecPrivateSegment,
	parseCodecSegment,
	parseColorSegment,
	parseCrc32Segment,
	parseDefaultDurationSegment,
	parseDefaultFlagSegment,
	parseDisplayHeightSegment,
	parseDisplayWidthSegment,
	parseFlagLacing,
	parseHeightSegment,
	parseInterlacedSegment,
	parseLanguageSegment,
	parseMaxBlockAdditionId,
	parseSamplingFrequencySegment,
	parseSegmentUUIDSegment,
	parseSimpleBlockSegment,
	parseTagSegment,
	parseTagsSegment,
	parseTimestampSegment,
	parseTitleSegment,
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
	| DisplayWidthSegment
	| DisplayHeightSegment
	| AlphaModeSegment
	| MaxBlockAdditionId
	| ColorSegment
	| TitleSegment
	| InterlacedSegment
	| CodecPrivateSegment
	| Crc32Segment
	| SegmentUUIDSegment
	| DefaultFlagSegment
	| TagsSegment
	| TagSegment
	| ClusterSegment
	| TimestampSegment
	| SimpleBlockSegment
	| BlockGroupSegment
	| BlockElement
	| SeekIdSegment
	| AudioSegment
	| SamplingFrequencySegment
	| ChannelsSegment
	| BitDepthSegment;

export type OnTrackEntrySegment = (trackEntry: TrackEntrySegment) => void;

const parseSegment = async ({
	segmentId,
	iterator,
	length,
	parserContext,
}: {
	segmentId: string;
	iterator: BufferIterator;
	length: number;
	parserContext: ParserContext;
}): Promise<Promise<MatroskaSegment> | MatroskaSegment> => {
	if (length === 0) {
		throw new Error(`Expected length of ${segmentId} to be greater than 0`);
	}

	if (segmentId === '0x') {
		return {
			type: 'unknown-segment',
			id: segmentId,
		};
	}

	// Log this to debug
	/*
	console.log(
		'segmentId',
		segmentId,
		getSegmentName(segmentId),
		iterator.counter.getOffset(),
	);
	*/

	if (segmentId === '0x114d9b74') {
		return parseSeekHeadSegment(iterator, length, parserContext);
	}

	if (segmentId === '0x53ab') {
		return parseSeekIdSegment(iterator);
	}

	if (segmentId === '0x4dbb') {
		return parseSeekSegment(iterator, length, parserContext);
	}

	if (segmentId === '0x53ac') {
		return parseSeekPositionSegment(iterator, length);
	}

	if (segmentId === '0xec') {
		return parseVoidSegment(iterator, length);
	}

	if (segmentId === '0x1549a966') {
		return parseInfoSegment(iterator, length, parserContext);
	}

	if (segmentId === matroskaElements.TimestampScale) {
		const timestampScale = parseTimestampScaleSegment(iterator);
		parserContext.parserState.setTimescale(timestampScale.timestampScale);
		return timestampScale;
	}

	if (segmentId === '0x4d80') {
		return parseMuxingSegment(iterator, length);
	}

	if (segmentId === '0x5741') {
		return parseWritingSegment(iterator, length);
	}

	if (segmentId === '0x4489') {
		return parseDurationSegment(iterator, length);
	}

	if (segmentId === '0x1654ae6b') {
		return parseTracksSegment(iterator, length, parserContext);
	}

	if (segmentId === matroskaElements.TrackEntry) {
		const trackEntry = await parseTrackEntry(iterator, length, parserContext);

		parserContext.parserState.onTrackEntrySegment(trackEntry);

		const track = getTrack({
			track: trackEntry,
			timescale: parserContext.parserState.getTimescale(),
		});

		if (track) {
			await registerTrack({
				state: parserContext.parserState,
				options: parserContext,
				track,
			});
		}

		return trackEntry;
	}

	if (segmentId === '0xd7') {
		return parseTrackNumber(iterator, length);
	}

	if (segmentId === '0x73c5') {
		return parseTrackUID(iterator, length);
	}

	if (segmentId === '0x9c') {
		return parseFlagLacing(iterator, length);
	}

	if (segmentId === '0x22b59c') {
		return parseLanguageSegment(iterator, length);
	}

	if (segmentId === '0x86') {
		return parseCodecSegment(iterator, length);
	}

	if (segmentId === '0x83') {
		return parseTrackTypeSegment(iterator, length);
	}

	if (segmentId === '0x55ee') {
		return parseMaxBlockAdditionId(iterator, length);
	}

	if (segmentId === '0x55b0') {
		return parseColorSegment(iterator, length);
	}

	if (segmentId === '0x23e383') {
		return parseDefaultDurationSegment(iterator, length);
	}

	if (segmentId === '0xe0') {
		return parseVideoSegment(iterator, length, parserContext);
	}

	if (segmentId === '0xe1') {
		return parseAudioSegment(iterator, length, parserContext);
	}

	if (segmentId === '0xb0') {
		return parseWidthSegment(iterator, length);
	}

	if (segmentId === '0xba') {
		return parseHeightSegment(iterator, length);
	}

	if (segmentId === matroskaElements.DisplayWidth) {
		return parseDisplayWidthSegment(iterator, length);
	}

	if (segmentId === matroskaElements.DisplayHeight) {
		return parseDisplayHeightSegment(iterator, length);
	}

	if (segmentId === '0x9a') {
		return parseInterlacedSegment(iterator, length);
	}

	if (segmentId === '0x53c0') {
		return parseAlphaModeSegment(iterator, length);
	}

	if (segmentId === '0x63a2') {
		return parseCodecPrivateSegment(iterator, length);
	}

	if (segmentId === '0x7ba9') {
		return parseTitleSegment(iterator, length);
	}

	if (segmentId === '0xbf') {
		return parseCrc32Segment(iterator, length);
	}

	if (segmentId === '0x73a4') {
		return parseSegmentUUIDSegment(iterator, length);
	}

	if (segmentId === '0x88') {
		return parseDefaultFlagSegment(iterator, length);
	}

	if (segmentId === '0x1254c367') {
		return parseTagsSegment(iterator, length, parserContext);
	}

	if (segmentId === '0x7373') {
		return parseTagSegment(iterator, length);
	}

	if (segmentId === matroskaElements.SamplingFrequency) {
		return parseSamplingFrequencySegment(iterator, length);
	}

	if (segmentId === matroskaElements.Channels) {
		return parseChannelsSegment(iterator, length);
	}

	if (segmentId === matroskaElements.BitDepth) {
		return parseBitDepthSegment(iterator, length);
	}

	if (segmentId === matroskaElements.Timestamp) {
		const offset = iterator.counter.getOffset();
		const timestampSegment = parseTimestampSegment(iterator, length);

		parserContext.parserState.setTimestampOffset(
			offset,
			timestampSegment.timestamp,
		);

		return timestampSegment;
	}

	if (segmentId === '0xa3') {
		return parseSimpleBlockSegment({
			iterator,
			length,
			parserContext,
		});
	}

	if (segmentId === '0xa0') {
		return parseBlockGroupSegment(iterator, length, parserContext);
	}

	if (segmentId === '0xa1') {
		return parseBlockElementSegment(iterator, length);
	}

	const bytesRemaining = iterator.byteLength() - iterator.counter.getOffset();
	const toDiscard = Math.min(
		bytesRemaining,
		length > 0 ? length : bytesRemaining,
	);

	const child = parseUnknownSegment(iterator, segmentId, toDiscard);
	return child;
};

export const expectSegment = async (
	iterator: BufferIterator,
	parserContext: ParserContext,
): Promise<ParseResult> => {
	const bytesRemaining_ = iterator.bytesRemaining();
	if (bytesRemaining_ === 0) {
		return {
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return Promise.resolve(expectSegment(iterator, parserContext));
			},
			skipTo: null,
		};
	}

	const offset = iterator.counter.getOffset();
	const segmentId = iterator.getMatroskaSegmentId();
	const length = iterator.getVint();
	const bytesRemainingNow =
		iterator.byteLength() - iterator.counter.getOffset();

	if (segmentId === '0x18538067' || segmentId === '0x1f43b675') {
		const main = await expectChildren({
			iterator,
			length,
			initialChildren: [],
			wrap:
				segmentId === '0x18538067'
					? (s) => ({
							type: 'main-segment',
							children: s,
						})
					: (s) => ({
							type: 'cluster-segment',
							children: s,
						}),
			parserContext,
		});

		if (main.status === 'incomplete') {
			return {
				status: 'incomplete',
				segments: main.segments,
				skipTo: null,
				continueParsing: main.continueParsing,
			};
		}

		return {
			status: 'done',
			segments: main.segments,
		};
	}

	if (bytesRemainingNow < length) {
		const bytesRead = iterator.counter.getOffset() - offset;
		iterator.counter.decrement(bytesRead);
		return {
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return Promise.resolve(expectSegment(iterator, parserContext));
			},
			skipTo: null,
		};
	}

	const segment = await parseSegment({
		segmentId,
		iterator,
		length,
		parserContext,
	});

	return {
		status: 'done',
		segments: [segment],
	};
};
