import type {} from './boxes/iso-base-media/stsd/samples';
import type {Av1BitstreamHeaderSegment} from './boxes/webm/bitstream/av1/header-segment';
import type {OnTrackEntrySegment} from './boxes/webm/segments';
import type {CodecSegment} from './boxes/webm/segments/track-entry';
import {getTrackCodec} from './boxes/webm/traversal';
import {getTrackId} from './traversal';
import type {
	AudioSample,
	OnAudioSample,
	OnVideoSample,
	VideoSample,
} from './webcodec-sample-types';

export const makeParserState = ({
	hasAudioCallbacks,
	hasVideoCallbacks,
}: {
	hasAudioCallbacks: boolean;
	hasVideoCallbacks: boolean;
}) => {
	const trackEntries: Record<number, CodecSegment> = {};
	const onTrackEntrySegment: OnTrackEntrySegment = (trackEntry) => {
		const codec = getTrackCodec(trackEntry);
		if (!codec) {
			throw new Error('Expected codec');
		}

		const trackId = getTrackId(trackEntry);
		if (!trackId) {
			throw new Error('Expected track id');
		}

		trackEntries[trackId] = codec;
	};

	let clusterTimestamp: number | null = null;

	const emittedCodecIds: number[] = [];

	const videoSampleCallbacks: Record<number, OnVideoSample> = {};
	const audioSampleCallbacks: Record<number, OnAudioSample> = {};

	const queuedAudioSamples: Record<number, AudioSample[]> = {};
	const queuedVideoSamples: Record<number, VideoSample[]> = {};

	const declinedTrackNumbers: number[] = [];

	let isFirstAv1FrameRead = false;

	let av1BitstreamHeaderSegment: {
		segment: Av1BitstreamHeaderSegment;
		header: Uint8Array;
	} | null = null;

	return {
		onTrackEntrySegment,
		isEmitted: (id: number) => emittedCodecIds.includes(id),
		addEmittedCodecId: (id: number) => {
			emittedCodecIds.push(id);
		},
		getTrackInfoByNumber: (id: number) => trackEntries[id],
		registerVideoSampleCallback: async (
			id: number,
			callback: OnVideoSample | null,
		) => {
			if (callback === null) {
				delete videoSampleCallbacks[id];
				declinedTrackNumbers.push(id);
				return;
			}

			videoSampleCallbacks[id] = callback;

			for (const queued of queuedVideoSamples[id] ?? []) {
				await callback(queued);
			}

			queuedVideoSamples[id] = [];
		},
		registerAudioSampleCallback: async (
			id: number,
			callback: OnAudioSample | null,
		) => {
			if (callback === null) {
				delete audioSampleCallbacks[id];
				declinedTrackNumbers.push(id);
				return;
			}

			audioSampleCallbacks[id] = callback;
			for (const queued of queuedAudioSamples[id] ?? []) {
				await callback(queued);
			}

			queuedAudioSamples[id] = [];
		},
		onAudioSample: async (trackId: number, audioSample: AudioSample) => {
			const callback = audioSampleCallbacks[trackId];
			if (callback) {
				await callback(audioSample);
			} else {
				if (declinedTrackNumbers.includes(trackId)) {
					return;
				}

				if (!hasAudioCallbacks) {
					return;
				}

				queuedAudioSamples[trackId] ??= [];
				queuedAudioSamples[trackId].push(audioSample);
			}
		},
		onVideoSample: async (trackId: number, videoSample: VideoSample) => {
			const callback = videoSampleCallbacks[trackId];
			if (callback) {
				await callback(videoSample);
			} else {
				if (declinedTrackNumbers.includes(trackId)) {
					return;
				}

				if (!hasVideoCallbacks) {
					return;
				}

				queuedVideoSamples[trackId] ??= [];
				queuedVideoSamples[trackId].push(videoSample);
			}
		},
		registerClusterTimestamp: (timestamp: number) => {
			clusterTimestamp = timestamp;
		},
		getClusterTimestamp: () => {
			return clusterTimestamp;
		},
		setAv1BitstreamHeaderSegment: (
			segment: Av1BitstreamHeaderSegment,
			header: Uint8Array,
		) => {
			av1BitstreamHeaderSegment = {
				segment,
				header,
			};
		},
		getAv1BitstreamHeaderSegment: () => av1BitstreamHeaderSegment,
		setIsFirstAv1FrameRead: () => {
			isFirstAv1FrameRead = true;
		},
		getIsFirstAv1FrameRead: () => isFirstAv1FrameRead,
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
