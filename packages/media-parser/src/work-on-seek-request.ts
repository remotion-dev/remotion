import type {MediaParserController} from './controller/media-parser-controller';
import type {PrefetchCache} from './fetch';
import type {AllOptions, ParseMediaFields} from './fields';
import {getSeekingByte} from './get-seeking-byte';
import {getSeekingHints} from './get-seeking-hints';
import type {BufferIterator} from './iterator/buffer-iterator';
import type {MediaParserLogLevel} from './log';
import {Log} from './log';
import type {
	M3uPlaylistContext,
	ParseMediaMode,
	ParseMediaSrc,
} from './options';
import {performSeek} from './perform-seek';
import type {MediaParserReaderInterface} from './readers/reader';
import type {AacState} from './state/aac-state';
import type {AvcState} from './state/avc/avc-state';
import type {CurrentReader} from './state/current-reader';
import type {FlacState} from './state/flac-state';
import type {TracksState} from './state/has-tracks-section';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {KeyframesState} from './state/keyframes';
import type {M3uState} from './state/m3u-state';
import type {WebmState} from './state/matroska/webm';
import type {Mp3State} from './state/mp3';
import type {ParserState} from './state/parser-state';
import type {RiffState} from './state/riff';
import type {SamplesObservedState} from './state/samples-observed/slow-duration-fps';
import type {SeekInfiniteLoop} from './state/seek-infinite-loop';
import type {StructureState} from './state/structure';
import type {TransportStreamState} from './state/transport-stream/transport-stream';
import {type MediaSectionState} from './state/video-section';

export const turnSeekIntoByte = async ({
	seek,
	mediaSectionState,
	logLevel,
	iterator,
	structureState,
	m3uPlaylistContext,
	isoState,
	transportStream,
	tracksState,
	webmState,
	keyframes,
	flacState,
	samplesObserved,
	riffState,
	mp3State,
	contentLength,
	aacState,
	m3uState,
	avcState,
}: {
	seek: number;
	mediaSectionState: MediaSectionState;
	logLevel: MediaParserLogLevel;
	iterator: BufferIterator;
	structureState: StructureState;
	m3uPlaylistContext: M3uPlaylistContext | null;
	isoState: IsoBaseMediaState;
	transportStream: TransportStreamState;
	tracksState: TracksState;
	webmState: WebmState;
	keyframes: KeyframesState;
	flacState: FlacState;
	samplesObserved: SamplesObservedState;
	riffState: RiffState;
	mp3State: Mp3State;
	aacState: AacState;
	contentLength: number;
	m3uState: M3uState;
	avcState: AvcState;
}): Promise<SeekResolution> => {
	const mediaSections = mediaSectionState.getMediaSections();

	if (mediaSections.length === 0) {
		Log.trace(logLevel, 'No media sections defined, cannot seek yet');
		return {
			type: 'valid-but-must-wait',
		};
	}

	if (seek < 0) {
		throw new Error(`Cannot seek to a negative time: ${JSON.stringify(seek)}`);
	}

	const seekingHints = getSeekingHints({
		riffState,
		samplesObserved,
		structureState,
		mediaSectionState,
		isoState,
		transportStream,
		tracksState,
		keyframesState: keyframes,
		webmState,
		flacState,
		mp3State,
		contentLength,
		aacState,
		m3uPlaylistContext,
	});

	if (!seekingHints) {
		Log.trace(logLevel, 'No seeking info, cannot seek yet');
		return {
			type: 'valid-but-must-wait',
		};
	}

	const seekingByte = await getSeekingByte({
		info: seekingHints,
		time: seek,
		logLevel,
		currentPosition: iterator.counter.getOffset(),
		isoState,
		transportStream,
		webmState,
		mediaSection: mediaSectionState,
		m3uPlaylistContext,
		structure: structureState,
		riffState,
		m3uState,
		avcState,
	});

	return seekingByte;
};

export type WorkOnSeekRequestOptions = {
	logLevel: MediaParserLogLevel;
	controller: MediaParserController;
	isoState: IsoBaseMediaState;
	iterator: BufferIterator;
	structureState: StructureState;
	src: ParseMediaSrc;
	contentLength: number;
	readerInterface: MediaParserReaderInterface;
	mediaSection: MediaSectionState;
	m3uPlaylistContext: M3uPlaylistContext | null;
	transportStream: TransportStreamState;
	mode: ParseMediaMode;
	seekInfiniteLoop: SeekInfiniteLoop;
	currentReader: CurrentReader;
	discardReadBytes: (force: boolean) => Promise<void>;
	fields: Partial<AllOptions<ParseMediaFields>>;
	tracksState: TracksState;
	webmState: WebmState;
	keyframes: KeyframesState;
	flacState: FlacState;
	samplesObserved: SamplesObservedState;
	riffState: RiffState;
	mp3State: Mp3State;
	aacState: AacState;
	m3uState: M3uState;
	prefetchCache: PrefetchCache;
	avcState: AvcState;
};

