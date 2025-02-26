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
	const callbacks: Record<string, OnVideoSample | OnAudioSample> = {};
	const latestSample: Record<string, number> = {};

	return {
		addToStreamWithTrack: (src: string) => {
			streamsWithTracks.push(src);
		},
		addStreamToConsider: (
			src: string,
			callback: OnVideoSample | OnAudioSample,
		) => {
			callbacks[src] = callback;
		},
		addSample: async (src: string, sample: AudioOrVideoSample) => {
			const callback = callbacks[src];
			if (!callback) {
				throw new Error('No callback found for video sample');
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

				if (latestSample[stream] < smallestDts) {
					smallestDts = latestSample[stream];
				}
			}

			for (const stream of streams) {
				if (latestSample[stream] === smallestDts) {
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
