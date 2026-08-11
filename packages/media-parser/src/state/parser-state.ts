import type {AvcPPs, AvcProfileInfo} from '../containers/avc/parse-avc';
import type {
	SelectM3uAssociatedPlaylistsFn,
	SelectM3uStreamFn,
} from '../containers/m3u/select-stream';
import type {MediaParserController} from '../controller/media-parser-controller';
import type {PrefetchCache} from '../fetch';
import type {Options, ParseMediaFields} from '../fields';
import {getFieldsFromCallback} from '../get-fields-from-callbacks';
import {
	getArrayBufferIterator,
	type BufferIterator,
} from '../iterator/buffer-iterator';
import {Log, type MediaParserLogLevel} from '../log';
import type {
	AllParseMediaFields,
	M3uPlaylistContext,
	OnDiscardedData,
	ParseMediaCallbacks,
	ParseMediaMode,
	ParseMediaResult,
	ParseMediaSrc,
} from '../options';
import type {MediaParserReaderInterface, Reader} from '../readers/reader';
import type {
	MediaParserOnAudioTrack,
	MediaParserOnVideoTrack,
} from '../webcodec-sample-types';
import {aacState} from './aac-state';
import {avcState} from './avc/avc-state';
import {currentReader} from './current-reader';
import {emittedState} from './emitted-fields';
import {flacState} from './flac-state';
import {imagesState} from './images';
import {isoBaseMediaState} from './iso-base-media/iso-state';
import {keyframesState} from './keyframes';
import {m3uState} from './m3u-state';
import {webmState} from './matroska/webm';
import {makeMp3State} from './mp3';
import {riffSpecificState} from './riff';
import {callbacksState} from './sample-callbacks';
import {samplesObservedState} from './samples-observed/slow-duration-fps';
import {seekInfiniteLoopDetectionState} from './seek-infinite-loop';
import {structureState} from './structure';
import {timingsState} from './timings';
import {transportStreamState} from './transport-stream/transport-stream';
import {mediaSectionState} from './video-section';
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
	m3uPlaylistContext,
	contentType,
	name,
	callbacks,
	fieldsInReturnValue,
	mimeType,
	initialReaderInstance,
	makeSamplesStartAtZero,
	prefetchCache,
}: {
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	controller: MediaParserController;
	onAudioTrack: MediaParserOnAudioTrack | null;
	onVideoTrack: MediaParserOnVideoTrack | null;
	contentLength: number;
	logLevel: MediaParserLogLevel;
	mode: ParseMediaMode;
	src: ParseMediaSrc;
	readerInterface: MediaParserReaderInterface;
	onDiscardedData: OnDiscardedData | null;
	selectM3uStreamFn: SelectM3uStreamFn;
	selectM3uAssociatedPlaylistsFn: SelectM3uAssociatedPlaylistsFn;
	m3uPlaylistContext: M3uPlaylistContext | null;
	contentType: string | null;
	name: string;
	callbacks: ParseMediaCallbacks;
	fieldsInReturnValue: Options<ParseMediaFields>;
	mimeType: string | null;
	initialReaderInstance: Reader;
	makeSamplesStartAtZero: boolean;
	prefetchCache: PrefetchCache;
}) => {
	let skippedBytes: number = 0;
	const returnValue = {} as ParseMediaResult<AllParseMediaFields>;

	const iterator: BufferIterator = getArrayBufferIterator({
		initialData: new Uint8Array([]),
		maxBytes: contentLength,
		logLevel,
	});

	const increaseSkippedBytes = (bytes: number) => {
		skippedBytes += bytes;
	};

	const structure = structureState();
	const keyframes = keyframesState();
	const emittedFields = emittedState();
	const samplesObserved = samplesObservedState();
	const mp3 = makeMp3State();
	const images = imagesState();
	const timings = timingsState();
	const seekInfiniteLoop = seekInfiniteLoopDetectionState();
	const currentReaderState = currentReader(initialReaderInstance);
	const avc = avcState();
	const errored: Error | null = null;

	const discardReadBytes = async (force: boolean) => {
		const {bytesRemoved, removedData} = iterator.removeBytesRead(force, mode);
		if (bytesRemoved) {
			Log.verbose(logLevel, `Freed ${bytesRemoved} bytes`);
		}

		if (removedData && onDiscardedData) {
			await onDiscardedData(removedData);
		}
	};

	const fields = getFieldsFromCallback({
		fields: fieldsInReturnValue,
		callbacks,
	});

	const mediaSection = mediaSectionState();

	return {
		riff: riffSpecificState({
			controller,
			logLevel,
			readerInterface,
			src,
			prefetchCache,
			contentLength,
		}),
		transportStream: transportStreamState(),
		webm: webmState({
			controller,
			logLevel,
			readerInterface,
			src,
			prefetchCache,
		}),
		iso: isoBaseMediaState({
			contentLength,
			controller,
			readerInterface,
			src,
			logLevel,
			prefetchCache,
		}),
		mp3,
		aac: aacState(),
		flac: flacState(),
		m3u: m3uState(logLevel),
		timings,
		callbacks: callbacksState({
			controller,
			hasAudioTrackHandlers,
			hasVideoTrackHandlers,
			fields,
			keyframes,
			emittedFields,
			samplesObserved,
			structure,
			src,
			seekSignal: controller._internals.seekSignal,
			logLevel,
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
		emittedFields,
		fields,
		samplesObserved,
		contentLength,
		images,
		mediaSection,
		logLevel,
		iterator,
		controller,
		mode,
		src,
		readerInterface,
		discardReadBytes,
		selectM3uStreamFn,
		selectM3uAssociatedPlaylistsFn,
		m3uPlaylistContext,
		contentType,
		name,
		returnValue,
		callbackFunctions: callbacks,
		fieldsInReturnValue,
		mimeType,
		errored: errored as Error | null,
		currentReader: currentReaderState,
		seekInfiniteLoop,
		makeSamplesStartAtZero,
		prefetchCache,
		avc,
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
