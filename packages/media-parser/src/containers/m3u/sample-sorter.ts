import type {LogLevel} from '../../log';
import {Log} from '../../log';
import type {
	AudioOrVideoSample,
	OnAudioSample,
	OnVideoSample,
} from '../../webcodec-sample-types';

export const sampleSorter = ({
	logLevel,
	getAllChunksProcessedForPlaylist,
}: {
	logLevel: LogLevel;
	getAllChunksProcessedForPlaylist: (src: string) => boolean;
}) => {
	const streamsWithTracks: string[] = [];
	const audioCallbacks: Record<string, OnAudioSample> = {};
	const videoCallbacks: Record<string, OnVideoSample> = {};
	const latestSample: Record<string, number> = {};

	return {
		addToStreamWithTrack: (src: string) => {
			streamsWithTracks.push(src);
		},
		addVideoStreamToConsider: (src: string, callback: OnVideoSample) => {
			videoCallbacks[src] = callback;
		},
		addAudioStreamToConsider: (src: string, callback: OnAudioSample) => {
			audioCallbacks[src] = callback;
		},
		addAudioSample: async (src: string, sample: AudioOrVideoSample) => {
			const callback = audioCallbacks[src];
			if (!callback) {
				throw new Error('No callback found for audio sample');
			}

			latestSample[src] = sample.dts;
			await callback(sample);
		},
		addVideoSample: async (src: string, sample: AudioOrVideoSample) => {
			const callback = videoCallbacks[src];
			if (!callback) {
				throw new Error('No callback found for audio sample');
			}

			latestSample[src] = sample.dts;
			await callback(sample);
		},
		getNextStreamToRun: (streams: string[]) => {
			for (const stream of streams) {
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
