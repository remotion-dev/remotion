import type {Options, ParseMediaFields} from '../options';
import type {
	AudioOrVideoSample,
	OnAudioSample,
	OnVideoSample,
} from '../webcodec-sample-types';
import {makeCanSkipTracksState} from './can-skip-tracks';
import {makeTracksSectionState} from './has-tracks-section';

export const sampleCallback = ({
	signal,
	hasAudioTrackHandlers,
	hasVideoTrackHandlers,
	fields,
}: {
	signal: AbortSignal | undefined;
	hasAudioTrackHandlers: boolean;
	hasVideoTrackHandlers: boolean;
	fields: Options<ParseMediaFields>;
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
		},
		maySkipVideoData: () => {
			return (
				tracksState.hasAllTracks() &&
				Object.values(videoSampleCallbacks).length === 0 &&
				Object.values(audioSampleCallbacks).length === 0
			);
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
	};
};
