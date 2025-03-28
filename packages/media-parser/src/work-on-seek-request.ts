import type {MediaParserController} from './controller/media-parser-controller';
import type {Seek} from './controller/seek-signal';
import {getSeekingByte, getSeekingInfo} from './get-seeking-info';
import type {BufferIterator} from './iterator/buffer-iterator';
import type {LogLevel} from './log';
import {Log} from './log';
import type {ParseMediaSrc} from './options';
import type {IsoBaseMediaStructure} from './parse-result';
import {performSeek} from './perform-seek';
import type {ReaderInterface} from './readers/reader';
import type {IsoBaseMediaState} from './state/iso-base-media/iso-state';
import type {ParserState} from './state/parser-state';
import type {SampleCallbacks} from './state/sample-callbacks';
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
			isoState,
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
	state,
	logLevel,
	controller,
}: {
	state: ParserState;
	logLevel: LogLevel;
	controller: MediaParserController;
}) => {
	const seek = controller._internals.seekSignal.getSeek();
	if (!seek) {
		return;
	}

	Log.trace(logLevel, `Has seek request: ${JSON.stringify(seek)}`);
	const resolution = await turnSeekIntoByte({
		seek,
		videoSectionState: state.videoSection,
		logLevel,
		contentLength: state.contentLength,
		src: state.src,
		readerInterface: state.readerInterface,
		controller,
		callbacks: state.callbacks,
		isoState: state.iso,
		iterator: state.iterator,
		structureState: state.structure,
		mp4HeaderSegment: state.mp4HeaderSegment,
	});
	Log.trace(logLevel, `Seek action: ${JSON.stringify(resolution)}`);

	if (resolution.type === 'intermediary-seek') {
		await performSeek({
			state,
			seekTo: resolution.byte,
			userInitiated: false,
		});
		return;
	}

	if (resolution.type === 'do-seek') {
		await performSeek({state, seekTo: resolution.byte, userInitiated: true});
		const {hasChanged} =
			controller._internals.seekSignal.clearSeekIfStillSame(seek);
		if (hasChanged) {
			Log.trace(
				logLevel,
				`Seek request has changed while seeking, seeking again`,
			);
			await workOnSeekRequest({state, logLevel, controller});
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
