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
	let skippedBytes: number = 0;

	const increaseSkippedBytes = (bytes: number) => {
		skippedBytes += bytes;
	};

	const canSkipTracksState = makeCanSkipTracksState({
		hasAudioTrackHandlers,
		fields,
		hasVideoTrackHandlers,
	});

	return {
		riff: riffSpecificState(),
		sample: sampleCallback(canSkipTracksState, signal),
		getInternalStats: (): InternalStats => ({
			skippedBytes,
			finalCursorOffset: getIterator()?.counter.getOffset() ?? 0,
		}),
		getSkipBytes: () => skippedBytes,
		increaseSkippedBytes,
		canSkipTracksState,
		keyframes: keyframesState(),
		structure: structureState(),
		nullifySamples,
		onAudioTrack,
		onVideoTrack,
		supportsContentRange,
		webm: webmState(),
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
