import type {AvcPPs, AvcProfileInfo} from '../boxes/avc/parse-avc';
import type {BufferIterator} from '../buffer-iterator';
import type {Options, ParseMediaFields} from '../options';
import type {OnAudioTrack, OnVideoTrack} from '../webcodec-sample-types';
import {emittedState} from './emitted-fields';
import {keyframesState} from './keyframes';
import {riffSpecificState} from './riff';
import {sampleCallback} from './sample-callbacks';
import {slowDurationAndFpsState} from './slow-duration-fps';
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
	onAudioTrack,
	onVideoTrack,
	supportsContentRange,
}: {
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	signal: AbortSignal | undefined;
	getIterator: () => BufferIterator | null;
	fields: Options<ParseMediaFields>;
	supportsContentRange: boolean;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
}) => {
	let skippedBytes: number = 0;

	const increaseSkippedBytes = (bytes: number) => {
		skippedBytes += bytes;
	};

	const structure = structureState();
	const keyframes = keyframesState();
	const emittedFields = emittedState();
	const slowDurationAndFps = slowDurationAndFpsState();

	return {
		riff: riffSpecificState(),
		callbacks: sampleCallback({
			signal,
			hasAudioTrackHandlers,
			hasVideoTrackHandlers,
			fields,
			keyframes,
			emittedFields,
			slowDurationAndFpsState: slowDurationAndFps,
		}),
		getInternalStats: (): InternalStats => ({
			skippedBytes,
			finalCursorOffset: getIterator()?.counter.getOffset() ?? 0,
		}),
		getSkipBytes: () => skippedBytes,
		increaseSkippedBytes,
		keyframes,
		structure,
		onAudioTrack,
		onVideoTrack,
		supportsContentRange,
		webm: webmState(),
		emittedFields,
		fields,
		slowDurationAndFps,
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
