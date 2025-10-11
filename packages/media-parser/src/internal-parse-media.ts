import {mediaParserController} from './controller/media-parser-controller';
import {emitAllInfo, triggerInfoEmit} from './emit-all-info';
import type {makeFetchRequest} from './fetch';
import type {Options, ParseMediaFields} from './fields';
import {getSeekingHints} from './get-seeking-hints';
import {Log} from './log';
import type {
	InternalParseMedia,
	InternalParseMediaOptions,
	ParseMediaResult,
} from './options';
import {parseLoop} from './parse-loop';
import {printTimings} from './print-timings';
import {warnIfRemotionLicenseNotAcknowledged} from './remotion-license-acknowledge';
import {setSeekingHints} from './set-seeking-hints';
import {makeParserState} from './state/parser-state';
import {throttledStateUpdate} from './throttled-progress';
import {
	getWorkOnSeekRequestOptions,
	turnSeekIntoByte,
} from './work-on-seek-request';

export const internalParseMedia: InternalParseMedia = async function <
	F extends Options<ParseMediaFields>,
>({
	src,
	fields: _fieldsInReturnValue,
	reader: readerInterface,
	onAudioTrack,
	onVideoTrack,
	controller = mediaParserController(),
	logLevel,
	onParseProgress: onParseProgressDoNotCallDirectly,
	progressIntervalInMs,
	mode,
	onDiscardedData,
	onError,
	acknowledgeRemotionLicense,
	apiName,
	selectM3uStream: selectM3uStreamFn,
	selectM3uAssociatedPlaylists: selectM3uAssociatedPlaylistsFn,
	m3uPlaylistContext,
	makeSamplesStartAtZero,
	seekingHints,
	...more
}: InternalParseMediaOptions<F>) {
	if (!src) {
		throw new Error('No "src" provided');
	}

	controller._internals.markAsReadyToEmitEvents();
	warnIfRemotionLicenseNotAcknowledged({
		acknowledgeRemotionLicense,
		logLevel,
		apiName,
	});

	Log.verbose(
		logLevel,
		`Reading ${typeof src === 'string' ? src : src instanceof URL ? src.toString() : src instanceof File ? src.name : src.toString()}`,
	);

	const prefetchCache = new Map<string, ReturnType<typeof makeFetchRequest>>();

	const {
		reader: readerInstance,
		contentLength,
		name,
		contentType,
		supportsContentRange,
		needsContentRange,
	} = await readerInterface.read({
		src,
		range: null,
		controller,
		logLevel,
		prefetchCache,
	});

	if (contentLength === null) {
		throw new Error(
			`Cannot read media ${src} without a content length. This is currently not supported. Ensure the media has a "Content-Length" HTTP header.`,
		);
	}

	if (!supportsContentRange && needsContentRange) {
		throw new Error(
			'Cannot read media without it supporting the "Content-Range" header. This is currently not supported. Ensure the media supports the "Content-Range" HTTP header.',
		);
	}

	const hasAudioTrackHandlers = Boolean(onAudioTrack);
	const hasVideoTrackHandlers = Boolean(onVideoTrack);

	const state = makeParserState({
		hasAudioTrackHandlers,
		hasVideoTrackHandlers,
		controller,
		onAudioTrack: onAudioTrack ?? null,
		onVideoTrack: onVideoTrack ?? null,
		contentLength,
		logLevel,
		mode,
		readerInterface,
		src,
		onDiscardedData,
		selectM3uStreamFn,
		selectM3uAssociatedPlaylistsFn,
		m3uPlaylistContext,
		contentType,
		name,
		callbacks: more,
		fieldsInReturnValue: _fieldsInReturnValue ?? {},
		mimeType: contentType,
		initialReaderInstance: readerInstance,
		makeSamplesStartAtZero,
		prefetchCache,
	});

	if (seekingHints) {
		setSeekingHints({hints: seekingHints, state});
	}

	controller._internals.attachSeekingHintResolution(() =>
		Promise.resolve(
			getSeekingHints({
				tracksState: state.callbacks.tracks,
				keyframesState: state.keyframes,
				webmState: state.webm,
				structureState: state.structure,
				m3uPlaylistContext: state.m3uPlaylistContext,
				mediaSectionState: state.mediaSection,
				isoState: state.iso,
				transportStream: state.transportStream,
				flacState: state.flac,
				samplesObserved: state.samplesObserved,
				riffState: state.riff,
				mp3State: state.mp3,
				contentLength: state.contentLength,
				aacState: state.aac,
			}),
		),
	);

	controller._internals.attachSimulateSeekResolution((seek: number) => {
		const {
			aacState,
			avcState,
			flacState,
			isoState,
			iterator,
			keyframes,
			m3uState,
			mediaSection,
			mp3State,
			riffState,
			samplesObserved,
			structureState,
			tracksState,
			transportStream,
			webmState,
		} = getWorkOnSeekRequestOptions(state);
		return turnSeekIntoByte({
			aacState,
			seek,
			avcState,
			contentLength,
			flacState,
			isoState,
			iterator,
			keyframes,
			logLevel,
			m3uPlaylistContext,
			m3uState,
			mediaSectionState: mediaSection,
			mp3State,
			riffState,
			samplesObserved,
			structureState,
			tracksState,
			transportStream,
			webmState,
		});
	});

	if (
		!hasAudioTrackHandlers &&
		!hasVideoTrackHandlers &&
		Object.values(state.fields).every((v) => !v) &&
		mode === 'query'
	) {
		Log.warn(
			logLevel,
			new Error(
				'Warning - No `fields` and no `on*` callbacks were passed to `parseMedia()`. Specify the data you would like to retrieve.',
			),
		);
	}

	const throttledState = throttledStateUpdate({
		updateFn: onParseProgressDoNotCallDirectly ?? null,
		everyMilliseconds: progressIntervalInMs ?? 100,
		controller,
		totalBytes: contentLength,
	});

	await triggerInfoEmit(state);

	await parseLoop({state, throttledState, onError});

	Log.verbose(logLevel, 'Finished parsing file');
	await emitAllInfo(state);
	printTimings(state);

	state.currentReader.getCurrent().abort();
	state.iterator?.destroy();
	state.callbacks.tracks.ensureHasTracksAtEnd(state.fields);
	state.m3u.abortM3UStreamRuns();
	prefetchCache.clear();

	if (state.errored) {
		throw state.errored;
	}

	if (state.controller._internals.seekSignal.getSeek() !== null) {
		throw new Error('Should not finish while a seek is pending');
	}

	return state.returnValue as ParseMediaResult<F>;
};