export const getWorkOnSeekRequestOptions = (
	state: ParserState,
): WorkOnSeekRequestOptions => {
	return {
		logLevel: state.logLevel,
		controller: state.controller,
		isoState: state.iso,
		iterator: state.iterator,
		structureState: state.structure,
		src: state.src,
		contentLength: state.contentLength,
		readerInterface: state.readerInterface,
		mediaSection: state.mediaSection,
		m3uPlaylistContext: state.m3uPlaylistContext,
		mode: state.mode,
		seekInfiniteLoop: state.seekInfiniteLoop,
		currentReader: state.currentReader,
		discardReadBytes: state.discardReadBytes,
		fields: state.fields,
		transportStream: state.transportStream,
		tracksState: state.callbacks.tracks,
		webmState: state.webm,
		keyframes: state.keyframes,
		flacState: state.flac,
		samplesObserved: state.samplesObserved,
		riffState: state.riff,
		mp3State: state.mp3,
		aacState: state.aac,
		m3uState: state.m3u,
		prefetchCache: state.prefetchCache,
		avcState: state.avc,
	};
};

export const workOnSeekRequest = async (options: WorkOnSeekRequestOptions) => {
	const {
		logLevel,
		controller,
		mediaSection,
		m3uPlaylistContext,
		isoState,
		iterator,
		structureState,
		src,
		contentLength,
		readerInterface,
		mode,
		seekInfiniteLoop,
		currentReader,
		discardReadBytes,
		fields,
		transportStream,
		tracksState,
		webmState,
		keyframes,
		flacState,
		samplesObserved,
		riffState,
		mp3State,
		aacState,
		prefetchCache,
		m3uState,
		avcState,
	} = options;
	const seek = controller._internals.seekSignal.getSeek();
	if (seek === null) {
		return;
	}

	Log.trace(logLevel, `Has seek request for ${src}: ${JSON.stringify(seek)}`);
	const resolution = await turnSeekIntoByte({
		seek,
		mediaSectionState: mediaSection,
		logLevel,
		iterator,
		structureState,
		m3uPlaylistContext,
		isoState,
		transportStream,
		tracksState,
		webmState,
		keyframes,
		flacState,
		samplesObserved,
		riffState,
		mp3State,
		contentLength,
		aacState,
		m3uState,
		avcState,
	});
	Log.trace(logLevel, `Seek action: ${JSON.stringify(resolution)}`);

	if (resolution.type === 'intermediary-seek') {
		await performSeek({
			seekTo: resolution.byte,
			userInitiated: false,
			controller,
			mediaSection,
			iterator,
			logLevel,
			mode,
			contentLength,
			seekInfiniteLoop,
			currentReader,
			readerInterface,
			src,
			discardReadBytes,
			fields,
			prefetchCache,
			isoState,
		});
		return;
	}

	if (resolution.type === 'do-seek') {
		await performSeek({
			seekTo: resolution.byte,
			userInitiated: true,
			controller,
			mediaSection,
			iterator,
			logLevel,
			mode,
			contentLength,
			seekInfiniteLoop,
			currentReader,
			readerInterface,
			src,
			discardReadBytes,
			fields,
			prefetchCache,
			isoState,
		});
		const {hasChanged} =
			controller._internals.seekSignal.clearSeekIfStillSame(seek);
		if (hasChanged) {
			Log.trace(
				logLevel,
				`Seek request has changed while seeking, seeking again`,
			);
			await workOnSeekRequest(options);
		}

		return;
	}

	if (resolution.type === 'invalid') {
		throw new Error(
			`The seek request ${JSON.stringify(seek)} cannot be processed`,
		);
	}

	if (resolution.type === 'valid-but-must-wait') {
		Log.trace(logLevel, 'Seek request is valid but cannot be processed yet');
	}
};

export type SeekResolution =
	| {
			type: 'valid-but-must-wait';
	  }
	| {
			type: 'invalid';
	  }
	| {
			type: 'intermediary-seek';
			byte: number;
	  }
	| {
			type: 'do-seek';
			byte: number;
			timeInSeconds: number;
	  };
