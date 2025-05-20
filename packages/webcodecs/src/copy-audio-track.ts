import type {
	MediaParserAudioTrack,
	MediaParserLogLevel,
	MediaParserOnAudioSample,
} from '@remotion/media-parser';
import type {MediaFn} from './create/media-fn';
import {Log} from './log';
import type {ConvertMediaProgressFn} from './throttled-state-update';

export const copyAudioTrack = async ({
	state,
	track,
	logLevel,
	onMediaStateUpdate,
}: {
	state: MediaFn;
	track: MediaParserAudioTrack;
	logLevel: MediaParserLogLevel;
	onMediaStateUpdate: ConvertMediaProgressFn | null;
}): Promise<MediaParserOnAudioSample> => {
	const addedTrack = await state.addTrack({
		type: 'audio',
		codec: track.codecEnum,
		numberOfChannels: track.numberOfChannels,
		sampleRate: track.sampleRate,
		codecPrivate: track.codecData?.data ?? null,
		timescale: track.originalTimescale,
	});
	Log.verbose(
		logLevel,
		`Copying audio track ${track.trackId} as track ${addedTrack.trackNumber}. Timescale = ${track.originalTimescale}, codec = ${track.codecEnum} (${track.codec}) `,
	);

	return async (audioSample) => {
		await state.addSample({
			chunk: audioSample,
			trackNumber: addedTrack.trackNumber,
			isVideo: false,
			codecPrivate: track.codecData?.data ?? null,
		});
		onMediaStateUpdate?.((prevState) => {
			return {
				...prevState,
				encodedAudioFrames: prevState.encodedAudioFrames + 1,
			};
		});
	};
};
