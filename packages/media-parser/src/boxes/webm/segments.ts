import {registerTrack} from '../../add-new-matroska-tracks';
import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import type {VideoSample} from '../../webcodec-sample-types';
import {getTrack} from './get-track';
import {parseEbml} from './parse-ebml';
import type {PossibleEbml} from './segments/all-segments';
import {matroskaElements} from './segments/all-segments';
import {type MainSegment} from './segments/main';
import {expectChildren} from './segments/parse-children';
import type {
	AlphaModeSegment,
	AudioSegment,
	BitDepthSegment,
	BlockAdditionsSegment,
	BlockElement,
	BlockGroupSegment,
	ChannelsSegment,
	ClusterSegment,
	CodecPrivateSegment,
	ColorSegment,
	DefaultDurationSegment,
	DefaultFlagSegment,
	DisplayHeightSegment,
	DisplayWidthSegment,
	FlagLacingSegment,
	InterlacedSegment,
	LanguageSegment,
	MaxBlockAdditionId,
	ReferenceBlockSegment,
	SamplingFrequencySegment,
	SimpleBlockOrBlockSegment,
	TagSegment,
	TagsSegment,
	TimestampSegment,
	TrackEntrySegment,
	TrackNumberSegment,
	TrackUIDSegment,
	VideoSegment,
} from './segments/track-entry';
import {
	parseAlphaModeSegment,
	parseAudioSegment,
	parseBitDepthSegment,
	parseBlockAdditionsSegment,
	parseBlockElementSegment,
	parseBlockGroupSegment,
	parseChannelsSegment,
	parseCodecPrivateSegment,
	parseColorSegment,
	parseDefaultDurationSegment,
	parseDefaultFlagSegment,
	parseDisplayHeightSegment,
	parseDisplayWidthSegment,
	parseFlagLacing,
	parseInterlacedSegment,
	parseLanguageSegment,
	parseMaxBlockAdditionId,
	parseReferenceBlockSegment,
	parseSamplingFrequencySegment,
	parseSimpleBlockOrBlockSegment,
	parseTagSegment,
	parseTagsSegment,
	parseTimestampSegment,
	parseTrackEntry,
	parseTrackNumber,
	parseTrackUID,
	parseVideoSegment,
} from './segments/track-entry';
import type {TracksSegment} from './segments/tracks';
import {parseTracksSegment} from './segments/tracks';

export type MatroskaSegment =
	| MainSegment
	| TracksSegment
	| TrackEntrySegment
	| TrackNumberSegment
	| TrackUIDSegment
	| FlagLacingSegment
	| LanguageSegment
	| DefaultDurationSegment
	| VideoSegment
	| DisplayWidthSegment
	| DisplayHeightSegment
	| AlphaModeSegment
	| MaxBlockAdditionId
	| ColorSegment
	| InterlacedSegment
	| CodecPrivateSegment
	| DefaultFlagSegment
	| TagsSegment
	| TagSegment
	| ClusterSegment
	| TimestampSegment
	| SimpleBlockOrBlockSegment
	| BlockGroupSegment
	| BlockElement
	| AudioSegment
	| SamplingFrequencySegment
	| ChannelsSegment
	| BitDepthSegment
	| ReferenceBlockSegment
	| BlockAdditionsSegment
	| PossibleEbml;

export type OnTrackEntrySegment = (trackEntry: TrackEntrySegment) => void;

const parseSegment = async ({
	segmentId,
	iterator,
	length,
	parserContext,
	headerReadSoFar,
}: {
	segmentId: string;
	iterator: BufferIterator;
	length: number;
	parserContext: ParserContext;
	headerReadSoFar: number;
}): Promise<Promise<MatroskaSegment> | MatroskaSegment> => {
	if (length === 0) {
		throw new Error(`Expected length of ${segmentId} to be greater than 0`);
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

	if (
		segmentId === matroskaElements.SimpleBlock ||
		segmentId === matroskaElements.Block
	) {
		return parseSimpleBlockOrBlockSegment({
			iterator,
			length,
			parserContext,
			type: segmentId,
		});
	}

	if (segmentId === matroskaElements.ReferenceBlock) {
		return parseReferenceBlockSegment(iterator, length);
	}

	if (segmentId === matroskaElements.BlockAdditions) {
		return parseBlockAdditionsSegment(iterator, length);
	}

	if (segmentId === '0xa0') {
		const blockGroup = await parseBlockGroupSegment(
			iterator,
			length,
			parserContext,
		);

		// Blocks don't have information about keyframes.
		// https://ffmpeg.org/pipermail/ffmpeg-devel/2015-June/173825.html
		// "For Blocks, keyframes is
		// inferred by the absence of ReferenceBlock element (as done by matroskadec).""

		const block = blockGroup.children.find(
			(c) => c.type === 'simple-block-or-block-segment',
		);
		if (!block || block.type !== 'simple-block-or-block-segment') {
			throw new Error('Expected block segment');
		}

		const hasReferenceBlock = blockGroup.children.find(
			(c) => c.type === 'reference-block-segment',
		);

		const partialVideoSample = block.videoSample;

		if (partialVideoSample) {
			const completeFrame: VideoSample = {
				...partialVideoSample,
				type: hasReferenceBlock ? 'delta' : 'key',
			};
			await parserContext.parserState.onVideoSample(
				partialVideoSample.trackId,
				completeFrame,
			);
		}

		return blockGroup;
	}

	if (segmentId === '0xa1') {
		return parseBlockElementSegment(iterator, length);
	}

	iterator.counter.decrement(headerReadSoFar);

	const ebml = parseEbml(iterator);
	if (ebml.type === 'TimestampScale') {
		parserContext.parserState.setTimescale(ebml.value);
	}

	return ebml;
};

export const expectSegment = async (
	iterator: BufferIterator,
	parserContext: ParserContext,
): Promise<ParseResult> => {
	const offset = iterator.counter.getOffset();
	if (iterator.bytesRemaining() === 0) {
		return {
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return Promise.resolve(expectSegment(iterator, parserContext));
			},
			skipTo: null,
		};
	}

	const segmentId = iterator.getMatroskaSegmentId();

	if (segmentId === null) {
		iterator.counter.decrement(iterator.counter.getOffset() - offset);
		return {
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return Promise.resolve(expectSegment(iterator, parserContext));
			},
			skipTo: null,
		};
	}

	const length = iterator.getVint();
	if (length === null) {
		iterator.counter.decrement(iterator.counter.getOffset() - offset);
		return {
			status: 'incomplete',
			segments: [],
			continueParsing: () => {
				return Promise.resolve(expectSegment(iterator, parserContext));
			},
			skipTo: null,
		};
	}

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
		headerReadSoFar: iterator.counter.getOffset() - offset,
	});

	return {
		status: 'done',
		segments: [segment],
	};
};
