import type {AvcPPs, AvcProfileInfo} from '../containers/avc/parse-avc';
import type {
	SelectM3uAssociatedPlaylistsFn,
	SelectM3uStreamFn,
} from '../containers/m3u/select-stream';
import type {MediaParserController} from '../controller/media-parser-controller';
import type {Options, ParseMediaFields} from '../fields';
import {getFieldsFromCallback} from '../get-fields-from-callbacks';
import {
	getArrayBufferIterator,
	type BufferIterator,
} from '../iterator/buffer-iterator';
import {Log, type LogLevel} from '../log';
import type {
	AllParseMediaFields,
	OnDiscardedData,
	ParseMediaCallbacks,
	ParseMediaMode,
	ParseMediaResult,
	ParseMediaSrc,
} from '../options';
import type {IsoBaseMediaStructure} from '../parse-result';
import type {Reader, ReaderInterface} from '../readers/reader';
import type {OnAudioTrack, OnVideoTrack} from '../webcodec-sample-types';
import {aacState} from './aac-state';
import {currentReader} from './current-reader';
import {emittedState} from './emitted-fields';
import {flacState} from './flac-state';
import {imagesState} from './images';
import {isoBaseMediaState} from './iso-base-media/iso-state';
import {keyframesState} from './keyframes';
import {m3uState} from './m3u-state';
import {makeMp3State} from './mp3';
import {riffSpecificState} from './riff';
import {sampleCallback} from './sample-callbacks';
import {samplesObservedState} from './samples-observed/slow-duration-fps';
import {seekInfiniteLoopDetectionState} from './seek-infinite-loop';
import {structureState} from './structure';
import {timingsState} from './timings';
import {transportStreamState} from './transport-stream/transport-stream';
import {mediaSectionState} from './video-section';
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
	mp4HeaderSegment,
	contentType,
	name,
	callbacks,
	fieldsInReturnValue,
	mimeType,
	initialReaderInstance,
	makeSamplesStartAtZero,
}: {
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	controller: MediaParserController;
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
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	contentType: string | null;
	name: string;
	callbacks: ParseMediaCallbacks;
	fieldsInReturnValue: Options<ParseMediaFields>;
	mimeType: string | null;
	initialReaderInstance: Reader;
	makeSamplesStartAtZero: boolean;
}) => {
	let skippedBytes: number = 0;
	const returnValue = {} as ParseMediaResult<AllParseMediaFields>;

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
	const slowDurationAndFps = samplesObservedState();
	const mp3Info = makeMp3State();
	const images = imagesState();
	const timings = timingsState();
	const seekInfiniteLoop = seekInfiniteLoopDetectionState();
	const currentReaderState = currentReader(initialReaderInstance);

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

	return {
		riff: riffSpecificState(),
		transportStream: transportStreamState(),
		webm: webmState(),
		iso: isoBaseMediaState({
			contentLength,
			controller,
			readerInterface,
			src,
			logLevel,
		}),
		mp3Info,
		aac: aacState(),
		flac: flacState(),
		m3u: m3uState(logLevel),
		timings,
		callbacks: sampleCallback({
			controller,
			hasAudioTrackHandlers,
			hasVideoTrackHandlers,
			fields,
			keyframes,
			emittedFields,
			slowDurationAndFpsState: slowDurationAndFps,
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
		slowDurationAndFps,
		contentLength,
		images,
		mediaSection: mediaSectionState(),
		logLevel,
		iterator,
		controller,
		mode,
		src,
		readerInterface,
		discardReadBytes,
		selectM3uStreamFn,
		selectM3uAssociatedPlaylistsFn,
		mp4HeaderSegment,
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
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
