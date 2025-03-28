import type {MediaParserController} from './controller/media-parser-controller';
import type {Seek} from './controller/seek-signal';
import type {AllOptions, ParseMediaFields} from './fields';
import {getSeekingByte, getSeekingInfo} from './get-seeking-info';
import type {BufferIterator} from './iterator/buffer-iterator';
import type {LogLevel} from './log';
import {Log} from './log';
import type {ParseMediaMode, ParseMediaSrc} from './options';
import type {IsoBaseMediaStructure} from './parse-result';
import {performSeek} from './perform-seek';
import type {ReaderInterface} from './readers/reader';
import type {CurrentReader} from './state/current-reader';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {SampleCallbacks} from './state/sample-callbacks';
import type {SeekInfiniteLoop} from './state/seek-infinite-loop';
import type {StructureState} from './state/structure';
import {type VideoSectionState} from './state/video-section';

const turnSeekIntoByte = async ({
	seek,
	videoSectionState,
	logLevel,
	contentLength,
	readerInterface,
	src,
	controller,
	callbacks,
	isoState,
	iterator,
	structureState,
	mp4HeaderSegment,
}: {
	seek: Seek;
	videoSectionState: VideoSectionState;
	logLevel: LogLevel;
	contentLength: number;
	src: ParseMediaSrc;
	readerInterface: ReaderInterface;
	controller: MediaParserController;
	callbacks: SampleCallbacks;
	isoState: IsoBaseMediaState;
	iterator: BufferIterator;
	structureState: StructureState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
}): Promise<SeekResolution> => {
	const videoSections = videoSectionState.getVideoSections();
	if (videoSections.length === 0) {
		Log.trace(logLevel, 'No video sections defined, cannot seek yet');
		return {
			type: 'valid-but-must-wait',
		};
	}

	if (seek.type === 'keyframe-before-time-in-seconds') {
		const seekingInfo = getSeekingInfo({
			structureState,
			isoState,
			mp4HeaderSegment,
			videoSectionState,
		});
		if (!seekingInfo) {
			Log.trace(logLevel, 'No seeking info, cannot seek yet');
			return {
				type: 'valid-but-must-wait',
			};
		}

		const seekingByte = await getSeekingByte({
			info: seekingInfo,
			time: seek.time,
			logLevel,
			currentPosition: iterator.counter.getOffset(),
			src,
			contentLength,
			controller,
			readerInterface,
			videoSectionState,
			callbacks,
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

export const workOnSeekRequest = async ({
	logLevel,
	controller,
	videoSection,
	mp4HeaderSegment,
	isoState,
	iterator,
	structureState,
	callbacks,
	src,
	contentLength,
	readerInterface,
	mode,
	seekInfiniteLoop,
	currentReader,
	discardReadBytes,
	fields,
}: {
	logLevel: LogLevel;
	controller: MediaParserController;
	isoState: IsoBaseMediaState;
	iterator: BufferIterator;
	structureState: StructureState;
	callbacks: SampleCallbacks;
	src: ParseMediaSrc;
	contentLength: number;
	readerInterface: ReaderInterface;
	videoSection: VideoSectionState;
	mp4HeaderSegment: IsoBaseMediaStructure | null;
	mode: ParseMediaMode;
	seekInfiniteLoop: SeekInfiniteLoop;
	currentReader: CurrentReader;
	discardReadBytes: (force: boolean) => Promise<void>;
	fields: Partial<AllOptions<ParseMediaFields>>;
}) => {
	const seek = controller._internals.seekSignal.getSeek();
	if (!seek) {
		return;
	}

	Log.trace(logLevel, `Has seek request: ${JSON.stringify(seek)}`);
	const resolution = await turnSeekIntoByte({
		seek,
		videoSectionState: videoSection,
		logLevel,
		contentLength,
		src,
		readerInterface,
		controller,
		callbacks,
		isoState,
		iterator,
		structureState,
		mp4HeaderSegment,
	});
	Log.trace(logLevel, `Seek action: ${JSON.stringify(resolution)}`);

	if (resolution.type === 'intermediary-seek') {
		await performSeek({
			seekTo: resolution.byte,
			userInitiated: false,
			controller,
			videoSection,
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
			videoSection,
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
			await workOnSeekRequest({
				logLevel,
				controller,
				videoSection,
				mp4HeaderSegment,
				isoState,
				iterator,
				structureState,
				callbacks,
				src,
				contentLength,
				readerInterface,
				mode,
				seekInfiniteLoop,
				currentReader,
				discardReadBytes,
				fields,
			});
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
