import type {OnTrackEntrySegment} from './boxes/webm/segments';
import type {TrackInfo} from './boxes/webm/segments/track-entry';
import {getTrackCodec, getTrackTimestampScale} from './boxes/webm/traversal';
import {getTrackId} from './traversal';
import type {
	AudioSample,
	OnAudioSample,
	OnVideoSample,
	VideoSample,
} from './webcodec-sample-types';

export type InternalStats = {};

export const makeParserState = ({
	hasAudioCallbacks,
	hasVideoCallbacks,
	signal,
}: {
	hasAudioCallbacks: boolean;
	hasVideoCallbacks: boolean;
	signal: AbortSignal | undefined;
}) => {
	const trackEntries: Record<number, TrackInfo> = {};

	const onTrackEntrySegment: OnTrackEntrySegment = (trackEntry) => {
		const trackId = getTrackId(trackEntry);
		if (!trackId) {
			throw new Error('Expected track id');
		}

		if (trackEntries[trackId]) {
			return;
		}

		const codec = getTrackCodec(trackEntry);
		if (!codec) {
			throw new Error('Expected codec');
		}

		const trackTimescale = getTrackTimestampScale(trackEntry);

		trackEntries[trackId] = {
			codec: codec.value,
			trackTimescale,
		};
	};

	const videoSampleCallbacks: Record<number, OnVideoSample> = {};
	const audioSampleCallbacks: Record<number, OnAudioSample> = {};

	const queuedAudioSamples: Record<number, AudioSample[]> = {};
	const queuedVideoSamples: Record<number, VideoSample[]> = {};

	const declinedTrackNumbers: number[] = [];

	let timescale: number | null = null;

	const getTimescale = () => {
		// https://www.matroska.org/technical/notes.html
		// When using the default value of TimestampScale of “1,000,000”, one Segment Tick represents one millisecond.
		if (timescale === null) {
			return 1_000_000;
		}

		return timescale;
	};

	const setTimescale = (newTimescale: number) => {
		timescale = newTimescale;
	};

	const timestampMap = new Map<number, number>();

	const setTimestampOffset = (byteOffset: number, timestamp: number) => {
		timestampMap.set(byteOffset, timestamp);
	};

	const getTimestampOffsetForByteOffset = (byteOffset: number) => {
		const entries = Array.from(timestampMap.entries());
		const sortedByByteOffset = entries
			.sort((a, b) => {
				return a[0] - b[0];
			})
			.reverse();
		for (const [offset, timestamp] of sortedByByteOffset) {
			if (offset >= byteOffset) {
				continue;
			}

			return timestamp;
		}

		return timestampMap.get(byteOffset);
	};

	return {
		onTrackEntrySegment,
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
		setTimestampOffset,
		getTimestampOffsetForByteOffset,
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
			if (signal?.aborted) {
				throw new Error('Aborted');
			}

			const callback = audioSampleCallbacks[trackId];
			if (callback) {
				await callback(audioSample);
			} else {
				if (declinedTrackNumbers.includes(trackId)) {
					return;
				}

				if (!hasAudioCallbacks) {
					throw new Error('No audio callbacks registered');
				}
			}
		},
		onVideoSample: async (trackId: number, videoSample: VideoSample) => {
			if (signal?.aborted) {
				throw new Error('Aborted');
			}

			const callback = videoSampleCallbacks[trackId];
			if (callback) {
				await callback(videoSample);
			} else {
				if (declinedTrackNumbers.includes(trackId)) {
					return;
				}

				if (!hasVideoCallbacks) {
					throw new Error('No video callbacks registered');
				}
			}
		},
		getInternalStats: () => ({}),
		getTimescale,
		setTimescale,
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
