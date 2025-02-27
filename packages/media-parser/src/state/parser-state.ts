import {getArrayBufferIterator, type BufferIterator} from '../buffer-iterator';
import type {AvcPPs, AvcProfileInfo} from '../containers/avc/parse-avc';
import type {
	SelectM3uAssociatedPlaylistsFn,
	SelectM3uStreamFn,
} from '../containers/m3u/select-stream';
import {Log, type LogLevel} from '../log';
import type {MediaParserController} from '../media-parser-controller';
import type {
	OnDiscardedData,
	Options,
	ParseMediaFields,
	ParseMediaMode,
	ParseMediaSrc,
} from '../options';
import type {ReaderInterface} from '../readers/reader';
import type {OnAudioTrack, OnVideoTrack} from '../webcodec-sample-types';
import {aacState} from './aac-state';
import {emittedState} from './emitted-fields';
import {flacState} from './flac-state';
import {imagesState} from './images';
import {isoBaseMediaState} from './iso-base-media/iso-state';
import {keyframesState} from './keyframes';
import {eventLoopState} from './last-eventloop-break';
import {m3uState} from './m3u-state';
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
	controller,
	fields,
	onAudioTrack,
	onVideoTrack,
	contentLength,
	logLevel,
	mode,
	src,
	readerInterface,
	onDiscardedData,
	selectM3uStreamFn,
	selectM3uAssociatedPlaylistsFn,
}: {
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	controller: MediaParserController;
	fields: Options<ParseMediaFields>;
	onAudioTrack: OnAudioTrack | null;
	onVideoTrack: OnVideoTrack | null;
	contentLength: number;
	logLevel: LogLevel;
	mode: ParseMediaMode;
	src: ParseMediaSrc;
	readerInterface: ReaderInterface;
	onDiscardedData: OnDiscardedData | null;
	selectM3uStreamFn: SelectM3uStreamFn;
	selectM3uAssociatedPlaylistsFn: SelectM3uAssociatedPlaylistsFn;
}) => {
	let skippedBytes: number = 0;

	const iterator: BufferIterator = getArrayBufferIterator(
		new Uint8Array([]),
		contentLength,
	);

	const increaseSkippedBytes = (bytes: number) => {
		skippedBytes += bytes;
	};

	const structure = structureState();
	const keyframes = keyframesState();
	const emittedFields = emittedState();
	const slowDurationAndFps = slowDurationAndFpsState();
	const mp3Info = makeMp3State();
	const images = imagesState();

	const discardReadBytes = async (force: boolean) => {
		const {bytesRemoved, removedData} = iterator.removeBytesRead(force, mode);
		if (bytesRemoved) {
			Log.verbose(logLevel, `Freed ${bytesRemoved} bytes`);
		}

		if (removedData && onDiscardedData) {
			await onDiscardedData(removedData);
		}
	};

	return {
		riff: riffSpecificState(),
		transportStream: transportStreamState(),
		webm: webmState(),
		iso: isoBaseMediaState(),
		mp3Info,
		aac: aacState(),
		flac: flacState(),
		m3u: m3uState(logLevel),
		callbacks: sampleCallback({
			controller,
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
		...structure,
		onAudioTrack,
		onVideoTrack,
		emittedFields,
		fields,
		slowDurationAndFps,
		contentLength,
		images,
		videoSection: videoSectionState(),
		logLevel,
		iterator,
		controller,
		mode,
		eventLoop: eventLoopState(logLevel),
		src,
		readerInterface,
		discardReadBytes,
		selectM3uStreamFn,
		selectM3uAssociatedPlaylistsFn,
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
