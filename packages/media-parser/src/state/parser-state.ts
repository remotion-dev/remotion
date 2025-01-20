import type {BufferIterator} from '../buffer-iterator';
import type {AvcPPs, AvcProfileInfo} from '../containers/avc/parse-avc';
import type {LogLevel} from '../log';
import type {Options, ParseMediaFields} from '../options';
import type {OnAudioTrack, OnVideoTrack} from '../webcodec-sample-types';
import {aacState} from './aac-state';
import {emittedState} from './emitted-fields';
import {flacState} from './flac-state';
import {imagesState} from './images';
import {isoBaseMediaState} from './iso-base-media/iso-state';
import {keyframesState} from './keyframes';
import {makeMp3State} from './mp3';
import {riffSpecificState} from './riff';
import {sampleCallback} from './sample-callbacks';
import {slowDurationAndFpsState} from './slow-duration-fps';
import {structureState} from './structure';
import {transportStreamState} from './transport-stream';
import {videoSectionState} from './video-section';
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
	iterator,
	fields,
	onAudioTrack,
	onVideoTrack,
	supportsContentRange,
	contentLength,
	logLevel,
}: {
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	signal: AbortSignal | undefined;
	iterator: BufferIterator;
	fields: Options<ParseMediaFields>;
	supportsContentRange: boolean;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	contentLength: number | null;
	logLevel: LogLevel;
}) => {
	let skippedBytes: number = 0;

	const increaseSkippedBytes = (bytes: number) => {
		skippedBytes += bytes;
	};

	const structure = structureState();
	const keyframes = keyframesState();
	const emittedFields = emittedState();
	const slowDurationAndFps = slowDurationAndFpsState();
	const mp3Info = makeMp3State();
	const images = imagesState();

	return {
		riff: riffSpecificState(),
		transportStream: transportStreamState(),
		webm: webmState(),
		iso: isoBaseMediaState(),
		mp3Info,
		aac: aacState(),
		flac: flacState(),
		callbacks: sampleCallback({
			signal,
			hasAudioTrackHandlers,
			hasVideoTrackHandlers,
			fields,
			keyframes,
			emittedFields,
			slowDurationAndFpsState: slowDurationAndFps,
			structure,
		}),
		getInternalStats: (): InternalStats => ({
			skippedBytes,
			finalCursorOffset: iterator.counter.getOffset() ?? 0,
		}),
		getSkipBytes: () => skippedBytes,
		increaseSkippedBytes,
		keyframes,
		structure,
		onAudioTrack,
		onVideoTrack,
		supportsContentRange,
		emittedFields,
		fields,
		slowDurationAndFps,
		contentLength,
		images,
		videoSection: videoSectionState(),
		logLevel,
		iterator,
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
