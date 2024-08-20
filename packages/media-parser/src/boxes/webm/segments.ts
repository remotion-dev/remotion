import {registerTrack} from '../../add-new-matroska-tracks';
import type {BufferIterator} from '../../buffer-iterator';
import type {ParseResult} from '../../parse-result';
import type {ParserContext} from '../../parser-context';
import type {VideoSample} from '../../webcodec-sample-types';
import {getTrack} from './get-track';
import {parseEbml} from './parse-ebml';
import type {PossibleEbml, TrackEntrySegment} from './segments/all-segments';
import {matroskaElements} from './segments/all-segments';
import {type MainSegment} from './segments/main';
import {expectChildren} from './segments/parse-children';
import type {
	BlockGroupSegment,
	ClusterSegment,
	SimpleBlockOrBlockSegment,
	TimestampSegment,
} from './segments/track-entry';
import {
	parseBlockGroupSegment,
	parseSimpleBlockOrBlockSegment,
	parseTimestampSegment,
} from './segments/track-entry';
import type {TracksSegment} from './tracks';
import {parseTracksSegment} from './tracks';

export type MatroskaSegment =
	| MainSegment
	| ClusterSegment
	| SimpleBlockOrBlockSegment
	| BlockGroupSegment
	| TimestampSegment
	| TracksSegment
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

	if (segmentId === matroskaElements.Timestamp) {
		const off = iterator.counter.getOffset();
		const timestampSegment = parseTimestampSegment(iterator, length);

		parserContext.parserState.setTimestampOffset(
			off,
			timestampSegment.timestamp,
		);

		return timestampSegment;
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
			(c) => c.type === 'ReferenceBlock',
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

	iterator.counter.decrement(headerReadSoFar);

	const ebml = parseEbml(iterator);
	if (ebml.type === 'TimestampScale') {
		parserContext.parserState.setTimescale(ebml.value);
	}

	if (ebml.type === 'TrackEntry') {
		parserContext.parserState.onTrackEntrySegment(ebml);

		const track = getTrack({
			track: ebml,
			timescale: parserContext.parserState.getTimescale(),
		});

		if (track) {
			await registerTrack({
				state: parserContext.parserState,
				options: parserContext,
				track,
			});
		}
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
