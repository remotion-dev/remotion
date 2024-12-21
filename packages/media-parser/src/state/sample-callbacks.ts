import {needsToIterateOverSamples} from '../may-skip-video-data/need-samples-for-fields';
import type {AllOptions, Options, ParseMediaFields} from '../options';
import type {
	AudioOrVideoSample,
	OnAudioSample,
	OnVideoSample,
} from '../webcodec-sample-types';
import {makeCanSkipTracksState} from './can-skip-tracks';
import {makeTracksSectionState} from './has-tracks-section';
import {type KeyframesState} from './keyframes';
import type {SlowDurationAndFpsState} from './slow-duration-fps';
import type {StructureState} from './structure';

export const sampleCallback = ({
	signal,
	hasAudioTrackHandlers,
	hasVideoTrackHandlers,
	fields,
	structureState,
	keyframes,
	emittedFields,
	slowDurationAndFpsState,
}: {
	signal: AbortSignal | undefined;
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	fields: Options<ParseMediaFields>;
	structureState: StructureState;
	keyframes: KeyframesState;
	emittedFields: AllOptions<ParseMediaFields>;
	slowDurationAndFpsState: SlowDurationAndFpsState;
}) => {
	const videoSampleCallbacks: Record<number, OnVideoSample> = {};
	const audioSampleCallbacks: Record<number, OnAudioSample> = {};

	const queuedAudioSamples: Record<number, AudioOrVideoSample[]> = {};
	const queuedVideoSamples: Record<number, AudioOrVideoSample[]> = {};

	const canSkipTracksState = makeCanSkipTracksState({
		hasAudioTrackHandlers,
		fields,
		hasVideoTrackHandlers,
	});

	const tracksState = makeTracksSectionState(canSkipTracksState);

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
			if (signal?.aborted) {
				throw new Error('Aborted');
			}

			if (typeof samplesForTrack[trackId] === 'undefined') {
				samplesForTrack[trackId] = 0;
			}

			samplesForTrack[trackId]++;

			const callback = audioSampleCallbacks[trackId];
			if (callback) {
				await callback(audioSample);
			}
		},
		getSamplesForTrack: (trackId: number) => {
			return samplesForTrack[trackId] ?? 0;
		},
		onVideoSample: async (trackId: number, videoSample: AudioOrVideoSample) => {
			if (signal?.aborted) {
				throw new Error('Aborted');
			}

			if (typeof samplesForTrack[trackId] === 'undefined') {
				samplesForTrack[trackId] = 0;
			}

			samplesForTrack[trackId]++;

			const callback = videoSampleCallbacks[trackId];
			if (callback) {
				await callback(videoSample);
			}

			if (
				needsToIterateOverSamples({
					fields,
					structure: structureState.getStructure(),
					emittedFields,
				})
			) {
				if (fields.keyframes && videoSample.type === 'key') {
					keyframes.addKeyframe({
						trackId,
						decodingTimeInSeconds: videoSample.dts / videoSample.timescale,
						positionInBytes: videoSample.offset,
						presentationTimeInSeconds: videoSample.cts / videoSample.timescale,
						sizeInBytes: videoSample.data.length,
					});
				}

				if (fields.slowDurationInSeconds || fields.slowFps) {
					slowDurationAndFpsState.addSample(videoSample);
				}
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
	};
};
