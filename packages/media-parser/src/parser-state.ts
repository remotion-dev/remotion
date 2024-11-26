import type {AvcPPs, AvcProfileInfo} from './boxes/avc/parse-avc';
import type {OnTrackEntrySegment} from './boxes/webm/segments';
import type {TrackInfo} from './boxes/webm/segments/track-entry';
import {
	getTrackCodec,
	getTrackId,
	getTrackTimestampScale,
} from './boxes/webm/traversal';
import type {
	AudioOrVideoSample,
	OnAudioSample,
	OnVideoSample,
} from './webcodec-sample-types';

export type InternalStats = {};

export type SpsAndPps = {
	sps: AvcProfileInfo;
	pps: AvcPPs;
};

type AvcProfileInfoCallback = (profile: SpsAndPps) => Promise<void>;

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
			trackTimescale: trackTimescale?.value ?? null,
		};
	};

	const videoSampleCallbacks: Record<number, OnVideoSample> = {};
	const audioSampleCallbacks: Record<number, OnAudioSample> = {};

	const queuedAudioSamples: Record<number, AudioOrVideoSample[]> = {};
	const queuedVideoSamples: Record<number, AudioOrVideoSample[]> = {};

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

	const samplesForTrack: Record<number, number> = {};

	const profileCallbacks: AvcProfileInfoCallback[] = [];

	const registerOnAvcProfileCallback = (callback: AvcProfileInfoCallback) => {
		profileCallbacks.push(callback);
	};

	let avcProfile: SpsAndPps | null = null;

	const onProfile = async (profile: SpsAndPps) => {
		avcProfile = profile;
		for (const callback of profileCallbacks) {
			await callback(profile);
		}

		profileCallbacks.length = 0;
	};

	return {
		onTrackEntrySegment,
		onProfile,
		registerOnAvcProfileCallback,
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
			} else {
				if (declinedTrackNumbers.includes(trackId)) {
					return;
				}

				if (!hasAudioCallbacks) {
					throw new Error('No audio callbacks registered');
				}
			}
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
		getSamplesForTrack: (trackId: number) => {
			return samplesForTrack[trackId] ?? 0;
		},
		getAvcProfile: () => {
			return avcProfile;
		},
	};
};

export type ParserState = ReturnType<typeof makeParserState>;
