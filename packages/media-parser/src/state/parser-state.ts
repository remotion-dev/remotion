import type {AvcPPs, AvcProfileInfo} from '../boxes/avc/parse-avc';
import type {BufferIterator} from '../buffer-iterator';
import type {Options, ParseMediaFields} from '../options';
import type {OnAudioTrack, OnVideoTrack} from '../webcodec-sample-types';
import {makeCanSkipTracksState} from './can-skip-tracks';
import {keyframesState} from './keyframes';
import {riffSpecificState} from './riff';
import {sampleCallback} from './sample-callbacks';
import {structureState} from './structure';
import {webmState} from './webm';

export type InternalStats = {
	skippedBytes: number;
	finalCursorOffset: number;
};

export type SpsAndPps = {
	sps: AvcProfileInfo;
	pps: AvcPPs;
};

export const makeParserState = ({
	hasAudioTrackHandlers,
	hasVideoTrackHandlers,
	signal,
	getIterator,
	fields,
	nullifySamples,
	onAudioTrack,
	onVideoTrack,
	supportsContentRange,
}: {
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	signal: AbortSignal | undefined;
	getIterator: () => BufferIterator | null;
	fields: Options<ParseMediaFields>;
	nullifySamples: boolean;
	supportsContentRange: boolean;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
}) => {
	const keyframes = keyframesState();
	const structure = structureState();

	let timescale: number | null = null;
	let skippedBytes: number = 0;

	const getTimescale = () => {
		// https://www.matroska.org/technical/notes.html
		// When using the default value of TimestampScale of “1,000,000”, one Segment Tick represents one millisecond.
		if (timescale === null) {
			return 1_000_000;
		}

		return timescale;
	};

	const increaseSkippedBytes = (bytes: number) => {
		skippedBytes += bytes;
	};

	const setTimescale = (newTimescale: number) => {
		timescale = newTimescale;
	};

	const timestampMap = new Map<number, number>();

	const setTimestampOffset = (byteOffset: number, timestamp: number) => {
		timestampMap.set(byteOffset, timestamp);
	};

	const getTimestampOffsetForByteOffset = (byteOffset: number) => {
		const entries = Array.from(timestampMap.entries());
		const sortedByByteOffset = entries
			.sort((a, b) => {
				return a[0] - b[0];
			})
			.reverse();
		for (const [offset, timestamp] of sortedByByteOffset) {
			if (offset >= byteOffset) {
				continue;
			}

			return timestamp;
		}

		return timestampMap.get(byteOffset);
	};

	const canSkipTracksState = makeCanSkipTracksState({
		hasAudioTrackHandlers,
		fields,
		hasVideoTrackHandlers,
	});
	const riff = riffSpecificState();
	const sample = sampleCallback(canSkipTracksState, signal);

	return {
		riff,
		sample,
		setTimestampOffset,
		getTimestampOffsetForByteOffset,
		getTimescale,
		setTimescale,
		getInternalStats: (): InternalStats => ({
			skippedBytes,
			finalCursorOffset: getIterator()?.counter.getOffset() ?? 0,
		}),
		getSkipBytes: () => skippedBytes,
		increaseSkippedBytes,
		canSkipTracksState,
		keyframes,
		structure,
		nullifySamples,
		onAudioTrack,
		onVideoTrack,
		supportsContentRange,
		webm: webmState(),
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
