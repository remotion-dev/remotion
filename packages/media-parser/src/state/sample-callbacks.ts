import type {MediaParserController} from '../controller/media-parser-controller';
import type {SeekSignal} from '../controller/seek-signal';
import type {AllOptions, Options, ParseMediaFields} from '../fields';
import type {MediaParserLogLevel} from '../log';
import {Log} from '../log';
import type {ParseMediaSrc} from '../options';
import type {
	MediaParserAudioSample,
	MediaParserOnAudioSample,
	MediaParserOnVideoSample,
	MediaParserVideoSample,
	OnTrackDoneCallback,
} from '../webcodec-sample-types';
import {WEBCODECS_TIMESCALE} from '../webcodecs-timescale';
import {makeCanSkipTracksState} from './can-skip-tracks';
import {makeTracksSectionState} from './has-tracks-section';
import {type KeyframesState} from './keyframes';
import {needsToIterateOverSamples} from './need-samples-for-fields';
import type {SamplesObservedState} from './samples-observed/slow-duration-fps';
import type {StructureState} from './structure';

export const callbacksState = ({
	controller,
	hasAudioTrackHandlers,
	hasVideoTrackHandlers,
	fields,
	keyframes,
	emittedFields,
	samplesObserved,
	structure,
	src,
	seekSignal,
	logLevel,
}: {
	controller: MediaParserController;
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	fields: Options<ParseMediaFields>;
	keyframes: KeyframesState;
	emittedFields: AllOptions<ParseMediaFields>;
	samplesObserved: SamplesObservedState;
	structure: StructureState;
	src: ParseMediaSrc;
	seekSignal: SeekSignal;
	logLevel: MediaParserLogLevel;
}) => {
	const videoSampleCallbacks: Record<number, MediaParserOnVideoSample> = {};
	const audioSampleCallbacks: Record<number, MediaParserOnAudioSample> = {};

	const onTrackDoneCallback: Record<number, OnTrackDoneCallback | null> = {};

	const queuedAudioSamples: Record<number, MediaParserAudioSample[]> = {};
	const queuedVideoSamples: Record<number, MediaParserVideoSample[]> = {};

	const canSkipTracksState = makeCanSkipTracksState({
		hasAudioTrackHandlers,
		fields,
		hasVideoTrackHandlers,
		structure,
	});

	const tracksState = makeTracksSectionState(canSkipTracksState, src);

	return {
		registerVideoSampleCallback: async (
			id: number,
			callback: MediaParserOnVideoSample | null,
		) => {
			if (callback === null) {
				delete videoSampleCallbacks[id];
				return;
			}

			videoSampleCallbacks[id] = callback;

			for (const queued of queuedVideoSamples[id] ?? []) {
				await callback(queued);
			}

			queuedVideoSamples[id] = [];
		},
		onAudioSample: async ({
			audioSample,
			trackId,
		}: {
			trackId: number;
			audioSample: MediaParserAudioSample;
		}) => {
			if (controller._internals.signal.aborted) {
				throw new Error('Aborted');
			}

			const callback = audioSampleCallbacks[trackId];

			if (audioSample.data.length > 0) {
				// If we emit samples with data length 0, Chrome will fail
				if (callback) {
					if (seekSignal.getSeek() !== null) {
						Log.trace(
							logLevel,
							'Not emitting sample because seek is processing',
						);
					} else {
						const trackDoneCallback = await callback(audioSample);
						onTrackDoneCallback[trackId] = trackDoneCallback ?? null;
					}
				}
			}

			if (needsToIterateOverSamples({emittedFields, fields})) {
				samplesObserved.addAudioSample(audioSample);
			}
		},
		onVideoSample: async ({
			trackId,
			videoSample,
		}: {
			trackId: number;
			videoSample: MediaParserVideoSample;
		}) => {
			if (controller._internals.signal.aborted) {
				throw new Error('Aborted');
			}

			if (videoSample.data.length > 0) {
				const callback = videoSampleCallbacks[trackId];
				// If we emit samples with data 0, Chrome will fail
				if (callback) {
					if (seekSignal.getSeek() !== null) {
						Log.trace(
							logLevel,
							'Not emitting sample because seek is processing',
						);
					} else {
						const trackDoneCallback = await callback(videoSample);
						onTrackDoneCallback[trackId] = trackDoneCallback ?? null;
					}
				}
			}

			if (videoSample.type === 'key') {
				keyframes.addKeyframe({
					trackId,
					decodingTimeInSeconds:
						videoSample.decodingTimestamp / WEBCODECS_TIMESCALE,
					positionInBytes: videoSample.offset,
					presentationTimeInSeconds:
						videoSample.timestamp / WEBCODECS_TIMESCALE,
					sizeInBytes: videoSample.data.length,
				});
			}

			if (
				needsToIterateOverSamples({
					fields,
					emittedFields,
				})
			) {
				samplesObserved.addVideoSample(videoSample);
			}
		},
		canSkipTracksState,
		registerAudioSampleCallback: async (
			id: number,
			callback: MediaParserOnAudioSample | null,
		) => {
			if (callback === null) {
				delete audioSampleCallbacks[id];
				return;
			}

			audioSampleCallbacks[id] = callback;
			for (const queued of queuedAudioSamples[id] ?? []) {
				await callback(queued);
			}

			queuedAudioSamples[id] = [];
		},
		tracks: tracksState,
		audioSampleCallbacks,
		videoSampleCallbacks,
		hasAudioTrackHandlers,
		hasVideoTrackHandlers,
		callTracksDoneCallback: async () => {
			for (const callback of Object.values(onTrackDoneCallback)) {
				if (callback) {
					await callback();
				}
			}
		},
	};
};

export type CallbacksState = ReturnType<typeof callbacksState>;
