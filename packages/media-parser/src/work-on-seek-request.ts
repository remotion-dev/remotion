import type {MediaParserController} from './controller/media-parser-controller';
import type {Seek} from './controller/seek-signal';
import type {AllOptions, ParseMediaFields} from './fields';
import {getSeekingByte} from './get-seeking-byte';
import {getSeekingInfo} from './get-seeking-info';
import type {BufferIterator} from './iterator/buffer-iterator';
import type {LogLevel} from './log';
import {Log} from './log';
import type {ParseMediaMode, ParseMediaSrc} from './options';
import type {IsoBaseMediaStructure} from './parse-result';
import {performSeek} from './perform-seek';
import type {ReaderInterface} from './readers/reader';
import type {CurrentReader} from './state/current-reader';
import type {TracksState} from './state/has-tracks-section';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {KeyframesState} from './state/keyframes';
import type {WebmState} from './state/matroska/webm';
import type {ParserState} from './state/parser-state';
import type {SeekInfiniteLoop} from './state/seek-infinite-loop';
import type {StructureState} from './state/structure';
import type {TransportStreamState} from './state/transport-stream/transport-stream';
import {type MediaSectionState} from './state/video-section';

const turnSeekIntoByte = async ({
	seek,
	mediaSectionState,
	logLevel,
	iterator,
	structureState,
	mp4HeaderSegment,
	isoState,
	transportStream,
	tracksState,
	webmState,
	keyframes,
}: {
	seek: Seek;
	mediaSectionState: MediaSectionState;
	logLevel: LogLevel;
	iterator: BufferIterator;
	structureState: StructureState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	isoState: IsoBaseMediaState;
	transportStream: TransportStreamState;
	tracksState: TracksState;
	webmState: WebmState;
	keyframes: KeyframesState;
}): Promise<SeekResolution> => {
	const mediaSections = mediaSectionState.getMediaSections();
	if (mediaSections.length === 0) {
		Log.trace(logLevel, 'No media sections defined, cannot seek yet');
		return {
			type: 'valid-but-must-wait',
		};
	}

	if (seek.type === 'keyframe-before-time') {
		if (seek.timeInSeconds < 0) {
			throw new Error(
				`Cannot seek to a negative time: ${JSON.stringify(seek)}`,
			);
		}

		const seekingInfo = getSeekingInfo({
			structureState,
			mp4HeaderSegment,
			mediaSectionState,
			isoState,
			transportStream,
			tracksState,
			keyframesState: keyframes,
			webmState,
		});

		if (!seekingInfo) {
			Log.trace(logLevel, 'No seeking info, cannot seek yet');
			return {
				type: 'valid-but-must-wait',
			};
		}

		const seekingByte = await getSeekingByte({
			info: seekingInfo,
			time: seek.timeInSeconds,
			logLevel,
			currentPosition: iterator.counter.getOffset(),
			isoState,
			transportStream,
			webmState,
			mediaSection: mediaSectionState,
		});

		return seekingByte;
	}

	if (seek.type === 'byte') {
		return {
			type: 'do-seek',
			byte: seek.byte,
		};
	}

	throw new Error(
		`Cannot process seek request for ${seek}: ${JSON.stringify(seek)}`,
	);
};

export type WorkOnSeekRequestOptions = {
	logLevel: LogLevel;
	controller: MediaParserController;
	isoState: IsoBaseMediaState;
	iterator: BufferIterator;
	structureState: StructureState;
	src: ParseMediaSrc;
	contentLength: number;
	readerInterface: ReaderInterface;
	mediaSection: MediaSectionState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	transportStream: TransportStreamState;
	mode: ParseMediaMode;
	seekInfiniteLoop: SeekInfiniteLoop;
	currentReader: CurrentReader;
	discardReadBytes: (force: boolean) => Promise<void>;
	fields: Partial<AllOptions<ParseMediaFields>>;
	tracksState: TracksState;
	webmState: WebmState;
	keyframes: KeyframesState;
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
		mp4HeaderSegment: state.mp4HeaderSegment,
		mode: state.mode,
		seekInfiniteLoop: state.seekInfiniteLoop,
		currentReader: state.currentReader,
		discardReadBytes: state.discardReadBytes,
		fields: state.fields,
		transportStream: state.transportStream,
		tracksState: state.callbacks.tracks,
		webmState: state.webm,
		keyframes: state.keyframes,
	};
};

export const workOnSeekRequest = async (options: WorkOnSeekRequestOptions) => {
	const {
		logLevel,
		controller,
		mediaSection,
		mp4HeaderSegment,
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
	} = options;
	const seek = controller._internals.seekSignal.getSeek();
	if (!seek) {
		return;
	}

	Log.trace(logLevel, `Has seek request: ${JSON.stringify(seek)}`);
	const resolution = await turnSeekIntoByte({
		seek,
		mediaSectionState: mediaSection,
		logLevel,
		iterator,
		structureState,
		mp4HeaderSegment,
		isoState,
		transportStream,
		tracksState,
		webmState,
		keyframes,
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
	  };
