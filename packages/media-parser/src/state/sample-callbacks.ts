import type {MediaParserController} from '../controller/media-parser-controller';
import type {SeekSignal} from '../controller/seek-signal';
import type {AllOptions, Options, ParseMediaFields} from '../fields';
import type {LogLevel} from '../log';
import {Log} from '../log';
import type {ParseMediaSrc} from '../options';
import type {
	AudioOrVideoSample,
	OnAudioSample,
	OnVideoSample,
} from '../webcodec-sample-types';
import {makeCanSkipTracksState} from './can-skip-tracks';
import {makeTracksSectionState} from './has-tracks-section';
import {type KeyframesState} from './keyframes';
import {needsToIterateOverSamples} from './need-samples-for-fields';
import type {SlowDurationAndFpsState} from './slow-duration-fps';
import type {StructureState} from './structure';

export const sampleCallback = ({
	controller,
	hasAudioTrackHandlers,
	hasVideoTrackHandlers,
	fields,
	keyframes,
	emittedFields,
	slowDurationAndFpsState,
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
	slowDurationAndFpsState: SlowDurationAndFpsState;
	structure: StructureState;
	src: ParseMediaSrc;
	seekSignal: SeekSignal;
	logLevel: LogLevel;
}) => {
	const videoSampleCallbacks: Record<number, OnVideoSample> = {};
	const audioSampleCallbacks: Record<number, OnAudioSample> = {};

	const queuedAudioSamples: Record<number, AudioOrVideoSample[]> = {};
	const queuedVideoSamples: Record<number, AudioOrVideoSample[]> = {};

	const canSkipTracksState = makeCanSkipTracksState({
		hasAudioTrackHandlers,
		fields,
		hasVideoTrackHandlers,
		structure,
	});

	const tracksState = makeTracksSectionState(canSkipTracksState, src);

	const samplesForTrack: Record<number, number> = {};

	return {
		registerVideoSampleCallback: async (
			id: number,
			callback: OnVideoSample | null,
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
		onAudioSample: async (trackId: number, audioSample: AudioOrVideoSample) => {
			if (controller._internals.signal.aborted) {
				throw new Error('Aborted');
			}

			if (typeof samplesForTrack[trackId] === 'undefined') {
				samplesForTrack[trackId] = 0;
			}

			const callback = audioSampleCallbacks[trackId];

			if (audioSample.data.length > 0) {
				samplesForTrack[trackId]++;
				// If we emit samples with data length 0, Chrome will fail
				if (callback) {
					if (seekSignal.getSeek()) {
						Log.trace(
							logLevel,
							'Not emitting sample because seek is processing',
						);
					} else {
						await callback(audioSample);
					}
				}
			}

			if (needsToIterateOverSamples({emittedFields, fields})) {
				slowDurationAndFpsState.addAudioSample(audioSample);
			}
		},
		getSamplesForTrack: (trackId: number) => {
			return samplesForTrack[trackId] ?? 0;
		},
		onVideoSample: async (trackId: number, videoSample: AudioOrVideoSample) => {
			if (controller._internals.signal.aborted) {
				throw new Error('Aborted');
			}

			if (typeof samplesForTrack[trackId] === 'undefined') {
				samplesForTrack[trackId] = 0;
			}

			if (videoSample.data.length > 0) {
				samplesForTrack[trackId]++;
				const callback = videoSampleCallbacks[trackId];
				// If we emit samples with data 0, Chrome will fail
				if (callback) {
					if (seekSignal.getSeek()) {
						Log.trace(
							logLevel,
							'Not emitting sample because seek is processing',
						);
					} else {
						await callback(videoSample);
					}
				}
			}

			if (
				needsToIterateOverSamples({
					fields,
					emittedFields,
				})
			) {
				if (fields.slowKeyframes && videoSample.type === 'key') {
					keyframes.addKeyframe({
						trackId,
						decodingTimeInSeconds: videoSample.dts / videoSample.timescale,
						positionInBytes: videoSample.offset,
						presentationTimeInSeconds: videoSample.cts / videoSample.timescale,
						sizeInBytes: videoSample.data.length,
					});
				}

				slowDurationAndFpsState.addVideoSample(videoSample);
			}
		},
		canSkipTracksState,
		registerAudioSampleCallback: async (
			id: number,
			callback: OnAudioSample | null,
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
	};
};

export type SampleCallbacks = ReturnType<typeof sampleCallback>;
