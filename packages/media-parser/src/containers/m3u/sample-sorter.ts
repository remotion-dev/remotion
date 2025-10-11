import type {MediaParserLogLevel} from '../../log';
import {Log} from '../../log';
import type {
	MediaParserAudioSample,
	MediaParserOnAudioSample,
	MediaParserOnVideoSample,
	MediaParserVideoSample,
} from '../../webcodec-sample-types';

export const sampleSorter = ({
	logLevel,
	getAllChunksProcessedForPlaylist,
}: {
	logLevel: MediaParserLogLevel;
	getAllChunksProcessedForPlaylist: (src: string) => boolean;
}) => {
	const streamsWithTracks: string[] = [];
	const audioCallbacks: Record<string, MediaParserOnAudioSample> = {};
	const videoCallbacks: Record<string, MediaParserOnVideoSample> = {};
	let latestSample: Record<string, number> = {};

	return {
		clearSamples: () => {
			latestSample = {};
		},
		addToStreamWithTrack: (src: string) => {
			streamsWithTracks.push(src);
		},
		addVideoStreamToConsider: (
			src: string,
			callback: MediaParserOnVideoSample,
		) => {
			videoCallbacks[src] = callback;
		},
		addAudioStreamToConsider: (
			src: string,
			callback: MediaParserOnAudioSample,
		) => {
			audioCallbacks[src] = callback;
		},
		hasAudioStreamToConsider: (src: string) => {
			return Boolean(audioCallbacks[src]);
		},
		hasVideoStreamToConsider: (src: string) => {
			return Boolean(videoCallbacks[src]);
		},
		addAudioSample: async (src: string, sample: MediaParserAudioSample) => {
			const callback = audioCallbacks[src];
			if (!callback) {
				throw new Error('No callback found for audio sample');
			}

			latestSample[src] = sample.decodingTimestamp;
			await callback(sample);
		},
		addVideoSample: async (src: string, sample: MediaParserVideoSample) => {
			const callback = videoCallbacks[src];
			if (!callback) {
				throw new Error('No callback found for video sample.');
			}

			latestSample[src] = sample.decodingTimestamp;
			await callback(sample);
		},
		getNextStreamToRun: (streams: string[]) => {
			for (const stream of streams) {
				if (getAllChunksProcessedForPlaylist(stream)) {
					continue;
				}

				// If a stream does not have a track yet, work on that
				if (!streamsWithTracks.includes(stream)) {
					Log.trace(
						logLevel,
						`Did not yet detect track of ${stream}, working on that`,
					);
					return stream;
				}
			}

			let smallestDts = Infinity;
			for (const stream of streams) {
				if (getAllChunksProcessedForPlaylist(stream)) {
					continue;
				}

				if ((latestSample[stream] ?? 0) < smallestDts) {
					smallestDts = latestSample[stream] ?? 0;
				}
			}

			for (const stream of streams) {
				if (getAllChunksProcessedForPlaylist(stream)) {
					continue;
				}

				if ((latestSample[stream] ?? 0) === smallestDts) {
					Log.trace(
						logLevel,
						`Working on ${stream} because it has the smallest DTS`,
					);
					return stream;
				}
			}

			throw new Error('should be done with parsing now');
		},
	};
};
